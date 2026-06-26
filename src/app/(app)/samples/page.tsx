"use client";

import * as React from "react";
import {
  Plus,
  Factory,
  GripVertical,
  Lightbulb,
  SquareKanban,
  Table as TableIcon,
  LayoutGrid,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/app/page-header";
import { ProductDetail } from "@/components/app/product-detail";
import { ViewSwitcher } from "@/components/app/view-switcher";
import { PriorityDot, StatusBadge } from "@/components/app/bits";
import { Thumb } from "@/components/thumb";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { PRODUCTS, TRACKS, STATUS_TONE, manufacturer } from "@/lib/mock/data";
import type { Product, SampleStatus, Track, Priority } from "@/lib/mock/types";
import { cn } from "@/lib/utils";

type View = "board" | "table" | "gallery";

const TRACK_FILTERS: ("All" | Track)[] = [
  "All",
  "Development",
  "Sample Rounds",
  "Production",
  "Dead ends",
];

const TRACK_ACCENT: Record<Track, string> = {
  Development: "bg-info",
  "Sample Rounds": "bg-accent",
  Production: "bg-good",
  "Dead ends": "bg-warn",
};

const TONE_TEXT: Record<string, string> = {
  default: "text-ink-soft",
  accent: "text-accent-ink",
  good: "text-good",
  danger: "text-danger",
  warn: "text-warn",
  info: "text-info",
};

const TONE_DOT: Record<string, string> = {
  default: "bg-ink-faint",
  accent: "bg-accent",
  good: "bg-good",
  danger: "bg-danger",
  warn: "bg-warn",
  info: "bg-info",
};

const PRIORITY_RANK: Record<Priority, number> = {
  Urgent: 0,
  High: 1,
  Medium: 2,
  Low: 3,
};

/** A product shows its image once a mockup exists; pure ideas show a concept tile. */
const hasMockup = (p: Product) => p.hasMockup !== false;

function ConceptTile({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-md border border-dashed bg-surface-2 text-ink-faint",
        className,
      )}
    >
      <Lightbulb className="size-4" />
    </div>
  );
}

