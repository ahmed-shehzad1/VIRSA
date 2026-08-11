# Virsa

### *What we inherit. What we leave behind.*

Virsa is a **private digital family archive** built to preserve the people, stories, memories, and relationships that make a family what it is.

It combines an interactive family tree with personal stories, photographs, memories, and life timelines — creating a living archive that can be passed from one generation to the next.

---

## ✦ The Idea

A family tree tells you **who is related to whom**.

Virsa aims to tell you **who those people were**.

```text
                         ┌──────────────┐
                         │  Grandfather │
                         └──────┬───────┘
                                │
                     ┌──────────┴──────────┐
                     │                     │
                 ┌───▼───┐             ┌───▼───┐
                 │ Father│             │ Uncle │
                 └───┬───┘             └───────┘
                     │
              ┌──────┴──────┐
              │             │
          ┌───▼───┐     ┌───▼───┐
          │  You  │     │Sibling│
          └───────┘     └───────┘
```

Click on a person and the tree becomes their story:

**photographs → life story → memories → timeline → relationships**

---

## ✨ What We're Building

### 🌳 Interactive Family Tree

A visual, interactive representation of generations.

* Pan and zoom
* Navigate generations
* Explore relationships
* Click people to open their stories
* Distinct visual treatment for deceased family members
* Responsive experience across devices

### 📖 Personal Legacy

Every person can have a story attached to them.

Birth information, life experiences, memories, photographs, important events, and the things their family wants future generations to remember.

### 🕰️ Life Timeline

A person's life can be represented as a chronological journey.

```text
1942 ───── 1964 ───── 1971 ───── 1985 ───── 2018
  │          │           │           │          │
Birth      Marriage     Child      Career     Legacy
```

### 🖼️ Memories & Photos

Families can preserve photographs and personal memories alongside the people they belong to.

### 🔐 Private Family Spaces

Families have their own private spaces.

Members can be invited and assigned appropriate permissions, while unrelated families remain completely separate.

### 🤝 Collaborative History

Family members can contribute information while keeping important changes reviewable.

If something is disputed, Virsa should preserve the fact that **someone suggested it**, rather than pretending that historical information is always certain.

---

# 🎨 Visual Direction

Virsa should feel **modern, minimal, warm, and premium**.

The interface should feel more like a beautiful digital archive than a traditional genealogy database.

Some visual ideas we're exploring:

* Smooth page transitions
* Subtle micro-interactions
* Animated family-tree connections
* Gentle node expansion
* Interactive timeline movement
* Image hover effects
* Elegant modal transitions
* Skeleton loading states
* Smooth tree zooming and panning
* Soft gradients and depth
* Respectful archival styling for deceased members
* Responsive layouts
* Thoughtful empty states

Animations should support the experience rather than distract from it.

> **The interface should feel alive, while the memories remain the focus.**

---

# 🧭 Core Experience

```text
        Create Account
              │
              ▼
        Create Family
              │
              ▼
        Invite Relatives
              │
              ▼
        Build Family Tree
              │
              ▼
        Select a Person
              │
              ▼
      ┌───────┴────────┐
      │                │
   Their Story      Their Photos
      │                │
      └───────┬────────┘
              ▼
         Their Legacy
```

---

# 🛠️ Technology

### Frontend

* React
* Vite
* React Router
* Axios
* Tailwind CSS
* Lucide React
* XYFlow / React Flow

### Backend

* Node.js
* Express
* Mongoose
* MongoDB

### Planned

* Secure authentication
* Image storage
* AI-assisted storytelling
* Family connection suggestions

---

# 📁 Project Structure

```text
Virsa/
│
├── frontend/       # React application
├── backend/        # Node/Express API
├── database/       # Database-related resources
├── docs/           # Project documentation
├── uploads/        # Local development uploads
│
├── README.md
└── .gitignore
```

For development responsibilities and project rules, see:

* [`docs/DEVELOPMENT.md`](docs/DEVELOPMENT.md)
* [`docs/FRONTEND_CONTRIBUTOR.md`](docs/FRONTEND_CONTRIBUTOR.md)
* [`docs/Daily_Progress.md`](docs/Daily_Progress.md)

---

# 🚀 Running Locally

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Backend

In another terminal:

```bash
cd backend
npm install
npm run dev
```

The frontend will normally run on:

```text
http://localhost:5173
```

The backend will normally run on:

```text
http://localhost:5000
```

---

# 🤝 Contributing

Virsa is currently being developed collaboratively.

Contributors should:

1. Create a feature branch.
2. Work independently on the feature.
3. Keep commits meaningful.
4. Update `Daily_Progress.md`.
5. Open a Pull Request.
6. Review changes before merging into `main`.

See [`docs/FRONTEND_CONTRIBUTOR.md`](docs/FRONTEND_CONTRIBUTOR.md) for the frontend workflow.

---

# 🗺️ Current Focus

The initial MVP is focused on:

```text
Authentication
      ↓
Family Spaces
      ↓
People
      ↓
Relationships
      ↓
Interactive Family Tree
      ↓
Stories & Memories
      ↓
Legacy
```

We are intentionally keeping the first version focused.

More advanced features such as automatic family matching, intelligent genealogy suggestions, advanced AI tools, family books, and other ideas can come later.

---

## ❤️ Why Virsa?

People disappear.

Photographs get lost.

Stories are forgotten.

Names become disconnected from the people who carried them.

Virsa is an attempt to preserve those connections.

### **Remember the people. Preserve the stories. Carry the legacy forward.**

---
