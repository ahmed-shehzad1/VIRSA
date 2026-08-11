# VIRSA — Development Guide

## 1. What is Virsa?

Virsa is a private digital family archive.

It allows families to create an interactive family tree and preserve the stories, memories, photographs, and important events of the people within that family.

Virsa is not simply a genealogy/tree application.

The purpose is to preserve family history for future generations.

### Core idea

> **What we inherit. What we leave behind.**

A family can create a private Family Space, invite relatives, build their family tree, and collaboratively document the lives of family members.

---

# 2. Core Features

The MVP should contain:

* User registration/login
* Private Family Spaces
* Family invitations
* Family roles and permissions
* Interactive family tree
* People/profiles
* Parent/child relationships
* Spouse relationships
* Sibling relationships
* Birth/death information
* Photographs
* Life stories
* Memories
* Timeline events
* Deceased-person presentation
* Information change suggestions
* Basic moderation
* Privacy controls

AI is an optional supporting feature.

AI should help users turn rough notes into better-written biographies or summaries.

AI should NOT determine whether historical information is true.

---

# 3. Important Product Principles

## Family ≠ Family Name

Two families can have exactly the same surname or display name.

The application must never assume that two families with the same name are the same family.

Every Family Space has a unique internal ID.

---

## User ≠ Person

A User is someone with an account.

A Person is someone represented in the family tree.

A deceased ancestor can be a Person without ever being a User.

A User may eventually claim/associate themselves with a Person.

---

## Stable Person Identity

Every Person must have a permanent internal ID.

Changing someone's name, biography, relationships, or other information must not create a new identity.

---

## Information Can Be Disputed

The application cannot guarantee historical truth.

Instead, important information should be attributable to users.

If someone disagrees with information, they can suggest a change.

Example:

```text
Birth year: 1945

Added by: Ahmed

Suggested change:
1945 → 1947

Suggested by: Sara
```

The owner/admin can review the suggestion.

---

## Memories Are Different From Facts

A memory is a personal recollection.

Example:

> "Grandpa used to take us fishing every Sunday."

It does not need to be treated as a verified historical fact.

Memories should have an author and can be moderated.

---

# 4. Family Structure

A Family Space contains:

```text
Family
│
├── Members
├── People
├── Relationships
├── Memories
├── Photos
├── Timeline Events
└── Change Requests
```

The person who creates the Family Space becomes the Owner.

However, the creator does not define the historical identity of the family.

The displayed family identity can be based on the oldest known ancestor/root of the family tree.

---

# 5. Family Roles

### Owner

Can:

* Manage the Family Space
* Manage members
* Manage admins
* Approve important changes
* Moderate content
* Transfer ownership

### Admin

Can:

* Add/edit people
* Manage relationships
* Review changes
* Moderate content

### Member

Can:

* View the family
* Add people
* Add memories
* Add photos
* Suggest changes

### Viewer

Can:

* View authorized family information

---

# 6. Privacy

Family Spaces are private by default.

Users outside a Family Space cannot view its private information.

Backend authorization is required for every protected request.

The frontend must never be trusted to enforce permissions by itself.

The backend must verify:

1. User is authenticated.
2. User belongs to the requested family.
3. User has permission to perform the requested operation.

Living people should have stronger privacy protections than historical/deceased people.

---

# 7. Deceased People

Deceased people should have a subtle visual distinction.

Possible UI:

```text
Muhammad Ahmed
1942 — 2018
In Memory
```

The visual style can be slightly archival/muted while remaining respectful.

The person can have:

* Life story
* Memories
* Photos
* Timeline
* Family relationships

---

# 8. Family Connections

Two independently created Family Spaces may eventually discover that they are related.

Virsa may suggest potential connections based on overlapping family structures.

For example:

```text
Family A

Grandfather
└── Son
    └── Grandson


Family B

Grandfather
└── Son
    └── Grandson
```

The application can say:

> "These families may contain overlapping relatives."

However:

## NEVER automatically merge families.

A connection must be reviewed and confirmed by the relevant family owners.

Automatic matching is a future feature.

---

# 9. Backend Responsibilities

The backend/database developer is primarily responsible for:

### Authentication

* Registration
* Login
* Password hashing
* JWT/session handling
* Authentication middleware

### MongoDB

Create and maintain Mongoose models for:

```text
User
Family
FamilyMember
Person
Relationship
Memory
TimelineEvent
Photo
ChangeRequest
```

### API

Create REST API endpoints for:

* Authentication
* Families
* Members
* People
* Relationships
* Memories
* Timeline
* Photos
* Change requests

### Authorization

Ensure users cannot:

* Access unrelated families
* Edit information without permission
* Modify another family's data
* Access private information
* Perform admin operations without the correct role

### AI

If AI is included:

