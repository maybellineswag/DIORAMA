/** Mock data for Store (Shopify), Calendar, and Ad Studio modules. */

// ── Deterministic series generator ───────────────────────────
function gen(n: number, base: number, vol: number, trend: number, seed: number): number[] {
  let s = seed;
  const rng = () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
  return Array.from({ length: n }, (_, i) => {
    const wobble = (rng() - 0.5) * vol;
    return Math.max(0, Math.round(base + trend * i + wobble));
  });
}

export const SHOPIFY_SERIES = {
  revenue30: gen(30, 1400, 900, 14, 7),
  revenue90: gen(90, 1100, 1000, 8, 11),
  orders30: gen(30, 18, 14, 0.2, 3),
};

// ── Drops (used by Store by-drop + Ad Studio) ────────────────
export interface Drop {
  id: string;
  name: string;
  season: string;
  releaseDate: string;
  released: boolean;
  adSpend: number;
  revenue: number;
  productionCost: number;
  netProfit: number;
  roas: number;
}

export const DROPS: Drop[] = [
  { id: "ss25-d1", name: "SS25 — Saltwater Drop 1", season: "SS25", releaseDate: "2026-03-14", released: true, adSpend: 12100, revenue: 71800, productionCost: 19800, netProfit: 39900, roas: 5.9 },
  { id: "ss25-d2", name: "SS25 — Saltwater Drop 2", season: "SS25", releaseDate: "2026-04-25", released: true, adSpend: 9800, revenue: 52300, productionCost: 16400, netProfit: 26100, roas: 5.3 },
  { id: "aw25-d1", name: "AW25 — Reliquary Drop 1", season: "AW25", releaseDate: "2026-10-10", released: false, adSpend: 0, revenue: 0, productionCost: 28800, netProfit: 0, roas: 0 },
  { id: "ember", name: "Capsule 01 — Ember", season: "Resort 25", releaseDate: "2026-11-21", released: false, adSpend: 0, revenue: 0, productionCost: 11200, netProfit: 0, roas: 0 },
];

// Home "Last 2 drops" toggle stats (aggregate of the two released drops).
export const SHOPIFY_DROPS_STATS = {
  revenue: 124100,
  revenueDelta: 6.7,
  orders: 1486,
  ordersDelta: 9.2,
  aov: 83.5,
  aovDelta: 2.4,
};

export const SHOPIFY_INSIGHTS: string[] = [
  "Saltwater Boxy Tee drives 34% of revenue but only 12 units remain — restock before the AW25 campaign or you'll sell out mid-launch.",
  "Average order value dropped 8% this month. Your last drop shipped with no accessories — bundling the 6-Panel Cap could lift AOV ~$6.",
  "Saltwater 6-Panel Cap is at 3 units (Critical). It converts best as an add-on, so a stockout will quietly drag down attach rate.",
  "Weekday revenue is 2.1× weekends — schedule your AW25 drop for a Tuesday 10am ET to match your peak.",
];

// ── Calendar events ──────────────────────────────────────────
export type EventType = "sample" | "production" | "task" | "drop";

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // ISO yyyy-mm-dd
  type: EventType;
  href: string;
  meta?: string;
}

export const EVENT_COLORS: Record<EventType, string> = {
  sample: "#7fa0c4", // blue
  production: "#d6a45c", // amber
  task: "#9c7bd0", // violet
  drop: "#94aa78", // green
};

export const EVENT_LABELS: Record<EventType, string> = {
  sample: "Sample",
  production: "Production",
  task: "Task",
  drop: "Drop",
};

