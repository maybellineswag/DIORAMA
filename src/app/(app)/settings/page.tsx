"use client";

import * as React from "react";
import { Upload, Plus, Check, Sun, Moon, KeyRound } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/app/page-header";
import { WorkspaceLogo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useApp, ACCENT_PRESETS } from "@/lib/store";
import { MEMBERS } from "@/lib/mock/data";
import type { Role } from "@/lib/mock/types";
import { cn } from "@/lib/utils";

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).slice(0, 2).join("");
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="p-6">
      <div className="mb-5">
        <h3 className="text-sm font-medium">{title}</h3>
        {description && <p className="mt-0.5 text-xs text-ink-faint">{description}</p>}
      </div>
      {children}
    </Card>
  );
}

const INTEGRATIONS = [
  { id: "shopify", name: "Shopify", desc: "Sync products, orders, and inventory.", connected: true },
  { id: "pinterest", name: "Pinterest", desc: "Pull boards into your moodboards.", connected: false },
  { id: "arena", name: "Are.na", desc: "Import channels as references.", connected: false },
];

const NOTIF = [
  { id: "sample", label: "Sample status changes", desc: "When a product moves between statuses." },
  { id: "deadline", label: "Upcoming deadlines", desc: "Reminders 48h before a due date." },
  { id: "mention", label: "Mentions & assignments", desc: "When you're assigned or @mentioned." },
  { id: "comms", label: "Manufacturer replies", desc: "New entries in a manufacturer log." },
  { id: "shopify", label: "Inventory alerts", desc: "Low and critical stock from Shopify." },
];

