"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Box,
  Circle,
  ClipboardPaste,
  Copy,
  CopyPlus,
  ExternalLink,
  Eye,
  FileText,
  Image as ImageIcon,
  Plus,
  Scissors,
  Shapes,
  Upload,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { AssetTile } from "@/components/app/asset-tile";
import { AssetQuickLook } from "@/components/app/asset-quicklook";
import { useContextMenu, type CtxItem } from "@/components/app/context-menu";
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
  piecesUsing,
  type SlotKey,
} from "@/lib/mock/library";
import { getPiece } from "@/lib/mock/pieces-store";
import { boardsForProduct } from "@/lib/mock/moodboard";
import { cn } from "@/lib/utils";

type Upload = { id: string; name: string; fileType: string; size: string; dataUrl?: string };

const prettySize = (b: number) =>
  b < 1024 ? `${b} B` : b < 1_048_576 ? `${Math.round(b / 1024)} KB` : `${(b / 1_048_576).toFixed(1)} MB`;

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
      <div
        className={cn(
          "absolute right-1/2 top-1/2 z-30 size-44 origin-center -translate-y-1/2 translate-x-1/2 transition-all duration-200 ease-out",
          open ? "scale-100 opacity-100" : "pointer-events-none scale-50 opacity-0",
        )}
      >
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
                transitionDelay: open ? `${i * 25}ms` : "0ms",
              }}
              className="absolute flex size-12 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center gap-0.5 rounded-full border bg-card text-ink-soft shadow-sm transition-transform duration-150 hover:scale-110 hover:border-accent/50 hover:text-accent-ink cursor-pointer"
            >
              <Icon className="size-4" />
              <span className="text-[9px] leading-none">{it.label}</span>
            </button>
          );
        })}
      </div>
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
  const router = useRouter();
  const { openMenu, contextMenu } = useContextMenu();
  const base = getPiece(params.piece);

  const [slots, setSlots] = React.useState<Record<SlotKey, string[]> | null>(
    base ? base.slots : null,
  );
  const [clipboard, setClipboard] = React.useState<
    { assetId: string; cut?: SlotKey } | null
  >(null);
  const [picker, setPicker] = React.useState<{ slot: SlotKey; cat: string } | null>(null);
  const [uploads, setUploads] = React.useState<Record<string, Upload>>({});
  const [preview, setPreview] = React.useState<string | null>(null);
  const [dragSlot, setDragSlot] = React.useState<SlotKey | null>(null);
  const uploadCtx = React.useRef<SlotKey | null>(null);
  const fileInput = React.useRef<HTMLInputElement>(null);

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
  const moodboards = base.productId ? boardsForProduct(base.productId) : [];

  const resolve = (id: string): { name: string; fileType: string; size: string } | undefined =>
    uploads[id] ?? assetById(id);

  const addFiles = (slot: SlotKey, list: FileList | null) => {
    if (!list || list.length === 0) return;
    Array.from(list).forEach((file) => {
      const id = `up-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const ext = file.name.split(".").pop()?.toUpperCase() ?? "FILE";
      const meta: Upload = { id, name: file.name, fileType: ext, size: prettySize(file.size) };
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = () => setUploads((u) => ({ ...u, [id]: { ...meta, dataUrl: reader.result as string } }));
        reader.readAsDataURL(file);
      } else {
        setUploads((u) => ({ ...u, [id]: meta }));
      }
      addAsset(slot, id);
    });
    toast.success(list.length === 1 ? "File uploaded" : `${list.length} files uploaded`);
  };

  const openUpload = (slot: SlotKey) => {
    uploadCtx.current = slot;
    fileInput.current?.click();
  };

  const rowMenu = (slot: SlotKey, id: string): CtxItem[] => {
    const lib = assetById(id);
    return [
      { label: "Open", icon: Eye, onClick: () => setPreview(id) },
      ...(lib
        ? [{ label: "Open source", icon: ExternalLink, onClick: () => router.push(`/assets?file=${id}`) }]
        : []),
      { label: "Copy", icon: Copy, onClick: () => { setClipboard({ assetId: id }); toast.success("Copied"); } },
      { label: "Cut", icon: Scissors, onClick: () => { setClipboard({ assetId: id, cut: slot }); toast.success("Cut — paste into a slot"); } },
      { label: "Duplicate", icon: CopyPlus, onClick: () => addAsset(slot, id) },
      { type: "sep" },
      { label: "Remove", icon: X, destructive: true, onClick: () => removeAsset(slot, id) },
    ];
  };

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
        <div className="flex flex-col items-end gap-1.5">
          {base.productId && (
            <Button asChild variant="secondary" size="sm">
              <Link href={`/samples?product=${base.productId}`}>
                Open in Product Status <ArrowRight className="size-4" />
              </Link>
            </Button>
          )}
          {moodboards.length > 0 && (
            <Button asChild variant="secondary" size="sm">
              <Link href={`/moodboard?board=${moodboards[0].id}`}>
                <ImageIcon className="size-4" /> Moodboard
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Slots grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {SLOTS.map((slot) => {
          const ids = slots[slot];
          return (
            <section
              key={slot}
              onDragOver={(e) => {
                e.preventDefault();
                setDragSlot(slot);
              }}
              onDragLeave={() => setDragSlot((s) => (s === slot ? null : s))}
              onDrop={(e) => {
                e.preventDefault();
                setDragSlot(null);
                addFiles(slot, e.dataTransfer.files);
              }}
              className={cn(
                "rounded-xl border bg-card p-4 transition-colors",
                dragSlot === slot && "border-accent/60 bg-accent-soft/20",
              )}
            >
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
                        openUpload(slot);
                        return;
                      }
                      setPicker({ slot, cat });
                    }}
                  />
                </div>
              </div>

              {ids.length === 0 ? (
                <button
                  onClick={() => openUpload(slot)}
                  className="flex w-full flex-col items-center justify-center gap-1 rounded-lg border border-dashed py-6 text-center text-xs text-ink-faint transition-colors hover:border-accent/50 hover:text-accent-ink cursor-pointer"
                >
                  <Upload className="size-4" />
                  Drop files or click to upload · hover + for library
                </button>
              ) : (
                <div className="space-y-2">
                  {ids.map((id, idx) => {
                    const up = uploads[id];
                    const info = resolve(id);
                    if (!info) return null;
                    const libAsset = assetById(id);
                    return (
                      <div
                        key={`${id}-${idx}`}
                        onContextMenu={(e) => openMenu(e, rowMenu(slot, id))}
                        className="group flex items-center gap-3 rounded-lg border bg-surface-2/40 p-2"
                      >
                        <button
                          onClick={() => setPreview(id)}
                          className="flex min-w-0 flex-1 items-center gap-3 text-left cursor-pointer"
                        >
                          <span className="size-11 shrink-0 overflow-hidden rounded-md border">
                            {up?.dataUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={up.dataUrl} alt="" className="size-full object-cover" />
                            ) : up ? (
                              <span className="flex size-full flex-col items-center justify-center gap-0.5 bg-surface-2 text-ink-faint">
                                <FileText className="size-4" />
                                <span className="text-[8px]">{up.fileType}</span>
                              </span>
                            ) : (
                              <AssetTile asset={libAsset} className="size-full" />
                            )}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">{info.name}</p>
                            <p className="text-[11px] text-ink-faint">{info.fileType} · {info.size}</p>
                          </div>
                        </button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="px-1 text-ink-faint opacity-0 transition-opacity group-hover:opacity-100 cursor-pointer">
                              ···
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {libAsset && (
                              <DropdownMenuItem asChild>
                                <Link href={`/assets?file=${id}`}>
                                  <ExternalLink className="size-4" /> Open source
                                </Link>
                              </DropdownMenuItem>
                            )}
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

      <input
        ref={fileInput}
        type="file"
        multiple
        hidden
        onChange={(e) => {
          if (uploadCtx.current) addFiles(uploadCtx.current, e.target.files);
          e.target.value = "";
        }}
      />

      {/* Rich Quick Look preview */}
      <AssetQuickLook
        open={!!preview}
        onOpenChange={(v) => !v && setPreview(null)}
        asset={preview ? assetById(preview) : undefined}
        upload={preview ? uploads[preview] : undefined}
        backlinks={preview && assetById(preview) ? piecesUsing(PIECES, preview) : []}
        onOpenSource={
          preview && assetById(preview)
            ? () => router.push(`/assets?file=${preview}`)
            : undefined
        }
      />

      {contextMenu}
    </div>
  );
}