* Create backend AI service
* Keep API keys on backend
* Accept user notes
* Generate biography/summary
* Return generated text to frontend

AI keys must NEVER be exposed in the React frontend.

---

# 10. Frontend Responsibilities

The frontend developer is primarily responsible for:

### Authentication UI

* Login
* Registration
* Logout
* Authentication states

### Family UI

* Family dashboard
* Family members
* Invitations
* Family settings

### Family Tree

* Interactive graph
* Person nodes
* Relationships
* Zoom
* Pan
* Navigation
* Mobile responsiveness

### Person Profile

* Person information
* Biography
* Dates
* Family relationships
* Photos
* Timeline
* Memories

### Legacy

* Life story
* Memories
* Timeline
* Photos
* Deceased-person presentation

### UI/UX

* Responsive design
* Loading states
* Error states
* Empty states
* Forms
* Modals
* Notifications
* Accessibility
* Consistent design system

---

# 11. Shared Responsibilities

Both developers should collaborate on:

* API design
* Data requirements
* Authentication flow
* Permissions
* Integration
* Testing
* Bug fixing
* Deployment
* Documentation

Neither developer should make major architectural changes without communicating with the other.

---

# 12. Git Workflow

Do not work directly on `main`.

Each feature should use its own branch.

Examples:

```text
feature/auth
feature/family
feature/family-tree
feature/person-profile
feature/legacy
feature/memories
feature/change-requests
```

Workflow:

```text
Create branch
     ↓
Develop
     ↓
Test
     ↓
Commit
     ↓
Push
     ↓
Pull Request
     ↓
Review
     ↓
Merge into main
```

Commit messages should describe what changed.

Examples:

```text
feat: add user registration
feat: add family creation
feat: add person model
feat: add family tree visualization
fix: prevent unauthorized family access
style: improve person profile
```

---

# 13. Development Order

The project should be developed approximately in this order:

## Phase 1 — Foundation

* React setup
* Express setup
* MongoDB connection
* Environment variables
* Git workflow

## Phase 2 — Authentication

* User model
* Registration
* Login
* Authentication middleware

## Phase 3 — Family

* Family model
* Create family
* Join family
* Invitations
* Roles

## Phase 4 — People

* Person model
* Create person
* Edit person
* Person profile

## Phase 5 — Relationships

* Relationship model
* Parent/child
* Spouse
* Sibling
* Tree visualization

## Phase 6 — Legacy

* Life story
* Memories
* Photos
* Timeline
* Deceased presentation

## Phase 7 — Collaboration

* Change requests
* Moderation
* History
* Permissions

## Phase 8 — AI

* Biography generation
* Memory summarization

## Phase 9 — Polish

* Responsive design
* Error handling
* Loading states
* Security testing
* Deployment
* Demo data

---

# 14. One-Week MVP Rule

If a feature is not necessary for:

> User → Family → People → Relationships → Stories

it should probably be postponed.

Do not allow the MVP to become a full genealogy platform.

Future features can include:

* Automatic family matching
* Family tree merging
* Voice memories
* Photo restoration
* OCR
* Family books/PDFs
* Advanced AI family search
* Public memorials
* Advanced succession
* Mobile application

---

# 15. Technology Stack

## Frontend

* React
* Vite
* React Router
* Axios
* Tailwind CSS
* Lucide React
* React Flow / XYFlow

## Backend

* Node.js
* Express
* Mongoose
* MongoDB
* JWT
* bcrypt
* Zod

## Storage

Images should eventually use a dedicated image/file storage service rather than MongoDB itself.

Possible option:

* Cloudinary

## AI

AI calls should be made through the backend.

---

# 16. Environment Variables

Never commit real secrets.

Example backend `.env`:

```env
PORT=5000
MONGODB_URI=
JWT_SECRET=
CLIENT_URL=http://localhost:5173
AI_API_KEY=
```

The actual `.env` file must remain local.

Commit `.env.example` instead.

---

# 17. Definition of Done

A feature is considered complete when:

* It works locally.
* Frontend and backend communicate correctly.
* Invalid input is handled.
* Unauthorized access is prevented.
* Loading/error states exist where necessary.
* The code is reasonably organized.
* The feature does not break existing functionality.
* The feature is committed to a feature branch.
* The feature is reviewed before merging.

---

# 18. Final Goal

The MVP should allow a family to:

```text
Create account
      ↓
Create Family Space
      ↓
Invite relatives
      ↓
Add ancestors
      ↓
Add relationships
      ↓
Build family tree
      ↓
Open a person
      ↓
Read their life story
      ↓
View photos
      ↓
Read family memories
      ↓
Preserve their legacy
```

The application should feel like a **digital family archive**, not simply a database or CRUD application.

## Virsa

> **What we inherit. What we leave behind.**
