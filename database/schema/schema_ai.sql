alter table public.people
  add column if not exists biography_ai_assisted boolean not null default false;

alter table public.person_memories
  add column if not exists ai_assisted boolean not null default false;

create table if not exists public.ai_usage_log (
    id          uuid primary key default gen_random_uuid(),
    user_id     uuid not null references public.users(id) on delete cascade,
    family_id   uuid references public.families(id) on delete cascade,
    feature     text not null check (feature in ('biography_generation', 'memory_summarization')),
    created_at  timestamptz not null default now()
);

create index if not exists idx_ai_usage_log_user_time on public.ai_usage_log(user_id, created_at);

alter table public.ai_usage_log enable row level security;