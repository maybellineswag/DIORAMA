"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { FOLDERS } from "@/lib/taxonomy";
import { Search } from "lucide-react";

interface Props {
  existing: string[];
  onSelect: (name: string) => void;
  onClose: () => void;
}

/** Searchable folder picker. Opens focused; Esc closes; Enter picks the top hit. */
export function FolderSearch({ existing, onSelect, onClose }: Props) {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return FOLDERS.filter((f) => {
      if (existing.includes(f.name)) return false;
      if (!q) return true;
      return (
        f.name.toLowerCase().includes(q) || f.hint.toLowerCase().includes(q)
      );
    }).slice(0, 8);
  }, [query, existing]);

  const choose = (name: string) => {
    onSelect(name);
    setQuery("");
    inputRef.current?.focus();
  };

  return (
    <div className="card absolute z-30 mt-2 w-80 overflow-hidden p-1.5 animate-fade-up">
      <div className="flex items-center gap-2 px-2.5 py-1.5">
        <Search
          size={16}
          strokeWidth={1.75}
          className="text-[color:var(--color-ink-faint)]"
        />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActive(0);
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              e.preventDefault();
              onClose();
            } else if (e.key === "ArrowDown") {
              e.preventDefault();
              setActive((a) => Math.min(a + 1, results.length - 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setActive((a) => Math.max(a - 1, 0));
            } else if (e.key === "Enter") {
              e.preventDefault();
              const pick = results[active];
              if (pick) choose(pick.name);
            }
          }}
          placeholder="Add a folder…"
          className="w-full bg-transparent text-sm text-[color:var(--color-ink)] placeholder:text-[color:var(--color-ink-faint)] outline-none"
        />
      </div>

      <div className="mt-1 max-h-72 overflow-y-auto">
        {results.length === 0 ? (
          <p className="px-3 py-4 text-center text-xs text-[color:var(--color-ink-faint)]">
            No matching folder
          </p>
        ) : (
          results.map((f, i) => (
            <button
              key={f.name}
              onMouseEnter={() => setActive(i)}
              onClick={() => choose(f.name)}
              className="flex w-full items-start gap-2 rounded-[var(--radius-sm)] px-3 py-2 text-left transition-colors"
              style={{
                background:
                  i === active ? "var(--color-line-soft)" : "transparent",
              }}
            >
              <span className="mt-px text-[13px] font-medium tracking-wide text-[color:var(--color-ink)]">
                {f.name}
              </span>
              <span className="line-clamp-1 text-[11px] leading-5 text-[color:var(--color-ink-faint)]">
                {f.hint}
              </span>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
