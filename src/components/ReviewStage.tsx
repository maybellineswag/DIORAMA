"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef, useState } from "react";
import type { SorterApi } from "@/lib/useSorter";
import { FolderSearch } from "@/components/FolderSearch";
import {
  Check,
  Clock,
  Download,
  Plus,
  RotateCcw,
  Trash2,
  Undo2,
  X,
} from "lucide-react";
import { Wordmark } from "@/components/Wordmark";

const QUICK = ["AMRIEL GALLERY", "SHAME"];

function formatClock(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function confidenceBand(c: number) {
  if (c >= 0.85) return { label: "High", color: "var(--color-good)", soft: "var(--color-good-soft)" };
  if (c < 0.5) return { label: "Low", color: "var(--color-danger)", soft: "var(--color-danger-soft)" };
  return { label: "Medium", color: "var(--accent)", soft: "var(--accent-soft)" };
}

export function ReviewStage({ s }: { s: SorterApi }) {
  const [showSearch, setShowSearch] = useState(false);
  const addRef = useRef<HTMLDivElement>(null);
  const { current, stats } = s;

  // Close the add-folder dropdown on any click outside of it.
  useEffect(() => {
    if (!showSearch) return;
    const onDown = (e: MouseEvent) => {
      if (addRef.current && !addRef.current.contains(e.target as Node)) {
        setShowSearch(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [showSearch]);

  // Tick once a second while a rate-limit cooldown is counting down.
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!s.rateLimitedUntil || s.rateLimitedUntil <= Date.now()) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [s.rateLimitedUntil]);
  const cooldownSecs = Math.max(0, Math.ceil((s.rateLimitedUntil - now) / 1000));
  const cooling = cooldownSecs > 0;

  // Keyboard shortcuts (ignored while typing in an input).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      const typing =
        el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA");

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        s.undo();
        return;
      }
      if (typing || e.metaKey || e.ctrlKey || e.altKey) return;

      switch (e.key.toLowerCase()) {
        case "enter":
          e.preventDefault();
          s.confirm();
          break;
        case "t":
          s.trash();
          break;
        case "m":
          s.misc();
          break;
        case "l":
          s.saveForLater();
          break;
        case "z":
          s.undo();
          break;
        case "a":
          e.preventDefault();
          setShowSearch(true);
          break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [s]);

  if (!current) return null;

  const proposal = current.proposal;
  const band = proposal ? confidenceBand(proposal.confidence) : null;
  const classifying = current.status === "classifying" || current.status === "pending";
  const isVideo = current.mimeType.startsWith("video/");

  return (
    <div className="flex min-h-dvh flex-col">
      {/* Top bar */}
      <header className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-[color:var(--color-line)] bg-[color:var(--color-paper)]/85 px-5 py-3 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <Wordmark className="h-4 w-auto text-[color:var(--color-ink)]" />
          <span className="hidden text-xs text-[color:var(--color-ink-faint)] sm:inline">
            Image Sorter
          </span>
        </div>

        <div className="flex flex-1 items-center justify-center gap-3">
          <div className="h-1.5 w-40 overflow-hidden rounded-full bg-[color:var(--color-line)]">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${Math.round(stats.progress * 100)}%`,
                background: "var(--accent)",
              }}
            />
          </div>
          <span className="tabular-nums text-xs text-[color:var(--color-ink-soft)]">
            {stats.resolved}/{stats.total}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            className="btn btn-ghost"
            onClick={s.undo}
            disabled={!s.canUndo}
            title="Undo (Z)"
          >
            <Undo2 size={16} strokeWidth={1.75} />{" "}
            <span className="hidden sm:inline">Undo</span>
          </button>
          <button
            className="btn btn-outline"
            onClick={s.download}
            disabled={s.zipping || stats.resolved === 0}
            title="Download sorted ZIP"
          >
            <Download size={16} strokeWidth={1.75} />
            <span className="hidden sm:inline">
              {s.zipping ? "Zipping…" : "Download"}
            </span>
          </button>
        </div>
      </header>

      {/* Body */}
      <div className="mx-auto grid w-full max-w-6xl flex-1 grid-cols-1 gap-8 px-5 py-7 lg:grid-cols-[1fr_300px]">
        {/* Stage */}
        <section className="flex min-w-0 flex-col">
          <div
            key={current.id}
            className="animate-fade-in relative flex flex-1 items-center justify-center overflow-hidden rounded-[var(--radius-lg)] border border-[color:var(--color-line)] p-3"
            style={{
              background: "var(--color-surface-hi)",
              boxShadow: "var(--shadow-md)",
              minHeight: "44vh",
            }}
          >
            {isVideo ? (
              <video
                src={current.previewUrl}
                controls
                className="max-h-[58vh] max-w-full rounded-[var(--radius-md)]"
              />
            ) : (
              <img
                src={current.previewUrl}
                alt={current.fileName}
                className="max-h-[58vh] max-w-full rounded-[var(--radius-md)] object-contain"
              />
            )}
            {classifying && (
              <div className="absolute inset-0 flex items-center justify-center bg-[color:var(--color-surface-hi)]/75 backdrop-blur-[2px]">
                {cooling ? (
                  <div className="flex flex-col items-center gap-1.5 text-center">
                    <span className="text-sm font-medium text-[color:var(--color-ink)]">
                      Free-tier rate limit reached
                    </span>
                    <span className="text-xs text-[color:var(--color-ink-soft)]">
                      Resuming automatically in {formatClock(cooldownSecs)}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-sm text-[color:var(--color-ink-soft)]">
                    <span className="h-2 w-2 animate-ping rounded-full bg-[color:var(--accent)]" />
                    Reading image…
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="mt-3 flex items-center justify-between gap-3">
            <p className="truncate font-mono text-xs text-[color:var(--color-ink-faint)]">
              {current.fileName}
            </p>
            {band && !classifying && (
              <span
                className="rounded-full px-2.5 py-1 text-[11px] font-medium"
                style={{ background: band.soft, color: band.color }}
              >
                {band.label} confidence · {Math.round(proposal!.confidence * 100)}%
              </span>
            )}
          </div>

          {current.error && !classifying && (
            <div className="mt-2 flex items-center justify-between gap-3 rounded-[var(--radius-sm)] bg-[color:var(--color-danger-soft)] px-3 py-2 text-xs text-[color:var(--color-danger)]">
              <span>{current.error}</span>
              <button
                onClick={s.retry}
                className="inline-flex shrink-0 items-center gap-1 rounded-[var(--radius-sm)] bg-[color:var(--color-danger)] px-2 py-1 font-medium text-white"
              >
                <RotateCcw size={12} strokeWidth={2} /> Retry
              </button>
            </div>
          )}
        </section>

        {/* Decision panel */}
        <aside className="flex flex-col gap-5">
          {/* Chips */}
          <div className="card p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-[color:var(--color-ink-soft)]">
                Folders
              </h2>
              <span className="text-xs text-[color:var(--color-ink-faint)]">
                {current.folders.length} selected
              </span>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {current.folders.map((f) => (
                <button
                  key={f}
                  onClick={() => s.removeFolder(f)}
                  className="animate-pop group inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] py-1.5 pl-3 pr-2 text-[13px] font-medium transition-colors"
                  style={{
                    background: "var(--accent-soft)",
                    color: "var(--accent-ink)",
                  }}
                  title="Click to remove"
                >
                  {f}
                  <X
                    size={13}
                    strokeWidth={2}
                    className="opacity-50 transition-opacity group-hover:opacity-100"
                  />
                </button>
              ))}

              <div className="relative" ref={addRef}>
                <button
                  onClick={() => setShowSearch((v) => !v)}
                  className="inline-flex items-center gap-1 rounded-[var(--radius-pill)] border border-dashed border-[color:var(--color-line)] px-3 py-1.5 text-[13px] text-[color:var(--color-ink-soft)] transition-colors hover:border-[color:var(--color-ink-faint)] hover:text-[color:var(--color-ink)]"
                >
                  <Plus size={13} strokeWidth={2} /> Add
                </button>
                {showSearch && (
                  <FolderSearch
                    existing={current.folders}
                    onSelect={(name) => s.addFolder(name)}
                    onClose={() => setShowSearch(false)}
                  />
                )}
              </div>
            </div>

            {/* Quick toggles */}
            <div className="mt-4 flex flex-wrap gap-2">
              {QUICK.map((q) => {
                const on = current.folders.includes(q);
                return (
                  <button
                    key={q}
                    onClick={() => s.toggleFolder(q)}
                    className="rounded-[var(--radius-sm)] px-2.5 py-1 text-[11px] font-medium transition-all"
                    style={{
                      background: on ? "var(--color-ink)" : "var(--color-line-soft)",
                      color: on ? "var(--color-paper)" : "var(--color-ink-soft)",
                    }}
                  >
                    {on ? "✓ " : "+ "}
                    {q === "AMRIEL GALLERY" ? "AMRIEL" : q}
                  </button>
                );
              })}
            </div>

            {proposal?.reasoning && !classifying && (
              <p className="mt-4 border-t border-[color:var(--color-line-soft)] pt-3 text-xs italic leading-5 text-[color:var(--color-ink-soft)]">
                “{proposal.reasoning}”
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-2">
            <button
              className="btn btn-accent col-span-2 py-2.5"
              onClick={s.confirm}
              disabled={classifying || current.folders.length === 0}
            >
              <Check size={16} strokeWidth={2} /> Confirm
              <span className="kbd ml-1 border-white/30 bg-white/15 text-white/90">
                ↵
              </span>
            </button>
            <button className="btn btn-outline" onClick={s.trash} disabled={classifying}>
              <Trash2 size={15} strokeWidth={1.75} /> Trash
              <span className="kbd">T</span>
            </button>
            <button className="btn btn-outline" onClick={s.misc} disabled={classifying}>
              MISC <span className="kbd">M</span>
            </button>
            <button
              className="btn btn-ghost col-span-2 text-xs"
              onClick={s.saveForLater}
              disabled={classifying}
            >
              <Clock size={14} strokeWidth={1.75} /> Save for later
              <span className="kbd">L</span>
            </button>
          </div>

          {/* Recent strip */}
          {s.recentSorted.length > 0 && (
            <div>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-[color:var(--color-ink-faint)]">
                Recent
              </h3>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {s.recentSorted.map((it) => (
                  <div key={it.id} className="shrink-0" title={it.folders.join(", ") || "Trashed"}>
                    <img
                      src={it.previewUrl}
                      alt=""
                      className="h-12 w-12 rounded-[var(--radius-sm)] border border-[color:var(--color-line)] object-cover"
                      style={{ opacity: it.status === "trashed" ? 0.4 : 1 }}
                    />
                    <p className="mt-1 w-12 truncate text-[9px] text-[color:var(--color-ink-faint)]">
                      {it.status === "trashed" ? "trash" : it.folders[0]}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>

      {/* Footer keyboard hints */}
      <footer className="border-t border-[color:var(--color-line)] px-5 py-2.5">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-[color:var(--color-ink-faint)]">
          <Hint k="↵" label="Confirm" />
          <Hint k="T" label="Trash" />
          <Hint k="M" label="Misc" />
          <Hint k="A" label="Add folder" />
          <Hint k="L" label="Later" />
          <Hint k="Z" label="Undo" />
          <span className="ml-auto tabular-nums">
            {stats.remaining} remaining · {stats.duplicate} duplicates skipped
          </span>
        </div>
      </footer>
    </div>
  );
}

function Hint({ k, label }: { k: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="kbd">{k}</span>
      {label}
    </span>
  );
}
