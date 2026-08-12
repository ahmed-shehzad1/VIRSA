import { useState } from "react";
import { ImagePlus } from "lucide-react";
import { toast } from "sonner";
import type { Person, Photo } from "@/data/types";
import { StatusBadge } from "./badges";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export function PhotoGallery({
  photos,
  people = [],
  className,
  onUpload,
}: {
  photos: Photo[];
  people?: Person[];
  className?: string;
  onUpload?: () => void;
}) {
  const [active, setActive] = useState<Photo | null>(null);
  const nameOf = (id: string) => people.find((p) => p.id === id)?.fullName ?? "Unidentified";

  return (
    <>
      <div className={cn("columns-1 gap-5 sm:columns-2 lg:columns-3 [&>*]:mb-5", className)}>
        {onUpload && (
          <button
            onClick={onUpload}
            className="focus-ring flex w-full break-inside-avoid flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-card/50 px-4 py-12 text-muted-foreground transition-colors hover:border-gold/60 hover:text-foreground"
          >
            <ImagePlus className="size-5 text-gold" aria-hidden />
            <span className="text-xs uppercase tracking-[0.2em]">Upload a photograph</span>
          </button>
        )}
        {photos.map((photo, i) => (
          <figure
            key={photo.id}
            className="fade-up break-inside-avoid"
            style={{ animationDelay: `${Math.min(i, 8) * 60}ms` }}
          >
            <button
              onClick={() => setActive(photo)}
              className="focus-ring group block w-full overflow-hidden rounded-lg border border-border bg-card p-2 text-left transition-all duration-300 hover:-translate-y-0.5 hover:border-gold/50 hover:shadow-lift"
              aria-label={`Open photograph: ${photo.caption}`}
            >
              <span className="block overflow-hidden rounded-sm bg-parchment">
                <img
                  src={photo.src}
                  alt={photo.caption}
                  loading="lazy"
                  className="archival w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                />
              </span>
              <figcaption className="px-2 pb-1 pt-3">
                <span className="block text-sm leading-snug text-foreground">{photo.caption}</span>
                <span className="mt-1.5 flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                  {photo.year ?? "Undated"}
                  {photo.place && <span className="text-border">·</span>}
                  {photo.place}
                </span>
              </figcaption>
            </button>
          </figure>
        ))}
      </div>

      <Dialog open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <DialogContent className="max-w-4xl overflow-hidden border-border bg-card p-0">
          {active && (
            <div className="grid md:grid-cols-[1.6fr_1fr]">
              <img
                src={active.src}
                alt={active.caption}
                className="archival max-h-[70vh] w-full bg-parchment object-contain"
              />
              <div className="flex flex-col gap-4 p-6">
                <div>
                  <h2 className="font-display text-2xl leading-tight">{active.caption}</h2>
                  <p className="mt-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    {active.year ?? "Undated"}
                    {active.place && ` · ${active.place}`}
                  </p>
                </div>
                <dl className="space-y-3 border-t border-border pt-4 text-sm">
                  <div>
                    <dt className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                      People in this photograph
                    </dt>
                    <dd className="mt-1.5 flex flex-wrap gap-1.5">
                      {active.personIds.length ? (
                        active.personIds.map((id) => (
                          <span
                            key={id}
                            className="rounded-full border border-border px-2.5 py-0.5 text-xs"
                          >
                            {nameOf(id)}
                          </span>
                        ))
                      ) : (
                        <span className="text-muted-foreground">Not yet identified</span>
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                      Contributed by
                    </dt>
                    <dd className="mt-1">{active.uploadedBy}</dd>
                  </div>
                </dl>
                <div className="mt-auto flex items-center justify-between gap-3 pt-4">
                  <StatusBadge status={active.status} />
                  <Button variant="outline" size="sm" onClick={() => toast("Tagging coming with the backend")}>
                    Tag people
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
