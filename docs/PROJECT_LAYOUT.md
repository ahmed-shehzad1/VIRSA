Status system
⬜ Not Started
🟨 In Progress
🟦 Ready for Integration
🟩 Complete
🟥 Blocked
MILESTONE 1 — AUTHENTICATION & ACCOUNT

Goal: Users can securely create and manage their Virsa accounts.

#	You — Backend	Frontend Developer
1.1	User registration API + validation	Registration page
1.2	Password hashing + secure credential handling	Registration form validation
1.3	Login API + authentication response	Login page
1.4	Session/JWT authentication integration	Login state + persistence
1.5	Authentication middleware	Protected route system
1.6	Current-user API	User session/profile state
1.7	Logout/session invalidation	Logout functionality
1.8	Forgot-password flow	Forgot-password page
1.9	Password reset API	Password reset page
1.10	Email verification flow	Email verification UI
1.11	Account security validation	Authentication error states
1.12	Account deletion endpoint	Delete-account interface
1.13	Account/profile update API	Account settings page
1.14	Avatar/profile-image handling	Profile/avatar interface
Milestone 1 complete when:
Register
→ Verify
→ Login
→ Stay authenticated
→ Access protected pages
→ Logout
→ Reset password
→ Manage account
MILESTONE 2 — FAMILY SPACE

Goal: Users can create and manage private Family Spaces.

The Family Space is the central container for people, relationships, memories, photos, timeline events and change requests.

#	You — Backend	Frontend Developer
2.1	Family creation API	Create Family page
2.2	Family retrieval API	Family dashboard
2.3	Family update API	Family settings
2.4	Family deletion/archive logic	Delete/archive confirmation UI
2.5	Family membership system	Family members page
2.6	Owner role implementation	Owner interface
2.7	Admin role implementation	Admin interface
2.8	Member role implementation	Member interface
2.9	Viewer role implementation	Viewer interface
2.10	Family invitation API	Invitation interface
2.11	Invitation acceptance/rejection	Invitation notifications
2.12	Remove member API	Remove-member interface
2.13	Change member role API	Role-management UI
2.14	Family privacy controls	Privacy settings
2.15	Family access authorization	Unauthorized-access UI

The Owner/Admin/Member/Viewer roles are explicitly defined in the Virsa specification.

MILESTONE 3 — PEOPLE / FAMILY MEMBERS

Goal: Create the actual people represented in the family tree.

Remember:

User ≠ Person

A Person can exist without having a Virsa account.

#	You — Backend	Frontend Developer
3.1	Person creation API	Add Person form
3.2	Person retrieval API	People directory
3.3	Person update API	Edit Person form
3.4	Person archive/delete logic	Delete/archive UI
3.5	Birth/death data handling	Birth/death information UI
3.6	Gender/basic demographic fields	Person information UI
3.7	Biography storage/update	Biography editor
3.8	Person search API	People search
3.9	Person filtering API	People filters
3.10	Person pagination API	Pagination/infinite loading
3.11	Person authorization	Permission-aware controls
3.12	Person-to-user association logic	"Claim this person" UI

Every Person needs a permanent internal identity so changes don't create a new person.

MILESTONE 4 — FAMILY RELATIONSHIPS

Goal: Establish the actual family relationships.

#	You — Backend	Frontend Developer
4.1	Relationship model	Relationship UI foundation
4.2	Parent/child API	Add parent/child interface
4.3	Spouse relationship API	Add spouse interface
4.4	Sibling relationship handling	Add sibling interface
4.5	Relationship validation	Relationship validation UI
4.6	Duplicate relationship prevention	Duplicate-action handling
4.7	Invalid relationship prevention	Invalid-action feedback
4.8	Relationship deletion API	Remove relationship UI
4.9	Family relationship retrieval	Relationship display
4.10	Relationship authorization	Permission-aware relationship controls

The guide specifically identifies parent/child, spouse and sibling relationships as core MVP functionality.

MILESTONE 5 — INTERACTIVE FAMILY TREE

Goal: Turn the relationship data into the primary Virsa experience.

#	You — Backend	Frontend Developer
5.1	Family-tree data API	Tree page
5.2	Tree relationship transformation	React Flow/XYFlow integration
5.3	Root-person/tree traversal API	Person nodes
5.4	Ancestor retrieval	Ancestor visualization
5.5	Descendant retrieval	Descendant visualization
5.6	Spouse relationship data	Spouse connections
5.7	Tree authorization	Family tree access control
5.8	Large-tree pagination/optimization	Tree performance optimization
5.9	Person-node data API	Node information cards
5.10	Tree navigation endpoints	Zoom/pan/navigation
5.11	Tree state handling	Mobile tree experience

React Flow / XYFlow is already specified as the intended tree technology.

MILESTONE 6 — PERSON PROFILE

Goal: Clicking a person should open their complete archive.

