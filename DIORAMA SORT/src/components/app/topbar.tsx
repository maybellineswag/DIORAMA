"use client";

import { usePathname } from "next/navigation";
import { Search, Sparkles, Bell } from "lucide-react";

import { WorkspaceSwitcher } from "@/components/app/workspace-switcher";
import { NAV, SETTINGS_ITEM } from "@/components/app/nav";
import { useApp } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { RECENT_ACTIVITY } from "@/lib/mock/data";

export function Topbar() {
  const pathname = usePathname();
  const { setCommandOpen, setAssistantOpen } = useApp();
  const current =
    [...NAV, SETTINGS_ITEM].find((n) => pathname.startsWith(n.href))?.label ??
    "Dashboard";

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-paper/80 px-4 backdrop-blur-xl">
      <div className="w-[210px] shrink-0">
        <WorkspaceSwitcher />
      </div>

      <div className="hidden items-center gap-2 text-sm text-ink-faint sm:flex">
        <span className="text-ink-faint/50">/</span>
        <span className="font-medium text-ink-soft">{current}</span>
      </div>

      <div className="flex-1" />

      <button
        onClick={() => setCommandOpen(true)}
        className="hidden h-9 w-56 items-center gap-2 rounded-md border bg-surface-2/60 px-3 text-sm text-ink-faint transition-colors hover:border-ink-faint/40 md:flex cursor-pointer"
      >
        <Search className="size-4" />
        <span className="flex-1 text-left">Search…</span>
        <kbd className="kbd">⌘K</kbd>
      </button>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="size-4" />
            <span className="absolute right-2 top-2 size-1.5 rounded-full bg-clay" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-80 p-0">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <span className="text-sm font-medium">Notifications</span>
            <Badge variant="clay">5 new</Badge>
          </div>
          <div className="max-h-80 overflow-y-auto p-1">
            {RECENT_ACTIVITY.map((a) => (
              <div
                key={a.id}
                className="flex flex-col gap-0.5 rounded-md px-3 py-2.5 hover:bg-accent/60"
              >
                <p className="text-sm leading-snug">
                  <span className="font-medium">{a.who}</span>{" "}
                  <span className="text-ink-soft">{a.action}</span>
                </p>
                <span className="text-xs text-ink-faint">
                  {a.context} · {a.at}
                </span>
              </div>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      <Button
        variant="secondary"
        size="sm"
        onClick={() => setAssistantOpen(true)}
        className="gap-1.5"
      >
        <Sparkles className="size-4 text-clay" />
        <span className="hidden sm:inline">Ask AI</span>
      </Button>
    </header>
  );
}
