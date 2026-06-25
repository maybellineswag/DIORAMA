/**
 * Client-side image utilities. Everything here runs in the browser:
 *   - resizeForModel: shrink a copy to send to the AI (originals are untouched).
 *   - computePHash + hammingDistance: cheap perceptual-hash duplicate detection.
 *
 * No external dependencies; uses canvas / createImageBitmap.
 */

const MAX_MODEL_DIM = 512; // longest edge sent to the model
const MODEL_QUALITY = 0.82;

/** Decode a File into an ImageBitmap, falling back to an <img> if needed. */
async function decode(file: File): Promise<ImageBitmap | HTMLImageElement> {
  try {
    return await createImageBitmap(file);
  } catch {
    return await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve(img);
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("Could not decode image"));
      };
      img.src = url;
    });
  }
}

function dimsOf(src: ImageBitmap | HTMLImageElement): { w: number; h: number } {
  if ("width" in src && "height" in src) {
    const w = (src as { width: number }).width;
    const h = (src as { height: number }).height;
    return { w, h };
  }
  return { w: 0, h: 0 };
}

/**
 * Produce a small JPEG copy as base64 (no data: prefix) for the model.
 * Returns null for non-raster files (e.g. video) which skip classification.
 */
export async function resizeForModel(
  file: File,
): Promise<{ base64: string; mimeType: string } | null> {
  if (!file.type.startsWith("image/")) return null;

  const src = await decode(file);
  const { w, h } = dimsOf(src);
  if (!w || !h) return null;

  const scale = Math.min(1, MAX_MODEL_DIM / Math.max(w, h));
  const tw = Math.max(1, Math.round(w * scale));
  const th = Math.max(1, Math.round(h * scale));

  const canvas = document.createElement("canvas");
  canvas.width = tw;
  canvas.height = th;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.drawImage(src as CanvasImageSource, 0, 0, tw, th);
  if ("close" in src) (src as ImageBitmap).close();

  const dataUrl = canvas.toDataURL("image/jpeg", MODEL_QUALITY);
  const base64 = dataUrl.split(",")[1] ?? "";
  return { base64, mimeType: "image/jpeg" };
}

/**
 * dHash perceptual hash: 9x8 grayscale, compare adjacent pixels -> 64 bits,
 * returned as a 16-char hex string. Resolution/format changes barely move it.
 */
export async function computePHash(file: File): Promise<string | undefined> {
  if (!file.type.startsWith("image/")) return undefined;
  let src: ImageBitmap | HTMLImageElement;
  try {
    src = await decode(file);
  } catch {
    return undefined;
  }

  const W = 9;
  const H = 8;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return undefined;
  ctx.drawImage(src as CanvasImageSource, 0, 0, W, H);
  if ("close" in src) (src as ImageBitmap).close();

  const { data } = ctx.getImageData(0, 0, W, H);
  // grayscale luminance per pixel
  const gray = new Array<number>(W * H);
  for (let i = 0; i < W * H; i++) {
    const r = data[i * 4];
    const g = data[i * 4 + 1];
    const b = data[i * 4 + 2];
    gray[i] = 0.299 * r + 0.587 * g + 0.114 * b;
  }

  // 8 rows x 8 comparisons of horizontally adjacent pixels = 64 bits
  let bits = "";
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W - 1; x++) {
      const left = gray[y * W + x];
      const right = gray[y * W + x + 1];
      bits += left < right ? "1" : "0";
    }
  }

  // pack 64 bits into 16 hex chars
  let hex = "";
  for (let i = 0; i < 64; i += 4) {
    hex += parseInt(bits.slice(i, i + 4), 2).toString(16);
  }
  return hex;
}

/** Hamming distance between two equal-length hex hashes (number of differing bits). */
export function hammingDistance(a?: string, b?: string): number {
  if (!a || !b || a.length !== b.length) return Infinity;
  let dist = 0;
  for (let i = 0; i < a.length; i++) {
    let xor = parseInt(a[i], 16) ^ parseInt(b[i], 16);
    while (xor) {
      dist += xor & 1;
      xor >>= 1;
    }
  }
  return dist;
}

/** Two images are treated as duplicates when their dHashes are within this many bits. */
export const DUPLICATE_THRESHOLD = 5;
