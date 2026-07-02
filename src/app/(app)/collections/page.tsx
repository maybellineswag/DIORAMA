"use client";

import * as React from "react";
import Link from "next/link";
import {
  Plus,
  ArrowLeft,
  ArrowRight,
  LayoutGrid,
  Frame as FrameIcon,
  Package,
  Sparkles,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/app/page-header";
import { ViewSwitcher } from "@/components/app/view-switcher";
import { StatusBadge } from "@/components/app/bits";
import { CollectionBoard } from "@/components/app/collection-board";
import { Thumb } from "@/components/thumb";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { PRODUCTS, COLLECTIONS } from "@/lib/mock/data";
import type { Product } from "@/lib/mock/types";
import { cn } from "@/lib/utils";

const seasonOf = (name: string) => name.split(" — ")[0];
const money = (n: number) => `$${n.toLocaleString("en-US")}`;

export default function CollectionsPage() {
  const [view, setView] = React.useState<"collections" | "board">("collections");
  const [names, setNames] = React.useState<string[]>(COLLECTIONS);
  const [openName, setOpenName] = React.useState<string | null>(null);
  const [prices, setPrices] = React.useState<Record<string, number>>({});
  const [newOpen, setNewOpen] = React.useState(false);
  const [newName, setNewName] = React.useState("");

  const productsOf = (name: string) => PRODUCTS.filter((p) => p.collection === name);
  const retailOf = (p: Product) => prices[p.id] ?? p.retailPrice ?? Math.round(p.bulkPrice * 4);
  const marginPct = (p: Product) => {
    const r = retailOf(p);
    return r > 0 ? Math.round(((r - p.bulkPrice) / r) * 100) : 0;
  };

  const openCollection = openName ? { name: openName, products: productsOf(openName) } : null;

  const createCollection = () => {
    const n = newName.trim();
    if (!n) return;
    setNames((xs) => (xs.includes(n) ? xs : [...xs, n]));
    setNewOpen(false);
    setNewName("");
    setOpenName(n);
    toast.success(`Created “${n}”`);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6 lg:p-8">
      <PageHeader
        title="Collections"
        description="Plan drops, manage products and pricing, and brainstorm on the board."
        actions={
          <div className="flex items-center gap-2">
            <ViewSwitcher
              value={view}
              onChange={(v) => { setView(v); setOpenName(null); }}
              options={[
                { id: "collections", label: "Collections", icon: LayoutGrid },
                { id: "board", label: "Board", icon: FrameIcon },
              ]}
            />
            {view === "collections" && !openCollection && (
              <Button size="sm" onClick={() => setNewOpen(true)}>
                <Plus className="size-4" /> New collection
              </Button>
            )}
          </div>
        }
      />

      {view === "board" ? (
        <div className="h-[calc(100vh-200px)] min-h-[520px] overflow-hidden rounded-xl border">
          <CollectionBoard />
        </div>
      ) : openCollection ? (
        <CollectionDetail
          name={openCollection.name}
          products={openCollection.products}
          retailOf={retailOf}
          marginPct={marginPct}
          onPrice={(id, v) => setPrices((p) => ({ ...p, [id]: v }))}
          onBack={() => setOpenName(null)}
          onOpenBoard={() => { setView("board"); setOpenName(null); }}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {names.map((name) => {
            const items = productsOf(name);
            const drops = new Set(items.map((p) => p.drop)).size;
            const retails = items.map(retailOf);
            const range =
              retails.length === 0
                ? "—"
                : Math.min(...retails) === Math.max(...retails)
                  ? money(Math.min(...retails))
                  : `${money(Math.min(...retails))}–${money(Math.max(...retails))}`;
            const avgMargin = items.length
              ? Math.round(items.reduce((s, p) => s + marginPct(p), 0) / items.length)
              : 0;
            return (
              <button
                key={name}
                onClick={() => setOpenName(name)}
                className="group flex flex-col rounded-xl border bg-card p-4 text-left transition-all hover:border-ink-faint/40 hover:shadow-md cursor-pointer"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{name}</p>
                    <p className="text-xs text-ink-faint">{items.length} products · {drops} drop{drops === 1 ? "" : "s"}</p>
                  </div>
                  <Badge variant="outline">{seasonOf(name)}</Badge>
                </div>

                {/* thumbnails */}
                <div className="mt-3 flex -space-x-2">
                  {items.slice(0, 5).map((p) => (
                    <span key={p.id} className="size-11 shrink-0 overflow-hidden rounded-lg border-2 border-card">
                      {p.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.image} alt="" className="size-full object-cover" />
                      ) : (
                        <Thumb seed={p.seed} />
                      )}
                    </span>
                  ))}
                  {items.length === 0 && (
                    <span className="flex h-11 items-center text-xs text-ink-faint">No products yet</span>
                  )}
                </div>

                <div className="mt-4 flex items-center justify-between text-xs text-ink-soft">
                  <span>{range}</span>
                  <span className="text-ink-faint">avg margin {avgMargin}%</span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      <Dialog open={newOpen} onOpenChange={setNewOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>New collection</DialogTitle>
            <DialogDescription>Group products under a season or capsule.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="col-name">Name</Label>
            <Input
              id="col-name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && createCollection()}
              placeholder="e.g. SS26 — Tidal"
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setNewOpen(false)}>Cancel</Button>
            <Button onClick={createCollection}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CollectionDetail({
  name,
  products,
  retailOf,
  marginPct,
  onPrice,
  onBack,
  onOpenBoard,
}: {
  name: string;
  products: Product[];
  retailOf: (p: Product) => number;
  marginPct: (p: Product) => number;
  onPrice: (id: string, v: number) => void;
  onBack: () => void;
  onOpenBoard: () => void;
}) {
  const drops = Array.from(new Set(products.map((p) => p.drop)));
  const retails = products.map(retailOf);
  const lineValue = products.reduce((s, p) => s + retailOf(p) * (p.quantityToOrder || 0), 0);
  const avgMargin = products.length
    ? Math.round(products.reduce((s, p) => s + marginPct(p), 0) / products.length)
    : 0;

  const stat = (label: string, value: string) => (
    <div className="rounded-xl border bg-card p-3">
      <p className="text-xs text-ink-faint">{label}</p>
      <p className="mt-0.5 text-lg font-medium tracking-tight">{value}</p>
    </div>
  );

  return (
    <div className="space-y-5">
      <button onClick={onBack} className="inline-flex items-center gap-1.5 text-sm text-ink-faint transition-colors hover:text-foreground cursor-pointer">
        <ArrowLeft className="size-4" /> Collections
      </button>

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="display text-2xl tracking-tight">{name}</h2>
            <Badge variant="outline">{seasonOf(name)}</Badge>
          </div>
          <p className="mt-1 text-sm text-ink-faint">{products.length} products across {drops.length} drop{drops.length === 1 ? "" : "s"}</p>
        </div>
        <Button variant="secondary" size="sm" onClick={onOpenBoard}>
          <FrameIcon className="size-4" /> Open on board
        </Button>
      </div>

      {/* stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stat("Products", String(products.length))}
        {stat("Price range", retails.length ? `$${Math.min(...retails)}–$${Math.max(...retails)}` : "—")}
        {stat("Avg margin", `${avgMargin}%`)}
        {stat("Projected line value", money(lineValue))}
      </div>

      {/* products by drop */}
      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed py-16 text-center text-ink-faint">
          <Package className="size-6" />
          <p className="text-sm">No products in this collection yet.</p>
        </div>
      ) : (
        drops.map((drop) => (
          <section key={drop}>
            <div className="mb-2 flex items-center gap-2">
              <Calendar className="size-3.5 text-ink-faint" />
              <h3 className="text-sm font-medium">{drop}</h3>
              <span className="text-xs text-ink-faint">{products.filter((p) => p.drop === drop).length}</span>
            </div>
            <div className="overflow-hidden rounded-xl border">
              <table className="w-full text-sm">
                <thead className="border-b bg-surface-2/40 text-left text-xs text-ink-faint">
                  <tr>
                    <th className="p-3 font-medium">Product</th>
                    <th className="hidden p-3 font-medium sm:table-cell">Status</th>
                    <th className="p-3 font-medium">Cost</th>
                    <th className="p-3 font-medium">Retail</th>
                    <th className="p-3 font-medium">Margin</th>
                    <th className="p-3" />
                  </tr>
                </thead>
                <tbody>
                  {products.filter((p) => p.drop === drop).map((p) => {
                    const m = marginPct(p);
                    return (
                      <tr key={p.id} className="border-b transition-colors last:border-0 hover:bg-elevated/40">
                        <td className="p-3">
                          <div className="flex items-center gap-2.5">
                            <span className="size-9 shrink-0 overflow-hidden rounded-md border">
                              {p.image ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={p.image} alt="" className="size-full object-cover" />
                              ) : (
                                <Thumb seed={p.seed} />
                              )}
                            </span>
                            <div className="min-w-0">
                              <p className="truncate font-medium">{p.name}</p>
                              <p className="text-xs text-ink-faint">{p.type}</p>
                            </div>
                          </div>
                        </td>
                        <td className="hidden p-3 sm:table-cell"><StatusBadge status={p.status} /></td>
                        <td className="tabular p-3 text-ink-soft">${p.bulkPrice}</td>
                        <td className="p-3">
                          <div className="flex items-center gap-1">
                            <span className="text-ink-faint">$</span>
                            <Input
                              type="number"
                              value={retailOf(p)}
                              onChange={(e) => onPrice(p.id, Number(e.target.value) || 0)}
                              onClick={(e) => e.stopPropagation()}
                              className="h-8 w-20"
                            />
                          </div>
                        </td>
                        <td className="tabular p-3">
                          <span className={cn(m >= 60 ? "text-good" : m >= 40 ? "text-warn" : "text-danger")}>{m}%</span>
                        </td>
                        <td className="p-3 text-right">
                          <Button asChild variant="ghost" size="sm">
                            <Link href={`/samples?product=${p.id}`}>
                              Open <ArrowRight className="size-3.5" />
                            </Link>
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        ))
      )}

      <p className="flex items-center gap-1.5 text-xs text-ink-faint">
        <Sparkles className="size-3.5 text-accent-ink" />
        Tip: use the Board to storyboard drops, then manage pricing & status here.
      </p>
    </div>
  );
}
