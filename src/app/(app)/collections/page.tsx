"use client";

import * as React from "react";
import Link from "next/link";
import {
  Plus,
  ArrowLeft,
  ArrowRight,
  Frame as FrameIcon,
  Package,
  Sparkles,
  Calendar,
  Megaphone,
  Newspaper,
  Share2,
  Image as ImageIcon,
} from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/app/page-header";
import { StatusBadge } from "@/components/app/bits";
import { CollectionBoard } from "@/components/app/collection-board";
import { Thumb } from "@/components/thumb";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
const compact = (n: number) =>
  n >= 1000 ? `$${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k` : `$${n}`;

type CollState = "Upcoming" | "In Production" | "Released" | "Live" | "Archived";
const STATE_VARIANT: Record<CollState, "default" | "accent" | "good"> = {
  Upcoming: "default",
  "In Production": "accent",
  Released: "good",
  Live: "good",
  Archived: "default",
};
const META: Record<string, { release: string; state: CollState; revenue?: number; unitsSold?: number }> = {
  "AW25 — Reliquary": { release: "Oct 2026", state: "In Production" },
  "SS25 — Saltwater": { release: "Mar 2026", state: "Released", revenue: 84200, unitsSold: 1240 },
  "Capsule 01 — Ember": { release: "Nov 2026", state: "Upcoming" },
  "Core Staples": { release: "Always-on", state: "Live", revenue: 129500, unitsSold: 3100 },
};
const metaOf = (name: string) => META[name] ?? { release: "TBD", state: "Upcoming" as CollState };

