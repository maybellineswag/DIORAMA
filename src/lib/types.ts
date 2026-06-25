/** Shared types between the client UI and the classify API route. */

export interface ClassifyRequest {
  /** Base64-encoded (no data: prefix) small preview of the image. */
  imageBase64: string;
  mimeType: string;
  /** Recent in-session corrections, sent as fresh few-shot examples. */
  recentCorrections?: { description: string; folders: string[] }[];
}

export interface ClassifyResult {
  folders: string[];
  confidence: number;
  reasoning: string;
}

export interface ClassifyResponse extends ClassifyResult {
  /** Set when the model/network failed and we returned a safe fallback. */
  error?: string;
  /** On a 429: whether it's the per-day cap or a per-minute rate limit. */
  quotaScope?: "day" | "minute";
  /** On a 429: suggested seconds to wait before retrying. */
  retryAfterSeconds?: number;
}

/** Status of a single image as it moves through the sorter. */
export type ItemStatus =
  | "pending" // not yet classified
  | "classifying" // request in flight
  | "review" // awaiting the user's confirm/override
  | "sorted" // confirmed into folders
  | "trashed" // sent to _TRASH
  | "duplicate"; // auto-detected duplicate of an earlier image

export interface SortItem {
  id: string;
  fileName: string;
  /** Object URL for full-quality display + the source File for zipping. */
  file: File;
  previewUrl: string;
  mimeType: string;
  /** Perceptual hash (hex) for duplicate detection. */
  phash?: string;
  status: ItemStatus;
  /** Model proposal (null until classified). */
  proposal?: ClassifyResult;
  /** Current folder tags (starts as the proposal, edited by the user). */
  folders: string[];
  /** If a duplicate, the id of the item it duplicates. */
  duplicateOf?: string;
  error?: string;
}
