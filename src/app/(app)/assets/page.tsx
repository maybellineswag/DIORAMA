"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Upload,
  Sparkles,
  BookOpen,
  Boxes,
  Layers,
  ArrowLeft,
  ChevronRight,
  FolderOpen,
  FolderPlus,
  Pencil,
  Trash2,
  Copy,
  Info,
  Plus,
} from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/app/page-header";
import { ViewSwitcher } from "@/components/app/view-switcher";
import { MoodFreeFolders } from "@/components/app/mood-free-folders";
import { AssetTile } from "@/components/app/asset-tile";
import { AssetQuickLook } from "@/components/app/asset-quicklook";
import { useContextMenu, type CtxItem } from "@/components/app/context-menu";
import { Thumb } from "@/components/thumb";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { GUIDES } from "@/lib/mock/data";
import {
  PIECES,
  SLOTS,
  LIBRARY_ASSETS,
  LIBRARY_CATEGORIES,
  piecesUsing,
  registerAsset,
  type Piece,
  type SlotKey,
} from "@/lib/mock/library";
import { addPiece, piecesSnapshot, subscribePieces } from "@/lib/mock/pieces-store";
import type { Asset, Guide } from "@/lib/mock/types";
import { cn } from "@/lib/utils";

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

/** A library asset card. */
function AssetCard({
  asset,
  onOpen,
  onContextMenu,
}: {
  asset: Asset;
  onOpen: () => void;
  onContextMenu: (e: React.MouseEvent) => void;
}) {
  const uses = piecesUsing(PIECES, asset.id).length;
  return (
    <button
      onClick={onOpen}
      onContextMenu={onContextMenu}
      className="group flex flex-col overflow-hidden rounded-xl border bg-card text-left transition-all hover:border-ink-faint/40 hover:shadow-md cursor-pointer"
    >
      <div className="aspect-square overflow-hidden">
        <AssetTile asset={asset} className="size-full" />
      </div>
      <div className="p-3">
        <p className="truncate text-sm font-medium">{asset.name}</p>
        <div className="mt-1.5 flex items-center justify-between">
          <Badge variant="outline">{asset.fileType}</Badge>
          {uses > 0 && <span className="text-[11px] text-ink-faint">used in {uses}</span>}
        </div>
      </div>
    </button>
  );
}

