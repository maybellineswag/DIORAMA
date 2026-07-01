"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Box,
  Circle,
  ClipboardPaste,
  Copy,
  CopyPlus,
  ExternalLink,
  FileText,
  Plus,
  Scissors,
  Shapes,
  Upload,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { AssetTile } from "@/components/app/asset-tile";
import { Thumb } from "@/components/thumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  PIECES,
  SLOTS,
  LIBRARY_ASSETS,
  assetById,
  type SlotKey,
} from "@/lib/mock/library";

// ── Radial quick-add wheel (opens on hover) ──────────────────
const WHEEL: { key: string; label: string; icon: typeof Box }[] = [
  { key: "Graphics", label: "Motif", icon: Shapes },
  { key: "Hardware", label: "Hardware", icon: Box },
  { key: "Notions", label: "Notion", icon: Circle },
  { key: "Templates", label: "Template", icon: FileText },
  { key: "upload", label: "Upload", icon: Upload },
];

function RadialAdd({ onPick }: { onPick: (cat: string) => void }) {
  const [open, setOpen] = React.useState(false);
  const t = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const enter = () => {
    if (t.current) clearTimeout(t.current);
    setOpen(true);
  };
  const leave = () => {
    t.current = setTimeout(() => setOpen(false), 140);
  };
  return (
    <div className="relative" onMouseEnter={enter} onMouseLeave={leave}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex size-7 items-center justify-center rounded-md border border-dashed text-ink-faint transition-colors hover:border-accent/50 hover:text-accent-ink cursor-pointer"
      >
        <Plus className="size-4" />
      </button>
      {open && (
        <div className="absolute right-1/2 top-1/2 z-30 size-44 -translate-y-1/2 translate-x-1/2">
          <span className="absolute left-1/2 top-1/2 flex size-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-accent-soft text-accent-ink shadow-sm">
            <Plus className="size-4" />
          </span>
          {WHEEL.map((it, i) => {
            const angle = (i / WHEEL.length) * 2 * Math.PI - Math.PI / 2;
            const r = 58;
            const Icon = it.icon;
            return (
              <button
                key={it.key}
                onClick={() => {
                  onPick(it.key);
                  setOpen(false);
                }}
                style={{
                  left: `calc(50% + ${Math.cos(angle) * r}px)`,
                  top: `calc(50% + ${Math.sin(angle) * r}px)`,
                }}
                className="absolute flex size-12 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center gap-0.5 rounded-full border bg-card text-ink-soft shadow-sm transition-all hover:scale-105 hover:border-accent/50 hover:text-accent-ink cursor-pointer"
              >
                <Icon className="size-4" />
                <span className="text-[9px] leading-none">{it.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Add-from-library picker ──────────────────────────────────
function AddPicker({
  category,
  onOpenChange,
  onAdd,
}: {
  category: string | null;
  onOpenChange: (v: boolean) => void;
  onAdd: (assetId: string) => void;
}) {
  const [q, setQ] = React.useState("");
  const items = LIBRARY_ASSETS.filter((a) => a.category === category).filter((a) =>
    q.trim() ? a.name.toLowerCase().includes(q.toLowerCase()) : true,
  );
  return (
    <Dialog open={!!category} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogTitle>Add {category} from library</DialogTitle>
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…" autoFocus />
        <div className="grid max-h-[50vh] grid-cols-3 gap-3 overflow-y-auto pr-1">
          {items.map((a) => (
            <button
              key={a.id}
              onClick={() => {
                onAdd(a.id);
                toast.success(`Added ${a.name}`);
              }}
              className="group text-left cursor-pointer"
            >
              <div className="aspect-square overflow-hidden rounded-lg border transition-all group-hover:border-accent/50">
                <AssetTile asset={a} className="size-full" />
              </div>
              <p className="mt-1 truncate text-xs">{a.name}</p>
            </button>
          ))}
          {items.length === 0 && (
            <p className="col-span-3 py-8 text-center text-sm text-ink-faint">Nothing here yet.</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function PiecePage() {
  const params = useParams<{ piece: string }>();
  const base = PIECES.find((p) => p.id === params.piece);

  const [slots, setSlots] = React.useState<Record<SlotKey, string[]> | null>(
    base ? base.slots : null,
  );
  const [clipboard, setClipboard] = React.useState<
    { assetId: string; cut?: SlotKey } | null
  >(null);
  const [picker, setPicker] = React.useState<{ slot: SlotKey; cat: string } | null>(null);

  if (!base || !slots) {
    return (
      <div className="mx-auto max-w-3xl p-8">
        <p className="text-sm text-ink-faint">Piece not found.</p>
        <Link href="/assets" className="mt-2 inline-flex items-center gap-1 text-sm text-accent-ink hover:underline">
          <ArrowLeft className="size-4" /> Back to Asset Library
        </Link>
      </div>
    );
  }

  const mutate = (slot: SlotKey, fn: (ids: string[]) => string[]) =>
    setSlots((prev) => (prev ? { ...prev, [slot]: fn(prev[slot]) } : prev));

  const addAsset = (slot: SlotKey, id: string) => mutate(slot, (ids) => [...ids, id]);
  const removeAsset = (slot: SlotKey, id: string) =>
    mutate(slot, (ids) => {
      const i = ids.indexOf(id);
      return i === -1 ? ids : [...ids.slice(0, i), ...ids.slice(i + 1)];
    });

  const paste = (slot: SlotKey) => {
    if (!clipboard) return;
    addAsset(slot, clipboard.assetId);
    if (clipboard.cut) removeAsset(clipboard.cut, clipboard.assetId);
    setClipboard(null);
    toast.success("Pasted");
  };

  const total = Object.values(slots).reduce((n, ids) => n + ids.length, 0);

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6 lg:p-8">
      <Link href="/assets" className="inline-flex items-center gap-1.5 text-sm text-ink-faint transition-colors hover:text-foreground">
        <ArrowLeft className="size-4" /> Asset Library
      </Link>

      {/* Piece header */}
      <div className="flex items-start gap-4">
        <div className="size-20 shrink-0 overflow-hidden rounded-xl border">
          {base.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={base.image} alt="" className="size-full object-cover" />
          ) : (
            <Thumb seed={base.seed} />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="display text-2xl tracking-tight">{base.name}</h1>
          <p className="text-sm text-ink-faint">
            {base.collection} · {base.drop}
          </p>
          <p className="mt-1 text-xs text-ink-faint">{total} assets across {SLOTS.length} slots</p>
        </div>
        {base.productId && (
          <Button asChild variant="secondary" size="sm">
            <Link href={`/samples?product=${base.productId}`}>
              Open in Product Status <ArrowRight className="size-4" />
            </Link>
          </Button>
        )}
      </div>

      {/* Slots grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {SLOTS.map((slot) => {
          const ids = slots[slot];
          return (
            <section key={slot} className="rounded-xl border bg-card p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-xs font-medium uppercase tracking-wider text-ink-faint">
                  {slot}
                  <span className="ml-1.5 text-ink-faint/60">{ids.length}</span>
                </p>
                <div className="flex items-center gap-1">
                  {clipboard && (
                    <button
                      onClick={() => paste(slot)}
                      title="Paste"
                      className="flex size-7 items-center justify-center rounded-md text-ink-faint transition-colors hover:text-accent-ink cursor-pointer"
                    >
                      <ClipboardPaste className="size-4" />
                    </button>
                  )}
                  <RadialAdd
                    onPick={(cat) => {
                      if (cat === "upload") {
                        toast.success("Upload is simulated in this prototype.");
                        return;
                      }
                      setPicker({ slot, cat });
                    }}
                  />
                </div>
              </div>

              {ids.length === 0 ? (
                <div className="rounded-lg border border-dashed py-5 text-center text-xs text-ink-faint">
                  Empty — hover + to add from library
                </div>
              ) : (
                <div className="space-y-2">
                  {ids.map((id, idx) => {
                    const a = assetById(id);
                    if (!a) return null;
                    return (
                      <div
                        key={`${id}-${idx}`}
                        className="group flex items-center gap-3 rounded-lg border bg-surface-2/40 p-2"
                      >
                        <span className="size-11 shrink-0 overflow-hidden rounded-md border">
                          <AssetTile asset={a} className="size-full" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{a.name}</p>
                          <p className="text-[11px] text-ink-faint">{a.fileType} · {a.size}</p>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="px-1 text-ink-faint opacity-0 transition-opacity group-hover:opacity-100 cursor-pointer">
                              ···
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/assets?file=${id}`}>
                                <ExternalLink className="size-4" /> Open source
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setClipboard({ assetId: id });
                                toast.success("Copied");
                              }}
                            >
                              <Copy className="size-4" /> Copy
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setClipboard({ assetId: id, cut: slot });
                                toast.success("Cut — paste into a slot");
                              }}
                            >
                              <Scissors className="size-4" /> Cut
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => addAsset(slot, id)}>
                              <CopyPlus className="size-4" /> Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem variant="destructive" onClick={() => removeAsset(slot, id)}>
                              <X className="size-4" /> Remove
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          );
        })}
      </div>

      <AddPicker
        category={picker?.cat ?? null}
        onOpenChange={(v) => !v && setPicker(null)}
        onAdd={(assetId) => picker && addAsset(picker.slot, assetId)}
      />
    </div>
  );
}
