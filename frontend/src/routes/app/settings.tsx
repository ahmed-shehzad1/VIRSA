import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/virsa/app-shell";
import { ConfirmDialog } from "@/components/virsa/confirm-dialog";
import { RoleBadge } from "@/components/virsa/badges";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CURRENT_USER, FAMILY, MEMBERS } from "@/data/mock";

export const Route = createFileRoute("/app/settings")({
  head: () => ({
    meta: [
      { title: "Settings — VIRSA archive" },
      {
        name: "description",
        content:
          "Family settings, your profile, privacy controls, ownership transfer and leaving the family.",
      },
      { property: "og:title", content: "Settings — VIRSA archive" },
      { property: "og:description", content: "Family, profile, privacy and ownership." },
    ],
  }),
  component: SettingsPage,
});

function Panel({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-border bg-card p-6 sm:p-8">
      <h2 className="font-display text-2xl">{title}</h2>
      {description && (
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      )}
      <div className="mt-6 space-y-5">{children}</div>
    </section>
  );
}

function SettingsPage() {
  const [confirm, setConfirm] = useState<null | "transfer" | "leave">(null);

  return (
    <AppShell title="Settings" description="Family, profile, privacy and ownership">
      <Tabs defaultValue="family">
        <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 bg-transparent p-0">
          {[
            ["family", "Family"],
            ["profile", "Profile"],
            ["privacy", "Privacy"],
            ["members", "Members"],
            ["ownership", "Ownership"],
          ].map(([v, l]) => (
            <TabsTrigger
              key={v}
              value={v as string}
              className="rounded-full border border-border bg-card px-4 py-2 text-xs uppercase tracking-[0.14em] data-[state=active]:border-gold/60 data-[state=active]:bg-gold/15"
            >
              {l}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="family" className="mt-8">
          <Panel
            title="Family settings"
            description="The family's public-facing identity inside the archive. Family names do not uniquely identify a family — the lineage does."
          >
            <div className="space-y-2">
              <Label htmlFor="fname">Family display name</Label>
              <Input id="fname" defaultValue={FAMILY.name} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="anc">Oldest known ancestor</Label>
              <Input id="anc" defaultValue={FAMILY.oldestKnownAncestor} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="desc">Description</Label>
              <Textarea id="desc" rows={4} defaultValue={FAMILY.description} />
            </div>
            <Button onClick={() => toast.success("Family settings saved")}>Save changes</Button>
          </Panel>
        </TabsContent>

        <TabsContent value="profile" className="mt-8">
          <Panel
            title="Your profile"
            description="This is your account. It is not the same thing as your person record in the family tree."
          >
            <div className="space-y-2">
              <Label htmlFor="pname">Full name</Label>
              <Input id="pname" defaultValue={CURRENT_USER.name} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pemail">Email</Label>
              <Input id="pemail" type="email" defaultValue={CURRENT_USER.email} />
            </div>
            <div className="space-y-2">
              <Label>Linked person in the archive</Label>
              <p className="text-sm">
                <Link
                  to="/app/people/$personId"
                  params={{ personId: CURRENT_USER.linkedPersonId }}
                  className="text-primary underline-offset-4 hover:underline"
                >
                  Imran Ahmed Khan
                </Link>
              </p>
            </div>
            <Button onClick={() => toast.success("Profile updated")}>Save profile</Button>
          </Panel>
        </TabsContent>

        <TabsContent value="privacy" className="mt-8">
          <Panel
            title="Privacy"
            description="Families are private by default. VIRSA never indexes an archive and never merges family trees automatically."
          >
            {[
              ["Private archive", "Only invited members can open this archive. This cannot be disabled.", true, true],
              ["Require confirmation for new relationships", "A proposed parent, child or spouse link needs a second family member to confirm it.", true, false],
              ["Moderate contributed photographs", "New uploads wait for an admin before appearing in the gallery.", true, false],
              ["Allow members to invite others", "Members, not just admins, may share the invitation code.", false, false],
            ].map(([label, desc, on, locked]) => (
              <div key={label as string} className="flex items-start justify-between gap-6 border-t border-border pt-5 first:border-0 first:pt-0">
                <div>
                  <p className="text-[15px]">{label}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
                </div>
                <Switch defaultChecked={on as boolean} disabled={locked as boolean} aria-label={label as string} />
              </div>
            ))}
          </Panel>
        </TabsContent>

        <TabsContent value="members" className="mt-8">
          <Panel
            title="Members"
            description="Roles decide who can contribute and who can decide. Full management lives on the members page."
          >
            <ul className="divide-y divide-border">
              {MEMBERS.map((m) => (
                <li key={m.id} className="flex items-center justify-between gap-4 py-3">
                  <span className="text-[15px]">{m.name}</span>
                  <RoleBadge role={m.role} />
                </li>
              ))}
            </ul>
            <Button asChild variant="outline">
              <Link to="/app/members">Manage members</Link>
            </Button>
          </Panel>
        </TabsContent>

        <TabsContent value="ownership" className="mt-8 space-y-8">
          <Panel
            title="Transfer ownership"
            description="The creator of a family is its owner, not necessarily its historical root. Ownership can pass to another member at any time."
          >
            <div className="space-y-2">
              <Label>New owner</Label>
              <Select>
                <SelectTrigger className="max-w-sm">
                  <SelectValue placeholder="Choose a member" />
                </SelectTrigger>
                <SelectContent>
                  {MEMBERS.filter((m) => m.role !== "owner").map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" onClick={() => setConfirm("transfer")}>
              Transfer ownership
            </Button>
          </Panel>

          <Panel
            title="Leave this family"
            description="The archive should survive members leaving. Everything you contributed stays, still attributed to you."
          >
            <Button variant="destructive" onClick={() => setConfirm("leave")}>
              Leave family
            </Button>
          </Panel>
        </TabsContent>
      </Tabs>

      <ConfirmDialog
        open={confirm !== null}
        onOpenChange={(o) => !o && setConfirm(null)}
        title={confirm === "transfer" ? "Transfer ownership of this archive?" : "Leave this family?"}
        description={
          confirm === "transfer"
            ? "You will become an admin. The new owner takes responsibility for members, moderation and the archive itself."
            : "You will lose access to this archive. Your contributions remain in the record, attributed to you."
        }
        confirmLabel={confirm === "transfer" ? "Transfer ownership" : "Leave family"}
        destructive={confirm === "leave"}
        onConfirm={() =>
          toast.success(confirm === "transfer" ? "Ownership transferred" : "You have left the family")
        }
      />
    </AppShell>
  );
}
