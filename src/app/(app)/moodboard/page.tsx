"use client";

import * as React from "react";
import {
  Sparkles,
  Plus,
  Upload,
  Wand2,
  ImagePlus,
  LayoutGrid,
  Folder as FolderIcon,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/app/page-header";
import { MoodSorter } from "@/components/app/mood-sorter";
import { ViewSwitcher } from "@/components/app/view-switcher";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { MOOD_CATEGORIES, MOOD_IMAGES } from "@/lib/mock/data";
import { cn } from "@/lib/utils";

function PinterestMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12c0 4.08 2.44 7.58 5.94 9.13-.08-.78-.16-1.97.03-2.82.18-.77 1.15-4.9 1.15-4.9s-.29-.59-.29-1.46c0-1.37.79-2.39 1.78-2.39.84 0 1.25.63 1.25 1.39 0 .85-.54 2.12-.82 3.3-.23.98.49 1.79 1.46 1.79 1.75 0 3.1-1.85 3.1-4.51 0-2.36-1.7-4.01-4.12-4.01-2.81 0-4.46 2.1-4.46 4.28 0 .85.33 1.76.74 2.25.08.1.09.18.07.29l-.27 1.1c-.04.18-.14.22-.33.13-1.23-.57-2-2.37-2-3.81 0-3.1 2.25-5.95 6.5-5.95 3.41 0 6.06 2.43 6.06 5.68 0 3.39-2.14 6.12-5.1 6.12-1 0-1.93-.52-2.25-1.13l-.61 2.34c-.22.85-.82 1.91-1.22 2.56.92.28 1.89.44 2.9.44 5.52 0 10-4.48 10-10S17.52 2 12 2z" />
    </svg>
  );
}
function ArenaMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="currentColor">
      <circle cx="5" cy="12" r="2.4" />
      <circle cx="12" cy="12" r="2.4" />
      <circle cx="19" cy="12" r="2.4" />
    </svg>
  );
}

/** Mac-Finder-style folder, tinted with the current accent. */
function FolderGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 82" className={className} fill="none" aria-hidden>
      <path
        d="M8 24c0-4 3-7 7-7h21c1.6 0 3.1.6 4.3 1.7l5 4.6c1.1 1 2.6 1.7 4.2 1.7H85c4 0 7 3 7 7v37c0 4-3 7-7 7H15c-4 0-7-3-7-7V24Z"
        fill="var(--accent-soft)"
        stroke="var(--accent)"
        strokeWidth="2.5"
      />
    </svg>
  );
}

