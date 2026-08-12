import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Minus, Plus, Crosshair, Search } from "lucide-react";
import type { Person } from "@/data/types";
import { lifeSpan } from "@/data/api";
import { PersonPortrait } from "./person-portrait";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const CARD_W = 190;
const CARD_H = 92;
const MIN_ZOOM = 0.35;
const MAX_ZOOM = 2;

interface Point {
  x: number;
  y: number;
}

export function FamilyTree({
  people,
  onSelect,
  className,
  height = "clamp(28rem, 70vh, 46rem)",
  showControls = true,
}: {
  people: Person[];
  onSelect?: (person: Person) => void;
  className?: string;
  height?: string;
  showControls?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(0.75);
  const [offset, setOffset] = useState<Point>({ x: 40, y: 40 });
  const [query, setQuery] = useState("");
  const dragRef = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);

  const byId = useMemo(() => new Map(people.map((p) => [p.id, p])), [people]);

  const center = useCallback(
    (p: Person) => ({ x: p.pos.x + CARD_W / 2, y: p.pos.y + CARD_H / 2 }),
    [],
  );

  /** Spouse links + parent→child links routed through the couple midpoint. */
  const links = useMemo(() => {
    const spouse: Array<{ id: string; a: Point; b: Point }> = [];
    const seen = new Set<string>();
    for (const p of people) {
      for (const sid of p.spouseIds) {
        const key = [p.id, sid].sort().join("|");
        if (seen.has(key)) continue;
        const s = byId.get(sid);
        if (!s) continue;
        seen.add(key);
        spouse.push({ id: key, a: center(p), b: center(s) });
      }
    }

    const descent: Array<{ id: string; d: string }> = [];
    for (const child of people) {
      if (!child.parentIds.length) continue;
      const parents = child.parentIds.map((id) => byId.get(id)).filter(Boolean) as Person[];
      if (!parents.length) continue;
      const px = parents.reduce((s, p) => s + center(p).x, 0) / parents.length;
      const py = Math.max(...parents.map((p) => p.pos.y + CARD_H));
      const c = { x: center(child).x, y: child.pos.y };
      const mid = py + (c.y - py) / 2;
      descent.push({
        id: `${child.id}-descent`,
        d: `M ${px} ${py} L ${px} ${mid} Q ${px} ${mid + 14} ${px + Math.sign(c.x - px) * 14} ${mid + 14} L ${c.x - Math.sign(c.x - px) * 14} ${mid + 14} Q ${c.x} ${mid + 14} ${c.x} ${mid + 28} L ${c.x} ${c.y}`,
      });
    }
    return { spouse, descent };
  }, [people, byId, center]);

  const bounds = useMemo(() => {
    const xs = people.map((p) => p.pos.x);
    const ys = people.map((p) => p.pos.y);
    return {
      w: Math.max(...xs) + CARD_W + 120,
      h: Math.max(...ys) + CARD_H + 120,
      minX: Math.min(...xs),
    };
  }, [people]);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return new Set<string>();
    return new Set(people.filter((p) => p.fullName.toLowerCase().includes(q)).map((p) => p.id));
  }, [query, people]);

  const reset = useCallback(() => {
    setZoom(0.75);
    setOffset({ x: 40, y: 40 });
  }, []);

  const zoomBy = useCallback(
    (factor: number) => {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const px = rect.width / 2;
      const py = rect.height / 2;
      setZoom((z) => {
        const next = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z * factor));
        const k = next / z;
        setOffset((o) => ({ x: px - (px - o.x) * k, y: py - (py - o.y) * k }));
        return next;
      });
    },
    [],
  );

  /* Non-passive wheel handler: zoom anchored on the pointer. */
  const wheelRef = useRef<(e: WheelEvent) => void>(() => {});
  wheelRef.current = (e: WheelEvent) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    const dy = e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 100 : 1);
    setZoom((z) => {
      const next = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z * Math.exp(-dy * 0.0015)));
      const k = next / z;
      setOffset((o) => ({ x: px - (px - o.x) * k, y: py - (py - o.y) * k }));
      return next;
    });
  };

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handler = (e: WheelEvent) => {
      e.preventDefault();
      wheelRef.current(e);
    };
    el.addEventListener("wheel", handler, { passive: false });
    return () => el.removeEventListener("wheel", handler);
  }, []);

  const onPointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest("[data-person-card]")) return;
    dragRef.current = { x: e.clientX, y: e.clientY, ox: offset.x, oy: offset.y };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = dragRef.current;
    if (!d) return;
    setOffset({ x: d.ox + (e.clientX - d.x), y: d.oy + (e.clientY - d.y) });
  };
  const endDrag = () => {
    dragRef.current = null;
  };

  return (
    <div className={cn("relative overflow-hidden rounded-lg border border-border paper", className)}>
      {showControls && (
        <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex flex-wrap items-center justify-between gap-3 p-4">
          <div className="pointer-events-auto relative w-full max-w-64">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search this family"
              aria-label="Search people in the family tree"
              className="h-9 border-border bg-card/90 pl-9 backdrop-blur"
            />
          </div>
          <div className="pointer-events-auto flex gap-1.5 rounded-md border border-border bg-card/90 p-1 backdrop-blur">
            <Button variant="ghost" size="icon" className="size-8" aria-label="Zoom out" onClick={() => zoomBy(1 / 1.25)}>
              <Minus />
            </Button>
            <Button variant="ghost" size="icon" className="size-8" aria-label="Zoom in" onClick={() => zoomBy(1.25)}>
              <Plus />
            </Button>
            <Button variant="ghost" size="icon" className="size-8" aria-label="Reset and centre the tree" onClick={reset}>
              <Crosshair />
            </Button>
          </div>
        </div>
      )}

      <div
        ref={containerRef}
        style={{ height }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        className="relative w-full cursor-grab touch-none select-none active:cursor-grabbing"
      >
        <div
          className="absolute left-0 top-0 origin-top-left"
          style={{
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
            width: bounds.w,
            height: bounds.h,
          }}
        >
          <svg
            width={bounds.w}
            height={bounds.h}
            className="absolute inset-0 overflow-visible"
            aria-hidden
          >
            {links.descent.map((l) => (
              <path
                key={l.id}
                d={l.d}
                fill="none"
                stroke="var(--color-border)"
                strokeWidth={1.25}
              />
            ))}
            {links.spouse.map((l) => (
              <g key={l.id}>
                <line
                  x1={l.a.x}
                  y1={l.a.y}
                  x2={l.b.x}
                  y2={l.b.y}
                  stroke="var(--color-gold)"
                  strokeWidth={1}
                  strokeDasharray="3 4"
                  opacity={0.9}
                />
                <circle
                  cx={(l.a.x + l.b.x) / 2}
                  cy={(l.a.y + l.b.y) / 2}
                  r={2.5}
                  fill="var(--color-gold)"
                />
              </g>
            ))}
          </svg>

          {people.map((p) => {
            const dim = query.trim() !== "" && !matches.has(p.id);
            return (
              <button
                key={p.id}
                data-person-card
                onClick={() => onSelect?.(p)}
                style={{ left: p.pos.x, top: p.pos.y, width: CARD_W, height: CARD_H }}
                className={cn(
                  "focus-ring absolute flex items-center gap-3 rounded-lg border bg-card px-3 text-left shadow-archive transition-all duration-300 hover:-translate-y-0.5 hover:border-gold hover:shadow-lift",
                  p.deceased ? "border-border bg-parchment" : "border-border",
                  matches.has(p.id) && "border-gold ring-2 ring-gold/40",
                  dim && "opacity-30",
                )}
                aria-label={`Open profile of ${p.fullName}`}
              >
                <PersonPortrait
                  name={p.fullName}
                  photo={p.photo}
                  deceased={p.deceased}
                  size="sm"
                />
                <span className="min-w-0">
                  <span className="block truncate font-display text-[15px] leading-tight text-foreground">
                    {p.fullName}
                  </span>
                  <span className="mt-0.5 block text-[11px] tracking-wide text-muted-foreground">
                    {lifeSpan(p)}
                  </span>
                  {p.deceased && (
                    <span className="mt-1 block h-px w-6 bg-gold" aria-hidden />
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {showControls && (
      <p className="pointer-events-none absolute bottom-3 left-1/2 z-10 -translate-x-1/2 text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
        Drag to pan · scroll to zoom
      </p>
      )}
    </div>
  );
}
