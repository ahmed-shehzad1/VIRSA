import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { UserPlus, BookPlus, ImagePlus, Network, Send, ArrowRight } from "lucide-react";
import { AppShell } from "@/components/virsa/app-shell";
import { FamilyTree } from "@/components/virsa/family-tree";
import { PersonCard } from "@/components/virsa/person-card";
import { MemoryCard } from "@/components/virsa/memory-card";
import { LoadingState } from "@/components/virsa/states";
import {
  AddMemoryModal,
  AddPersonModal,
  InviteMemberModal,
  UploadPhotoModal,
} from "@/components/virsa/modals";
import { Button } from "@/components/ui/button";
import { queries } from "@/data/api";
import { FAMILY } from "@/data/mock";

export const Route = createFileRoute("/app/")({
  head: () => ({
    meta: [
      { title: "Family home — VIRSA archive" },
      {
        name: "description",
        content:
          "The family home of your VIRSA archive: people, memories, photographs and generations at a glance.",
      },
      { property: "og:title", content: "Family home — VIRSA archive" },
      { property: "og:description", content: "People, memories and photographs at a glance." },
    ],
  }),
  component: Dashboard,
});

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <p className="font-display text-4xl leading-none text-foreground">{value}</p>
      <p className="mt-3 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
    </div>
  );
}

function Dashboard() {
  const navigate = useNavigate();
  const people = useQuery(queries.people);
  const memories = useQuery(queries.memories);
  const stats = useQuery(queries.stats);
  const photos = useQuery(queries.photos);

  const loading = people.isLoading || stats.isLoading;

  return (
    <AppShell
      title={FAMILY.name}
      description="Private family archive"
      actions={
        <AddPersonModal
          people={people.data ?? []}
          trigger={
            <Button size="sm">
              <UserPlus /> <span className="hidden sm:inline">Add person</span>
            </Button>
          }
        />
      }
    >
      {loading ? (
        <LoadingState />
      ) : (
        <div className="space-y-12">
          <section>
            <p className="max-w-3xl text-[15px] leading-relaxed text-muted-foreground">
              {FAMILY.description}
            </p>
            <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
              <Stat label="People recorded" value={stats.data?.people ?? 0} />
              <Stat label="Memories" value={stats.data?.memories ?? 0} />
              <Stat label="Photographs" value={stats.data?.photos ?? 0} />
              <Stat label="Generations" value={stats.data?.generations ?? 0} />
            </div>
          </section>

          <section aria-labelledby="quick-actions">
            <h2 id="quick-actions" className="text-[11px] uppercase tracking-[0.24em] text-gold">
              Quick actions
            </h2>
            <div className="mt-4 flex flex-wrap gap-3">
              <AddPersonModal
                people={people.data ?? []}
                trigger={
                  <Button variant="quiet">
                    <UserPlus /> Add person
                  </Button>
                }
              />
              <AddMemoryModal
                people={people.data ?? []}
                trigger={
                  <Button variant="quiet">
                    <BookPlus /> Add memory
                  </Button>
                }
              />
              <UploadPhotoModal
                trigger={
                  <Button variant="quiet">
                    <ImagePlus /> Upload photo
                  </Button>
                }
              />
              <Button variant="quiet" onClick={() => navigate({ to: "/app/tree" })}>
                <Network /> View family tree
              </Button>
              <InviteMemberModal
                trigger={
                  <Button variant="quiet">
                    <Send /> Invite member
                  </Button>
                }
              />
            </div>
          </section>

          <section aria-labelledby="tree-preview">
            <div className="flex items-end justify-between gap-4">
              <h2 id="tree-preview" className="font-display text-2xl">
                Family tree
              </h2>
              <Link
                to="/app/tree"
                className="focus-ring group inline-flex items-center gap-1.5 rounded-sm text-sm text-muted-foreground hover:text-foreground"
              >
                Open full tree
                <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
            <div className="mt-5">
              <FamilyTree
                people={people.data ?? []}
                height="24rem"
                showControls={false}
                onSelect={(p) =>
                  navigate({ to: "/app/people/$personId", params: { personId: p.id } })
                }
              />
            </div>
          </section>

          <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
            <section aria-labelledby="recent-memories">
              <div className="flex items-end justify-between gap-4">
                <h2 id="recent-memories" className="font-display text-2xl">
                  Recent memories
                </h2>
                <Link to="/app/memories" className="text-sm text-muted-foreground hover:text-foreground">
                  All memories
                </Link>
              </div>
              <div className="mt-5 space-y-5">
                {(memories.data ?? []).slice(0, 2).map((m) => (
                  <MemoryCard
                    key={m.id}
                    memory={m}
                    person={people.data?.find((p) => p.id === m.personId)}
                  />
                ))}
              </div>
            </section>

            <div className="space-y-10">
              <section aria-labelledby="recent-people">
                <h2 id="recent-people" className="font-display text-2xl">
                  Recently added people
                </h2>
                <div className="mt-5 space-y-3">
                  {[...(people.data ?? [])]
                    .sort((a, b) => b.addedAt.localeCompare(a.addedAt))
                    .slice(0, 4)
                    .map((p) => (
                      <PersonCard key={p.id} person={p} compact />
                    ))}
                </div>
              </section>

              <section aria-labelledby="recent-photos">
                <div className="flex items-end justify-between gap-4">
                  <h2 id="recent-photos" className="font-display text-2xl">
                    Recent photographs
                  </h2>
                  <Link to="/app/photos" className="text-sm text-muted-foreground hover:text-foreground">
                    Gallery
                  </Link>
                </div>
                <div className="mt-5 grid grid-cols-3 gap-3">
                  {(photos.data ?? []).slice(0, 6).map((ph) => (
                    <Link
                      key={ph.id}
                      to="/app/photos"
                      className="focus-ring block overflow-hidden rounded-md border border-border bg-card p-1.5 transition-colors hover:border-gold/50"
                    >
                      <img
                        src={ph.src}
                        alt={ph.caption}
                        loading="lazy"
                        className="archival aspect-square w-full rounded-sm object-cover"
                      />
                    </Link>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
