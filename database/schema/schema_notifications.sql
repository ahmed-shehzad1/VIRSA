create table if not exists public.notifications (
    id          uuid primary key default gen_random_uuid(),
    user_id     uuid not null references public.users(id) on delete cascade,
    family_id   uuid references public.families(id) on delete cascade,
    type        text not null check (type in ('invitation','change_request','moderation','member','general')),
    title       text not null,
    body        text,
    data        jsonb not null default '{}'::jsonb,
    is_read     boolean not null default false,
    created_at  timestamptz not null default now()
);

create index if not exists idx_notifications_user on public.notifications(user_id, created_at desc);
create index if not exists idx_notifications_unread on public.notifications(user_id) where is_read = false;

create table if not exists public.notification_preferences (
    user_id                  uuid primary key references public.users(id) on delete cascade,
    email_on_invitation      boolean not null default true,
    email_on_change_request  boolean not null default true,
    email_on_moderation      boolean not null default true,
    in_app_enabled           boolean not null default true,
    updated_at               timestamptz not null default now()
);

alter table public.notifications enable row level security;
alter table public.notification_preferences enable row level security;