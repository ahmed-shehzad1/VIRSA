import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Lock, Users } from "lucide-react";
import { AuthLayout } from "@/components/virsa/auth-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FAMILY, MEMBERS, PEOPLE } from "@/data/mock";

export const Route = createFileRoute("/join-family")({
  head: () => ({
    meta: [
      { title: "Join a family — VIRSA" },
      {
        name: "description",
        content: "Enter an invitation code to join a private family archive on VIRSA.",
      },
      { property: "og:title", content: "Join a family — VIRSA" },
      { property: "og:description", content: "Invitation only. Nothing is public." },
    ],
  }),
  component: JoinFamilyPage,
});

function JoinFamilyPage() {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [state, setState] = useState<"idle" | "checking" | "found" | "notfound">("idle");
  const [joining, setJoining] = useState(false);

  const lookup = (e: React.FormEvent) => {
    e.preventDefault();
    setState("checking");
    setTimeout(() => {
      setState(code.trim().toUpperCase() === FAMILY.invitationCode ? "found" : "notfound");
    }, 700);
  };

  return (
    <AuthLayout
      title="Join a family"
      subtitle="Archives are private. You need an invitation code from an owner or admin of the family."
      aside={
        <div className="rounded-lg border border-border bg-card p-8 shadow-archive">
          {state === "found" ? (
            <div className="fade-up">
              <p className="text-[11px] uppercase tracking-[0.28em] text-gold">Family found</p>
              <h2 className="mt-4 font-display text-3xl leading-tight">{FAMILY.name}</h2>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                {FAMILY.description}
              </p>
              <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-border pt-5 text-sm">
                <div>
                  <dt className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                    People recorded
                  </dt>
                  <dd className="mt-1 font-display text-2xl">{PEOPLE.length}</dd>
                </div>
                <div>
                  <dt className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                    Members
                  </dt>
                  <dd className="mt-1 font-display text-2xl">{MEMBERS.length}</dd>
                </div>
              </dl>
              <Button
                className="mt-7 w-full"
                size="lg"
                disabled={joining}
                onClick={() => {
                  setJoining(true);
                  setTimeout(() => {
                    toast.success("Request sent — a family admin will confirm you");
                    navigate({ to: "/app" });
                  }, 800);
                }}
              >
                {joining ? "Requesting…" : "Request to join this family"}
              </Button>
              <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                Family connections require human confirmation. Nothing merges automatically.
              </p>
            </div>
          ) : (
            <div className="text-center">
              <Users className="mx-auto size-6 text-gold" aria-hidden />
              <p className="mt-4 font-display text-xl">No family loaded yet</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Enter an invitation code and we'll show you a preview of the family before you join.
              </p>
              <p className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <Lock className="size-3.5" aria-hidden /> Try VIRSA-KHAN-4821
              </p>
            </div>
          )}
        </div>
      }
    >
      <form className="space-y-5" onSubmit={lookup}>
        <div className="space-y-2">
          <Label htmlFor="code">Invitation code</Label>
          <Input
            id="code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="VIRSA-XXXX-0000"
            className="font-mono tracking-widest"
            required
          />
        </div>
        {state === "notfound" && (
          <p role="alert" className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
            No family matches that code. Codes are case-insensitive and expire after 30 days.
          </p>
        )}
        <Button type="submit" size="lg" className="w-full" disabled={state === "checking"}>
          {state === "checking" ? "Looking up…" : "Find family"}
        </Button>
      </form>
    </AuthLayout>
  );
}