#	You — Backend	Frontend Developer
6.1	Complete person profile API	Person profile page
6.2	Biography API	Biography section
6.3	Family relationship API	Family relationships section
6.4	Birth/death information API	Dates/details section
6.5	Person media retrieval	Photo section
6.6	Person memory retrieval	Memories section
6.7	Person timeline retrieval	Timeline section
6.8	Deceased-person data handling	Deceased-person presentation
6.9	Profile privacy rules	Privacy-aware profile UI

This is where Virsa should start feeling like a digital archive, rather than a CRUD application.

MILESTONE 7 — LIFE STORIES

Goal: Preserve meaningful biographies.

#	You — Backend	Frontend Developer
7.1	Biography creation/update API	Story editor
7.2	Biography retrieval	Story display
7.3	Biography version/history support	Story history UI
7.4	Biography permissions	Editing permissions
7.5	Biography moderation	Moderation indicators
MILESTONE 8 — MEMORIES

Goal: Allow family members to preserve personal recollections.

The guide explicitly treats memories differently from factual historical information.

#	You — Backend	Frontend Developer
8.1	Memory creation API	Add Memory
8.2	Memory retrieval API	Memory display
8.3	Memory editing API	Edit Memory
8.4	Memory deletion API	Delete Memory
8.5	Memory author tracking	Author display
8.6	Memory moderation status	Moderation indicators
8.7	Memory privacy controls	Memory visibility controls
8.8	Person-memory association	Person memories section
8.9	Family-memory association	Family memories section
MILESTONE 9 — PHOTOS & MEDIA

Goal: Preserve family photographs properly.

#	You — Backend	Frontend Developer
9.1	Photo metadata model/API	Photo gallery
9.2	Image upload integration	Upload interface
9.3	Image association with Person	Person gallery
9.4	Image association with Memory	Memory gallery
9.5	Image deletion API	Delete photo
9.6	Image authorization	Permission-aware gallery
9.7	Image validation	Upload validation
9.8	Storage URL handling	Image loading states
9.9	Thumbnail/optimized-image handling	Responsive image display

The architecture should use dedicated image storage rather than MongoDB/PostgreSQL itself for the actual image files. Your guide suggests Cloudinary as one possible option.

MILESTONE 10 — TIMELINE

Goal: Give every Person a chronological life history.

#	You — Backend	Frontend Developer
10.1	Timeline event creation API	Add event UI
10.2	Timeline retrieval API	Timeline page
10.3	Timeline update API	Edit event
10.4	Timeline deletion API	Delete event
10.5	Event date handling	Date display
10.6	Event categorization	Event categories
10.7	Person-event association	Person timeline
10.8	Timeline sorting	Chronological visualization
MILESTONE 11 — CHANGE REQUESTS

Goal: Make historical information collaborative and reviewable.

The Virsa model specifically calls for attribution and suggested changes rather than pretending historical information is always objectively verified.

#	You — Backend	Frontend Developer
11.1	ChangeRequest model	Suggest-change UI
11.2	Submit change API	Change suggestion form
11.3	Pending-change API	Pending changes page
11.4	Approve-change API	Approve UI
11.5	Reject-change API	Reject UI
11.6	Change history	Change history display
11.7	Reviewer tracking	Reviewer information
11.8	Permission enforcement	Permission-aware controls
11.9	Conflict handling	Conflict/error UI
MILESTONE 12 — MODERATION
#	You — Backend	Frontend Developer
12.1	Content moderation API	Moderation dashboard
12.2	Memory moderation	Memory moderation UI
12.3	Photo moderation	Photo moderation UI
12.4	Report-content API	Report interface
12.5	Moderation status/history	Moderation history
12.6	Admin authorization	Admin-only interface
12.7	Content removal/restoration	Removal/restoration controls
MILESTONE 13 — NOTIFICATIONS

This isn't explicitly listed as a core Virsa feature, but it is important for a usable collaborative application.

#	You — Backend	Frontend Developer
13.1	Notification model/service	Notification center
13.2	Invitation notifications	Invitation notification
13.3	Change-request notifications	Change notification
13.4	Moderation notifications	Moderation notification
13.5	Notification read/unread state	Read/unread UI
13.6	Notification preferences	Notification settings
MILESTONE 14 — SEARCH
#	You — Backend	Frontend Developer
14.1	Person search API	Global search UI
14.2	Family search within authorized data	Search results
14.3	Memory search	Memory results
14.4	Search filtering	Filters
14.5	Search pagination	Pagination
14.6	Search authorization	Permission-safe results
MILESTONE 15 — AI ASSISTANCE

AI remains optional/supporting rather than the authority on historical truth.

#	You — Backend	Frontend Developer
15.1	AI service integration	AI interface
15.2	Biography-generation API	Generate biography
15.3	Memory-summarization API	Summarize memory
15.4	AI input validation	AI loading states
15.5	AI error handling	AI error handling
15.6	AI usage protection/rate limits	Generation controls
15.7	Secure server-side API key handling	Generated-text editor
15.8	Save approved generated content	Accept/reject generated content

The API key must remain on the backend.

