import {
  House,
  SquareKanban,
  Library,
  Images,
  Factory,
  Frame,
  ListChecks,
  CalendarDays,
  Store,
  Megaphone,
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
  { label: "Home", href: "/home", icon: House, hint: "Overview" },
  { label: "Product Status", href: "/samples", icon: SquareKanban, hint: "Full product lifecycle" },
  { label: "Asset Library", href: "/assets", icon: Library, hint: "Files & guides" },
  { label: "Moodboard", href: "/moodboard", icon: Images, hint: "References & AI sort" },
  { label: "Manufacturers", href: "/manufacturers", icon: Factory, hint: "Factory directory" },
  { label: "Collection Planning", href: "/collections", icon: Frame, hint: "Canvas board" },
  { label: "Tasks", href: "/tasks", icon: ListChecks, hint: "Team to-dos" },
  { label: "Calendar", href: "/calendar", icon: CalendarDays, hint: "Everything time-sensitive" },
  { label: "Store", href: "/shopify", icon: Store, hint: "Shopify performance" },
  { label: "Ad Studio", href: "/ad-studio", icon: Megaphone, hint: "Ads & campaigns" },
];

export const SETTINGS_ITEM: NavItem = {
  label: "Settings",
  href: "/settings",
  icon: Settings,
};
