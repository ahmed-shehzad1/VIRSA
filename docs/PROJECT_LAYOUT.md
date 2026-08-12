M0 — PROJECT FOUNDATION

Goal: Get both developers working from the same foundation.

🟦 YOUR BACKEND
Project setup
 Create /server
 Initialize Node.js project
 Install Express
 Install Mongoose
 Install dotenv
 Install CORS
 Install Zod
 Install bcrypt
 Install JWT library
 Create server entry point
 Create MongoDB connection
 Create environment configuration
 Create .env.example
 Configure CORS
 Create basic error-handling middleware
Backend structure

Something like:

server/
├── src/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── validators/
│   ├── utils/
│   └── app.js
│
├── .env
├── .env.example
└── package.json
Basic API
GET /api/health

should return something like:

Virsa API running
🟩 FRONTEND
 Create React/Vite application
 Configure Tailwind
 Configure React Router
 Configure Axios
 Create basic folder structure
 Create layout
 Create navbar/sidebar foundation
 Create reusable button/input/modal components
 Create loading component
 Create error component
 Create notification/toast system
🔵 INTEGRATION
 Frontend can communicate with backend
 MongoDB connection confirmed
 /api/health works from frontend
 Git branches established
 README updated
Milestone complete when:

React → Express → MongoDB works.

M1 — AUTHENTICATION

Goal: A user can create an account and securely log in.

This corresponds to the authentication foundation specified in the guide.

🟦 BACKEND
User model

Create:

User
├── name
├── email
├── passwordHash
├── avatar
├── createdAt
└── updatedAt
 User schema
 Unique email
 Password hashing
 Validation
Registration
POST /api/auth/register
 Validate input
 Check existing email
 Hash password
 Create user
 Return safe user data
Login
POST /api/auth/login
 Validate credentials
 Compare password
 Generate JWT
 Return authentication response
Authentication middleware
authenticate()
 Read token
 Verify JWT
 Attach user to request
 Reject unauthorized requests
Additional
 Get current user
 Logout strategy
 Authentication error handling
🟩 FRONTEND
 Registration page
 Login page
 Form validation
 API integration
 Store authentication state
 Protected routes
 Logout
 Loading states
 Authentication errors
🔵 INTEGRATION

Test:

Register
 ↓
Login
 ↓
Receive authentication
 ↓
Open protected page
 ↓
Refresh
 ↓
Remain authenticated
 ↓
Logout
Milestone complete when:

A completely new user can register, log in, access protected resources and log out.

M2 — FAMILY SPACE

Goal: A user can create and manage a private family.

The Virsa guide defines Family Space as the central private container for members, people, relationships, memories, photos, timeline events and change requests.

🟦 BACKEND
Family model
Family
├── _id
├── name
├── description
├── createdBy
├── rootPerson
├── privacy
├── createdAt
└── updatedAt
FamilyMember model
FamilyMember
├── family
├── user
├── role
└── joinedAt
APIs
POST   /api/families
GET    /api/families
GET    /api/families/:id
PATCH  /api/families/:id
DELETE /api/families/:id
Membership
 Add member
 Remove member
 Change role
 Check membership
Roles

Implement:

Owner
Admin
Member
Viewer

These roles and their responsibilities are defined in the guide.

🟩 FRONTEND
 Create Family page
 Family dashboard
 Family selector
 Family settings
 Members page
 Member list
 Role display
 Invite UI
 Empty family state
🔵 INTEGRATION

Test:

User
 ↓
Create Family
 ↓
Become Owner
 ↓
Invite another user
 ↓
User joins
 ↓
Owner sees member
Milestone complete when:

Two users can belong to the same private Family Space.

M3 — PEOPLE

Goal: Build the actual people represented inside the family.

This is where the important User ≠ Person distinction comes into play.

🟦 BACKEND
Person model
Person
├── _id
├── family
├── firstName
├── middleName
├── lastName
├── gender
├── birthDate
├── deathDate
├── birthPlace
├── biography
├── photo
├── isDeceased
├── createdBy
├── updatedBy
├── createdAt
└── updatedAt

Most importantly:

Person has its own permanent ID.

 Person schema
 Create person
 Get person
 Update person
 Delete/archive person
 Person authorization
APIs
POST   /api/families/:familyId/people
GET    /api/families/:familyId/people
GET    /api/people/:personId
PATCH  /api/people/:personId
DELETE /api/people/:personId
🟩 FRONTEND
 People page
 People cards/list
 Add person
 Edit person
 Person profile
 Birth/death information
 Deceased styling
 Search people
🔵 INTEGRATION

Create:

Great Grandfather
Grandfather
Father
Child

and verify every Person has a stable ID.

Milestone complete when:

The family can create and view actual people independently from user accounts.

M4 — RELATIONSHIPS + FAMILY TREE

🔥 This is probably the most important milestone.

🟦 BACKEND
Relationship model
Relationship
├── _id
├── family
├── personA
├── personB
├── type
├── createdBy
└── createdAt

Relationship types:

PARENT
CHILD
SPOUSE
SIBLING
 Relationship schema
 Create relationship
 Delete relationship
 Validate relationship
 Prevent invalid/self relationships
 Prevent unauthorized relationship changes
APIs
POST   /api/families/:familyId/relationships
GET    /api/families/:familyId/relationships
DELETE /api/relationships/:relationshipId
Tree API

