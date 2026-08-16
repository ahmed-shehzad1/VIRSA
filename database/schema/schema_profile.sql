-- Person-level privacy control
alter table public.people
  add column if not exists profile_visibility text not null default 'all_members'
  check (profile_visibility in ('all_members', 'admins_only'));

create table if not exists public.person_media (
    id           uuid primary key default gen_random_uuid(),
    person_id    uuid not null references public.people(id) on delete cascade,
    family_id    uuid not null references public.families(id) on delete cascade,
    uploader_id  uuid references public.users(id),
    storage_path text not null,
    public_url   text not null,
    media_type   text not null default 'photo' check (media_type in ('photo', 'document')),
    caption      text,
    taken_date   date,
    created_at   timestamptz not null default now()
);

create index if not exists idx_person_media_person on public.person_media(person_id);

create table if not exists public.person_memories (
    id           uuid primary key default gen_random_uuid(),
    person_id    uuid not null references public.people(id) on delete cascade,
    family_id    uuid not null references public.families(id) on delete cascade,
    author_id    uuid references public.users(id),
    title        text not null,
    content      text not null,
    memory_date  date,
    visibility   text not null default 'all_members' check (visibility in ('all_members', 'admins_only')),
    created_at   timestamptz not null default now(),
    updated_at   timestamptz not null default now()
);

create index if not exists idx_person_memories_person on public.person_memories(person_id);

drop trigger if exists trg_person_memories_updated_at on public.person_memories;
create trigger trg_person_memories_updated_at
before update on public.person_memories
for each row execute function public.set_updated_at();

alter table public.person_media enable row level security;
alter table public.person_memories enable row level security;