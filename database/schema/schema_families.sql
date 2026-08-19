create table if not exists public.families (
    id                    uuid primary key default gen_random_uuid(),
    name                  text not null,
    description           text,
    owner_id              uuid not null references public.users(id) on delete restrict,
    is_private            boolean not null default true,
    allow_member_invites  boolean not null default false,
    is_archived           boolean not null default false,
    archived_at           timestamptz,
    created_at            timestamptz not null default now(),
    updated_at            timestamptz not null default now()
);

create index if not exists idx_families_owner on public.families(owner_id);

create table if not exists public.family_members (
    id          uuid primary key default gen_random_uuid(),
    family_id   uuid not null references public.families(id) on delete cascade,
    user_id     uuid not null references public.users(id) on delete cascade,
    role        text not null check (role in ('owner','admin','member','viewer')),
    invited_by  uuid references public.users(id),
    joined_at   timestamptz not null default now(),
    unique(family_id, user_id)
);

create index if not exists idx_family_members_family on public.family_members(family_id);
create index if not exists idx_family_members_user on public.family_members(user_id);

create table if not exists public.family_invitations (
    id           uuid primary key default gen_random_uuid(),
    family_id    uuid not null references public.families(id) on delete cascade,
    email        text not null,
    role         text not null check (role in ('admin','member','viewer')),
    token_hash   text not null,
    invited_by   uuid not null references public.users(id),
    status       text not null default 'pending' check (status in ('pending','accepted','rejected','revoked','expired')),
    expires_at   timestamptz not null,
    responded_at timestamptz,
    created_at   timestamptz not null default now()
);

create index if not exists idx_family_invitations_family on public.family_invitations(family_id);
create index if not exists idx_family_invitations_email on public.family_invitations(lower(email));
create index if not exists idx_family_invitations_hash on public.family_invitations(token_hash);

drop trigger if exists trg_families_updated_at on public.families;
create trigger trg_families_updated_at
before update on public.families
for each row execute function public.set_updated_at();

alter table public.families enable row level security;
alter table public.family_members enable row level security;
alter table public.family_invitations enable row level security;