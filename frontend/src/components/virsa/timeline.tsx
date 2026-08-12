import type { TimelineEvent } from "@/data/types";
import { cn } from "@/lib/utils";

export function Timeline({
  events,
  className,
}: {
  events: TimelineEvent[];
  className?: string;
}) {
  const sorted = [...events].sort((a, b) => a.year - b.year);
  return (
    <ol className={cn("relative", className)}>
      <span
        aria-hidden
        className="absolute left-[4.75rem] top-2 bottom-2 hidden w-px bg-border sm:block"
      />
      <span aria-hidden className="absolute left-1 top-2 bottom-2 w-px bg-border sm:hidden" />
      {sorted.map((e, i) => (
        <li
          key={e.id}
          className="fade-up relative flex gap-5 pb-9 pl-6 sm:pl-0"
          style={{ animationDelay: `${i * 90}ms` }}
        >
          <span className="hidden w-16 shrink-0 pt-0.5 text-right font-display text-2xl text-gold sm:block">
            {e.year}
          </span>
          <span
            aria-hidden
            className="absolute left-0 top-2 size-2 -translate-x-[3.5px] rounded-full border border-gold bg-background sm:left-[4.75rem] sm:-translate-x-1"
          />
          <div className="min-w-0 flex-1 sm:pl-8">
            <p className="font-display text-lg text-gold sm:hidden">{e.year}</p>
            <h4 className="text-[15px] font-medium text-foreground">{e.title}</h4>
            {e.detail && (
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{e.detail}</p>
            )}
            {e.place && (
              <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                {e.place}
              </p>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}
