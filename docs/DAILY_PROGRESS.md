### Backend State here 

### Day 1 — Backend Auth & User Module (1.1–1.14)
- Implemented full custom auth: registration, login, JWT access + rotating
  refresh tokens (httpOnly cookie), logout/logout-all, auth middleware.
- Added password security: bcrypt hashing, strength validation, account
  lockout after 5 failed attempts.
- Built email verification and forgot/reset password flows (token-based,
  expiring, hashed in DB).
- Added profile management: get current user, update profile, delete
  account (password-confirmed), avatar upload/delete via Supabase Storage.
- Centralized error handling with consistent error codes + rate limiting
  on sensitive endpoints (login, register, email actions).
- Server verified running locally; Supabase schema + storage bucket set up.
- Next: connect frontend auth pages to these endpoints.


### Day 2 — 
Completed the Family Creation API and related backend validation.
Implemented Family Retrieval API for fetching family details and data.
Completed Family Update API for modifying family information.
Implemented Family deletion/archive logic with proper backend handling.
Built the Family Membership system and member management functionality.
Implemented Owner, Admin, Member, and Viewer role logic and permissions.
Completed Family Invitation API and invitation acceptance/rejection handling.
Implemented Remove Member and Change Member Role APIs.
Added Family privacy controls and Family access authorization.
Backend work for items 2.1–2.15 is completed; frontend implementation remains separate.

### Day 3 — People / Family Members Module (3.1–3.12)

- Built the Person model, separate from User — a Person can exist in the
  tree with zero account/login (per the "User ≠ Person" requirement).
- Person CRUD: create, retrieve, update, archive/restore, permanent delete
  (delete restricted to owner role only).
- Birth/death data (dates + places), gender/demographic fields, and
  biography all handled through a single update endpoint.
- Search, filtering (gender, living/deceased, claimed status, archived),
  and pagination on the people-list endpoint.
- Authorization reuses Milestone 2's role system: viewer=read-only,
  member+=create/edit, admin+=archive/claims, owner=permanent delete.
- Implemented "claim this person" flow: a user can request to link
  themselves to an existing Person record; admins approve/reject the
  request, or link/unlink a person directly without a request.
- Every Person has a permanent internal UUID, so edits/archiving never
  create a new record or lose history.
- Next: connect frontend People pages to these endpoints.


### Day 4 — Family Relationships Module (4.1–4.10)

- Built the Relationship model supporting parent/child, spouse, and
  sibling as the three core MVP relationship types.
- Parent/child API with cycle prevention (BFS ancestor check blocks
  circular ancestry, e.g. someone becoming their own ancestor).
- Spouse relationship API with status tracking (married/divorced/
  widowed/separated) and optional start/end dates.
- Sibling relationship API with sibling type (full/half/step).
- Duplicate and conflicting-relationship prevention: two people can only
  have one direct relationship type between them, checked both directions
  plus enforced with a DB-level unique constraint.
- Relationship deletion (admin+ only) and retrieval — both a full
  family relationship graph and a single person's categorized
  relationships (parents/children/spouses/siblings).
- Authorization follows the existing role system: member+ creates,
  admin+ deletes, viewer+ can read.
- Next: connect frontend relationship UI (add parent/child/spouse/
  sibling forms, relationship display) to these endpoints.

###  Day 5 — Family Tree Visualization + Person Profile (Milestones 5–6)

Milestone 5 — Family Tree
- Built a graph traversal layer over the People/Relationships tables:
  full-family tree, ancestor traversal, descendant traversal, all
  returned as plain nodes/edges arrays for React Flow to lay out.
- Root-person resolution with a sensible default (oldest person with
  no recorded parents) when the frontend hasn't picked a starting point.
- Spouses auto-included alongside any person in a result set, with
  marriage status carried on the edge.
- Large-tree protection: results capped (default 300 / hard cap 1000
  nodes), with rootPersonId + depth windowing so big families don't
  return a massive payload in one call.
- Single-node endpoint for the info-card that appears when a node
  is clicked, with immediate relations resolved.
- Authorization reuses existing family-membership checks — no separate
  tree-specific permission system needed.

### Milestone 6 — Person Profile
- Added Media (photos/documents via Supabase Storage) and Memories
  (family-contributed stories) as new entities linked to a Person.
