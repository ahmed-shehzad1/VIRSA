import { cn } from "@/lib/utils";
import type { MemberRole, MemberStatus, ModerationStatus } from "@/data/types";

const roleStyles: Record<MemberRole, string> = {
  owner: "border-gold/60 bg-gold/12 text-gold-foreground",
  admin: "border-primary/40 bg-primary/8 text-primary",
  member: "border-border bg-muted text-muted-foreground",
  viewer: "border-border bg-transparent text-muted-foreground",
};

export function RoleBadge({ role, className }: { role: MemberRole; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] uppercase tracking-[0.18em]",
        roleStyles[role],
        className,
      )}
    >
      {role}
    </span>
  );
}

export function StatusBadge({
  status,
  className,
}: {
  status: MemberStatus | ModerationStatus;
  className?: string;
}) {
  const map: Record<string, string> = {
    active: "border-primary/40 text-primary",
    approved: "border-primary/40 text-primary",
    invited: "border-gold/50 text-gold-foreground",
    pending: "border-gold/50 text-gold-foreground",
    flagged: "border-destructive/40 text-destructive",
    left: "border-border text-muted-foreground",
  };
  const label: Record<string, string> = {
    approved: "Approved",
    pending: "Awaiting review",
    flagged: "Reported",
    active: "Active",
    invited: "Invited",
    left: "Left family",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] uppercase tracking-[0.16em]",
        map[status],
        className,
      )}
    >
      {label[status] ?? status}
    </span>
  );
}

export function InMemoryBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-gold/50 bg-gold/10 px-2.5 py-0.5 text-[10px] uppercase tracking-[0.2em] text-gold-foreground",
        className,
      )}
    >
      <span aria-hidden className="size-1 rounded-full bg-gold" />
      In memory
    </span>
  );
}