export default function SettingsPage() {
  const { workspace, theme, setTheme, accent, setAccent } = useApp();
  const [brand, setBrand] = React.useState(workspace.name);
  const [roles, setRoles] = React.useState<Record<string, Role>>(
    Object.fromEntries(MEMBERS.map((m) => [m.id, m.role])),
  );
  const [conns, setConns] = React.useState(
    Object.fromEntries(INTEGRATIONS.map((i) => [i.id, i.connected])),
  );
  const [notif, setNotif] = React.useState(
    Object.fromEntries(NOTIF.map((n) => [n.id, true])),
  );
  const [invite, setInvite] = React.useState("");
  const [apiKey, setApiKey] = React.useState("");

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6 lg:p-8">
      <PageHeader title="Settings" description="Manage your workspace, team, and preferences." />

      <Tabs defaultValue="workspace">
        <TabsList className="flex-wrap">
          <TabsTrigger value="workspace">Workspace</TabsTrigger>
          <TabsTrigger value="members">Members & Roles</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
        </TabsList>

        {/* Workspace */}
        <TabsContent value="workspace" className="mt-6 space-y-6">
          <Section title="Brand" description="How your workspace appears across Diorama.">
            <div className="flex items-start gap-5">
              <div className="space-y-2">
                <span className="flex size-20 items-center justify-center overflow-hidden rounded-xl border bg-surface-2">
                  <WorkspaceLogo workspace={workspace} />
                </span>
                <Button variant="secondary" size="sm" className="w-full" onClick={() => toast("Logo upload is simulated.")}>
                  <Upload className="size-3.5" /> Change
                </Button>
              </div>
              <div className="flex-1 space-y-4">
                <div className="space-y-2">
                  <Label>Brand name</Label>
                  <Input value={brand} onChange={(e) => setBrand(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Timezone</Label>
                    <Select defaultValue="cet">
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cet">CET — Central European</SelectItem>
                        <SelectItem value="gmt">GMT — London</SelectItem>
                        <SelectItem value="est">EST — New York</SelectItem>
                        <SelectItem value="pst">PST — Los Angeles</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Currency</Label>
                    <Select defaultValue="usd">
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="usd">USD — $</SelectItem>
                        <SelectItem value="eur">EUR — €</SelectItem>
                        <SelectItem value="gbp">GBP — £</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
            <Separator className="my-5" />
            <div className="flex justify-end">
              <Button onClick={() => toast.success("Workspace settings saved")}>
                Save changes
              </Button>
            </div>
          </Section>
        </TabsContent>

        {/* Members */}
        <TabsContent value="members" className="mt-6 space-y-6">
          <Section title="Invite teammates" description="Add people to the Olivine workspace.">
            <div className="flex gap-2">
              <Input
                value={invite}
                onChange={(e) => setInvite(e.target.value)}
                placeholder="name@brand.com"
                type="email"
              />
              <Button
                className="shrink-0"
                disabled={!invite.trim()}
                onClick={() => {
                  toast.success(`Invitation sent to ${invite}`);
                  setInvite("");
                }}
              >
                <Plus className="size-4" /> Invite
              </Button>
            </div>
          </Section>

          <Section title="Members" description={`${MEMBERS.length} people in this workspace.`}>
            <div className="divide-y">
              {MEMBERS.map((m) => (
                <div key={m.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <Avatar className="size-9">
                    <AvatarFallback className="text-xs">{initials(m.name)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{m.name}</p>
                    <p className="truncate text-xs text-ink-faint">{m.email}</p>
                  </div>
                  {m.role === "Owner" ? (
                    <Badge variant="accent">Owner</Badge>
                  ) : (
                    <Select
                      value={roles[m.id]}
                      onValueChange={(v) => {
                        setRoles((r) => ({ ...r, [m.id]: v as Role }));
                        toast.success(`${m.name} is now ${v}`);
                      }}
                    >
                      <SelectTrigger size="sm" className="w-28">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(["Admin", "Editor", "Viewer"] as Role[]).map((r) => (
                          <SelectItem key={r} value={r}>{r}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              ))}
            </div>
          </Section>
        </TabsContent>

        {/* Integrations */}
        <TabsContent value="integrations" className="mt-6 space-y-6">
          <Section title="Connected apps" description="Sync Diorama with the tools you already use.">
            <div className="space-y-3">
              {INTEGRATIONS.map((i) => (
                <div key={i.id} className="flex items-center gap-4 rounded-lg border bg-surface-2/40 p-4">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{i.name}</p>
                    <p className="text-xs text-ink-faint">{i.desc}</p>
                  </div>
                  {conns[i.id] ? (
                    <Badge variant="good"><Check className="size-3" /> Connected</Badge>
                  ) : null}
                  <Button
                    variant={conns[i.id] ? "secondary" : "default"}
                    size="sm"
                    onClick={() => {
                      setConns((c) => ({ ...c, [i.id]: !c[i.id] }));
                      toast.success(
                        conns[i.id] ? `Disconnected ${i.name}` : `Connected ${i.name}`,
                      );
                    }}
                  >
                    {conns[i.id] ? "Disconnect" : "Connect"}
                  </Button>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Gemini API key" description="Used by the AI moodboard sorter and assistant.">
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5">
                <KeyRound className="size-3.5" /> API key
              </Label>
              <div className="flex gap-2">
                <Input
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="AIza…"
                  type="password"
                />
                <Button className="shrink-0" onClick={() => toast.success("API key saved")}>
                  Save
                </Button>
              </div>
              <p className="text-xs text-ink-faint">
                Get a key at aistudio.google.com/apikey. Stored locally for this prototype.
              </p>
            </div>
          </Section>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications" className="mt-6 space-y-6">
          <Section title="Notifications" description="Choose what Diorama tells you about.">
            <div className="divide-y">
              {NOTIF.map((n) => (
                <div key={n.id} className="flex items-center justify-between gap-4 py-3.5 first:pt-0 last:pb-0">
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{n.label}</p>
                    <p className="text-xs text-ink-faint">{n.desc}</p>
                  </div>
                  <Switch
                    checked={notif[n.id]}
                    onCheckedChange={(v) => setNotif((s) => ({ ...s, [n.id]: v }))}
                  />
                </div>
              ))}
            </div>
          </Section>
        </TabsContent>

        {/* Preferences */}
        <TabsContent value="preferences" className="mt-6 space-y-6">
          <Section title="Appearance" description="Personal — only affects your account.">
            <div className="grid grid-cols-2 gap-3">
              {(["dark", "light"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTheme(t)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg border p-4 text-left transition-colors cursor-pointer",
                    theme === t ? "border-accent/50 bg-accent-soft/30" : "hover:bg-elevated/60",
                  )}
                >
                  <span className="flex size-9 items-center justify-center rounded-md bg-surface-2">
                    {t === "dark" ? <Moon className="size-4" /> : <Sun className="size-4" />}
                  </span>
                  <div>
                    <p className="text-sm font-medium capitalize">{t} mode</p>
                    <p className="text-xs text-ink-faint">
                      {t === "dark" ? "Default" : "Lighter surfaces"}
                    </p>
                  </div>
                  {theme === t && <Check className="ml-auto size-4 text-accent" />}
                </button>
              ))}
            </div>
          </Section>

          <Section
            title="Accent color"
            description="Used across buttons, highlights, and interactive elements. Updates instantly."
          >
            <div className="flex flex-wrap gap-3">
              {ACCENT_PRESETS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setAccent(p.id)}
                  title={p.label}
                  aria-label={p.label}
                  className={cn(
                    "relative flex size-9 items-center justify-center rounded-full border transition-transform hover:scale-105 cursor-pointer",
                    accent === p.id
                      ? "border-foreground/60 ring-2 ring-offset-2 ring-offset-card"
                      : "border-border",
                  )}
                  style={{
                    backgroundColor: p.value,
                    // @ts-expect-error CSS custom prop for the focus ring color
                    "--tw-ring-color": p.value,
                  }}
                >
                  {accent === p.id && (
                    <Check
                      className="size-4"
                      style={{ color: p.foreground }}
                    />
                  )}
                </button>
              ))}
            </div>
            <p className="mt-3 text-xs text-ink-faint">
              Active: <span className="capitalize text-ink-soft">{accent}</span>
            </p>
          </Section>

          <Section title="Language">
            <div className="max-w-xs space-y-2">
              <Label>Display language</Label>
              <Select defaultValue="en">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="pt">Português</SelectItem>
                  <SelectItem value="fr">Français</SelectItem>
                  <SelectItem value="ja">日本語</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </Section>
        </TabsContent>
      </Tabs>
    </div>
  );
}