export const CALENDAR_EVENTS: CalendarEvent[] = [
  { id: "e1", title: "Core tote QC sign-off", date: "2026-06-26", type: "production", href: "/samples", meta: "Core Canvas Tote" },
  { id: "e2", title: "Reliquary hoodie techpack v3", date: "2026-06-27", type: "sample", href: "/samples", meta: "Reliquary Heavyweight Hoodie" },
  { id: "e3", title: "Ember scarf Round 2 revisions", date: "2026-06-28", type: "sample", href: "/samples", meta: "Ember Chain-Stitch Scarf" },
  { id: "e4", title: "Saltwater tee shoot", date: "2026-06-30", type: "task", href: "/tasks", meta: "Devon Reyes" },
  { id: "e5", title: "İstanbul sweater pricing", date: "2026-07-02", type: "task", href: "/tasks", meta: "Mara Lindqvist" },
  { id: "e6", title: "Lichen sweater sample due", date: "2026-07-04", type: "sample", href: "/samples", meta: "Lichen Heavy-Gauge Sweater" },
  { id: "e7", title: "Bomber bulk in production", date: "2026-07-08", type: "production", href: "/samples", meta: "Nocturne Bomber Jacket" },
  { id: "e8", title: "Sneaker tooling re-check", date: "2026-07-10", type: "production", href: "/samples", meta: "Reliquary Trail Sneaker" },
  { id: "e9", title: "Cargo techpack review", date: "2026-07-14", type: "sample", href: "/samples", meta: "Reliquary Utility Cargo" },
  { id: "e10", title: "AW25 line sheet draft", date: "2026-07-12", type: "task", href: "/tasks", meta: "Devon Reyes" },
  { id: "e11", title: "Corozo button samples", date: "2026-07-01", type: "task", href: "/tasks", meta: "Yuki Tanaka" },
  { id: "e12", title: "AW25 — Reliquary Drop 1", date: "2026-10-10", type: "drop", href: "/shopify", meta: "Drop release" },
  { id: "e13", title: "Capsule 01 — Ember release", date: "2026-11-21", type: "drop", href: "/shopify", meta: "Drop release" },
  { id: "e14", title: "Reliquary hoodie bulk delivery", date: "2026-07-22", type: "production", href: "/samples", meta: "Expected delivery" },
];

// ── Ad Studio ────────────────────────────────────────────────
export interface AdPlatform {
  id: string;
  name: string;
  connected: boolean;
}
export const AD_PLATFORMS: AdPlatform[] = [
  { id: "meta", name: "Meta Ads", connected: true },
  { id: "tiktok", name: "TikTok Ads", connected: true },
  { id: "google", name: "Google Ads", connected: false },
];

export const AD_PERFORMANCE = {
  spend: { value: 21450, delta: 14.2 },
  revenue: { value: 118600, delta: 9.7 },
  roas: { value: 5.5, delta: -4.1 },
  cpm: { value: 12.4, delta: 6.3 },
  ctr: { value: 1.9, delta: -8.0 },
};

export type AdStatus = "Active" | "Paused" | "Ended";
export interface AdCampaign {
  id: string;
  name: string;
  platform: "Meta" | "TikTok" | "Google";
  spend: number;
  impressions: number;
  clicks: number;
  roas: number;
  status: AdStatus;
  drop: string;
}
export const AD_CAMPAIGNS: AdCampaign[] = [
  { id: "c1", name: "AW25 Hoodie — Prospecting", platform: "Meta", spend: 6200, impressions: 512000, clicks: 9800, roas: 6.2, status: "Active", drop: "AW25 — Reliquary Drop 1" },
  { id: "c2", name: "AW25 Hoodie — UGC Reels", platform: "TikTok", spend: 4100, impressions: 388000, clicks: 7300, roas: 1.8, status: "Active", drop: "AW25 — Reliquary Drop 1" },
  { id: "c3", name: "Saltwater Tee — Retargeting", platform: "Meta", spend: 3300, impressions: 210000, clicks: 6100, roas: 8.4, status: "Active", drop: "SS25 — Saltwater Drop 1" },
  { id: "c4", name: "Saltwater — Brand Search", platform: "Google", spend: 2150, impressions: 88000, clicks: 4200, roas: 7.1, status: "Paused", drop: "SS25 — Saltwater Drop 1" },
  { id: "c5", name: "Ember Teaser — Awareness", platform: "TikTok", spend: 1850, impressions: 295000, clicks: 3100, roas: 2.4, status: "Active", drop: "Capsule 01 — Ember" },
  { id: "c6", name: "Cap Bundle — Catalog", platform: "Meta", spend: 1650, impressions: 142000, clicks: 2900, roas: 4.6, status: "Ended", drop: "SS25 — Saltwater Drop 2" },
];

export const AD_INSIGHTS: string[] = [
  "Your AW25 hoodie campaign runs 6.2× ROAS on Meta but only 1.8× on TikTok — shift ~30% of TikTok budget to Meta prospecting while the launch is hot.",
  "Cost per purchase is up 23% this month and CTR fell to 1.9% — your creative is fatiguing. Refresh the hero visuals with the new Ember motifs.",
  "Saltwater Tee retargeting is your most efficient spend (8.4× ROAS) but it's capped at $3.3k — it can absorb more budget before diminishing returns.",
  "TikTok awareness for Ember is cheap reach (CPM $6) — keep it running to warm the audience ahead of the Nov 21 drop.",
];

