-- ============================================================
-- Virsa - Auth & User schema
-- Run this in the Supabase SQL editor (or via `supabase db push`)
-- ============================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------
-- users
-- ---------------------------------------------------------------
create table if not exists public.users (
    id                  uuid primary key default gen_random_uuid(),
    email               text unique not null,
    password_hash       text not null,
    full_name           text,
    avatar_url          text,
    avatar_path         text,                       -- storage object path, needed to delete/replace
    is_email_verified   boolean not null default false,
    is_active           boolean not null default true,
    failed_login_count  integer not null default 0,
    locked_until         timestamptz,
    created_at          timestamptz not null default now(),
    updated_at          timestamptz not null default now()
);

create index if not exists idx_users_email on public.users (lower(email));

-- ---------------------------------------------------------------
-- refresh_tokens  (one row per issued refresh token / session)
-- ---------------------------------------------------------------
create table if not exists public.refresh_tokens (
    id            uuid primary key default gen_random_uuid(),
    user_id       uuid not null references public.users (id) on delete cascade,
    token_hash    text not null,                     -- sha256 of the raw refresh token
    user_agent    text,
    ip_address    text,
    expires_at    timestamptz not null,
    revoked_at    timestamptz,
    created_at    timestamptz not null default now()
);

create index if not exists idx_refresh_tokens_user_id on public.refresh_tokens (user_id);
create index if not exists idx_refresh_tokens_hash on public.refresh_tokens (token_hash);

-- ---------------------------------------------------------------
-- email_verification_tokens
-- ---------------------------------------------------------------
create table if not exists public.email_verification_tokens (
    id           uuid primary key default gen_random_uuid(),
    user_id      uuid not null references public.users (id) on delete cascade,
    token_hash   text not null,
    expires_at   timestamptz not null,
    used_at      timestamptz,
    created_at   timestamptz not null default now()
);

create index if not exists idx_evt_user_id on public.email_verification_tokens (user_id);
create index if not exists idx_evt_hash on public.email_verification_tokens (token_hash);

-- ---------------------------------------------------------------
-- password_reset_tokens
-- ---------------------------------------------------------------
create table if not exists public.password_reset_tokens (
    id           uuid primary key default gen_random_uuid(),
    user_id      uuid not null references public.users (id) on delete cascade,
    token_hash   text not null,
    expires_at   timestamptz not null,
    used_at      timestamptz,
    created_at   timestamptz not null default now()
);

create index if not exists idx_prt_user_id on public.password_reset_tokens (user_id);
create index if not exists idx_prt_hash on public.password_reset_tokens (token_hash);

-- ---------------------------------------------------------------
-- auto-update updated_at on users
-- ---------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_users_updated_at on public.users;
create trigger trg_users_updated_at
before update on public.users
for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------
-- Row Level Security
-- The backend talks to Supabase using the SERVICE ROLE key, which
-- bypasses RLS entirely. RLS is enabled anyway as defense-in-depth
-- in case the anon/public key is ever exposed to these tables.
-- No policies are defined for anon/authenticated -> all access is
-- denied by default except through the service role.
-- ---------------------------------------------------------------
alter table public.users enable row level security;
alter table public.refresh_tokens enable row level security;
alter table public.email_verification_tokens enable row level security;
alter table public.password_reset_tokens enable row level security;
