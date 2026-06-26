"use client";

import * as React from "react";
import {
  Upload,
  Sparkles,
  Box,
  FileText,
  Download,
  Folder,
  BookOpen,
  Boxes,
} from "lucide-react";

import { PageHeader } from "@/components/app/page-header";
import { ViewSwitcher } from "@/components/app/view-switcher";
import { Thumb } from "@/components/thumb";
import { ThreeViewer } from "@/components/three-viewer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { ASSETS, GUIDES, COLLECTIONS, SEASONS, PRODUCT_TYPES } from "@/lib/mock/data";
import type { Asset, AssetCategory, Guide } from "@/lib/mock/types";
import { cn } from "@/lib/utils";

const CATEGORIES: ("All" | AssetCategory)[] = [
  "All",
  "Graphics",
  "Hardware",
  "Notions",
  "Pieces",
  "Templates",
];

function AssetPreview({ asset }: { asset: Asset }) {
  const is3D = asset.category === "Hardware";
  return (
    <>
      <SheetHeader>
        <SheetTitle className="text-base">{asset.name}</SheetTitle>
        <SheetDescription>
          {asset.category} · {asset.fileType}
        </SheetDescription>
      </SheetHeader>
      <div className="min-h-0 flex-1 overflow-y-auto p-5">
        <div className="relative aspect-square overflow-hidden rounded-xl border bg-surface-2">
          {is3D ? (
            <>
              <ThreeViewer seed={asset.seed} className="size-full" />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-center gap-2 bg-paper/70 py-2 text-xs text-ink-soft backdrop-blur">
                <Box className="size-3.5" /> Live 3D · drag to rotate
              </div>
            </>
          ) : (
            <Thumb seed={asset.seed} />
          )}
        </div>

        <div className="mt-4 flex flex-wrap gap-1.5">
          <Badge variant="accent">{asset.category}</Badge>
          <Badge variant="outline">{asset.fileType}</Badge>
          <Badge variant="outline">{asset.season}</Badge>
          <Badge variant="outline">{asset.productType}</Badge>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-4 text-sm">
          <div>
            <p className="text-xs text-ink-faint">Collection</p>
            <p>{asset.collection}</p>
          </div>
          <div>
            <p className="text-xs text-ink-faint">Size</p>
            <p>{asset.size}</p>
          </div>
          <div>
            <p className="text-xs text-ink-faint">Updated</p>
            <p>{asset.updated}</p>
          </div>
          <div>
            <p className="text-xs text-ink-faint">File type</p>
            <p>{asset.fileType}</p>
          </div>
        </div>

        {asset.subAssets && (
          <>
            <Separator className="my-5" />
            <p className="mb-3 text-xs font-medium uppercase tracking-wider text-ink-faint">
              Linked sub-assets
            </p>
            <div className="space-y-2">
              {asset.subAssets.map((s) => (
                <div
                  key={s.label}
                  className="flex items-center gap-3 rounded-lg border bg-surface-2/40 p-2.5"
                >
                  <span className="flex size-8 items-center justify-center rounded-md bg-surface-hi">
                    <FileText className="size-4 text-ink-soft" />
                  </span>
                  <span className="flex-1 text-sm">{s.label}</span>
                  <Badge variant="outline">{s.fileType}</Badge>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
      <div className="border-t p-4">
        <Button className="w-full">
          <Download className="size-4" /> Download
        </Button>
      </div>
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
              active.id === g.id
                ? "border-accent/40 bg-accent-soft/30"
                : "border-transparent hover:bg-elevated/60",
            )}
          >
            <div className="flex items-center gap-2">
              <BookOpen className="size-3.5 text-ink-faint" />
              <span className="text-sm font-medium">{g.title}</span>
            </div>
            <span className="line-clamp-1 pl-5 text-xs text-ink-faint">{g.excerpt}</span>
          </button>
        ))}
      </div>

      <article className="rounded-xl border bg-card p-7">
        <div className="flex items-center gap-2">
          <Badge variant="outline">{active.category}</Badge>
          <span className="text-xs text-ink-faint">Updated {active.updated}</span>
        </div>
        <h2 className="display mt-3 text-2xl tracking-tight">{active.title}</h2>
        <p className="mt-1 text-sm text-ink-soft">{active.excerpt}</p>
        <Separator className="my-5" />
        <div className="space-y-4">
          {active.body.map((p, i) => (
            <p key={i} className="text-sm leading-relaxed text-ink-soft">
              {p}
            </p>
          ))}
        </div>
      </article>
    </div>
  );
}

