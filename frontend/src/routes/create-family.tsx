import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AuthLayout } from "@/components/virsa/auth-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createFamily } from "@/services/familyService";

export const Route = createFileRoute("/create-family")({
  head: () => ({
    meta: [
      { title: "Create your family — VIRSA" },
      {
        name: "description",
        content:
          "Create a private family archive on VIRSA. A family is identified by its lineage, not by the person who created the account.",
      },
      { property: "og:title", content: "Create your family — VIRSA" },
      { property: "og:description", content: "A family is defined by its lineage." },
    ],
  }),
  component: CreateFamilyPage,
});

function CreateFamilyPage() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [ancestor, setAncestor] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!name.trim()) {
      setError("Please enter a family name.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      await createFamily(name.trim(), description.trim(), true);

      toast.success("Family archive created");

      navigate({ to: "/app" });
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;

      setError(message || "Unable to create the family archive. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Create your family"
      subtitle="This creates a private archive that only invited relatives can open."
      aside={
        <div className="rounded-lg border border-border bg-card p-8 shadow-archive">
          <p className="text-[11px] uppercase tracking-[0.28em] text-gold">Preview</p>

          <p className="mt-5 font-display text-3xl leading-tight">{name || "Your family name"}</p>

          <p className="mt-3 text-xs uppercase tracking-[0.18em] text-muted-foreground">
            Oldest known ancestor
          </p>

          <p className="mt-1 text-[15px]">{ancestor || "Not yet recorded"}</p>

          <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
            {description || "A short description of who this family is and where it comes from."}
          </p>

          <div className="mt-7 border-t border-border pt-5">
            <p className="text-sm leading-relaxed text-muted-foreground">
              Family names do not uniquely identify a family. This archive is identified by its
              lineage — beginning with the oldest ancestor you know of — and not by you as its
              creator. You will be its <span className="text-foreground">owner</span>, which is an
              administrative role, not a historical one.
            </p>
          </div>
        </div>
      }
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <Label htmlFor="fname">Family display name</Label>

          <Input
            id="fname"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="The Khan Family of Lahore"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="ancestor">Oldest known ancestor</Label>

          <Input
            id="ancestor"
            value={ancestor}
            onChange={(e) => setAncestor(e.target.value)}
            placeholder="Sultan Muhammad Khan (1912–1979)"
          />

          <p className="text-xs text-muted-foreground">
            This anchors the family's identity. It can be corrected later by the family.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="desc">Description</Label>

          <Textarea
            id="desc"
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Who this family is, and where it comes from."
          />
        </div>

        {error && (
          <p
            role="alert"
            className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
          >
            {error}
          </p>
        )}

        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? "Creating archive…" : "Create family archive"}
        </Button>
      </form>
    </AuthLayout>
  );
}
