import { useState } from "react";
import "./App.css";

const sections = ["Overview", "People", "Family Tree", "Memories", "Timeline"];

export default function App() {
  const [active, setActive] = useState("Overview");
  const [search, setSearch] = useState("");

  return (
    <div className="app">
      <header className="header">
        <div>
          <h1>VIRSA</h1>
          <p>Preserving family stories, memories & heritage</p>
        </div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search..."
          aria-label="Search"
        />
      </header>

      <nav className="nav">
        {sections.map((section) => (
          <button
            key={section}
            className={active === section ? "active" : ""}
            onClick={() => setActive(section)}
          >
            {section}
          </button>
        ))}
      </nav>

      <main className="content">
        <h2>{active}</h2>
        {search && <p className="muted">Searching for: {search}</p>}

        {active === "Overview" && (
          <div className="grid">
            <div className="card"><strong>People</strong><span>Manage family members</span></div>
            <div className="card"><strong>Memories</strong><span>Preserve important moments</span></div>
            <div className="card"><strong>Family Tree</strong><span>Explore your heritage</span></div>
            <div className="card"><strong>Timeline</strong><span>View family history</span></div>
          </div>
        )}

        {active !== "Overview" && (
          <div className="panel">
            <p>This VIRSA section is ready for your application data and backend integration.</p>
            <button className="primary">Add Family Member</button>
          </div>
        )}
      </main>
    </div>
  );
}
