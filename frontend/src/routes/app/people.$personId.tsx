import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { BookPlus, ImagePlus, PencilLine } from "lucide-react";
import { AppShell } from "@/components/virsa/app-shell";
import { PersonPortrait } from "@/components/virsa/person-portrait";
import { InMemoryBadge } from "@/components/virsa/badges";
import { Timeline } from "@/components/virsa/timeline";
import { MemoryCard } from "@/components/virsa/memory-card";
import { PhotoGallery } from "@/components/virsa/photo-gallery";
import { PersonCard } from "@/components/virsa/person-card";
import { EmptyState, LoadingState } from "@/components/virsa/states";
import { AddMemoryModal, AiStoryAssistant, UploadPhotoModal } from "@/components/virsa/modals";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { lifeSpan, queries } from "@/data/api";
import { cn } from "@/lib/utils";
import { mapPerson, type BackendPerson } from "@/services/personService";

export const Route = createFileRoute("/app/people/$personId")({
  head: () => ({
    meta: [
      { title: "Person record — VIRSA archive" },
      {
        name: "description",
        content:
          "A person's record in the family archive: life story, timeline, memories, photographs and achievements.",
      },
      { property: "og:title", content: "Person record — VIRSA archive" },
      { property: "og:description", content: "Life story, timeline, memories and photographs." },
    ],
  }),
  component: PersonProfile,
});

function Detail({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <dt className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-[15px]">{value ?? "Not recorded"}</dd>
    </div>
  );
}

function RelationGroup({
  title,
  people,
}: {
  title: string;
  people: ReturnType<typeof relationsOf>["parents"];
}) {
  if (!people.length) return null;
  return (
    <section>
      <h3 className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">{title}</h3>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {people.map((p) => (
          <PersonCard key={p.id} person={p} compact />
        ))}
      </div>
    </section>
  );
}

