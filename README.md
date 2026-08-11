<!-- Animated Header -->

<p align="center">
  <img
    src="https://capsule-render.vercel.app/api?type=waving&color=0:1f2937,100:6b705c&height=180&section=header&text=Virsa&fontSize=64&fontColor=ffffff&animation=fadeIn&fontAlignY=38"
    width="100%"
  />
</p>

<p align="center">
  <strong>What we inherit. What we leave behind.</strong>
</p>

<p align="center">
  A private digital family archive for preserving people, stories, memories, and generations.
</p>

<p align="center">
  <a href="#-the-idea">The Idea</a> •
  <a href="#-features">Features</a> •
  <a href="#-technology">Technology</a> •
  <a href="#-development">Development</a>
</p>

---

## ✦ The Idea

A family tree tells you **who is related to whom**.

Virsa aims to tell you **who those people were**.

It combines an interactive family tree with photographs, life stories, memories, and timelines — creating a private archive that can be passed from one generation to the next.

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

**Photographs → Life Story → Memories → Timeline → Relationships**

---

## 🌳 Features

### Interactive Family Tree

A visual representation of generations.

* Pan and zoom
* Navigate generations
* Explore relationships
* Click people to open their stories
* Distinct presentation for deceased members
* Responsive experience

### 📖 Legacy

Every person can have a story attached to them.

Their experiences, memories, photographs, important events, and the things their family wants future generations to remember.

### 🕰️ Life Timeline

A person's life can be represented as a chronological journey.

```text
1942 ───── 1964 ───── 1971 ───── 1985 ───── 2018
  │          │           │           │          │
Birth      Marriage     Child      Career     Legacy
```

### 🖼️ Memories & Photos

Preserve photographs and personal memories alongside the people they belong to.

### 🔐 Private Family Spaces

Families have their own private spaces.

Members can be invited and assigned appropriate permissions while unrelated families remain completely separate.

### 🤝 Collaborative History

Family members can contribute information while keeping important changes reviewable.

Historical information can be disputed without pretending that there is always one unquestionable version of the truth.

---

## 🎨 Visual Direction

Virsa should feel:

**Modern · Minimal · Warm · Human · Premium**

The interface should feel more like a beautiful digital archive than a traditional genealogy database.

We're exploring:

* Smooth page transitions
* Subtle micro-interactions
* Animated family-tree connections
* Gentle node expansion
* Interactive timelines
* Image transitions
* Elegant modals
* Skeleton loading
* Smooth tree navigation
* Soft depth and gradients
* Archival styling for deceased members
* Responsive layouts

> **The interface should feel alive, while the memories remain the focus.**

---

## 🧭 Core Experience

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
        ┌─────┴─────┐
        ▼           ▼
     Their Story   Photos
        │           │
        └─────┬─────┘
              ▼
         Their Legacy
```

---

## 🛠️ Technology

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

## 📁 Project Structure

```text
Virsa/
│
├── frontend/       # React application
├── backend/        # Node/Express API
├── database/       # Database resources
├── docs/           # Project documentation
├── uploads/        # Local development uploads
│
├── README.md
└── .gitignore
```

Important documentation:

* [`DEVELOPMENT.md`](docs/DEVELOPMENT.md)
* [`FRONTEND_CONTRIBUTOR.md`](docs/FRONTEND_CONTRIBUTOR.md)
* [`Daily_Progress.md`](docs/Daily_Progress.md)

---

## 🚀 Running Locally

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

Frontend:

```text
http://localhost:5173
```

Backend:

```text
http://localhost:5000
```

---

## 🤝 Development

Virsa is currently being developed collaboratively.

The basic workflow is:

```text
Create Branch
     ↓
Build Feature
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
Merge
```

Contributors should also update:

```text
docs/Daily_Progress.md
```

after each working session.

See [`FRONTEND_CONTRIBUTOR.md`](docs/FRONTEND_CONTRIBUTOR.md) for the frontend workflow.

---

## 🗺️ MVP

The initial MVP focuses on:

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

The first version is intentionally focused.

Advanced ideas such as automatic family matching, intelligent genealogy suggestions, family books, advanced AI tools, and other features can come later.

---

## ❤️ Why Virsa?

People disappear.

Photographs get lost.

Stories are forgotten.

Names become disconnected from the people who carried them.

Virsa is an attempt to preserve those connections.

### **Remember the people. Preserve the stories. Carry the legacy forward.**

---

<!-- Animated Footer -->

<p align="center">
  <img
    src="https://capsule-render.vercel.app/api?type=waving&color=0:6b705c,100:1f2937&height=120&section=footer"
    width="100%"
  />
</p>
