import { Box, FileText } from "lucide-react";

import { Thumb } from "@/components/thumb";
import type { Asset } from "@/lib/mock/types";
import { cn } from "@/lib/utils";

export const isImage = (ft: string) =>
  ["JPG", "JPEG", "PNG", "SVG", "WEBP", "GIF"].includes(ft.toUpperCase());
export const isPdf = (ft: string) => ft.toUpperCase() === "PDF";
export const isDoc = (ft: string) =>
  ["PDF", "INDD", "DOC", "AI", "PSD", "EPS"].includes(ft.toUpperCase());
export const is3D = (a?: Asset) => a?.category === "Hardware";

/** Small square preview for chips, grid cells, and pickers. */
export function AssetTile({ asset, className }: { asset?: Asset; className?: string }) {
  if (!asset) return <div className={cn("bg-surface-2", className)} />;

  // Real image files get a real thumbnail.
  if (asset.src && isImage(asset.fileType)) {
    return (
      <div className={cn("bg-surface-2", className)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={asset.src} alt={asset.name} className="size-full object-cover" />
      </div>
    );
  }

  // Documents (PDF/AI/PSD/INDD…) show a labelled file tile.
  if (isDoc(asset.fileType) && !is3D(asset)) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center gap-1 bg-surface-2 text-ink-faint",
          className,
        )}
      >
        <FileText className="size-5" />
        <span className="text-[10px]">{asset.fileType}</span>
      </div>
    );
  }

  // Hardware (3D) and everything else: generative thumb + a 3D badge.
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
