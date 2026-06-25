"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from "react";
import type { SorterApi } from "@/lib/useSorter";
import { Wordmark } from "@/components/Wordmark";
import { Download, Pause, SlidersHorizontal } from "lucide-react";

function formatClock(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/**
 * Shown while the app is auto-sorting (auto mode, or assist mode between the
 * images it stops you on). The user can watch progress, pause, switch to
 * manual review, or download what's been sorted so far.
 */
export function AutoProgress({ s }: { s: SorterApi }) {
  const { stats, current } = s;

  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const cooldownSecs = Math.max(0, Math.ceil((s.rateLimitedUntil - now) / 1000));
  const cooling = cooldownSecs > 0;

  const mode = s.settings.sortMode;

  return (
    <div className="mx-auto flex min-h-dvh max-w-xl flex-col items-center justify-center px-6 text-center">
      <Wordmark className="h-4 w-auto text-[color:var(--color-ink)] opacity-80" />

      {/* Current thumbnail */}
      <div
        className="animate-fade-in mt-8 flex h-44 w-44 items-center justify-center overflow-hidden rounded-[var(--radius-lg)] border border-[color:var(--color-line)]"
        style={{ background: "var(--color-surface-hi)", boxShadow: "var(--shadow-md)" }}
      >
        {current ? (
          <img
            src={current.previewUrl}
            alt=""
            className="h-full w-full object-cover"
            style={{ opacity: cooling ? 0.5 : 1 }}
          />
        ) : (
          <span className="text-xs text-[color:var(--color-ink-faint)]">…</span>
        )}
      </div>

      <p className="display mt-7 text-2xl">
        {mode === "auto" ? "Auto-sorting" : "Sorting"} your images
      </p>
      <p className="mt-1.5 text-sm text-[color:var(--color-ink-soft)]">
        {cooling ? (
          <>Free-tier limit hit — resuming in {formatClock(cooldownSecs)}</>
        ) : (
          <>
            {mode === "assist"
              ? "It'll pause and ask you only on the unsure ones."
              : "Sit back — it files everything automatically."}
          </>
        )}
      </p>

      {/* Progress bar */}
      <div className="mt-6 w-full max-w-sm">
        <div className="h-2 overflow-hidden rounded-full bg-[color:var(--color-line)]">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${Math.round(stats.progress * 100)}%`,
              background: "var(--clay)",
            }}
          />
        </div>
        <div className="mt-2 flex justify-between text-xs text-[color:var(--color-ink-soft)]">
          <span className="tabular-nums">
            {stats.resolved} of {stats.total} done
          </span>
          <span className="tabular-nums">{stats.remaining} left</span>
        </div>
      </div>

      {/* Controls */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
        <button className="btn btn-outline" onClick={s.pause}>
          <Pause size={15} strokeWidth={1.75} /> Pause
        </button>
        <button
          className="btn btn-outline"
          onClick={() => s.updateSettings({ sortMode: "manual" })}
        >
          <SlidersHorizontal size={15} strokeWidth={1.75} /> Review manually
        </button>
        <button
          className="btn btn-ghost"
          onClick={s.download}
          disabled={s.zipping || stats.resolved === 0}
        >
          <Download size={15} strokeWidth={1.75} />
          {s.zipping ? "Zipping…" : "Download"}
        </button>
      </div>
    </div>
  );
}
