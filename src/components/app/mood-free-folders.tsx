"use client";

import * as React from "react";
import { Plus } from "lucide-react";

const DEFAULT_KEY = "diorama.mood.folderPositions.v1";

type Pos = Record<string, { x: number; y: number }>;

function defaultPos(cats: string[]): Pos {
  const o: Pos = {};
  cats.forEach((c, i) => {
    o[c] = { x: 24 + (i % 4) * 210, y: 24 + Math.floor(i / 4) * 180 };
  });
  return o;
}

function FolderGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 82" className={className} fill="none" aria-hidden>
      <path
        d="M8 24c0-4 3-7 7-7h21c1.6 0 3.1.6 4.3 1.7l5 4.6c1.1 1 2.6 1.7 4.2 1.7H85c4 0 7 3 7 7v37c0 4-3 7-7 7H15c-4 0-7-3-7-7V24Z"
        fill="var(--accent-soft)"
        stroke="var(--accent)"
        strokeWidth="2.5"
      />
    </svg>
  );
}

/** Free-arrange folders (drag to move, positions persist to localStorage). */
export function MoodFreeFolders({
  categories,
  countFor,
  onOpen,
  onAdd,
  storageKey = DEFAULT_KEY,
  addLabel = "Add category",
}: {
  categories: string[];
  countFor: (c: string) => number;
  onOpen: (c: string) => void;
  onAdd: () => void;
  storageKey?: string;
  addLabel?: string;
}) {
  const cats = categories.filter((c) => c !== "All");
  const [pos, setPos] = React.useState<Pos>(() => defaultPos(cats));
  const drag = React.useRef<{
    cat: string;
    sx: number;
    sy: number;
    ix: number;
    iy: number;
    moved: boolean;
  } | null>(null);

  // Load saved positions once.
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) setPos((p) => ({ ...p, ...(JSON.parse(raw) as Pos) }));
    } catch {
      /* ignore */
    }
  }, []);

  // Make sure any newly-added category gets a default slot.
  React.useEffect(() => {
    setPos((p) => {
      let changed = false;
      const np = { ...p };
      cats.forEach((c, i) => {
        if (!np[c]) {
          np[c] = { x: 24 + (i % 4) * 210, y: 24 + Math.floor(i / 4) * 180 };
          changed = true;
        }
      });
      return changed ? np : p;
    });
  }, [cats]);

  const save = (next: Pos) => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  };

  const onMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.sx;
    const dy = e.clientY - d.sy;
    if (Math.abs(dx) + Math.abs(dy) > 4) d.moved = true;
    setPos((p) => ({ ...p, [d.cat]: { x: Math.max(0, d.ix + dx), y: Math.max(0, d.iy + dy) } }));
  };

  const onUp = (e: React.PointerEvent) => {
    const d = drag.current;
    drag.current = null;
    if (!d) return;
    const dx = e.clientX - d.sx;
    const dy = e.clientY - d.sy;
    if (Math.abs(dx) + Math.abs(dy) <= 4) {
      onOpen(d.cat);
    } else {
      setPos((p) => {
        const np = { ...p, [d.cat]: { x: Math.max(0, d.ix + dx), y: Math.max(0, d.iy + dy) } };
        save(np);
        return np;
      });
    }
  };

  const addSlot = {
    x: 24 + (cats.length % 4) * 210,
    y: 24 + Math.floor(cats.length / 4) * 180,
  };

  return (
    <div
      className="relative min-h-[60vh] touch-none rounded-xl"
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerLeave={onUp}
    >
      {cats.map((c) => {
        const p = pos[c] ?? { x: 0, y: 0 };
        return (
          <div
            key={c}
            onPointerDown={(e) => {
              if (e.button !== 0) return;
              drag.current = { cat: c, sx: e.clientX, sy: e.clientY, ix: p.x, iy: p.y, moved: false };
              (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
            }}
            style={{ left: p.x, top: p.y }}
            className="group absolute flex w-32 cursor-grab select-none flex-col items-center gap-1.5 rounded-xl p-2 active:cursor-grabbing"
          >
            <FolderGlyph className="pointer-events-none w-28 transition-transform duration-150 group-active:scale-[0.98]" />
            <div className="flex items-baseline gap-1.5">
              <span className="text-sm font-medium">{c}</span>
              <span className="tabular text-xs text-ink-faint">{countFor(c)}</span>
            </div>
          </div>
        );
      })}

      <button
        onClick={onAdd}
        style={{ left: addSlot.x, top: addSlot.y }}
        className="group absolute flex w-32 flex-col items-center gap-1.5 rounded-xl p-2 text-ink-faint transition-colors hover:text-foreground cursor-pointer"
      >
        <span className="flex h-[88px] w-28 items-center justify-center rounded-xl border-2 border-dashed">
          <Plus className="size-7" />
        </span>
        <span className="text-sm">{addLabel}</span>
      </button>
    </div>
  );
}
