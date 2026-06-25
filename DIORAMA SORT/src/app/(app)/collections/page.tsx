"use client";

import * as React from "react";
import {
  Plus,
  ZoomIn,
  ZoomOut,
  Maximize,
  Sparkles,
  Type,
  Frame as FrameIcon,
  Shirt,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { Thumb } from "@/components/thumb";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { PRODUCTS, product as findProduct } from "@/lib/mock/data";
import { cn } from "@/lib/utils";

type Item =
  | { id: string; type: "product"; x: number; y: number; productId: string }
  | { id: string; type: "label"; x: number; y: number; text: string }
  | { id: string; type: "group"; x: number; y: number; w: number; h: number; text: string };

let counter = 0;
const uid = () => `c${Date.now()}-${counter++}`;

const INITIAL: Item[] = [
  { id: uid(), type: "group", x: 80, y: 80, w: 520, h: 340, text: "Hero pieces" },
  { id: uid(), type: "product", x: 120, y: 150, productId: "p-reliquary-hoodie" },
  { id: uid(), type: "product", x: 360, y: 150, productId: "p-bomber" },
  { id: uid(), type: "label", x: 120, y: 460, text: "AW25 — Reliquary capsule" },
  { id: uid(), type: "product", x: 680, y: 180, productId: "p-ember-scarf" },
];

interface Suggestion {
  title: string;
  vibe: string;
  picks: { name: string; role: string; rationale: string; productId?: string }[];
}

function buildSuggestion(prompt: string): Suggestion {
  const p = prompt.toLowerCase();
  const wantsAccessories = p.includes("accessor") || p.includes("2-3") || p.includes("2–3");
  return {
    title: "Ember — Autumn Capsule",
    vibe:
      "A tight, layerable autumn drop anchored by one statement hoodie, with a small set of accessories that extend the story without diluting it.",
    picks: [
      {
        name: "Reliquary Heavyweight Hoodie",
        role: "Hero piece",
        rationale:
          "420gsm loopback in a warm rust — the anchor everything else is styled around.",
        productId: "p-reliquary-hoodie",
      },
      {
        name: "Ember Chain-Stitch Scarf",
        role: "Accessory",
        rationale:
          "Hand-embroidered motif echoes the hoodie graphic; adds texture and a price-accessible entry point.",
        productId: "p-ember-scarf",
      },
      {
        name: "Saltwater 6-Panel Cap",
        role: "Accessory",
        rationale:
          "Recolored to bone, it completes the head-to-toe look and is your highest-margin item.",
        productId: "p-cap",
      },
      ...(wantsAccessories
        ? [
            {
              name: "Core Canvas Tote",
              role: "Accessory",
              rationale:
                "Carries the wordmark, ties the capsule to your always-on line, and lifts AOV.",
              productId: "p-tote",
            },
          ]
        : []),
    ],
  };
}

export default function CollectionsPage() {
  const [items, setItems] = React.useState<Item[]>(INITIAL);
  const [scale, setScale] = React.useState(1);
  const [offset, setOffset] = React.useState({ x: 0, y: 0 });
  const [editing, setEditing] = React.useState<string | null>(null);
  const [prompt, setPrompt] = React.useState("");
  const [suggestion, setSuggestion] = React.useState<Suggestion | null>(null);
  const [generating, setGenerating] = React.useState(false);

  const pan = React.useRef<{ sx: number; sy: number; ox: number; oy: number } | null>(null);
  const drag = React.useRef<{ id: string; sx: number; sy: number; ix: number; iy: number } | null>(null);

  // ── Pointer handlers ──
  const onBgPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    pan.current = { sx: e.clientX, sy: e.clientY, ox: offset.x, oy: offset.y };
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const onItemPointerDown = (e: React.PointerEvent, item: Item) => {
    e.stopPropagation();
    if (e.button !== 0) return;
    drag.current = { id: item.id, sx: e.clientX, sy: e.clientY, ix: item.x, iy: item.y };
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (drag.current) {
      const d = drag.current;
      const nx = d.ix + (e.clientX - d.sx) / scale;
      const ny = d.iy + (e.clientY - d.sy) / scale;
      setItems((prev) =>
        prev.map((it) => (it.id === d.id ? { ...it, x: nx, y: ny } : it)),
      );
    } else if (pan.current) {
      const p = pan.current;
      setOffset({ x: p.ox + (e.clientX - p.sx), y: p.oy + (e.clientY - p.sy) });
    }
  };

  const onPointerUp = () => {
    drag.current = null;
    pan.current = null;
  };

  const onWheel = (e: React.WheelEvent) => {
    if (!e.ctrlKey && !e.metaKey) return;
    e.preventDefault();
    setScale((s) => Math.min(2, Math.max(0.4, s - e.deltaY * 0.002)));
  };

  const zoom = (dir: 1 | -1) =>
    setScale((s) => Math.min(2, Math.max(0.4, s + dir * 0.15)));
  const reset = () => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
  };

  const addProduct = (productId: string) => {
    setItems((prev) => [
      ...prev,
      {
        id: uid(),
        type: "product",
        x: (-offset.x + 300) / scale,
        y: (-offset.y + 200) / scale,
        productId,
      },
    ]);
    toast.success("Added to canvas");
  };

  const addLabel = () =>
    setItems((prev) => [
      ...prev,
      { id: uid(), type: "label", x: (-offset.x + 260) / scale, y: (-offset.y + 160) / scale, text: "New label" },
    ]);

  const addGroup = () =>
    setItems((prev) => [
      ...prev,
      { id: uid(), type: "group", x: (-offset.x + 220) / scale, y: (-offset.y + 140) / scale, w: 360, h: 260, text: "New group" },
    ]);

  const removeItem = (id: string) =>
    setItems((prev) => prev.filter((it) => it.id !== id));

  const generate = () => {
    setGenerating(true);
    setSuggestion(null);
    setTimeout(() => {
      setSuggestion(buildSuggestion(prompt));
      setGenerating(false);
    }, 1000);
  };

  return (
    <div className="flex h-full">
      {/* Canvas */}
      <div className="relative min-w-0 flex-1 overflow-hidden">
        {/* Toolbar */}
        <div className="absolute left-4 top-4 z-20 flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-lg border bg-card/90 p-1 shadow-sm backdrop-blur">
            <Popover>
              <PopoverTrigger asChild>
                <Button size="sm" variant="ghost" className="h-7">
                  <Plus className="size-4" /> Product
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-72 p-1.5">
                <p className="px-2 py-1.5 text-[11px] font-medium uppercase tracking-wider text-ink-faint">
                  Add from Sample Tracker
                </p>
                <div className="max-h-72 space-y-1 overflow-y-auto">
                  {PRODUCTS.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => addProduct(p.id)}
                      className="flex w-full items-center gap-2.5 rounded-md p-1.5 text-left transition-colors hover:bg-accent cursor-pointer"
                    >
                      <span className="size-8 shrink-0 overflow-hidden rounded-md border">
                        <Thumb seed={p.seed} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm">{p.name}</span>
                        <span className="block truncate text-xs text-ink-faint">{p.type}</span>
                      </span>
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
            <Button size="sm" variant="ghost" className="h-7" onClick={addLabel}>
              <Type className="size-4" /> Label
            </Button>
            <Button size="sm" variant="ghost" className="h-7" onClick={addGroup}>
              <FrameIcon className="size-4" /> Group
            </Button>
          </div>
        </div>

        {/* Zoom controls */}
        <div className="absolute bottom-4 left-4 z-20 flex items-center gap-1 rounded-lg border bg-card/90 p-1 shadow-sm backdrop-blur">
          <Button size="icon-sm" variant="ghost" onClick={() => zoom(-1)}>
            <ZoomOut className="size-4" />
          </Button>
          <span className="tabular w-12 text-center text-xs text-ink-soft">
            {Math.round(scale * 100)}%
          </span>
          <Button size="icon-sm" variant="ghost" onClick={() => zoom(1)}>
            <ZoomIn className="size-4" />
          </Button>
          <span className="mx-0.5 h-4 w-px bg-border" />
          <Button size="icon-sm" variant="ghost" onClick={reset}>
            <Maximize className="size-4" />
          </Button>
        </div>

        {/* The board */}
        <div
          className="canvas-grid absolute inset-0 cursor-grab touch-none bg-surface-2/30 active:cursor-grabbing"
          onPointerDown={onBgPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
          onWheel={onWheel}
        >
          <div
            className="absolute left-0 top-0 origin-top-left"
            style={{ transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})` }}
          >
            {items.map((it) => {
              if (it.type === "group") {
                return (
                  <div
                    key={it.id}
                    onPointerDown={(e) => onItemPointerDown(e, it)}
                    className="group absolute rounded-2xl border-2 border-dashed border-line bg-surface/20"
                    style={{ left: it.x, top: it.y, width: it.w, height: it.h }}
                  >
                    <div className="flex items-center gap-1.5 px-3 py-2">
                      {editing === it.id ? (
                        <input
                          autoFocus
                          defaultValue={it.text}
                          onBlur={(e) => {
                            setItems((prev) =>
                              prev.map((x) => (x.id === it.id ? { ...x, text: e.target.value } : x)),
                            );
                            setEditing(null);
                          }}
                          className="rounded bg-surface px-1.5 py-0.5 text-sm outline-none"
                        />
                      ) : (
                        <span
                          onDoubleClick={() => setEditing(it.id)}
                          className="text-sm font-medium text-ink-soft"
                        >
                          {it.text}
                        </span>
                      )}
                      <button
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={() => removeItem(it.id)}
                        className="ml-auto opacity-0 transition-opacity group-hover:opacity-100 cursor-pointer"
                      >
                        <X className="size-3.5 text-ink-faint" />
                      </button>
                    </div>
                  </div>
                );
              }
              if (it.type === "label") {
                return (
                  <div
                    key={it.id}
                    onPointerDown={(e) => onItemPointerDown(e, it)}
                    className="group absolute cursor-grab active:cursor-grabbing"
                    style={{ left: it.x, top: it.y }}
                  >
                    {editing === it.id ? (
                      <input
                        autoFocus
                        defaultValue={it.text}
                        onBlur={(e) => {
                          setItems((prev) =>
                            prev.map((x) => (x.id === it.id ? { ...x, text: e.target.value } : x)),
                          );
                          setEditing(null);
                        }}
                        className="display rounded bg-surface px-2 py-1 text-lg outline-none"
                      />
                    ) : (
                      <span
                        onDoubleClick={() => setEditing(it.id)}
                        className="display whitespace-nowrap text-lg tracking-tight text-ink"
                      >
                        {it.text}
                      </span>
                    )}
                  </div>
                );
              }
              const prod = findProduct(it.productId);
              if (!prod) return null;
              return (
                <div
                  key={it.id}
                  onPointerDown={(e) => onItemPointerDown(e, it)}
                  className="group absolute w-44 cursor-grab overflow-hidden rounded-xl border bg-card shadow-md active:cursor-grabbing"
                  style={{ left: it.x, top: it.y }}
                >
                  <div className="aspect-square overflow-hidden">
                    <Thumb seed={prod.seed} />
                  </div>
                  <div className="flex items-center gap-1 p-2.5">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium leading-tight">{prod.name}</p>
                      <p className="truncate text-xs text-ink-faint">{prod.type}</p>
                    </div>
                    <button
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={() => removeItem(it.id)}
                      className="opacity-0 transition-opacity group-hover:opacity-100 cursor-pointer"
                    >
                      <X className="size-3.5 text-ink-faint" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* AI builder */}
      <aside className="hidden w-80 shrink-0 flex-col border-l bg-surface-2/30 xl:flex">
        <div className="flex items-center gap-2 border-b px-5 py-4">
          <span className="flex size-8 items-center justify-center rounded-md bg-clay-soft">
            <Sparkles className="size-4 text-clay-ink" />
          </span>
          <div>
            <p className="text-sm font-medium leading-tight">AI Collection Builder</p>
            <p className="text-xs text-ink-faint leading-tight">Describe the drop you want</p>
          </div>
        </div>

        <div className="space-y-3 p-5">
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. small capsule drop, hoodie as the main piece, 2–3 accessories that make sense, autumn vibe"
            className="min-h-28 resize-none"
          />
          <Button className="w-full" onClick={generate} disabled={generating}>
            <Sparkles className="size-4" />
            {generating ? "Building…" : "Build collection"}
          </Button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-5">
          {generating && (
            <div className="space-y-2">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-20 animate-pulse rounded-lg bg-surface-hi" />
              ))}
            </div>
          )}

          {suggestion && (
            <div className="space-y-4 animate-fade-up">
              <div className="rounded-lg border bg-card p-3.5">
                <p className="display text-base tracking-tight">{suggestion.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-ink-soft">
                  {suggestion.vibe}
                </p>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-xs font-medium uppercase tracking-wider text-ink-faint">
                  Suggested mix
                </p>
                <button
                  className="text-xs text-clay-ink hover:underline cursor-pointer"
                  onClick={() => {
                    suggestion.picks.forEach((p, i) => {
                      const pid = p.productId;
                      if (!pid) return;
                      setItems((prev) => [
                        ...prev,
                        {
                          id: uid(),
                          type: "product",
                          x: (-offset.x + 200 + (i % 3) * 190) / scale,
                          y: (-offset.y + 520 + Math.floor(i / 3) * 230) / scale,
                          productId: pid,
                        },
                      ]);
                    });
                    toast.success("Added suggested mix to canvas");
                  }}
                >
                  Add all
                </button>
              </div>

              <div className="space-y-2">
                {suggestion.picks.map((p) => (
                  <div key={p.name} className="rounded-lg border bg-card p-3">
                    <div className="flex items-start gap-2.5">
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-surface-2">
                        <Shirt className="size-4 text-ink-soft" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate text-sm font-medium">{p.name}</p>
                          <Badge variant="clay">{p.role}</Badge>
                        </div>
                        <p className="mt-1 text-xs leading-relaxed text-ink-soft">
                          {p.rationale}
                        </p>
                        {p.productId && (
                          <button
                            onClick={() => addProduct(p.productId!)}
                            className="mt-2 inline-flex items-center gap-1 text-xs text-clay-ink hover:underline cursor-pointer"
                          >
                            <Plus className="size-3" /> Add to canvas
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!suggestion && !generating && (
            <p className="text-xs leading-relaxed text-ink-faint">
              Describe the kind of collection you want and the AI will propose a
              product mix with rationale you can drop straight onto the canvas.
            </p>
          )}
        </div>
      </aside>
    </div>
  );
}
