import JSZip from "jszip";
import type { SortItem } from "@/lib/types";

/**
 * Build a ZIP of the sorted images. Each confirmed image is COPIED (full,
 * original quality) into every folder it was tagged with. Trashed images go
 * into a _TRASH folder. Originals are never modified — we only read them.
 */
export async function buildSortedZip(
  items: SortItem[],
  options: { includeTrash: boolean } = { includeTrash: true },
): Promise<Blob> {
  const zip = new JSZip();
  const usedNames = new Map<string, number>(); // per-folder filename collisions

  const place = (folder: string, item: SortItem) => {
    const dir = zip.folder(folder);
    if (!dir) return;
    const key = `${folder}/${item.fileName}`;
    const count = usedNames.get(key) ?? 0;
    usedNames.set(key, count + 1);
    const name = count === 0 ? item.fileName : dedupeName(item.fileName, count);
    dir.file(name, item.file);
  };

  for (const item of items) {
    if (item.status === "sorted") {
      const folders = item.folders.length > 0 ? item.folders : ["MISC"];
      for (const folder of folders) place(folder, item);
    } else if (item.status === "trashed" && options.includeTrash) {
      place("_TRASH", item);
    } else if (item.status === "duplicate" && options.includeTrash) {
      place("_TRASH/_DUPLICATES", item);
    }
  }

  return zip.generateAsync({
    type: "blob",
    compression: "DEFLATE",
    compressionOptions: { level: 1 }, // images are already compressed; keep it fast
  });
}

function dedupeName(fileName: string, n: number): string {
  const dot = fileName.lastIndexOf(".");
  if (dot <= 0) return `${fileName} (${n})`;
  return `${fileName.slice(0, dot)} (${n})${fileName.slice(dot)}`;
}

/** Trigger a browser download of a Blob. */
export function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
