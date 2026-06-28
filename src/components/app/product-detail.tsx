"use client";

import * as React from "react";
import Link from "next/link";
import {
  Calendar,
  ImageIcon,
  FileText,
  Factory,
  ArrowRight,
  Paperclip,
  Download,
  Folder,
  Star,
  Check,
  Clock,
} from "lucide-react";
import { toast } from "sonner";

import type { Product, SampleCandidate } from "@/lib/mock/types";
import { manufacturer, capableManufacturers, TRACKS, ASSETS } from "@/lib/mock/data";
import { computeCosting, defaultInputs, manufacturerQuote, landed } from "@/lib/costing";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { PriorityBadge, StatusBadge } from "@/components/app/bits";
import { Thumb } from "@/components/thumb";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

const money = (n: number) =>
  n > 0
    ? n.toLocaleString("en-US", { style: "currency", currency: "USD" })
    : "—";

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
  const [inp, setInp] = React.useState(() => defaultInputs(product));
  const c = computeCosting(product, inp);

  if (product.bulkPrice <= 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
        <p className="text-sm text-ink-soft">No costing yet</p>
        <p className="text-xs text-ink-faint">
          Costing unlocks once a bulk price is set (after quoting).
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

  const srcMf = manufacturer(product.manufacturerId);
  const fromQuote = !!manufacturerQuote(product, product.manufacturerId);

  return (
    <div className="space-y-5">
      {fromQuote && srcMf && (
        <Link
          href="/manufacturers"
          className="flex items-center gap-1 text-xs text-ink-faint hover:text-ink-soft"
        >
          Production &amp; freight from{" "}
          <span className="text-accent-ink">{srcMf.name}</span>
          <ArrowRight className="size-3" />
        </Link>
      )}
      <div className="grid grid-cols-2 gap-x-4 gap-y-4">
        <Field label="Production / unit">{cur(c.production)}</Field>
        {num("Freight / unit", inp.freight, (v) => setInp({ ...inp, freight: v }), "$")}
        {num("Duties", inp.dutiesPct, (v) => setInp({ ...inp, dutiesPct: v }), undefined, "%")}
        {num("Retail price", inp.retail, (v) => setInp({ ...inp, retail: v }), "$")}
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
          <span>+ Duties ({inp.dutiesPct}%)</span>
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

/** Sourcing — compare every factory that can make this type, then award one. */
function SourcingTab({
  product,
  onUpdate,
}: {
  product: Product;
  onUpdate?: (patch: Partial<Product>) => void;
}) {
  const factories = capableManufacturers(product.type);
  const retail = product.retailPrice ?? defaultInputs(product).retail;
  const candById = new Map((product.candidates ?? []).map((c) => [c.manufacturerId, c]));

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

  return (
    <div className="space-y-3">
      <p className="text-xs text-ink-faint">
        Every factory that can make this {product.type.toLowerCase()} — compare landed
        cost &amp; margin, then award the winner.
      </p>
      {factories.map((mf) => {
        const q = manufacturerQuote(product, mf.id);
        const cost = q ? landed(q.production, q.freight, 12, retail) : null;
        const cand = candById.get(mf.id);
        const cap = mf.capabilities.find((c) => c.product === product.type);
        const awarded = product.manufacturerId === mf.id;
        return (
          <div
            key={mf.id}
            className={cn(
              "rounded-lg border p-3.5",
              awarded ? "border-good/40 bg-good-soft/20" : "bg-surface-2/40",
            )}
          >
            <div className="flex items-center gap-2">
              <span className="text-base">{mf.flag}</span>
              <span className="flex-1 truncate text-sm font-medium">{mf.name}</span>
              {awarded ? (
                <Badge variant="good"><Check className="size-3" /> Awarded</Badge>
              ) : cand ? (
                <Badge variant={CAND_VARIANT[cand.status]}>{cand.status}</Badge>
              ) : (
                <Badge variant="outline">Capable</Badge>
              )}
            </div>

            {cost && (
              <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
                <div>
                  <p className="text-xs text-ink-faint">Unit</p>
                  <p className="tabular">{cur(cost.production)}</p>
                </div>
                <div>
                  <p className="text-xs text-ink-faint">Landed</p>
                  <p className="tabular">{cur(cost.landed)}</p>
                </div>
                <div>
                  <p className="text-xs text-ink-faint">Margin</p>
                  <p className={cn("tabular font-medium", cost.marginPct >= 0 ? "text-good" : "text-danger")}>
                    {cost.marginPct.toFixed(0)}%
                  </p>
                </div>
              </div>
            )}

            <div className="mt-3 flex items-center justify-between">
              <span className="flex items-center gap-2 text-xs text-ink-faint">
                {cap && (
                  <span className="flex items-center gap-1">
                    <Clock className="size-3" />
                    {cap.sampleLeadDays}d / {cap.bulkLeadDays}d
                  </span>
                )}
                {cand && cand.rounds.length > 0 && (
                  <span>· {cand.rounds.length} round{cand.rounds.length > 1 ? "s" : ""}</span>
                )}
              </span>
              <Stars n={cand?.rating} />
            </div>

            {cand?.notes && <p className="mt-2 text-xs text-ink-soft">{cand.notes}</p>}

            {!awarded && (
              <Button
                variant="secondary"
                size="sm"
                className="mt-3 w-full"
                onClick={() => {
                  onUpdate?.({ manufacturerId: mf.id });
                  toast.success(`Awarded production to ${mf.name}`);
                }}
              >
                Award production
              </Button>
            )}
          </div>
        );
      })}
    </div>
  );
}

function RoundsTab({ product }: { product: Product }) {
  const cands = candidatesOf(product);
  const [sel, setSel] = React.useState(
    () =>
      (cands.find((c) => c.manufacturerId === product.manufacturerId) ?? cands[0])
        ?.manufacturerId ?? "",
  );
  const cand = cands.find((c) => c.manufacturerId === sel) ?? cands[0];
  const rounds = cand?.rounds ?? [];

  return (
    <div className="space-y-4">
      {cands.length > 1 && (
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
                  <div className="flex gap-2">
                    {Array.from({ length: Math.min(r.photos, 4) }).map((_, i) => (
                      <div key={i} className="size-12 overflow-hidden rounded-md border">
                        <Thumb seed={`${product.seed}-r${r.round}-${i}`} />
                      </div>
                    ))}
                  </div>
                )}
                <div className="space-y-2">
                  <div>
                    <p className="text-[11px] font-medium text-ink-faint">Revision notes</p>
                    <p className="text-sm text-ink-soft">{r.revisionNotes}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-medium text-ink-faint">Changed vs. previous</p>
                    <p className="text-sm text-ink-soft">{r.changedVsPrevious}</p>
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
}: {
  product: Product;
  onUpdate?: (patch: Partial<Product>) => void;
}) {
  const mf = manufacturer(product.manufacturerId);

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
          {/* Details */}
          <TabsContent value="details" className="mt-0 space-y-6">
            <div className="grid grid-cols-2 gap-x-4 gap-y-5">
              <Field label="Drop">
                <Link
                  href="/shopify"
                  className="inline-flex items-center gap-1 text-accent-ink hover:underline"
                >
                  {product.drop}
                  <ArrowRight className="size-3" />
                </Link>
              </Field>
              <Field label="Collection">{product.collection}</Field>
              <Field label="Type">{product.type}</Field>
              <Field label="Priority">{product.priority}</Field>
            </div>

            <Separator />

            <div>
              <p className="mb-3 text-xs font-medium uppercase tracking-wider text-ink-faint">
                Manufacturing
              </p>
              {mf ? (
                <Link
                  href={`/manufacturers?m=${mf.id}`}
                  className="group mb-4 flex items-center gap-3 rounded-lg border bg-surface-2/50 p-3 transition-colors hover:border-ink-faint/40 hover:bg-surface-hi"
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
                <p className="mb-4 text-sm text-ink-faint">
                  No manufacturer assigned yet.
                </p>
              )}
              <div className="grid grid-cols-2 gap-x-4 gap-y-5">
                <Field label="MOQ">{product.moq.toLocaleString()} units</Field>
                <Field label="Qty to order">
                  {product.quantityToOrder > 0
                    ? product.quantityToOrder.toLocaleString()
                    : "—"}
                </Field>
                <Field label="Price / unit">{money(product.pricePerUnit)}</Field>
                <Field label="Bulk price">{money(product.bulkPrice)}</Field>
              </div>
            </div>
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
            <RoundsTab product={product} />
          </TabsContent>

          {/* Files — grouped by kind, with a jump to the full folder in Assets */}
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

            {product.files.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
                <Paperclip className="size-6 text-ink-faint" />
                <p className="text-sm text-ink-soft">No files attached yet</p>
              </div>
            ) : (
              Array.from(new Set(product.files.map((f) => f.kind))).map((kind) => (
                <div key={kind} className="space-y-2">
                  <p className="text-[11px] font-medium uppercase tracking-wider text-ink-faint">
                    {kind}
                  </p>
                  {product.files
                    .filter((f) => f.kind === kind)
                    .map((f) => (
                      <div
                        key={f.id}
                        className="group flex items-center gap-3 rounded-lg border bg-surface-2/40 p-3 transition-colors hover:border-ink-faint/40"
                      >
                        <span className="flex size-9 items-center justify-center rounded-md bg-surface-hi">
                          <FileText className="size-4 text-ink-soft" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm">{f.name}</p>
                          <p className="text-xs text-ink-faint">{f.size}</p>
                        </div>
                        <Download className="size-4 text-ink-faint opacity-0 transition-opacity group-hover:opacity-100" />
                      </div>
                    ))}
                </div>
              ))
            )}
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
