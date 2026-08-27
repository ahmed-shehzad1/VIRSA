-- Additional composite indexes for the query patterns that show up most
-- across list/filter/search endpoints. Safe to re-run.

create index if not exists idx_people_family_archived on public.people(family_id, is_archived);
create index if not exists idx_memories_family_visibility on public.person_memories(family_id, visibility, moderation_status);
create index if not exists idx_media_family_moderation on public.person_media(family_id, moderation_status);
create index if not exists idx_change_requests_family_status on public.change_requests(family_id, status);
create index if not exists idx_notifications_user_read on public.notifications(user_id, is_read, created_at desc);
create index if not exists idx_timeline_events_family_date on public.timeline_events(family_id, event_date);