create table if not exists public.change_requests (
    id                 uuid primary key default gen_random_uuid(),
    family_id          uuid not null references public.families(id) on delete cascade,
    person_id          uuid not null references public.people(id) on delete cascade,
    field_name         text not null,
    current_value      text,
    proposed_value     text,
    reason             text,
    status             text not null default 'pending' check (status in ('pending','approved','rejected')),
    conflict_detected  boolean not null default false,
    submitted_by       uuid references public.users(id),
    reviewed_by        uuid references public.users(id),
    reviewed_at        timestamptz,
    review_note        text,
    created_at         timestamptz not null default now()
);

create index if not exists idx_change_requests_family on public.change_requests(family_id);
create index if not exists idx_change_requests_person on public.change_requests(person_id);
create index if not exists idx_change_requests_status on public.change_requests(status);

alter table public.change_requests enable row level security;