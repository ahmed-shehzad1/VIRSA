import { Link } from "@tanstack/react-router";
import type { Person } from "@/data/types";
import { lifeSpan } from "@/data/api";
import { PersonPortrait } from "./person-portrait";
import { cn } from "@/lib/utils";

export function PersonCard({
  person,
  className,
  compact = false,
}: {
  person: Person;
  className?: string;
  compact?: boolean;
}) {
  return (
    <Link
      to="/app/people/$personId"
      params={{ personId: person.id }}
      className={cn(
        "focus-ring group flex items-center gap-4 rounded-lg border border-border bg-card p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-gold/50 hover:shadow-archive",
        person.deceased && "bg-parchment/60",
        className,
      )}
    >
      <PersonPortrait
        name={person.fullName}
        photo={person.photo}
        deceased={person.deceased}
        size={compact ? "sm" : "md"}
      />
      <span className="min-w-0 flex-1">
        <span className="block truncate font-display text-lg leading-tight text-foreground">
          {person.fullName}
        </span>
        <span className="mt-0.5 block text-xs tracking-wide text-muted-foreground">
          {lifeSpan(person)}
          {person.occupation && !compact && <span className="mx-1.5 text-border">·</span>}
          {!compact && person.occupation}
        </span>
      </span>
      {person.deceased && (
        <span
          aria-label="Deceased"
          title="Deceased"
          className="ml-auto size-1.5 shrink-0 rounded-full bg-gold"
        />
      )}
    </Link>
  );
}
