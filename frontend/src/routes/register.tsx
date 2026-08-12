import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AuthLayout } from "@/components/virsa/auth-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Create an account — VIRSA" },
      {
        name: "description",
        content: "Create a VIRSA account to start or join a private family archive.",
      },
      { property: "og:title", content: "Create an account — VIRSA" },
      { property: "og:description", content: "Start preserving your family's history." },
    ],
  }),
  component: RegisterPage,
});

function RegisterPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <AuthLayout
      title="Create your account"
      subtitle="An account is you — a person in the archive is someone the family records. They are not the same thing."
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="text-primary underline-offset-4 hover:underline">
            Sign in
          </Link>
        </>
      }
      aside={
        <div className="rounded-lg border border-border bg-card p-8 shadow-archive">
          <p className="text-[11px] uppercase tracking-[0.28em] text-gold">What happens next</p>
          <ol className="mt-6 space-y-4 text-sm text-muted-foreground">
            <li>
              <span className="font-display text-lg text-foreground">01</span> — Create your account
            </li>
            <li>
              <span className="font-display text-lg text-foreground">02</span> — Create a family, or
              join one with an invitation code
            </li>
            <li>
              <span className="font-display text-lg text-foreground">03</span> — Begin with one
              person and one date
            </li>
          </ol>
        </div>
      }
    >
      <form
        className="space-y-5"
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          if (f.get("password") !== f.get("confirm")) {
            setError("The two passwords don't match.");
            return;
          }
          setError(null);
          setLoading(true);
          setTimeout(() => {
            setLoading(false);
            toast.success("Account created");
            navigate({ to: "/create-family" });
          }, 800);
        }}
      >
        <div className="space-y-2">
          <Label htmlFor="name">Full name</Label>
          <Input id="name" name="name" autoComplete="name" placeholder="Sara Khan Malik" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" autoComplete="email" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" autoComplete="new-password" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm">Confirm password</Label>
          <Input id="confirm" name="confirm" type="password" autoComplete="new-password" required />
        </div>

        {error && (
          <p role="alert" className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}

        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? "Creating account…" : "Create account"}
        </Button>
      </form>
    </AuthLayout>
  );
}
