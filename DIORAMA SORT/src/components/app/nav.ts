import {
  LayoutDashboard,
  SquareKanban,
  Library,
  Images,
  Factory,
  Frame,
  ListChecks,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  hint?: string;
}

export const NAV: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, hint: "Workspace overview" },
  { label: "Sample Tracker", href: "/samples", icon: SquareKanban, hint: "Products by status" },
  { label: "Asset Library", href: "/assets", icon: Library, hint: "Files & guides" },
  { label: "Moodboard", href: "/moodboard", icon: Images, hint: "References & AI sort" },
  { label: "Manufacturers", href: "/manufacturers", icon: Factory, hint: "Factory directory" },
  { label: "Collection Planning", href: "/collections", icon: Frame, hint: "Canvas board" },
  { label: "Tasks", href: "/tasks", icon: ListChecks, hint: "Team to-dos" },
];

export const SETTINGS_ITEM: NavItem = {
  label: "Settings",
  href: "/settings",
  icon: Settings,
};
