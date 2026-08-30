import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, Lock, GitBranch, BookOpen, Images, Scale, Menu, X } from "lucide-react";
import heroImage from "@/assets/hero-archive.jpg";
import { Logo } from "@/components/virsa/logo";
import { SectionHeading } from "@/components/virsa/section-heading";
import { FamilyTree } from "@/components/virsa/family-tree";
import { Button } from "@/components/ui/button";
import { PEOPLE } from "@/data/mock";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "VIRSA — Your family has a history. Preserve it." },
      {
        name: "description",
        content:
          "A private digital archive for the people and stories that make a family. Build your family tree, preserve memories, photographs and life stories across generations.",
      },
      { property: "og:title", content: "VIRSA — A private digital family archive" },
      {
        property: "og:description",
        content: "Your family has a history. Preserve it.",
      },
    ],
  }),
  component: Landing,
});

const NAV_LINKS = [
  { href: "#features", label: "What it holds" },
  { href: "#how", label: "How it works" },
  { href: "#legacy", label: "Legacy" },
  { href: "#privacy", label: "Privacy" },
];

function Landing() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-dvh paper">
      {/* ---------- Navigation ---------- */}
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Logo />
          <nav aria-label="Primary" className="hidden items-center gap-8 md:flex">
            {NAV_LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="focus-ring rounded-sm text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {l.label}
              </a>
            ))}
          </nav>
          <div className="hidden items-center gap-2 md:flex">
            <Button asChild variant="ghost" size="sm">
              <Link to="/login">Sign in</Link>
            </Button>
            <Button asChild size="sm">
              <Link to="/create-family">Create your family</Link>
            </Button>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? <X /> : <Menu />}
          </Button>
        </div>
        {menuOpen && (
          <div className="border-t border-border bg-background px-6 py-4 md:hidden">
            <nav aria-label="Mobile" className="flex flex-col gap-1">
              {NAV_LINKS.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-md px-2 py-2.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
                >
                  {l.label}
                </a>
              ))}
            </nav>
            <div className="mt-4 flex flex-col gap-2">
              <Button asChild variant="outline">
                <Link to="/login">Sign in</Link>
              </Button>
              <Button asChild>
                <Link to="/create-family">Create your family</Link>
              </Button>
            </div>
          </div>
        )}
      </header>

      {/* ---------- Hero ---------- */}
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 pb-20 pt-16 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:gap-16 lg:pb-28 lg:pt-24">
          <div className="fade-up">
            <p className="text-[11px] uppercase tracking-[0.32em] text-gold">
              Heritage · what is passed down
            </p>
            <h1 className="mt-6 text-balance text-5xl leading-[1.05] text-foreground sm:text-6xl lg:text-[4.25rem]">
              Your family has a history.
              <span className="block italic text-primary">Preserve it.</span>
            </h1>
            <p className="mt-7 max-w-xl text-pretty text-[17px] leading-relaxed text-muted-foreground">
              VIRSA is a private digital archive for the people and stories that make a family —
              lineage, memories, photographs and life stories, kept together and passed on.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to="/create-family">
                  Create your family <ArrowRight />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/join-family">Join a family</Link>
              </Button>
            </div>
            <p className="mt-7 flex items-center gap-2 text-xs text-muted-foreground">
              <Lock className="size-3.5 text-gold" aria-hidden />
              Private by default. Invitation only. No public profiles.
            </p>
          </div>

          <figure className="fade-up relative" style={{ animationDelay: "140ms" }}>
            <div className="overflow-hidden rounded-lg border border-border bg-card p-3 shadow-lift">
              <img
                src={heroImage}
                alt="Family photographs, letters and a fountain pen laid out on aged paper"
                width={1600}
                height={1200}
                className="w-full rounded-sm object-cover"
              />
            </div>
            <figcaption className="mt-4 hidden max-w-xs rounded-md border border-border bg-card/90 p-4 backdrop-blur sm:absolute sm:-bottom-8 sm:-left-8 sm:mt-0 sm:block">
              <p className="font-display text-lg leading-snug">Muhammad Ahmed Khan</p>
              <p className="mt-1 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                1942 – 2018 · Lahore
              </p>
            </figcaption>
          </figure>
        </div>
      </section>

      {/* ---------- Living tree preview ---------- */}
      <section className="border-y border-border bg-parchment/40 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <SectionHeading
            eyebrow="The family tree"
            title="Four generations, held in one place"
            description="Parents, children, spouses and siblings — drawn the way a family actually remembers itself, not as an organisational chart."
            align="center"
          />
          <div className="mt-12">
            <FamilyTree people={PEOPLE} height="26rem" showControls={false} />
          </div>
          <div className="mt-8 text-center">
            <Button asChild variant="quiet">
              <Link to="/app/tree">Explore the interactive tree</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ---------- Features ---------- */}
      <section id="features" className="scroll-mt-24 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <SectionHeading
            eyebrow="What an archive holds"
            title="More than names and dates"
            description="A family record is made of small things: a photograph with no caption, a story only one person still remembers, a year that two relatives disagree about."
          />
          <div className="mt-14 grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: GitBranch,
                title: "People and lineage",
                body: "Every person carries a stable identity — parents, spouses, siblings and children, recorded once and never merged without consent.",
              },
              {
                icon: BookOpen,
                title: "Life stories",
                body: "A factual biography for each person, written and corrected by the family over time.",
              },
              {
                icon: Images,
                title: "Photographs",
                body: "Scans and prints, captioned, dated and tied to the people who appear in them.",
              },
              {
                icon: Scale,
                title: "Propose, don't impose",
                body: "Disagree with a date? Suggest a correction. The family decides, and the previous value stays in the record.",
              },
              {
                icon: Lock,
                title: "Private by default",
                body: "No public profiles, no discovery, no feeds. An archive is opened by invitation only.",
              },
              {
                icon: BookOpen,
                title: "Memories, attributed",
                body: "A memory is a personal recollection, always carrying the name of the person who contributed it.",
              },
            ].map((f) => (
              <article
                key={f.title}
                className="group bg-card p-8 transition-colors hover:bg-accent/40"
              >
                <f.icon className="size-5 text-gold" aria-hidden />
                <h3 className="mt-5 font-display text-xl">{f.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- How it works ---------- */}
      <section id="how" className="scroll-mt-24 border-y border-border bg-parchment/40 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <SectionHeading eyebrow="How it works" title="Four quiet steps" />
          <ol className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                n: "01",
                t: "Create the family",
                d: "Name the family and record the oldest ancestor you know of. The family is defined by its lineage, not by whoever signed up.",
              },
              {
                n: "02",
                t: "Invite relatives",
                d: "Send an invitation code. Only invited people can see anything at all.",
              },
              {
                n: "03",
                t: "Add people and stories",
                d: "Build the tree together. Everyone contributes; every contribution is attributed.",
              },
              {
                n: "04",
                t: "Pass it on",
                d: "The archive belongs to the family. It survives members leaving, and ownership can be transferred.",
              },
            ].map((s) => (
              <li key={s.n}>
                <p className="font-display text-3xl text-gold">{s.n}</p>
                <span className="mt-4 block h-px w-10 bg-border" aria-hidden />
                <h3 className="mt-4 font-display text-xl">{s.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ---------- Legacy / story ---------- */}
      <section id="legacy" className="scroll-mt-24 py-24">
        <div className="mx-auto grid max-w-6xl gap-14 px-6 lg:grid-cols-2 lg:items-center">
          <div>
            <SectionHeading
              eyebrow="Legacy"
              title="The stories are the point"
              description="A life story is the factual record. A memory is what one person carries. VIRSA keeps both, and never confuses one for the other."
            />
            <Button asChild className="mt-8" variant="quiet">
              <Link to="/app/people/$personId" params={{ personId: "p_ahmed" }}>
                Read a life story
              </Link>
            </Button>
          </div>
          <figure className="rounded-lg border border-border bg-card p-8 shadow-archive">
            <blockquote className="border-l border-gold/60 pl-5 font-display text-2xl leading-relaxed text-foreground">
              “Abba would take me to the platform on Sunday mornings, long after he'd stopped
              working the line. He never once bought a ticket to go anywhere — he only ever wanted
              to watch the trains leave.”
            </blockquote>
            <figcaption className="mt-6 text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Sara Khan Malik · remembering Muhammad Ahmed Khan, 1988
            </figcaption>
          </figure>
        </div>
      </section>

      {/* ---------- Privacy ---------- */}
      <section
        id="privacy"
        className="scroll-mt-24 border-y border-border bg-primary py-24 text-primary-foreground"
      >
        <div className="mx-auto max-w-3xl px-6 text-center">
          <p className="text-[11px] uppercase tracking-[0.3em] text-primary-foreground/70">
            Privacy
          </p>
          <h2 className="mt-6 text-balance text-4xl leading-tight">
            The platform does not decide what a family's history is.
          </h2>
          <p className="mt-6 text-[17px] leading-relaxed text-primary-foreground/80">
            The family collectively preserves it. Archives are private by default, never indexed,
            never merged automatically, and never sold. Family trees are joined only when real
            people confirm the connection.
          </p>
        </div>
      </section>

      {/* ---------- Final CTA ---------- */}
      <section className="py-28">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-balance text-4xl leading-tight sm:text-5xl">
            Remember where you came from.
          </h2>
          <p className="mt-5 text-[17px] leading-relaxed text-muted-foreground">
            Start with one person and one date. The rest follows.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg">
              <Link to="/create-family">
                Create your family <ArrowRight />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/join-family">I have an invitation code</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ---------- Footer ---------- */}
      <footer className="border-t border-border bg-parchment/50 py-14">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-xs">
            <Logo />
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              A private digital archive for the people and stories that make a family.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-10 text-sm">
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                Archive
              </p>
              <ul className="mt-4 space-y-2.5">
                <li>
                  <Link to="/app" className="text-muted-foreground hover:text-foreground">
                    Family home
                  </Link>
                </li>
                <li>
                  <Link to="/app/tree" className="text-muted-foreground hover:text-foreground">
                    Family tree
                  </Link>
                </li>
                <li>
                  <Link to="/app/memories" className="text-muted-foreground hover:text-foreground">
                    Memories
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                Account
              </p>
              <ul className="mt-4 space-y-2.5">
                <li>
                  <Link to="/login" className="text-muted-foreground hover:text-foreground">
                    Sign in
                  </Link>
                </li>
                <li>
                  <Link to="/register" className="text-muted-foreground hover:text-foreground">
                    Register
                  </Link>
                </li>
                <li>
                  <Link to="/join-family" className="text-muted-foreground hover:text-foreground">
                    Join a family
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mx-auto mt-12 max-w-6xl border-t border-border px-6 pt-6">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} VIRSA · Heritage, kept by the family.
          </p>
        </div>
      </footer>
    </div>
  );
}
