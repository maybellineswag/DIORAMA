"use client";

import * as React from "react";
import { WORKSPACES } from "@/lib/mock/data";
import type { Workspace } from "@/lib/mock/types";

type Theme = "dark" | "light";

export interface AccentPreset {
  id: string;
  label: string;
  value: string; // accent color
  foreground: string; // readable text on a solid accent fill
}

/** Accent presets for the picker. --accent can be set to any of these. */
export const ACCENT_PRESETS: AccentPreset[] = [
  { id: "blue", label: "Blue", value: "#3b82f6", foreground: "#ffffff" },
  { id: "indigo", label: "Indigo", value: "#6366f1", foreground: "#ffffff" },
  { id: "violet", label: "Violet", value: "#8b5cf6", foreground: "#ffffff" },
  { id: "emerald", label: "Emerald", value: "#10b981", foreground: "#04231a" },
  { id: "rose", label: "Rose", value: "#f43f5e", foreground: "#ffffff" },
  { id: "orange", label: "Orange", value: "#f97316", foreground: "#1a0f04" },
  { id: "yellow", label: "Yellow", value: "#eab308", foreground: "#1a1400" },
  { id: "white", label: "White", value: "#ffffff", foreground: "#0f0f0f" },
];

interface AppState {
  workspace: Workspace;
  setWorkspace: (id: string) => void;
  theme: Theme;
  setTheme: (t: Theme) => void;
  accent: string; // active accent preset id
  setAccent: (id: string) => void;
  commandOpen: boolean;
  setCommandOpen: (v: boolean) => void;
  assistantOpen: boolean;
  setAssistantOpen: (v: boolean) => void;
}

const AppContext = React.createContext<AppState | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [workspaceId, setWorkspaceId] = React.useState(WORKSPACES[0].id);
  const [theme, setThemeState] = React.useState<Theme>("dark");
  const [accent, setAccentState] = React.useState("blue");
  const [commandOpen, setCommandOpen] = React.useState(false);
  const [assistantOpen, setAssistantOpen] = React.useState(false);

  const setTheme = React.useCallback((t: Theme) => {
    setThemeState(t);
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(t);
  }, []);

  // Swap the global --accent (and its readable foreground) instantly.
  const setAccent = React.useCallback((id: string) => {
    const preset = ACCENT_PRESETS.find((p) => p.id === id) ?? ACCENT_PRESETS[0];
    setAccentState(preset.id);
    const root = document.documentElement;
    root.style.setProperty("--accent", preset.value);
    root.style.setProperty("--accent-foreground", preset.foreground);
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
    accent,
    setAccent,
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