export default function MoodboardPage() {
  const [categories, setCategories] = React.useState(MOOD_CATEGORIES);
  const [view, setView] = React.useState<"folders" | "grid">("folders");
  const [active, setActive] = React.useState("All");
  const [query, setQuery] = React.useState("");
  const [sorterOpen, setSorterOpen] = React.useState(false);
  const [addOpen, setAddOpen] = React.useState(false);
  const [newCat, setNewCat] = React.useState("");
  const [dragHover, setDragHover] = React.useState(false);

  const searching = query.trim().length > 0;

  const countFor = (cat: string) =>
    MOOD_IMAGES.filter((im) => im.category === cat).length;

  const images = MOOD_IMAGES.filter(
    (im) => active === "All" || im.category === active,
  ).filter((im) =>
    searching
      ? im.tags.some((t) => t.toLowerCase().includes(query.toLowerCase())) ||
        im.category.toLowerCase().includes(query.toLowerCase())
      : true,
  );

  const searchResults = searching
    ? MOOD_IMAGES.filter(
        (im) =>
          im.tags.some((t) => t.toLowerCase().includes(query.toLowerCase())) ||
          im.category.toLowerCase().includes(query.toLowerCase()),
      )
    : [];

  const openFolder = (cat: string) => {
    setActive(cat);
    setView("grid");
  };

  const addCategory = () => {
    if (!newCat.trim()) return;
    setCategories((c) => [...c, newCat.trim()]);
    setNewCat("");
    setAddOpen(false);
    toast.success(`Added category “${newCat.trim()}”`);
  };

  const grid = (imgs: typeof MOOD_IMAGES) => (
    <div className="columns-2 gap-4 sm:columns-3 lg:columns-4 [&>*]:mb-4">
      {imgs.map((im) => (
        <div
          key={im.id}
          className="group relative break-inside-avoid overflow-hidden rounded-xl border border-border transition-shadow duration-200 hover:shadow-lg"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={im.src}
            alt={im.tags.join(", ")}
            loading="lazy"
            draggable={false}
            className="block w-full select-none"
          />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-wrap gap-1 bg-black/55 p-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            {im.tags.map((t) => (
              <Badge key={t} variant="accent" className="bg-accent-soft/90">
                {t}
              </Badge>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6 lg:p-8">
      <PageHeader
        title="Moodboard"
        description="Collect, organize, and let AI sort your visual references."
        actions={
          <div className="flex items-center gap-2">
            {!searching && (
              <ViewSwitcher
                value={view}
                onChange={setView}
                options={[
                  { id: "folders", label: "Folders", icon: FolderIcon },
                  { id: "grid", label: "All", icon: LayoutGrid },
                ]}
              />
            )}
            <Button variant="secondary" size="sm" onClick={() => toast("Pinterest sync is a placeholder in this prototype.", { description: "Connect your boards from Settings → Integrations." })}>
              <PinterestMark /> Pinterest
            </Button>
            <Button variant="secondary" size="sm" onClick={() => toast("Are.na sync is a placeholder in this prototype.", { description: "Connect your channels from Settings → Integrations." })}>
              <ArenaMark /> Are.na
            </Button>
            <Button size="sm" onClick={() => setSorterOpen(true)}>
              <Wand2 className="size-4" /> AI Sort
            </Button>
          </div>
        }
      />

      {/* Semantic search */}
      <div className="relative">
        <Sparkles className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-accent" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Semantic search — try 'red pants', 'chain embroidery', 'washed denim'…"
          className="h-11 pl-10"
        />
      </div>

      {/* ── Search results override both views ── */}
      {searching ? (
        <>
          <p className="text-xs text-ink-faint">
            <Sparkles className="mr-1 inline size-3 text-accent" />
            {searchResults.length} matches ranked by visual similarity for “{query}”
          </p>
          {searchResults.length ? (
            grid(searchResults)
          ) : (
            <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed py-20 text-center text-ink-faint">
              <Sparkles className="size-6" />
              <p className="text-sm">No references match — try a different search.</p>
            </div>
          )}
        </>
      ) : view === "folders" ? (
        /* ── Folder view (primary) ── */
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {categories
            .filter((c) => c !== "All")
            .map((c) => (
              <button
                key={c}
                onClick={() => openFolder(c)}
                className="group flex flex-col items-center gap-2 rounded-xl p-5 transition-colors hover:bg-elevated/40 cursor-pointer"
              >
                <FolderGlyph className="w-28 transition-transform duration-200 group-hover:-translate-y-1" />
                <div className="flex items-baseline gap-1.5">
                  <span className="text-sm font-medium">{c}</span>
                  <span className="tabular text-xs text-ink-faint">{countFor(c)}</span>
                </div>
              </button>
            ))}
          <button
            onClick={() => setAddOpen(true)}
            className="group flex flex-col items-center gap-2 rounded-xl p-5 text-ink-faint transition-colors hover:bg-elevated/40 hover:text-foreground cursor-pointer"
          >
            <span className="flex h-[88px] w-28 items-center justify-center rounded-xl border-2 border-dashed">
              <Plus className="size-7" />
            </span>
            <span className="text-sm">Add category</span>
          </button>
        </div>
      ) : (
        /* ── Grid view (secondary) ── */
        <>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => setView("folders")}>
              <ArrowLeft className="size-4" /> Folders
            </Button>
            <div className="flex flex-wrap items-center gap-2">
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => setActive(c)}
                  className={cn(
                    "rounded-full border px-3 py-1 text-[13px] font-medium transition-colors cursor-pointer",
                    active === c
                      ? "border-accent/40 bg-accent-soft text-accent-ink"
                      : "border-border text-ink-soft hover:bg-elevated/60 hover:text-foreground",
                  )}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Upload dropzone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragHover(true);
            }}
            onDragLeave={() => setDragHover(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragHover(false);
              toast.success("References added", {
                description: "Drag-and-drop upload is simulated in this prototype.",
              });
            }}
            className={cn(
              "flex items-center justify-center gap-3 rounded-xl border border-dashed py-4 text-sm transition-colors",
              dragHover ? "border-accent/60 bg-accent-soft/30 text-accent-ink" : "text-ink-faint",
            )}
          >
            <ImagePlus className="size-4" />
            Drag images here to add to{" "}
            <span className="font-medium text-ink-soft">{active}</span>
            <span className="text-ink-faint/60">·</span>
            <button
              onClick={() =>
                toast.success("References added", {
                  description: "File picker is simulated in this prototype.",
                })
              }
              className="inline-flex items-center gap-1 text-accent-ink hover:underline cursor-pointer"
            >
              <Upload className="size-3.5" /> browse
            </button>
          </div>

          {images.length ? (
            grid(images)
          ) : (
            <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed py-20 text-center text-ink-faint">
              <Sparkles className="size-6" />
              <p className="text-sm">Nothing here yet — drag in some references.</p>
            </div>
          )}
        </>
      )}

      {/* Add-category dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>New category</DialogTitle>
            <DialogDescription>Create a custom moodboard category.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="cat">Name</Label>
            <Input
              id="cat"
              value={newCat}
              onChange={(e) => setNewCat(e.target.value)}
              placeholder="e.g. Lookbook Refs"
              onKeyDown={(e) => e.key === "Enter" && addCategory()}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setAddOpen(false)}>
              Cancel
            </Button>
            <Button onClick={addCategory}>Add category</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {sorterOpen && <MoodSorter onClose={() => setSorterOpen(false)} />}
    </div>
  );
}
