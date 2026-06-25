"use client";

import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ViewOption<T extends string> {
  id: T;
  label: string;
  icon: LucideIcon;
}

export function ViewSwitcher<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: ViewOption<T>[];
}) {
  return (
    <div className="flex items-center gap-0.5 rounded-lg border bg-surface-2/60 p-0.5">
      {options.map((o) => {
        const Icon = o.icon;
        const active = value === o.id;
        return (
          <button
            key={o.id}
            onClick={() => onChange(o.id)}
            className={cn(
              "flex h-7 items-center gap-1.5 rounded-md px-2.5 text-[13px] font-medium transition-colors cursor-pointer",
              active
                ? "bg-card text-foreground shadow-sm"
                : "text-ink-soft hover:text-foreground",
            )}
          >
            <Icon className="size-3.5" />
            <span className="hidden sm:inline">{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}
