"use client";

import * as React from "react";
import { WORKSPACES } from "@/lib/mock/data";
import type { Workspace } from "@/lib/mock/types";

type Theme = "dark" | "light";

interface AppState {
  workspace: Workspace;
  setWorkspace: (id: string) => void;
  theme: Theme;
  setTheme: (t: Theme) => void;
  commandOpen: boolean;
  setCommandOpen: (v: boolean) => void;
  assistantOpen: boolean;
  setAssistantOpen: (v: boolean) => void;
}

const AppContext = React.createContext<AppState | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [workspaceId, setWorkspaceId] = React.useState(WORKSPACES[0].id);
  const [theme, setThemeState] = React.useState<Theme>("dark");
  const [commandOpen, setCommandOpen] = React.useState(false);
  const [assistantOpen, setAssistantOpen] = React.useState(false);

  const setTheme = React.useCallback((t: Theme) => {
    setThemeState(t);
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(t);
  }, []);

  // Global ⌘K / Ctrl-K to open the command menu.
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCommandOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const workspace =
    WORKSPACES.find((w) => w.id === workspaceId) ?? WORKSPACES[0];

  const value: AppState = {
    workspace,
    setWorkspace: setWorkspaceId,
    theme,
    setTheme,
    commandOpen,
    setCommandOpen,
    assistantOpen,
    setAssistantOpen,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = React.useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
