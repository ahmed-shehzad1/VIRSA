alter table public.person_media
  alter column person_id drop not null,
  add column if not exists memory_id uuid references public.person_memories(id) on delete cascade,
  add column if not exists thumbnail_url text,
  add column if not exists thumbnail_path text,
  add column if not exists width integer,
  add column if not exists height integer,
  add column if not exists file_size_bytes integer;

alter table public.person_media
  drop constraint if exists chk_media_has_owner;
alter table public.person_media
  add constraint chk_media_has_owner check (person_id is not null or memory_id is not null);

create index if not exists idx_person_media_memory on public.person_media(memory_id);
create index if not exists idx_person_media_family on public.person_media(family_id);