export default function AssetsPage() {
  const [view, setView] = React.useState<"files" | "guides">("files");
  const [category, setCategory] = React.useState<"All" | AssetCategory>("All");
  const [query, setQuery] = React.useState("");
  const [collection, setCollection] = React.useState("all");
  const [season, setSeason] = React.useState("all");
  const [ptype, setPtype] = React.useState("all");
  const [selected, setSelected] = React.useState<Asset | null>(null);
  const [open, setOpen] = React.useState(false);

  const filtered = ASSETS.filter((a) => category === "All" || a.category === category)
    .filter((a) => collection === "all" || a.collection === collection)
    .filter((a) => season === "all" || a.season === season)
    .filter((a) => ptype === "all" || a.productType === ptype)
    .filter((a) =>
      query.trim()
        ? (a.name + a.fileType + a.productType + a.category)
            .toLowerCase()
            .includes(query.toLowerCase())
        : true,
    );

  const openAsset = (a: Asset) => {
    setSelected(a);
    setOpen(true);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6 lg:p-8">
      <PageHeader
        title="Asset Library"
        description="A tag-based library — every file is searchable and filterable, no folder digging."
        actions={
          <div className="flex items-center gap-2">
            <ViewSwitcher
              value={view}
              onChange={setView}
              options={[
                { id: "files", label: "Files", icon: Boxes },
                { id: "guides", label: "Guides", icon: BookOpen },
              ]}
            />
            <Button size="sm">
              <Upload className="size-4" /> Upload
            </Button>
          </div>
        }
      />

      {view === "guides" ? (
        <GuidesView />
      ) : (
        <>
          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-[220px] flex-1">
              <Sparkles className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-accent-ink" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="AI search — try 'leaf motif', 'zipper', 'care label'…"
                className="pl-9"
              />
            </div>
            <Select value={collection} onValueChange={setCollection}>
              <SelectTrigger size="sm" className="w-auto min-w-[140px]">
                <SelectValue placeholder="Collection" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All collections</SelectItem>
                {COLLECTIONS.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={ptype} onValueChange={setPtype}>
              <SelectTrigger size="sm" className="w-auto min-w-[130px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                {PRODUCT_TYPES.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
                <SelectItem value="Brand">Brand</SelectItem>
              </SelectContent>
            </Select>
            <Select value={season} onValueChange={setSeason}>
              <SelectTrigger size="sm" className="w-auto min-w-[110px]">
                <SelectValue placeholder="Season" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All seasons</SelectItem>
                {SEASONS.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Category tags (filter, not folders) */}
          <div className="flex flex-wrap items-center gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={cn(
                  "rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-colors cursor-pointer",
                  category === c
                    ? "border-accent/40 bg-accent-soft text-accent-ink"
                    : "border-border text-ink-soft hover:bg-elevated/60 hover:text-foreground",
                )}
              >
                {c}
              </button>
            ))}
          </div>

          {query.trim() && (
            <p className="text-xs text-ink-faint">
              <Sparkles className="mr-1 inline size-3 text-accent-ink" />
              {filtered.length} AI-ranked results for “{query}”
            </p>
          )}

          {/* Masonry of files */}
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed py-20 text-center">
              <Folder className="size-7 text-ink-faint" />
              <p className="text-sm text-ink-soft">No files match these filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {filtered.map((a) => (
                <button
                  key={a.id}
                  onClick={() => openAsset(a)}
                  className="group flex flex-col overflow-hidden rounded-xl border bg-card text-left transition-all hover:border-ink-faint/40 hover:shadow-md cursor-pointer"
                >
                  <div className="relative aspect-square overflow-hidden">
                    <Thumb seed={a.seed} />
                    {a.category === "Hardware" && (
                      <span className="absolute right-2 top-2 flex items-center gap-1 rounded-md bg-paper/80 px-1.5 py-0.5 text-[10px] text-ink-soft backdrop-blur">
                        <Box className="size-3" /> 3D
                      </span>
                    )}
                    {a.category === "Pieces" && (
                      <span className="absolute right-2 top-2 flex items-center gap-1 rounded-md bg-paper/80 px-1.5 py-0.5 text-[10px] text-ink-soft backdrop-blur">
                        <Folder className="size-3" /> {a.subAssets?.length}
                      </span>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="truncate text-sm font-medium">{a.name}</p>
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      <Badge variant="outline">{a.category}</Badge>
                      <Badge variant="outline">{a.fileType}</Badge>
                      {a.season !== "Core" && <Badge variant="outline">{a.season}</Badge>}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </>
      )}

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="flex w-full flex-col p-0 sm:max-w-md">
          {selected && <AssetPreview asset={selected} />}
        </SheetContent>
      </Sheet>
    </div>
  );
}
