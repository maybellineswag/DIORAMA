"use client";

import { X } from "lucide-react";
import { useSorter } from "@/lib/useSorter";
import { Dropzone } from "@/components/Dropzone";
import { ReviewStage } from "@/components/ReviewStage";
import { AutoProgress } from "@/components/AutoProgress";
import {
  StartPanel,
  Checkpoint,
  DoneScreen,
  DailyLimitScreen,
} from "@/components/SessionScreens";

/**
 * The existing DIORAMA AI image sorter, embedded into the Moodboard module.
 * Logic and AI functionality are untouched — only the surrounding chrome is
 * Diorama's. The sorter's own screens already read the shared design tokens, so
 * they render in the app's dark visual system automatically.
 */
function SorterFlow() {
  const s = useSorter();

  switch (s.phase) {
    case "empty":
    case "ingesting":
      return <Dropzone onFiles={s.ingest} busy={s.ingesting} />;
    case "ready":
      return <StartPanel s={s} />;
    case "checkpoint":
      return <Checkpoint s={s} />;
    case "done":
      return <DoneScreen s={s} />;
    case "reviewing":
    default:
      if (s.dailyLimit) return <DailyLimitScreen s={s} />;
      if (s.settings.sortMode === "manual" || s.awaitingUser) {
        return <ReviewStage s={s} />;
      }
      return <AutoProgress s={s} />;
  }
}

export function MoodSorter({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-paper">
      <div className="flex h-14 shrink-0 items-center justify-between border-b px-5">
        <div className="flex items-center gap-2.5">
          <span className="flex size-7 items-center justify-center rounded-md bg-clay-soft text-clay-ink">
            <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="m12 3 1.9 5.8H20l-4.9 3.6 1.9 5.8L12 14.6 7 18.2l1.9-5.8L4 8.8h6.1z" />
            </svg>
          </span>
          <div>
            <p className="text-sm font-medium leading-tight">AI Moodboard Sort</p>
            <p className="text-xs text-ink-faint leading-tight">
              Auto-file references into your categories
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="btn btn-ghost"
          aria-label="Close sorter"
        >
          <X className="size-4" /> Close
        </button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <SorterFlow />
      </div>
    </div>
  );
}
