"use client";

import * as React from "react";
import {
  TrendingUp,
  TrendingDown,
  Check,
  Upload,
  Sparkles,
  Target,
} from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/app/page-header";
import { AiPanel } from "@/components/app/ai-panel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  AD_PLATFORMS,
  AD_PERFORMANCE,
  AD_CAMPAIGNS,
  AD_INSIGHTS,
  AD_CREATIVES,
  CAMPAIGN_BRIEFS,
  DROPS,
  type AdCreative,
  type AdPlatform,
  type CampaignBrief,
} from "@/lib/mock/commerce";
import { cn } from "@/lib/utils";

const money = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const compact = (n: number) =>
  n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k` : String(n);

function Delta({ v }: { v: number }) {
  return (
    <span className={cn("flex items-center gap-1 text-xs", v >= 0 ? "text-good" : "text-danger")}>
      {v >= 0 ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
      {Math.abs(v)}%
    </span>
  );
}

const PLATFORM_BADGE: Record<string, string> = {
  Meta: "bg-info-soft text-info",
  TikTok: "bg-accent-soft text-accent-ink",
  Google: "bg-good-soft text-good",
};

// ── Performance tab ──────────────────────────────────────────
function PlatformCard({ p, onToggle }: { p: AdPlatform; onToggle: () => void }) {
  return (
    <Card className="flex items-center gap-3 p-4">
      <span className="flex size-9 items-center justify-center rounded-md bg-surface-2 text-sm font-medium">
        {p.name[0]}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{p.name}</p>
        {p.connected ? (
          <Badge variant="good"><Check className="size-3" /> Connected</Badge>
        ) : (
          <span className="text-xs text-ink-faint">Not connected</span>
        )}
      </div>
      <Button variant={p.connected ? "secondary" : "default"} size="sm" onClick={onToggle}>
        {p.connected ? "Manage" : "Connect"}
      </Button>
    </Card>
  );
}

function Performance() {
  const [platforms, setPlatforms] = React.useState(AD_PLATFORMS);
  const perf = AD_PERFORMANCE;
  const statusVariant = (s: string) =>
    s === "Active" ? "good" : s === "Paused" ? "warn" : "default";

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        {platforms.map((p) => (
          <PlatformCard
            key={p.id}
            p={p}
            onToggle={() => {
              setPlatforms((prev) =>
                prev.map((x) => (x.id === p.id ? { ...x, connected: !x.connected } : x)),
              );
              toast.success(p.connected ? `Disconnected ${p.name}` : `Connected ${p.name}`);
            }}
          />
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {[
          { label: "Total spend", value: money(perf.spend.value), delta: perf.spend.delta },
          { label: "Revenue attributed", value: money(perf.revenue.value), delta: perf.revenue.delta },
          { label: "Blended ROAS", value: `${perf.roas.value}×`, delta: perf.roas.delta },
          { label: "CPM", value: `$${perf.cpm.value}`, delta: perf.cpm.delta },
          { label: "CTR", value: `${perf.ctr.value}%`, delta: perf.ctr.delta },
        ].map((m) => (
          <Card key={m.label} className="p-4">
            <p className="text-xs text-ink-soft">{m.label}</p>
            <p className="tabular mt-1.5 text-xl font-medium">{m.value}</p>
            <div className="mt-1"><Delta v={m.delta} /></div>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Campaigns */}
          <Card>
            <div className="border-b px-5 py-3.5"><span className="text-sm font-medium">Campaigns</span></div>
            <div className="overflow-x-auto">
              <div className="min-w-[640px]">
                <div className="grid grid-cols-[1.6fr_0.8fr_0.7fr_0.7fr_0.6fr_0.7fr] gap-3 border-b bg-surface-2/40 px-5 py-2 text-xs font-medium text-ink-faint">
                  <span>Campaign</span><span>Platform</span><span className="text-right">Spend</span><span className="text-right">Clicks</span><span className="text-right">ROAS</span><span>Status</span>
                </div>
                {AD_CAMPAIGNS.map((c) => (
                  <div key={c.id} className="grid grid-cols-[1.6fr_0.8fr_0.7fr_0.7fr_0.6fr_0.7fr] items-center gap-3 border-b px-5 py-3 text-sm last:border-0">
                    <span className="truncate font-medium">{c.name}</span>
                    <span><Badge className={PLATFORM_BADGE[c.platform]}>{c.platform}</Badge></span>
                    <span className="tabular text-right text-ink-soft">{money(c.spend)}</span>
                    <span className="tabular text-right text-ink-soft">{compact(c.clicks)}</span>
                    <span className="tabular text-right font-medium">{c.roas}×</span>
                    <span><Badge variant={statusVariant(c.status)}>{c.status}</Badge></span>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Drops — full picture */}
          <Card>
            <div className="border-b px-5 py-3.5"><span className="text-sm font-medium">By drop — full picture</span></div>
            <div className="overflow-x-auto">
              <div className="min-w-[640px]">
                <div className="grid grid-cols-[1.6fr_0.8fr_0.9fr_0.9fr_0.9fr_0.6fr] gap-3 border-b bg-surface-2/40 px-5 py-2 text-xs font-medium text-ink-faint">
                  <span>Drop</span><span className="text-right">Ad spend</span><span className="text-right">Revenue</span><span className="text-right">Prod. cost</span><span className="text-right">Net profit</span><span className="text-right">ROAS</span>
                </div>
                {DROPS.map((d) => (
                  <div key={d.id} className="grid grid-cols-[1.6fr_0.8fr_0.9fr_0.9fr_0.9fr_0.6fr] items-center gap-3 border-b px-5 py-3 text-sm last:border-0">
                    <span className="truncate font-medium">{d.name}</span>
                    <span className="tabular text-right text-ink-soft">{d.released ? money(d.adSpend) : "—"}</span>
                    <span className="tabular text-right text-ink-soft">{d.released ? money(d.revenue) : "—"}</span>
                    <span className="tabular text-right text-ink-soft">{money(d.productionCost)}</span>
                    <span className={cn("tabular text-right font-medium", d.netProfit > 0 && "text-good")}>
                      {d.released ? money(d.netProfit) : "Upcoming"}
                    </span>
                    <span className="tabular text-right">{d.released ? `${d.roas}×` : "—"}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        <AiPanel subtitle="Reading your ad accounts" insights={AD_INSIGHTS} className="lg:sticky lg:top-20 h-fit" />
      </div>
    </div>
  );
}

// ── Creative Library tab ─────────────────────────────────────
function CreativeLibrary() {
  const [platform, setPlatform] = React.useState("all");
  const [format, setFormat] = React.useState("all");
  const [query, setQuery] = React.useState("");
  const [sel, setSel] = React.useState<AdCreative | null>(null);
  const [open, setOpen] = React.useState(false);

  const items = AD_CREATIVES.filter((c) => platform === "all" || c.platform === platform)
    .filter((c) => format === "all" || c.format === format)
    .filter((c) =>
      query.trim() ? (c.name + c.campaign + c.drop).toLowerCase().includes(query.toLowerCase()) : true,
    );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[200px] flex-1">
          <Sparkles className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-accent-ink" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="AI search creatives…" className="pl-9" />
        </div>
        <Select value={platform} onValueChange={setPlatform}>
          <SelectTrigger size="sm" className="w-auto min-w-[120px]"><SelectValue placeholder="Platform" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All platforms</SelectItem>
            {["Meta", "TikTok", "Google"].map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={format} onValueChange={setFormat}>
          <SelectTrigger size="sm" className="w-auto min-w-[110px]"><SelectValue placeholder="Format" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All formats</SelectItem>
            {["Feed", "Story", "Reel"].map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button size="sm" onClick={() => toast("Upload is simulated in this prototype.")}>
          <Upload className="size-4" /> Upload
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((c) => (
          <button
            key={c.id}
            onClick={() => { setSel(c); setOpen(true); }}
            className="group flex flex-col overflow-hidden rounded-xl border bg-card text-left transition-all hover:border-ink-faint/40 hover:shadow-md cursor-pointer"
          >
            <div className="relative aspect-square overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={c.image} alt="" draggable={false} className="size-full select-none object-cover" />
              <Badge className={cn("absolute left-2 top-2", PLATFORM_BADGE[c.platform])}>{c.platform}</Badge>
              <Badge variant="default" className="absolute right-2 top-2 bg-paper/80 backdrop-blur">{c.format}</Badge>
            </div>
            <div className="p-3">
              <p className="truncate text-sm font-medium">{c.name}</p>
              <p className="truncate text-xs text-ink-faint">{c.campaign}</p>
              <div className="mt-2 flex flex-wrap gap-1">
                <Badge variant="outline">CTR {c.ctr}%</Badge>
                <Badge variant="outline">{money(c.spend)}</Badge>
                <Badge variant={c.roas >= 3 ? "good" : "warn"}>{c.roas}× ROAS</Badge>
              </div>
            </div>
          </button>
        ))}
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="flex w-full flex-col p-0 sm:max-w-md">
          {sel && (
            <>
              <SheetHeader>
                <SheetTitle className="text-base">{sel.name}</SheetTitle>
                <SheetDescription>{sel.campaign}</SheetDescription>
              </SheetHeader>
              <div className="min-h-0 flex-1 overflow-y-auto p-5">
                <div className="aspect-square overflow-hidden rounded-xl border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={sel.image} alt="" className="size-full object-cover" />
                </div>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  <Badge className={PLATFORM_BADGE[sel.platform]}>{sel.platform}</Badge>
                  <Badge variant="outline">{sel.format}</Badge>
                </div>
                <div className="mt-5 grid grid-cols-3 gap-3">
                  {[["CTR", `${sel.ctr}%`], ["Spend", money(sel.spend)], ["ROAS", `${sel.roas}×`]].map(([k, v]) => (
                    <div key={k} className="rounded-lg border bg-surface-2/40 p-3">
                      <p className="text-xs text-ink-faint">{k}</p>
                      <p className="tabular mt-0.5 text-lg font-medium">{v}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-5 space-y-3 text-sm">
                  <div><p className="text-xs text-ink-faint">Drop</p><p>{sel.drop}</p></div>
                  <div>
                    <p className="text-xs text-ink-faint">Linked products</p>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {sel.products.map((p) => <Badge key={p} variant="outline">{p}</Badge>)}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

// ── Campaign Maker tab ───────────────────────────────────────
function buildBrief(prompt: string): CampaignBrief {
  return {
    id: `gen-${Date.now()}`,
    title: prompt.slice(0, 40) || "New campaign",
    prompt,
    concept:
      "A focused, story-led launch. Lead with one hero visual and a single sharp angle, then let format-native variations carry it across platforms. Keep the language tactile and specific to the piece — texture, weight, ritual — rather than generic hype.",
    platforms: [
      { name: "Meta", budgetPct: 55, note: "Prospecting + retargeting carousels for your core 25–34 buyers." },
      { name: "TikTok", budgetPct: 35, note: "Creator-led UGC and ASMR detail loops for reach." },
      { name: "Google", budgetPct: 10, note: "Brand + non-brand search to catch launch-day intent." },
    ],
    content: [
      { platform: "Meta", format: "Feed carousel", hook: "Lead with the strongest detail shot.", visual: "Macro → full look → on-body, warm light." },
      { platform: "TikTok", format: "Reel", hook: "\"POV: it finally dropped.\"", visual: "Handheld, fast cuts, trending sound." },
      { platform: "Meta", format: "Story", hook: "Countdown to drop.", visual: "Single hero on a clean ground, timer sticker." },
    ],
    timeline: [
      { phase: "Tease", window: "Week 1" },
      { phase: "Launch", window: "Week 2" },
      { phase: "Sustain", window: "Weeks 3–4" },
    ],
    kpis: [
      { label: "Blended ROAS", target: "≥ 4.0×" },
      { label: "Launch-week revenue", target: "$40k" },
      { label: "CTR (Meta)", target: "≥ 2.0%" },
    ],
  };
}

function BriefDoc({ brief }: { brief: CampaignBrief }) {
  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-ink-faint">Campaign</p>
        <h3 className="display mt-1 text-xl tracking-tight">{brief.title}</h3>
      </div>
      <div>
        <p className="mb-1 text-xs font-medium uppercase tracking-wider text-ink-faint">Concept</p>
        <p className="text-sm leading-relaxed text-ink-soft">{brief.concept}</p>
      </div>
      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-wider text-ink-faint">Platforms & budget split</p>
        <div className="space-y-2">
          {brief.platforms.map((p) => (
            <div key={p.name} className="rounded-lg border bg-surface-2/40 p-3">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{p.name}</span>
                <span className="tabular text-ink-soft">{p.budgetPct}%</span>
              </div>
              <div className="my-1.5 h-1.5 overflow-hidden rounded-full bg-surface-2">
                <div className="h-full rounded-full bg-accent" style={{ width: `${p.budgetPct}%` }} />
              </div>
              <p className="text-xs text-ink-faint">{p.note}</p>
            </div>
          ))}
        </div>
      </div>
      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-wider text-ink-faint">Content ideas</p>
        <div className="space-y-2">
          {brief.content.map((c, i) => (
            <div key={i} className="rounded-lg border p-3">
              <div className="flex items-center gap-1.5">
                <Badge className={PLATFORM_BADGE[c.platform]}>{c.platform}</Badge>
                <Badge variant="outline">{c.format}</Badge>
              </div>
              <p className="mt-2 text-sm font-medium">{c.hook}</p>
              <p className="text-xs text-ink-soft">{c.visual}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-ink-faint">Timeline</p>
          <div className="space-y-1.5">
            {brief.timeline.map((t) => (
              <div key={t.phase} className="flex items-center justify-between text-sm">
                <span>{t.phase}</span><span className="text-ink-faint">{t.window}</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-ink-faint">KPI targets</p>
          <div className="space-y-1.5">
            {brief.kpis.map((k) => (
              <div key={k.label} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1.5"><Target className="size-3.5 text-accent-ink" />{k.label}</span>
                <span className="font-medium">{k.target}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function CampaignMaker() {
  const [briefs, setBriefs] = React.useState(CAMPAIGN_BRIEFS);
  const [active, setActive] = React.useState<CampaignBrief>(CAMPAIGN_BRIEFS[0]);
  const [prompt, setPrompt] = React.useState("");
  const [thinking, setThinking] = React.useState(false);

  const send = () => {
    if (!prompt.trim()) return;
    setThinking(true);
    const p = prompt;
    setPrompt("");
    setTimeout(() => {
      const b = buildBrief(p);
      setBriefs((prev) => [b, ...prev]);
      setActive(b);
      setThinking(false);
    }, 900);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
      {/* Chat / briefs list */}
      <div className="flex flex-col gap-4">
        <Card className="p-4">
          <p className="mb-2 text-sm font-medium">Describe your campaign</p>
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. AW25 Reliquary drop, hero is the heavyweight hoodie, moody autumn, target 18–30 streetwear, $15k budget"
            className="min-h-28 resize-none"
          />
          <Button className="mt-3 w-full" onClick={send} disabled={thinking}>
            <Sparkles className="size-4" /> {thinking ? "Drafting brief…" : "Generate brief"}
          </Button>
          <p className="mt-2 text-[11px] text-ink-faint">Responses are simulated for this prototype.</p>
        </Card>

        <div className="space-y-1.5">
          <p className="px-1 text-xs font-medium uppercase tracking-wider text-ink-faint">Briefs</p>
          {briefs.map((b) => (
            <button
              key={b.id}
              onClick={() => setActive(b)}
              className={cn(
                "flex w-full flex-col gap-0.5 rounded-lg border px-3.5 py-2.5 text-left transition-colors cursor-pointer",
                active.id === b.id ? "border-accent/40 bg-accent-soft/30" : "border-transparent hover:bg-elevated/60",
              )}
            >
              <span className="truncate text-sm font-medium">{b.title}</span>
              <span className="line-clamp-1 text-xs text-ink-faint">{b.prompt}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Brief document */}
      <Card className="p-6">
        {thinking ? (
          <div className="space-y-3">
            {[0, 1, 2, 3].map((i) => <div key={i} className="h-16 animate-pulse rounded-lg bg-surface-hi" />)}
          </div>
        ) : (
          <BriefDoc brief={active} />
        )}
      </Card>
    </div>
  );
}

export default function AdStudioPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6 lg:p-8">
      <PageHeader title="Ad Studio" description="Run, measure, and dream up your paid campaigns." />
      <Tabs defaultValue="performance">
        <TabsList>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="creatives">Creative Library</TabsTrigger>
          <TabsTrigger value="maker">Campaign Maker</TabsTrigger>
        </TabsList>
        <TabsContent value="performance" className="mt-6"><Performance /></TabsContent>
        <TabsContent value="creatives" className="mt-6"><CreativeLibrary /></TabsContent>
        <TabsContent value="maker" className="mt-6"><CampaignMaker /></TabsContent>
      </Tabs>
    </div>
  );
}
