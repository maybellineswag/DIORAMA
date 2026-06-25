"use client";

import * as React from "react";
import { Plus, Factory, GripVertical } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/app/page-header";
import { ProductDetail } from "@/components/app/product-detail";
import { MemberAvatar, PriorityDot } from "@/components/app/bits";
import { Thumb } from "@/components/thumb";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { PRODUCTS, TRACKS, STATUS_TONE, manufacturer } from "@/lib/mock/data";
import type { Product, SampleStatus, Track } from "@/lib/mock/types";
import { cn } from "@/lib/utils";

const TRACK_FILTERS: ("All" | Track)[] = [
  "All",
  "Development",
  "Sample Rounds",
  "Production",
  "Dead ends",
];

const TRACK_ACCENT: Record<Track, string> = {
  Development: "bg-info",
  "Sample Rounds": "bg-clay",
  Production: "bg-good",
  "Dead ends": "bg-warn",
};

const TONE_TEXT: Record<string, string> = {
  default: "text-ink-soft",
  clay: "text-clay-ink",
  good: "text-good",
  danger: "text-danger",
  warn: "text-warn",
  info: "text-info",
};

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
        <div className="size-14 shrink-0 overflow-hidden rounded-md border">
          <Thumb seed={product.seed} />
        </div>
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
        <div className="flex items-center gap-2">
          <PriorityDot priority={product.priority} />
          <MemberAvatar id={product.assigneeId} className="size-5" />
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

export default function SamplesPage() {
  const [products, setProducts] = React.useState<Product[]>(PRODUCTS);
  const [filter, setFilter] = React.useState<"All" | Track>("All");
  const [selected, setSelected] = React.useState<Product | null>(null);
  const [open, setOpen] = React.useState(false);
  const dragId = React.useRef<string | null>(null);
  const [dragOver, setDragOver] = React.useState<SampleStatus | null>(null);

  const visibleTracks =
    filter === "All" ? TRACKS : TRACKS.filter((t) => t.track === filter);

  const openProduct = (p: Product) => {
    setSelected(p);
    setOpen(true);
  };

  const drop = (status: SampleStatus) => {
    const id = dragId.current;
    setDragOver(null);
    if (!id) return;
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status } : p)),
    );
    const moved = products.find((p) => p.id === id);
    if (moved && moved.status !== status) {
      toast.success(`Moved "${moved.name}"`, { description: `→ ${status}` });
    }
    dragId.current = null;
  };

  return (
    <div className="flex h-full flex-col">
      <div className="space-y-4 p-6 pb-4 lg:px-8">
        <PageHeader
          title="Sample Tracker"
          description="Every product, from concept to drop — drag cards to update status."
          actions={
            <Button size="sm">
              <Plus className="size-4" /> New product
            </Button>
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
                        dragOver === status && "border-clay/60 bg-clay-soft/30",
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
