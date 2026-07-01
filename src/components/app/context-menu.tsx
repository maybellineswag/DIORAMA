"use client";

import * as React from "react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export type CtxItem =
  | { type: "sep" }
  | { label: string; icon?: LucideIcon; onClick: () => void; destructive?: boolean };

/** A Finder-style right-click context menu, positioned at the cursor. */
export function useContextMenu() {
  const [menu, setMenu] = React.useState<{ x: number; y: number; items: CtxItem[] } | null>(null);

  const openMenu = (e: React.MouseEvent, items: CtxItem[]) => {
    e.preventDefault();
    e.stopPropagation();
    setMenu({ x: e.clientX, y: e.clientY, items });
  };

  const contextMenu = menu ? (
    <ContextMenuView {...menu} onClose={() => setMenu(null)} />
  ) : null;

  return { openMenu, contextMenu };
}

function Row({ item, onClose }: { item: Exclude<CtxItem, { type: "sep" }>; onClose: () => void }) {
  const Icon = item.icon;
  return (
    <button
      onClick={() => {
        item.onClick();
        onClose();
      }}
      className={cn(
        "flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-left text-sm transition-colors cursor-pointer",
        item.destructive ? "text-danger hover:bg-danger/10" : "hover:bg-elevated",
      )}
    >
      {Icon && <Icon className="size-4 shrink-0" />}
      {item.label}
    </button>
  );
}

function ContextMenuView({
  x,
  y,
  items,
  onClose,
}: {
  x: number;
  y: number;
  items: CtxItem[];
  onClose: () => void;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [pos, setPos] = React.useState({ x, y });

  React.useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    let nx = x;
    let ny = y;
    if (x + r.width > window.innerWidth) nx = Math.max(8, window.innerWidth - r.width - 8);
    if (y + r.height > window.innerHeight) ny = Math.max(8, window.innerHeight - r.height - 8);
    setPos({ x: nx, y: ny });
  }, [x, y]);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50"
      onClick={onClose}
      onContextMenu={(e) => {
        e.preventDefault();
        onClose();
      }}
    >
      <div
        ref={ref}
        style={{ left: pos.x, top: pos.y }}
        onClick={(e) => e.stopPropagation()}
        className="absolute min-w-48 rounded-lg border bg-popover p-1 text-popover-foreground shadow-xl"
      >
        {items.map((it, i) =>
          "type" in it ? (
            <div key={i} className="my-1 h-px bg-border" />
          ) : (
            <Row key={i} item={it} onClose={onClose} />
          ),
        )}
      </div>
    </div>
  );
}
