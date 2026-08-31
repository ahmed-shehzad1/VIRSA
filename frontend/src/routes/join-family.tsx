import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import axios from "axios";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Users } from "lucide-react";
import { AuthLayout } from "@/components/virsa/auth-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { acceptInvitation } from "@/services/memberService";

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
  const queryClient = useQueryClient();
  const [token, setToken] = useState(() => {
    if (typeof window === "undefined") return "";
    return new URLSearchParams(window.location.search).get("token") || "";
  });
  const [state, setState] = useState<"idle" | "checking" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);

  const accept = async (e: React.FormEvent) => {
    e.preventDefault();
    const invitationToken = token.trim();
    if (!invitationToken) {
      setError("Enter the invitation token from your email.");
      return;
    }

    setState("checking");
    setError(null);
    setJoining(true);

    try {
      const familyId = await acceptInvitation(invitationToken);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["families"] }),
        queryClient.invalidateQueries({ queryKey: ["members", familyId] }),
        queryClient.invalidateQueries({ queryKey: ["invitations"] }),
      ]);
      setState("success");
      toast.success("You joined the family archive");
      navigate({ to: "/app" });
    } catch (err: unknown) {
      const response = axios.isAxiosError(err) ? err.response?.data : undefined;
      const code = response?.code;
      setState("error");
      setError(
        code === "INVITE_EXPIRED"
          ? "This invitation has expired. Ask a family admin to send a new one."
          : code === "INVITE_ALREADY_RESOLVED"
            ? "This invitation has already been used."
            : code === "EMAIL_MISMATCH"
              ? "Sign in with the email address that received this invitation."
              : code === "ALREADY_MEMBER"
                ? "You are already a member of this family."
                : code === "INVITE_NOT_FOUND"
                  ? "This invitation could not be found. Check the token and try again."
                  : response?.message || "Unable to accept this invitation. Please try again.",
      );
    } finally {
      setJoining(false);
    }
  };

  return (
    <AuthLayout
      title="Join a family"
      subtitle="Archives are private. You need an invitation code from an owner or admin of the family."
      aside={
        <div className="rounded-lg border border-border bg-card p-8 shadow-archive">
          {state === "success" ? (
            <div className="fade-up">
              <p className="text-[11px] uppercase tracking-[0.28em] text-gold">
                Invitation accepted
              </p>
              <h2 className="mt-4 font-display text-3xl leading-tight">Welcome to the archive</h2>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                Your membership is active. Opening the family archive...
              </p>
            </div>
          ) : (
            <div className="text-center">
              <Users className="mx-auto size-6 text-gold" aria-hidden />
              <p className="mt-4 font-display text-xl">Use your invitation link</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Paste the invitation token from the email sent by your family admin.
              </p>
            </div>
          )}
        </div>
      }
    >
      <form className="space-y-5" onSubmit={accept}>
        <div className="space-y-2">
          <Label htmlFor="token">Invitation token</Label>
          <Input
            id="token"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Paste your invitation token"
            className="font-mono tracking-widest"
            required
            disabled={joining}
          />
        </div>
        {(state === "error" || error) && (
          <p
            role="alert"
            className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
          >
            {error}
          </p>
        )}
        <Button type="submit" size="lg" className="w-full" disabled={joining}>
          {joining ? "Joining…" : "Accept invitation"}
        </Button>
      </form>
    </AuthLayout>
  );
}