export interface AdCreative {
  id: string;
  name: string;
  platform: "Meta" | "TikTok" | "Google";
  format: "Feed" | "Story" | "Reel";
  campaign: string;
  drop: string;
  ctr: number;
  spend: number;
  roas: number;
  image: string;
  products: string[];
}
export const AD_CREATIVES: AdCreative[] = [
  { id: "cr1", name: "Hoodie hero — rust on concrete", platform: "Meta", format: "Feed", campaign: "AW25 Hoodie — Prospecting", drop: "AW25 — Reliquary Drop 1", ctr: 2.4, spend: 3100, roas: 6.8, image: "/products/hoodie.webp", products: ["Reliquary Heavyweight Hoodie"] },
  { id: "cr2", name: "Hoodie UGC — get ready with me", platform: "TikTok", format: "Reel", campaign: "AW25 Hoodie — UGC Reels", drop: "AW25 — Reliquary Drop 1", ctr: 1.6, spend: 2400, roas: 1.9, image: "/products/sweater.webp", products: ["Reliquary Heavyweight Hoodie"] },
  { id: "cr3", name: "Boxy tee — flat lay trio", platform: "Meta", format: "Feed", campaign: "Saltwater Tee — Retargeting", drop: "SS25 — Saltwater Drop 1", ctr: 3.1, spend: 1800, roas: 8.9, image: "/products/tee.webp", products: ["Saltwater Boxy Tee"] },
  { id: "cr4", name: "Cap + tote bundle", platform: "Meta", format: "Story", campaign: "Cap Bundle — Catalog", drop: "SS25 — Saltwater Drop 2", ctr: 1.4, spend: 980, roas: 4.6, image: "/products/hat.webp", products: ["Saltwater 6-Panel Cap", "Core Canvas Tote"] },
  { id: "cr5", name: "Ember scarf — close-up loop", platform: "TikTok", format: "Reel", campaign: "Ember Teaser — Awareness", drop: "Capsule 01 — Ember", ctr: 2.0, spend: 1850, roas: 2.4, image: "/products/scarf.webp", products: ["Ember Chain-Stitch Scarf"] },
  { id: "cr6", name: "Bomber — motion turntable", platform: "Meta", format: "Reel", campaign: "AW25 Hoodie — Prospecting", drop: "AW25 — Reliquary Drop 1", ctr: 2.7, spend: 1450, roas: 5.2, image: "/products/bomberjacket.webp", products: ["Nocturne Bomber Jacket"] },
  { id: "cr7", name: "Denim — street casting", platform: "TikTok", format: "Story", campaign: "Ember Teaser — Awareness", drop: "Capsule 01 — Ember", ctr: 1.1, spend: 720, roas: 1.5, image: "/products/denimjacket.webp", products: ["Saltwater Cropped Denim Jacket"] },
  { id: "cr8", name: "Cargo — utility detail", platform: "Google", format: "Feed", campaign: "Saltwater — Brand Search", drop: "SS25 — Saltwater Drop 1", ctr: 0.9, spend: 640, roas: 7.0, image: "/products/cargopants.webp", products: ["Reliquary Utility Cargo"] },
];

export interface CampaignBrief {
  id: string;
  title: string;
  prompt: string;
  concept: string;
  platforms: { name: string; budgetPct: number; note: string }[];
  content: { platform: string; format: string; hook: string; visual: string }[];
  timeline: { phase: string; window: string }[];
  kpis: { label: string; target: string }[];
}

