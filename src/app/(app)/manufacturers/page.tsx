"use client";

import * as React from "react";
import Link from "next/link";
import {
  Plus,
  Star,
  Globe,
  Mail,
  MessageCircle,
  Factory,
  Package,
  Send,
  Sparkles,
  FileText,
  Clock,
  ArrowRight,
  Search,
  Wand2,
  LayoutGrid,
  Rows3,
  BadgeCheck,
  Check,
  GitCompare,
} from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/app/page-header";
import { ViewSwitcher } from "@/components/app/view-switcher";
import { Thumb } from "@/components/thumb";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MANUFACTURERS, PRODUCTS } from "@/lib/mock/data";
import type {
  Manufacturer,
  ManufacturerStatus,
  CommLogEntry,
  Capability,
} from "@/lib/mock/types";
import { cn } from "@/lib/utils";

const STATUS_VARIANT: Record<
  ManufacturerStatus,
  "good" | "accent" | "default" | "danger"
> = {
  Active: "good",
  Sampling: "accent",
  Inactive: "default",
  Blacklisted: "danger",
};

const minMoq = (m: Manufacturer) =>
  m.capabilities.length ? Math.min(...m.capabilities.map((c) => c.moq)) : 0;
const sampleLeadRange = (m: Manufacturer) => {
  if (!m.capabilities.length) return "—";
  const v = m.capabilities.map((c) => c.sampleLeadDays);
  const lo = Math.min(...v),
    hi = Math.max(...v);
  return lo === hi ? `${lo}d` : `${lo}–${hi}d`;
};

