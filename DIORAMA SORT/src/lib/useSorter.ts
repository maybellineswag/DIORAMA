"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  ClassifyResponse,
  ItemStatus,
  SortItem,
} from "@/lib/types";
import {
  computePHash,
  resizeForModel,
  hammingDistance,
  DUPLICATE_THRESHOLD,
} from "@/lib/image";
import {
  addCorrection,
  CORRECTIONS_IN_PROMPT,
  loadCorrections,
  loadSettings,
  saveSettings,
  type Settings,
} from "@/lib/storage";
import type { Correction } from "@/lib/taxonomy";
import { buildSortedZip, downloadBlob } from "@/lib/zip";

const REVIEWABLE: ItemStatus[] = ["pending", "classifying", "review"];
const isReviewable = (s: ItemStatus) => REVIEWABLE.includes(s);

/**
 * Max concurrent classification requests. 1 keeps us under the free-tier cap.
 * On the paid tier, set NEXT_PUBLIC_SORT_CONCURRENCY (e.g. 5) to classify in
 * parallel — combined with GEMINI_MIN_INTERVAL_MS=0 on the server, that's
 * "full speed": hundreds of images in a few minutes.
 */
const MAX_CONCURRENT = Math.max(
  1,
  Number(process.env.NEXT_PUBLIC_SORT_CONCURRENCY ?? 1),
);

type Phase =
  | "empty"
  | "ingesting"
  | "ready"
  | "reviewing"
  | "checkpoint"
  | "done";

interface UndoEntry {
  id: string;
  prevStatus: ItemStatus;
  prevFolders: string[];
}

