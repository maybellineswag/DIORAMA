"use client";

import type { SorterApi } from "@/lib/useSorter";
import type { SortMode } from "@/lib/storage";
import { Wordmark } from "@/components/Wordmark";
import { Check, Download, Clock4 } from "lucide-react";

const MODES: { id: SortMode; label: string; blurb: string }[] = [
  { id: "manual", label: "Manual", blurb: "Review every image yourself." },
  { id: "assist", label: "Assisted", blurb: "Auto-files the confident ones; asks you on the unsure ones." },
  { id: "auto", label: "Automatic", blurb: "Files everything with no review. Fastest." },
];

/** Three-way segmented control for the sort mode, shown on the start screen. */
function ModeSelector({ s }: { s: SorterApi }) {
  const active = s.settings.sortMode;
  const current = MODES.find((m) => m.id === active)!;
  return (
    <div className="mt-8 w-full max-w-md">
      <div className="flex gap-1 rounded-[var(--radius-md)] border border-[color:var(--color-line)] bg-[color:var(--color-surface)] p-1">
        {MODES.map((m) => {
          const on = m.id === active;
          return (
            <button
              key={m.id}
              onClick={() => s.updateSettings({ sortMode: m.id })}
              className="flex-1 rounded-[var(--radius-sm)] px-3 py-1.5 text-sm font-medium transition-all"
              style={{
                background: on ? "var(--color-ink)" : "transparent",
                color: on ? "var(--color-paper)" : "var(--color-ink-soft)",
              }}
            >
              {m.label}
            </button>
          );
        })}
      </div>
      <p className="mt-2 text-xs text-[color:var(--color-ink-faint)]">
        {current.blurb}
      </p>
    </div>
  );
}

/** Batch-size buttons shared by the start + checkpoint screens. */
function BatchButtons({
  remaining,
  onPick,
}: {
  remaining: number;
  onPick: (limit: number | null) => void;
}) {
  const sizes = [30, 50, 100].filter((n) => n < remaining);
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      {sizes.map((n) => (
        <button key={n} className="btn btn-outline" onClick={() => onPick(n)}>
          Sort {n}
        </button>
      ))}
      <button className="btn btn-accent" onClick={() => onPick(null)}>
        Sort all {remaining}
      </button>
    </div>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex min-h-dvh max-w-2xl flex-col items-center justify-center px-6 text-center animate-fade-up">
      {children}
    </div>
  );
}

/** Top folder distribution as quiet bars. */
function Distribution({ stats }: { stats: SorterApi["stats"] }) {
  if (stats.distribution.length === 0) return null;
  const max = stats.distribution[0][1];
  return (
    <div className="mt-8 w-full max-w-sm space-y-1.5 text-left">
      {stats.distribution.slice(0, 6).map(([name, count]) => (
        <div key={name} className="flex items-center gap-3">
          <span className="w-32 shrink-0 truncate text-xs text-[color:var(--color-ink-soft)]">
            {name}
          </span>
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[color:var(--color-line)]">
            <div
              className="h-full rounded-full"
              style={{
                width: `${(count / max) * 100}%`,
                background: "var(--accent)",
              }}
            />
          </div>
          <span className="w-6 text-right tabular-nums text-xs text-[color:var(--color-ink-faint)]">
            {count}
          </span>
        </div>
      ))}
    </div>
  );
}

export function StartPanel({ s }: { s: SorterApi }) {
  const { stats } = s;
  return (
    <Shell>
      <Wordmark className="h-5 w-auto text-[color:var(--color-ink)] opacity-90" />
      <p className="display mt-6 text-3xl">{stats.remaining} images ready</p>
      <p className="mt-2 text-sm text-[color:var(--color-ink-soft)]">
        {stats.duplicate > 0
          ? `${stats.duplicate} duplicate${stats.duplicate > 1 ? "s" : ""} auto-flagged and set aside.`
          : "No duplicates detected."}{" "}
        Choose how hands-on you want to be, then start.
      </p>

      <ModeSelector s={s} />

      <div className="mt-8">
        <BatchButtons remaining={stats.remaining} onPick={s.startSession} />
      </div>

      <button
        className="btn btn-ghost mt-6 text-xs"
        onClick={s.reset}
        title="Clear everything and start over"
      >
        Start over
      </button>
    </Shell>
  );
}

