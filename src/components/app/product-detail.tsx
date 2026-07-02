"use client";

import * as React from "react";
import Link from "next/link";
import {
  Calendar,
  ImageIcon,
  FileText,
  Factory,
  ArrowRight,
  Download,
  Folder,
  Star,
  Check,
  Sparkles,
  ChevronDown,
  Plus,
  Trash2,
  Upload,
} from "lucide-react";
import { toast } from "sonner";

import type { Product, SampleCandidate, SampleRound, Priority, FileRef } from "@/lib/mock/types";
import {
  manufacturer,
  capableManufacturers,
  TRACKS,
  ALL_STATUSES,
  COLLECTIONS,
  PRODUCT_TYPES,
  ASSETS,
} from "@/lib/mock/data";
import { boardsForProduct } from "@/lib/mock/moodboard";
import { computeCosting, defaultInputs, defaultFreight, manufacturerQuote, landed } from "@/lib/costing";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { PriorityBadge, StatusBadge } from "@/components/app/bits";
import { Thumb } from "@/components/thumb";
import { ThreeViewer } from "@/components/three-viewer";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
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
import {
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

const PRIORITIES: Priority[] = ["Urgent", "High", "Medium", "Low"];

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <p className="text-xs text-ink-faint">{label}</p>
      <div className="text-sm">{children}</div>
    </div>
  );
}

const cur = (n: number) =>
  `${n < 0 ? "-" : ""}$${Math.abs(n).toLocaleString("en-US", { maximumFractionDigits: 2 })}`;

/** Split a sentence into bullet points on semicolons / sentence breaks. */
const bullets = (s: string): string[] =>
  s
    .split(/;\s*|\.\s+/)
    .map((x) => x.trim().replace(/\.$/, ""))
    .filter(Boolean);

const TODAY = new Date("2026-06-27");
function daysInStage(p: Product): number | null {
  if (!p.statusSince) return null;
  return Math.max(0, Math.round((TODAY.getTime() - new Date(p.statusSince).getTime()) / 86400000));
}
const trackOf = (status: Product["status"]) =>
  TRACKS.find((t) => t.statuses.includes(status));
const pieceFor = (p: Product) =>
  ASSETS.find((a) => a.category === "Pieces" && a.seed === p.seed);

/** Compact lifecycle progress for the product's current track. */
function Stepper({ product }: { product: Product }) {
  const track = trackOf(product.status);
  if (!track) return null;
  const idx = track.statuses.indexOf(product.status);
  return (
    <div className="mt-1 space-y-1.5">
      <div className="flex items-center justify-between text-[11px] text-ink-faint">
        <span>{track.track}</span>
        <span className="tabular">
          {idx + 1} / {track.statuses.length}
        </span>
      </div>
      <div className="flex gap-1">
        {track.statuses.map((s, i) => (
          <span
            key={s}
            title={s}
            className={cn(
              "h-1.5 flex-1 rounded-full",
              i < idx ? "bg-accent/50" : i === idx ? "bg-accent" : "bg-surface-2",
            )}
          />
        ))}
      </div>
    </div>
  );
}

