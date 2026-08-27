alter table public.person_media
  add column if not exists moderation_status text not null default 'visible'
  check (moderation_status in ('visible','flagged','hidden'));

create table if not exists public.media_flags (
    id              uuid primary key default gen_random_uuid(),
    media_id        uuid not null references public.person_media(id) on delete cascade,
    family_id       uuid not null references public.families(id) on delete cascade,
    flagged_by      uuid references public.users(id),
    reason          text not null,
    status          text not null default 'pending' check (status in ('pending','resolved_hidden','resolved_dismissed')),
    resolved_by     uuid references public.users(id),
    resolved_at     timestamptz,
    resolution_note text,
    created_at      timestamptz not null default now()
);

create index if not exists idx_media_flags_media on public.media_flags(media_id);
create index if not exists idx_media_flags_status on public.media_flags(status);

alter table public.media_flags enable row level security;