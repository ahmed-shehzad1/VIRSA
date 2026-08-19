-- Extend Milestone 6's person_memories table for full Milestone 8 scope
alter table public.person_memories
  alter column person_id drop not null,                         -- allow family-level memories not tied to one person
  add column if not exists tagged_person_ids uuid[] not null default '{}', -- other people mentioned in the memory
  add column if not exists moderation_status text not null default 'visible'
    check (moderation_status in ('visible', 'flagged', 'hidden')),
  add column if not exists title_search text; -- reserved for future full-text search, unused for now

create table if not exists public.memory_flags (
    id              uuid primary key default gen_random_uuid(),
    memory_id       uuid not null references public.person_memories(id) on delete cascade,
    family_id       uuid not null references public.families(id) on delete cascade,
    flagged_by      uuid references public.users(id),
    reason          text not null,
    status          text not null default 'pending' check (status in ('pending', 'resolved_hidden', 'resolved_dismissed')),
    resolved_by     uuid references public.users(id),
    resolved_at     timestamptz,
    resolution_note text,
    created_at      timestamptz not null default now()
);

create index if not exists idx_memory_flags_memory on public.memory_flags(memory_id);
create index if not exists idx_memory_flags_status on public.memory_flags(status);
create index if not exists idx_person_memories_family on public.person_memories(family_id);

alter table public.memory_flags enable row level security;