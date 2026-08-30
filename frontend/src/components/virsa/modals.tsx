import { useRef, useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";
import { Sparkles, Upload } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import type { Person } from "@/data/types";
import { createPerson } from "@/services/personService";
import { createMemory } from "@/services/memoryService";
import { uploadPhoto } from "@/services/photoService";
import { inviteMember } from "@/services/memberService";

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div className="space-y-2">
      <Label className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </Label>
      {children}
      {hint && <p className="text-xs leading-relaxed text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function AddPersonModal({ familyId, trigger }: { familyId: string; trigger: ReactNode }) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deceased, setDeceased] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const formElement = e.currentTarget;
    const form = new FormData(formElement);

    const fullName = String(form.get("fullName") || "").trim();
    const nameParts = fullName.split(/\s+/).filter(Boolean);
    const birthYear = String(form.get("birthYear") || "").trim();
    const deathYear = String(form.get("deathYear") || "").trim();

    if (!fullName || !nameParts[0]) {
      setError("Enter the person's full name.");
      return;
    }

    if (birthYear && !/^\d{4}$/.test(birthYear)) {
      setError("Birth year must be four digits.");
      return;
    }

    if (deceased && !/^\d{4}$/.test(deathYear)) {
      setError("Enter a four-digit year of death.");
      return;
    }

    setError(null);
    setSaving(true);

    try {
      await createPerson(familyId, {
        firstName: nameParts[0],
        ...(nameParts.length > 1 && {
          lastName: nameParts.slice(1).join(" "),
        }),
        ...(birthYear && { birthDate: `${birthYear}-01-01` }),
        birthPlace: String(form.get("birthPlace") || "").trim() || undefined,
        isLiving: !deceased,
        ...(deceased && { deathDate: `${deathYear}-01-01` }),
      });

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["people", familyId],
        }),
        queryClient.invalidateQueries({
          queryKey: ["tree", familyId],
        }),
      ]);

      formElement.reset();
      setDeceased(false);
      setOpen(false);

      toast.success("Person added", {
        description: "The new person is now part of the family archive.",
      });
    } catch (err: unknown) {
      const message = axios.isAxiosError(err) ? err.response?.data?.message : undefined;

      setError(message || "Unable to add this person. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>

      <DialogContent className="max-h-[90vh] overflow-y-auto border-border bg-card sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Add a person</DialogTitle>

          <DialogDescription>
            Every person gets a stable identity in this archive. Relationships you propose are
            confirmed by the family before they appear in the tree.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-5 py-2" onSubmit={handleSubmit}>
          <Field label="Full name">
            <Input name="fullName" required placeholder="e.g. Muhammad Ahmed Khan" />
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Birth year">
              <Input name="birthYear" inputMode="numeric" placeholder="1942" />
            </Field>

            <Field label="Birth place">
              <Input name="birthPlace" placeholder="Lahore" />
            </Field>
          </div>

          <label className="flex items-center gap-3 text-sm">
            <Checkbox checked={deceased} onCheckedChange={(v) => setDeceased(v === true)} />
            This person has passed away
          </label>

          {deceased && (
            <Field label="Year of death">
              <Input name="deathYear" inputMode="numeric" placeholder="2018" />
            </Field>
          )}

          {error && (
            <p
              role="alert"
              className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
            >
              {error}
            </p>
          )}

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>

            <Button type="submit" disabled={saving}>
              {saving ? "Adding…" : "Add person"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function AddMemoryModal({
  familyId,
  people,
  trigger,
  defaultPersonId,
}: {
  familyId: string;
  people: Person[];
  trigger: ReactNode;
  defaultPersonId?: string;
}) {
  const queryClient = useQueryClient();

  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [personId, setPersonId] = useState(defaultPersonId || "");
  const [visibility, setVisibility] = useState<"all_members" | "admins_only">("all_members");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const formElement = e.currentTarget;
    const form = new FormData(formElement);

    const title = String(form.get("title") || "").trim();
    const content = String(form.get("content") || "").trim();
    const memoryDate = String(form.get("memoryDate") || "").trim();

    if (!personId) {
      setError("Choose the person this memory is about.");
      return;
    }

    if (!title || title.length > 150) {
      setError("Title must be between 1 and 150 characters.");
      return;
    }

    if (!content || content.length > 10000) {
      setError("The memory must be between 1 and 10,000 characters.");
      return;
    }

    if (memoryDate && Number.isNaN(Date.parse(memoryDate))) {
      setError("Enter a valid memory date.");
      return;
    }

    setError(null);
    setSaving(true);

    try {
      await createMemory(familyId, personId, {
        title,
        content,
        ...(memoryDate && { memoryDate }),
        visibility,
      });

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["profile", familyId, personId],
        }),
        queryClient.invalidateQueries({
          queryKey: ["memories", familyId, personId],
        }),
      ]);

      formElement.reset();
      setPersonId(defaultPersonId || "");
      setVisibility("all_members");
      setOpen(false);

      toast.success("Memory added to the archive");
    } catch (err: unknown) {
      const message = axios.isAxiosError(err) ? err.response?.data?.message : undefined;

      setError(message || "Unable to add this memory. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>

      <DialogContent className="max-h-[90vh] overflow-y-auto border-border bg-card sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Add a memory</DialogTitle>

          <DialogDescription>
            A memory is your own recollection — not a factual record. It will always carry your
            name.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-5 py-2" onSubmit={handleSubmit}>
          <Field label="About">
            <Select value={personId} onValueChange={setPersonId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a person" />
              </SelectTrigger>

              <SelectContent>
                {people.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.fullName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field label="Title">
            <Input name="title" required placeholder="e.g. The 5:40 to Lahore" />
          </Field>

          <Field label="Date it happened">
            <Input name="memoryDate" type="date" />
          </Field>

          <Field label="The memory">
            <Textarea
              name="content"
              required
              rows={6}
              placeholder="Write it the way you remember it…"
            />
          </Field>

          <Field label="Visibility">
            <Select
              value={visibility}
              onValueChange={(value) => setVisibility(value as typeof visibility)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all_members">All family members</SelectItem>

                <SelectItem value="admins_only">Family admins only</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          {error && (
            <p
              role="alert"
              className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
            >
              {error}
            </p>
          )}

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>

            <Button type="submit" disabled={saving}>
              {saving ? "Saving…" : "Save memory"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function UploadPhotoModal({
  familyId,
  people,
  defaultPersonId,
  trigger,
}: {
  familyId: string;
  people: Person[];
  defaultPersonId?: string;
  trigger: ReactNode;
}) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [open, setOpen] = useState(false);
  const [personId, setPersonId] = useState(defaultPersonId || "");
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);

    if (nextOpen) {
      setPersonId(defaultPersonId || "");
      setFile(null);
      setError(null);
      setSaving(false);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = e.target.files?.[0];

    setError(null);

    if (!selectedFile) {
      setFile(null);
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];

    if (!allowedTypes.includes(selectedFile.type)) {
      setFile(null);
      e.target.value = "";
      setError("Choose a JPEG, PNG, WEBP, or GIF image.");
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setFile(null);
      e.target.value = "";
      setError("Photographs must be smaller than 10MB.");
      return;
    }

    setFile(selectedFile);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const formElement = e.currentTarget;
    const formData = new FormData(formElement);

    const caption = String(formData.get("caption") || "").trim();

    const takenDate = String(formData.get("takenDate") || "").trim();

    if (!personId) {
      setError("Choose the person this photograph is about.");
      return;
    }

    /*
     * IMPORTANT:
     * The selected File comes directly from React state.
     * This avoids relying on FormData to retrieve the
     * browser file input.
     */
    if (!file) {
      setError("Choose a photograph to upload.");
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];

    if (!allowedTypes.includes(file.type)) {
      setError("Choose a JPEG, PNG, WEBP, or GIF image.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("Photographs must be smaller than 10MB.");
      return;
    }

    if (takenDate && Number.isNaN(Date.parse(takenDate))) {
      setError("Enter a valid photograph date.");
      return;
    }

    setError(null);
    setSaving(true);

    try {
      await uploadPhoto(familyId, personId, file, caption, takenDate, "photo");

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["photos"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["profile", familyId, personId],
        }),

        queryClient.invalidateQueries({
          queryKey: ["media", familyId, personId],
        }),
      ]);

      formElement.reset();

      setPersonId(defaultPersonId || "");
      setFile(null);
      setError(null);
      setOpen(false);

      toast.success("Photograph uploaded", {
        description: "The photograph is now in the archive.",
      });
    } catch (err: unknown) {
      console.error("Photograph upload failed:", err);

      const message = axios.isAxiosError(err) ? err.response?.data?.message : undefined;

      setError(message || "Unable to upload this photograph. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>

      <DialogContent className="border-border bg-card sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Upload a photograph</DialogTitle>

          <DialogDescription>
            Photographs are reviewed by a family admin before they join the gallery.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-5 py-2" onSubmit={handleSubmit}>
          <div className="rounded-lg border border-dashed border-border bg-parchment/50 px-6 py-10 text-center">
            <p className="text-sm text-muted-foreground">
              {file ? file.name : "Choose a scan or photograph"}
            </p>

            <Button
              type="button"
              variant="outline"
              disabled={saving}
              onClick={() => fileInputRef.current?.click()}
              className="mx-auto mt-4"
            >
              <Upload />
              {file ? "Choose a different file" : "Select photograph"}
            </Button>

            <Input
              ref={fileInputRef}
              name="file"
              type="file"
              accept=".jpg,.jpeg,.png,.webp,.gif,image/jpeg,image/png,image/webp,image/gif"
              onChange={handleFileChange}
              disabled={saving}
              className="hidden"
            />

            <p className="mt-3 text-xs text-muted-foreground">
              JPEG, PNG, WEBP or GIF · Maximum 10MB
            </p>

            {file && <p className="mt-3 text-xs text-foreground">Selected: {file.name}</p>}
          </div>

          <Field label="About">
            <Select value={personId} onValueChange={setPersonId} disabled={saving}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a person" />
              </SelectTrigger>

              <SelectContent>
                {people.map((person) => (
                  <SelectItem key={person.id} value={person.id}>
                    {person.fullName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field label="Caption">
            <Input name="caption" placeholder="Describe this photograph..." disabled={saving} />
          </Field>

          <Field label="Date">
            <Input name="takenDate" type="date" disabled={saving} />
          </Field>

          {error && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              disabled={saving}
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>

            <Button type="submit" disabled={saving || !file || !personId}>
              {saving ? "Uploading..." : "Upload photograph"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function InviteMemberModal({ familyId, trigger }: { familyId: string; trigger: ReactNode }) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState<"admin" | "member" | "viewer">("member");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") || "").trim();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Enter a valid email address.");
      return;
    }

    setError(null);
    setSaving(true);

    try {
      await inviteMember(familyId, email, role);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["members", familyId] }),
        queryClient.invalidateQueries({ queryKey: ["invitations", familyId] }),
      ]);
      e.currentTarget.reset();
      setRole("member");
      setOpen(false);
      toast.success("Invitation sent", { description: `An invitation was sent to ${email}.` });
    } catch (err: unknown) {
      const message = axios.isAxiosError(err) ? err.response?.data?.message : undefined;
      setError(message || "Unable to send the invitation. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>

      <DialogContent className="border-border bg-card sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Invite a family member</DialogTitle>

          <DialogDescription>
            This family is private. People can only join with an invitation from an owner or admin.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-5 py-2" onSubmit={handleSubmit}>
          <Field label="Or invite by email">
            <Input
              name="email"
              type="email"
              placeholder="name@example.com"
              disabled={saving}
              required
            />
          </Field>

          <Field label="Role">
            <Select
              value={role}
              onValueChange={(value) => setRole(value as typeof role)}
              disabled={saving}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="admin">Admin — can moderate and confirm changes</SelectItem>

                <SelectItem value="member">Member — can contribute</SelectItem>

                <SelectItem value="viewer">Viewer — can read only</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          {error && (
            <p
              role="alert"
              className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
            >
              {error}
            </p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              disabled={saving}
              onClick={() => {
                setError(null);
                setOpen(false);
              }}
            >
              Cancel
            </Button>

            <Button type="submit" disabled={saving}>
              {saving ? "Sending..." : "Send invitation"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function AiStoryAssistant({ personName }: { personName: string }) {
  const [notes, setNotes] = useState(
    "Born Lahore 1942. Worked railway. Married 1965. Five children. Loved cricket.",
  );

  return (
    <section
      aria-labelledby="ai-assist-heading"
      className="rounded-lg border border-border bg-card p-6"
    >
      <header className="flex items-start gap-3">
        <Sparkles className="mt-0.5 size-4 text-gold" aria-hidden />

        <div>
          <h3 id="ai-assist-heading" className="font-display text-xl">
            Story notes
          </h3>

          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            AI-assisted drafting is not available in the current backend contract. Keep notes here,
            then propose a manual edit when the family is ready to write the story together.
          </p>
        </div>
      </header>

      <div className="mt-5 space-y-4">
        <Field label="Your notes">
          <Textarea
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            aria-label="Rough notes for the family story"
          />
        </Field>

        <Button variant="gold" disabled>
          Drafting unavailable
        </Button>

        <div className="rounded-md border border-dashed border-border bg-muted/20 p-4 text-sm text-muted-foreground">
          This archive does not currently support AI-generated story drafts. {personName} remains a
          person in the family record, and any life story must be written and reviewed by the family
          itself.
        </div>
      </div>
    </section>
  );
}
