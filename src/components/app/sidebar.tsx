"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LogOut,
  Settings as SettingsIcon,
  Sun,
  Moon,
  User,
  Check,
  Plus,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

import { NAV, SETTINGS_ITEM } from "@/components/app/nav";
import { DioramaWordmark, WorkspaceLogo } from "@/components/logo";
import { MemberAvatar } from "@/components/app/bits";
import { useApp } from "@/lib/store";
import { member, CURRENT_USER_ID, WORKSPACES } from "@/lib/mock/data";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme, sidebarCollapsed, toggleSidebar, workspace, setWorkspace } =
    useApp();
  const me = member(CURRENT_USER_ID)!;
  const [hover, setHover] = React.useState(false);
  const hoverTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  // Collapsed shows an icon rail; a deliberate hover (~450ms) expands it, so a
  // quick mouse pass-over doesn't pop it open — and the same delay on leave.
  const expanded = !sidebarCollapsed || hover;

  const onEnter = () => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    hoverTimer.current = setTimeout(() => setHover(true), 450);
  };
  const onLeave = () => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    hoverTimer.current = setTimeout(() => setHover(false), 450);
  };
  React.useEffect(() => () => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
  }, []);

  const navLink = (item: (typeof NAV)[number], active: boolean) => {
    const Icon = item.icon;
    return (
      <Link
        key={item.href}
        href={item.href}
        title={!expanded ? item.label : undefined}
        className={cn(
          "group flex h-9 items-center rounded-md text-sm font-medium transition-colors",
          expanded ? "gap-2.5 px-2.5" : "justify-center px-0",
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
        {expanded && <span className="truncate">{item.label}</span>}
      </Link>
    );
  };

  return (
    <aside
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      className={cn(
        "flex h-dvh shrink-0 flex-col border-r bg-surface-2 transition-[width] duration-200 ease-out",
        expanded ? "w-60" : "w-16",
      )}
    >
        {/* Brand */}
        <div className={cn("flex h-14 items-center", expanded ? "px-5" : "justify-center")}>
          <Link href="/home" className="flex items-center">
            {expanded ? (
              <DioramaWordmark className="h-[18px]" />
            ) : (
              <span className="serif flex size-8 items-center justify-center rounded-md bg-elevated text-base">
                D
              </span>
            )}
          </Link>
        </div>

        <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-2">
          {NAV.map((item) => navLink(item, pathname.startsWith(item.href)))}
        </nav>

        <div className="space-y-0.5 border-t p-3">
          {navLink(SETTINGS_ITEM, pathname.startsWith(SETTINGS_ITEM.href))}

          <button
            onClick={toggleSidebar}
            title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={cn(
              "group flex w-full items-center rounded-md py-2 text-sm font-medium text-ink-soft transition-colors hover:bg-elevated/60 hover:text-foreground cursor-pointer",
              expanded ? "gap-2.5 px-2.5" : "justify-center px-0",
            )}
          >
            {sidebarCollapsed ? (
              <ChevronsRight className="size-4 shrink-0 text-ink-faint group-hover:text-ink-soft" />
            ) : (
              <ChevronsLeft className="size-4 shrink-0 text-ink-faint group-hover:text-ink-soft" />
            )}
            {expanded && <span>Collapse</span>}
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={cn(
                  "flex w-full items-center rounded-md py-1.5 text-left transition-colors hover:bg-elevated/60 cursor-pointer",
                  expanded ? "gap-2.5 px-2" : "justify-center px-0",
                )}
              >
                <MemberAvatar id={CURRENT_USER_ID} className="size-7" />
                {expanded && (
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm leading-tight">{me.name}</span>
                    <span className="block truncate text-xs text-ink-faint leading-tight">
                      {me.role}
                    </span>
                  </span>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" side="top" className="w-60">
              <DropdownMenuLabel>Workspaces</DropdownMenuLabel>
              {WORKSPACES.map((w) => (
                <DropdownMenuItem
                  key={w.id}
                  onClick={() => setWorkspace(w.id)}
                  className="gap-2.5"
                >
                  <span className="flex size-6 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-surface-2">
                    <WorkspaceLogo workspace={w} />
                  </span>
                  <span className="flex-1 truncate">{w.name}</span>
                  <Check
                    className={cn(
                      "size-4 text-accent",
                      workspace.id === w.id ? "opacity-100" : "opacity-0",
                    )}
                  />
                </DropdownMenuItem>
              ))}
              <DropdownMenuItem className="text-ink-soft">
                <Plus className="size-4" /> New workspace
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>{me.email}</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => router.push("/settings")}>
                <User className="size-4" /> Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
                {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
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
