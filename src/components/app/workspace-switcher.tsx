"use client";

import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { useApp } from "@/lib/store";
import { WORKSPACES } from "@/lib/mock/data";
import { WorkspaceLogo } from "@/components/logo";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function WorkspaceSwitcher() {
  const { workspace, setWorkspace } = useApp();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="group flex w-full items-center gap-2.5 rounded-lg border border-transparent px-2 py-1.5 text-left transition-colors hover:bg-elevated cursor-pointer">
          <span className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-surface-2">
            <WorkspaceLogo workspace={workspace} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium leading-tight">
              {workspace.name}
            </span>
            <span className="block truncate text-xs text-ink-faint leading-tight">
              {workspace.plan} workspace
            </span>
          </span>
          <ChevronsUpDown className="size-4 shrink-0 text-ink-faint" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuLabel>Switch workspace</DropdownMenuLabel>
        {WORKSPACES.map((w) => (
          <DropdownMenuItem
            key={w.id}
            onClick={() => setWorkspace(w.id)}
            className="gap-2.5"
          >
            <span className="flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-surface-2">
              <WorkspaceLogo workspace={w} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm leading-tight">{w.name}</span>
              <span className="block truncate text-xs text-ink-faint leading-tight">
                {w.plan}
              </span>
            </span>
            <Check
              className={cn(
                "size-4 text-accent",
                workspace.id === w.id ? "opacity-100" : "opacity-0",
              )}
            />
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Plus className="size-4" /> New workspace
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
