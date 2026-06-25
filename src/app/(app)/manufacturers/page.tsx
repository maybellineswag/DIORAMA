"use client";

import * as React from "react";
import {
  Plus,
  Star,
  Globe,
  Mail,
  Phone,
  MessageCircle,
  Factory,
  Package,
  Send,
  Sparkles,
  FileText,
} from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/app/page-header";
import { Thumb } from "@/components/thumb";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
import type { Manufacturer, ManufacturerStatus, CommLogEntry } from "@/lib/mock/types";
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

function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={cn(
            "size-3.5",
            i <= Math.round(rating)
              ? "fill-warn text-warn"
              : "text-ink-faint/40",
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

      <Tabs defaultValue="overview" className="flex min-h-0 flex-1 flex-col gap-0">
        <div className="px-5 pt-4">
          <TabsList className="w-full">
            <TabsTrigger value="overview" className="flex-1">Overview</TabsTrigger>
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
          <TabsContent value="overview" className="mt-0 space-y-5">
            <div className="flex flex-wrap gap-1.5">
              {mf.categories.map((c) => (
                <Badge key={c} variant="outline">{c}</Badge>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-4 rounded-lg border bg-surface-2/40 p-4 text-sm">
              <div><p className="text-xs text-ink-faint">MOQ</p><p>{mf.moq} units</p></div>
              <div><p className="text-xs text-ink-faint">Lead time</p><p>{mf.leadTime}</p></div>
              <div><p className="text-xs text-ink-faint">Sample cost</p><p>{mf.sampleCost}</p></div>
              <div><p className="text-xs text-ink-faint">Payment</p><p>{mf.paymentTerms}</p></div>
            </div>

            <div>
              <p className="mb-1 text-xs font-medium uppercase tracking-wider text-ink-faint">
                Contact
              </p>
              <div className="divide-y">
                <ContactRow icon={Mail} label="Email" value={mf.email} />
                <ContactRow icon={MessageCircle} label="WhatsApp" value={mf.whatsapp} />
                <ContactRow icon={Globe} label="Website" value={mf.website} />
              </div>
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

          <TabsContent value="products" className="mt-0 space-y-2">
            {linked.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-12 text-center text-ink-faint">
                <Package className="size-6" />
                <p className="text-sm">No linked products yet</p>
              </div>
            ) : (
              linked.map((p) => (
                <div key={p.id} className="flex items-center gap-3 rounded-lg border bg-surface-2/40 p-2.5">
                  <span className="size-10 shrink-0 overflow-hidden rounded-md border">
                    <Thumb seed={p.seed} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{p.name}</p>
                    <p className="text-xs text-ink-faint">{p.status}</p>
                  </div>
                </div>
              ))
            )}
          </TabsContent>

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
  moq: "",
  leadTime: "",
  paymentTerms: "",
  categories: "",
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
        moq: "120",
        leadTime: "30–40 days",
        paymentTerms: "50% deposit / 50% on delivery",
        categories: "Cut & Sew, Jersey, Outerwear",
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
    onCreate({
      id: `mf-${Date.now()}`,
      name: form.name,
      country: form.country,
      flag: { China: "🇨🇳", Portugal: "🇵🇹", Turkey: "🇹🇷", India: "🇮🇳" }[form.country] ?? "🏳️",
      status: "Sampling",
      categories: form.categories
        ? form.categories.split(",").map((c) => c.trim()).filter(Boolean)
        : ["General"],
      contactPerson: form.contactPerson || "—",
      whatsapp: form.whatsapp || "—",
      email: form.email || "—",
      website: form.website || "—",
      moq: Number(form.moq) || 100,
      leadTime: form.leadTime || "TBD",
      paymentTerms: form.paymentTerms || "TBD",
      sampleCost: "TBD",
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add manufacturer</DialogTitle>
          <DialogDescription>
            Paste a website to auto-fill, or enter details manually.
          </DialogDescription>
        </DialogHeader>

        {/* URL scrape */}
        <div className="rounded-lg border border-dashed bg-surface-2/40 p-3">
          <Label className="mb-2 text-xs text-ink-soft">
            <Sparkles className="size-3.5 text-accent" /> Auto-fill from URL
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
          <div className="col-span-2 space-y-1.5">
            <Label>Name</Label>
            <Input value={form.name} onChange={set("name")} placeholder="Factory name" />
          </div>
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
          <div className="space-y-1.5">
            <Label>Contact person</Label>
            <Input value={form.contactPerson} onChange={set("contactPerson")} />
          </div>
          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input value={form.email} onChange={set("email")} type="email" />
          </div>
          <div className="space-y-1.5">
            <Label>WhatsApp</Label>
            <Input value={form.whatsapp} onChange={set("whatsapp")} />
          </div>
          <div className="space-y-1.5">
            <Label>Website</Label>
            <Input value={form.website} onChange={set("website")} />
          </div>
          <div className="space-y-1.5">
            <Label>MOQ</Label>
            <Input value={form.moq} onChange={set("moq")} type="number" />
          </div>
          <div className="space-y-1.5">
            <Label>Lead time</Label>
            <Input value={form.leadTime} onChange={set("leadTime")} placeholder="30–40 days" />
          </div>
          <div className="space-y-1.5">
            <Label>Payment terms</Label>
            <Input value={form.paymentTerms} onChange={set("paymentTerms")} />
          </div>
          <div className="col-span-2 space-y-1.5">
            <Label>Categories (comma-separated)</Label>
            <Input value={form.categories} onChange={set("categories")} placeholder="Knitwear, Cut & Sew" />
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

export default function ManufacturersPage() {
  const [list, setList] = React.useState<Manufacturer[]>(MANUFACTURERS);
  const [selected, setSelected] = React.useState<Manufacturer | null>(null);
  const [open, setOpen] = React.useState(false);
  const [addOpen, setAddOpen] = React.useState(false);
  const [statusFilter, setStatusFilter] = React.useState("all");

  const filtered = list.filter(
    (m) => statusFilter === "all" || m.status === statusFilter,
  );

  const addNote = (id: string, note: string) => {
    const entry: CommLogEntry = {
      id: `c-${Date.now()}`,
      date: new Date().toISOString().slice(0, 10),
      note,
    };
    setList((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, commLog: [entry, ...m.commLog] } : m,
      ),
    );
    setSelected((s) =>
      s && s.id === id ? { ...s, commLog: [entry, ...s.commLog] } : s,
    );
    toast.success("Note logged");
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6 lg:p-8">
      <PageHeader
        title="Manufacturer Directory"
        description="Your network of factories, partners, and suppliers."
        actions={
          <div className="flex items-center gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger size="sm" className="w-auto min-w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {["Active", "Sampling", "Inactive", "Blacklisted"].map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button size="sm" onClick={() => setAddOpen(true)}>
              <Plus className="size-4" /> Add manufacturer
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((m) => (
          <button
            key={m.id}
            onClick={() => {
              setSelected(m);
              setOpen(true);
            }}
            className="group flex flex-col rounded-xl border bg-card p-4 text-left transition-all hover:border-ink-faint/40 hover:shadow-md cursor-pointer"
          >
            <div className="flex items-start gap-3">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-lg border bg-surface-2 text-xl">
                {m.flag}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{m.name}</p>
                <p className="text-xs text-ink-faint">{m.country}</p>
              </div>
              <Badge variant={STATUS_VARIANT[m.status]}>{m.status}</Badge>
            </div>

            <div className="mt-3 flex flex-wrap gap-1.5">
              {m.categories.slice(0, 3).map((c) => (
                <Badge key={c} variant="outline">{c}</Badge>
              ))}
            </div>

            <Separator className="my-3" />

            <div className="flex items-center justify-between text-xs text-ink-soft">
              <span className="flex items-center gap-1.5">
                <Factory className="size-3.5 text-ink-faint" />
                MOQ {m.moq}
              </span>
              <Stars rating={m.rating} />
            </div>
          </button>
        ))}
      </div>

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
    </div>
  );
}
