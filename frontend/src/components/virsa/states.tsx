import type { ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card/50 px-6 py-14 text-center",
        className,
      )}
    >
      {icon && <div className="mb-4 text-gold" aria-hidden>{icon}</div>}
      <h3 className="font-display text-xl text-foreground">{title}</h3>
      {description && (
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function LoadingState({ label = "Opening the archive" }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20" role="status" aria-live="polite">
      <span className="size-6 animate-spin rounded-full border border-border border-t-gold" aria-hidden />
      <p className="mt-4 text-xs uppercase tracking-[0.24em] text-muted-foreground">{label}</p>
    </div>
  );
}

export function CardSkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-lg border border-border bg-card p-5">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="mt-4 h-5 w-3/4" />
          <Skeleton className="mt-2 h-4 w-full" />
          <Skeleton className="mt-2 h-4 w-2/3" />
        </div>
      ))}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-6 py-10 text-center">
      <h3 className="font-display text-xl text-foreground">This part of the archive didn't open</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        {message ?? "Something went wrong while loading. Nothing has been lost."}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="focus-ring mt-5 rounded-md border border-border bg-card px-4 py-2 text-sm transition-colors hover:bg-accent"
        >
          Try again
        </button>
      )}
    </div>
  );
}
