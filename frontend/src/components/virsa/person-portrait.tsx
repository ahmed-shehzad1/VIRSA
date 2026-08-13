import { cn } from "@/lib/utils";
import { initialsOf } from "@/data/api";

/**
 * Typographic archival portrait. Never a cartoon avatar — when there is no
 * photograph we show initials set in the display serif on parchment.
 */
export function PersonPortrait({
  name,
  photo,
  deceased,
  size = "md",
  className,
}: {
  name: string;
  photo?: string;
  deceased?: boolean;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}) {
  const sizes = {
    xs: "size-8 text-[10px]",
    sm: "size-11 text-xs",
    md: "size-14 text-sm",
    lg: "size-24 text-lg",
    xl: "size-full text-3xl",
  } as const;

  return (
    <span
      className={cn(
        "relative block shrink-0 overflow-hidden rounded-md border border-border bg-parchment",
        sizes[size],
        className,
      )}
    >
      {photo ? (
        <img
          src={photo}
          alt={`Photograph of ${name}`}
          loading="lazy"
          className={cn("size-full object-cover", deceased && "archival")}
        />
      ) : (
        <span className="grid size-full place-items-center">
          <span className="font-display tracking-[0.14em] text-muted-foreground">
            {initialsOf(name)}
          </span>
        </span>
      )}
      {deceased && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-gold/30"
        />
      )}
    </span>
  );
}
