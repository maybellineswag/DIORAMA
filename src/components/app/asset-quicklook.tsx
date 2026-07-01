"use client";

import * as React from "react";
import { ArrowRight, Download, ExternalLink, FileText, Maximize2 } from "lucide-react";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Thumb } from "@/components/thumb";
import { ThreeViewer } from "@/components/three-viewer";
import { isDoc, is3D } from "@/components/app/asset-tile";
import type { Asset } from "@/lib/mock/types";
import type { Piece } from "@/lib/mock/library";

export type QuickLookUpload = {
  id: string;
  name: string;
  fileType: string;
  size: string;
  dataUrl?: string;
};

function Meta({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-xs text-ink-faint">{label}</p>
      <p className="text-sm">{value}</p>
    </div>
  );
}

/** Finder "Quick Look"-style centered preview with rich info + backlinks. */
export function AssetQuickLook({
  open,
  onOpenChange,
  asset,
  upload,
  backlinks = [],
  onOpenPiece,
  onOpenSource,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  asset?: Asset;
  upload?: QuickLookUpload;
  backlinks?: Piece[];
  onOpenPiece?: (p: Piece) => void;
  onOpenSource?: () => void;
}) {
  const [full, setFull] = React.useState(false);
  const name = asset?.name ?? upload?.name ?? "";
  const fileType = asset?.fileType ?? upload?.fileType ?? "";
  const threeD = asset ? is3D(asset) : false;

  const media = upload?.dataUrl ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={upload.dataUrl} alt="" className="size-full object-contain" />
  ) : threeD && asset ? (
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
  ) : asset && !isDoc(asset.fileType) ? (
    <Thumb seed={asset.seed} />
  ) : (
    <div className="flex h-full flex-col items-center justify-center gap-2 text-ink-faint">
      <FileText className="size-9" />
      <span className="text-sm">{fileType || "File"} document</span>
    </div>
  );

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl overflow-hidden p-0">
          <DialogTitle className="sr-only">{name}</DialogTitle>
          <div className="grid md:grid-cols-[1.15fr_1fr]">
            <div className="relative aspect-square overflow-hidden bg-surface-2">{media}</div>

            <div className="flex max-h-[80vh] flex-col overflow-y-auto p-5">
              <h2 className="display text-lg leading-tight tracking-tight">{name}</h2>
              <p className="mt-0.5 text-sm text-ink-faint">
                {asset?.category ?? "Upload"} · {fileType}
              </p>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {asset ? (
                  <>
                    <Badge variant="accent">{asset.category}</Badge>
                    <Badge variant="outline">{asset.fileType}</Badge>
                    <Badge variant="outline">{asset.season}</Badge>
                  </>
                ) : (
                  <Badge variant="outline">Uploaded</Badge>
                )}
              </div>

              <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-4">
                {asset ? (
                  <>
                    <Meta label="Collection" value={asset.collection} />
                    <Meta label="Size" value={asset.size} />
                    <Meta label="Updated" value={asset.updated} />
                    <Meta label="Product type" value={asset.productType} />
                    <Meta label="Season" value={asset.season} />
                    <Meta label="Category" value={asset.category} />
                  </>
                ) : (
                  <>
                    <Meta label="Size" value={upload?.size} />
                    <Meta label="Type" value={fileType} />
                    <div className="col-span-2">
                      <p className="text-xs text-ink-faint">Source</p>
                      <p className="text-sm text-ink-soft">Uploaded in this prototype (not yet in the shared library)</p>
                    </div>
                  </>
                )}
              </div>

              {asset && (
                <>
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
                          onClick={() => onOpenPiece?.(p)}
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
                </>
              )}

              <div className="mt-auto flex gap-2 pt-5">
                {onOpenSource && (
                  <Button variant="secondary" className="flex-1" onClick={onOpenSource}>
                    <ExternalLink className="size-4" /> Open source
                  </Button>
                )}
                <Button className="flex-1">
                  <Download className="size-4" /> Download
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {threeD && asset && (
        <Dialog open={full} onOpenChange={setFull}>
          <DialogContent className="h-[85vh] max-w-5xl overflow-hidden p-0">
            <DialogTitle className="sr-only">{name}</DialogTitle>
            <ThreeViewer seed={asset.seed} className="size-full" />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
