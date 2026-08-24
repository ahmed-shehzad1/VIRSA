import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { UserPlus } from "lucide-react";
import { AppShell } from "@/components/virsa/app-shell";
import { FamilyTree } from "@/components/virsa/family-tree";
import { LoadingState } from "@/components/virsa/states";
import { AddPersonModal } from "@/components/virsa/modals";
import { Button } from "@/components/ui/button";
import { queries } from "@/data/api";

export const Route = createFileRoute("/app/tree")({
  head: () => ({
    meta: [
      { title: "Family tree — VIRSA archive" },
      {
        name: "description",
        content:
          "An interactive family tree showing parents, children, spouses and siblings across four generations.",
      },
      { property: "og:title", content: "Family tree — VIRSA archive" },
      { property: "og:description", content: "Four generations, drawn as a family remembers." },
    ],
  }),
  component: TreePage,
});

function TreePage() {
  const navigate = useNavigate();
  const families = useQuery(queries.families);
  const family = families.data?.[0];
  const tree = useQuery({ ...queries.tree(family?.id || ""), enabled: !!family?.id });

  return (
    <AppShell
      title="Family tree"
      description="Drag to pan, scroll to zoom, click a person to open their record"
      actions={
        <AddPersonModal
          familyId={family?.id || ""}
          trigger={
            <Button size="sm">
              <UserPlus /> <span className="hidden sm:inline">Add person</span>
            </Button>
          }
        />
      }
    >
      {families.isLoading || tree.isLoading ? (
        <LoadingState label="Drawing the tree" />
      ) : (
        <>
          <FamilyTree
            people={tree.data?.people ?? []}
            onSelect={(p) => navigate({ to: "/app/people/$personId", params: { personId: p.id } })}
          />
          <ul className="mt-6 flex flex-wrap gap-6 text-xs text-muted-foreground">
            <li className="flex items-center gap-2">
              <span aria-hidden className="h-px w-6 bg-border" /> Parent and child
            </li>
            <li className="flex items-center gap-2">
              <span aria-hidden className="h-px w-6 border-t border-dashed border-gold" /> Marriage
            </li>
            <li className="flex items-center gap-2">
              <span aria-hidden className="size-1.5 rounded-full bg-gold" /> Deceased
            </li>
          </ul>
        </>
      )}
    </AppShell>
  );
}
