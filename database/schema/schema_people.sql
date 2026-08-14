create table if not exists public.people (
    id                 uuid primary key default gen_random_uuid(),
    family_id          uuid not null references public.families(id) on delete cascade,
    first_name         text not null,
    middle_name        text,
    last_name          text,
    gender             text not null default 'unknown' check (gender in ('male','female','other','unknown')),
    birth_date         date,
    birth_place        text,
    is_living          boolean not null default true,
    death_date         date,
    death_place        text,
    biography          text,
    photo_url          text,
    created_by         uuid references public.users(id),
    claimed_by_user_id uuid references public.users(id),
    is_archived        boolean not null default false,
    archived_at        timestamptz,
    created_at         timestamptz not null default now(),
    updated_at         timestamptz not null default now()
);

create index if not exists idx_people_family on public.people(family_id);
create index if not exists idx_people_name on public.people(family_id, lower(first_name), lower(last_name));
create index if not exists idx_people_claimed_by on public.people(claimed_by_user_id);

drop trigger if exists trg_people_updated_at on public.people;
create trigger trg_people_updated_at
before update on public.people
for each row execute function public.set_updated_at();

create table if not exists public.person_claims (
    id           uuid primary key default gen_random_uuid(),
    person_id    uuid not null references public.people(id) on delete cascade,
    user_id      uuid not null references public.users(id) on delete cascade,
    status       text not null default 'pending' check (status in ('pending','approved','rejected')),
    requested_at timestamptz not null default now(),
    resolved_at  timestamptz,
    resolved_by  uuid references public.users(id)
);

create index if not exists idx_person_claims_person on public.person_claims(person_id);
create index if not exists idx_person_claims_user on public.person_claims(user_id);
create unique index if not exists uniq_pending_claim on public.person_claims(person_id, user_id) where status = 'pending';

alter table public.people enable row level security;
alter table public.person_claims enable row level security;