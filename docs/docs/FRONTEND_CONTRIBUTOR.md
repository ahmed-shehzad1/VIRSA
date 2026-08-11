# Virsa — Frontend Contributor Guide

## Welcome

You are contributing to **Virsa**, a private digital family archive designed to preserve family trees, stories, memories, photographs, and the legacy of generations.

The goal is not to build a complicated genealogy platform.

The goal is to build a **beautiful, modern, intuitive MVP** that allows people to understand their family relationships and preserve the stories of the people who came before them.

> **What we inherit. What we leave behind.**

---

# 1. Read These Two Files First

Before writing frontend code, read these two files:

### 1. `docs/DEVELOPMENT.md`

This explains:

* What Virsa is
* The main product idea
* Core features
* Privacy principles
* User/person distinction
* Family roles
* Deceased people
* Family connections
* Backend/frontend responsibilities
* Development order
* MVP scope
* Technology stack

### 2. `docs/Daily_Progress.md`

This is the shared development log.

At the end of every working session/day, add:

* What you worked on
* What you completed
* What you are currently working on
* Any problems/blockers
* Anything the other developer needs to know

Keep entries short and useful.

Example:

```text
## 2026-08-12 — Frontend

### Completed
- Created family dashboard
- Added responsive sidebar
- Added family member card component

### Working On
- Family tree visualization

### Blocked
- Waiting for `/api/families/:id` endpoint

### Notes
- Currently using mock family data.
- The API integration can replace the mock service later.
```

Do not rewrite old entries.

---

# 2. Your Role

Your primary responsibility is the **frontend**.

You are responsible for turning Virsa's functionality into a polished user experience.

Your work includes:

* React components
* Pages
* Navigation
* Family tree interface
* Person profiles
* Forms
* Memories
* Timeline
* Family dashboard
* Authentication UI
* Loading states
* Error states
* Responsive design
* Accessibility
* API integration when backend endpoints are available

You are **not required to wait for the backend**.

If an API does not exist yet, build the frontend using mock data and a clean service layer.

The backend can be connected later.

---

# 3. You Have Design Freedom

There is no requirement to copy a specific design.

You can decide:

* Layout
* Component structure
* Animations
* Color palette
* Typography
* Spacing
* Navigation
* Cards
* Modals
* Interactions
* Responsive behavior

However, the overall Virsa experience should feel:

* Modern
* Minimal
* Premium
* Warm
* Human
* Respectful
* Easy to understand

Avoid making it look like an old genealogy database.

Virsa should feel like a modern product while still carrying the emotional feeling of **heritage and memory**.

---

# 4. Frontend Technology

The current frontend stack is:

* React
* Vite
* React Router
* Axios
* Lucide React
* XYFlow / React Flow
* Tailwind CSS (if configured)

Before installing a new dependency, consider whether it is actually necessary.

Do not add large libraries simply because they make a small task easier.

Keep the frontend reasonably lightweight.

---

# 5. Frontend Structure

The frontend should generally follow this structure:

```text
frontend/
└── src/
    ├── components/
    │   ├── family-tree/
    │   ├── person/
    │   ├── legacy/
    │   ├── layout/
    │   └── ui/
    │
    ├── pages/
    │
    ├── services/
    │
    ├── hooks/
    │
    ├── types/
    │
    ├── utils/
    │
    ├── App.jsx
    └── main.jsx
```

This is a guideline, not a prison.

If a different structure makes more sense for a particular feature, use your judgment.

The important thing is that the project remains understandable.

---

# 6. How To Work As a Contributor

You should normally **not work directly on `main`**.

Create a branch for your feature.

For example:

```powershell
git checkout main
git pull origin main

git checkout -b feature/family-dashboard
```

Other examples:

```text
feature/auth-ui
feature/family-dashboard
feature/family-tree
feature/person-profile
feature/memories
feature/timeline
feature/settings
fix/tree-mobile-layout
fix/login-validation
```

Keep branches focused.

Avoid putting five unrelated features into one branch.

---

# 7. Making Changes

After working:

```powershell
git status
```

Review what changed.

Then:

```powershell
git add .
git commit -m "feat: add family dashboard"
```

Push your branch:

```powershell
git push -u origin feature/family-dashboard
```

Then open a **Pull Request on GitHub**.

Do not merge your own major changes into `main` without communicating with the other developer.

---

# 8. Before Starting New Work

Always make sure your local `main` is current:

```powershell
git checkout main
git pull origin main
```

Then create your feature branch:

```powershell
git checkout -b feature/your-feature
```

This reduces merge conflicts.

---

# 9. If the Backend Does Not Exist Yet

Do NOT wait.

Build the interface with mock data.

For example:

