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
  CalendarDays,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Search,
  ImagePlus,
} from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/app/page-header";
import { ProductDetail } from "@/components/app/product-detail";
import { ViewSwitcher } from "@/components/app/view-switcher";
import { PriorityDot, StatusBadge } from "@/components/app/bits";
import { Thumb } from "@/components/thumb";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { CalendarView } from "@/components/app/calendar-view";
import { quickMargin } from "@/lib/costing";
import {
  PRODUCTS,
  TRACKS,
  STATUS_TONE,
  COLLECTIONS,
  PRODUCT_TYPES,
  manufacturer,
} from "@/lib/mock/data";
import { CALENDAR_EVENTS } from "@/lib/mock/commerce";
import type { Product, SampleStatus, Track, Priority, ActivityEntry } from "@/lib/mock/types";
import { cn } from "@/lib/utils";

const TODAY_ISO = "2026-06-27";
const PRIORITIES: Priority[] = ["Urgent", "High", "Medium", "Low"];

type View = "board" | "table" | "gallery" | "calendar";

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
type SortKey = "name" | "type" | "status" | "priority" | "margin";

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
    } else if (sort.key === "margin") {
      av = quickMargin(a).marginPct;
      bv = quickMargin(b).marginPct;
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
      <div className="min-w-[760px]">
        <div className="grid grid-cols-[2fr_0.9fr_1.1fr_0.9fr_0.8fr_1.2fr] items-center gap-4 border-b bg-surface-2/40 px-4 py-2.5">
          <Th k="name" label="Product" />
          <Th k="type" label="Type" />
          <Th k="status" label="Status" />
          <Th k="priority" label="Priority" />
          <Th k="margin" label="Margin" />
          <span className="text-xs font-medium text-ink-faint">Manufacturer</span>
        </div>
        {sorted.map((p) => {
          const mf = manufacturer(p.manufacturerId);
          return (
            <button
              key={p.id}
              onClick={() => onOpen(p)}
              className="grid h-12 w-full grid-cols-[2fr_0.9fr_1.1fr_0.9fr_0.8fr_1.2fr] items-center gap-4 border-b px-4 text-left transition-colors last:border-0 hover:bg-elevated/40 cursor-pointer"
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
              <span className="tabular text-xs">
                {p.bulkPrice > 0 ? (
                  <span className={quickMargin(p).marginPct >= 50 ? "text-good" : "text-ink-soft"}>
                    {quickMargin(p).marginPct.toFixed(0)}%
                  </span>
                ) : (
                  <span className="text-ink-faint">—</span>
                )}
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
function GalleryCard({ p, onOpen }: { p: Product; onOpen: (p: Product) => void }) {
  return (
    <button onClick={() => onOpen(p)} className="group text-left cursor-pointer">
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
  );
}

function GalleryView({
  products,
  onOpen,
}: {
  products: Product[];
  onOpen: (p: Product) => void;
}) {
  const [groupBy, setGroupBy] = React.useState<"all" | "collection" | "drop">("all");

  // Preserve first-seen order of groups.
  const groups: { key: string; items: Product[] }[] = [];
  if (groupBy === "all") {
    groups.push({ key: "", items: products });
  } else {
    for (const p of products) {
      const key = (groupBy === "collection" ? p.collection : p.drop) || "Unassigned";
      let g = groups.find((x) => x.key === key);
      if (!g) {
        g = { key, items: [] };
        groups.push(g);
      }
      g.items.push(p);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <span className="text-xs text-ink-faint">Group by</span>
        <div className="flex items-center gap-0.5 rounded-lg border bg-surface-2/60 p-0.5">
          {(["all", "collection", "drop"] as const).map((g) => (
            <button
              key={g}
              onClick={() => setGroupBy(g)}
              className={cn(
                "rounded-md px-2.5 py-1 text-[13px] font-medium capitalize transition-colors cursor-pointer",
                groupBy === g ? "bg-card text-foreground shadow-sm" : "text-ink-soft hover:text-foreground",
              )}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {groups.map((g) => (
        <section key={g.key} className="space-y-3">
          {g.key && (
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-medium">{g.key}</h3>
              <span className="tabular flex size-5 items-center justify-center rounded-md bg-surface-hi text-[11px] text-ink-soft">
                {g.items.length}
              </span>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {g.items.map((p) => (
              <GalleryCard key={p.id} p={p} onOpen={onOpen} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

const slug = (s: string) =>
  "p-" + s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 40);

function AddProductDialog({
  open,
  onOpenChange,
  onCreate,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreate: (p: Product) => void;
}) {
  const empty = {
    name: "",
    type: PRODUCT_TYPES[0],
    collection: COLLECTIONS[0],
    drop: "",
    priority: "Medium" as Priority,
    status: "Concept" as SampleStatus,
    image: "",
  };
  const [form, setForm] = React.useState(empty);
  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const onFile = (file?: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => set("image", String(reader.result));
    reader.readAsDataURL(file);
  };

  const create = () => {
    if (!form.name.trim()) {
      toast.error("Name is required");
      return;
    }
    onCreate({
      id: `${slug(form.name)}-${Date.now().toString(36)}`,
      name: form.name.trim(),
      type: form.type,
      collection: form.collection,
      drop: form.drop.trim() || "Unassigned",
      priority: form.priority,
      assigneeId: "m-sasha",
      manufacturerId: null,
      status: form.status,
      seed: slug(form.name).slice(2),
      image: form.image || undefined,
      moq: 0,
      pricePerUnit: 0,
      bulkPrice: 0,
      quantityToOrder: 0,
      statusSince: TODAY_ISO,
      rounds: [],
      files: [],
      activity: [{ id: `a-${Date.now()}`, who: "Grisha Obolenskiy", action: "created product", at: "just now" }],
    });
    setForm(empty);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>New product</DialogTitle>
          <DialogDescription>Add a product to the pipeline.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Name</Label>
            <Input
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="e.g. Reliquary Zip Hoodie"
              autoFocus
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Type</Label>
              <Select value={form.type} onValueChange={(v) => set("type", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PRODUCT_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Priority</Label>
              <Select value={form.priority} onValueChange={(v) => set("priority", v as Priority)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PRIORITIES.map((p) => (
                    <SelectItem key={p} value={p}>
                      <span className="flex items-center gap-2">
                        <PriorityDot priority={p} /> {p}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Collection</Label>
              <Select value={form.collection} onValueChange={(v) => set("collection", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {COLLECTIONS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => set("status", v as SampleStatus)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TRACKS.map((track) => (
                    <SelectGroup key={track.track}>
                      <SelectLabel>{track.track}</SelectLabel>
                      {track.statuses.map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectGroup>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Drop</Label>
            <Input
              value={form.drop}
              onChange={(e) => set("drop", e.target.value)}
              placeholder="e.g. Drop 01 · Oct 2026"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Photo</Label>
            {form.image ? (
              <div className="flex items-center gap-3">
                <span className="size-16 shrink-0 overflow-hidden rounded-lg border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={form.image} alt="" className="h-full w-full object-cover" />
                </span>
                <Button variant="ghost" size="sm" onClick={() => set("image", "")}>
                  Remove
                </Button>
              </div>
            ) : (
              <label
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  onFile(e.dataTransfer.files?.[0]);
                }}
                className="flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed py-6 text-sm text-ink-faint transition-colors hover:border-ink-faint/50 hover:text-ink-soft"
              >
                <ImagePlus className="size-5" />
                <span>Drop or click to upload a photo</span>
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) => onFile(e.target.files?.[0])}
                />
              </label>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={create}>Create product</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function SamplesPage() {
  const [products, setProducts] = React.useState<Product[]>(PRODUCTS);
  const [view, setView] = React.useState<View>("board");
  const [filter, setFilter] = React.useState<"All" | Track>("All");
  const [query, setQuery] = React.useState("");
  const [fCollection, setFCollection] = React.useState("all");
  const [fType, setFType] = React.useState("all");
  const [fPriority, setFPriority] = React.useState("all");
  const [addOpen, setAddOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<Product | null>(null);
  const [open, setOpen] = React.useState(false);
  const dragId = React.useRef<string | null>(null);
  const [dragOver, setDragOver] = React.useState<SampleStatus | null>(null);

  const visibleTracks =
    filter === "All" ? TRACKS : TRACKS.filter((t) => t.track === filter);

  const isFiltering =
    query.trim() !== "" ||
    fCollection !== "all" ||
    fType !== "all" ||
    fPriority !== "all";

  const filtered = products
    .filter(
      (p) =>
        filter === "All" ||
        TRACKS.find((t) => t.track === filter)?.statuses.includes(p.status),
    )
    .filter((p) => fCollection === "all" || p.collection === fCollection)
    .filter((p) => fType === "all" || p.type === fType)
    .filter((p) => fPriority === "all" || p.priority === fPriority)
    .filter((p) =>
      query.trim()
        ? (p.name + p.type + p.collection).toLowerCase().includes(query.toLowerCase())
        : true,
    );

  const openProduct = (p: Product) => {
    setSelected(p);
    setOpen(true);
  };

  // Deep link: /samples?product=ID opens that product's panel.
  React.useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("product");
    if (!id) return;
    const p = products.find((x) => x.id === id);
    if (p) {
      setSelected(p);
      setOpen(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const logEntry = (action: string): ActivityEntry => ({
    id: `a-${Date.now()}`,
    who: "Grisha Obolenskiy",
    action,
    at: "just now",
  });

  /** Patch a product and optionally record an activity-log entry. */
  const applyPatch = (id: string, patch: Partial<Product>, action?: string) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, ...patch, activity: action ? [logEntry(action), ...p.activity] : p.activity }
          : p,
      ),
    );
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    setOpen(false);
    toast.success("Product deleted");
  };

  const createProduct = (p: Product) => {
    setProducts((prev) => [p, ...prev]);
    toast.success(`Created "${p.name}"`);
  };

  const drop = (status: SampleStatus) => {
    const id = dragId.current;
    setDragOver(null);
    if (!id) return;
    const moved = products.find((p) => p.id === id);
    if (moved && moved.status !== status) {
      applyPatch(id, { status, statusSince: TODAY_ISO }, `moved to ${status}`);
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
                  { id: "calendar", label: "Calendar", icon: CalendarDays },
                ]}
              />
              <Button size="sm" onClick={() => setAddOpen(true)}>
                <Plus className="size-4" /> New product
              </Button>
            </div>
          }
        />
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 rounded-lg bg-surface-2 p-1">
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

          <div className="relative min-w-[180px] flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-faint" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products…"
              className="h-9 pl-9"
            />
          </div>

          <Select value={fCollection} onValueChange={setFCollection}>
            <SelectTrigger size="sm" className="w-auto min-w-[130px]">
              <SelectValue placeholder="Collection" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All collections</SelectItem>
              {COLLECTIONS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={fType} onValueChange={setFType}>
            <SelectTrigger size="sm" className="w-auto min-w-[110px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              {PRODUCT_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={fPriority} onValueChange={setFPriority}>
            <SelectTrigger size="sm" className="w-auto min-w-[110px]">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All priorities</SelectItem>
              {PRIORITIES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Board */}
      {view === "board" && (
        <div className="min-h-0 flex-1 overflow-x-auto px-6 pb-6 lg:px-8">
          <div className="flex h-full gap-6">
            {visibleTracks.map((track) => {
              // When filtering/searching, collapse empty columns and empty tracks.
              const statuses = isFiltering
                ? track.statuses.filter((s) => filtered.some((p) => p.status === s))
                : track.statuses;
              if (isFiltering && statuses.length === 0) return null;
              return (
              <div key={track.track} className="flex h-full flex-col">
                <div className="mb-3 flex items-center gap-2">
                  <span className={cn("size-2 rounded-full", TRACK_ACCENT[track.track])} />
                  <h2 className="text-sm font-medium">{track.track}</h2>
                </div>
                <div className="flex h-full gap-3">
                  {statuses.map((status) => {
                    const cards = filtered.filter((p) => p.status === status);
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
              );
            })}
          </div>
        </div>
      )}

      {/* Table */}
      {view === "table" && (
        <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6 lg:px-8">
          <TableView products={filtered} onOpen={openProduct} />
        </div>
      )}

      {/* Gallery */}
      {view === "gallery" && (
        <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6 lg:px-8">
          <GalleryView products={filtered} onOpen={openProduct} />
        </div>
      )}

      {view === "calendar" && (
        <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6 lg:px-8">
          <CalendarView
            events={CALENDAR_EVENTS.filter(
              (e) => e.type === "sample" || e.type === "production",
            )}
            types={["sample", "production"]}
          />
        </div>
      )}

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-full p-0 sm:max-w-lg">
          {selected && (
            <ProductDetail
              product={products.find((p) => p.id === selected.id) ?? selected}
              onUpdate={(patch, action) => applyPatch(selected.id, patch, action)}
              onDelete={() => deleteProduct(selected.id)}
            />
          )}
        </SheetContent>
      </Sheet>

      <AddProductDialog open={addOpen} onOpenChange={setAddOpen} onCreate={createProduct} />
    </div>
  );
}
