"use client";

import * as React from "react";

/**
 * Finder-style marquee (drag-to-select) over children marked with
 * `data-select-id`. Attach `containerProps` to a `relative` wrapper and
 * render `overlay` inside it. Dragging can start anywhere (including on a
 * card); a small threshold distinguishes a lasso from a click, and the
 * click that would follow a drag is swallowed.
 */
export function useMarquee() {
  const ref = React.useRef<HTMLDivElement>(null);
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [rect, setRect] = React.useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const drag = React.useRef<{ x: number; y: number; base: Set<string>; moved: boolean; pid: number } | null>(null);
  const justDragged = React.useRef(false);

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
    // Let real controls (buttons/links/inputs) handle their own interactions.
    if (t.closest("button, a, input, textarea, [role='menuitem']")) return;
    const c = ref.current;
    if (!c) return;
    const cr = c.getBoundingClientRect();
    const additive = e.shiftKey || e.metaKey;
    // Click on empty space clears the selection.
    if (!additive && !t.closest("[data-select-id]")) setSelected(new Set());
    drag.current = {
      x: e.clientX - cr.left,
      y: e.clientY - cr.top,
      base: additive ? new Set(selected) : new Set(),
      moved: false,
      pid: e.pointerId,
    };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    const c = ref.current;
    if (!c) return;
    const cr = c.getBoundingClientRect();
    const cx = e.clientX - cr.left;
    const cy = e.clientY - cr.top;
    if (!d.moved && Math.abs(cx - d.x) + Math.abs(cy - d.y) < 5) return;
    if (!d.moved) {
      d.moved = true;
      c.setPointerCapture?.(d.pid);
    }
    const x = Math.min(d.x, cx);
    const y = Math.min(d.y, cy);
    const w = Math.abs(cx - d.x);
    const h = Math.abs(cy - d.y);
    setRect({ x, y, w, h });
    setSelected(new Set([...d.base, ...hit(x, y, w, h)]));
  };

  const onPointerUp = (e: React.PointerEvent) => {
    const d = drag.current;
    drag.current = null;
    ref.current?.releasePointerCapture?.(e.pointerId);
    if (d?.moved) justDragged.current = true;
    setRect(null);
  };

  // Swallow the click that fires right after a lasso so it doesn't open a file.
  const onClickCapture = (e: React.MouseEvent) => {
    if (justDragged.current) {
      e.stopPropagation();
      e.preventDefault();
      justDragged.current = false;
    }
  };

  const overlay = rect ? (
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
    onClickCapture,
  };

  return { selected, setSelected, overlay, containerProps };
}
