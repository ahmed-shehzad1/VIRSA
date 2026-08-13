import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export function Logo({
  className,
  compact = false,
  to = "/",
}: {
  className?: string;
  compact?: boolean;
  to?: string;
}) {
  return (
    <Link
      to={to}
      className={cn(
        "group inline-flex items-center gap-2.5 focus-ring rounded-sm",
        className,
      )}
      aria-label="VIRSA — home"
    >
      <span
        aria-hidden
        className="grid size-8 place-items-center rounded-full border border-gold/60 text-gold transition-colors group-hover:border-gold"
      >
        <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.2">
          <path d="M12 21V9M12 9 6 4M12 9l6-5M6 21v-6M18 21v-6" strokeLinecap="round" />
          <circle cx="12" cy="7.5" r="1.4" fill="currentColor" stroke="none" />
        </svg>
      </span>
      <span className="font-display text-xl tracking-[0.32em] text-foreground">VIRSA</span>
      {!compact && (
        <span className="hidden text-[10px] uppercase tracking-[0.28em] text-muted-foreground sm:inline">
          Family Archive
        </span>
      )}
    </Link>
  );
}
