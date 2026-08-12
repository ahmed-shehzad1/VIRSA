# Virsa Backend

Express + Supabase (Postgres-only, custom auth) backend implementing the
full auth/user module (tasks 1.1 - 1.14).

## Stack decisions

- **Auth:** custom bcrypt + JWT (access token, short-lived) + rotating
  refresh token (httpOnly cookie, hashed in DB). Supabase is used purely
  as Postgres + Storage, accessed via the **service role key** (bypasses
  RLS) — never expose that key to the frontend.
- **Avatars:** Supabase Storage, bucket `avatars` (public read).

## 1. Setup

```bash
cd backend
npm install
cp .env.example .env   # fill in the values below
```

### Supabase project

1. Create a project at supabase.com.
2. **SQL Editor** → run `database/schema/schema.sql`.
3. **Storage** → create a bucket named `avatars` → set it **Public**
   (or configure signed URLs yourself if you want it private).
4. **Project Settings → API** → copy the `Project URL` and the
   `service_role` key (NOT the anon key) into `.env`.

### `.env` values that matter most

| Var | Notes |
|---|---|
| `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` | from Supabase API settings |
| `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` | two different long random strings |
| `CLIENT_URL` | your frontend origin — used for CORS and email links |
| `SMTP_*` | if left blank, emails are just logged to the console (fine for local dev) |

### Run

```bash
npm run dev     # nodemon
npm start        # plain node
```

Health check: `GET /api/health`

## 2. API reference

All responses: `{ success, message, data }`. Errors: `{ success: false, message, code, details? }`.

Auth endpoints are mounted at `/api/auth`, user endpoints at `/api/users`.
Send the access token as `Authorization: Bearer <token>`. The refresh
token travels automatically as an httpOnly cookie (`credentials: 'include'`
on the frontend fetch/axios config).

| # | Method & Path | Auth | Body | Notes |
|---|---|---|---|---|
| 1.1 | `POST /auth/register` | - | `email, password, fullName?` | sends verification email |
| 1.3 | `POST /auth/login` | - | `email, password` | returns `accessToken`, sets refresh cookie |
| 1.4 | `POST /auth/refresh-token` | cookie | - | rotates refresh token, returns new `accessToken` |
| 1.7 | `POST /auth/logout` | cookie | - | revokes current session |
| 1.7 | `POST /auth/logout-all` | Bearer | - | revokes every session |
| 1.6 | `GET /users/me` | Bearer | - | current user profile |
| 1.13 | `PATCH /users/me` | Bearer | `fullName?, email?` | changing email resets verification |
| 1.14 | `POST /users/me/avatar` | Bearer | `multipart/form-data: avatar` | ≤5MB, jpg/png/webp/gif |
| 1.14 | `DELETE /users/me/avatar` | Bearer | - | removes avatar |
| 1.12 | `DELETE /users/me` | Bearer | `password` | permanently deletes account |
| 1.10 | `POST /auth/verify-email` | - | `token` | also works as `GET /auth/verify-email?token=` |
| 1.10 | `POST /auth/resend-verification` | - | `email` | |
| 1.8 | `POST /auth/forgot-password` | - | `email` | always returns 200 (no email enumeration) |
| 1.9 | `POST /auth/reset-password` | - | `token, password` | revokes all sessions |
| 1.11 | `POST /auth/change-password` | Bearer | `currentPassword, newPassword` | keeps current session, revokes others |

## 3. Security notes for whoever builds the frontend

- Store the **access token in memory** (e.g. React state / a store), not
  localStorage — the refresh token is what persists login, via the
  httpOnly cookie the browser handles automatically.
- On a `401` with `code: "TOKEN_EXPIRED"`, call `/auth/refresh-token`
  once, then retry the original request.
- 5 failed logins locks the account for 15 minutes (configurable via
  `MAX_FAILED_LOGIN_ATTEMPTS` / `LOCKOUT_DURATION_MIN`).