export function Checkpoint({ s }: { s: SorterApi }) {
  const { stats, sessionCount } = s;
  return (
    <Shell>
      <div
        className="flex h-12 w-12 items-center justify-center rounded-full"
        style={{ background: "var(--color-good-soft)", color: "var(--color-good)" }}
      >
        <Check size={22} strokeWidth={2} />
      </div>
      <p className="display mt-5 text-2xl">
        {sessionCount} sorted this round
      </p>
      <p className="mt-2 text-sm text-[color:var(--color-ink-soft)]">
        {stats.remaining} left to go. Keep the momentum or take a break and
        download what you have.
      </p>

      <Distribution stats={stats} />

      <div className="mt-8 flex flex-col items-center gap-3">
        <BatchButtons remaining={stats.remaining} onPick={s.startSession} />
        <button
          className="btn btn-outline"
          onClick={s.download}
          disabled={s.zipping}
        >
          <Download size={16} strokeWidth={1.75} />{" "}
          {s.zipping ? "Zipping…" : "Download progress"}
        </button>
      </div>
    </Shell>
  );
}

export function DailyLimitScreen({ s }: { s: SorterApi }) {
  const { stats } = s;
  return (
    <Shell>
      <div
        className="flex h-12 w-12 items-center justify-center rounded-full"
        style={{ background: "var(--accent-soft)", color: "var(--accent)" }}
      >
        <Clock4 size={22} strokeWidth={1.75} />
      </div>
      <p className="display mt-5 text-2xl">Daily free limit reached</p>
      <p className="mt-2 max-w-md text-sm leading-6 text-[color:var(--color-ink-soft)]">
        Google&apos;s free tier allows only about <strong>20 images per day</strong>{" "}
        per model — you&apos;ve used today&apos;s. It resets tomorrow. To keep
        going now (and go much faster), add billing credits — a few hundred
        images costs only pennies.
      </p>
      <p className="mt-3 text-xs text-[color:var(--color-ink-faint)]">
        {stats.resolved} sorted so far · {stats.remaining} still waiting
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
        <button
          className="btn btn-accent"
          onClick={s.download}
          disabled={s.zipping || stats.resolved === 0}
        >
          <Download size={16} strokeWidth={1.75} />
          {s.zipping ? "Zipping…" : "Download what's sorted"}
        </button>
        <button className="btn btn-outline" onClick={s.clearDailyLimit}>
          I added billing — try again
        </button>
      </div>
      <button className="btn btn-ghost mt-6 text-xs" onClick={s.reset}>
        Start over
      </button>
    </Shell>
  );
}

export function DoneScreen({ s }: { s: SorterApi }) {
  const { stats } = s;
  return (
    <Shell>
      <Wordmark className="h-5 w-auto text-[color:var(--color-ink)] opacity-90" />
      <p className="display mt-6 text-3xl">All sorted.</p>
      <p className="mt-2 text-sm text-[color:var(--color-ink-soft)]">
        {stats.sorted} sorted · {stats.trashed} trashed · {stats.duplicate}{" "}
        duplicates. Download the foldered ZIP — originals, full quality.
      </p>

      <Distribution stats={stats} />

      <div className="mt-8 flex items-center gap-2">
        <button
          className="btn btn-accent px-6 py-2.5"
          onClick={s.download}
          disabled={s.zipping}
        >
          <Download size={16} strokeWidth={1.75} />{" "}
          {s.zipping ? "Preparing ZIP…" : "Download sorted ZIP"}
        </button>
      </div>
      <button className="btn btn-ghost mt-6 text-xs" onClick={s.reset}>
        Start a new batch
      </button>
    </Shell>
  );
}
