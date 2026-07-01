"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Upload,
  Sparkles,
  FileText,
  Download,
  BookOpen,
  Boxes,
  Layers,
  Maximize2,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/app/page-header";
import { ViewSwitcher } from "@/components/app/view-switcher";
import { MoodFreeFolders } from "@/components/app/mood-free-folders";
import { AssetTile, isDoc, is3D } from "@/components/app/asset-tile";
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
import { GUIDES } from "@/lib/mock/data";
import {
  PIECES,
  LIBRARY_ASSETS,
  LIBRARY_CATEGORIES,
  piecesUsing,
  type Piece,
} from "@/lib/mock/library";
import type { Asset, Guide } from "@/lib/mock/types";
import { cn } from "@/lib/utils";

// ── Library asset preview (with Are.na-style backlinks) ──────
function AssetPreview({
  asset,
  onOpenPiece,
}: {
  asset: Asset;
  onOpenPiece: (p: Piece) => void;
}) {
  const [full, setFull] = React.useState(false);
  const backlinks = piecesUsing(PIECES, asset.id);
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

/** A library asset card. */
function AssetCard({ asset, onOpen }: { asset: Asset; onOpen: () => void }) {
  const uses = piecesUsing(PIECES, asset.id).length;
  return (
    <button
      onClick={onOpen}
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
  const [mode, setMode] = React.useState<"pieces" | "library" | "guides">("pieces");
  const [selAsset, setSelAsset] = React.useState<Asset | null>(null);
  const [assetOpen, setAssetOpen] = React.useState(false);
  const [folder, setFolder] = React.useState<string | null>(null);
  const [libQuery, setLibQuery] = React.useState("");

  // Deep link: /assets?file=ID opens that asset's preview.
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

  const countFor = (c: string) => LIBRARY_ASSETS.filter((a) => a.category === c).length;

  // Group pieces by collection for the Pieces view.
  const byCollection = PIECES.reduce<Record<string, Piece[]>>((acc, p) => {
    (acc[p.collection] ??= []).push(p);
    return acc;
  }, {});

  const searching = libQuery.trim().length > 0;
  const searchResults = searching
    ? LIBRARY_ASSETS.filter((a) =>
        (a.name + a.fileType + a.category).toLowerCase().includes(libQuery.toLowerCase()),
      )
    : [];
  const folderItems = folder ? LIBRARY_ASSETS.filter((a) => a.category === folder) : [];

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
            <Button size="sm"><Upload className="size-4" /> Upload</Button>
          </div>
        }
      />

      {mode === "guides" ? (
        <GuidesView />
      ) : mode === "pieces" ? (
        <div className="space-y-8">
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
                  <AssetCard key={a.id} asset={a} onOpen={() => openAsset(a)} />
                ))}
              </div>
            </>
          ) : folder ? (
            <>
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" onClick={() => setFolder(null)}>
                  <ArrowLeft className="size-4" /> Folders
                </Button>
                <span className="text-sm font-medium">{folder}</span>
                <span className="text-xs text-ink-faint">{folderItems.length}</span>
              </div>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {folderItems.map((a) => (
                  <AssetCard key={a.id} asset={a} onOpen={() => openAsset(a)} />
                ))}
              </div>
            </>
          ) : (
            /* Free draggable folders (positions persist) */
            <MoodFreeFolders
              categories={LIBRARY_CATEGORIES.filter((c) => c !== "All")}
              countFor={countFor}
              onOpen={(c) => setFolder(c)}
              onAdd={() => toast.success("New library folder is simulated in this prototype.")}
              storageKey="diorama.library.folderPositions.v1"
              addLabel="New folder"
              scatter
            />
          )}
        </>
      )}

      {/* Library asset preview */}
      <Sheet open={assetOpen} onOpenChange={setAssetOpen}>
        <SheetContent side="right" className="flex w-full flex-col p-0 sm:max-w-md">
          {selAsset && (
            <AssetPreview
              asset={selAsset}
              onOpenPiece={(p) => {
                setAssetOpen(false);
                router.push(`/assets/${p.id}`);
              }}
            />
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
