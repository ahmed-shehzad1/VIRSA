import { useState } from "react";
import { MoreHorizontal, Pencil, Trash2, Flag } from "lucide-react";
import { toast } from "sonner";
import type { Memory, Person } from "@/data/types";
import { StatusBadge } from "./badges";
import { ConfirmDialog } from "./confirm-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function MemoryCard({
  memory,
  person,
  className,
}: {
  memory: Memory;
  person?: Person;
  className?: string;
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <article
      className={cn(
        "group relative flex flex-col rounded-lg border border-border bg-card p-6 transition-all duration-300 hover:border-gold/40 hover:shadow-archive",
        className,
      )}
    >
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-display text-xl leading-tight text-foreground">{memory.title}</h3>
          <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            {person ? person.fullName : "Family"}
            {memory.occurredYear && (
              <>
                <span className="mx-2 text-border">·</span>
                {memory.occurredYear}
              </>
            )}
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label={`Actions for memory “${memory.title}”`}
              className="opacity-60 transition-opacity group-hover:opacity-100"
            >
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => toast("Editing is a draft action", { description: "Your change will be attributed to you." })}>
              <Pencil className="mr-2 size-3.5" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => toast.success("Reported for review")}>
              <Flag className="mr-2 size-3.5" /> Report
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onSelect={(e) => {
                e.preventDefault();
                setConfirmOpen(true);
              }}
            >
              <Trash2 className="mr-2 size-3.5" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      <blockquote className="mt-4 border-l border-gold/50 pl-4 text-[15px] leading-relaxed text-foreground/90">
        {memory.body}
      </blockquote>

      <footer className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
        <p className="text-xs text-muted-foreground">
          Remembered by <span className="text-foreground">{memory.authorName}</span>
          <span className="mx-2 text-border">·</span>
          {new Date(memory.createdAt).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
        <StatusBadge status={memory.status} />
      </footer>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Remove this memory?"
        description="Memories are personal contributions. Removing it takes it out of the family archive for everyone."
        confirmLabel="Remove memory"
        destructive
        onConfirm={() => toast.success("Memory removed from the archive")}
      />
    </article>
  );
}