```javascript
const mockPerson = {
  id: "person-001",
  name: "Ahmed Khan",
  birthYear: 1942,
  deathYear: 2018,
  biography:
    "A teacher who spent his life helping his community.",
  isDeceased: true
};
```

Build the UI around that data.

When the backend is ready, replace the mock service with an API call.

---

# 10. Keep API Calls Separate

Avoid putting API requests directly inside every component.

Prefer a service structure such as:

```text
src/
└── services/
    ├── authService.js
    ├── familyService.js
    ├── personService.js
    ├── memoryService.js
    └── relationshipService.js
```

For example:

```javascript
export async function getPerson(id) {
  return axios.get(`/api/people/${id}`);
}
```

The UI should not need to know how the API works internally.

This makes backend integration much easier later.

---

# 11. Working Before API Integration

If the backend endpoint is not ready:

```text
UI
 ↓
mock service
 ↓
mock data
```

Later:

```text
UI
 ↓
service
 ↓
API
 ↓
backend
 ↓
MongoDB
```

The goal is to keep the UI code mostly unchanged when the backend becomes available.

---

# 12. If the Backend Already Exists

If the backend developer has already implemented an endpoint, you can integrate with it.

Before doing so, communicate about:

* Endpoint URL
* HTTP method
* Request body
* Response format
* Authentication requirements
* Error responses
* Permissions

Do not guess the API structure if you can simply ask.

For example:

```text
GET /api/families/:familyId

Response:

{
  "id": "...",
  "name": "...",
  "members": [...]
}
```

If the backend changes its response structure, update the frontend service rather than scattering workarounds throughout the UI.

---

# 13. Authentication

The frontend will eventually communicate with the backend for:

* Registration
* Login
* Logout
* Current user
* Protected routes

Do not store sensitive information unnecessarily.

Never put:

* MongoDB credentials
* JWT secrets
* AI API keys
* Server secrets

inside the React application.

Anything shipped to the browser should be considered visible to the user.

---

# 14. Family Tree

The family tree is one of the most important parts of Virsa.

It should eventually support:

* Parent/child relationships
* Spouses
* Siblings
* Multiple generations
* Person selection
* Zoom
* Pan
* Navigation
* Mobile-friendly viewing

The tree does not have to be perfect in the first version.

The priority is:

```text
Correct relationships
        ↓
Clear visualization
        ↓
Good interaction
        ↓
Beautiful animation/polish
```

Do not spend the entire project trying to create an infinitely complex tree engine.

---

# 15. Person Profiles

Clicking a person should lead to a meaningful profile.

Potential information:

* Name
* Photograph
* Initial/fallback representation
* Birth date/year
* Death date/year
* Biography
* Parents
* Children
* Spouse
* Siblings
* Memories
* Timeline
* Photos

For deceased people, use a respectful visual distinction.

Do not make the design feel dark, frightening, or overly dramatic.

---

# 16. Missing Photographs

Not every person will have a photograph.

Do not simply use a generic cartoon avatar.

Virsa should have a tasteful fallback.

For example:

```text
┌───────────────┐
│               │
│       A       │
│               │
└───────────────┘
```

The fallback should feel like part of Virsa's visual identity.

It should work regardless of someone's race, ethnicity, age, or appearance.

---

# 17. Responsive Design

Do not build only for desktop.

At minimum, consider:

* Desktop
* Laptop
* Tablet
* Mobile

The family tree is particularly challenging on mobile.

Think carefully about how users navigate a large family tree on a small screen.

Possible approaches include:

* Horizontal scrolling
* Zoom controls
* Focused person navigation
* Bottom sheets
* Full-screen tree mode

Use your judgment.

---

# 18. Loading States

Never leave users staring at a blank screen while something loads.

Create appropriate loading states.

Examples:

```text
Loading family...
Loading person...
Loading memories...
Saving...
Uploading photo...
```

Skeletons are preferred where appropriate.

---

# 19. Error States

The application should gracefully handle:

* Network failures
* Unauthorized access
* Missing people
* Missing families
* Invalid forms
* Failed uploads
* Server errors

Avoid showing raw backend errors directly to users.

Instead of:

```text
AxiosError: Request failed with status code 403
```

show something useful:

```text
You don't have permission to view this family.
```

---

# 20. Empty States

Design for empty data.

Examples:

A new family may have:

```text
Your family tree is waiting to be built.

Start by adding the first person.
```

A person may have:

```text
No memories have been added yet.

Be the first to share one.
```

Empty states are part of the product design.

---

# 21. Forms

Forms should:

* Validate input
* Clearly show required fields
* Show useful errors
* Prevent accidental submission
* Provide loading states
* Give success feedback

Do not make users fill out huge forms unnecessarily.

The MVP should be simple.

---

# 22. Accessibility

Keep accessibility in mind.

Use:

* Semantic HTML
* Proper buttons
* Labels for inputs
* Keyboard navigation
* Visible focus states
* Meaningful alt text
* Sufficient color contrast

Do not use a `<div>` as a button when a `<button>` should be used.

---

# 23. Images

Do not store image files inside MongoDB.

The backend will eventually use a dedicated image storage service.

The frontend should be designed to accept image URLs.

For example:

```javascript
{
  name: "Ahmed Khan",
  photoUrl: "https://..."
}
```

Do not hard-code local image paths into production components.

---

# 24. AI Features

AI is not the core of Virsa.

AI may eventually help with:

* Turning notes into biographies
* Improving written memories
* Summarizing life stories
* Organizing timeline information

The frontend should treat AI as an optional feature.

Do not design the entire application around AI.

---

# 25. Code Quality

Write code that another developer can understand.

Prefer:

```text
PersonCard
FamilyTree
MemoryCard
Timeline
FamilyHeader
```

over giant components containing everything.

If a component becomes unnecessarily large, break it down.

Avoid:

* Unused imports
* Dead code
* Console spam
* Hard-coded secrets
* Duplicate components
* Random dependency additions
* Extremely complicated abstractions

Do not over-engineer the MVP.

---

# 26. Git Commit Guidelines

Use clear commit messages.

Examples:

```text
feat: add login page
feat: add family dashboard
feat: add person profile
feat: add family tree controls
feat: add memory cards

fix: prevent empty family submission
fix: improve mobile tree layout

style: update family dashboard spacing

refactor: extract person card component

docs: update frontend development notes
```

Avoid commits such as:

```text
stuff
changes
final
final2
final-final
asdf
```

---

# 27. Pull Requests

When opening a Pull Request, explain:

### What changed?

Example:

```text
Added the initial family dashboard with:
- Family header
- Member count
- Recent memories
- Tree preview
```

### What should be tested?

Example:

```text
- Open dashboard
- Check responsive layout
- Test empty family state
- Test loading state
```

### Is anything blocked?

Example:

```text
The dashboard currently uses mock family data.
Backend integration can be added when the family endpoint is ready.
```

---

# 28. Communicating With the Backend Developer

Do not wait until the end of the project to integrate.

Communicate when you need:

* API endpoints
* Data structures
* Authentication behavior
* Permission rules
* Image upload behavior
* Error formats

If you need something from the backend, write it clearly.

Example:

```text
Frontend needs:

GET /api/families/:id

Required response:

{
  id,
  name,
  rootPerson,
  membersCount
}
```

This is much better than:

> "I need the family API."

---

# 29. Running the Frontend

From the project root:

```powershell
cd frontend
npm install
npm run dev
```

Vite will normally provide a local URL similar to:

```text
http://localhost:5173
```

Open that in your browser.

---

# 30. Running the Backend

Open a second PowerShell terminal.

From the project root:

```powershell
cd backend
npm install
npm run dev
```

The backend should normally run on:

```text
http://localhost:5000
```

---

# 31. Running Both

You should normally have two terminals open:

### Terminal 1

```powershell
cd Virsa/frontend
npm run dev
```

### Terminal 2

```powershell
cd Virsa/backend
npm run dev
```

Frontend:

```text
http://localhost:5173
```

Backend:

```text
http://localhost:5000
```

MongoDB is accessed by the backend through the configured MongoDB connection string.

---

# 32. Before Pushing

Always check:

```powershell
git status
```

Make sure you are not committing:

```text
node_modules/
.env
dist/
personal files
API keys
passwords
large temporary files
```

Then:

```powershell
git add .
git commit -m "feat: describe your change"
git push
```

---

# 33. Daily Progress

Before finishing your work for the day, update:

```text
docs/Daily_Progress.md
```

Keep it concise.

Use:

```text
## YYYY-MM-DD — Frontend

### Completed
- ...

### Working On
- ...

### Blocked
- ...

### Notes
- ...
```

This helps the entire team understand what happened without needing a meeting.

---

# 34. You Are Free To Experiment

There is no requirement that every UI decision must be approved beforehand.

If you have a better idea:

Try it.

If you think a feature can be implemented more cleanly:

Implement it.

If you discover a better UX:

Use it.

If you think the current architecture needs a change:

Discuss it before making a major structural change.

The goal is not to blindly follow instructions.

The goal is to build the best version of Virsa possible within the MVP timeline.

---

# 35. The Main Rule

Do not let perfection stop progress.

Virsa is an MVP.

A simple feature that works well is better than a complicated feature that is half finished.

Prioritize:

```text
Functionality
    ↓
Usability
    ↓
Visual quality
    ↓
Polish
```

And always keep the core idea in mind:

> **Virsa is about people, not data.**

The family tree is the structure.

The stories, memories, photographs, and lives are the reason it exists.
