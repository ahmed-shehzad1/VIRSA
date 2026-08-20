create table if not exists public.timeline_events (
    id           uuid primary key default gen_random_uuid(),
    person_id    uuid not null references public.people(id) on delete cascade,
    family_id    uuid not null references public.families(id) on delete cascade,
    title        text not null,
    description  text,
    category     text not null default 'other'
      check (category in ('birth','education','career','marriage','relocation','achievement','health','death','other')),
    event_date   date not null,
    end_date     date,
    created_by   uuid references public.users(id),
    created_at   timestamptz not null default now(),
    updated_at   timestamptz not null default now()
);

create index if not exists idx_timeline_events_person on public.timeline_events(person_id, event_date);
create index if not exists idx_timeline_events_family on public.timeline_events(family_id);

drop trigger if exists trg_timeline_events_updated_at on public.timeline_events;
create trigger trg_timeline_events_updated_at
before update on public.timeline_events
for each row execute function public.set_updated_at();

alter table public.timeline_events enable row level security;