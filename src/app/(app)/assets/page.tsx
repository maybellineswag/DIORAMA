"use client";

import * as React from "react";
import Link from "next/link";
import {
  Upload,
  Sparkles,
  Box,
  FileText,
  Download,
  BookOpen,
  Boxes,
  Layers,
  Shapes,
  Circle,
  Plus,
  Maximize2,
  Copy,
  Scissors,
  CopyPlus,
  X,
  ExternalLink,
  ClipboardPaste,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/app/page-header";
import { ViewSwitcher } from "@/components/app/view-switcher";
import { Thumb } from "@/components/thumb";
import { ThreeViewer } from "@/components/three-viewer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { GUIDES } from "@/lib/mock/data";
import {
  PIECES,
  SLOTS,
  LIBRARY_ASSETS,
  LIBRARY_CATEGORIES,
  assetById,
  piecesUsing,
  type Piece,
  type SlotKey,
} from "@/lib/mock/library";
import type { Asset, Guide } from "@/lib/mock/types";
import { cn } from "@/lib/utils";

const isDoc = (ft: string) => ["PDF", "INDD", "DOC"].includes(ft);
const is3D = (a?: Asset) => a?.category === "Hardware";

/** Small square preview for chips + grid cells. */
function AssetTile({ asset, className }: { asset?: Asset; className?: string }) {
  if (!asset) return <div className={cn("bg-surface-2", className)} />;
  if (isDoc(asset.fileType)) {
    return (
      <div className={cn("flex flex-col items-center justify-center gap-1 bg-surface-2 text-ink-faint", className)}>
        <FileText className="size-5" />
        <span className="text-[10px]">{asset.fileType}</span>
      </div>
    );
  }
  return (
    <div className={cn("relative", className)}>
      <Thumb seed={asset.seed} />
      {is3D(asset) && (
        <span className="absolute right-1 top-1 flex items-center gap-0.5 rounded bg-paper/80 px-1 py-px text-[9px] text-ink-soft backdrop-blur">
          <Box className="size-2.5" /> 3D
        </span>
      )}
    </div>
  );
}

// ── Radial quick-add wheel ───────────────────────────────────
const WHEEL: { key: string; label: string; icon: typeof Box }[] = [
  { key: "Graphics", label: "Motif", icon: Shapes },
  { key: "Hardware", label: "Hardware", icon: Box },
  { key: "Notions", label: "Notion", icon: Circle },
  { key: "Templates", label: "Template", icon: FileText },
  { key: "upload", label: "Upload", icon: Upload },
];

function RadialAdd({ onPick }: { onPick: (cat: string) => void }) {
  const [open, setOpen] = React.useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="flex size-6 items-center justify-center rounded-md border border-dashed text-ink-faint transition-colors hover:border-accent/50 hover:text-accent-ink cursor-pointer">
          <Plus className="size-3.5" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="center" className="size-44 rounded-full p-0">
        <div className="relative size-full">
          <span className="absolute left-1/2 top-1/2 flex size-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-accent-soft text-accent-ink">
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
                className="absolute flex size-12 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center gap-0.5 rounded-full border bg-card text-ink-soft transition-all hover:scale-105 hover:border-accent/50 hover:text-accent-ink cursor-pointer"
              >
                <Icon className="size-4" />
                <span className="text-[9px] leading-none">{it.label}</span>
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
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

// ── Piece detail with slots ──────────────────────────────────
function PieceDetail({
  piece,
  clipboard,
  onCopy,
  onCut,
  onPaste,
  onDuplicate,
  onRemove,
  onAdd,
  onOpenSource,
}: {
  piece: Piece;
  clipboard: { assetId: string } | null;
  onCopy: (assetId: string) => void;
  onCut: (slot: SlotKey, assetId: string) => void;
  onPaste: (slot: SlotKey) => void;
  onDuplicate: (slot: SlotKey, assetId: string) => void;
  onRemove: (slot: SlotKey, assetId: string) => void;
  onAdd: (slot: SlotKey, cat: string) => void;
  onOpenSource: (assetId: string) => void;
}) {
  return (
    <>
      <SheetHeader>
        <div className="flex items-start gap-3">
          <div className="size-14 shrink-0 overflow-hidden rounded-lg border">
            {piece.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={piece.image} alt="" className="size-full object-cover" />
            ) : (
              <Thumb seed={piece.seed} />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <SheetTitle>{piece.name}</SheetTitle>
            <SheetDescription>{piece.collection}</SheetDescription>
            {piece.productId && (
              <Link
                href={`/samples?product=${piece.productId}`}
                className="mt-1 inline-flex items-center gap-1 text-xs text-accent-ink hover:underline"
              >
                Open in Product Status <ArrowRight className="size-3" />
              </Link>
            )}
          </div>
        </div>
      </SheetHeader>

      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-5">
        {SLOTS.map((slot) => {
          const ids = piece.slots[slot];
          return (
            <div key={slot}>
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs font-medium uppercase tracking-wider text-ink-faint">
                  {slot}
                  <span className="ml-1.5 text-ink-faint/60">{ids.length}</span>
                </p>
                <div className="flex items-center gap-1">
                  {clipboard && (
                    <button
                      onClick={() => onPaste(slot)}
                      title="Paste"
                      className="flex size-6 items-center justify-center rounded-md text-ink-faint transition-colors hover:text-accent-ink cursor-pointer"
                    >
                      <ClipboardPaste className="size-3.5" />
                    </button>
                  )}
                  <RadialAdd onPick={(cat) => onAdd(slot, cat)} />
                </div>
              </div>

              {ids.length === 0 ? (
                <div className="rounded-lg border border-dashed py-4 text-center text-xs text-ink-faint">
                  Empty — add from library
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {ids.map((id, idx) => {
                    const a = assetById(id);
                    if (!a) return null;
                    return (
                      <div
                        key={`${id}-${idx}`}
                        className="group flex items-center gap-2 rounded-lg border bg-surface-2/40 p-1.5"
                      >
                        <span className="size-10 shrink-0 overflow-hidden rounded-md border">
                          <AssetTile asset={a} className="size-full" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-medium">{a.name}</p>
                          <p className="text-[11px] text-ink-faint">{a.fileType}</p>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="opacity-0 transition-opacity group-hover:opacity-100 cursor-pointer">
                              <span className="text-ink-faint">···</span>
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onOpenSource(id)}>
                              <ExternalLink className="size-4" /> Open source
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onCopy(id)}>
                              <Copy className="size-4" /> Copy
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onCut(slot, id)}>
                              <Scissors className="size-4" /> Cut
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onDuplicate(slot, id)}>
                              <CopyPlus className="size-4" /> Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem variant="destructive" onClick={() => onRemove(slot, id)}>
                              <X className="size-4" /> Remove
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}

// ── Library asset preview (with backlinks) ───────────────────
function AssetPreview({
  asset,
  pieces,
  onOpenPiece,
}: {
  asset: Asset;
  pieces: Piece[];
  onOpenPiece: (p: Piece) => void;
}) {
  const [full, setFull] = React.useState(false);
  const backlinks = piecesUsing(pieces, asset.id);
  const threeD = is3D(asset);
  return (
    <>
      <SheetHeader>
        <SheetTitle className="text-base">{asset.name}</SheetTitle>
        <SheetDescription>{asset.category} · {asset.fileType}</SheetDescription>
      </SheetHeader>
      <div className="min-h-0 flex-1 overflow-y-auto p-5">
        <div className="relative aspect-square overflow-hidden rounded-xl border bg-surface-2">
          {threeD ? (
            <>
              <ThreeViewer seed={asset.seed} className="size-full" />
              <button
                onClick={() => setFull(true)}
                className="absolute right-2 top-2 flex size-7 items-center justify-center rounded-md bg-paper/80 text-ink-soft backdrop-blur hover:text-foreground cursor-pointer"
              >
                <Maximize2 className="size-3.5" />
              </button>
              <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-paper/70 py-2 text-center text-xs text-ink-soft backdrop-blur">
                Live 3D · drag to rotate · scroll to zoom
              </div>
            </>
          ) : isDoc(asset.fileType) ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-ink-faint">
              <FileText className="size-8" />
              <span className="text-sm">{asset.fileType} document</span>
              <Button variant="secondary" size="sm">Open</Button>
            </div>
          ) : (
            <Thumb seed={asset.seed} />
          )}
        </div>

        <div className="mt-4 flex flex-wrap gap-1.5">
          <Badge variant="accent">{asset.category}</Badge>
          <Badge variant="outline">{asset.fileType}</Badge>
          <Badge variant="outline">{asset.season}</Badge>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-4 text-sm">
          <div><p className="text-xs text-ink-faint">Collection</p><p>{asset.collection}</p></div>
          <div><p className="text-xs text-ink-faint">Size</p><p>{asset.size}</p></div>
          <div><p className="text-xs text-ink-faint">Updated</p><p>{asset.updated}</p></div>
          <div><p className="text-xs text-ink-faint">Type</p><p>{asset.productType}</p></div>
        </div>

        <Separator className="my-5" />
        {/* Are.na-style backlinks */}
        <p className="mb-2 text-xs font-medium uppercase tracking-wider text-ink-faint">
          Connected to {backlinks.length} piece{backlinks.length === 1 ? "" : "s"}
        </p>
        {backlinks.length === 0 ? (
          <p className="text-sm text-ink-faint">Not used in any piece yet.</p>
        ) : (
          <div className="space-y-2">
            {backlinks.map((p) => (
              <button
                key={p.id}
                onClick={() => onOpenPiece(p)}
                className="flex w-full items-center gap-3 rounded-lg border bg-surface-2/40 p-2.5 text-left transition-colors hover:border-ink-faint/40 cursor-pointer"
              >
                <span className="size-9 shrink-0 overflow-hidden rounded-md border">
                  {p.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.image} alt="" className="size-full object-cover" />
                  ) : (
                    <Thumb seed={p.seed} />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{p.name}</p>
                  <p className="truncate text-xs text-ink-faint">{p.collection}</p>
                </div>
                <ArrowRight className="size-4 text-ink-faint" />
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="border-t p-4">
        <Button className="w-full"><Download className="size-4" /> Download</Button>
      </div>

      {threeD && (
        <Dialog open={full} onOpenChange={setFull}>
          <DialogContent className="h-[85vh] max-w-5xl overflow-hidden p-0">
            <DialogTitle className="sr-only">{asset.name}</DialogTitle>
            <ThreeViewer seed={asset.seed} className="size-full" />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}

function GuidesView() {
  const [active, setActive] = React.useState<Guide>(GUIDES[0]);
  return (
    <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
      <div className="space-y-1">
        {GUIDES.map((g) => (
          <button
            key={g.id}
            onClick={() => setActive(g)}
            className={cn(
              "flex w-full flex-col gap-0.5 rounded-lg border px-3.5 py-3 text-left transition-colors cursor-pointer",
              active.id === g.id ? "border-accent/40 bg-accent-soft/30" : "border-transparent hover:bg-elevated/60",
            )}
          >
            <span className="flex items-center gap-2 text-sm font-medium">
              <BookOpen className="size-3.5 text-ink-faint" /> {g.title}
            </span>
            <span className="line-clamp-1 pl-5 text-xs text-ink-faint">{g.excerpt}</span>
          </button>
        ))}
      </div>
      <article className="rounded-xl border bg-card p-7">
        <Badge variant="outline">{active.category}</Badge>
        <h2 className="display mt-3 text-2xl tracking-tight">{active.title}</h2>
        <Separator className="my-5" />
        <div className="space-y-4">
          {active.body.map((p, i) => (
            <p key={i} className="text-sm leading-relaxed text-ink-soft">{p}</p>
          ))}
        </div>
      </article>
    </div>
  );
}

export default function AssetsPage() {
  const [mode, setMode] = React.useState<"pieces" | "library" | "guides">("pieces");
  const [pieces, setPieces] = React.useState<Piece[]>(PIECES);
  const [clipboard, setClipboard] = React.useState<{ assetId: string; cut?: { pieceId: string; slot: SlotKey } } | null>(null);

  const [openPieceId, setOpenPieceId] = React.useState<string | null>(null);
  const [pieceOpen, setPieceOpen] = React.useState(false);
  const [selAsset, setSelAsset] = React.useState<Asset | null>(null);
  const [assetOpen, setAssetOpen] = React.useState(false);
  const [libCat, setLibCat] = React.useState<string>("All");
  const [libQuery, setLibQuery] = React.useState("");
  const [picker, setPicker] = React.useState<{ slot: SlotKey; cat: string } | null>(null);

  const openPiece = pieces.find((p) => p.id === openPieceId) ?? null;

  // Deep link: /assets?file=ID opens that asset in the library.
  React.useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("file");
    const a = id && LIBRARY_ASSETS.find((x) => x.id === id);
    if (a) {
      setMode("library");
      setSelAsset(a);
      setAssetOpen(true);
    }
  }, []);

  // ── Slot mutations ──
  const mutate = (pieceId: string, slot: SlotKey, fn: (ids: string[]) => string[]) =>
    setPieces((prev) =>
      prev.map((p) =>
        p.id === pieceId ? { ...p, slots: { ...p.slots, [slot]: fn(p.slots[slot]) } } : p,
      ),
    );

  const addAsset = (pieceId: string, slot: SlotKey, assetId: string) =>
    mutate(pieceId, slot, (ids) => [...ids, assetId]);
  const removeAsset = (pieceId: string, slot: SlotKey, assetId: string) =>
    mutate(pieceId, slot, (ids) => {
      const i = ids.indexOf(assetId);
      return i === -1 ? ids : [...ids.slice(0, i), ...ids.slice(i + 1)];
    });

  const paste = (pieceId: string, slot: SlotKey) => {
    if (!clipboard) return;
    addAsset(pieceId, slot, clipboard.assetId);
    if (clipboard.cut) removeAsset(clipboard.cut.pieceId, clipboard.cut.slot, clipboard.assetId);
    setClipboard(null);
    toast.success("Pasted");
  };

  const openSource = (assetId: string) => {
    const a = assetById(assetId);
    if (!a) return;
    setPieceOpen(false);
    setMode("library");
    setSelAsset(a);
    setAssetOpen(true);
  };

  const libItems = LIBRARY_ASSETS.filter((a) => libCat === "All" || a.category === libCat).filter(
    (a) => (libQuery.trim() ? (a.name + a.fileType).toLowerCase().includes(libQuery.toLowerCase()) : true),
  );

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6 lg:p-8">
      <PageHeader
        title="Asset Library"
        description="Pieces built from a shared library — reuse motifs, hardware, and notions everywhere."
        actions={
          <div className="flex items-center gap-2">
            <ViewSwitcher
              value={mode}
              onChange={setMode}
              options={[
                { id: "pieces", label: "Pieces", icon: Layers },
                { id: "library", label: "Library", icon: Boxes },
                { id: "guides", label: "Guides", icon: BookOpen },
              ]}
            />
            <Button size="sm"><Upload className="size-4" /> Upload</Button>
          </div>
        }
      />

      {mode === "guides" ? (
        <GuidesView />
      ) : mode === "pieces" ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {pieces.map((p) => {
            const count = Object.values(p.slots).reduce((n, ids) => n + ids.length, 0);
            return (
              <button
                key={p.id}
                onClick={() => {
                  setOpenPieceId(p.id);
                  setPieceOpen(true);
                }}
                className="group text-left cursor-pointer"
              >
                <div className="aspect-square overflow-hidden rounded-xl border transition-all group-hover:border-ink-faint/40 group-hover:shadow-md">
                  {p.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.image} alt="" className="size-full object-cover" />
                  ) : (
                    <Thumb seed={p.seed} />
                  )}
                </div>
                <p className="mt-2 truncate text-sm font-medium">{p.name}</p>
                <p className="text-xs text-ink-faint">{count} assets · {p.collection.split(" — ")[0]}</p>
              </button>
            );
          })}
        </div>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-[220px] flex-1">
              <Sparkles className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-accent-ink" />
              <Input
                value={libQuery}
                onChange={(e) => setLibQuery(e.target.value)}
                placeholder="Search the library…"
                className="pl-9"
              />
            </div>
            {LIBRARY_CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setLibCat(c)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-[13px] font-medium transition-colors cursor-pointer",
                  libCat === c
                    ? "border-accent/40 bg-accent-soft text-accent-ink"
                    : "border-border text-ink-soft hover:bg-elevated/60",
                )}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {libItems.map((a) => {
              const uses = piecesUsing(pieces, a.id).length;
              return (
                <button
                  key={a.id}
                  onClick={() => {
                    setSelAsset(a);
                    setAssetOpen(true);
                  }}
                  className="group flex flex-col overflow-hidden rounded-xl border bg-card text-left transition-all hover:border-ink-faint/40 hover:shadow-md cursor-pointer"
                >
                  <div className="aspect-square overflow-hidden">
                    <AssetTile asset={a} className="size-full" />
                  </div>
                  <div className="p-3">
                    <p className="truncate text-sm font-medium">{a.name}</p>
                    <div className="mt-1.5 flex items-center justify-between">
                      <Badge variant="outline">{a.fileType}</Badge>
                      {uses > 0 && (
                        <span className="text-[11px] text-ink-faint">used in {uses}</span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </>
      )}

      {/* Piece detail */}
      <Sheet open={pieceOpen} onOpenChange={setPieceOpen}>
        <SheetContent side="right" className="flex w-full flex-col p-0 sm:max-w-md">
          {openPiece && (
            <PieceDetail
              piece={openPiece}
              clipboard={clipboard}
              onCopy={(id) => {
                setClipboard({ assetId: id });
                toast.success("Copied");
              }}
              onCut={(slot, id) => {
                setClipboard({ assetId: id, cut: { pieceId: openPiece.id, slot } });
                toast.success("Cut — paste into a slot");
              }}
              onPaste={(slot) => paste(openPiece.id, slot)}
              onDuplicate={(slot, id) => addAsset(openPiece.id, slot, id)}
              onRemove={(slot, id) => removeAsset(openPiece.id, slot, id)}
              onAdd={(slot, cat) => {
                if (cat === "upload") {
                  toast.success("Upload is simulated in this prototype.");
                  return;
                }
                setPicker({ slot, cat });
              }}
              onOpenSource={openSource}
            />
          )}
        </SheetContent>
      </Sheet>

      {/* Add-from-library picker */}
      {openPiece && (
        <AddPicker
          category={picker?.cat ?? null}
          onOpenChange={(v) => !v && setPicker(null)}
          onAdd={(assetId) => picker && addAsset(openPiece.id, picker.slot, assetId)}
        />
      )}

      {/* Library asset preview */}
      <Sheet open={assetOpen} onOpenChange={setAssetOpen}>
        <SheetContent side="right" className="flex w-full flex-col p-0 sm:max-w-md">
          {selAsset && (
            <AssetPreview
              asset={selAsset}
              pieces={pieces}
              onOpenPiece={(p) => {
                setAssetOpen(false);
                setMode("pieces");
                setOpenPieceId(p.id);
                setPieceOpen(true);
              }}
            />
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
