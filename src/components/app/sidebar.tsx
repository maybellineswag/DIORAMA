"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Settings as SettingsIcon, Sun, Moon, User } from "lucide-react";

import { NAV, SETTINGS_ITEM } from "@/components/app/nav";
import { DioramaWordmark } from "@/components/logo";
import { useApp } from "@/lib/store";
import { member, CURRENT_USER_ID } from "@/lib/mock/data";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("");
}

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useApp();
  const me = member(CURRENT_USER_ID)!;

  return (
    <aside className="flex h-dvh w-[240px] shrink-0 flex-col border-r bg-surface-2/40">
      <div className="flex h-14 items-center px-5">
        <Link href="/dashboard" className="flex items-center">
          <DioramaWordmark className="h-[18px]" />
        </Link>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-2">
        {NAV.map((item) => {
          const active = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-elevated text-foreground"
                  : "text-ink-soft hover:bg-elevated/60 hover:text-foreground",
              )}
            >
              <Icon
                className={cn(
                  "size-4 shrink-0 transition-colors",
                  active ? "text-accent" : "text-ink-faint group-hover:text-ink-soft",
                )}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-0.5 border-t p-3">
        <Link
          href={SETTINGS_ITEM.href}
          className={cn(
            "group flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium transition-colors",
            pathname.startsWith(SETTINGS_ITEM.href)
              ? "bg-elevated text-foreground"
              : "text-ink-soft hover:bg-elevated/60 hover:text-foreground",
          )}
        >
          <SettingsIcon className="size-4 shrink-0 text-ink-faint group-hover:text-ink-soft" />
          Settings
        </Link>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-elevated/60 cursor-pointer">
              <Avatar className="size-7">
                <AvatarFallback className="text-[11px]">
                  {initials(me.name)}
                </AvatarFallback>
              </Avatar>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm leading-tight">{me.name}</span>
                <span className="block truncate text-xs text-ink-faint leading-tight">
                  {me.role}
                </span>
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" side="top" className="w-56">
            <DropdownMenuLabel>{me.email}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push("/settings")}>
              <User className="size-4" /> Profile
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? (
                <Sun className="size-4" />
              ) : (
                <Moon className="size-4" />
              )}
              {theme === "dark" ? "Light mode" : "Dark mode"}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={() => router.push("/login")}>
              <LogOut className="size-4" /> Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}