export const CAMPAIGN_BRIEFS: CampaignBrief[] = [
  {
    id: "b1",
    title: "Reliquary — Hoodie Launch",
    prompt: "AW25 Reliquary drop, hero is the heavyweight hoodie, moody autumn, target 18–30 streetwear, $15k budget",
    concept:
      "Position the Reliquary Hoodie as a heirloom object — 'built to be kept.' Lean into texture and ritual: slow macro shots of 420gsm loopback, antique-nickel tips, the rust colorway against raw concrete and candlelight. The story is permanence in a disposable-fashion world.",
    platforms: [
      { name: "Meta", budgetPct: 55, note: "Prospecting + retargeting; carousels of detail shots convert your 25–34 core." },
      { name: "TikTok", budgetPct: 35, note: "UGC + creator seeding; 'styling one hoodie 5 ways' format." },
      { name: "Google", budgetPct: 10, note: "Brand + non-brand search to catch launch-day intent." },
    ],
    content: [
      { platform: "Meta", format: "Feed carousel", hook: "\"The last hoodie you'll buy this year.\"", visual: "Macro fabric → full look → detail of tips, warm tungsten light." },
      { platform: "TikTok", format: "Reel", hook: "\"POV: it's 420gsm and it shows.\"", visual: "Handheld, weight test (drop/drape), ASMR fabric sound." },
      { platform: "Meta", format: "Story", hook: "Countdown sticker to drop", visual: "Single rust hoodie on concrete, timer overlay." },
    ],
    timeline: [
      { phase: "Tease", window: "Oct 1–9" },
      { phase: "Launch", window: "Oct 10–14" },
      { phase: "Sustain / retarget", window: "Oct 15–31" },
    ],
    kpis: [
      { label: "Blended ROAS", target: "≥ 4.5×" },
      { label: "Launch-week revenue", target: "$60k" },
      { label: "CTR (Meta)", target: "≥ 2.2%" },
    ],
  },
  {
    id: "b2",
    title: "Ember — Capsule Teaser",
    prompt: "Small Ember capsule, scarf hero, intimate/warm, build hype before Nov drop, low budget $6k",
    concept:
      "Treat Ember as a whispered secret, not a billboard. Warm, close, candle-lit — the hand-embroidered chain-stitch scarf as the centerpiece. Awareness-first: cheap reach now so the Nov 21 drop lands on a warm audience.",
    platforms: [
      { name: "TikTok", budgetPct: 60, note: "Cheap CPM reach; close-up loops of the chain-stitch." },
      { name: "Meta", budgetPct: 40, note: "Build a retargeting pool from video viewers." },
    ],
    content: [
      { platform: "TikTok", format: "Reel", hook: "\"made by one pair of hands\"", visual: "Slow embroidery close-up, needle pulling thread, warm grain." },
      { platform: "Meta", format: "Story", hook: "\"something small is coming\"", visual: "Scarf draped, ember-glow color grade, minimal text." },
    ],
    timeline: [
      { phase: "Warm-up", window: "Nov 1–14" },
      { phase: "Drop", window: "Nov 21" },
    ],
    kpis: [
      { label: "Video views", target: "300k" },
      { label: "Retargeting pool", target: "25k" },
      { label: "Cost / view", target: "≤ $0.02" },
    ],
  },
];

// ── Moodboard connections ────────────────────────────────────
export interface Connection {
  id: "pinterest" | "arena";
  name: string;
  connected: boolean;
  source: string;
  frequency: "manual" | "hourly" | "daily";
  lastSynced: string;
  preview: string[];
}

const P = [
  "/moodboard/001263D7-897F-4CED-9984-4E3787C555DE_1_105_c.jpeg",
  "/moodboard/014FA8A9-FC13-4DB6-89FB-67E4F2726358_1_105_c.jpeg",
  "/moodboard/040F73D7-7321-49DE-B074-95C4C2F6CA3F_1_105_c.jpeg",
  "/moodboard/2D3E5A27-F623-49CA-ADB1-6072E7042DD7_1_105_c.jpeg",
  "/moodboard/438189E8-F3FD-44B5-A7AB-354F21D0C045_1_105_c.jpeg",
  "/moodboard/5E9A45F1-26D9-46CD-8C14-6D9E764170C8_1_105_c.jpeg",
  "/moodboard/68CF33A5-7EAB-4D14-B871-F46D49F8778D_1_105_c.jpeg",
  "/moodboard/749F618C-FBB6-48FC-96A4-C19C16E962D5_1_105_c.jpeg",
];

export const CONNECTIONS: Connection[] = [
  {
    id: "pinterest",
    name: "Pinterest",
    connected: true,
    source: "olivine/aw25-reliquary, olivine/textures",
    frequency: "daily",
    lastSynced: "2h ago",
    preview: P.slice(0, 4),
  },
  {
    id: "arena",
    name: "Are.na",
    connected: false,
    source: "",
    frequency: "manual",
    lastSynced: "Never",
    preview: P.slice(4, 8),
  },
];

/** Newly-synced images waiting to be sorted in the moodboard Imports tab. */
export const MOOD_IMPORTS = P.slice(0, 6).map((src, i) => ({
  id: `imp-${i}`,
  src,
  source: i % 2 === 0 ? "Pinterest" : "Are.na",
}));
