"use client";

import * as React from "react";

/**
 * Finder-style marquee (drag-to-select) over children marked with
 * `data-select-id`. Attach `containerProps` to a `relative` wrapper and
 * render `overlay` inside it.
 */
export function useMarquee() {
  const ref = React.useRef<HTMLDivElement>(null);
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [rect, setRect] = React.useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const drag = React.useRef<{ x: number; y: number; base: Set<string> } | null>(null);

  const hit = (x: number, y: number, w: number, h: number) => {
    const ids: string[] = [];
    const c = ref.current;
    if (!c) return ids;
    const cr = c.getBoundingClientRect();
    c.querySelectorAll<HTMLElement>("[data-select-id]").forEach((el) => {
      const r = el.getBoundingClientRect();
      const rx = r.left - cr.left;
      const ry = r.top - cr.top;
      if (rx < x + w && rx + r.width > x && ry < y + h && ry + r.height > y) {
        ids.push(el.dataset.selectId!);
      }
    });
    return ids;
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    const t = e.target as HTMLElement;
    if (t.closest("[data-select-id], button, a, input")) return; // let items handle their own clicks
    const c = ref.current;
    if (!c) return;
    const cr = c.getBoundingClientRect();
    const additive = e.shiftKey || e.metaKey;
    drag.current = {
      x: e.clientX - cr.left,
      y: e.clientY - cr.top,
      base: additive ? new Set(selected) : new Set(),
    };
    if (!additive) setSelected(new Set());
    setRect({ x: drag.current.x, y: drag.current.y, w: 0, h: 0 });
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    const c = ref.current;
    if (!c) return;
    const cr = c.getBoundingClientRect();
    const cx = e.clientX - cr.left;
    const cy = e.clientY - cr.top;
    const x = Math.min(d.x, cx);
    const y = Math.min(d.y, cy);
    const w = Math.abs(cx - d.x);
    const h = Math.abs(cy - d.y);
    setRect({ x, y, w, h });
    setSelected(new Set([...d.base, ...hit(x, y, w, h)]));
  };

  const onPointerUp = () => {
    drag.current = null;
    setRect(null);
  };

  const overlay =
    rect && (rect.w > 2 || rect.h > 2) ? (
      <div
        className="pointer-events-none absolute z-10 rounded-sm border border-accent/60 bg-accent/10"
        style={{ left: rect.x, top: rect.y, width: rect.w, height: rect.h }}
      />
    ) : null;

  const containerProps = {
    ref,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerLeave: onPointerUp,
  };

  return { selected, setSelected, overlay, containerProps };
}
