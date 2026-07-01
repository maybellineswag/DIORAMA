"use client";

import * as React from "react";
import {
  X,
  Wand2,
  UploadCloud,
  Settings2,
  Check,
  SkipForward,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Board } from "@/lib/mock/moodboard";

type QueueItem = { id: string; src: string };
type Mode = "automatic" | "semi" | "manual";
type Phase = "drop" | "config" | "processing" | "review" | "done";

const hash = (s: string) => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
};

export function MoodSorter({
  boards,
  sampleImages,
  onClose,
  onFile,
  onEditRules,
}: {
  boards: Board[];
  sampleImages: string[];
  onClose: () => void;
  onFile: (items: { src: string; boardId: string }[]) => void;
  onEditRules: () => void;
}) {
  const [phase, setPhase] = React.useState<Phase>("drop");
  const [queue, setQueue] = React.useState<QueueItem[]>([]);
  const [mode, setMode] = React.useState<Mode>("automatic");
  const [batch, setBatch] = React.useState(50);
  const [progress, setProgress] = React.useState(0);
  const [suggest, setSuggest] = React.useState<Record<string, string>>({});
  const [decisions, setDecisions] = React.useState<Record<string, string>>({});
  const [reviewIds, setReviewIds] = React.useState<string[]>([]);
  const [cursor, setCursor] = React.useState(0);
  const fileInput = React.useRef<HTMLInputElement>(null);
  const [drag, setDrag] = React.useState(false);

  const boardName = (id: string) => boards.find((b) => b.id === id)?.name ?? "—";

  const addFiles = (files: FileList | null) => {
    if (!files) return;
    const imgs = Array.from(files).filter((f) => f.type.startsWith("image/"));
    imgs.forEach((f) => {
      const reader = new FileReader();
      reader.onload = () =>
        setQueue((q) => [...q, { id: `q-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, src: reader.result as string }]);
      reader.readAsDataURL(f);
    });
  };

  const loadSamples = () =>
    setQueue(sampleImages.map((src, i) => ({ id: `s-${i}`, src })));

  // Simulated AI classification.
  const run = () => {
    setPhase("processing");
    setProgress(0);
    const sug: Record<string, string> = {};
    queue.forEach((q) => {
      sug[q.id] = boards[hash(q.id) % boards.length]?.id ?? boards[0].id;
    });
    let p = 0;
    const t = setInterval(() => {
      p += 8 + Math.random() * 12;
      setProgress(Math.min(100, p));
      if (p >= 100) {
        clearInterval(t);
        setSuggest(sug);
        if (mode === "automatic") {
          setDecisions(sug);
          setPhase("done");
        } else {
          // manual reviews all; semi reviews only "uncertain" ones.
          const toReview =
            mode === "manual" ? queue.map((q) => q.id) : queue.filter((q) => hash(q.id) % 10 < 3).map((q) => q.id);
          const auto: Record<string, string> = {};
          queue.forEach((q) => {
            if (!toReview.includes(q.id)) auto[q.id] = sug[q.id];
          });
          setDecisions(auto);
          setReviewIds(toReview);
          setCursor(0);
          setPhase(toReview.length ? "review" : "done");
        }
      }
    }, 140);
  };

  const decide = (boardId: string | "skip") => {
    const id = reviewIds[cursor];
    setDecisions((d) => (boardId === "skip" ? d : { ...d, [id]: boardId }));
    if (cursor + 1 < reviewIds.length) setCursor((c) => c + 1);
    else setPhase("done");
  };

  const filed = Object.entries(decisions);
  const perBoard = filed.reduce<Record<string, number>>((o, [, bid]) => {
    o[bid] = (o[bid] ?? 0) + 1;
    return o;
  }, {});

  const finish = () => {
    onFile(
      filed
        .map(([id, boardId]) => {
          const item = queue.find((q) => q.id === id);
          return item ? { src: item.src, boardId } : null;
        })
        .filter(Boolean) as { src: string; boardId: string }[],
    );
    toast.success(`Filed ${filed.length} references into ${Object.keys(perBoard).length} boards`);
    onClose();
  };

  const reviewItem = queue.find((q) => q.id === reviewIds[cursor]);
  const batches = Math.max(1, Math.ceil(queue.length / batch));

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-paper">
      {/* header — matches app chrome */}
      <div className="flex h-14 shrink-0 items-center justify-between border-b px-5">
        <div className="flex items-center gap-2.5">
          <span className="flex size-7 items-center justify-center rounded-md bg-accent-soft text-accent-ink">
            <Wand2 className="size-4" />
          </span>
          <div>
            <p className="text-sm font-medium leading-tight">AI Sort</p>
            <p className="text-xs leading-tight text-ink-faint">File references into your boards</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onEditRules}><Settings2 className="size-4" /> Sort rules</Button>
          <Button variant="ghost" size="icon-sm" onClick={onClose} aria-label="Close"><X className="size-4" /></Button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl p-8">
          {phase === "drop" ? (
            <>
              <div
                onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
                onDragLeave={() => setDrag(false)}
                onDrop={(e) => { e.preventDefault(); setDrag(false); addFiles(e.dataTransfer.files); }}
                onClick={() => fileInput.current?.click()}
                className={cn(
                  "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed py-24 text-center transition-colors",
                  drag ? "border-accent/60 bg-accent-soft/20 text-accent-ink" : "text-ink-faint hover:border-ink-faint/40",
                )}
              >
                <UploadCloud className="size-9" />
                <p className="text-sm">Drop images here, or click to choose — up to a few hundred at a time.</p>
                <input ref={fileInput} type="file" accept="image/*" multiple hidden onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }} />
              </div>
              <div className="mt-4 flex items-center justify-between">
                <button onClick={loadSamples} className="text-sm text-accent-ink hover:underline cursor-pointer">
                  or load {sampleImages.length} sample references
                </button>
                {queue.length > 0 && (
                  <Button onClick={() => setPhase("config")}>{queue.length} ready — continue <ArrowRight className="size-4" /></Button>
                )}
              </div>
              {queue.length > 0 && (
                <div className="mt-5 grid grid-cols-8 gap-1.5">
                  {queue.slice(0, 24).map((q) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img key={q.id} src={q.src} alt="" className="aspect-square rounded object-cover" />
                  ))}
                </div>
              )}
            </>
          ) : phase === "config" ? (
            <div className="space-y-6">
              <div>
                <h2 className="display text-xl tracking-tight">{queue.length} references ready</h2>
                <p className="text-sm text-ink-faint">Choose how much control you want.</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                {([
                  { id: "automatic", t: "Automatic", d: "File everything by AI, no review." },
                  { id: "semi", t: "Semi-automatic", d: "Only review uncertain matches." },
                  { id: "manual", t: "Manual", d: "Approve every image yourself." },
                ] as const).map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setMode(m.id)}
                    className={cn("rounded-xl border p-4 text-left transition-colors cursor-pointer", mode === m.id ? "border-accent/50 bg-accent-soft/30" : "hover:bg-elevated/60")}
                  >
                    <p className="text-sm font-medium">{m.t}</p>
                    <p className="mt-0.5 text-xs text-ink-faint">{m.d}</p>
                  </button>
                ))}
              </div>
              <div>
                <p className="mb-1.5 text-sm font-medium">Batch size</p>
                <div className="flex gap-2">
                  {[25, 50, 100].map((n) => (
                    <button key={n} onClick={() => setBatch(n)} className={cn("rounded-lg border px-4 py-2 text-sm transition-colors cursor-pointer", batch === n ? "border-accent/50 bg-accent-soft text-accent-ink" : "hover:bg-elevated")}>
                      {n}
                    </button>
                  ))}
                  <span className="flex items-center text-xs text-ink-faint">{batches} batch{batches === 1 ? "" : "es"}</span>
                </div>
              </div>
              <div className="flex justify-between">
                <Button variant="ghost" onClick={() => setPhase("drop")}>Back</Button>
                <Button onClick={run}><Sparkles className="size-4" /> Start sorting</Button>
              </div>
            </div>
          ) : phase === "processing" ? (
            <div className="flex flex-col items-center gap-4 py-24 text-center">
              <Wand2 className="size-8 text-accent-ink" />
              <p className="text-sm">Classifying {queue.length} references into your boards…</p>
              <div className="h-2 w-64 overflow-hidden rounded-full bg-surface-2">
                <div className="h-full rounded-full bg-accent transition-all duration-150" style={{ width: `${progress}%` }} />
              </div>
              <p className="text-xs text-ink-faint">{Math.round(progress)}%</p>
            </div>
          ) : phase === "review" && reviewItem ? (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-ink-faint">Reviewing {cursor + 1} of {reviewIds.length}</p>
                <Badge variant="outline">{mode === "manual" ? "Manual" : "Semi-automatic"}</Badge>
              </div>
              <div className="mx-auto max-w-sm overflow-hidden rounded-xl border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={reviewItem.src} alt="" className="max-h-[42vh] w-full object-contain bg-surface-2" />
              </div>
              <div>
                <p className="mb-2 text-center text-xs text-ink-faint">
                  <Sparkles className="mr-1 inline size-3 text-accent-ink" />
                  Suggested: <span className="text-foreground">{boardName(suggest[reviewItem.id])}</span>
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {boards.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => decide(b.id)}
                      className={cn(
                        "rounded-full border px-3.5 py-1.5 text-sm transition-colors cursor-pointer",
                        suggest[reviewItem.id] === b.id ? "border-accent/60 bg-accent-soft text-accent-ink" : "hover:bg-elevated",
                      )}
                    >
                      {b.name}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex justify-center gap-2">
                <Button variant="ghost" onClick={() => decide("skip")}><SkipForward className="size-4" /> Skip</Button>
                <Button onClick={() => decide(suggest[reviewItem.id])}><Check className="size-4" /> Accept suggestion</Button>
              </div>
            </div>
          ) : (
            /* done */
            <div className="space-y-5">
              <div className="flex flex-col items-center gap-2 text-center">
                <span className="flex size-12 items-center justify-center rounded-full bg-good/15 text-good"><Check className="size-6" /></span>
                <h2 className="display text-xl tracking-tight">Sorted {filed.length} references</h2>
                <p className="text-sm text-ink-faint">Filed across {Object.keys(perBoard).length} boards.</p>
              </div>
              <div className="space-y-2">
                {Object.entries(perBoard).map(([bid, n]) => (
                  <div key={bid} className="flex items-center justify-between rounded-lg border bg-surface-2/40 px-3 py-2 text-sm">
                    <span>{boardName(bid)}</span>
                    <span className="text-ink-faint">{n} added</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-end">
                <Button onClick={finish}>Done</Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