MILESTONE 16 — PRIVACY & ACCESS CONTROL

This deserves its own milestone because Virsa is private by default.

#	You — Backend	Frontend Developer
16.1	Family-level authorization	Privacy-aware UI
16.2	Person-level privacy rules	Person privacy controls
16.3	Living-person protection	Living-person privacy UI
16.4	Deceased-person access rules	Deceased-person presentation
16.5	Private-family enforcement	Private-family indicators
16.6	Role-based authorization audit	Permission-aware UI audit
16.7	Unauthorized access testing	Unauthorized states

The backend must verify authentication, family membership and permission on protected operations; frontend checks alone are insufficient.

MILESTONE 17 — PRODUCTION SECURITY

This is where you make it something you'd actually be comfortable deploying.

#	You — Backend	Frontend Developer
17.1	Input validation audit	Form validation audit
17.2	Authentication security audit	Session/auth UI audit
17.3	Authorization audit	Permission UI audit
17.4	Rate limiting	Abuse/error feedback
17.5	Secure headers	Security-related UI review
17.6	CORS configuration	API-origin testing
17.7	Error sanitization	Production error pages
17.8	Secret/environment audit	Frontend secret audit
17.9	Database security/RLS audit	Privacy-flow testing
17.10	Dependency/security audit	Dependency/security audit
MILESTONE 18 — PERFORMANCE
#	You — Backend	Frontend Developer
18.1	Database indexes	Bundle optimization
18.2	API query optimization	Lazy loading
18.3	Pagination optimization	Image optimization
18.4	Tree performance optimization	Large-tree rendering optimization
18.5	API response optimization	Rendering optimization
18.6	Caching strategy	Client-side caching
18.7	Load testing	Performance testing
MILESTONE 19 — SEO & PUBLIC WEB PRESENCE

Even though the actual Family Spaces are private, the public-facing Virsa website still needs proper SEO.

#	You — Backend	Frontend Developer
19.1	Public API metadata if required	SEO metadata
19.2	Public/private route separation	Page titles
19.3	Public content authorization	Meta descriptions
19.4	Canonical URL strategy	Open Graph tags
19.5	Sitemap data/API if required	sitemap.xml
19.6	Robots/access rules	robots.txt
19.7	Structured-data support if required	JSON-LD structured data
19.8	Public profile privacy validation	Social sharing previews
19.9	404/API route handling	Custom 404 page

Important: private family information must never accidentally become indexable.

MILESTONE 20 — ACCESSIBILITY & UX
#	You — Backend	Frontend Developer
20.1	Consistent API errors	Accessible forms
20.2	Validation messages	Keyboard navigation
20.3	API loading/error consistency	Screen-reader support
20.4	Permission response consistency	Focus management
20.5	Upload error handling	Accessible image handling
20.6	—	Color/contrast audit
20.7	—	Responsive design audit
20.8	—	Mobile usability audit

Responsive design, loading/error states, empty states and accessibility are already explicitly part of the frontend responsibilities.

MILESTONE 21 — TESTING
#	You — Backend	Frontend Developer
21.1	Authentication tests	Authentication UI tests
21.2	Family API tests	Family UI tests
21.3	People API tests	People UI tests
21.4	Relationship tests	Tree tests
21.5	Memory/API tests	Memory UI tests
21.6	Change-request tests	Change-request UI tests
21.7	Authorization tests	Permission UI tests
21.8	Security tests	Security-flow tests
21.9	API integration tests	Frontend/backend integration tests
21.10	Production regression tests	Production regression tests
MILESTONE 22 — DEPLOYMENT & PRODUCTION
#	You — Backend	Frontend Developer
22.1	Production database	Production frontend
22.2	Production environment variables	Production environment variables
22.3	Backend deployment	Frontend deployment
22.4	Production API URL	Production API configuration
22.5	Database backups	Build/deployment pipeline
22.6	Logging/monitoring	Frontend error monitoring
22.7	Health-check endpoint	Production health verification
22.8	Production security audit	Production security audit
22.9	Domain/API configuration	Custom domain
22.10	Final integration	Final integration
MILESTONE 23 — FINAL MVP / DEMO

This is the actual Virsa MVP finish line.

The original guide defines the intended core flow as:

Create account → Create Family Space → Invite relatives → Add ancestors → Add relationships → Build tree → Open person → Read story → View photos → Read memories → Preserve legacy.

#	You — Backend	Frontend Developer
23.1	Complete API audit	Complete UI audit
23.2	Complete authorization audit	Complete UX audit
23.3	Complete database audit	Complete responsive audit
23.4	Production bug fixing	Production bug fixing
23.5	Demo data/API preparation	Demo data/UI preparation
23.6	Final API documentation	Final user-flow documentation
23.7	Deployment verification	Deployment verification
23.8	Final security verification	Final accessibility verification
23.9	Final backend sign-off	Final frontend sign-off
23.10	VIRSA MVP COMPLETE	VIRSA MVP COMPLETE