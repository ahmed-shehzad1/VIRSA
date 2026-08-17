create table if not exists public.relationships (
    id           uuid primary key default gen_random_uuid(),
    family_id    uuid not null references public.families(id) on delete cascade,
    type         text not null check (type in ('parent', 'spouse', 'sibling')),
    person_a_id  uuid not null references public.people(id) on delete cascade,
    person_b_id  uuid not null references public.people(id) on delete cascade,
    status       text check (status in ('married', 'divorced', 'widowed', 'separated')), -- spouse only
    sibling_type text check (sibling_type in ('full', 'half', 'step')),                   -- sibling only
    start_date   date,
    end_date     date,
    created_by   uuid references public.users(id),
    created_at   timestamptz not null default now(),
    constraint chk_not_self_relationship check (person_a_id <> person_b_id)
);

create index if not exists idx_relationships_family on public.relationships(family_id);
create index if not exists idx_relationships_person_a on public.relationships(person_a_id);
create index if not exists idx_relationships_person_b on public.relationships(person_b_id);

-- exact-duplicate guard at the DB level (app layer also checks both directions
-- and cross-type conflicts, since spouse/sibling are undirected)
create unique index if not exists uniq_relationship_exact
    on public.relationships(family_id, type, person_a_id, person_b_id);

alter table public.relationships enable row level security;