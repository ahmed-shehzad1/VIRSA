### Setup ps1 file  is in root folder for getting the directory map of the whole project just run .\setup.ps1 in powershell while being in root folder and the direectory will be updated.

### Look at Daily progress for tasks and update it after you are done


Frontend Developer Guide — Backend Status

What's built (Milestones 1–20, fully functional):

Auth — register, login, JWT + refresh rotation, logout, email verification, password reset, account lockout
Families — CRUD, roles (owner/admin/member/viewer), invitations, privacy settings, archive/delete
People — CRUD, search/filter/pagination, claim-a-person flow, living-person privacy protection
Relationships — parent/child, spouse, sibling, cycle/duplicate prevention
Family tree — graph traversal API (ancestors/descendants/full tree) for React Flow
Person profiles — aggregated profile endpoint (bio + relationships + media + memories + timeline)
Life stories — versioned biography with edit history and moderation
Memories — personal recollections, tagged to people, family-wide feed, moderation
Photos/media — Supabase Storage upload with auto-thumbnails, linked to people or memories
Manual timeline events — separate from the auto-built profile timeline
Change requests — suggest/approve/reject edits to any person field, with conflict detection
Moderation — unified report/review/hide/restore across bios, memories, photos
Notifications — in-app inbox, read/unread, preferences (invitation/change/moderation triggers)
Search — people + memories, filtered, paginated
AI assistance — biography drafts + memory summaries (Claude), grounded only in recorded facts, never authoritative
Security/perf hardening — rate limiting, security headers, CORS allowlist, indexes, tree caching

All endpoints live under /api/.... Auth via Authorization: Bearer <accessToken>; refresh token is an httpOnly cookie handled automatically by the browser (just use credentials: 'include').

Every error response has the same shape:

json
{ "success": false, "message": "...", "code": "SOME_CODE", "details": [...] }

Use code to drive UI behavior (e.g. INSUFFICIENT_ROLE → show the unauthorized state), details (only present on VALIDATION_ERROR) to highlight specific bad fields.

What's coming next (Milestones 21–24): automated tests, a proper API doc site (so you won't need to dig through chat for endpoint shapes anymore), real deployment, and later — merging duplicate people, exporting your tree, and full data export. None of this changes any endpoint you're already using — it's reliability/tooling work, not breaking changes.

If something breaks or looks undocumented in the meantime: ping the backend dev directly — the docs milestone (22) isn't done yet, so chat history is still the source of truth for exact request/response shapes.