function ProductCard({
  product,
  onOpen,
  onDragStart,
}: {
  product: Product;
  onOpen: () => void;
  onDragStart: () => void;
}) {
  const mf = manufacturer(product.manufacturerId);
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onClick={onOpen}
      className="group cursor-pointer rounded-lg border bg-card p-2.5 shadow-sm transition-all hover:border-ink-faint/40 hover:shadow-md active:cursor-grabbing"
    >
      <div className="flex gap-2.5">
        {hasMockup(product) ? (
          <div className="size-14 shrink-0 overflow-hidden rounded-md border">
            {product.image ? (
              <img src={product.image} alt="" className="h-full w-full object-cover" />
            ) : (
              <Thumb seed={product.seed} />
            )}
          </div>
        ) : (
          <ConceptTile className="size-14 shrink-0" />
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-1">
            <p className="line-clamp-2 flex-1 text-sm font-medium leading-snug">
              {product.name}
            </p>
            <GripVertical className="size-3.5 shrink-0 text-ink-faint opacity-0 transition-opacity group-hover:opacity-100" />
          </div>
          <p className="mt-0.5 text-xs text-ink-faint">{product.type}</p>
        </div>
      </div>
      <div className="mt-2.5 flex items-center justify-between">
        <Badge variant="outline" className="max-w-[120px] truncate">
          {product.collection.split(" — ")[0]}
        </Badge>
        <div className="flex items-center gap-1.5">
          <PriorityDot priority={product.priority} />
          <span className="text-[11px] text-ink-faint">{product.priority}</span>
        </div>
      </div>
      {mf && (
        <div className="mt-2 flex items-center gap-1 border-t pt-2 text-[11px] text-ink-faint">
          <Factory className="size-3" />
          <span className="truncate">{mf.name}</span>
        </div>
      )}
    </div>
  );
}

// ── Table view ───────────────────────────────────────────────
type SortKey = "name" | "type" | "status" | "priority";

function TableView({
  products,
  onOpen,
}: {
  products: Product[];
  onOpen: (p: Product) => void;
}) {
  const [sort, setSort] = React.useState<{ key: SortKey; dir: 1 | -1 }>({
    key: "priority",
    dir: 1,
  });

  const sorted = [...products].sort((a, b) => {
    let av: string | number = "";
    let bv: string | number = "";
    if (sort.key === "priority") {
      av = PRIORITY_RANK[a.priority];
      bv = PRIORITY_RANK[b.priority];
    } else {
      av = a[sort.key];
      bv = b[sort.key];
    }
    if (av < bv) return -1 * sort.dir;
    if (av > bv) return 1 * sort.dir;
    return 0;
  });

  const toggle = (key: SortKey) =>
    setSort((s) =>
      s.key === key ? { key, dir: (s.dir * -1) as 1 | -1 } : { key, dir: 1 },
    );

  const Th = ({ k, label }: { k: SortKey; label: string }) => (
    <button
      onClick={() => toggle(k)}
      className="flex items-center gap-1 text-left text-xs font-medium text-ink-faint transition-colors hover:text-ink-soft cursor-pointer"
    >
      {label}
      {sort.key === k ? (
        sort.dir === 1 ? (
          <ArrowUp className="size-3" />
        ) : (
          <ArrowDown className="size-3" />
        )
      ) : (
        <ArrowUpDown className="size-3 opacity-40" />
      )}
    </button>
  );

  return (
    <div className="overflow-x-auto rounded-xl border">
      <div className="min-w-[680px]">
        <div className="grid grid-cols-[2fr_1fr_1.1fr_1fr_1.3fr] items-center gap-4 border-b bg-surface-2/40 px-4 py-2.5">
          <Th k="name" label="Product" />
          <Th k="type" label="Type" />
          <Th k="status" label="Status" />
          <Th k="priority" label="Priority" />
          <span className="text-xs font-medium text-ink-faint">Manufacturer</span>
        </div>
        {sorted.map((p) => {
          const mf = manufacturer(p.manufacturerId);
          return (
            <button
              key={p.id}
              onClick={() => onOpen(p)}
              className="grid h-12 w-full grid-cols-[2fr_1fr_1.1fr_1fr_1.3fr] items-center gap-4 border-b px-4 text-left transition-colors last:border-0 hover:bg-elevated/40 cursor-pointer"
            >
              <span className="flex min-w-0 items-center gap-2.5">
                {hasMockup(p) ? (
                  <span className="size-8 shrink-0 overflow-hidden rounded-md border">
                    {p.image ? (
                      <img src={p.image} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <Thumb seed={p.seed} />
                    )}
                  </span>
                ) : (
                  <ConceptTile className="size-8 shrink-0" />
                )}
                <span className="truncate text-sm font-medium">{p.name}</span>
              </span>
              <span className="truncate text-xs text-ink-soft">{p.type}</span>
              <span className="flex min-w-0 items-center gap-1.5 text-xs text-ink-soft">
                <span className={cn("size-2 shrink-0 rounded-full", TONE_DOT[STATUS_TONE[p.status]])} />
                <span className="truncate">{p.status}</span>
              </span>
              <span className="flex items-center gap-1.5 text-xs">
                <PriorityDot priority={p.priority} /> {p.priority}
              </span>
              <span className="truncate text-xs text-ink-soft">
                {mf ? mf.name : "—"}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Gallery view ─────────────────────────────────────────────
function GalleryView({
  products,
  onOpen,
}: {
  products: Product[];
  onOpen: (p: Product) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {products.map((p) => (
        <button key={p.id} onClick={() => onOpen(p)} className="group text-left cursor-pointer">
          <div className="relative aspect-square overflow-hidden rounded-xl border transition-all group-hover:border-ink-faint/40 group-hover:shadow-md">
            {hasMockup(p) ? (
              p.image ? (
                <img src={p.image} alt="" className="h-full w-full object-cover" />
              ) : (
                <Thumb seed={p.seed} />
              )
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-1 bg-surface-2 text-ink-faint">
                <Lightbulb className="size-5" />
                <span className="text-[11px]">Concept</span>
              </div>
            )}
            <div className="absolute left-2 top-2">
              <StatusBadge status={p.status} />
            </div>
          </div>
          <div className="mt-2 flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{p.name}</p>
              <p className="text-xs text-ink-faint">{p.type}</p>
            </div>
            <div className="mt-0.5">
              <PriorityDot priority={p.priority} />
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}

export default function SamplesPage() {
  const [products, setProducts] = React.useState<Product[]>(PRODUCTS);
  const [view, setView] = React.useState<View>("board");
  const [filter, setFilter] = React.useState<"All" | Track>("All");
  const [selected, setSelected] = React.useState<Product | null>(null);
  const [open, setOpen] = React.useState(false);
  const dragId = React.useRef<string | null>(null);
  const [dragOver, setDragOver] = React.useState<SampleStatus | null>(null);

  const visibleTracks =
    filter === "All" ? TRACKS : TRACKS.filter((t) => t.track === filter);

  const filteredProducts =
    filter === "All"
      ? products
      : products.filter((p) =>
          TRACKS.find((t) => t.track === filter)?.statuses.includes(p.status),
        );

  const openProduct = (p: Product) => {
    setSelected(p);
    setOpen(true);
  };

  const drop = (status: SampleStatus) => {
    const id = dragId.current;
    setDragOver(null);
    if (!id) return;
    const moved = products.find((p) => p.id === id);
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)));
    if (moved && moved.status !== status) {
      toast.success(`Moved "${moved.name}"`, { description: `→ ${status}` });
    }
    dragId.current = null;
  };

  return (
    <div className="flex h-full flex-col">
      <div className="space-y-4 p-6 pb-4 lg:px-8">
        <PageHeader
          title="Product Status"
          description="Every product's full lifecycle — from concept to drop."
          actions={
            <div className="flex items-center gap-2">
              <ViewSwitcher
                value={view}
                onChange={setView}
                options={[
                  { id: "board", label: "Board", icon: SquareKanban },
                  { id: "table", label: "Table", icon: TableIcon },
                  { id: "gallery", label: "Gallery", icon: LayoutGrid },
                ]}
              />
              <Button size="sm">
                <Plus className="size-4" /> New product
              </Button>
            </div>
          }
        />
        <div className="flex items-center gap-1 rounded-lg bg-surface-2 p-1 w-fit">
          {TRACK_FILTERS.map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={cn(
                "rounded-md px-3 py-1.5 text-[13px] font-medium transition-colors cursor-pointer",
                filter === t
                  ? "bg-card text-foreground shadow-sm"
                  : "text-ink-soft hover:text-foreground",
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Board */}
      {view === "board" && (
        <div className="min-h-0 flex-1 overflow-x-auto px-6 pb-6 lg:px-8">
          <div className="flex h-full gap-6">
            {visibleTracks.map((track) => (
              <div key={track.track} className="flex h-full flex-col">
                <div className="mb-3 flex items-center gap-2">
                  <span className={cn("size-2 rounded-full", TRACK_ACCENT[track.track])} />
                  <h2 className="text-sm font-medium">{track.track}</h2>
                </div>
                <div className="flex h-full gap-3">
                  {track.statuses.map((status) => {
                    const cards = products.filter((p) => p.status === status);
                    return (
                      <div
                        key={status}
                        onDragOver={(e) => {
                          e.preventDefault();
                          setDragOver(status);
                        }}
                        onDragLeave={() => setDragOver((s) => (s === status ? null : s))}
                        onDrop={() => drop(status)}
                        className={cn(
                          "flex h-full w-[248px] shrink-0 flex-col rounded-xl border bg-surface-2/40 transition-colors",
                          dragOver === status && "border-accent/60 bg-accent-soft/30",
                        )}
                      >
                        <div className="flex items-center justify-between px-3 py-2.5">
                          <span
                            className={cn(
                              "text-[13px] font-medium",
                              TONE_TEXT[STATUS_TONE[status]],
                            )}
                          >
                            {status}
                          </span>
                          <span className="tabular flex size-5 items-center justify-center rounded-md bg-surface-hi text-[11px] text-ink-soft">
                            {cards.length}
                          </span>
                        </div>
                        <div className="flex-1 space-y-2 overflow-y-auto px-2 pb-2">
                          {cards.map((p) => (
                            <ProductCard
                              key={p.id}
                              product={p}
                              onOpen={() => openProduct(p)}
                              onDragStart={() => (dragId.current = p.id)}
                            />
                          ))}
                          {cards.length === 0 && (
                            <div className="flex h-20 items-center justify-center rounded-lg border border-dashed text-xs text-ink-faint">
                              Drop here
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Table */}
      {view === "table" && (
        <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6 lg:px-8">
          <TableView products={filteredProducts} onOpen={openProduct} />
        </div>
      )}

      {/* Gallery */}
      {view === "gallery" && (
        <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6 lg:px-8">
          <GalleryView products={filteredProducts} onOpen={openProduct} />
        </div>
      )}

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-full p-0 sm:max-w-lg">
          {selected && (
            <ProductDetail
              product={products.find((p) => p.id === selected.id) ?? selected}
            />
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