export default function AssetsPage() {
  const router = useRouter();
  const { openMenu, contextMenu } = useContextMenu();
  const [mode, setMode] = React.useState<"pieces" | "library" | "guides">("pieces");
  const [selAsset, setSelAsset] = React.useState<Asset | null>(null);
  const [assetOpen, setAssetOpen] = React.useState(false);
  const [cats, setCats] = React.useState<string[]>(() =>
    LIBRARY_CATEGORIES.filter((c) => c !== "All"),
  );
  const [folder, setFolder] = React.useState<string | null>(null);
  const [libQuery, setLibQuery] = React.useState("");
  const [folderDialog, setFolderDialog] = React.useState<
    { mode: "new" | "rename"; value: string; original?: string } | null
  >(null);
  const [localAssets, setLocalAssets] = React.useState<Asset[]>([]);
  const [newPiece, setNewPiece] = React.useState<
    { name: string; collection: string; mockup?: string } | null
  >(null);
  const mockupInput = React.useRef<HTMLInputElement>(null);
  const uploadInput = React.useRef<HTMLInputElement>(null);

  const pieces = React.useSyncExternalStore(subscribePieces, piecesSnapshot, piecesSnapshot);
  const allAssets = React.useMemo(() => [...LIBRARY_ASSETS, ...localAssets], [localAssets]);

  // Deep link: /assets?file=ID opens that asset's Quick Look.
  React.useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("file");
    const a = id && LIBRARY_ASSETS.find((x) => x.id === id);
    if (a) {
      setMode("library");
      setFolder(a.category);
      setSelAsset(a);
      setAssetOpen(true);
    }
  }, []);

  const openAsset = (a: Asset) => {
    setSelAsset(a);
    setAssetOpen(true);
  };

  const countFor = (c: string) => allAssets.filter((a) => a.category === c).length;

  const prettySize = (b: number) =>
    b < 1024 ? `${b} B` : b < 1_048_576 ? `${Math.round(b / 1024)} KB` : `${(b / 1_048_576).toFixed(1)} MB`;

  const handleUpload = (list: FileList | null) => {
    if (!list || list.length === 0) return;
    const target = folder ?? "Uploads";
    if (!cats.includes(target)) setCats((cs) => [...cs, target]);
    Array.from(list).forEach((file) => {
      const id = `up-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const ext = (file.name.split(".").pop() ?? "FILE").toUpperCase();
      const base: Asset = {
        id,
        name: file.name,
        category: target as Asset["category"],
        fileType: ext,
        collection: "Uploads",
        productType: "—",
        season: "—",
        size: prettySize(file.size),
        updated: new Date().toISOString().slice(0, 10),
        seed: id,
      };
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = () =>
          setLocalAssets((la) => [...la, { ...base, src: reader.result as string }]);
        reader.readAsDataURL(file);
      } else {
        setLocalAssets((la) => [...la, base]);
      }
    });
    setMode("library");
    if (!folder) setFolder(target);
    toast.success(list.length === 1 ? "File uploaded" : `${list.length} files uploaded`);
  };

  const createPiece = () => {
    if (!newPiece || !newPiece.name.trim()) return;
    const id = `pc-${Date.now().toString(36)}`;
    const slots = SLOTS.reduce(
      (o, s) => ({ ...o, [s]: [] as string[] }),
      {} as Record<SlotKey, string[]>,
    );
    // A mockup added at creation becomes a real asset in the Mockup slot.
    if (newPiece.mockup) {
      const mockId = `up-mock-${id}`;
      registerAsset({
        id: mockId,
        name: `${newPiece.name.trim()} — Mockup`,
        category: "Templates",
        fileType: "PNG",
        collection: newPiece.collection.trim() || "Unassigned",
        productType: "Mockup",
        season: "—",
        size: "—",
        updated: new Date().toISOString().slice(0, 10),
        seed: mockId,
        src: newPiece.mockup,
      });
      slots.Mockup = [mockId];
    }
    addPiece({
      id,
      name: newPiece.name.trim(),
      seed: id,
      image: newPiece.mockup,
      collection: newPiece.collection.trim() || "Unassigned",
      drop: "—",
      slots,
    });
    setNewPiece(null);
    router.push(`/assets/${id}`);
  };

  const submitFolder = () => {
    if (!folderDialog) return;
    const name = folderDialog.value.trim();
    if (!name) return;
    if (folderDialog.mode === "new") {
      setCats((cs) => (cs.includes(name) ? cs : [...cs, name]));
      toast.success(`Created folder “${name}”`);
    } else if (folderDialog.original) {
      const orig = folderDialog.original;
      setCats((cs) => cs.map((c) => (c === orig ? name : c)));
      setFolder((f) => (f === orig ? name : f));
      toast.success("Folder renamed");
    }
    setFolderDialog(null);
  };

  const deleteFolder = (name: string) => {
    setCats((cs) => cs.filter((c) => c !== name));
    setFolder((f) => (f === name ? null : f));
    toast.success(`Moved “${name}” to Trash`);
  };

  const folderMenu = (c: string): CtxItem[] => [
    { label: "Open", icon: FolderOpen, onClick: () => setFolder(c) },
    { label: "Get Info", icon: Info, onClick: () => toast.message(c, { description: `${countFor(c)} items` }) },
    { label: "Rename…", icon: Pencil, onClick: () => setFolderDialog({ mode: "rename", value: c, original: c }) },
    { label: "New Folder", icon: FolderPlus, onClick: () => setFolderDialog({ mode: "new", value: "" }) },
    { type: "sep" },
    { label: "Move to Trash", icon: Trash2, destructive: true, onClick: () => deleteFolder(c) },
  ];

  const assetMenu = (a: Asset): CtxItem[] => [
    { label: "Open", icon: FolderOpen, onClick: () => openAsset(a) },
    { label: "Get Info", icon: Info, onClick: () => openAsset(a) },
    { label: "Copy", icon: Copy, onClick: () => toast.success(`Copied ${a.name}`) },
    { type: "sep" },
    { label: "Move to Trash", icon: Trash2, destructive: true, onClick: () => toast.success(`Moved ${a.name} to Trash`) },
  ];

  const pieceMenu = (p: Piece): CtxItem[] => [
    { label: "Open", icon: FolderOpen, onClick: () => router.push(`/assets/${p.id}`) },
    { label: "Rename…", icon: Pencil, onClick: () => toast.message("Rename is simulated in this prototype.") },
    { label: "Duplicate", icon: Copy, onClick: () => toast.success(`Duplicated ${p.name}`) },
  ];

  // Group pieces by collection for the Pieces view.
  const byCollection = pieces.reduce<Record<string, Piece[]>>((acc, p) => {
    (acc[p.collection] ??= []).push(p);
    return acc;
  }, {});

  const searching = libQuery.trim().length > 0;
  const searchResults = searching
    ? allAssets.filter((a) =>
        (a.name + a.fileType + a.category).toLowerCase().includes(libQuery.toLowerCase()),
      )
    : [];
  const folderItems = folder ? allAssets.filter((a) => a.category === folder) : [];

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6 lg:p-8">
      <PageHeader
        title="Asset Library"
        description="Pieces built from a shared library — reuse motifs, hardware, and notions everywhere."
        actions={
          <div className="flex items-center gap-2">
            <ViewSwitcher
              value={mode}
              onChange={(v) => setMode(v)}
              options={[
                { id: "pieces", label: "Pieces", icon: Layers },
                { id: "library", label: "Library", icon: Boxes },
                { id: "guides", label: "Guides", icon: BookOpen },
              ]}
            />
            {mode === "pieces" ? (
              <Button size="sm" onClick={() => setNewPiece({ name: "", collection: "" })}>
                <Plus className="size-4" /> New piece
              </Button>
            ) : mode === "library" ? (
              <Button size="sm" onClick={() => uploadInput.current?.click()}>
                <Upload className="size-4" /> Upload
              </Button>
            ) : null}
          </div>
        }
      />

      <input
        ref={uploadInput}
        type="file"
        multiple
        hidden
        onChange={(e) => {
          handleUpload(e.target.files);
          e.target.value = "";
        }}
      />

      {/* Finder-style path bar (library only) */}
      {mode === "library" && !searching && (
        <div className="flex items-center gap-1 text-sm">
          <button
            onClick={() => setFolder(null)}
            className={cn(
              "rounded px-1.5 py-0.5 transition-colors hover:bg-elevated cursor-pointer",
              folder ? "text-ink-faint" : "font-medium",
            )}
          >
            Library
          </button>
          {folder && (
            <>
              <ChevronRight className="size-3.5 text-ink-faint" />
              <span className="rounded px-1.5 py-0.5 font-medium">{folder}</span>
            </>
          )}
        </div>
      )}

      {mode === "guides" ? (
        <GuidesView />
      ) : mode === "pieces" ? (
        <div
          className="min-h-[60vh] space-y-8"
          onContextMenu={(e) =>
            openMenu(e, [
              { label: "New piece", icon: Plus, onClick: () => setNewPiece({ name: "", collection: "" }) },
            ])
          }
        >
          {Object.entries(byCollection).map(([collection, pieces]) => (
            <section key={collection}>
              <div className="mb-3 flex items-baseline gap-2">
                <h2 className="text-sm font-medium">{collection}</h2>
                <span className="text-xs text-ink-faint">{pieces.length}</span>
              </div>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {pieces.map((p) => {
                  const count = Object.values(p.slots).reduce((n, ids) => n + ids.length, 0);
                  return (
                    <button
                      key={p.id}
                      onClick={() => router.push(`/assets/${p.id}`)}
                      onContextMenu={(e) => openMenu(e, pieceMenu(p))}
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
                      <p className="text-xs text-ink-faint">{count} assets</p>
                    </button>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <>
          {/* Library search — overrides folders */}
          <div className="relative">
            <Sparkles className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-accent-ink" />
            <Input
              value={libQuery}
              onChange={(e) => setLibQuery(e.target.value)}
              placeholder="Search the whole library…"
              className="h-11 pl-9"
            />
          </div>

          {searching ? (
            <>
              <p className="text-xs text-ink-faint">{searchResults.length} matches for “{libQuery}”</p>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {searchResults.map((a) => (
                  <AssetCard key={a.id} asset={a} onOpen={() => openAsset(a)} onContextMenu={(e) => openMenu(e, assetMenu(a))} />
                ))}
              </div>
            </>
          ) : folder ? (
            <div
              className="min-h-[60vh] space-y-4"
              onContextMenu={(e) =>
                openMenu(e, [
                  { label: "Upload…", icon: Upload, onClick: () => uploadInput.current?.click() },
                  { label: "New Folder", icon: FolderPlus, onClick: () => setFolderDialog({ mode: "new", value: "" }) },
                ])
              }
            >
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" onClick={() => setFolder(null)}>
                  <ArrowLeft className="size-4" /> Folders
                </Button>
                <span className="text-xs text-ink-faint">{folderItems.length} items</span>
              </div>
              {folderItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed py-16 text-center text-ink-faint">
                  <FolderOpen className="size-6" />
                  <p className="text-sm">This folder is empty.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                  {folderItems.map((a) => (
                    <AssetCard key={a.id} asset={a} onOpen={() => openAsset(a)} onContextMenu={(e) => openMenu(e, assetMenu(a))} />
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Free draggable folders (positions persist), Finder-style */
            <div
              onContextMenu={(e) => {
                e.preventDefault();
                openMenu(e, [
                  { label: "New Folder", icon: FolderPlus, onClick: () => setFolderDialog({ mode: "new", value: "" }) },
                ]);
              }}
            >
              <MoodFreeFolders
                categories={cats}
                countFor={countFor}
                onOpen={(c) => setFolder(c)}
                onAdd={() => setFolderDialog({ mode: "new", value: "" })}
                onContext={(c, e) => openMenu(e, folderMenu(c))}
                storageKey="diorama.library.folderPositions.v1"
                addLabel="New folder"
                scatter
                toolbar
              />
            </div>
          )}
        </>
      )}

      {/* Rich Quick Look preview */}
      <AssetQuickLook
        open={assetOpen}
        onOpenChange={setAssetOpen}
        asset={selAsset ?? undefined}
        backlinks={selAsset ? piecesUsing(PIECES, selAsset.id) : []}
        onOpenPiece={(p) => {
          setAssetOpen(false);
          router.push(`/assets/${p.id}`);
        }}
      />

      {/* New / rename folder dialog */}
      <Dialog open={!!folderDialog} onOpenChange={(v) => !v && setFolderDialog(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{folderDialog?.mode === "rename" ? "Rename folder" : "New folder"}</DialogTitle>
            <DialogDescription>
              {folderDialog?.mode === "rename" ? "Give this folder a new name." : "Create a new folder in the library."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="folder-name">Name</Label>
            <Input
              id="folder-name"
              value={folderDialog?.value ?? ""}
              onChange={(e) => setFolderDialog((d) => (d ? { ...d, value: e.target.value } : d))}
              onKeyDown={(e) => e.key === "Enter" && submitFolder()}
              placeholder="e.g. Trims"
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setFolderDialog(null)}>Cancel</Button>
            <Button onClick={submitFolder}>{folderDialog?.mode === "rename" ? "Rename" : "Create"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New piece dialog */}
      <Dialog open={!!newPiece} onOpenChange={(v) => !v && setNewPiece(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>New piece</DialogTitle>
            <DialogDescription>
              Creates a garment with the six standard slots scaffolded and empty.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="piece-name">Name</Label>
              <Input
                id="piece-name"
                value={newPiece?.name ?? ""}
                onChange={(e) => setNewPiece((p) => (p ? { ...p, name: e.target.value } : p))}
                onKeyDown={(e) => e.key === "Enter" && createPiece()}
                placeholder="e.g. Reliquary Overshirt"
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="piece-collection">Collection</Label>
              <Input
                id="piece-collection"
                list="collections"
                value={newPiece?.collection ?? ""}
                onChange={(e) => setNewPiece((p) => (p ? { ...p, collection: e.target.value } : p))}
                onKeyDown={(e) => e.key === "Enter" && createPiece()}
                placeholder="e.g. AW25 — Reliquary"
              />
              <datalist id="collections">
                {Object.keys(byCollection).map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>
            <div className="space-y-2">
              <Label>Mockup</Label>
              <input
                ref={mockupInput}
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = () =>
                    setNewPiece((p) => (p ? { ...p, mockup: reader.result as string } : p));
                  reader.readAsDataURL(file);
                  e.target.value = "";
                }}
              />
              <button
                onClick={() => mockupInput.current?.click()}
                className="flex w-full items-center gap-3 rounded-lg border border-dashed p-2.5 text-left transition-colors hover:border-accent/50 cursor-pointer"
              >
                <span className="size-12 shrink-0 overflow-hidden rounded-md border bg-surface-2">
                  {newPiece?.mockup ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={newPiece.mockup} alt="" className="size-full object-cover" />
                  ) : (
                    <span className="flex size-full items-center justify-center text-ink-faint">
                      <Upload className="size-4" />
                    </span>
                  )}
                </span>
                <span className="text-sm text-ink-soft">
                  {newPiece?.mockup ? "Mockup added — click to replace" : "Add a mockup image"}
                </span>
              </button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setNewPiece(null)}>Cancel</Button>
            <Button onClick={createPiece} disabled={!newPiece?.name.trim()}>Create piece</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {contextMenu}
    </div>
  );
}