export default function CollectionsPage() {
  const [names, setNames] = React.useState<string[]>(COLLECTIONS);
  const [openName, setOpenName] = React.useState<string | null>(null);
  const [prices, setPrices] = React.useState<Record<string, number>>({});
  const [boardOpen, setBoardOpen] = React.useState(false);
  const [newOpen, setNewOpen] = React.useState(false);
  const [newName, setNewName] = React.useState("");

  const productsOf = (name: string) => PRODUCTS.filter((p) => p.collection === name);
  const retailOf = (p: Product) => prices[p.id] ?? p.retailPrice ?? Math.round(p.bulkPrice * 4);
  const marginPct = (p: Product) => {
    const r = retailOf(p);
    return r > 0 ? Math.round(((r - p.bulkPrice) / r) * 100) : 0;
  };
  const predicted = (items: Product[]) =>
    items.reduce((s, p) => s + retailOf(p) * (p.quantityToOrder || 0), 0);

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
    <div className="mx-auto max-w-6xl space-y-6 p-6 lg:p-8">
      <PageHeader
        title="Collections"
        description="Plan drops, manage products, pricing & content — and conceptualize on the board."
        actions={
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={() => setBoardOpen(true)}>
              <FrameIcon className="size-4" /> Concept board
            </Button>
            <Button size="sm" onClick={() => setNewOpen(true)}>
              <Plus className="size-4" /> New collection
            </Button>
          </div>
        }
      />

      {openCollection ? (
        <CollectionDetail
          name={openCollection.name}
          products={openCollection.products}
          retailOf={retailOf}
          marginPct={marginPct}
          predicted={predicted}
          onPrice={(id, v) => setPrices((p) => ({ ...p, [id]: v }))}
          onBack={() => setOpenName(null)}
          onOpenBoard={() => setBoardOpen(true)}
        />
      ) : (
        <div className="space-y-4">
          {names.map((name) => {
            const items = productsOf(name);
            const drops = new Set(items.map((p) => p.drop)).size;
            const meta = metaOf(name);
            const released = meta.revenue != null;
            const avgMargin = items.length
              ? Math.round(items.reduce((s, p) => s + marginPct(p), 0) / items.length)
              : 0;
            return (
              <button
                key={name}
                onClick={() => setOpenName(name)}
                className="group flex w-full flex-col gap-4 rounded-2xl border bg-card p-4 text-left transition-all hover:border-ink-faint/40 hover:shadow-md sm:flex-row sm:items-center cursor-pointer"
              >
                {/* hero images */}
                <div className="flex gap-2">
                  {items.slice(0, 4).map((p) => (
                    <span key={p.id} className="size-20 shrink-0 overflow-hidden rounded-xl border">
                      {p.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.image} alt="" className="size-full object-cover" />
                      ) : (
                        <Thumb seed={p.seed} />
                      )}
                    </span>
                  ))}
                  {items.length === 0 && (
                    <span className="flex size-20 items-center justify-center rounded-xl border border-dashed text-xs text-ink-faint">
                      Empty
                    </span>
                  )}
                </div>

                {/* info */}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-lg font-medium tracking-tight">{name}</p>
                    <Badge variant="outline">{seasonOf(name)}</Badge>
                    <Badge variant={STATE_VARIANT[meta.state]}>{meta.state}</Badge>
                  </div>
                  <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-faint">
                    <span className="flex items-center gap-1"><Calendar className="size-3.5" /> {released ? "Released" : "Target"} {meta.release}</span>
                    <span>·</span>
                    <span>{items.length} products</span>
                    <span>·</span>
                    <span>{drops} drop{drops === 1 ? "" : "s"}</span>
                    <span>·</span>
                    <span>avg margin {avgMargin}%</span>
                  </p>
                </div>

                {/* right metric */}
                <div className="shrink-0 text-right">
                  {released ? (
                    <>
                      <p className="text-lg font-medium tracking-tight text-good">{compact(meta.revenue!)}</p>
                      <p className="text-xs text-ink-faint">{meta.unitsSold?.toLocaleString()} units sold</p>
                    </>
                  ) : (
                    <>
                      <p className="text-lg font-medium tracking-tight">{compact(predicted(items))}</p>
                      <p className="text-xs text-ink-faint">projected revenue</p>
                    </>
                  )}
                </div>
                <ArrowRight className="hidden size-4 shrink-0 text-ink-faint transition-transform group-hover:translate-x-0.5 sm:block" />
              </button>
            );
          })}
        </div>
      )}

      {/* Concept board — a launched tool, not a view */}
      {boardOpen && (
        <div className="fixed inset-0 z-50 bg-paper">
          <CollectionBoard onClose={() => setBoardOpen(false)} />
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
  predicted,
  onPrice,
  onBack,
  onOpenBoard,
}: {
  name: string;
  products: Product[];
  retailOf: (p: Product) => number;
  marginPct: (p: Product) => number;
  predicted: (items: Product[]) => number;
  onPrice: (id: string, v: number) => void;
  onBack: () => void;
  onOpenBoard: () => void;
}) {
  const meta = metaOf(name);
  const released = meta.revenue != null;
  const drops = Array.from(new Set(products.map((p) => p.drop)));
  const retails = products.map(retailOf);
  const avgMargin = products.length
    ? Math.round(products.reduce((s, p) => s + marginPct(p), 0) / products.length)
    : 0;

  const stat = (label: string, value: string, accent?: string) => (
    <div className="rounded-xl border bg-card p-3">
      <p className="text-xs text-ink-faint">{label}</p>
      <p className={cn("mt-0.5 text-lg font-medium tracking-tight", accent)}>{value}</p>
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
            <Badge variant={STATE_VARIANT[meta.state]}>{meta.state}</Badge>
          </div>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-ink-faint">
            <Calendar className="size-3.5" /> {released ? "Released" : "Target"} {meta.release}
          </p>
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
        {released
          ? stat("Revenue", money(meta.revenue!), "text-good")
          : stat("Projected revenue", money(predicted(products)))}
      </div>

      <Tabs defaultValue="products">
        <TabsList>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="content">Campaign &amp; Content</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="mt-4 space-y-5">
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
                <div className="overflow-x-auto rounded-xl border">
                  <table className="w-full text-sm">
                    <thead className="border-b bg-surface-2/40 text-left text-xs text-ink-faint">
                      <tr>
                        <th className="p-3 font-medium">Product</th>
                        <th className="p-3 font-medium">Status</th>
                        <th className="p-3 font-medium">Cost</th>
                        <th className="p-3 font-medium">Retail</th>
                        <th className="p-3 font-medium">Margin</th>
                        <th className="hidden p-3 font-medium sm:table-cell">Proj. rev</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.filter((p) => p.drop === drop).map((p) => {
                        const m = marginPct(p);
                        return (
                          <tr key={p.id} className="border-b transition-colors last:border-0 hover:bg-elevated/40">
                            <td className="p-3">
                              <Link href={`/samples?product=${p.id}`} className="group flex items-center gap-2.5">
                                <span className="size-9 shrink-0 overflow-hidden rounded-md border">
                                  {p.image ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={p.image} alt="" className="size-full object-cover" />
                                  ) : (
                                    <Thumb seed={p.seed} />
                                  )}
                                </span>
                                <div className="min-w-0">
                                  <p className="truncate font-medium group-hover:text-accent-ink">{p.name}</p>
                                  <p className="text-xs text-ink-faint">{p.type}</p>
                                </div>
                              </Link>
                            </td>
                            <td className="p-3">
                              <Link href={`/samples?product=${p.id}`} title="Check product status">
                                <StatusBadge status={p.status} />
                              </Link>
                            </td>
                            <td className="tabular p-3 text-ink-soft">${p.bulkPrice}</td>
                            <td className="p-3">
                              <div className="flex items-center gap-1">
                                <span className="text-ink-faint">$</span>
                                <Input
                                  type="number"
                                  value={retailOf(p)}
                                  onChange={(e) => onPrice(p.id, Number(e.target.value) || 0)}
                                  className="h-8 w-20"
                                />
                              </div>
                            </td>
                            <td className="tabular p-3">
                              <span className={cn(m >= 60 ? "text-good" : m >= 40 ? "text-warn" : "text-danger")}>{m}%</span>
                            </td>
                            <td className="tabular hidden p-3 text-ink-soft sm:table-cell">
                              {compact(retailOf(p) * (p.quantityToOrder || 0))}
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
        </TabsContent>

        <TabsContent value="content" className="mt-4">
          <p className="mb-3 text-sm text-ink-soft">
            A collection is more than garments — keep its campaign, editorial, social, and mockups here too.
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {[
              { icon: Megaphone, title: "Campaign", desc: "Lookbook, hero shots, launch plan", href: "/moodboard" },
              { icon: Newspaper, title: "Editorial", desc: "Story, copy, press", href: "/moodboard" },
              { icon: Share2, title: "Social posts", desc: "Grid, reels, teasers", href: "/ad-studio" },
              { icon: ImageIcon, title: "Product mockups", desc: "Flats & 3D from the Asset Library", href: "/assets" },
            ].map((c) => (
              <Link
                key={c.title}
                href={c.href}
                className="group flex items-center gap-3 rounded-xl border bg-card p-4 transition-colors hover:border-ink-faint/40 hover:bg-surface-hi"
              >
                <span className="flex size-10 items-center justify-center rounded-lg bg-surface-hi text-ink-soft">
                  <c.icon className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{c.title}</p>
                  <p className="text-xs text-ink-faint">{c.desc}</p>
                </div>
                <ArrowRight className="size-4 text-ink-faint transition-transform group-hover:translate-x-0.5" />
              </Link>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <p className="flex items-center gap-1.5 text-xs text-ink-faint">
        <Sparkles className="size-3.5 text-accent-ink" />
        Tip: open the Concept board to storyboard drops, then manage pricing & content here.
      </p>
    </div>
  );
}