export function useSorter() {
  const [items, setItems] = useState<SortItem[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [settings, setSettings] = useState<Settings>(loadSettings);
  const [ingesting, setIngesting] = useState(false);
  const [started, setStarted] = useState(false);
  const [paused, setPaused] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);
  const [sessionLimit, setSessionLimit] = useState<number | null>(null);
  const [zipping, setZipping] = useState(false);
  // Number of undoable decisions — kept in state so the Undo button stays in sync.
  const [historyLen, setHistoryLen] = useState(0);
  // Epoch ms until which classification is paused due to rate limiting (0 = off).
  const [rateLimitedUntil, setRateLimitedUntil] = useState(0);
  // True once the per-day free quota is exhausted (won't recover until reset).
  const [dailyLimit, setDailyLimit] = useState(false);

  const historyRef = useRef<UndoEntry[]>([]);
  const inFlightRef = useRef<Set<string>>(new Set());
  const sessionCountRef = useRef(0);

  // ── Derived ────────────────────────────────────────────────
  // Mirror the latest items into a ref so async callbacks read fresh data.
  const itemsRef = useRef(items);
  useEffect(() => {
    itemsRef.current = items;
  });

  const reviewable = useMemo(
    () => items.filter((it) => isReviewable(it.status)),
    [items],
  );

  const phase: Phase = useMemo(() => {
    if (items.length === 0) return ingesting ? "ingesting" : "empty";
    if (reviewable.length === 0) return "done";
    if (!started) return "ready";
    if (paused) return "checkpoint";
    return "reviewing";
  }, [items.length, reviewable.length, paused, ingesting, started]);

  // The item under review: the anchored currentId if it's still reviewable,
  // otherwise the first reviewable item. Derived, so no correcting effect.
  const current = useMemo(() => {
    const anchored = items.find((it) => it.id === currentId);
    if (anchored && isReviewable(anchored.status)) return anchored;
    return items.find((it) => isReviewable(it.status)) ?? null;
  }, [items, currentId]);

  // In assist/auto mode, whether the current image should stop for the user.
  // manual: always. auto: never. assist: only when not confident enough.
  const awaitingUser = useMemo(() => {
    if (!current || current.status !== "review") return false;
    if (settings.sortMode === "manual") return true;
    if (settings.sortMode === "auto") return false;
    const conf = current.proposal?.confidence ?? 0;
    return conf < settings.confidenceThreshold || current.folders.length === 0;
  }, [current, settings.sortMode, settings.confidenceThreshold]);

  const patch = useCallback((id: string, fields: Partial<SortItem>) => {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, ...fields } : it)),
    );
  }, []);

  // ── Classification ─────────────────────────────────────────
  const classify = useCallback(
    async (id: string) => {
      if (inFlightRef.current.has(id)) return;
      const item = itemsRef.current.find((it) => it.id === id);
      if (!item || item.status !== "pending") return;

      inFlightRef.current.add(id);
      patch(id, { status: "classifying" });

      try {
        const resized = await resizeForModel(item.file);
        if (!resized) {
          // Non-image (e.g. video): route to VIDEOS, let user confirm.
          patch(id, {
            status: "review",
            folders: item.file.type.startsWith("video/") ? ["VIDEOS"] : ["MISC"],
            proposal: { folders: [], confidence: 0, reasoning: "Not a still image." },
          });
          return;
        }

        const recent = loadCorrections().slice(0, CORRECTIONS_IN_PROMPT);
        const res = await fetch("/api/classify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            imageBase64: resized.base64,
            mimeType: resized.mimeType,
            recentCorrections: recent,
          }),
        });

        // Rate limited. A per-minute limit recovers in seconds, so pause the
        // queue and re-queue this image to retry automatically. A per-day cap
        // won't recover for hours — stop and tell the user plainly.
        if (res.status === 429) {
          const data = (await res.json().catch(() => ({}))) as ClassifyResponse;
          patch(id, { status: "pending" });
          if (data.quotaScope === "day") {
            setDailyLimit(true);
          } else {
            const secs = data.retryAfterSeconds ?? 60;
            setRateLimitedUntil(Date.now() + secs * 1000);
          }
          return;
        }

        const data = (await res.json()) as ClassifyResponse;

        patch(id, {
          status: "review",
          proposal: {
            folders: data.folders,
            confidence: data.confidence,
            reasoning: data.reasoning,
          },
          folders: data.folders,
          error: data.error,
        });
      } catch {
        patch(id, {
          status: "review",
          folders: [],
          proposal: undefined,
          error: "Classification failed — retry or tag it manually.",
        });
      } finally {
        inFlightRef.current.delete(id);
      }
    },
    [patch],
  );

  // Classify the current item and a small look-ahead, capped at MAX_CONCURRENT
  // requests in flight. The cap is essential: without it the effect re-runs on
  // every patch and cascades a classify call through the whole queue at once,
  // flooding the API and overflowing React's update depth.
  useEffect(() => {
    if (phase !== "reviewing" || !current) return;
    if (dailyLimit) return;
    if (rateLimitedUntil && Date.now() < rateLimitedUntil) return;
    const idx = items.findIndex((it) => it.id === current.id);
    const queue = items.slice(idx); // current first, then look-ahead
    for (const it of queue) {
      if (inFlightRef.current.size >= MAX_CONCURRENT) break;
      if (it.status === "pending" && !inFlightRef.current.has(it.id)) {
        classify(it.id);
      }
    }
  }, [phase, current, items, classify, rateLimitedUntil, dailyLimit]);

  // Auto-resume once the rate-limit cooldown elapses (clearing the flag makes
  // the classify effect re-run and pick the pending image back up).
  useEffect(() => {
    if (!rateLimitedUntil) return;
    const ms = rateLimitedUntil - Date.now();
    const t = setTimeout(() => setRateLimitedUntil(0), Math.max(0, ms));
    return () => clearTimeout(t);
  }, [rateLimitedUntil]);

  // ── Session / checkpoint bookkeeping ───────────────────────
  const bump = useCallback(() => {
    sessionCountRef.current += 1;
    setSessionCount(sessionCountRef.current);
    if (sessionLimit && sessionCountRef.current >= sessionLimit) {
      setPaused(true);
    }
  }, [sessionLimit]);

  const advanceFrom = useCallback((id: string) => {
    const list = itemsRef.current;
    const idx = list.findIndex((it) => it.id === id);
    const next = list.slice(idx + 1).find((it) => isReviewable(it.status));
    setCurrentId(next ? next.id : null);
  }, []);

  const pushHistory = useCallback((item: SortItem) => {
    historyRef.current.push({
      id: item.id,
      prevStatus: item.status,
      prevFolders: item.folders,
    });
    if (historyRef.current.length > 50) historyRef.current.shift();
    setHistoryLen(historyRef.current.length);
  }, []);

  // ── User actions ───────────────────────────────────────────
  const resolve = useCallback(
    (status: "sorted" | "trashed", folders?: string[]) => {
      if (!current) return;
      pushHistory(current);

      const finalFolders = folders ?? current.folders;

      // Learning loop: if the user changed the model's proposal, remember it.
      if (status === "sorted" && current.proposal) {
        const a = [...current.proposal.folders].sort().join("|");
        const b = [...finalFolders].sort().join("|");
        if (a !== b) {
          const corr: Correction = {
            description: current.proposal.reasoning
              ? `Image previously read as "${current.proposal.reasoning}"`
              : "(corrected image)",
            folders: finalFolders,
          };
          addCorrection(corr);
        }
      }

      patch(current.id, {
        status,
        folders: status === "sorted" ? finalFolders : current.folders,
      });
      advanceFrom(current.id);
      bump();
    },
    [current, patch, advanceFrom, bump, pushHistory],
  );

  const confirm = useCallback(() => {
    if (!current || current.folders.length === 0) return;
    resolve("sorted");
  }, [current, resolve]);

  const trash = useCallback(() => resolve("trashed"), [resolve]);

  const misc = useCallback(() => resolve("sorted", ["MISC"]), [resolve]);

  /** Re-queue the current item for classification (after an error). */
  const retry = useCallback(() => {
    if (!current) return;
    patch(current.id, { status: "pending", error: undefined, proposal: undefined });
  }, [current, patch]);

  // Auto-file the current image when the mode allows it (auto, or assist with
  // high confidence). The user is never asked; it advances on its own. Each
  // step waits for the next classification, so this can't run away.
  useEffect(() => {
    if (phase !== "reviewing" || !current) return;
    if (current.status !== "review") return;
    if (settings.sortMode === "manual" || awaitingUser) return;
    // Intentional side effect: file the image and advance to the next one.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    resolve("sorted", current.folders.length ? current.folders : ["MISC"]);
  }, [phase, current, settings.sortMode, awaitingUser, resolve]);

  /** Pause auto-sorting (drops to the checkpoint screen). */
  const pause = useCallback(() => setPaused(true), []);

  /** Clear the daily-limit flag and resume (e.g. after enabling billing). */
  const clearDailyLimit = useCallback(() => setDailyLimit(false), []);

  const setFolders = useCallback(
    (folders: string[]) => {
      if (current) patch(current.id, { folders });
    },
    [current, patch],
  );

  const addFolder = useCallback(
    (name: string) => {
      if (!current || current.folders.includes(name)) return;
      patch(current.id, { folders: [...current.folders, name] });
    },
    [current, patch],
  );

  const removeFolder = useCallback(
    (name: string) => {
      if (!current) return;
      patch(current.id, {
        folders: current.folders.filter((f) => f !== name),
      });
    },
    [current, patch],
  );

  const toggleFolder = useCallback(
    (name: string) => {
      if (!current) return;
      if (current.folders.includes(name)) removeFolder(name);
      else addFolder(name);
    },
    [current, addFolder, removeFolder],
  );

  /** Move the current image to the back of the queue to decide later. */
  const saveForLater = useCallback(() => {
    if (!current) return;
    const id = current.id;
    advanceFrom(id);
    setItems((prev) => {
      const idx = prev.findIndex((it) => it.id === id);
      if (idx === -1) return prev;
      const copy = [...prev];
      const [moved] = copy.splice(idx, 1);
      copy.push(moved);
      return copy;
    });
  }, [current, advanceFrom]);

  const undo = useCallback(() => {
    const entry = historyRef.current.pop();
    if (!entry) return;
    setHistoryLen(historyRef.current.length);
    patch(entry.id, {
      status: entry.prevStatus,
      folders: entry.prevFolders,
    });
    setCurrentId(entry.id);
    setPaused(false);
    sessionCountRef.current = Math.max(0, sessionCountRef.current - 1);
    setSessionCount(sessionCountRef.current);
  }, [patch]);

  const canUndo = historyLen > 0;

  // ── Ingest ─────────────────────────────────────────────────
  const ingest = useCallback(async (files: File[]) => {
    const media = files.filter(
      (f) => f.type.startsWith("image/") || f.type.startsWith("video/"),
    );
    if (media.length === 0) return;

    setIngesting(true);

    const newItems: SortItem[] = media.map((file) => ({
      id: crypto.randomUUID(),
      fileName: file.name,
      file,
      previewUrl: URL.createObjectURL(file),
      mimeType: file.type,
      status: "pending" as ItemStatus,
      folders: [],
    }));

    setItems((prev) => [...prev, ...newItems]);
    setCurrentId((cur) => cur ?? newItems[0]?.id ?? null);

    // Perceptual-hash + duplicate detection in the background.
    const priorHashes = itemsRef.current
      .map((it) => it.phash)
      .filter(Boolean) as string[];
    const seen: { id: string; hash: string }[] = [];

    for (const it of newItems) {
      const hash = await computePHash(it.file);
      if (!hash) continue;

      const dupOf = seen.find(
        (s) => hammingDistance(s.hash, hash) <= DUPLICATE_THRESHOLD,
      );
      const isPriorDup = priorHashes.some(
        (h) => hammingDistance(h, hash) <= DUPLICATE_THRESHOLD,
      );

      if (dupOf || isPriorDup) {
        patch(it.id, {
          phash: hash,
          status: "duplicate",
          duplicateOf: dupOf?.id,
        });
      } else {
        patch(it.id, { phash: hash });
        seen.push({ id: it.id, hash });
      }
    }

    setIngesting(false);
  }, [patch]);

  // ── Session controls ───────────────────────────────────────
  const startSession = useCallback((limit: number | null) => {
    setSessionLimit(limit);
    sessionCountRef.current = 0;
    setSessionCount(0);
    setPaused(false);
    setStarted(true);
  }, []);

  const continueSession = useCallback(() => {
    sessionCountRef.current = 0;
    setSessionCount(0);
    setPaused(false);
  }, []);

  const updateSettings = useCallback((next: Partial<Settings>) => {
    setSettings((prev) => {
      const merged = { ...prev, ...next };
      saveSettings(merged);
      return merged;
    });
  }, []);

  // ── Download ───────────────────────────────────────────────
  const download = useCallback(async () => {
    setZipping(true);
    try {
      const blob = await buildSortedZip(itemsRef.current, {
        includeTrash: settings.includeTrashInZip,
      });
      const stamp = new Date().toISOString().slice(0, 10);
      downloadBlob(blob, `CLAUDE SORTED ${stamp}.zip`);
    } finally {
      setZipping(false);
    }
  }, [settings.includeTrashInZip]);

  const reset = useCallback(() => {
    itemsRef.current.forEach((it) => URL.revokeObjectURL(it.previewUrl));
    historyRef.current = [];
    inFlightRef.current.clear();
    sessionCountRef.current = 0;
    setHistoryLen(0);
    setItems([]);
    setCurrentId(null);
    setPaused(false);
    setStarted(false);
    setSessionCount(0);
    setSessionLimit(null);
  }, []);

  // ── Stats ──────────────────────────────────────────────────
  const stats = useMemo(() => {
    const counts = { sorted: 0, trashed: 0, duplicate: 0, remaining: 0 };
    const distribution = new Map<string, number>();
    for (const it of items) {
      if (it.status === "sorted") {
        counts.sorted++;
        for (const f of it.folders.length ? it.folders : ["MISC"]) {
          distribution.set(f, (distribution.get(f) ?? 0) + 1);
        }
      } else if (it.status === "trashed") counts.trashed++;
      else if (it.status === "duplicate") counts.duplicate++;
      else counts.remaining++;
    }
    const resolved = counts.sorted + counts.trashed + counts.duplicate;
    return {
      ...counts,
      resolved,
      total: items.length,
      progress: items.length ? resolved / items.length : 0,
      distribution: [...distribution.entries()].sort((a, b) => b[1] - a[1]),
    };
  }, [items]);

  /** The last few sorted items, newest first — the "recent decisions" strip. */
  const recentSorted = useMemo(
    () =>
      [...items]
        .filter((it) => it.status === "sorted" || it.status === "trashed")
        .reverse()
        .slice(0, 6),
    [items],
  );

  return {
    // data
    items,
    current,
    phase,
    stats,
    recentSorted,
    settings,
    awaitingUser,
    sessionCount,
    sessionLimit,
    canUndo,
    zipping,
    ingesting,
    rateLimitedUntil,
    dailyLimit,
    // actions
    ingest,
    confirm,
    trash,
    misc,
    retry,
    addFolder,
    removeFolder,
    toggleFolder,
    setFolders,
    saveForLater,
    undo,
    pause,
    clearDailyLimit,
    startSession,
    continueSession,
    updateSettings,
    download,
    reset,
  };
}

export type SorterApi = ReturnType<typeof useSorter>;