Create an endpoint that gives the frontend everything required to construct the tree:

GET /api/families/:familyId/tree

Response should contain:

people
+
relationships
🟩 FRONTEND

Use React Flow / XYFlow as specified in your guide.

 Family tree page
 Person nodes
 Relationship edges
 Parent/child visualization
 Spouse visualization
 Zoom
 Pan
 Node selection
 Open person profile
 Tree navigation
 Mobile handling
🔵 INTEGRATION

Build:

       Grandfather
            │
          Father
            │
          Ahmed

Then:

Grandfather ─── Grandmother
       │
     Father ─── Mother
       │
     Ahmed
Milestone complete when:

A family can visually build and navigate its family tree.

M5 — STORIES + MEMORIES

Goal: Turn the tree into an actual family archive.

The guide specifically distinguishes memories from historical facts; memories are personal recollections with an author.

🟦 BACKEND
Memory
Memory
├── _id
├── family
├── person
├── author
├── title
├── content
├── date
├── visibility
├── status
└── createdAt
 Create memory
 Edit memory
 Delete memory
 Get memories
 Author tracking
Life Story

Decide whether biography stays directly on Person or becomes its own model.

For MVP I'd keep it on Person.

 Biography
 Story editing
 Story viewing
🟩 FRONTEND
 Memories section
 Add memory
 Edit memory
 Delete memory
 Memory cards
 Person memories
 Life story section
 Legacy presentation
🔵 INTEGRATION

Open:

Person
 ↓
Life Story
 ↓
Memories
Milestone complete when:

Opening a person feels like opening their archive, not just a database record.

M6 — PHOTOS + TIMELINE
🟦 BACKEND
TimelineEvent
TimelineEvent
├── _id
├── family
├── person
├── title
├── description
├── date
├── type
├── createdBy
└── createdAt
 Timeline model
 Create event
 Update event
 Delete event
 Get timeline
Photos

For MVP:

 Photo metadata model
 Photo association with Person
 Photo association with Memory
 Upload integration

Actual image storage should eventually use dedicated storage rather than MongoDB itself, as the guide recommends.

🟩 FRONTEND
 Photo gallery
 Upload photo
 Delete photo
 Person photos
 Memory photos
 Timeline UI
 Timeline cards
 Timeline filtering
M7 — CHANGE REQUESTS

This is where Virsa becomes collaborative instead of simply CRUD.

The guide explicitly requires users to be able to suggest changes to potentially disputed information.

🟦 BACKEND
ChangeRequest
ChangeRequest
├── _id
├── family
├── person
├── field
├── oldValue
├── proposedValue
├── reason
├── suggestedBy
├── status
├── reviewedBy
└── reviewedAt

Status:

PENDING
APPROVED
REJECTED
 Create suggestion
 View suggestions
 Approve
 Reject
 Record reviewer
 Apply approved change
 Authorization
🟩 FRONTEND
 Suggest change UI
 Pending changes
 Admin review page
 Approve button
 Reject button
 Change comparison UI

Example:

Birth year

Current:
1945

Suggested:
1947

Suggested by:
Sara
M8 — MODERATION + SECURITY

This should happen before calling the MVP finished.

The guide explicitly requires backend authorization and says the frontend must never be trusted to enforce permissions.

🟦 BACKEND
Authorization system

Create reusable middleware:

requireAuth()
requireFamilyMember()
requireRole()
requireOwner()
requireAdmin()

Test:

 User cannot access unrelated family
 Viewer cannot edit
 Member cannot perform admin actions
 Admin cannot transfer ownership
 Non-member cannot access family
 User cannot modify another family
 Invalid family IDs rejected
 Invalid person IDs rejected
Moderation
 Content status
 Remove inappropriate memory
 Remove inappropriate photo
 Admin moderation endpoint
Security
 Password hashing
 JWT security
 Input validation
 MongoDB injection protection
 CORS configuration
 Rate limiting
 Secure environment variables
 Error sanitization
🟩 FRONTEND
 Permission-aware UI
 Hide unavailable actions
 Unauthorized page
 Error states
 Confirmation dialogs
 Moderation UI

Important: frontend hiding is only UX. Backend authorization remains the real security layer.

M9 — AI

Only now.

The guide intentionally puts AI after the core collaboration functionality.

🟦 BACKEND

Create:

POST /api/ai/biography
POST /api/ai/summarize-memory
 AI service
 Backend API key
 Prompt construction
 Input validation
 Generated biography
 Memory summarization
 Error handling
 Rate limiting

Never expose the AI key to React.

🟩 FRONTEND
 "Improve biography"
 "Summarize memory"
 Loading state
 Generated result preview
 Edit before saving
 Accept/reject generated content

AI should assist writing — not decide whether historical information is true.

M10 — FINAL POLISH + DEPLOYMENT
🟦 BACKEND
 API documentation
 Clean controllers
 Clean services
 Remove duplicate code
 Database indexes
 Error handling review
 Security review
 API testing
 Seed/demo data
 Production environment
 Deployment
 MongoDB production database
 Logging
🟩 FRONTEND
 Responsive design
 Mobile testing
 Loading states
 Empty states
 Error states
 Accessibility
 Visual consistency
 Animation polish
 Final navigation
 Production build

The guide's definition of done also requires working frontend/backend integration, invalid-input handling, authorization, loading/error states, organized code, feature branches and review.