import { login } from "@/data/api";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AuthLayout } from "@/components/virsa/auth-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — VIRSA family archive" },
      { name: "description", content: "Sign in to your private VIRSA family archive." },
      { property: "og:title", content: "Sign in — VIRSA" },
      { property: "og:description", content: "Open your private family archive." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <AuthLayout
      title="Open your archive"
      subtitle="Sign in to continue preserving your family's record."
      footer={
        <>
          Don't have an account?{" "}
          <Link to="/register" className="text-primary underline-offset-4 hover:underline">
            Register
          </Link>
        </>
      }
      aside={
        <div className="rounded-lg border border-border bg-card p-8 shadow-archive">
          <p className="text-[11px] uppercase tracking-[0.28em] text-gold">Private by default</p>
          <p className="mt-5 font-display text-2xl leading-relaxed">
            “The platform does not decide what a family's history is. The family collectively
            preserves it.”
          </p>
        </div>
      }
    >
      <form
        className="space-y-5"
        noValidate
    onSubmit={async (e) => {
  e.preventDefault();

  const form = new FormData(e.currentTarget);
  const email = String(form.get("email") || "").trim();
  const password = String(form.get("password") || "");

  if (!email.includes("@")) {
    setError("Enter a valid email address.");
    return;
  }

  if (!password) {
    setError("Enter your password.");
    return;
  }

  setError(null);
  setLoading(true);

  try {
    await login(email, password);

    toast.success("Welcome back");
    navigate({ to: "/app" });
  } catch (err: any) {
    const message =
      err?.response?.data?.message ||
      "Invalid email or password.";

    setError(message);
  } finally {
    setLoading(false);
  }
}}
      >
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" autoComplete="email" placeholder="you@example.com" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" autoComplete="current-password" />
        </div>

        {error && (
          <p role="alert" className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2.5 text-sm text-muted-foreground">
            <Checkbox id="remember" /> Remember me
          </label>
          <button
            type="button"
            onClick={() => toast("Password reset link sent, if the account exists")}
            className="focus-ring rounded-sm text-sm text-primary underline-offset-4 hover:underline"
          >
            Forgot password?
          </button>
        </div>

        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? "Signing in…" : "Sign in"}
        </Button>
      </form>
    </AuthLayout>
  );
}
