"use client";

import {
  Calendar,
  ImageIcon,
  FileText,
  Factory,
  ArrowRight,
  Paperclip,
  Download,
} from "lucide-react";

import type { Product } from "@/lib/mock/types";
import { manufacturer } from "@/lib/mock/data";
import { MemberAvatar, PriorityBadge, StatusBadge } from "@/components/app/bits";
import { Thumb } from "@/components/thumb";
import { Badge } from "@/components/ui/badge";
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

export function ProductDetail({ product }: { product: Product }) {
  const mf = manufacturer(product.manufacturerId);

  return (
    <>
      <SheetHeader>
        <div className="flex items-start gap-4">
          <div className="size-16 shrink-0 overflow-hidden rounded-lg border">
            <Thumb seed={product.seed} />
          </div>
          <div className="min-w-0 flex-1">
            <SheetTitle className="text-lg">{product.name}</SheetTitle>
            <SheetDescription>
              {product.type} · {product.collection}
            </SheetDescription>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <StatusBadge status={product.status} />
              <PriorityBadge priority={product.priority} />
            </div>
          </div>
        </div>
      </SheetHeader>

      <Tabs defaultValue="details" className="flex min-h-0 flex-1 flex-col gap-0">
        <div className="px-5 pt-4">
          <TabsList className="w-full">
            <TabsTrigger value="details" className="flex-1">Details</TabsTrigger>
            <TabsTrigger value="rounds" className="flex-1">
              Rounds
              {product.rounds.length > 0 && (
                <Badge variant="outline" className="ml-1 px-1">
                  {product.rounds.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="files" className="flex-1">Files</TabsTrigger>
            <TabsTrigger value="activity" className="flex-1">Activity</TabsTrigger>
          </TabsList>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-5">
          {/* Details */}
          <TabsContent value="details" className="mt-0 space-y-6">
            <div className="grid grid-cols-2 gap-x-4 gap-y-5">
              <Field label="Drop">{product.drop}</Field>
              <Field label="Collection">{product.collection}</Field>
              <Field label="Assignee">
                <MemberAvatar id={product.assigneeId} showName />
              </Field>
              <Field label="Type">{product.type}</Field>
            </div>

            <Separator />

            <div>
              <p className="mb-3 text-xs font-medium uppercase tracking-wider text-ink-faint">
                Manufacturing
              </p>
              {mf ? (
                <div className="mb-4 flex items-center gap-3 rounded-lg border bg-surface-2/50 p-3">
                  <span className="flex size-9 items-center justify-center rounded-md bg-surface-hi">
                    <Factory className="size-4 text-ink-soft" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{mf.name}</p>
                    <p className="text-xs text-ink-faint">
                      {mf.flag} {mf.country} · {mf.leadTime}
                    </p>
                  </div>
                  <ArrowRight className="size-4 text-ink-faint" />
                </div>
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

          {/* Rounds timeline */}
          <TabsContent value="rounds" className="mt-0">
            {product.rounds.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
                <ImageIcon className="size-6 text-ink-faint" />
                <p className="text-sm text-ink-soft">No sample rounds yet</p>
                <p className="text-xs text-ink-faint">
                  Rounds appear here once samples are sent.
                </p>
              </div>
            ) : (
              <ol className="relative space-y-6 border-l pl-6">
                {product.rounds.map((r) => (
                  <li key={r.round} className="relative">
                    <span className="absolute -left-[31px] flex size-5 items-center justify-center rounded-full border bg-surface text-[10px] font-medium">
                      {r.round}
                    </span>
                    <div className="space-y-3 rounded-lg border bg-surface-2/40 p-4">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">Round {r.round}</p>
                        <div className="flex items-center gap-3 text-xs text-ink-faint">
                          <span className="flex items-center gap-1">
                            <Calendar className="size-3" /> Sent {r.dateSent ?? "—"}
                          </span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <span className="text-ink-faint">
                          Received:{" "}
                          <span className="text-ink-soft">
                            {r.dateReceived ?? "In transit"}
                          </span>
                        </span>
                        <span className="text-ink-faint">
                          Photos:{" "}
                          <span className="text-ink-soft">{r.photos}</span>
                        </span>
                      </div>

                      {r.photos > 0 && (
                        <div className="flex gap-2">
                          {Array.from({ length: Math.min(r.photos, 4) }).map((_, i) => (
                            <div
                              key={i}
                              className="size-12 overflow-hidden rounded-md border"
                            >
                              <Thumb seed={`${product.seed}-r${r.round}-${i}`} />
                            </div>
                          ))}
                          {r.photos > 4 && (
                            <div className="flex size-12 items-center justify-center rounded-md border bg-surface-2 text-xs text-ink-faint">
                              +{r.photos - 4}
                            </div>
                          )}
                        </div>
                      )}

                      <div className="space-y-2">
                        <div>
                          <p className="text-[11px] font-medium text-ink-faint">
                            Revision notes
                          </p>
                          <p className="text-sm text-ink-soft">{r.revisionNotes}</p>
                        </div>
                        <div>
                          <p className="text-[11px] font-medium text-ink-faint">
                            Changed vs. previous
                          </p>
                          <p className="text-sm text-ink-soft">
                            {r.changedVsPrevious}
                          </p>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </TabsContent>

          {/* Files */}
          <TabsContent value="files" className="mt-0 space-y-2">
            {product.files.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
                <Paperclip className="size-6 text-ink-faint" />
                <p className="text-sm text-ink-soft">No files attached</p>
              </div>
            ) : (
              product.files.map((f) => (
                <div
                  key={f.id}
                  className="group flex items-center gap-3 rounded-lg border bg-surface-2/40 p-3 transition-colors hover:border-ink-faint/40"
                >
                  <span className="flex size-9 items-center justify-center rounded-md bg-surface-hi">
                    <FileText className="size-4 text-ink-soft" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm">{f.name}</p>
                    <p className="text-xs text-ink-faint">
                      {f.kind} · {f.size}
                    </p>
                  </div>
                  <Download className="size-4 text-ink-faint opacity-0 transition-opacity group-hover:opacity-100" />
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
