import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Send, MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/virsa/app-shell";
import { PersonPortrait } from "@/components/virsa/person-portrait";
import { RoleBadge, StatusBadge } from "@/components/virsa/badges";
import { InviteMemberModal } from "@/components/virsa/modals";
import { ConfirmDialog } from "@/components/virsa/confirm-dialog";
import { CardSkeletonGrid } from "@/components/virsa/states";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { queries } from "@/data/api";
import { CURRENT_USER } from "@/data/mock";
import type { Member } from "@/data/types";

export const Route = createFileRoute("/app/members")({
  head: () => ({
    meta: [
      { title: "Members — VIRSA archive" },
      {
        name: "description",
        content:
          "Manage who can see and contribute to the family archive: owners, admins, members and viewers.",
      },
      { property: "og:title", content: "Members — VIRSA archive" },
      { property: "og:description", content: "Owners, admins, members and viewers." },
    ],
  }),
  component: MembersPage,
});

function MembersPage() {
  const members = useQuery(queries.members);
  const [removing, setRemoving] = useState<Member | null>(null);
  const canManage = CURRENT_USER.role === "owner";

  return (
    <AppShell
      title="Members"
      description="A user is not the same as a person in the archive"
      actions={
        canManage ? (
          <InviteMemberModal
            trigger={
              <Button size="sm">
                <Send /> <span className="hidden sm:inline">Invite member</span>
              </Button>
            }
          />
        ) : null
      }
    >
      {members.isLoading ? (
        <CardSkeletonGrid count={3} />
      ) : (
        <div className="overflow-hidden rounded-lg border border-border bg-card">
          <table className="w-full text-left text-sm">
            <caption className="sr-only">Family members and their roles</caption>
            <thead className="border-b border-border bg-parchment/50">
              <tr className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                <th scope="col" className="px-5 py-4 font-normal">Name</th>
                <th scope="col" className="px-5 py-4 font-normal">Role</th>
                <th scope="col" className="hidden px-5 py-4 font-normal sm:table-cell">Status</th>
                <th scope="col" className="hidden px-5 py-4 font-normal md:table-cell">Joined</th>
                <th scope="col" className="px-5 py-4 font-normal"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {(members.data ?? []).map((m) => (
                <tr key={m.id} className="transition-colors hover:bg-accent/30">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <PersonPortrait name={m.name} size="sm" />
                      <div className="min-w-0">
                        <p className="truncate font-display text-base">{m.name}</p>
                        <p className="truncate text-xs text-muted-foreground">{m.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <RoleBadge role={m.role} />
                  </td>
                  <td className="hidden px-5 py-4 sm:table-cell">
                    <StatusBadge status={m.status} />
                  </td>
                  <td className="hidden px-5 py-4 text-muted-foreground md:table-cell">
                    {m.joinedAt}
                  </td>
                  <td className="px-5 py-4 text-right">
                    {canManage && m.role !== "owner" ? (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" aria-label={`Manage ${m.name}`}>
                            <MoreHorizontal />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onSelect={() => toast.success(`${m.name} is now an admin`)}>
                            Make admin
                          </DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => toast.success(`${m.name} can now only view`)}>
                            Change to viewer
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onSelect={(e) => {
                              e.preventDefault();
                              setRemoving(m);
                            }}
                          >
                            Remove from family
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-6 max-w-2xl text-sm leading-relaxed text-muted-foreground">
        Removing a member takes away their access. Everything they contributed stays in the archive
        — the record survives members leaving.
      </p>

      <ConfirmDialog
        open={removing !== null}
        onOpenChange={(o) => !o && setRemoving(null)}
        title={`Remove ${removing?.name ?? ""}?`}
        description="They will lose access to this family archive. Their contributions and attributions remain in the record."
        confirmLabel="Remove member"
        destructive
        onConfirm={() => toast.success("Member removed")}
      />
    </AppShell>
  );
}