function PersonProfile() {
  const { personId } = Route.useParams();
  const families = useQuery(queries.families);
  const family = families.data?.[0];
  const profile = useQuery({
    ...queries.profile(family?.id || "", personId),
    enabled: !!family?.id,
  });

  if (families.isLoading || profile.isLoading) {
    return (
      <AppShell title="Loading record">
        <LoadingState label="Opening the record" />
      </AppShell>
    );
  }

  const p = profile.data?.person;
  if (!p) {
    return (
      <AppShell title="Record not found">
        <EmptyState
          title="No such person in this archive"
          description="This record may have been removed, or the link is incorrect."
          action={
            <Button asChild variant="outline">
              <Link to="/app/tree">Back to the family tree</Link>
            </Button>
          }
        />
      </AppShell>
    );
  }

  const memories = profile.data?.memories ?? [];
  const photos = profile.data?.photos ?? [];
  const relationPeople = (items: Array<{ person: BackendPerson }>) =>
    items.map((item) => mapPerson(item.person));
  const rel = {
    parents: relationPeople(profile.data?.relationships.parents ?? []),
    spouses: relationPeople(profile.data?.relationships.spouses ?? []),
    siblings: relationPeople(profile.data?.relationships.siblings ?? []),
    children: relationPeople(profile.data?.relationships.children ?? []),
  };

  return (
    <AppShell
      title={p.fullName}
      description={lifeSpan(p)}
      actions={
        <AddMemoryModal
          familyId={family?.id || ""}
          people={[p, ...rel.parents, ...rel.spouses, ...rel.siblings, ...rel.children]}
          defaultPersonId={p.id}
          trigger={
            <Button size="sm">
              <BookPlus /> <span className="hidden sm:inline">Add memory</span>
            </Button>
          }
        />
      }
    >
      {/* ---------- Record header ---------- */}
      <section
        className={cn(
          "grid gap-8 rounded-lg border border-border p-6 sm:p-8 lg:grid-cols-[auto_1fr]",
          p.deceased ? "bg-parchment/70" : "bg-card",
        )}
      >
        <div className="mx-auto w-40 sm:w-48 lg:mx-0">
          <div className="aspect-[4/5] w-full overflow-hidden rounded-md border border-border bg-parchment">
            <PersonPortrait
              name={p.fullName}
              photo={p.photo}
              deceased={p.deceased}
              size="xl"
              className="rounded-none border-0"
            />
          </div>
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            {p.deceased ? (
              <InMemoryBadge />
            ) : (
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/40 px-2.5 py-0.5 text-[10px] uppercase tracking-[0.2em] text-primary">
                Living
              </span>
            )}
            {p.occupation && (
              <span className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                {p.occupation}
              </span>
            )}
          </div>

          <h2 className="mt-4 font-display text-4xl leading-tight">{p.fullName}</h2>
          <p className="mt-2 font-display text-2xl text-gold">{lifeSpan(p)}</p>

          {p.bio && (
            <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
              {p.bio}
            </p>
          )}

          <dl className="mt-7 grid gap-5 border-t border-border pt-6 sm:grid-cols-2 lg:grid-cols-4">
            <Detail
              label="Born"
              value={p.birthDate ?? (p.birthYear ? String(p.birthYear) : undefined)}
            />
            <Detail label="Birth place" value={p.birthPlace} />
            {p.deceased && (
              <>
                <Detail
                  label="Died"
                  value={p.deathDate ?? (p.deathYear ? String(p.deathYear) : undefined)}
                />
                <Detail label="Place of death" value={p.deathPlace} />
              </>
            )}
            {!p.deceased && <Detail label="Status" value="Living" />}
          </dl>

          <p className="mt-6 text-xs text-muted-foreground">
            Record added by <span className="text-foreground">{p.addedBy}</span> on {p.addedAt}.
            <Link
              to="/app/changes"
              className="ml-2 text-primary underline-offset-4 hover:underline"
            >
              Suggest a correction
            </Link>
          </p>
        </div>
      </section>

      {/* ---------- Legacy sections ---------- */}
      <Tabs defaultValue="story" className="mt-10">
        <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 bg-transparent p-0">
          {[
            ["story", "Life story"],
            ["timeline", "Timeline"],
            ["memories", `Memories (${memories.length})`],
            ["photos", `Photographs (${photos.length})`],
            ["family", "Family"],
            ["history", "Record history"],
          ].map(([v, label]) => (
            <TabsTrigger
              key={v}
              value={v as string}
              className="rounded-full border border-border bg-card px-4 py-2 text-xs uppercase tracking-[0.14em] data-[state=active]:border-gold/60 data-[state=active]:bg-gold/15"
            >
              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="story" className="mt-8 space-y-8">
          <section className="rounded-lg border border-border bg-card p-6 sm:p-8">
            <h3 className="rule-gold font-display text-2xl">Life story</h3>
            <p className="mt-6 max-w-3xl text-[17px] leading-[1.8] text-foreground/90">
              {p.lifeStory ??
                "No life story has been written yet. Anyone in the family can begin one."}
            </p>
            <p className="mt-6 text-xs text-muted-foreground">
              A life story is the family's factual record — distinct from a memory, which is one
              person's recollection.
            </p>
            <Button variant="outline" size="sm" className="mt-5">
              <PencilLine /> Propose an edit
            </Button>
          </section>

          {p.achievements.length > 0 && (
            <section className="rounded-lg border border-border bg-card p-6 sm:p-8">
              <h3 className="rule-gold font-display text-2xl">
                Achievements and important moments
              </h3>
              <ul className="mt-6 divide-y divide-border">
                {p.achievements.map((a) => (
                  <li key={a.id} className="flex flex-wrap items-baseline gap-x-4 gap-y-1 py-4">
                    <span className="font-display text-xl text-gold">{a.year ?? "—"}</span>
                    <span className="text-[15px]">{a.title}</span>
                    {a.detail && (
                      <span className="w-full text-sm text-muted-foreground">{a.detail}</span>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}

          <AiStoryAssistant personName={p.fullName} />
        </TabsContent>

        <TabsContent value="timeline" className="mt-8">
          <section className="rounded-lg border border-border bg-card p-6 sm:p-10">
            <h3 className="rule-gold mb-8 font-display text-2xl">A life in years</h3>
            {p.timeline.length ? (
              <Timeline events={p.timeline} />
            ) : (
              <EmptyState
                title="No dated events yet"
                description="Add the moments this life turned on."
              />
            )}
          </section>
        </TabsContent>

        <TabsContent value="memories" className="mt-8">
          {memories.length ? (
            <div className="grid gap-5 lg:grid-cols-2">
              {memories.map((m) => (
                <MemoryCard key={m.id} memory={m} person={p} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No memories yet"
              description="A memory is a personal recollection. Be the first to write one down."
              action={
                <AddMemoryModal
                  familyId={family?.id || ""}
                  people={[p, ...rel.parents, ...rel.spouses, ...rel.siblings, ...rel.children]}
                  defaultPersonId={p.id}
                  trigger={<Button>Add the first memory</Button>}
                />
              }
            />
          )}
        </TabsContent>

        <TabsContent value="photos" className="mt-8">
          <div className="mb-6 flex justify-end">
            <UploadPhotoModal
              familyId={family?.id || ""}
              people={[p, ...rel.parents, ...rel.spouses, ...rel.siblings, ...rel.children]}
              defaultPersonId={p.id}
              trigger={
                <Button variant="outline" size="sm">
                  <ImagePlus /> Upload photograph
                </Button>
              }
            />
          </div>
          {photos.length ? (
            <PhotoGallery
              photos={photos}
              people={[p, ...rel.parents, ...rel.spouses, ...rel.siblings, ...rel.children]}
            />
          ) : (
            <EmptyState
              title="No photographs yet"
              description="Scans, prints and snapshots all belong here."
            />
          )}
        </TabsContent>

        <TabsContent value="family" className="mt-8 space-y-8">
          <RelationGroup title="Parents" people={rel.parents} />
          <RelationGroup title="Spouse" people={rel.spouses} />
          <RelationGroup title="Siblings" people={rel.siblings} />
          <RelationGroup title="Children" people={rel.children} />
          {!rel.parents.length &&
            !rel.spouses.length &&
            !rel.siblings.length &&
            !rel.children.length && (
              <EmptyState
                title="No confirmed relationships"
                description="Relationships appear once a family member confirms them."
              />
            )}
        </TabsContent>

        <TabsContent value="history" className="mt-8">
          <section className="rounded-lg border border-border bg-card p-6 sm:p-8">
            <h3 className="rule-gold mb-8 font-display text-2xl">Record history</h3>
            <EmptyState
              title="Record history is not available yet"
              description="The profile API currently provides the person's archive content, but not its audit history."
            />
          </section>
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}
