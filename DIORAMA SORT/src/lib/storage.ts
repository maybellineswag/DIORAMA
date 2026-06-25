import type { Correction } from "@/lib/taxonomy";

/**
 * LocalStorage-backed preferences + the in-session learning loop.
 * Corrections accumulate as the user overrides the model; the most recent are
 * injected back into the prompt as fresh few-shot examples.
 */

const CORRECTIONS_KEY = "diorama.corrections.v1";
const SETTINGS_KEY = "diorama.settings.v1";
const MAX_CORRECTIONS = 24;
/** How many of the freshest corrections we send to the model each request. */
export const CORRECTIONS_IN_PROMPT = 8;

/**
 * - manual: review every image (highest accuracy, most effort)
 * - assist: auto-file confident images, stop only on the unsure ones
 * - auto:   file everything with no review (fastest, hands-off)
 */
export type SortMode = "manual" | "assist" | "auto";

export interface Settings {
  sortMode: SortMode;
  /** In assist mode, auto-file when confidence is at/above this (0–1). */
  confidenceThreshold: number;
  /** Include _TRASH / duplicate folders in the downloaded ZIP. */
  includeTrashInZip: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  sortMode: "assist",
  confidenceThreshold: 0.8,
  includeTrashInZip: true,
};

function isBrowser() {
  return typeof window !== "undefined";
}

export function loadCorrections(): Correction[] {
  if (!isBrowser()) return [];
  try {
    const raw = localStorage.getItem(CORRECTIONS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function addCorrection(correction: Correction): Correction[] {
  if (!isBrowser()) return [];
  const all = loadCorrections();
  all.unshift(correction); // newest first
  const trimmed = all.slice(0, MAX_CORRECTIONS);
  try {
    localStorage.setItem(CORRECTIONS_KEY, JSON.stringify(trimmed));
  } catch {
    /* ignore quota errors */
  }
  return trimmed;
}

export function clearCorrections() {
  if (!isBrowser()) return;
  localStorage.removeItem(CORRECTIONS_KEY);
}

export function loadSettings(): Settings {
  if (!isBrowser()) return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: Settings) {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    /* ignore */
  }
}
