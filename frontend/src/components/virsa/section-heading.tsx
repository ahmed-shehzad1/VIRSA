import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className,
  as: Tag = "h2",
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "left" | "center";
  className?: string;
  as?: "h1" | "h2" | "h3";
}) {
  return (
    <div className={cn(align === "center" && "mx-auto text-center", "max-w-2xl", className)}>
      {eyebrow && (
        <p className="mb-3 text-[11px] uppercase tracking-[0.3em] text-gold">{eyebrow}</p>
      )}
      <Tag className="text-balance text-3xl leading-[1.15] text-foreground sm:text-4xl">
        {title}
      </Tag>
      {description && (
        <p className="mt-4 text-pretty text-[15px] leading-relaxed text-muted-foreground">
          {description}
        </p>
      )}
    </div>
  );
}
