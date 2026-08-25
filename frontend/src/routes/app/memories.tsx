import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { BookPlus } from "lucide-react";
import { AppShell } from "@/components/virsa/app-shell";
import { MemoryCard } from "@/components/virsa/memory-card";
import { AddMemoryModal } from "@/components/virsa/modals";
import { CardSkeletonGrid, EmptyState } from "@/components/virsa/states";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { queries } from "@/data/api";

export const Route = createFileRoute("/app/memories")({
  head: () => ({
    meta: [
      { title: "Memories — VIRSA archive" },
      {
        name: "description",
        content:
          "Personal recollections contributed by family members, each attributed to the person who remembered it.",
      },
      { property: "og:title", content: "Memories — VIRSA archive" },
      { property: "og:description", content: "Personal recollections, always attributed." },
    ],
  }),
  component: MemoriesPage,
});

function MemoriesPage() {
  const families = useQuery(queries.families);
  const familyId = families.data?.[0]?.id || "";
  const memories = useQuery(queries.memories);
  const people = useQuery(queries.people);
  const [q, setQ] = useState("");

  const filtered = (memories.data ?? []).filter(
    (m) =>
      m.title.toLowerCase().includes(q.toLowerCase()) ||
      m.body.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <AppShell
      title="Memories"
      description="A memory is one person's recollection — never the family's official record"
      actions={
        <AddMemoryModal
          familyId={familyId}
          people={people.data ?? []}
          trigger={
            <Button size="sm">
              <BookPlus /> <span className="hidden sm:inline">Add memory</span>
            </Button>
          }
        />
      }
    >
      <div className="mb-8 max-w-sm">
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search memories"
          aria-label="Search memories"
        />
      </div>

      {memories.isLoading ? (
        <CardSkeletonGrid count={4} />
      ) : filtered.length ? (
        <div className="grid gap-5 lg:grid-cols-2">
          {filtered.map((m) => (
            <MemoryCard
              key={m.id}
              memory={m}
              person={people.data?.find((p) => p.id === m.personId)}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title="Nothing matches that search"
          description="Try a name, a place, or a year."
        />
      )}
    </AppShell>
  );
}
