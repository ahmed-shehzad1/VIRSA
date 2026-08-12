import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Logo } from "./logo";

/** Quiet, centred layout used by the auth and onboarding screens. */
export function AuthLayout({
  title,
  subtitle,
  children,
  aside,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  aside?: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="min-h-dvh paper">
      <header className="flex items-center justify-between px-6 py-6 sm:px-10">
        <Logo />
        <Link
          to="/"
          className="focus-ring rounded-sm text-xs uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground"
        >
          Back
        </Link>
      </header>

      <main className="mx-auto grid w-full max-w-5xl gap-10 px-6 pb-24 pt-8 sm:px-10 lg:grid-cols-[1fr_1fr] lg:items-start lg:gap-16">
        <section className="fade-up mx-auto w-full max-w-md lg:mx-0">
          <h1 className="rule-gold text-3xl leading-tight sm:text-4xl">{title}</h1>
          {subtitle && (
            <p className="mt-5 text-[15px] leading-relaxed text-muted-foreground">{subtitle}</p>
          )}
          <div className="mt-8">{children}</div>
          {footer && <div className="mt-8 text-sm text-muted-foreground">{footer}</div>}
        </section>
        {aside && (
          <aside className="fade-up order-first lg:order-last lg:pt-4" style={{ animationDelay: "120ms" }}>
            {aside}
          </aside>
        )}
      </main>
    </div>
  );
}