// Estimated full-order cost = (avg unit price + per-unit shipping) × MOQ.
function shipmentTotal(c: Capability) {
  const cur = c.avgUnitPrice.includes("€") ? "€" : "$";
  const unit = parseFloat(c.avgUnitPrice.replace(/[^0-9.]/g, "")) || 0;
  const ship = parseFloat(c.shippingEst.replace(/[^0-9.]/g, "")) || 0;
  const total = (unit + ship) * c.moq;
  return `${cur}${total.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

const num = (s: string) => parseFloat(s.replace(/[^0-9.]/g, "")) || 0;
const minSampleLead = (m: Manufacturer) =>
  m.capabilities.length ? Math.min(...m.capabilities.map((c) => c.sampleLeadDays)) : Infinity;
const fromPrice = (m: Manufacturer) => {
  const prices = m.capabilities.map((c) => num(c.avgUnitPrice)).filter((n) => n > 0);
  if (!prices.length) return "—";
  const cur = m.capabilities.some((c) => c.avgUnitPrice.includes("€")) ? "€" : "$";
  return `${cur}${Math.min(...prices)}`;
};

// ── AI finder: "who can make a woven cashmere sweater?" ───────
const STOP = new Set([
  "a", "an", "the", "who", "can", "could", "make", "makes", "making", "made", "my", "from", "list",
  "factory", "factories", "manufacturer", "manufacturers", "need", "want", "someone", "that", "for",
  "with", "of", "and", "to", "do", "does", "i", "we", "which", "any", "is", "are", "me", "produce", "in",
]);
type Match = { m: Manufacturer; score: number; reasons: string[] };
function aiFind(list: Manufacturer[], query: string): Match[] {
  const q = query.toLowerCase();
  const tokens = q.replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter((w) => w.length > 2 && !STOP.has(w));
  if (!tokens.length) return [];
  return list
    .map((m) => {
      let score = 0;
      const reasons = new Set<string>();
      m.capabilities.forEach((c) => {
        const p = c.product.toLowerCase();
        if (q.includes(p)) { score += 4; reasons.add(`makes ${c.product}`); }
        else {
          const hits = p.split(/\s+/).filter((w) => tokens.includes(w));
          if (hits.length) { score += 2 * hits.length; reasons.add(`makes ${c.product}`); }
        }
      });
      m.categories.forEach((cat) => {
        const hits = cat.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean).filter((w) => tokens.includes(w));
        if (hits.length) { score += 1; reasons.add(cat); }
      });
      return { m, score, reasons: [...reasons] };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || b.m.rating - a.m.rating);
}

function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={cn(
            "size-3.5",
            i <= Math.round(rating) ? "fill-warn text-warn" : "text-ink-faint/40",
          )}
        />
      ))}
      <span className="tabular ml-1 text-xs text-ink-soft">{rating.toFixed(1)}</span>
    </span>
  );
}

function ProfileSheet({
  mf,
  onAddNote,
}: {
  mf: Manufacturer;
  onAddNote: (id: string, note: string) => void;
}) {
  const [note, setNote] = React.useState("");
  const [bulkView, setBulkView] = React.useState(false);
  const linked = PRODUCTS.filter((p) => p.manufacturerId === mf.id);

  const ContactRow = ({
    icon: Icon,
    label,
    value,
  }: {
    icon: typeof Mail;
    label: string;
    value: string;
  }) => (
    <div className="flex items-center gap-3 py-2">
      <span className="flex size-8 items-center justify-center rounded-md bg-surface-hi">
        <Icon className="size-4 text-ink-soft" />
      </span>
      <div className="min-w-0">
        <p className="text-xs text-ink-faint">{label}</p>
        <p className="truncate text-sm">{value}</p>
      </div>
    </div>
  );

  return (
    <>
      <SheetHeader>
        <div className="flex items-start gap-3">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-lg border bg-surface-2 text-2xl">
            {mf.flag}
          </span>
          <div className="min-w-0 flex-1">
            <SheetTitle>{mf.name}</SheetTitle>
            <SheetDescription>
              {mf.country} · {mf.contactPerson}
            </SheetDescription>
            <div className="mt-2 flex items-center gap-2">
              <Badge variant={STATUS_VARIANT[mf.status]}>{mf.status}</Badge>
              <Stars rating={mf.rating} />
            </div>
          </div>
        </div>
      </SheetHeader>

      {/* Overview — reliability + relationship at a glance */}
      <div className="border-b px-5 pb-4">
        <div className="grid grid-cols-4 gap-2">
          {[
            ["On-time", mf.onTimePct != null ? `${mf.onTimePct}%` : "—"],
            ["Responds", mf.responseTime ?? "—"],
            ["Partner since", mf.since ?? "—"],
            ["Capacity", mf.capacity ?? "—"],
          ].map(([k, v]) => (
            <div key={k} className="rounded-lg border bg-surface-2/40 p-2.5 text-center">
              <p className="truncate text-sm font-medium">{v}</p>
              <p className="mt-0.5 text-[10px] uppercase tracking-wider text-ink-faint">{k}</p>
            </div>
          ))}
        </div>
        {mf.certifications && mf.certifications.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] text-ink-faint">Certifications</span>
            {mf.certifications.map((c) => (
              <Badge key={c} variant="outline"><BadgeCheck className="size-3 text-good" /> {c}</Badge>
            ))}
          </div>
        )}
      </div>

      <Tabs defaultValue="capabilities" className="flex min-h-0 flex-1 flex-col gap-0">
        <div className="px-5 pt-4">
          <TabsList className="w-full">
            <TabsTrigger value="capabilities" className="flex-1">Capabilities</TabsTrigger>
            <TabsTrigger value="contact" className="flex-1">Contact</TabsTrigger>
            <TabsTrigger value="products" className="flex-1">
              Products
              {linked.length > 0 && (
                <Badge variant="outline" className="ml-1 px-1">{linked.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="comms" className="flex-1">Log</TabsTrigger>
          </TabsList>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-5">
          {/* Capabilities — per-product terms */}
          <TabsContent value="capabilities" className="mt-0 space-y-5">
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wider text-ink-faint">
                Specializations
              </p>
              <div className="flex flex-wrap gap-1.5">
                {mf.categories.map((c) => (
                  <Badge key={c} variant="accent">{c}</Badge>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs font-medium uppercase tracking-wider text-ink-faint">
                  Products they make
                </p>
                <label className="flex cursor-pointer items-center gap-2 text-xs text-ink-soft">
                  Full order
                  <Switch checked={bulkView} onCheckedChange={setBulkView} />
                </label>
              </div>
              <div className="space-y-2">
                {mf.capabilities.map((c) => (
                  <div key={c.product} className="rounded-lg border bg-surface-2/40 p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{c.product}</span>
                      {bulkView ? (
                        <span className="text-sm font-medium text-accent-ink">
                          {shipmentTotal(c)}{" "}
                          <span className="text-xs font-normal text-ink-faint">
                            / {c.moq} units
                          </span>
                        </span>
                      ) : (
                        <span className="text-sm">
                          {c.avgUnitPrice}{" "}
                          <span className="text-xs text-ink-faint">/ unit avg</span>
                        </span>
                      )}
                    </div>
                    <div className="mt-2.5 grid grid-cols-3 gap-x-2 gap-y-2 text-xs">
                      {[
                        ["MOQ", String(c.moq)],
                        ["Sample", c.sampleCost],
                        ["Shipping", c.shippingEst],
                        ["Sample lead", `${c.sampleLeadDays}d`],
                        ["Bulk lead", `${c.bulkLeadDays}d`],
                      ].map(([k, v]) => (
                        <div key={k}>
                          <p className="text-ink-faint">{k}</p>
                          <p className="text-ink-soft">{v}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-2 flex items-center gap-1 text-[11px] text-ink-faint">
                <Clock className="size-3" />
                Avg unit price varies per design · shipping is an estimate by weight &amp; country
              </p>
            </div>

            <div className="rounded-lg border bg-surface-2/40 p-3 text-sm">
              <p className="text-xs text-ink-faint">Payment terms</p>
              <p>{mf.paymentTerms}</p>
            </div>

            {mf.files.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wider text-ink-faint">
                  Files
                </p>
                <div className="space-y-2">
                  {mf.files.map((f) => (
                    <div key={f.id} className="flex items-center gap-3 rounded-lg border bg-surface-2/40 p-2.5">
                      <FileText className="size-4 text-ink-soft" />
                      <span className="flex-1 truncate text-sm">{f.name}</span>
                      <span className="text-xs text-ink-faint">{f.size}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          {/* Contact */}
          <TabsContent value="contact" className="mt-0">
            <div className="divide-y">
              <ContactRow icon={Factory} label="Contact person" value={mf.contactPerson} />
              <ContactRow icon={Mail} label="Email" value={mf.email} />
              <ContactRow icon={MessageCircle} label="WhatsApp" value={mf.whatsapp} />
              <ContactRow icon={Globe} label="Website" value={mf.website} />
            </div>
          </TabsContent>

          {/* Linked products */}
          <TabsContent value="products" className="mt-0 space-y-2">
            {linked.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-12 text-center text-ink-faint">
                <Package className="size-6" />
                <p className="text-sm">No linked products yet</p>
              </div>
            ) : (
              linked.map((p) => (
                <Link
                  key={p.id}
                  href={`/samples?product=${p.id}`}
                  className="group flex items-center gap-3 rounded-lg border bg-surface-2/40 p-2.5 transition-colors hover:border-ink-faint/40 hover:bg-surface-hi"
                >
                  <span className="size-10 shrink-0 overflow-hidden rounded-md border">
                    {p.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.image} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <Thumb seed={p.seed} />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{p.name}</p>
                    <p className="text-xs text-ink-faint">{p.status}</p>
                  </div>
                  <ArrowRight className="size-4 text-ink-faint opacity-0 transition-opacity group-hover:opacity-100" />
                </Link>
              ))
            )}
          </TabsContent>

          {/* Comms */}
          <TabsContent value="comms" className="mt-0 space-y-4">
            <div className="flex gap-2">
              <Input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add a note…"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && note.trim()) {
                    onAddNote(mf.id, note.trim());
                    setNote("");
                  }
                }}
              />
              <Button
                size="icon"
                className="shrink-0"
                disabled={!note.trim()}
                onClick={() => {
                  onAddNote(mf.id, note.trim());
                  setNote("");
                }}
              >
                <Send className="size-4" />
              </Button>
            </div>
            {mf.commLog.length === 0 ? (
              <p className="py-8 text-center text-sm text-ink-faint">
                No communication logged yet.
              </p>
            ) : (
              <ol className="space-y-3">
                {mf.commLog.map((c) => (
                  <li key={c.id} className="rounded-lg border bg-surface-2/40 p-3">
                    <p className="text-xs text-ink-faint">{c.date}</p>
                    <p className="mt-0.5 text-sm">{c.note}</p>
                  </li>
                ))}
              </ol>
            )}
          </TabsContent>
        </div>
      </Tabs>
    </>
  );
}

const EMPTY_FORM = {
  name: "",
  country: "China",
  contactPerson: "",
  email: "",
  whatsapp: "",
  website: "",
  paymentTerms: "",
  categories: "",
  capProduct: "",
  capMoq: "",
  capSampleCost: "",
  capSampleLead: "",
  capBulkLead: "",
};

function AddDialog({
  open,
  onOpenChange,
  onCreate,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreate: (m: Manufacturer) => void;
}) {
  const [form, setForm] = React.useState(EMPTY_FORM);
  const [url, setUrl] = React.useState("");
  const [scraping, setScraping] = React.useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const scrape = () => {
    if (!url.trim()) return;
    setScraping(true);
    setTimeout(() => {
      setForm({
        name: "Lisbon Premium Garments",
        country: "Portugal",
        contactPerson: "Rui Marques",
        email: "hello@lisbongarments.pt",
        whatsapp: "+351 910 222 333",
        website: url.replace(/^https?:\/\//, "").replace(/\/$/, ""),
        paymentTerms: "50% deposit / 50% on delivery",
        categories: "Cut & Sew, Jersey, Outerwear",
        capProduct: "T-Shirt",
        capMoq: "120",
        capSampleCost: "€55",
        capSampleLead: "12",
        capBulkLead: "35",
      });
      setScraping(false);
      toast.success("Scraped manufacturer details", {
        description: "Review the auto-filled fields before saving.",
      });
    }, 1100);
  };

  const create = () => {
    if (!form.name.trim()) {
      toast.error("Name is required");
      return;
    }
    const capabilities: Capability[] = form.capProduct
      ? [
          {
            product: form.capProduct,
            moq: Number(form.capMoq) || 100,
            sampleCost: form.capSampleCost || "TBD",
            sampleLeadDays: Number(form.capSampleLead) || 14,
            bulkLeadDays: Number(form.capBulkLead) || 40,
            avgUnitPrice: "TBD",
            shippingEst: "TBD",
          },
        ]
      : [];
    onCreate({
      id: `mf-${Date.now()}`,
      name: form.name,
      country: form.country,
      flag: { China: "🇨🇳", Portugal: "🇵🇹", Turkey: "🇹🇷", India: "🇮🇳" }[form.country] ?? "🏳️",
      status: "Sampling",
      categories: form.categories
        ? form.categories.split(",").map((c) => c.trim()).filter(Boolean)
        : ["General"],
      capabilities,
      contactPerson: form.contactPerson || "—",
      whatsapp: form.whatsapp || "—",
      email: form.email || "—",
      website: form.website || "—",
      paymentTerms: form.paymentTerms || "TBD",
      rating: 0,
      seed: form.name,
      commLog: [],
      files: [],
    });
    setForm(EMPTY_FORM);
    setUrl("");
    onOpenChange(false);
    toast.success(`Added ${form.name}`);
  };

  // Called as a function (not <Field/>) so inputs aren't remounted on each keystroke.
  const field = ({
    label,
    k,
    type = "text",
    placeholder,
    full,
  }: {
    label: string;
    k: keyof typeof form;
    type?: string;
    placeholder?: string;
    full?: boolean;
  }) => (
    <div key={k} className={cn("space-y-1.5", full && "col-span-2")}>
      <Label>{label}</Label>
      <Input value={form[k]} onChange={set(k)} type={type} placeholder={placeholder} />
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add manufacturer</DialogTitle>
          <DialogDescription>
            Paste a website to auto-fill, or enter details manually.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-lg border border-dashed bg-surface-2/40 p-3">
          <Label className="mb-2 text-xs text-ink-soft">
            <Sparkles className="size-3.5 text-accent-ink" /> Auto-fill from URL
          </Label>
          <div className="flex gap-2">
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://factory-website.com"
            />
            <Button onClick={scrape} disabled={scraping || !url.trim()} className="shrink-0">
              {scraping ? "Scraping…" : "Scrape"}
            </Button>
          </div>
        </div>

        <div className="grid max-h-[50vh] grid-cols-2 gap-x-4 gap-y-3 overflow-y-auto pr-1">
          {field({ label: "Name", k: "name", placeholder: "Factory name", full: true })}
          <div className="space-y-1.5">
            <Label>Country</Label>
            <Select value={form.country} onValueChange={(v) => setForm((f) => ({ ...f, country: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {["China", "Portugal", "Turkey", "India"].map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {field({ label: "Contact person", k: "contactPerson" })}
          {field({ label: "Email", k: "email", type: "email" })}
          {field({ label: "WhatsApp", k: "whatsapp" })}
          {field({ label: "Website", k: "website" })}
          {field({ label: "Payment terms", k: "paymentTerms" })}
          {field({ label: "Specializations (comma-separated)", k: "categories", placeholder: "Knitwear, Cut & Sew", full: true })}

          <div className="col-span-2 mt-1 rounded-lg border bg-surface-2/30 p-3">
            <p className="mb-2 text-xs font-medium text-ink-soft">Primary product (terms vary per product)</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
              {field({ label: "Product", k: "capProduct", placeholder: "e.g. Hoodie" })}
              {field({ label: "MOQ", k: "capMoq", type: "number" })}
              {field({ label: "Sample cost", k: "capSampleCost", placeholder: "$45" })}
              {field({ label: "Sample lead (days)", k: "capSampleLead", type: "number" })}
              {field({ label: "Bulk lead (days)", k: "capBulkLead", type: "number" })}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={create}>Add manufacturer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const SORTS: { id: "rating" | "moq" | "lead" | "name" | "products"; label: string }[] = [
  { id: "rating", label: "Top rated" },
  { id: "moq", label: "Lowest MOQ" },
  { id: "lead", label: "Fastest samples" },
  { id: "name", label: "Name A–Z" },
  { id: "products", label: "Most products" },
];

function ManuTable({
  rows,
  onOpen,
  selectMode = false,
  selectedIds,
}: {
  rows: Manufacturer[];
  onOpen: (m: Manufacturer) => void;
  selectMode?: boolean;
  selectedIds?: Set<string>;
}) {
  return (
    <div className="overflow-x-auto rounded-xl border">
      <table className="w-full text-sm">
        <thead className="border-b bg-surface-2/40 text-left text-xs text-ink-faint">
          <tr>
            {selectMode && <th className="w-8 p-3" />}
            <th className="p-3 font-medium">Manufacturer</th>
            <th className="p-3 font-medium">Status</th>
            <th className="hidden p-3 font-medium md:table-cell">Products</th>
            <th className="p-3 font-medium">From MOQ</th>
            <th className="hidden p-3 font-medium sm:table-cell">Sample lead</th>
            <th className="hidden p-3 font-medium sm:table-cell">From</th>
            <th className="p-3 font-medium">Rating</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((m) => {
            const sel = selectedIds?.has(m.id);
            return (
            <tr
              key={m.id}
              onClick={() => onOpen(m)}
              className={cn(
                "cursor-pointer border-b transition-colors last:border-0 hover:bg-elevated/50",
                sel && "bg-accent-soft/20",
              )}
            >
              {selectMode && (
                <td className="p-3">
                  <span className={cn(
                    "flex size-5 items-center justify-center rounded-full border",
                    sel ? "border-accent bg-accent text-accent-foreground" : "border-border text-transparent",
                  )}>
                    <Check className="size-3" />
                  </span>
                </td>
              )}
              <td className="p-3">
                <div className="flex items-center gap-2.5">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-md border bg-surface-2">{m.flag}</span>
                  <div className="min-w-0">
                    <p className="truncate font-medium">{m.name}</p>
                    <p className="text-xs text-ink-faint">{m.country}</p>
                  </div>
                </div>
              </td>
              <td className="p-3"><Badge variant={STATUS_VARIANT[m.status]}>{m.status}</Badge></td>
              <td className="hidden max-w-[220px] p-3 text-ink-soft md:table-cell">
                <span className="line-clamp-1">{m.capabilities.map((c) => c.product).slice(0, 4).join(", ") || "—"}</span>
              </td>
              <td className="tabular p-3">{minMoq(m) || "—"}</td>
              <td className="tabular hidden p-3 sm:table-cell">{sampleLeadRange(m)}</td>
              <td className="tabular hidden p-3 sm:table-cell">{fromPrice(m)}</td>
              <td className="p-3"><Stars rating={m.rating} /></td>
            </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── AI sourcing assistant (a distinct, focused tool) ─────────
const AI_EXAMPLES = [
  "woven cashmere sweater",
  "denim jacket under 200 MOQ",
  "who does embroidery",
  "fast samples for a hoodie",
];
function AiFinderDialog({
  open,
  onOpenChange,
  list,
  onOpenProfile,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  list: Manufacturer[];
  onOpenProfile: (m: Manufacturer) => void;
}) {
  const [q, setQ] = React.useState("");
  const [results, setResults] = React.useState<Match[] | null>(null);

  React.useEffect(() => {
    if (!open) { setQ(""); setResults(null); }
  }, [open]);

  const run = (query?: string) => {
    const s = (query ?? q).trim();
    if (!s) return;
    setQ(s);
    setResults(aiFind(list, s));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl overflow-hidden p-0">
        <div className="border-b bg-gradient-to-r from-accent-soft/50 to-transparent p-5">
          <DialogTitle className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-lg bg-accent text-accent-foreground">
              <Wand2 className="size-4" />
            </span>
            <span>
              <span className="block text-sm font-medium leading-tight">Which manufacturer fits?</span>
              <span className="block text-xs font-normal leading-tight text-ink-faint">Pick the right factory from your network for a product</span>
            </span>
          </DialogTitle>
          <div className="mt-3 flex gap-2">
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && run()}
              placeholder="e.g. who can make a woven cashmere sweater"
              autoFocus
            />
            <Button onClick={() => run()} className="shrink-0"><Wand2 className="size-4" /> Ask</Button>
          </div>
          {results === null && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {AI_EXAMPLES.map((e) => (
                <button
                  key={e}
                  onClick={() => run(e)}
                  className="rounded-full border bg-card px-2.5 py-1 text-xs text-ink-soft transition-colors hover:border-accent/50 hover:text-accent-ink cursor-pointer"
                >
                  {e}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="max-h-[55vh] overflow-y-auto p-5">
          {results === null ? (
            <p className="py-10 text-center text-sm text-ink-faint">Ask a question to search your factories.</p>
          ) : results.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-10 text-center text-ink-faint">
              <Factory className="size-6" />
              <p className="text-sm">None of your manufacturers match “{q}”.</p>
              <p className="text-xs">Try broader terms, or add a factory that does.</p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-ink-soft">
                <span className="font-medium text-foreground">{results.length}</span>{" "}
                {results.length === 1 ? "match" : "matches"} — ranked by fit.
              </p>
              <div className="space-y-2">
                {results.map((r) => (
                  <button
                    key={r.m.id}
                    onClick={() => { onOpenProfile(r.m); onOpenChange(false); }}
                    className="group flex w-full items-center gap-3 rounded-lg border bg-surface-2/40 p-3 text-left transition-colors hover:border-ink-faint/40 hover:bg-surface-hi cursor-pointer"
                  >
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-md border bg-surface-2 text-lg">{r.m.flag}</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{r.m.name} <span className="text-xs font-normal text-ink-faint">{r.m.country}</span></p>
                      <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-accent-ink">
                        <Sparkles className="size-3 shrink-0" /> {r.reasons.slice(0, 3).join(" · ")}
                      </p>
                    </div>
                    <div className="hidden shrink-0 text-right text-xs text-ink-faint sm:block">
                      from {minMoq(r.m)} MOQ · {sampleLeadRange(r.m)}
                    </div>
                    <ArrowRight className="size-4 shrink-0 text-ink-faint transition-transform group-hover:translate-x-0.5" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Side-by-side compare (visual: highlights who wins each metric) ──
const minPriceNum = (m: Manufacturer) => {
  const p = m.capabilities.map((c) => num(c.avgUnitPrice)).filter((n) => n > 0);
  return p.length ? Math.min(...p) : Infinity;
};
const hoursOf = (m: Manufacturer) => (m.responseTime ? num(m.responseTime) : Infinity);

type CmpRow = {
  label: string;
  render: (m: Manufacturer) => React.ReactNode;
  metric?: (m: Manufacturer) => number;
  dir?: "min" | "max";
  win?: string;
};

function CompareDialog({
  open,
  onOpenChange,
  items,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  items: Manufacturer[];
}) {
  const rows: CmpRow[] = [
    { label: "Status", render: (m) => <Badge variant={STATUS_VARIANT[m.status]}>{m.status}</Badge> },
    { label: "Location", render: (m) => (m.city ? `${m.city}, ${m.country}` : m.country) },
    { label: "Rating", render: (m) => <Stars rating={m.rating} />, metric: (m) => m.rating, dir: "max", win: "Top rated" },
    { label: "On-time", render: (m) => (m.onTimePct != null ? `${m.onTimePct}%` : "—"), metric: (m) => m.onTimePct ?? -1, dir: "max", win: "Most reliable" },
    { label: "Responds", render: (m) => m.responseTime ?? "—", metric: hoursOf, dir: "min", win: "Fastest reply" },
    { label: "Partner since", render: (m) => m.since ?? "—" },
    { label: "Capacity", render: (m) => m.capacity ?? "—" },
    { label: "MOQ", render: (m) => String(minMoq(m) || "—"), metric: (m) => minMoq(m) || Infinity, dir: "min", win: "Lowest MOQ" },
    { label: "Sample lead", render: (m) => sampleLeadRange(m), metric: minSampleLead, dir: "min", win: "Fastest" },
    { label: "From price", render: (m) => `${fromPrice(m)}/unit`, metric: minPriceNum, dir: "min", win: "Cheapest" },
    { label: "Payment", render: (m) => m.paymentTerms },
    { label: "Products", render: (m) => m.capabilities.map((c) => c.product).join(", ") || "—" },
    { label: "Specializations", render: (m) => m.categories.join(", ") },
    { label: "Certifications", render: (m) => m.certifications?.join(", ") || "—" },
  ];

  const bestVal = (r: CmpRow) => {
    if (!r.metric || items.length < 2) return null;
    const vals = items.map(r.metric).filter((v) => Number.isFinite(v));
    if (!vals.length) return null;
    const best = r.dir === "max" ? Math.max(...vals) : Math.min(...vals);
    // don't crown a winner if everyone ties
    return vals.every((v) => v === best) ? null : best;
  };

  const bestName = (metric: (m: Manufacturer) => number, dir: "min" | "max") => {
    let best: Manufacturer | null = null;
    let bv = dir === "max" ? -Infinity : Infinity;
    items.forEach((m) => {
      const v = metric(m);
      if (!Number.isFinite(v)) return;
      if (dir === "max" ? v > bv : v < bv) { bv = v; best = m; }
    });
    return best as Manufacturer | null;
  };
  const topRated = bestName((m) => m.rating, "max");
  const reliable = bestName((m) => m.onTimePct ?? -1, "max");
  const fastest = bestName(minSampleLead, "min");
  const cheapest = bestName(minPriceNum, "min");
  const summary = [
    topRated && `${topRated.name} is top-rated`,
    reliable && reliable.onTimePct != null && `${reliable.name} is most reliable (${reliable.onTimePct}%)`,
    fastest && `${fastest.name} turns samples fastest`,
    cheapest && `${cheapest.name} is the cheapest per unit`,
  ].filter(Boolean).join(" · ");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Compare {items.length} manufacturers</DialogTitle>
        </DialogHeader>

        {items.length >= 2 && summary && (
          <div className="flex items-start gap-2.5 rounded-lg border border-accent/40 bg-accent-soft/20 p-3">
            <Wand2 className="mt-0.5 size-4 shrink-0 text-accent-ink" />
            <p className="text-sm text-ink-soft">{summary}.</p>
          </div>
        )}

        <div className="max-h-[65vh] overflow-auto">
          <table className="w-full border-separate border-spacing-0 text-sm">
            <thead>
              <tr>
                <th className="sticky left-0 top-0 z-10 bg-card p-2" />
                {items.map((m) => (
                  <th key={m.id} className="sticky top-0 z-10 min-w-[150px] bg-card p-2 text-left align-bottom">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{m.flag}</span>
                      <span className="truncate text-sm font-medium">{m.name}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const best = bestVal(r);
                return (
                  <tr key={r.label}>
                    <td className="sticky left-0 z-10 whitespace-nowrap border-t bg-card p-2 align-top text-xs text-ink-faint">{r.label}</td>
                    {items.map((m) => {
                      const isWin = best != null && r.metric?.(m) === best;
                      return (
                        <td
                          key={m.id}
                          className={cn(
                            "border-t p-2 align-top text-ink-soft",
                            isWin && "bg-accent-soft/30",
                          )}
                        >
                          <span className={cn("inline-flex items-center gap-1.5", isWin && "font-medium text-foreground")}>
                            {r.render(m)}
                            {isWin && r.win && (
                              <span className="rounded bg-accent px-1 py-px text-[9px] font-medium uppercase tracking-wide text-accent-foreground">
                                {r.win}
                              </span>
                            )}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function ManufacturersPage() {
  const [list, setList] = React.useState<Manufacturer[]>(MANUFACTURERS);
  const [selected, setSelected] = React.useState<Manufacturer | null>(null);
  const [open, setOpen] = React.useState(false);
  const [addOpen, setAddOpen] = React.useState(false);
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [search, setSearch] = React.useState("");
  const [sort, setSort] = React.useState<(typeof SORTS)[number]["id"]>("rating");
  const [view, setView] = React.useState<"grid" | "table">("grid");
  const [aiOpen, setAiOpen] = React.useState(false);
  const [selectMode, setSelectMode] = React.useState(false);
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const [compareOpen, setCompareOpen] = React.useState(false);

  // Deep link: /manufacturers?m=ID opens that profile.
  React.useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("m");
    if (!id) return;
    const m = list.find((x) => x.id === id);
    if (m) {
      setSelected(m);
      setOpen(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openProfile = (m: Manufacturer) => {
    setSelected(m);
    setOpen(true);
  };

  const addNote = (id: string, note: string) => {
    const entry: CommLogEntry = {
      id: `c-${Date.now()}`,
      date: new Date().toISOString().slice(0, 10),
      note,
    };
    setList((prev) =>
      prev.map((m) => (m.id === id ? { ...m, commLog: [entry, ...m.commLog] } : m)),
    );
    setSelected((s) => (s && s.id === id ? { ...s, commLog: [entry, ...s.commLog] } : s));
    toast.success("Note logged");
  };

  const q = search.trim().toLowerCase();
  const base = list.filter((m) => statusFilter === "all" || m.status === statusFilter);
  const textFiltered = q
    ? base.filter((m) =>
        `${m.name} ${m.country} ${m.categories.join(" ")} ${m.capabilities.map((c) => c.product).join(" ")}`
          .toLowerCase()
          .includes(q),
      )
    : base;
  const cmp: Record<typeof sort, (a: Manufacturer, b: Manufacturer) => number> = {
    rating: (a, b) => b.rating - a.rating,
    moq: (a, b) => minMoq(a) - minMoq(b),
    lead: (a, b) => minSampleLead(a) - minSampleLead(b),
    name: (a, b) => a.name.localeCompare(b.name),
    products: (a, b) => b.capabilities.length - a.capabilities.length,
  };
  const display = [...textFiltered].sort(cmp[sort]);

  const toggleSel = (id: string) =>
    setSelectedIds((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  const onCardClick = (m: Manufacturer) => (selectMode ? toggleSel(m.id) : openProfile(m));
  const compareItems = list.filter((m) => selectedIds.has(m.id));

  return (
    <div className="mx-auto max-w-7xl space-y-5 p-6 lg:p-8">
      <PageHeader
        title="Manufacturer Directory"
        description="Your network of factories, partners, and suppliers."
        actions={
          <Button size="sm" onClick={() => setAddOpen(true)}>
            <Plus className="size-4" /> Add manufacturer
          </Button>
        }
      />

      {/* Prominent AI sourcing tool */}
      <button
        onClick={() => setAiOpen(true)}
        className="group flex w-full items-center gap-3 rounded-xl border border-accent/40 bg-gradient-to-r from-accent-soft/50 to-transparent p-4 text-left transition-colors hover:from-accent-soft/80 cursor-pointer"
      >
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
          <Wand2 className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">Ask Diorama AI which manufacturer fits your next product</p>
          <p className="truncate text-xs text-ink-faint">
            “who can make a woven cashmere sweater?” · “best for denim under 200 MOQ” · “who does embroidery?”
          </p>
        </div>
        <ArrowRight className="size-4 text-ink-faint transition-transform group-hover:translate-x-0.5" />
      </button>

      {/* Toolbar: search · compare · sort · status · view */}
      <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-faint" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search factories, countries, products…"
            className="h-10 pl-9"
          />
        </div>
        <Button
          variant={selectMode ? "default" : "secondary"}
          size="sm"
          onClick={() => { setSelectMode((v) => !v); setSelectedIds(new Set()); }}
          className="shrink-0"
        >
          <GitCompare className="size-4" /> {selectMode ? "Done" : "Compare"}
        </Button>
        <Select value={sort} onValueChange={(v) => setSort(v as typeof sort)}>
          <SelectTrigger size="sm" className="w-auto min-w-[140px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            {SORTS.map((s) => (<SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger size="sm" className="w-auto min-w-[120px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {["Active", "Sampling", "Inactive", "Blacklisted"].map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <ViewSwitcher
          value={view}
          onChange={setView}
          options={[
            { id: "grid", label: "Grid", icon: LayoutGrid },
            { id: "table", label: "Table", icon: Rows3 },
          ]}
        />
      </div>

      {display.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed py-20 text-center text-ink-faint">
          <Factory className="size-6" />
          <p className="text-sm">No manufacturers match.</p>
        </div>
      ) : view === "table" ? (
        <ManuTable
          rows={display}
          onOpen={onCardClick}
          selectMode={selectMode}
          selectedIds={selectedIds}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {display.map((m) => {
            const sel = selectedIds.has(m.id);
            return (
              <button
                key={m.id}
                onClick={() => onCardClick(m)}
                className={cn(
                  "group relative flex flex-col rounded-xl border bg-card p-4 text-left transition-all hover:border-ink-faint/40 hover:shadow-md cursor-pointer",
                  sel && "border-accent ring-2 ring-accent/40",
                )}
              >
                {selectMode && (
                  <span
                    className={cn(
                      "absolute right-3 top-3 z-10 flex size-5 items-center justify-center rounded-full border",
                      sel ? "border-accent bg-accent text-accent-foreground" : "border-border bg-card text-transparent",
                    )}
                  >
                    <Check className="size-3" />
                  </span>
                )}
                <div className="flex items-start gap-3">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-lg border bg-surface-2 text-xl">
                    {m.flag}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{m.name}</p>
                    <p className="text-xs text-ink-faint">{m.city ? `${m.city}, ${m.country}` : m.country}</p>
                  </div>
                  {!selectMode && <Badge variant={STATUS_VARIANT[m.status]}>{m.status}</Badge>}
                </div>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {m.categories.slice(0, 3).map((c) => (
                    <Badge key={c} variant="outline">{c}</Badge>
                  ))}
                </div>

                <p className="mt-2 text-xs text-ink-faint">
                  Makes {m.capabilities.length} product{m.capabilities.length === 1 ? "" : "s"}
                  {m.capabilities.length > 0 && (
                    <> · {m.capabilities.map((c) => c.product).slice(0, 3).join(", ")}</>
                  )}
                </p>

                <Separator className="my-3" />

                <div className="flex items-center justify-between text-xs text-ink-soft">
                  <span className="flex items-center gap-3">
                    <span className="flex items-center gap-1.5">
                      <Factory className="size-3.5 text-ink-faint" /> {minMoq(m)} MOQ
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="size-3.5 text-ink-faint" /> {fromPrice(m)}/unit
                    </span>
                  </span>
                  <Stars rating={m.rating} />
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Floating compare bar */}
      {selectMode && selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 z-40 flex -translate-x-1/2 items-center gap-3 rounded-full border bg-popover py-2 pl-4 pr-2 shadow-xl">
          <span className="text-sm font-medium">{selectedIds.size} selected</span>
          <Button
            size="sm"
            disabled={selectedIds.size < 2}
            onClick={() => setCompareOpen(true)}
          >
            <GitCompare className="size-4" /> Compare
          </Button>
          <button
            onClick={() => setSelectedIds(new Set())}
            className="px-2 text-sm text-ink-faint transition-colors hover:text-foreground cursor-pointer"
          >
            Clear
          </button>
        </div>
      )}

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="flex w-full flex-col p-0 sm:max-w-lg">
          {selected && <ProfileSheet mf={selected} onAddNote={addNote} />}
        </SheetContent>
      </Sheet>

      <AddDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onCreate={(m) => setList((prev) => [m, ...prev])}
      />

      <AiFinderDialog open={aiOpen} onOpenChange={setAiOpen} list={list} onOpenProfile={openProfile} />
      <CompareDialog open={compareOpen} onOpenChange={setCompareOpen} items={compareItems} />
    </div>
  );
}