function CostingTab({ product }: { product: Product }) {
  const factories = capableManufacturers(product.type);
  const [mfId, setMfId] = React.useState<string | null>(
    product.manufacturerId ?? factories[0]?.id ?? null,
  );
  const [dutiesPct, setDutiesPct] = React.useState(12);
  const [retail, setRetail] = React.useState(
    product.retailPrice ?? (Math.round(product.bulkPrice * 4) || 0),
  );

  const q = manufacturerQuote(product, mfId);
  const production = q?.production ?? product.bulkPrice;
  const freight = q?.freight ?? defaultFreight(product);
  const c = computeCosting(product, { production, freight, dutiesPct, retail });

  if (production <= 0 && factories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
        <p className="text-sm text-ink-soft">No costing yet</p>
        <p className="text-xs text-ink-faint">
          Costing unlocks once a factory quote or bulk price is set.
        </p>
      </div>
    );
  }

  const num = (
    label: string,
    value: number,
    onChange: (v: number) => void,
    prefix?: string,
    suffix?: string,
  ) => (
    <div className="space-y-1.5">
      <label className="text-xs text-ink-faint">{label}</label>
      <div className="relative">
        {prefix && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-ink-faint">
            {prefix}
          </span>
        )}
        <Input
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value) || 0)}
          className={prefix ? "pl-6" : suffix ? "pr-7" : ""}
        />
        {suffix && (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-ink-faint">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-5">
      {factories.length > 0 && (
        <div>
          <p className="mb-1.5 text-xs text-ink-faint">Model costing with factory</p>
          <div className="flex flex-wrap gap-1.5">
            {factories.map((m) => (
              <button
                key={m.id}
                onClick={() => setMfId(m.id)}
                className={cn(
                  "flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs transition-colors cursor-pointer",
                  mfId === m.id
                    ? "border-accent/40 bg-accent-soft text-accent-ink"
                    : "border-border text-ink-soft hover:bg-elevated/60",
                )}
              >
                {m.flag} {m.name}
                {product.manufacturerId === m.id && (
                  <Check className="size-3 text-good" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="grid grid-cols-2 gap-x-4 gap-y-4">
        <Field label="Production / unit">{cur(production)}</Field>
        <Field label="Freight / unit">{cur(freight)}</Field>
        {num("Duties", dutiesPct, setDutiesPct, undefined, "%")}
        {num("Retail price", retail, setRetail, "$")}
      </div>

      <div className="space-y-2 rounded-lg border bg-surface-2/40 p-4 text-sm">
        <div className="flex items-center justify-between text-ink-soft">
          <span>Production</span>
          <span className="tabular">{cur(c.production)}</span>
        </div>
        <div className="flex items-center justify-between text-ink-soft">
          <span>+ Freight</span>
          <span className="tabular">{cur(c.freight)}</span>
        </div>
        <div className="flex items-center justify-between text-ink-soft">
          <span>+ Duties ({dutiesPct}%)</span>
          <span className="tabular">{cur(c.duties)}</span>
        </div>
        <Separator />
        <div className="flex items-center justify-between font-medium">
          <span>Landed cost / unit</span>
          <span className="tabular">{cur(c.landed)}</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg border bg-surface-2/40 p-3">
          <p className="text-xs text-ink-faint">Margin</p>
          <p className={cn("tabular mt-0.5 text-lg font-medium", c.marginPct >= 0 ? "text-good" : "text-danger")}>
            {c.marginPct.toFixed(0)}%
          </p>
        </div>
        <div className="rounded-lg border bg-surface-2/40 p-3">
          <p className="text-xs text-ink-faint">Profit / unit</p>
          <p className="tabular mt-0.5 text-lg font-medium">{cur(c.marginAmt)}</p>
        </div>
        <div className="rounded-lg border bg-surface-2/40 p-3">
          <p className="text-xs text-ink-faint">Markup</p>
          <p className="tabular mt-0.5 text-lg font-medium">{c.markup.toFixed(1)}×</p>
        </div>
      </div>

      {product.quantityToOrder > 0 && (
        <p className="text-xs text-ink-faint">
          At {product.quantityToOrder.toLocaleString()} units: landed{" "}
          <span className="text-ink-soft">{cur(c.landed * product.quantityToOrder)}</span> · projected
          gross profit{" "}
          <span className="text-ink-soft">{cur(c.marginAmt * product.quantityToOrder)}</span>.
        </p>
      )}
    </div>
  );
}

/** Candidates to source from: stored list, or a single derived from the assignee. */
function candidatesOf(p: Product): SampleCandidate[] {
  if (p.candidates?.length) return p.candidates;
  if (p.manufacturerId)
    return [{ manufacturerId: p.manufacturerId, status: "Sampling", rounds: p.rounds }];
  return [];
}

function Stars({ n }: { n?: number }) {
  if (!n) return <span className="text-xs text-ink-faint">Not rated</span>;
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={cn("size-3.5", i <= Math.round(n) ? "fill-warn text-warn" : "text-ink-faint/40")}
        />
      ))}
    </span>
  );
}

const CAND_VARIANT: Record<string, "good" | "accent" | "warn" | "default"> = {
  Awarded: "good",
  Sampling: "accent",
  Quoted: "warn",
  Passed: "default",
};

interface SourceRow {
  mf: ReturnType<typeof manufacturer>;
  cost: ReturnType<typeof landed> | null;
  cand?: SampleCandidate;
  cap?: { sampleLeadDays: number; bulkLeadDays: number };
}

/** Nuanced, analyst-style read of the factory options. */
function buildVerdict(product: Product, rows: SourceRow[]): string | null {
  const priced = rows.filter((r) => r.cost) as (SourceRow & {
    cost: NonNullable<SourceRow["cost"]>;
  })[];
  if (priced.length < 2) return null;

  const byLanded = [...priced].sort((a, b) => a.cost.landed - b.cost.landed);
  const cheapest = byLanded[0];
  const rated = priced.filter((r) => r.cand?.rating);
  const bestRated = rated.sort((a, b) => (b.cand!.rating ?? 0) - (a.cand!.rating ?? 0))[0];

  const parts: string[] = [];
  parts.push(
    `${cheapest.mf!.name} is cheapest to land at ${cur(cheapest.cost.landed)}/unit (${cheapest.cost.marginPct.toFixed(0)}% margin)${
      cheapest.cand?.cons?.length ? `, though ${cheapest.cand.cons[0].toLowerCase()}` : ""
    }.`,
  );
  if (bestRated && bestRated.mf!.id !== cheapest.mf!.id) {
    const diff = Math.round((bestRated.cost.landed / cheapest.cost.landed - 1) * 100);
    parts.push(
      `${bestRated.mf!.name} scored best on samples (${bestRated.cand!.rating}★)${
        bestRated.cand?.pros?.length ? ` — ${bestRated.cand.pros[0].toLowerCase()}` : ""
      }, but lands ~${diff}% pricier.`,
    );
  }
  const shippy = [...priced].sort(
    (a, b) => b.cost.freight / (b.cost.production || 1) - a.cost.freight / (a.cost.production || 1),
  )[0];
  if (shippy.cost.freight > 0 && shippy.cost.freight / (shippy.cost.production || 1) > 0.12) {
    parts.push(
      `On paper ${shippy.mf!.name} looks lean, but shipping adds ${cur(shippy.cost.freight)}/unit.`,
    );
  }
  const awardedRow = rows.find((r) => r.mf!.id === product.manufacturerId);
  parts.push(
    awardedRow
      ? `You've awarded ${awardedRow.mf!.name} — a sensible call for this drop.`
      : `Recommendation: ${(bestRated ?? cheapest).mf!.name} is the best balance right now.`,
  );
  return parts.join(" ");
}

/** The step-by-step reasoning behind the verdict, so it's transparent. */
function verdictReasoning(rows: SourceRow[], retail: number): { label: string; detail: string }[] {
  const priced = rows.filter((r) => r.cost) as (SourceRow & {
    cost: NonNullable<SourceRow["cost"]>;
  })[];
  if (priced.length < 2) return [];
  const byLanded = [...priced].sort((a, b) => a.cost.landed - b.cost.landed);
  const out: { label: string; detail: string }[] = [];

  out.push({
    label: "Landed cost",
    detail: `${byLanded.map((r) => `${r.mf!.name} ${cur(r.cost.landed)}`).join(" · ")}. ${byLanded[0].mf!.name} is cheapest to land.`,
  });

  const shippy = priced.filter((r) => r.cost.freight / (r.cost.production || 1) > 0.12);
  if (shippy.length) {
    out.push({
      label: "Shipping impact",
      detail: `${shippy.map((r) => `${r.mf!.name} +${cur(r.cost.freight)}/unit`).join("; ")} — shipping narrows the apparent price gap.`,
    });
  }

  out.push({
    label: `Margin at ${cur(retail)} retail`,
    detail: byLanded.map((r) => `${r.mf!.name} ${r.cost.marginPct.toFixed(0)}%`).join(" · "),
  });

  const rated = priced.filter((r) => r.cand?.rating);
  if (rated.length) {
    const best = [...rated].sort((a, b) => (b.cand!.rating ?? 0) - (a.cand!.rating ?? 0))[0];
    out.push({
      label: "Sample quality",
      detail:
        `${rated.map((r) => `${r.mf!.name} ${r.cand!.rating}★`).join(" · ")}.` +
        (best.cand?.pros?.length ? ` ${best.mf!.name}: ${best.cand.pros.join(", ")}.` : ""),
    });
    const flagged = rated.filter((r) => r.cand?.cons?.length);
    if (flagged.length) {
      out.push({
        label: "Watch-outs",
        detail: flagged.map((r) => `${r.mf!.name} — ${r.cand!.cons!.join(", ")}`).join("; "),
      });
    }
  }

  const withCap = priced.filter((r) => r.cap);
  if (withCap.length) {
    const fastest = [...withCap].sort((a, b) => a.cap!.bulkLeadDays - b.cap!.bulkLeadDays)[0];
    out.push({
      label: "Lead time",
      detail: `${withCap.map((r) => `${r.mf!.name} ${r.cap!.sampleLeadDays}d/${r.cap!.bulkLeadDays}d`).join(" · ")}. ${fastest.mf!.name} is fastest to bulk.`,
    });
  }

  const sampled = priced.filter((r) => r.cand && r.cand.rounds.length > 0);
  if (sampled.length) {
    out.push({
      label: "Sampling so far",
      detail: sampled
        .map((r) => `${r.mf!.name}: ${r.cand!.rounds.length} round${r.cand!.rounds.length > 1 ? "s" : ""}`)
        .join(" · "),
    });
  }
  return out;
}

/** Sourcing — AI verdict + side-by-side factory compare, then award one. */
function SourcingTab({
  product,
  onUpdate,
}: {
  product: Product;
  onUpdate?: (patch: Partial<Product>, action?: string) => void;
}) {
  const factories = capableManufacturers(product.type);
  const retail = product.retailPrice ?? defaultInputs(product).retail;
  const candById = new Map((product.candidates ?? []).map((c) => [c.manufacturerId, c]));
  const [showWhy, setShowWhy] = React.useState(false);

  if (factories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
        <Factory className="size-6 text-ink-faint" />
        <p className="text-sm text-ink-soft">No factories make {product.type} yet</p>
        <p className="text-xs text-ink-faint">
          Add a capability to a manufacturer to compare quotes here.
        </p>
      </div>
    );
  }

  const rows: SourceRow[] = factories.map((mf) => {
    const q = manufacturerQuote(product, mf.id);
    return {
      mf,
      cost: q ? landed(q.production, q.freight, 12, retail) : null,
      cand: candById.get(mf.id),
      cap: mf.capabilities.find((c) => c.product === product.type),
    };
  });
  const verdict = buildVerdict(product, rows);
  const reasoning = verdict ? verdictReasoning(rows, retail) : [];
  const tmpl = `108px repeat(${rows.length}, minmax(150px, 1fr))`;

  const Lbl = ({ children }: { children: React.ReactNode }) => (
    <div className="flex items-center text-xs text-ink-faint">{children}</div>
  );

  return (
    <div className="space-y-4">
      {verdict && (
        <div className="rounded-lg border bg-accent-soft/30 p-3.5">
          <div className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-accent-ink">
            <Sparkles className="size-3.5" /> AI verdict
          </div>
          <p className="text-sm leading-relaxed text-ink-soft">{verdict}</p>

          {reasoning.length > 0 && (
            <>
              <button
                onClick={() => setShowWhy((v) => !v)}
                className="mt-2.5 flex items-center gap-1 text-xs font-medium text-accent-ink hover:underline cursor-pointer"
              >
                {showWhy ? "Hide the reasoning" : "How Diorama AI reached this"}
                <ChevronDown
                  className={cn("size-3.5 transition-transform", showWhy && "rotate-180")}
                />
              </button>

              {showWhy && (
                <div className="mt-3 space-y-2.5 border-t border-accent/20 pt-3">
                  <p className="text-[11px] text-ink-faint">
                    Diorama weighed every factory across cost, margin, quality, and speed
                    — here&apos;s the working:
                  </p>
                  <ol className="space-y-2">
                    {reasoning.map((r, i) => (
                      <li key={r.label} className="flex gap-2.5">
                        <span className="tabular mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-accent/20 text-[10px] font-medium text-accent-ink">
                          {i + 1}
                        </span>
                        <p className="text-xs leading-relaxed text-ink-soft">
                          <span className="font-medium text-foreground">{r.label}:</span>{" "}
                          {r.detail}
                        </p>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </>
          )}
        </div>
      )}

      <div className="overflow-x-auto pb-1">
        <div
          className="grid items-start gap-x-3 gap-y-3"
          style={{ gridTemplateColumns: tmpl, minWidth: 108 + rows.length * 150 }}
        >
          {/* header */}
          <div />
          {rows.map((r) => {
            const awarded = product.manufacturerId === r.mf!.id;
            return (
              <div key={r.mf!.id} className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <span>{r.mf!.flag}</span>
                  <span className="truncate text-sm font-medium">{r.mf!.name}</span>
                </div>
                {awarded ? (
                  <Badge variant="good"><Check className="size-3" /> Awarded</Badge>
                ) : r.cand ? (
                  <Badge variant={CAND_VARIANT[r.cand.status]}>{r.cand.status}</Badge>
                ) : (
                  <Badge variant="outline">Capable</Badge>
                )}
              </div>
            );
          })}

          <Lbl>Unit</Lbl>
          {rows.map((r) => (
            <div key={r.mf!.id} className="tabular text-sm">{r.cost ? cur(r.cost.production) : "—"}</div>
          ))}

          <Lbl>Shipping</Lbl>
          {rows.map((r) => (
            <div key={r.mf!.id} className="tabular text-sm text-ink-soft">{r.cost ? cur(r.cost.freight) : "—"}</div>
          ))}

          <Lbl>Landed</Lbl>
          {rows.map((r) => (
            <div key={r.mf!.id} className="tabular text-sm font-medium">{r.cost ? cur(r.cost.landed) : "—"}</div>
          ))}

          <Lbl>Margin</Lbl>
          {rows.map((r) => (
            <div
              key={r.mf!.id}
              className={cn("tabular text-sm font-medium", r.cost && r.cost.marginPct >= 0 ? "text-good" : "text-danger")}
            >
              {r.cost ? `${r.cost.marginPct.toFixed(0)}%` : "—"}
            </div>
          ))}

          <Lbl>Lead (smpl/bulk)</Lbl>
          {rows.map((r) => (
            <div key={r.mf!.id} className="tabular text-xs text-ink-soft">
              {r.cap ? `${r.cap.sampleLeadDays}d / ${r.cap.bulkLeadDays}d` : "—"}
            </div>
          ))}

          <Lbl>Quality</Lbl>
          {rows.map((r) => (
            <div key={r.mf!.id}><Stars n={r.cand?.rating} /></div>
          ))}

          <Lbl>Did well</Lbl>
          {rows.map((r) => (
            <div key={r.mf!.id} className="flex flex-col gap-1">
              {r.cand?.pros?.length
                ? r.cand.pros.map((p) => (
                    <span key={p} className="rounded bg-good-soft px-1.5 py-0.5 text-[11px] leading-tight text-good">
                      {p}
                    </span>
                  ))
                : <span className="text-xs text-ink-faint">—</span>}
            </div>
          ))}

          <Lbl>Needs work</Lbl>
          {rows.map((r) => (
            <div key={r.mf!.id} className="flex flex-col gap-1">
              {r.cand?.cons?.length
                ? r.cand.cons.map((c) => (
                    <span key={c} className="rounded bg-danger-soft px-1.5 py-0.5 text-[11px] leading-tight text-danger">
                      {c}
                    </span>
                  ))
                : <span className="text-xs text-ink-faint">—</span>}
            </div>
          ))}

          <div />
          {rows.map((r) => {
            const awarded = product.manufacturerId === r.mf!.id;
            return awarded ? (
              <div key={r.mf!.id} className="flex items-center gap-1 text-xs font-medium text-good">
                <Check className="size-3.5" /> Awarded
              </div>
            ) : (
              <Button
                key={r.mf!.id}
                variant="secondary"
                size="sm"
                onClick={() => {
                  onUpdate?.({ manufacturerId: r.mf!.id }, `awarded production to ${r.mf!.name}`);
                  toast.success(`Awarded production to ${r.mf!.name}`);
                }}
              >
                Award
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function AddRoundDialog({
  open,
  onOpenChange,
  roundNumber,
  factoryName,
  onAdd,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  roundNumber: number;
  factoryName: string;
  onAdd: (r: SampleRound) => void;
}) {
  const [dateSent, setDateSent] = React.useState("2026-06-27");
  const [photos, setPhotos] = React.useState(0);
  const [notes, setNotes] = React.useState("");
  const [changed, setChanged] = React.useState("");
  const [processing, setProcessing] = React.useState(false);

  const reset = () => {
    setDateSent("2026-06-27");
    setPhotos(0);
    setNotes("");
    setChanged("");
  };

  const autofill = () => {
    setProcessing(true);
    setTimeout(() => {
      setNotes(
        "Collar rib tightened; hem shortened ~1.5cm; dye lot warmer; embroidery re-centered.",
      );
      setChanged(
        "Tighter collar rib; -1.5cm hem; new warmer dye lot; re-centered embroidery placement.",
      );
      setPhotos(4);
      setProcessing(false);
      toast.success("Pre-filled from revision techpack", {
        description: "Diorama AI diffed it against the original techpack.",
      });
    }, 1100);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add round</DialogTitle>
          <DialogDescription>
            Round {roundNumber} · {factoryName}
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-lg border border-dashed bg-surface-2/40 p-3">
          <Label className="mb-2 text-xs text-ink-soft">
            <Sparkles className="size-3.5 text-accent-ink" /> Auto-fill from a revision techpack
          </Label>
          <Button onClick={autofill} disabled={processing} variant="secondary" size="sm" className="w-full">
            <Upload className="size-4" />
            {processing ? "Diffing against original…" : "Upload revision techpack"}
          </Button>
          <p className="mt-1.5 text-[11px] text-ink-faint">
            Diorama AI compares it to the original techpack and fills in what changed.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Date sent</Label>
            <Input type="date" value={dateSent} onChange={(e) => setDateSent(e.target.value)} className="h-8" />
          </div>
          <div className="space-y-1.5">
            <Label>Photos</Label>
            <Input type="number" value={photos} onChange={(e) => setPhotos(Number(e.target.value) || 0)} className="h-8" />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>Revision notes</Label>
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Separate points with ; or ." className="min-h-20" />
        </div>
        <div className="space-y-1.5">
          <Label>Changed vs. previous</Label>
          <Textarea value={changed} onChange={(e) => setChanged(e.target.value)} placeholder="What changed since the last round" className="min-h-20" />
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            onClick={() => {
              onAdd({
                round: roundNumber,
                dateSent: dateSent || null,
                dateReceived: null,
                photos,
                revisionNotes: notes.trim() || "—",
                changedVsPrevious: changed.trim() || "—",
              });
              reset();
              onOpenChange(false);
            }}
          >
            Add round
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function RoundsTab({
  product,
  onUpdate,
}: {
  product: Product;
  onUpdate?: (patch: Partial<Product>, action?: string) => void;
}) {
  const cands = candidatesOf(product);
  const [sel, setSel] = React.useState(
    () =>
      (cands.find((c) => c.manufacturerId === product.manufacturerId) ?? cands[0])
        ?.manufacturerId ?? "",
  );
  const [addOpen, setAddOpen] = React.useState(false);
  const cand = cands.find((c) => c.manufacturerId === sel) ?? cands[0];
  const rounds = cand?.rounds ?? [];

  const addRound = (round: SampleRound) => {
    const base = product.candidates ?? candidatesOf(product);
    const next = base.map((c) =>
      c.manufacturerId === sel ? { ...c, rounds: [...c.rounds, round] } : c,
    );
    onUpdate?.(
      { candidates: next },
      `added Round ${round.round} (${manufacturer(sel)?.name ?? "factory"})`,
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        {cands.length > 1 ? (
          <div className="flex flex-wrap gap-1.5">
            {cands.map((c) => {
              const m = manufacturer(c.manufacturerId);
              return (
                <button
                  key={c.manufacturerId}
                  onClick={() => setSel(c.manufacturerId)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-colors cursor-pointer",
                    sel === c.manufacturerId
                      ? "border-accent/40 bg-accent-soft text-accent-ink"
                      : "border-border text-ink-soft hover:bg-elevated/60",
                  )}
                >
                  {m?.flag} {m?.name}
                </button>
              );
            })}
          </div>
        ) : (
          <span />
        )}
        {cand && (
          <Button size="sm" variant="secondary" className="shrink-0" onClick={() => setAddOpen(true)}>
            <Plus className="size-4" /> Add round
          </Button>
        )}
      </div>

      {cand && (
        <AddRoundDialog
          open={addOpen}
          onOpenChange={setAddOpen}
          roundNumber={rounds.length + 1}
          factoryName={manufacturer(sel)?.name ?? "Factory"}
          onAdd={addRound}
        />
      )}

      {rounds.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
          <ImageIcon className="size-6 text-ink-faint" />
          <p className="text-sm text-ink-soft">No sample rounds yet</p>
          <p className="text-xs text-ink-faint">
            {cands.length > 1
              ? `${manufacturer(sel)?.name ?? "This factory"} hasn't sampled yet.`
              : "Rounds appear here once samples are sent."}
          </p>
        </div>
      ) : (
        <ol className="relative space-y-6 border-l pl-6">
          {rounds.map((r) => (
            <li key={r.round} className="relative">
              <span className="absolute -left-[31px] flex size-5 items-center justify-center rounded-full border bg-surface text-[10px] font-medium">
                {r.round}
              </span>
              <div className="space-y-3 rounded-lg border bg-surface-2/40 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Round {r.round}</p>
                  <span className="flex items-center gap-1 text-xs text-ink-faint">
                    <Calendar className="size-3" /> Sent {r.dateSent ?? "—"}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <span className="text-ink-faint">
                    Received:{" "}
                    <span className="text-ink-soft">{r.dateReceived ?? "In transit"}</span>
                  </span>
                  <span className="text-ink-faint">
                    Photos: <span className="text-ink-soft">{r.photos}</span>
                  </span>
                </div>
                {r.photos > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {Array.from({ length: Math.min(r.photos, 6) }).map((_, i) => (
                      <div
                        key={i}
                        className="aspect-square overflow-hidden rounded-md border"
                      >
                        <Thumb seed={`${product.seed}-r${r.round}-${i}`} />
                      </div>
                    ))}
                  </div>
                )}
                <div className="space-y-2.5">
                  <div>
                    <p className="mb-1 text-[11px] font-medium uppercase tracking-wider text-ink-faint">
                      Revision notes
                    </p>
                    <ul className="space-y-1">
                      {bullets(r.revisionNotes).map((b, i) => (
                        <li key={i} className="flex gap-2 text-sm text-ink-soft">
                          <span className="mt-1.5 size-1 shrink-0 rounded-full bg-ink-faint" />
                          {b}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="mb-1 text-[11px] font-medium uppercase tracking-wider text-ink-faint">
                      Changed vs. previous
                    </p>
                    <ul className="space-y-1">
                      {bullets(r.changedVsPrevious).map((b, i) => (
                        <li key={i} className="flex gap-2 text-sm text-ink-soft">
                          <span className="mt-1.5 size-1 shrink-0 rounded-full bg-accent/60" />
                          {b}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

export function ProductDetail({
  product,
  onUpdate,
  onDelete,
}: {
  product: Product;
  onUpdate?: (patch: Partial<Product>, action?: string) => void;
  onDelete?: () => void;
}) {
  const mf = manufacturer(product.manufacturerId);
  const patch = (p: Partial<Product>, action?: string) => onUpdate?.(p, action);

  // Files: preview + real upload / drag-and-drop.
  const [filePreview, setFilePreview] = React.useState<FileRef | null>(null);
  const [fileData, setFileData] = React.useState<Record<string, string>>({});
  const [dragFiles, setDragFiles] = React.useState(false);
  const fileInput = React.useRef<HTMLInputElement>(null);

  const kindFor = (name: string): FileRef["kind"] => {
    const ext = name.split(".").pop()?.toLowerCase() ?? "";
    if (["png", "jpg", "jpeg", "webp", "gif", "svg", "ai", "psd"].includes(ext)) return "Image";
    if (["obj", "glb", "gltf", "stl", "fbx"].includes(ext)) return "3D";
    if (["dxf", "plt"].includes(ext)) return "Pattern";
    if (name.toLowerCase().includes("techpack")) return "Techpack";
    return "Doc";
  };
  const prettySize = (b: number) =>
    b < 1024 ? `${b} B` : b < 1_048_576 ? `${Math.round(b / 1024)} KB` : `${(b / 1_048_576).toFixed(1)} MB`;

  const addFiles = (list: FileList | null) => {
    if (!list || list.length === 0) return;
    const refs: FileRef[] = Array.from(list).map((file) => {
      const id = `f-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = () => setFileData((d) => ({ ...d, [id]: reader.result as string }));
        reader.readAsDataURL(file);
      }
      return { id, name: file.name, kind: kindFor(file.name), size: prettySize(file.size) };
    });
    patch(
      { files: [...product.files, ...refs] },
      refs.length === 1 ? `uploaded ${refs[0].name}` : `uploaded ${refs.length} files`,
    );
    toast.success(refs.length === 1 ? "File uploaded" : `${refs.length} files uploaded`);
  };

  return (
    <>
      <SheetHeader>
        <div className="flex items-start gap-4">
          <div className="size-16 shrink-0 overflow-hidden rounded-lg border">
            {product.image ? (
              <img src={product.image} alt="" className="h-full w-full object-cover" />
            ) : (
              <Thumb seed={product.seed} />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <SheetTitle className="text-lg">{product.name}</SheetTitle>
            <SheetDescription>
              {product.type} · {product.collection}
            </SheetDescription>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <StatusBadge status={product.status} />
              <PriorityBadge priority={product.priority} />
              {daysInStage(product) !== null && (
                <span className="text-xs text-ink-faint">
                  {daysInStage(product)}d in stage
                </span>
              )}
            </div>
          </div>
        </div>
        <Stepper product={product} />
      </SheetHeader>

      <Tabs defaultValue="details" className="flex min-h-0 flex-1 flex-col gap-0">
        <div className="px-5 pt-4">
          <TabsList className="w-full">
            <TabsTrigger value="details" className="flex-1">Details</TabsTrigger>
            <TabsTrigger value="costing" className="flex-1">Costing</TabsTrigger>
            <TabsTrigger value="sourcing" className="flex-1">Sourcing</TabsTrigger>
            <TabsTrigger value="rounds" className="flex-1">Rounds</TabsTrigger>
            <TabsTrigger value="files" className="flex-1">Files</TabsTrigger>
            <TabsTrigger value="activity" className="flex-1">Log</TabsTrigger>
          </TabsList>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-5">
          {/* Details — editable */}
          <TabsContent value="details" className="mt-0 space-y-5">
            <div className="space-y-1.5">
              <Label>Name</Label>
              <Input value={product.name} onChange={(e) => patch({ name: e.target.value })} />
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-4">
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select
                  value={product.status}
                  onValueChange={(v) =>
                    patch({ status: v as Product["status"], statusSince: "2026-06-27" }, `changed status to ${v}`)
                  }
                >
                  <SelectTrigger size="sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ALL_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Priority</Label>
                <Select value={product.priority} onValueChange={(v) => patch({ priority: v as Priority })}>
                  <SelectTrigger size="sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PRIORITIES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Type</Label>
                <Select value={product.type} onValueChange={(v) => patch({ type: v })}>
                  <SelectTrigger size="sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PRODUCT_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Collection</Label>
                <Select value={product.collection} onValueChange={(v) => patch({ collection: v })}>
                  <SelectTrigger size="sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {COLLECTIONS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label className="flex items-center justify-between">
                  Drop
                  <Link href="/shopify" className="inline-flex items-center gap-1 text-xs text-accent-ink hover:underline">
                    View drop <ArrowRight className="size-3" />
                  </Link>
                </Label>
                <Input value={product.drop} onChange={(e) => patch({ drop: e.target.value })} />
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <p className="text-xs font-medium uppercase tracking-wider text-ink-faint">
                Manufacturing
              </p>
              {mf ? (
                <Link
                  href={`/manufacturers?m=${mf.id}`}
                  className="group flex items-center gap-3 rounded-lg border bg-surface-2/50 p-3 transition-colors hover:border-ink-faint/40 hover:bg-surface-hi"
                >
                  <span className="flex size-9 items-center justify-center rounded-md bg-surface-hi">
                    <Factory className="size-4 text-ink-soft" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{mf.name}</p>
                    <p className="text-xs text-ink-faint">
                      {mf.flag} {mf.country} · {mf.categories[0]}
                    </p>
                  </div>
                  <ArrowRight className="size-4 text-ink-faint transition-transform group-hover:translate-x-0.5" />
                </Link>
              ) : (
                <p className="text-sm text-ink-faint">
                  No factory awarded yet — pick one in the Sourcing tab.
                </p>
              )}
              <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                {(
                  [
                    ["MOQ", "moq"],
                    ["Qty to order", "quantityToOrder"],
                    ["Price / unit", "pricePerUnit"],
                    ["Bulk price", "bulkPrice"],
                    ["Retail price", "retailPrice"],
                  ] as const
                ).map(([label, key]) => (
                  <div key={key} className="space-y-1.5">
                    <Label>{label}</Label>
                    <Input
                      type="number"
                      value={(product[key] as number | undefined) ?? 0}
                      onChange={(e) => patch({ [key]: Number(e.target.value) || 0 } as Partial<Product>)}
                      className="h-8"
                    />
                  </div>
                ))}
              </div>
            </div>

            <Separator />
            <Button
              variant="ghost"
              size="sm"
              className="text-danger hover:bg-danger-soft hover:text-danger"
              onClick={() => onDelete?.()}
            >
              <Trash2 className="size-4" /> Delete product
            </Button>
          </TabsContent>

          {/* Costing */}
          <TabsContent value="costing" className="mt-0">
            <CostingTab product={product} />
          </TabsContent>

          {/* Sourcing — multi-factory compare + award */}
          <TabsContent value="sourcing" className="mt-0">
            <SourcingTab product={product} onUpdate={onUpdate} />
          </TabsContent>

          {/* Rounds — per candidate factory */}
          <TabsContent value="rounds" className="mt-0">
            <RoundsTab product={product} onUpdate={onUpdate} />
          </TabsContent>

          {/* Files — a real folder: clickable, uploadable, drag-and-drop */}
          <TabsContent value="files" className="mt-0 space-y-4">
            {(() => {
              const piece = pieceFor(product);
              return (
                <Link
                  href={piece ? `/assets?file=${piece.id}` : "/assets"}
                  className="group flex items-center gap-3 rounded-lg border bg-surface-2/40 p-3 transition-colors hover:border-ink-faint/40 hover:bg-surface-hi"
                >
                  <span className="flex size-9 items-center justify-center rounded-md bg-surface-hi">
                    <Folder className="size-4 text-ink-soft" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">Open in Asset Library</p>
                    <p className="text-xs text-ink-faint">
                      The full folder for this product
                    </p>
                  </div>
                  <ArrowRight className="size-4 text-ink-faint transition-transform group-hover:translate-x-0.5" />
                </Link>
              );
            })()}

            {/* Moodboard references linked to this product */}
            {boardsForProduct(product.id).length > 0 && (
              <div className="space-y-2">
                <p className="text-[11px] font-medium uppercase tracking-wider text-ink-faint">Moodboard references</p>
                {boardsForProduct(product.id).map((b) => (
                  <Link
                    key={b.id}
                    href={`/moodboard?board=${b.id}`}
                    className="group flex items-center gap-3 rounded-lg border bg-surface-2/40 p-3 transition-colors hover:border-ink-faint/40 hover:bg-surface-hi"
                  >
                    <span className="flex size-9 items-center justify-center rounded-md bg-surface-hi">
                      <ImageIcon className="size-4 text-ink-soft" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{b.name}</p>
                      <p className="text-xs text-ink-faint">{b.blockIds.length} references</p>
                    </div>
                    <ArrowRight className="size-4 text-ink-faint transition-transform group-hover:translate-x-0.5" />
                  </Link>
                ))}
              </div>
            )}

            <input
              ref={fileInput}
              type="file"
              multiple
              hidden
              onChange={(e) => {
                addFiles(e.target.files);
                e.target.value = "";
              }}
            />

            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragFiles(true);
              }}
              onDragLeave={() => setDragFiles(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragFiles(false);
                addFiles(e.dataTransfer.files);
              }}
              className={cn(
                "rounded-xl border border-dashed transition-colors",
                dragFiles ? "border-accent/60 bg-accent-soft/30" : "border-border",
                product.files.length === 0 ? "" : "p-3",
              )}
            >
              {product.files.length === 0 ? (
                <button
                  onClick={() => fileInput.current?.click()}
                  className="flex w-full flex-col items-center justify-center gap-2 py-10 text-center text-ink-faint transition-colors hover:text-foreground cursor-pointer"
                >
                  <Upload className="size-6" />
                  <p className="text-sm">Drop files here, or click to upload</p>
                </button>
              ) : (
                <div className="space-y-4">
                  {Array.from(new Set(product.files.map((f) => f.kind))).map((kind) => (
                    <div key={kind} className="space-y-2">
                      <p className="text-[11px] font-medium uppercase tracking-wider text-ink-faint">
                        {kind}
                      </p>
                      {product.files
                        .filter((f) => f.kind === kind)
                        .map((f) => (
                          <button
                            key={f.id}
                            onClick={() => setFilePreview(f)}
                            className="group flex w-full items-center gap-3 rounded-lg border bg-surface-2/40 p-3 text-left transition-colors hover:border-ink-faint/40 hover:bg-surface-hi cursor-pointer"
                          >
                            <span className="size-9 shrink-0 overflow-hidden rounded-md border bg-surface-hi">
                              {fileData[f.id] ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={fileData[f.id]} alt="" className="size-full object-cover" />
                              ) : (
                                <span className="flex size-full items-center justify-center">
                                  <FileText className="size-4 text-ink-soft" />
                                </span>
                              )}
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm">{f.name}</p>
                              <p className="text-xs text-ink-faint">{f.kind} · {f.size}</p>
                            </div>
                            <ArrowRight className="size-4 text-ink-faint opacity-0 transition-opacity group-hover:opacity-100" />
                          </button>
                        ))}
                    </div>
                  ))}
                  <button
                    onClick={() => fileInput.current?.click()}
                    className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed py-2.5 text-xs text-ink-faint transition-colors hover:border-accent/50 hover:text-accent-ink cursor-pointer"
                  >
                    <Upload className="size-3.5" /> Upload more, or drag files here
                  </button>
                </div>
              )}
            </div>

            {/* File preview */}
            <Dialog open={!!filePreview} onOpenChange={(v) => !v && setFilePreview(null)}>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="truncate">{filePreview?.name}</DialogTitle>
                  <DialogDescription>
                    {filePreview?.kind} · {filePreview?.size}
                  </DialogDescription>
                </DialogHeader>
                <div className="flex min-h-[320px] items-center justify-center overflow-hidden rounded-xl border bg-surface-2">
                  {filePreview && fileData[filePreview.id] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={fileData[filePreview.id]} alt="" className="max-h-[60vh] w-full object-contain" />
                  ) : filePreview?.kind === "3D" ? (
                    <ThreeViewer seed={filePreview.id} className="h-[50vh] w-full" />
                  ) : (
                    <div className="flex flex-col items-center gap-2 py-16 text-ink-faint">
                      <FileText className="size-9" />
                      <span className="text-sm">{filePreview?.kind} preview</span>
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button variant="ghost" onClick={() => setFilePreview(null)}>
                    Close
                  </Button>
                  <Button onClick={() => toast.success("Download is simulated in this prototype.")}>
                    <Download className="size-4" /> Download
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </TabsContent>

          {/* Activity */}
          <TabsContent value="activity" className="mt-0">
            <ol className="space-y-4">
              {product.activity.map((a) => (
                <li key={a.id} className="flex gap-3">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-accent" />
                  <div>
                    <p className="text-sm leading-snug">
                      <span className="font-medium">{a.who}</span>{" "}
                      <span className="text-ink-soft">{a.action}</span>
                    </p>
                    <p className="text-xs text-ink-faint">{a.at}</p>
                  </div>
                </li>
              ))}
            </ol>
          </TabsContent>
        </div>
      </Tabs>
    </>
  );
}
