import { useState } from "react";
import { Check, X, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import type { ChangeRequest, HistoryEntry } from "@/data/types";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "./confirm-dialog";
import { cn } from "@/lib/utils";

export function ChangeRequestCard({
  request,
  className,
}: {
  request: ChangeRequest;
  className?: string;
}) {
  const [confirm, setConfirm] = useState<null | "accept" | "reject">(null);
  const resolved = request.status !== "open";

  return (
    <article
      className={cn(
        "rounded-lg border border-border bg-card p-6",
        resolved && "opacity-70",
        className,
      )}
    >
      <header className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="font-display text-xl">{request.personName}</h3>
        <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          {request.field}
        </p>
      </header>

      <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
        <div className="rounded-md border border-border bg-parchment/60 p-4">
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Current value
          </p>
          <p className="mt-1.5 font-display text-lg">{request.currentValue}</p>
        </div>
        <ArrowRight className="mx-auto size-4 rotate-90 text-gold sm:rotate-0" aria-hidden />
        <div className="rounded-md border border-gold/50 bg-gold/10 p-4">
          <p className="text-[10px] uppercase tracking-[0.2em] text-gold-foreground">
            Suggested value
          </p>
          <p className="mt-1.5 font-display text-lg">{request.suggestedValue}</p>
        </div>
      </div>

      {request.reason && (
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">“{request.reason}”</p>
      )}

      <footer className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
        <p className="text-xs text-muted-foreground">
          Suggested by <span className="text-foreground">{request.suggestedBy}</span>
          <span className="mx-2 text-border">·</span>
          {request.createdAt}
        </p>
        {resolved ? (
          <span className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            {request.status}
          </span>
        ) : (
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => setConfirm("reject")}>
              <X /> Reject
            </Button>
            <Button size="sm" onClick={() => setConfirm("accept")}>
              <Check /> Accept
            </Button>
          </div>
        )}
      </footer>

      <ConfirmDialog
        open={confirm !== null}
        onOpenChange={(o) => !o && setConfirm(null)}
        title={confirm === "accept" ? "Accept this correction?" : "Reject this suggestion?"}
        description={
          confirm === "accept"
            ? `“${request.field}” for ${request.personName} will change to ${request.suggestedValue}. The previous value stays in the record history, attributed to whoever entered it.`
            : "The suggestion will be closed. It remains visible in the record history so nothing is quietly erased."
        }
        confirmLabel={confirm === "accept" ? "Accept correction" : "Reject suggestion"}
        destructive={confirm === "reject"}
        onConfirm={() =>
          toast.success(
            confirm === "accept" ? "Correction accepted and attributed" : "Suggestion rejected",
          )
        }
      />
    </article>
  );
}

const actionLabel: Record<HistoryEntry["action"], string> = {
  added: "Added by",
  suggested: "Suggested by",
  confirmed: "Confirmed by",
  rejected: "Rejected by",
  edited: "Edited by",
};

export function RecordHistory({ entries }: { entries: HistoryEntry[] }) {
  return (
    <ol className="relative space-y-5 border-l border-border pl-6">
      {entries.map((h) => (
        <li key={h.id} className="relative">
          <span
            aria-hidden
            className="absolute -left-[1.72rem] top-2 size-1.5 rounded-full bg-gold"
          />
          <p className="text-[15px]">
            <span className="font-display text-lg text-foreground">{h.value}</span>
            <span className="mx-2 text-border">—</span>
            <span className="text-muted-foreground">
              {actionLabel[h.action]} {h.actor}
            </span>
          </p>
          <p className="mt-0.5 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            {h.field} · {h.date}
          </p>
        </li>
      ))}
    </ol>
  );
}