- Built a single aggregated profile endpoint returning biography,
  relationships, birth/death info, media, memories, and a computed
  timeline in one call — plus separate section endpoints for lazy-loading.
- Timeline is assembled dynamically from birth/death dates, marriage
  dates, and dated memories — no separate event table to keep in sync.
- Deceased-person handling: a single `deceased` flag plus conditional
  death fields, so the frontend can adjust presentation cleanly.
- Added per-person and per-memory privacy control (all_members vs
  admins_only), enforced on every read path.
- Next: connect frontend Tree page (React Flow) and Person Profile
  page to these endpoints.

### Day 7 — Life Stories Module (7.1–7.5)

- Built dedicated biography read/write endpoints on top of the Person
  model's biography field (create = editing an empty story, update =
  editing an existing one).
- Added version history: every time a story's content changes, the
  previous version is snapshotted before being overwritten, with a
  restore endpoint to bring back an older version (itself tracked as
  a new edit, so nothing is lost).
- Editing permissions: first-ever write is open to any member
  (claims authorship); after that, only the original author or a
  family admin can edit.
- Moderation: any member can flag/report a story with a reason;
  admins review a per-family queue and resolve by hiding the story
  or dismissing the report.
- Next: connect frontend story editor, history view, and moderation
  indicators to these endpoints.  


### Day 8 — Memories Module (8.1–8.9)

- Built Memory CRUD (create/retrieve/edit/delete), deliberately
  separate from Life Stories - memories are personal, author-attributed
  recollections, not versioned factual records, so there's no edit
  history here by design.
- Author tracking on every memory, returned with each read so the
  frontend always has attribution without extra calls.
- Two-tier privacy (all_members / admins_only) enforced on every
  read path, for both person-scoped and family-wide views.
- Person-memory association: a memory can name one primary person
  plus a tagged-people list, so it surfaces on multiple people's
  pages.
- Family-memory association: added a family-wide paginated memory
  feed, separate from the per-person view.
- Moderation: members can flag a memory with a reason; admins get a
  review queue per family and resolve by hiding it or dismissing
  the report.
- Next: connect frontend Add/Edit Memory, memory feed, and
  moderation indicators to these endpoints.

### Day 9 — Photos & Media + Timeline (Milestones 9)

Milestone 9 — Photos & Media
- Extended person_media to support photos linked to either a Person or
  a Memory, satisfying both association requirements from one table.
- Real thumbnail generation on upload (via sharp) — a resized, compressed
  copy is generated and stored alongside the original, so galleries can
  load fast previews instead of full-resolution images.
- Upload validation: file type restricted to jpeg/png/webp/gif/pdf,
  10MB size limit, enforced before any storage write happens.
- Metadata (caption, taken date) editable after upload, separate from
  the delete permission.
- Authorization: only the uploader or a family admin can edit/delete
  a photo; all reads still gated by family membership.
- Media storage stays in Supabase Storage (not the database), same
  pattern as avatars from Milestone 1 - dedicated file storage, not
  Postgres blobs.

### Day 10 — Photos & Media + Timeline (Milestones 10)  

Milestone 10 — Timeline
- Built a dedicated timeline_events table for manually-created life
  events (education, career, relocation, achievement, etc.), separate
  from Milestone 6's auto-assembled timeline (birth/death/marriage/
  memories).
- Full event CRUD with category tagging and date-range support
  (single date or a date + end date, e.g. "lived in Lahore
  2015-2019").
- Date validation prevents an end date before the start date.
- Events always sorted chronologically on retrieval, with an
  ascending/descending toggle.
- Authorization: only the event's creator or a family admin can
  edit/delete it; any member can add one.
- Next: connect frontend photo gallery/upload UI and the Add/Edit
  Event timeline UI to these endpoints.  

###  Day 11 — Change Requests, Moderation, Notifications, Search, AI (Milestones 11–15)

Milestone 11 — Change Requests
- Built a generic ChangeRequest system covering any editable Person
  field (name, dates, biography, etc.) instead of one system per field.
- Submit/approve/reject flow with reviewer tracking (who reviewed,
  when, with an optional note).
- Conflict detection: if the underlying value changes between
  submission and review, approval is blocked with a clear conflict
  error unless explicitly overridden.
- Full change history per person and per family, separate from the
  pending queue.
- Admin-only approve/reject; any member can submit a suggestion.


### Front End State here 