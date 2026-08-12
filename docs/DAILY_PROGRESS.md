### Backend State here 

Day 1 — Backend Auth & User Module (1.1–1.14)
- Implemented full custom auth: registration, login, JWT access + rotating
  refresh tokens (httpOnly cookie), logout/logout-all, auth middleware.
- Added password security: bcrypt hashing, strength validation, account
  lockout after 5 failed attempts.
- Built email verification and forgot/reset password flows (token-based,
  expiring, hashed in DB).
- Added profile management: get current user, update profile, delete
  account (password-confirmed), avatar upload/delete via Supabase Storage.
- Centralized error handling with consistent error codes + rate limiting
  on sensitive endpoints (login, register, email actions).
- Server verified running locally; Supabase schema + storage bucket set up.
- Next: connect frontend auth pages to these endpoints.

Frontend pages needed to match this (from your original table):

Page	Talks to
Registration page	POST /auth/register
Login page	POST /auth/login
Forgot-password page	POST /auth/forgot-password
Reset-password page (from email link, reads ?token=)	POST /auth/reset-password
Email verification page (from email link, reads ?token=)	POST /auth/verify-email or GET /auth/verify-email?token=
Account settings page (profile edit)	GET /users/me, PATCH /users/me
Profile/avatar upload UI (can live inside settings page)	POST /users/me/avatar, DELETE /users/me/avatar
Delete-account UI (can live inside settings page, with a password-confirm modal)	DELETE /users/me
Logout button/action (no dedicated page)	POST /auth/logout
Protected-route wrapper (not a page — a component/HOC that checks login state and redirects)



### Front End State here 