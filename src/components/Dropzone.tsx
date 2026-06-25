"use client";

import { useCallback, useRef, useState } from "react";
import { Wordmark } from "@/components/Wordmark";
import { Layers } from "lucide-react";

interface Props {
  onFiles: (files: File[]) => void;
  busy?: boolean;
}

/** Recursively pull every File out of dropped folders/items. */
async function readDataTransfer(dt: DataTransfer): Promise<File[]> {
  const items = Array.from(dt.items);
  const entries = items
    .map((it) => (it.webkitGetAsEntry ? it.webkitGetAsEntry() : null))
    .filter(Boolean) as FileSystemEntry[];

  if (entries.length === 0) return Array.from(dt.files);

  const files: File[] = [];
  const walk = async (entry: FileSystemEntry): Promise<void> => {
    if (entry.isFile) {
      const file = await new Promise<File>((res, rej) =>
        (entry as FileSystemFileEntry).file(res, rej),
      );
      files.push(file);
    } else if (entry.isDirectory) {
      const reader = (entry as FileSystemDirectoryEntry).createReader();
      const batch = await new Promise<FileSystemEntry[]>((res) =>
        reader.readEntries(res, () => res([])),
      );
      await Promise.all(batch.map(walk));
    }
  };
  await Promise.all(entries.map(walk));
  return files;
}

export function Dropzone({ onFiles, busy }: Props) {
  const [hover, setHover] = useState(false);
  const folderInput = useRef<HTMLInputElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      setHover(false);
      const files = await readDataTransfer(e.dataTransfer);
      if (files.length) onFiles(files);
    },
    [onFiles],
  );

  return (
    <div className="mx-auto flex min-h-dvh max-w-3xl flex-col items-center justify-center px-6">
      <Wordmark className="h-7 w-auto text-[color:var(--color-ink)] opacity-90" />

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setHover(true);
        }}
        onDragLeave={() => setHover(false)}
        onDrop={handleDrop}
        className="mt-10 w-full rounded-[var(--radius-lg)] border border-dashed p-12 text-center transition-all duration-200"
        style={{
          borderColor: hover ? "var(--clay)" : "var(--color-line)",
          background: hover ? "var(--clay-soft)" : "var(--color-surface)",
          transform: hover ? "scale(1.005)" : "none",
        }}
      >
        <Layers
          size={28}
          strokeWidth={1.5}
          className="mx-auto mb-5 text-[color:var(--color-ink-faint)]"
        />
        <p className="text-sm font-medium text-[color:var(--color-ink)]">
          {busy ? "Reading images…" : "Drag a folder of images here"}
        </p>
        <p className="mt-1 text-xs text-[color:var(--color-ink-faint)]">
          or
        </p>
        <div className="mt-3 flex items-center justify-center gap-2">
          <button
            className="btn btn-primary"
            onClick={() => folderInput.current?.click()}
            disabled={busy}
          >
            Choose folder
          </button>
          <button
            className="btn btn-outline"
            onClick={() => fileInput.current?.click()}
            disabled={busy}
          >
            Choose images
          </button>
        </div>
      </div>

      <p className="mt-6 text-xs text-[color:var(--color-ink-faint)]">
        Images stay on your computer. Only a small preview is sent for
        classification.
      </p>

      {/* Hidden inputs */}
      <input
        ref={folderInput}
        type="file"
        multiple
        hidden
        {...({
          webkitdirectory: "",
          directory: "",
        } as unknown as React.InputHTMLAttributes<HTMLInputElement>)}
        onChange={(e) => {
          const files = Array.from(e.target.files ?? []);
          if (files.length) onFiles(files);
          e.target.value = "";
        }}
      />
      <input
        ref={fileInput}
        type="file"
        accept="image/*,video/*"
        multiple
        hidden
        onChange={(e) => {
          const files = Array.from(e.target.files ?? []);
          if (files.length) onFiles(files);
          e.target.value = "";
        }}
      />
    </div>
  );
}
