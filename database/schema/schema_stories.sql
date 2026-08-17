alter table public.people
  add column if not exists biography_status text not null default 'published'
  check (biography_status in ('published', 'pending_review', 'flagged', 'hidden')),
  add column if not exists biography_author_id uuid references public.users(id),
  add column if not exists biography_updated_at timestamptz;

create table if not exists public.person_biography_versions (
    id          uuid primary key default gen_random_uuid(),
    person_id   uuid not null references public.people(id) on delete cascade,
    family_id   uuid not null references public.families(id) on delete cascade,
    content     text not null,
    edited_by   uuid references public.users(id),
    created_at  timestamptz not null default now()
);

create index if not exists idx_bio_versions_person on public.person_biography_versions(person_id);

create table if not exists public.person_biography_flags (
    id            uuid primary key default gen_random_uuid(),
    person_id     uuid not null references public.people(id) on delete cascade,
    family_id     uuid not null references public.families(id) on delete cascade,
    flagged_by    uuid references public.users(id),
    reason        text not null,
    status        text not null default 'pending' check (status in ('pending', 'resolved_hidden', 'resolved_dismissed')),
    resolved_by   uuid references public.users(id),
    resolved_at   timestamptz,
    resolution_note text,
    created_at    timestamptz not null default now()
);

create index if not exists idx_bio_flags_person on public.person_biography_flags(person_id);
create index if not exists idx_bio_flags_status on public.person_biography_flags(status);

alter table public.person_biography_versions enable row level security;
alter table public.person_biography_flags enable row level security;