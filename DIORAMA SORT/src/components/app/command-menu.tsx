"use client";

import { useRouter } from "next/navigation";
import { Sparkles, Plus } from "lucide-react";

import { useApp } from "@/lib/store";
import { NAV, SETTINGS_ITEM } from "@/components/app/nav";
import { PRODUCTS, MANUFACTURERS } from "@/lib/mock/data";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";

export function CommandMenu() {
  const router = useRouter();
  const { commandOpen, setCommandOpen, setAssistantOpen } = useApp();

  const go = (href: string) => {
    setCommandOpen(false);
    router.push(href);
  };

  return (
    <CommandDialog open={commandOpen} onOpenChange={setCommandOpen}>
      <CommandInput placeholder="Search modules, products, manufacturers…" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Navigate">
          {[...NAV, SETTINGS_ITEM].map((n) => {
            const Icon = n.icon;
            return (
              <CommandItem key={n.href} onSelect={() => go(n.href)} value={n.label}>
                <Icon className="size-4" />
                {n.label}
              </CommandItem>
            );
          })}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Actions">
          <CommandItem
            onSelect={() => {
              setCommandOpen(false);
              setAssistantOpen(true);
            }}
            value="ask ai assistant"
          >
            <Sparkles className="size-4" />
            Ask the AI assistant
            <CommandShortcut>AI</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => go("/samples")} value="new product">
            <Plus className="size-4" />
            New product
          </CommandItem>
          <CommandItem onSelect={() => go("/manufacturers")} value="add manufacturer">
            <Plus className="size-4" />
            Add manufacturer
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Products">
          {PRODUCTS.slice(0, 6).map((p) => (
            <CommandItem
              key={p.id}
              onSelect={() => go("/samples")}
              value={`product ${p.name}`}
            >
              {p.name}
              <CommandShortcut>{p.status}</CommandShortcut>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup heading="Manufacturers">
          {MANUFACTURERS.slice(0, 4).map((m) => (
            <CommandItem
              key={m.id}
              onSelect={() => go("/manufacturers")}
              value={`manufacturer ${m.name}`}
            >
              {m.name}
              <CommandShortcut>{m.country}</CommandShortcut>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
