import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
import { queries } from "@/data/api";
import { getCurrentUser } from "@/services/authService";
import apiClient from "@/services/apiClient";

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
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [confirm, setConfirm] = useState<null | "transfer" | "leave">(null);
  const [selectedOwnerId, setSelectedOwnerId] = useState("");
  const [familyForm, setFamilyForm] = useState({ name: "", description: "" });
  const [profileForm, setProfileForm] = useState({ fullName: "", email: "" });
  const [privacySettings, setPrivacySettings] = useState({
    isPrivate: true,
    allowMemberInvites: false,
  });

  const currentUser = useQuery({
    queryKey: ["currentUser"],
    queryFn: getCurrentUser,
  });

  const families = useQuery(queries.families);
  const familyId = families.data?.[0]?.id || "";
  const family = useQuery({ ...queries.family(familyId), enabled: !!familyId });
  const members = useQuery({ ...queries.members(familyId), enabled: !!familyId });

  const activeFamily = family.data?.family ?? null;
  const myRole = family.data?.myRole;
  const canManageFamily = myRole === "owner" || myRole === "admin";

  useEffect(() => {
    if (currentUser.data?.user) {
      const user = currentUser.data.user;
      setProfileForm({
        fullName: user.full_name || "",
        email: user.email || "",
      });
    }
  }, [currentUser.data]);

  useEffect(() => {
    if (activeFamily) {
      setFamilyForm({
        name: activeFamily.name || "",
        description: activeFamily.description || "",
      });
      setPrivacySettings({
        isPrivate: activeFamily.is_private ?? true,
        allowMemberInvites: activeFamily.allow_member_invites ?? false,
      });
    }
  }, [activeFamily]);

  useEffect(() => {
    if (members.data && members.data.length > 0) {
      const firstTransferCandidate = members.data.find((member) => member.role !== "owner")?.userId;
      if (!selectedOwnerId && firstTransferCandidate) {
        setSelectedOwnerId(firstTransferCandidate);
      }
    }
  }, [members.data, selectedOwnerId]);

  const eligibleOwners = useMemo(
    () => (members.data ?? []).filter((member) => member.role !== "owner"),
    [members.data],
  );

  async function saveProfile() {
    if (!profileForm.fullName.trim() || !profileForm.email.trim()) {
      toast.error("Please enter your full name and email.");
      return;
    }

    try {
      await apiClient.patch("/api/users/me", {
        fullName: profileForm.fullName.trim(),
        email: profileForm.email.trim(),
      });

      await queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      toast.success("Profile updated");
    } catch (err: unknown) {
      const message = axios.isAxiosError(err) ? err.response?.data?.message : undefined;
      toast.error(message || "Unable to update your profile.");
    }
  }

  async function saveFamily() {
    if (!familyId) return;

    try {
      await apiClient.patch(`/api/families/${familyId}`, {
        name: familyForm.name.trim(),
        description: familyForm.description.trim(),
      });

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["families"] }),
        queryClient.invalidateQueries({ queryKey: ["family", familyId] }),
      ]);
      toast.success("Family settings saved");
    } catch (err: unknown) {
      const message = axios.isAxiosError(err) ? err.response?.data?.message : undefined;
      toast.error(message || "Unable to save the family settings.");
    }
  }

  async function savePrivacy() {
    if (!familyId) return;

    try {
      await apiClient.patch(`/api/families/${familyId}/privacy`, {
        isPrivate: privacySettings.isPrivate,
        allowMemberInvites: privacySettings.allowMemberInvites,
      });

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["families"] }),
        queryClient.invalidateQueries({ queryKey: ["family", familyId] }),
      ]);
      toast.success("Privacy settings updated");
    } catch (err: unknown) {
      const message = axios.isAxiosError(err) ? err.response?.data?.message : undefined;
      toast.error(message || "Unable to update privacy settings.");
    }
  }

  async function transferOwnership() {
    if (!familyId || !selectedOwnerId) {
      toast.error("Choose a member to transfer ownership to.");
      return;
    }

    try {
      await apiClient.post(
        `/api/families/${familyId}/members/${selectedOwnerId}/transfer-ownership`,
      );
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["families"] }),
        queryClient.invalidateQueries({ queryKey: ["family", familyId] }),
        queryClient.invalidateQueries({ queryKey: ["members", familyId] }),
      ]);
      setConfirm(null);
      toast.success("Ownership transferred");
    } catch (err: unknown) {
      const message = axios.isAxiosError(err) ? err.response?.data?.message : undefined;
      toast.error(message || "Unable to transfer ownership.");
    }
  }

  async function leaveFamily() {
    if (!familyId) return;

    try {
      await apiClient.post(`/api/families/${familyId}/leave`);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["families"] }),
        queryClient.invalidateQueries({ queryKey: ["family", familyId] }),
        queryClient.invalidateQueries({ queryKey: ["members", familyId] }),
      ]);
      setConfirm(null);
      toast.success("You have left the family");
      navigate({ to: "/" });
    } catch (err: unknown) {
      const message = axios.isAxiosError(err) ? err.response?.data?.message : undefined;
      toast.error(message || "Unable to leave this family.");
    }
  }

  const profileLoading = currentUser.isLoading;
  const familyLoading = families.isLoading || family.isLoading;

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
            {familyLoading ? (
              <p className="text-sm text-muted-foreground">Loading family information…</p>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="fname">Family display name</Label>
                  <Input
                    id="fname"
                    value={familyForm.name}
                    onChange={(e) => setFamilyForm((prev) => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="desc">Description</Label>
                  <Textarea
                    id="desc"
                    rows={4}
                    value={familyForm.description}
                    onChange={(e) =>
                      setFamilyForm((prev) => ({ ...prev, description: e.target.value }))
                    }
                  />
                </div>
                <Button onClick={() => void saveFamily()} disabled={!familyId}>
                  Save changes
                </Button>
              </>
            )}
          </Panel>
        </TabsContent>

        <TabsContent value="profile" className="mt-8">
          <Panel
            title="Your profile"
            description="This is your account. It is not the same thing as your person record in the family tree."
          >
            {profileLoading ? (
              <p className="text-sm text-muted-foreground">Loading profile…</p>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="pname">Full name</Label>
                  <Input
                    id="pname"
                    value={profileForm.fullName}
                    onChange={(e) =>
                      setProfileForm((prev) => ({ ...prev, fullName: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pemail">Email</Label>
                  <Input
                    id="pemail"
                    type="email"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm((prev) => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Linked person in the archive</Label>
                  <p className="text-sm text-muted-foreground">
                    Linked person data is not available from the current account API contract. This
                    association is managed by the family archive and remains backend-dependent.
                  </p>
                </div>
                <Button onClick={() => void saveProfile()}>Save profile</Button>
              </>
            )}
          </Panel>
        </TabsContent>

        <TabsContent value="privacy" className="mt-8">
          <Panel
            title="Privacy"
            description="Families are private by default. VIRSA never indexes an archive and never merges family trees automatically."
          >
            <div className="space-y-5">
              <div className="flex items-start justify-between gap-6 border-t border-border pt-5 first:border-0 first:pt-0">
                <div>
                  <p className="text-[15px]">Private archive</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Only invited members can open this archive.
                  </p>
                </div>
                <Switch
                  checked={privacySettings.isPrivate}
                  onCheckedChange={(checked) =>
                    setPrivacySettings((prev) => ({ ...prev, isPrivate: checked === true }))
                  }
                  aria-label="Private archive"
                />
              </div>

              <div className="flex items-start justify-between gap-6 border-t border-border pt-5 first:border-0 first:pt-0">
                <div>
                  <p className="text-[15px]">Allow members to invite others</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Members may send invitations when this is enabled.
                  </p>
                </div>
                <Switch
                  checked={privacySettings.allowMemberInvites}
                  onCheckedChange={(checked) =>
                    setPrivacySettings((prev) => ({
                      ...prev,
                      allowMemberInvites: checked === true,
                    }))
                  }
                  aria-label="Allow members to invite others"
                />
              </div>

              <Button onClick={() => void savePrivacy()} disabled={!familyId}>
                Save privacy
              </Button>
            </div>
          </Panel>
        </TabsContent>

        <TabsContent value="members" className="mt-8">
          <Panel
            title="Members"
            description="Roles decide who can contribute and who can decide. Full management lives on the members page."
          >
            {members.isLoading ? (
              <p className="text-sm text-muted-foreground">Loading members…</p>
            ) : members.isError ? (
              <p className="text-sm text-destructive">
                Unable to load members from the backend right now.
              </p>
            ) : !members.data?.length ? (
              <p className="text-sm text-muted-foreground">
                No family members are currently available.
              </p>
            ) : (
              <ul className="divide-y divide-border">
                {members.data.map((member) => (
                  <li key={member.id} className="flex items-center justify-between gap-4 py-3">
                    <span className="text-[15px]">{member.name}</span>
                    <RoleBadge role={member.role} />
                  </li>
                ))}
              </ul>
            )}
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
              <Select value={selectedOwnerId} onValueChange={setSelectedOwnerId}>
                <SelectTrigger className="max-w-sm">
                  <SelectValue placeholder="Choose a member" />
                </SelectTrigger>
                <SelectContent>
                  {eligibleOwners.map((member) => (
                    <SelectItem key={member.id} value={member.userId}>
                      {member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              variant="outline"
              onClick={() => void transferOwnership()}
              disabled={!selectedOwnerId || !canManageFamily || myRole !== "owner"}
            >
              Transfer ownership
            </Button>
          </Panel>

          <Panel
            title="Leave this family"
            description="The archive should survive members leaving. Everything you contributed stays, still attributed to you."
          >
            <Button
              variant="destructive"
              onClick={() => setConfirm("leave")}
              disabled={myRole === "owner"}
            >
              Leave family
            </Button>
          </Panel>
        </TabsContent>
      </Tabs>

      <ConfirmDialog
        open={confirm !== null}
        onOpenChange={(o) => !o && setConfirm(null)}
        title={
          confirm === "transfer" ? "Transfer ownership of this archive?" : "Leave this family?"
        }
        description={
          confirm === "transfer"
            ? "You will become an admin. The new owner takes responsibility for members, moderation and the archive itself."
            : "You will lose access to this archive. Your contributions remain in the record, attributed to you."
        }
        confirmLabel={confirm === "transfer" ? "Transfer ownership" : "Leave family"}
        destructive={confirm === "leave"}
        onConfirm={() => {
          if (confirm === "transfer") {
            void transferOwnership();
            return;
          }
          void leaveFamily();
        }}
      />
    </AppShell>
  );
}
