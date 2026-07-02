import type {
  Asset,
  Guide,
  Manufacturer,
  Member,
  MoodImage,
  Product,
  SampleStatus,
  Task,
  Track,
  Workspace,
} from "./types";

// ── Workspaces & people ──────────────────────────────────────
export const WORKSPACES: Workspace[] = [
  { id: "olivine", name: "Olivine", handle: "olivine", logo: "/olivine-logo.svg", plan: "Studio" },
  { id: "atelier-verde", name: "Atelier Verde", handle: "atelier-verde", plan: "Free" },
  { id: "nocturne", name: "Nocturne Studio", handle: "nocturne", plan: "Studio" },
];

export const CURRENT_USER_ID = "m-sasha";

export const MEMBERS: Member[] = [
  { id: "m-sasha", name: "Grisha Obolenskiy", email: "herfreckleslooklikecandybars@gmail.com", role: "Owner" },
  { id: "m-mara", name: "Mara Lindqvist", email: "mara@olivine.studio", role: "Admin", avatar: "/moodboard/68CF33A5-7EAB-4D14-B871-F46D49F8778D_1_105_c.jpeg" },
  { id: "m-devon", name: "Devon Reyes", email: "devon@olivine.studio", role: "Editor", avatar: "/moodboard/A2C28C15-AB04-4EEC-B7DC-BBB4E610C7C4_1_105_c.jpeg" },
  { id: "m-yuki", name: "Yuki Tanaka", email: "yuki@olivine.studio", role: "Editor", avatar: "/moodboard/C04A5600-2708-4BB8-A8BE-3B8E7FB0D484_1_105_c.jpeg" },
  { id: "m-priya", name: "Priya Nair", email: "priya@olivine.studio", role: "Viewer" },
];

export function member(id: string): Member | undefined {
  return MEMBERS.find((m) => m.id === id);
}

export const COLLECTIONS = [
  "AW25 — Reliquary",
  "SS25 — Saltwater",
  "Capsule 01 — Ember",
  "Core Staples",
];

export const SEASONS = ["AW25", "SS25", "Resort 25", "Core"];

export const PRODUCT_TYPES = [
  "Hoodie",
  "T-Shirt",
  "Cargo Pants",
  "Bomber Jacket",
  "Knit Sweater",
  "Cap",
  "Tote Bag",
  "Denim Jacket",
  "Scarf",
  "Sneakers",
];

// ── Sample-tracker board structure ───────────────────────────
export const TRACKS: { track: Track; statuses: SampleStatus[] }[] = [
  {
    track: "Development",
    statuses: [
      "Concept",
      "Techpack In Progress",
      "Techpack In Review",
      "Ready for Quote",
      "Quote Received",
      "Ready for Sampling",
    ],
  },
  {
    track: "Sample Rounds",
    statuses: ["Sample Sent", "Sample In Review", "Revision Requested"],
  },
  {
    track: "Production",
    statuses: [
      "Bulk Order Placed",
      "In Production",
      "Production Delay",
      "Quality Check",
      "Ready to Drop",
      "Released",
    ],
  },
  { track: "Dead ends", statuses: ["On Hold", "Cancelled"] },
];

export const ALL_STATUSES: SampleStatus[] = TRACKS.flatMap((t) => t.statuses);

export const STATUS_TONE: Record<
  SampleStatus,
  "default" | "accent" | "good" | "danger" | "warn" | "info"
> = {
  Concept: "default",
  "Techpack In Progress": "info",
  "Techpack In Review": "info",
  "Ready for Quote": "default",
  "Quote Received": "default",
  "Ready for Sampling": "info",
  "Sample Sent": "info",
  "Sample In Review": "info",
  "Revision Requested": "warn",
  "Bulk Order Placed": "info",
  "In Production": "info",
  "Production Delay": "danger",
  "Quality Check": "warn",
  "Ready to Drop": "good",
  Released: "good",
  "On Hold": "warn",
  Cancelled: "danger",
};

// ── Manufacturers ────────────────────────────────────────────
const MANU_META: Record<
  string,
  { city: string; since: string; onTimePct: number; responseTime: string; capacity: string; certifications: string[] }
> = {
  "mf-hangzhou": { city: "Hangzhou", since: "2022", onTimePct: 94, responseTime: "~3h", capacity: "12k units / mo", certifications: ["BSCI", "OEKO-TEX"] },
  "mf-porto": { city: "Porto", since: "2023", onTimePct: 98, responseTime: "~5h", capacity: "6k units / mo", certifications: ["GOTS", "OEKO-TEX", "GRS"] },
  "mf-istanbul": { city: "Istanbul", since: "2024", onTimePct: 90, responseTime: "~8h", capacity: "9k units / mo", certifications: ["OEKO-TEX"] },
  "mf-jaipur": { city: "Jaipur", since: "2021", onTimePct: 88, responseTime: "~12h", capacity: "4k units / mo", certifications: ["SA8000", "Fair Trade"] },
  "mf-shenzhen": { city: "Shenzhen", since: "2020", onTimePct: 96, responseTime: "~2h", capacity: "80k pcs / mo", certifications: ["ISO 9001"] },
  "mf-coimbra": { city: "Coimbra", since: "2022", onTimePct: 85, responseTime: "~10h", capacity: "5k units / mo", certifications: ["OEKO-TEX"] },
};

const RAW_MANUFACTURERS: Manufacturer[] = [
  {
    id: "mf-hangzhou",
    name: "Hangzhou Silk Road Mfg.",
    country: "China",
    flag: "🇨🇳",
    status: "Active",
    categories: ["Knitwear", "Cut & Sew", "Hoodies"],
    contactPerson: "Lina Zhou",
    whatsapp: "+86 138 0011 2233",
    email: "lina@silkroad-mfg.cn",
    website: "silkroad-mfg.cn",
    capabilities: [
      { product: "Hoodie", moq: 100, sampleCost: "$45", sampleLeadDays: 12, bulkLeadDays: 40, avgUnitPrice: "~$24", shippingEst: "+$3.10/unit" },
      { product: "Knit Sweater", moq: 120, sampleCost: "$55", sampleLeadDays: 14, bulkLeadDays: 45, avgUnitPrice: "~$21", shippingEst: "+$2.80/unit" },
      { product: "T-Shirt", moq: 150, sampleCost: "$30", sampleLeadDays: 10, bulkLeadDays: 35, avgUnitPrice: "~$8", shippingEst: "+$1.20/unit" },
      { product: "Cargo Pants", moq: 150, sampleCost: "$50", sampleLeadDays: 14, bulkLeadDays: 42, avgUnitPrice: "~$18", shippingEst: "+$2.60/unit" },
      { product: "Bomber Jacket", moq: 120, sampleCost: "$70", sampleLeadDays: 16, bulkLeadDays: 48, avgUnitPrice: "~$30", shippingEst: "+$3.40/unit" },
      { product: "Cap", moq: 144, sampleCost: "$20", sampleLeadDays: 10, bulkLeadDays: 30, avgUnitPrice: "~$5", shippingEst: "+$0.80/unit" },
      { product: "Tote Bag", moq: 200, sampleCost: "$15", sampleLeadDays: 10, bulkLeadDays: 32, avgUnitPrice: "~$3.50", shippingEst: "+$0.70/unit" },
      { product: "Denim Jacket", moq: 150, sampleCost: "$75", sampleLeadDays: 18, bulkLeadDays: 50, avgUnitPrice: "~$26", shippingEst: "+$3.20/unit" },
      { product: "Sneakers", moq: 300, sampleCost: "$60", sampleLeadDays: 20, bulkLeadDays: 55, avgUnitPrice: "~$22", shippingEst: "+$3.80/unit" },
    ],
    paymentTerms: "30% deposit / 70% before shipping",
    rating: 4.6,
    seed: "hangzhou",
    commLog: [
      { id: "c1", date: "2026-06-12", note: "Confirmed AW25 hoodie fabric weight at 420gsm." },
      { id: "c2", date: "2026-05-28", note: "Sent updated techpack for Reliquary hoodie." },
    ],
    files: [
      { id: "f1", name: "Capabilities-Deck.pdf", kind: "Doc", size: "2.1 MB" },
      { id: "f2", name: "Fabric-Library.xlsx", kind: "Spec", size: "880 KB" },
    ],
  },
  {
    id: "mf-porto",
    name: "Têxtil Porto Atelier",
    country: "Portugal",
    flag: "🇵🇹",
    status: "Active",
    categories: ["Premium Jersey", "T-Shirts", "Organic Cotton"],
    contactPerson: "Tiago Ferreira",
    whatsapp: "+351 912 445 778",
    email: "tiago@textilporto.pt",
    website: "textilporto.pt",
    capabilities: [
      { product: "T-Shirt", moq: 150, sampleCost: "€60", sampleLeadDays: 10, bulkLeadDays: 32, avgUnitPrice: "~€9", shippingEst: "+€0.90/unit" },
      { product: "Longsleeve", moq: 150, sampleCost: "€65", sampleLeadDays: 12, bulkLeadDays: 35, avgUnitPrice: "~€12", shippingEst: "+€1.10/unit" },
      { product: "Polo", moq: 120, sampleCost: "€70", sampleLeadDays: 14, bulkLeadDays: 38, avgUnitPrice: "~€13", shippingEst: "+€1.20/unit" },
    ],
    paymentTerms: "50% deposit / 50% on delivery",
    rating: 4.9,
    seed: "porto",
    commLog: [
      { id: "c1", date: "2026-06-18", note: "Saltwater tee — approved GOTS-certified cotton swatch." },
    ],
    files: [{ id: "f1", name: "GOTS-Certificate.pdf", kind: "Doc", size: "640 KB" }],
  },
  {
    id: "mf-istanbul",
    name: "İstanbul Knitworks",
    country: "Turkey",
    flag: "🇹🇷",
    status: "Sampling",
    categories: ["Knit Sweaters", "Beanies", "Heavy Gauge"],
    contactPerson: "Elif Demir",
    whatsapp: "+90 532 110 4455",
    email: "elif@istanbulknit.com.tr",
    website: "istanbulknit.com.tr",
    capabilities: [
      { product: "Knit Sweater", moq: 120, sampleCost: "$55", sampleLeadDays: 14, bulkLeadDays: 40, avgUnitPrice: "~$20", shippingEst: "+$2.40/unit" },
      { product: "Beanie", moq: 200, sampleCost: "$25", sampleLeadDays: 10, bulkLeadDays: 30, avgUnitPrice: "~$5", shippingEst: "+$0.70/unit" },
      { product: "Cardigan", moq: 100, sampleCost: "$65", sampleLeadDays: 16, bulkLeadDays: 45, avgUnitPrice: "~$24", shippingEst: "+$2.90/unit" },
      { product: "Hoodie", moq: 120, sampleCost: "$50", sampleLeadDays: 13, bulkLeadDays: 42, avgUnitPrice: "~$23", shippingEst: "+$2.70/unit" },
      { product: "Scarf", moq: 100, sampleCost: "$28", sampleLeadDays: 14, bulkLeadDays: 38, avgUnitPrice: "~$9", shippingEst: "+$1.20/unit" },
    ],
    paymentTerms: "40% deposit / 60% before shipping",
    rating: 4.3,
    seed: "istanbul",
    commLog: [
      { id: "c1", date: "2026-06-20", note: "Round 2 knit sweater sample en route, DHL." },
      { id: "c2", date: "2026-06-04", note: "Requested tighter gauge on collar rib." },
    ],
    files: [],
  },
  {
    id: "mf-jaipur",
    name: "Jaipur Craft House",
    country: "India",
    flag: "🇮🇳",
    status: "Active",
    categories: ["Hand Embroidery", "Block Print", "Accessories"],
    contactPerson: "Arjun Mehta",
    whatsapp: "+91 98290 33112",
    email: "arjun@jaipurcraft.in",
    website: "jaipurcraft.in",
    capabilities: [
      { product: "Scarf", moq: 80, sampleCost: "$30", sampleLeadDays: 18, bulkLeadDays: 50, avgUnitPrice: "~$11", shippingEst: "+$1.60/unit" },
      { product: "Tote Bag", moq: 100, sampleCost: "$20", sampleLeadDays: 12, bulkLeadDays: 40, avgUnitPrice: "~$4", shippingEst: "+$0.90/unit" },
      { product: "Embroidered Patch", moq: 200, sampleCost: "$15", sampleLeadDays: 10, bulkLeadDays: 35, avgUnitPrice: "~$2", shippingEst: "+$0.30/unit" },
      { product: "Cap", moq: 120, sampleCost: "$18", sampleLeadDays: 12, bulkLeadDays: 36, avgUnitPrice: "~$4", shippingEst: "+$0.60/unit" },
    ],
    paymentTerms: "50% deposit / 50% on delivery",
    rating: 4.5,
    seed: "jaipur",
    commLog: [
      { id: "c1", date: "2026-06-10", note: "Chain-stitch motif approved for Ember scarf." },
    ],
    files: [{ id: "f1", name: "Embroidery-Catalog.pdf", kind: "Doc", size: "5.4 MB" }],
  },
  {
    id: "mf-shenzhen",
    name: "Shenzhen Trim & Hardware",
    country: "China",
    flag: "🇨🇳",
    status: "Active",
    categories: ["Zippers", "Buckles", "Custom Hardware"],
    contactPerson: "Kevin Wu",
    whatsapp: "+86 159 8800 1100",
    email: "kevin@sz-hardware.cn",
    website: "sz-hardware.cn",
    capabilities: [
      { product: "Custom Zipper", moq: 500, sampleCost: "Free", sampleLeadDays: 8, bulkLeadDays: 22, avgUnitPrice: "~$0.40", shippingEst: "+$0.10/unit" },
      { product: "Metal Buckle", moq: 500, sampleCost: "Free", sampleLeadDays: 10, bulkLeadDays: 25, avgUnitPrice: "~$0.80", shippingEst: "+$0.15/unit" },
      { product: "Eyelet / Trim", moq: 1000, sampleCost: "Free", sampleLeadDays: 7, bulkLeadDays: 20, avgUnitPrice: "~$0.20", shippingEst: "+$0.05/unit" },
    ],
    paymentTerms: "100% before shipping",
    rating: 4.1,
    seed: "shenzhen",
    commLog: [],
    files: [],
  },
  {
    id: "mf-coimbra",
    name: "Coimbra Cut & Sew",
    country: "Portugal",
    flag: "🇵🇹",
    status: "Inactive",
    categories: ["Outerwear", "Technical", "Denim"],
    contactPerson: "Beatriz Sousa",
    whatsapp: "+351 939 220 187",
    email: "beatriz@coimbracs.pt",
    website: "coimbracs.pt",
    capabilities: [
      { product: "Denim Jacket", moq: 200, sampleCost: "€85", sampleLeadDays: 20, bulkLeadDays: 55, avgUnitPrice: "~€30", shippingEst: "+€3.50/unit" },
      { product: "Bomber Jacket", moq: 150, sampleCost: "€90", sampleLeadDays: 22, bulkLeadDays: 58, avgUnitPrice: "~€34", shippingEst: "+€3.80/unit" },
      { product: "Technical Pant", moq: 200, sampleCost: "€80", sampleLeadDays: 18, bulkLeadDays: 50, avgUnitPrice: "~€26", shippingEst: "+€3.10/unit" },
      { product: "Hoodie", moq: 150, sampleCost: "€80", sampleLeadDays: 18, bulkLeadDays: 50, avgUnitPrice: "~€28", shippingEst: "+€3.20/unit" },
      { product: "Cargo Pants", moq: 200, sampleCost: "€80", sampleLeadDays: 18, bulkLeadDays: 50, avgUnitPrice: "~€27", shippingEst: "+€3.10/unit" },
      { product: "Sneakers", moq: 250, sampleCost: "€95", sampleLeadDays: 22, bulkLeadDays: 58, avgUnitPrice: "~€36", shippingEst: "+€4.00/unit" },
    ],
    paymentTerms: "30% deposit / 70% on delivery",
    rating: 3.8,
    seed: "coimbra",
    commLog: [
      { id: "c1", date: "2026-03-02", note: "Paused — lead times too long for capsule timeline." },
    ],
    files: [],
  },
];

export const MANUFACTURERS: Manufacturer[] = RAW_MANUFACTURERS.map((m) => ({
  ...m,
  ...(MANU_META[m.id] ?? {}),
}));

export function manufacturer(id: string | null): Manufacturer | undefined {
  return MANUFACTURERS.find((m) => m.id === id);
}

/** Factories that can make a given product type (for sourcing comparison). */
export function capableManufacturers(type: string): Manufacturer[] {
  return MANUFACTURERS.filter((m) =>
    m.capabilities.some((c) => c.product === type),
  );
}

// ── Sample-tracker products ──────────────────────────────────
const A = (id: string, who: string, action: string, at: string) => ({ id, who, action, at });

export const PRODUCTS: Product[] = [
  {
    id: "p-reliquary-hoodie",
    name: "Reliquary Heavyweight Hoodie",
    type: "Hoodie",
    collection: "AW25 — Reliquary",
    drop: "Drop 01 · Oct 2026",
    priority: "Urgent",
    assigneeId: "m-mara",
    manufacturerId: "mf-hangzhou",
    status: "Sample In Review",
    seed: "hoodie-reliquary",
    statusSince: "2026-06-14",
    retailPrice: 110,
    image: "/products/hoodie.webp",
    candidates: [
      {
        manufacturerId: "mf-hangzhou",
        status: "Awarded",
        rating: 4.5,
        notes: "Best price and lead; sharp embroidery. Awarded production.",
        pros: ["Sharpest embroidery", "Cheapest landed cost", "Fastest lead time"],
        cons: ["R1 drawcord tips wrong metal (fixed R2)", "Faint collar pucker"],
        rounds: [
          { round: 1, dateSent: "2026-05-02", dateReceived: "2026-05-19", photos: 4, revisionNotes: "Body length 2cm short; hood too shallow; drawcord tips wrong metal.", changedVsPrevious: "Initial sample from approved techpack." },
          { round: 2, dateSent: "2026-05-26", dateReceived: "2026-06-14", photos: 6, revisionNotes: "Length corrected; hood depth good; drawcord tips now antique nickel; awaiting final wash test.", changedVsPrevious: "+2cm body; deeper hood; antique-nickel tips; 420gsm loopback." },
          { round: 3, dateSent: "2026-06-18", dateReceived: "2026-06-25", photos: 5, revisionNotes: "Wash test passed, ~3% shrinkage; cuff ribbing relaxed; embroidery placement approved.", changedVsPrevious: "Pre-shrunk body; tighter cuff rib; locked embroidery coordinates." },
        ],
      },
      {
        manufacturerId: "mf-istanbul",
        status: "Sampling",
        rating: 4,
        notes: "Gorgeous hand-feel and rib, but lands pricier once shipping is in.",
        pros: ["Best hand-feel & drape", "Superb rib gauge"],
        cons: ["~15% pricier landed", "Longer lead time", "Only one round so far"],
        rounds: [
          { round: 1, dateSent: "2026-05-28", dateReceived: "2026-06-16", photos: 4, revisionNotes: "Beautiful loopback and rib; body a touch boxy; embroidery slightly high.", changedVsPrevious: "Initial sample from approved techpack." },
        ],
      },
      {
        manufacturerId: "mf-coimbra",
        status: "Passed",
        rating: 3.5,
        notes: "Premium make but the most expensive with the longest lead — passed for this drop.",
        pros: ["Premium finishing", "EU-made, easy logistics"],
        cons: ["Most expensive by far", "Longest lead", "High per-unit shipping"],
        rounds: [
          { round: 1, dateSent: "2026-05-20", dateReceived: "2026-06-10", photos: 3, revisionNotes: "Clean construction; fabric heavier than spec; cost over target.", changedVsPrevious: "Initial sample from approved techpack." },
        ],
      },
    ],
    moq: 100,
    pricePerUnit: 28.5,
    bulkPrice: 22.0,
    quantityToOrder: 400,
    rounds: [
      {
        round: 1,
        dateSent: "2026-05-02",
        dateReceived: "2026-05-19",
        photos: 4,
        revisionNotes: "Body length 2cm short; hood too shallow; drawcord tips wrong metal.",
        changedVsPrevious: "Initial sample from approved techpack.",
      },
      {
        round: 2,
        dateSent: "2026-05-26",
        dateReceived: "2026-06-14",
        photos: 6,
        revisionNotes: "Length corrected; hood depth good; drawcord tips now antique nickel; awaiting final wash test.",
        changedVsPrevious: "+2cm body; deeper hood; antique-nickel tips; 420gsm loopback.",
      },
      {
        round: 3,
        dateSent: "2026-06-18",
        dateReceived: "2026-06-25",
        photos: 5,
        revisionNotes: "Wash test passed, ~3% shrinkage; cuff ribbing relaxed slightly; embroidery placement approved.",
        changedVsPrevious: "Pre-shrunk body; tighter cuff rib; locked embroidery coordinates.",
      },
    ],
    files: [
      { id: "f1", name: "Reliquary-Hoodie-TP-v3.pdf", kind: "Techpack", size: "3.2 MB" },
      { id: "f2", name: "round2-front.jpg", kind: "Image", size: "1.1 MB" },
      { id: "f3", name: "graded-pattern.dxf", kind: "Pattern", size: "740 KB" },
    ],
    activity: [
      A("a1", "Mara Lindqvist", "moved to Sample In Review", "2026-06-14"),
      A("a2", "Hangzhou Silk Road", "delivered Round 2 sample", "2026-06-14"),
      A("a3", "Grisha Obolenskiy", "approved 420gsm loopback", "2026-05-22"),
    ],
  },
  {
    id: "p-saltwater-tee",
    name: "Saltwater Boxy Tee",
    type: "T-Shirt",
    collection: "SS25 — Saltwater",
    drop: "Drop 01 · Mar 2026",
    priority: "High",
    assigneeId: "m-devon",
    manufacturerId: "mf-porto",
    status: "Ready to Drop",
    seed: "tee-saltwater",
    statusSince: "2026-03-14",
    retailPrice: 45,
    image: "/products/tee.webp",
    candidates: [
      {
        manufacturerId: "mf-porto",
        status: "Awarded",
        rating: 4.5,
        notes: "Best hand-feel, GOTS-certified cotton. Awarded production.",
        pros: ["Best hand-feel", "GOTS-certified organic cotton", "Reliable QC"],
        cons: ["Higher unit cost", "Smaller monthly capacity"],
        rounds: [
          { round: 1, dateSent: "2026-02-10", dateReceived: "2026-02-24", photos: 3, revisionNotes: "Neck rib slightly loose.", changedVsPrevious: "Initial sample." },
          { round: 2, dateSent: "2026-03-01", dateReceived: "2026-03-12", photos: 4, revisionNotes: "Approved for production.", changedVsPrevious: "Tighter neck rib, pre-shrunk body." },
        ],
      },
      {
        manufacturerId: "mf-hangzhou",
        status: "Passed",
        rating: 3.5,
        notes: "~20% cheaper but fabric read thinner than spec; neck rib inconsistent.",
        pros: ["~20% cheaper", "Fast lead time", "High capacity"],
        cons: ["Fabric thinner than spec", "Neck rib inconsistent"],
        rounds: [
          { round: 1, dateSent: "2026-02-12", dateReceived: "2026-02-27", photos: 2, revisionNotes: "Fabric too light vs. spec.", changedVsPrevious: "Initial sample." },
        ],
      },
    ],
    moq: 150,
    pricePerUnit: 9.8,
    bulkPrice: 7.2,
    quantityToOrder: 600,
    rounds: [
      {
        round: 1,
        dateSent: "2026-02-10",
        dateReceived: "2026-02-24",
        photos: 3,
        revisionNotes: "Neck rib slightly loose.",
        changedVsPrevious: "Initial sample.",
      },
      {
        round: 2,
        dateSent: "2026-03-01",
        dateReceived: "2026-03-12",
        photos: 4,
        revisionNotes: "Approved for production.",
        changedVsPrevious: "Tighter neck rib, pre-shrunk body.",
      },
    ],
    files: [
      { id: "f1", name: "Saltwater-Tee-TP-final.pdf", kind: "Techpack", size: "2.0 MB" },
      { id: "f2", name: "color-standard.aco", kind: "Spec", size: "12 KB" },
    ],
    activity: [
      A("a1", "Devon Reyes", "moved to Ready to Drop", "2026-03-14"),
      A("a2", "Têxtil Porto", "confirmed bulk capacity", "2026-03-13"),
    ],
  },
  {
    id: "p-ember-scarf",
    name: "Ember Chain-Stitch Scarf",
    type: "Scarf",
    collection: "Capsule 01 — Ember",
    drop: "Capsule · Nov 2026",
    priority: "Medium",
    assigneeId: "m-yuki",
    manufacturerId: "mf-jaipur",
    status: "Revision Requested",
    seed: "scarf-ember",
    statusSince: "2026-06-20",
    retailPrice: 65,
    image: "/products/scarf.webp",
    moq: 80,
    pricePerUnit: 14.0,
    bulkPrice: 10.5,
    quantityToOrder: 200,
    rounds: [
      {
        round: 1,
        dateSent: "2026-06-01",
        dateReceived: "2026-06-19",
        photos: 5,
        revisionNotes: "Motif scale too large; thread color one shade too warm.",
        changedVsPrevious: "Initial hand-embroidered sample.",
      },
    ],
    files: [
      { id: "f1", name: "Ember-Scarf-artwork.ai", kind: "Image", size: "8.7 MB" },
      { id: "f2", name: "thread-pantones.pdf", kind: "Spec", size: "320 KB" },
    ],
    activity: [
      A("a1", "Yuki Tanaka", "requested Round 2 revisions", "2026-06-20"),
      A("a2", "Jaipur Craft House", "delivered Round 1 sample", "2026-06-19"),
    ],
  },
  {
    id: "p-reliquary-cargo",
    name: "Reliquary Utility Cargo",
    type: "Cargo Pants",
    collection: "AW25 — Reliquary",
    drop: "Drop 01 · Oct 2026",
    priority: "High",
    assigneeId: "m-mara",
    manufacturerId: "mf-coimbra",
    status: "Techpack In Review",
    seed: "cargo-reliquary",
    statusSince: "2026-06-21",
    retailPrice: 120,
    image: "/products/cargopants.webp",
    moq: 200,
    pricePerUnit: 32.0,
    bulkPrice: 25.5,
    quantityToOrder: 300,
    rounds: [],
    files: [
      { id: "f1", name: "Cargo-TP-v1.pdf", kind: "Techpack", size: "4.1 MB" },
    ],
    activity: [
      A("a1", "Mara Lindqvist", "submitted techpack for review", "2026-06-21"),
    ],
  },
  {
    id: "p-knit-sweater",
    name: "Lichen Heavy-Gauge Sweater",
    type: "Knit Sweater",
    collection: "AW25 — Reliquary",
    drop: "Drop 02 · Nov 2026",
    priority: "Medium",
    assigneeId: "m-yuki",
    manufacturerId: "mf-istanbul",
    status: "Sample Sent",
    seed: "sweater-lichen",
    statusSince: "2026-06-20",
    retailPrice: 130,
    image: "/products/sweater.webp",
    candidates: [
      {
        manufacturerId: "mf-istanbul",
        status: "Sampling",
        rating: 4,
        notes: "Heavy-gauge specialist; gauge and hand-feel are excellent, collar needs one more pass.",
        pros: ["Excellent gauge & hand-feel", "Heavy-gauge specialist"],
        cons: ["Collar needed a second pass", "Longer lead time"],
        rounds: [
          {
            round: 1,
            dateSent: "2026-05-30",
            dateReceived: "2026-06-15",
            photos: 5,
            revisionNotes: "Beautiful 7-gauge body; collar rib too loose; hem ~1.5cm long; tone slightly cool vs. swatch.",
            changedVsPrevious: "Initial 7-gauge sample.",
          },
          {
            round: 2,
            dateSent: "2026-06-20",
            dateReceived: null,
            photos: 0,
            revisionNotes: "In transit — corrected collar gauge and hem; warmer dye lot requested.",
            changedVsPrevious: "Tighter collar rib; -1.5cm hem; new dye lot.",
          },
        ],
      },
      {
        manufacturerId: "mf-hangzhou",
        status: "Quoted",
        notes: "Quote received — sample not ordered yet. Slightly cheaper, lighter gauge.",
        pros: ["Cheaper quote", "Fast lead time"],
        cons: ["Lighter gauge than spec", "No sample yet"],
        rounds: [],
      },
    ],
    moq: 120,
    pricePerUnit: 26.0,
    bulkPrice: 19.5,
    quantityToOrder: 250,
    rounds: [
      {
        round: 1,
        dateSent: "2026-06-20",
        dateReceived: null,
        photos: 0,
        revisionNotes: "In transit.",
        changedVsPrevious: "Initial 7-gauge sample.",
      },
    ],
    files: [{ id: "f1", name: "Sweater-TP-v2.pdf", kind: "Techpack", size: "2.6 MB" }],
    activity: [A("a1", "İstanbul Knitworks", "shipped Round 1 sample", "2026-06-20")],
  },
  {
    id: "p-bomber",
    name: "Nocturne Bomber Jacket",
    type: "Bomber Jacket",
    collection: "AW25 — Reliquary",
    drop: "Drop 02 · Nov 2026",
    priority: "Urgent",
    assigneeId: "m-devon",
    manufacturerId: "mf-hangzhou",
    status: "In Production",
    seed: "bomber-nocturne",
    statusSince: "2026-06-02",
    retailPrice: 240,
    image: "/products/bomberjacket.webp",
    moq: 100,
    pricePerUnit: 41.0,
    bulkPrice: 33.0,
    quantityToOrder: 220,
    rounds: [
      { round: 1, dateSent: "2026-04-02", dateReceived: "2026-04-20", photos: 5, revisionNotes: "Zipper pull replaced.", changedVsPrevious: "Initial." },
      { round: 2, dateSent: "2026-04-26", dateReceived: "2026-05-12", photos: 6, revisionNotes: "Approved.", changedVsPrevious: "Custom zip, lining swap." },
    ],
    files: [{ id: "f1", name: "Bomber-TP-final.pdf", kind: "Techpack", size: "5.0 MB" }],
    activity: [
      A("a1", "Devon Reyes", "moved to In Production", "2026-06-02"),
      A("a2", "Hangzhou Silk Road", "placed bulk order — 220 units", "2026-06-01"),
    ],
  },
  {
    id: "p-cap",
    name: "Saltwater 6-Panel Cap",
    type: "Cap",
    collection: "SS25 — Saltwater",
    drop: "Drop 01 · Mar 2026",
    priority: "Low",
    assigneeId: "m-priya",
    manufacturerId: "mf-hangzhou",
    status: "Released",
    seed: "cap-saltwater",
    statusSince: "2026-03-20",
    retailPrice: 38,
    image: "/products/hat.webp",
    moq: 144,
    pricePerUnit: 6.5,
    bulkPrice: 4.8,
    quantityToOrder: 500,
    rounds: [
      { round: 1, dateSent: "2026-01-10", dateReceived: "2026-01-24", photos: 3, revisionNotes: "Crown slightly tall; brim curve good; eyelet color off.", changedVsPrevious: "Initial 6-panel sample." },
      { round: 2, dateSent: "2026-01-28", dateReceived: "2026-02-09", photos: 4, revisionNotes: "Approved for production; crown lowered; antique-brass eyelets correct.", changedVsPrevious: "-0.5cm crown; brass eyelets; tighter sweatband." },
    ],
    files: [{ id: "f1", name: "Cap-TP.pdf", kind: "Techpack", size: "1.4 MB" }],
    activity: [A("a1", "Priya Nair", "marked Released", "2026-03-20")],
  },
  {
    id: "p-tote",
    name: "Core Canvas Tote",
    type: "Tote Bag",
    collection: "Core Staples",
    drop: "Always-on",
    priority: "Low",
    assigneeId: "m-priya",
    manufacturerId: "mf-jaipur",
    status: "Quality Check",
    seed: "tote-core",
    statusSince: "2026-06-16",
    retailPrice: 32,
    image: "/products/canvastote.webp",
    moq: 100,
    pricePerUnit: 5.2,
    bulkPrice: 3.9,
    quantityToOrder: 800,
    rounds: [
      { round: 1, dateSent: "2026-05-05", dateReceived: "2026-05-22", photos: 2, revisionNotes: "Handle stitch reinforced.", changedVsPrevious: "Initial." },
      { round: 2, dateSent: "2026-05-28", dateReceived: "2026-06-15", photos: 3, revisionNotes: "QC in progress.", changedVsPrevious: "Bartack handles, heavier canvas." },
    ],
    files: [{ id: "f1", name: "Tote-TP.pdf", kind: "Techpack", size: "900 KB" }],
    activity: [A("a1", "Priya Nair", "moved to Quality Check", "2026-06-16")],
  },
  {
    id: "p-denim",
    name: "Saltwater Cropped Denim Jacket",
    type: "Denim Jacket",
    collection: "SS25 — Saltwater",
    drop: "Drop 02 · Apr 2026",
    priority: "Medium",
    assigneeId: "m-devon",
    manufacturerId: null,
    status: "Concept",
    seed: "denim-saltwater",
    statusSince: "2026-06-22",
    retailPrice: 145,
    hasMockup: true,
    image: "/products/denimjacket.webp",
    moq: 150,
    pricePerUnit: 0,
    bulkPrice: 0,
    quantityToOrder: 0,
    rounds: [],
    files: [],
    activity: [A("a1", "Devon Reyes", "created concept", "2026-06-22")],
  },
  {
    id: "p-sneaker",
    name: "Reliquary Trail Sneaker",
    type: "Sneakers",
    collection: "AW25 — Reliquary",
    drop: "Drop 03 · Dec 2026",
    priority: "High",
    assigneeId: "m-mara",
    manufacturerId: "mf-coimbra",
    status: "Production Delay",
    seed: "sneaker-reliquary",
    statusSince: "2026-06-18",
    retailPrice: 180,
    image: "/products/sneakers.webp",
    moq: 300,
    pricePerUnit: 38.0,
    bulkPrice: 29.0,
    quantityToOrder: 400,
    rounds: [
      { round: 1, dateSent: "2026-03-15", dateReceived: "2026-04-05", photos: 4, revisionNotes: "Outsole tooling delayed.", changedVsPrevious: "Initial." },
      { round: 2, dateSent: "2026-04-12", dateReceived: "2026-05-01", photos: 5, revisionNotes: "Approved, but factory backlog.", changedVsPrevious: "New outsole, padded collar." },
    ],
    files: [{ id: "f1", name: "Sneaker-TP-v2.pdf", kind: "Techpack", size: "6.8 MB" }],
    activity: [
      A("a1", "Mara Lindqvist", "flagged Production Delay", "2026-06-18"),
      A("a2", "Coimbra Cut & Sew", "reported 3-week tooling backlog", "2026-06-17"),
    ],
  },
  {
    id: "p-onhold",
    name: "Experimental Liquid-Print Vest",
    type: "Bomber Jacket",
    collection: "Capsule 01 — Ember",
    drop: "TBD",
    priority: "Low",
    assigneeId: "m-yuki",
    manufacturerId: null,
    status: "On Hold",
    seed: "vest-liquid",
    statusSince: "2026-05-30",
    retailPrice: 160,
    hasMockup: true,
    image: "/products/vest.webp",
    moq: 50,
    pricePerUnit: 0,
    bulkPrice: 0,
    quantityToOrder: 0,
    rounds: [],
    files: [],
    activity: [A("a1", "Yuki Tanaka", "put on hold — print tech not ready", "2026-05-30")],
  },
];

export function product(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id);
}

// ── Assets ───────────────────────────────────────────────────
export const ASSETS: Asset[] = [
  { id: "as-logo-primary", name: "Olivine Primary Wordmark", category: "Graphics", fileType: "SVG", collection: "Core Staples", productType: "Brand", season: "Core", size: "24 KB", updated: "2026-06-01", seed: "g-wordmark", src: "/file-assets/olivine-logo.svg" },
  { id: "as-motif-leaf", name: "Reliquary Leaf Motif", category: "Graphics", fileType: "AI", collection: "AW25 — Reliquary", productType: "Hoodie", season: "AW25", size: "3.1 MB", updated: "2026-05-20", seed: "g-leaf", src: "/file-assets/leafmotif.ai" },
  { id: "as-repeat-tide", name: "Saltwater Tide Repeat", category: "Graphics", fileType: "JPG", collection: "SS25 — Saltwater", productType: "Scarf", season: "SS25", size: "5.4 MB", updated: "2026-04-11", seed: "g-tide", src: "/file-assets/saltwaterpattern.jpg" },
  { id: "as-chain", name: "Chain-Stitch Embroidery", category: "Graphics", fileType: "AI", collection: "Capsule 01 — Ember", productType: "Scarf", season: "Resort 25", size: "2.2 MB", updated: "2026-06-09", seed: "g-chain", src: "/file-assets/chainstitchembroidery.ai" },

  { id: "as-zip", name: "Antique-Nickel Zipper", category: "Hardware", fileType: "OBJ", collection: "AW25 — Reliquary", productType: "Bomber Jacket", season: "AW25", size: "1.8 MB", updated: "2026-05-15", seed: "h-zip", src: "/file-assets/zipper.obj" },
  { id: "as-buckle", name: "Cast Utility Buckle", category: "Hardware", fileType: "STL", collection: "AW25 — Reliquary", productType: "Cargo Pants", season: "AW25", size: "2.4 MB", updated: "2026-05-18", seed: "h-buckle", src: "/file-assets/buckle.stl" },
  { id: "as-eyelet", name: "Brass Eyelet", category: "Hardware", fileType: "STL", collection: "Core Staples", productType: "Tote Bag", season: "Core", size: "640 KB", updated: "2026-03-30", seed: "h-eyelet", src: "/file-assets/eyelet.stl" },

  { id: "as-carelabel", name: "Woven Care Label", category: "Notions", fileType: "PDF", collection: "Core Staples", productType: "Brand", season: "Core", size: "210 KB", updated: "2026-02-12", seed: "n-care", src: "/file-assets/wovencarelabel.pdf" },
  { id: "as-wovenlabel", name: "Olivine Woven Tab", category: "Notions", fileType: "PDF", collection: "Core Staples", productType: "Brand", season: "Core", size: "180 KB", updated: "2026-02-12", seed: "n-tab", src: "/file-assets/woventag.pdf" },
  { id: "as-button", name: "Corozo Button — 4-Hole", category: "Notions", fileType: "JPG", collection: "AW25 — Reliquary", productType: "Knit Sweater", season: "AW25", size: "320 KB", updated: "2026-05-02", seed: "n-button", src: "/file-assets/corozobutton.jpg" },

  {
    id: "as-piece-hoodie",
    name: "Reliquary Hoodie — Piece",
    category: "Pieces",
    fileType: "Folder",
    collection: "AW25 — Reliquary",
    productType: "Hoodie",
    season: "AW25",
    size: "—",
    updated: "2026-06-14",
    seed: "hoodie-reliquary",
    subAssets: [
      { label: "Graphics", fileType: "AI" },
      { label: "Mockup", fileType: "PNG" },
      { label: "Notions", fileType: "PDF" },
      { label: "Pattern", fileType: "DXF" },
      { label: "Techpack", fileType: "PDF" },
    ],
  },
  {
    id: "as-piece-tee",
    name: "Saltwater Tee — Piece",
    category: "Pieces",
    fileType: "Folder",
    collection: "SS25 — Saltwater",
    productType: "T-Shirt",
    season: "SS25",
    size: "—",
    updated: "2026-03-12",
    seed: "tee-saltwater",
    subAssets: [
      { label: "Graphics", fileType: "AI" },
      { label: "Mockup", fileType: "PNG" },
      { label: "Notions", fileType: "PDF" },
      { label: "Pattern", fileType: "DXF" },
      { label: "Techpack", fileType: "PDF" },
    ],
  },

  { id: "as-tpl-techpack", name: "Techpack Template", category: "Templates", fileType: "PDF", collection: "Core Staples", productType: "Brand", season: "Core", size: "1.2 MB", updated: "2026-01-05", seed: "t-techpack", src: "/file-assets/techpacktemplate.pdf" },
  { id: "as-tpl-linesheet", name: "Line Sheet Template", category: "Templates", fileType: "INDD", collection: "Core Staples", productType: "Brand", season: "Core", size: "980 KB", updated: "2026-01-05", seed: "t-linesheet" },
  { id: "as-tpl-mockup", name: "Flat Mockup Kit", category: "Templates", fileType: "PSD", collection: "Core Staples", productType: "Brand", season: "Core", size: "44 MB", updated: "2026-02-20", seed: "t-mockup", src: "/file-assets/mockup.psd" },
];

export const GUIDES: Guide[] = [
  {
    id: "guide-care",
    title: "Care Label Guide",
    category: "SOP",
    updated: "2026-05-30",
    excerpt: "Approved care symbols, wording, and fiber-content rules per region.",
    body: [
      "All Olivine garments ship with a woven care label sewn into the left side seam, 8cm from the hem.",
      "Fiber content must be listed in descending order by weight, in both English and the destination-market language.",
      "Care symbols follow GINETEX. Default for cotton jersey: machine wash cold (30°), do not bleach, tumble dry low, warm iron, do not dry clean.",
    ],
  },
  {
    id: "guide-size",
    title: "Size Chart — Tops",
    category: "Reference",
    updated: "2026-04-18",
    excerpt: "Body and garment measurements for XS–XXL across tops.",
    body: [
      "Measurements are in centimeters, half-chest, garment-flat.",
      "Grade rules: 2cm chest per size XS–L, 2.5cm L–XXL. Body length grades 1.5cm per size.",
      "Boxy fits (e.g. Saltwater Tee) add +4cm ease across the chest vs. the regular block.",
    ],
  },
  {
    id: "guide-pack",
    title: "Packaging Spec",
    category: "SOP",
    updated: "2026-06-02",
    excerpt: "Polybag, hangtag, and shipping carton standards.",
    body: [
      "Each unit: recycled poly mailer, compostable where available, with a 50×80mm kraft hangtag tied with cotton string.",
      "Master carton: 60×40×40cm, max 12kg, double-wall, with SKU + quantity label on two adjacent faces.",
      "No printed tissue for Core Staples; capsule drops use a single branded sticker seal.",
    ],
  },
  {
    id: "guide-onboard",
    title: "Manufacturer Onboarding",
    category: "SOP",
    updated: "2026-03-22",
    excerpt: "What to collect before a factory's first sample round.",
    body: [
      "Collect: capabilities deck, MOQ by category, lead times, payment terms, sample cost, and at least one reference client.",
      "Always run a paid first sample before committing to bulk. Log every communication in the directory.",
      "Confirm compliance docs (e.g. GOTS, OEKO-TEX) and store them under the manufacturer's Files tab.",
    ],
  },
];

// ── Moodboard ────────────────────────────────────────────────
export const MOOD_CATEGORIES = [
  "All",
  "Color Story",
  "Silhouettes",
  "Textures",
  "Hardware",
  "Graphics",
  "Runway",
];

const MOOD_TAG_BANK: Record<string, string[]> = {
  "Color Story": ["rust", "moss green", "bone", "ink"],
  Silhouettes: ["boxy", "cropped", "oversized", "utility"],
  Textures: ["loopback", "ribbed knit", "washed canvas", "raw denim"],
  Hardware: ["chain", "antique nickel", "brass eyelet", "buckle"],
  Graphics: ["chain embroidery", "tide print", "leaf motif", "wordmark"],
  Runway: ["AW25", "draped", "layered", "monochrome"],
};

/** Real moodboard photos dropped into /public/moodboard. */
export const MOODBOARD_PHOTOS: string[] = [
  "/moodboard/001263D7-897F-4CED-9984-4E3787C555DE_1_105_c.jpeg",
  "/moodboard/014FA8A9-FC13-4DB6-89FB-67E4F2726358_1_105_c.jpeg",
  "/moodboard/040F73D7-7321-49DE-B074-95C4C2F6CA3F_1_105_c.jpeg",
  "/moodboard/2D3E5A27-F623-49CA-ADB1-6072E7042DD7_1_105_c.jpeg",
  "/moodboard/438189E8-F3FD-44B5-A7AB-354F21D0C045_1_105_c.jpeg",
  "/moodboard/5E9A45F1-26D9-46CD-8C14-6D9E764170C8_1_105_c.jpeg",
  "/moodboard/68CF33A5-7EAB-4D14-B871-F46D49F8778D_1_105_c.jpeg",
  "/moodboard/749F618C-FBB6-48FC-96A4-C19C16E962D5_1_105_c.jpeg",
  "/moodboard/74D09DFE-9E2E-4838-8AF1-B8119BEE56D2_1_105_c.jpeg",
  "/moodboard/770F9DD3-C57B-471C-8D08-DFF423400884_1_105_c.jpeg",
  "/moodboard/7AA2CD30-6925-47DE-9422-6B963CACE61C_4_5005_c.jpeg",
  "/moodboard/82AF1182-600A-4978-8C0F-E0D2B24CA9F1_1_105_c.jpeg",
  "/moodboard/83B787C1-EA3A-4FE4-878E-3BA72437166C_4_5005_c.jpeg",
  "/moodboard/A2C28C15-AB04-4EEC-B7DC-BBB4E610C7C4_1_105_c.jpeg",
  "/moodboard/BC799090-7005-4ED0-945D-21CEC2BB8936_1_105_c.jpeg",
  "/moodboard/C04A5600-2708-4BB8-A8BE-3B8E7FB0D484_1_105_c.jpeg",
  "/moodboard/C51D4E7A-2A53-4D6C-8E51-FD06D103289A_1_105_c.jpeg",
  "/moodboard/CA9FD6AE-666A-4BD1-A0D9-EB03BC824167_1_105_c.jpeg",
  "/moodboard/D696115E-7898-4396-BF5F-81FC65F9A00F_1_105_c.jpeg",
  "/moodboard/D8605F3C-8806-4ED0-BDB7-F3989F27BC34_1_105_c.jpeg",
  "/moodboard/E1601048-4AA2-4E1D-B56A-4E3CA18153BD_1_105_c.jpeg",
  "/moodboard/E42F536A-12BF-4E08-BBD0-85D5CA83A6E2_4_5005_c.jpeg",
  "/moodboard/E9BB5030-EB63-46A1-A2E7-9A7AB2929FED_4_5005_c.jpeg",
  "/moodboard/F4DE248E-9AD5-4A74-B87E-DF03C42D1EEC_1_105_c.jpeg",
  "/moodboard/FA5061CE-5932-47B9-A34A-BAFF386564F7_1_105_c.jpeg",
];

export const MOOD_IMAGES: MoodImage[] = MOODBOARD_PHOTOS.map((src, i) => {
  const cats = MOOD_CATEGORIES.slice(1);
  const category = cats[i % cats.length];
  const bank = MOOD_TAG_BANK[category];
  return {
    id: `mood-${i}`,
    seed: `mood-${category}-${i}`,
    src,
    category,
    tags: [bank[i % bank.length], bank[(i + 1) % bank.length]],
    ratio: [0.75, 1, 1.25, 1.4][i % 4],
  };
});

// ── Tasks ────────────────────────────────────────────────────
export const TASK_STATUSES = [
  "New Request",
  "In Progress",
  "In Review",
  "In Progress After Revision",
  "Done",
  "On Hold",
] as const;

export const TASKS: Task[] = [
  { id: "t1", name: "Finalize Reliquary hoodie techpack v3", status: "In Review", priority: "Urgent", assigneeId: "m-mara", dueDate: "2026-06-27", files: 2, tag: "Techpack" },
  { id: "t2", name: "Shoot Saltwater tee for line sheet", status: "In Progress", priority: "High", assigneeId: "m-devon", dueDate: "2026-06-30", files: 0, tag: "Production" },
  { id: "t3", name: "Source recycled poly mailers", status: "New Request", priority: "Medium", assigneeId: "m-priya", dueDate: "2026-07-04", files: 1, tag: "Packaging" },
  { id: "t4", name: "Revise Ember scarf motif scale", status: "In Progress After Revision", priority: "Medium", assigneeId: "m-yuki", dueDate: "2026-06-28", files: 3, tag: "Design" },
  { id: "t5", name: "Approve bomber bulk PO", status: "Done", priority: "High", assigneeId: "m-sasha", dueDate: "2026-06-01", files: 1, tag: "Production" },
  { id: "t6", name: "Negotiate İstanbul sweater pricing", status: "In Progress", priority: "Medium", assigneeId: "m-mara", dueDate: "2026-07-02", files: 0, tag: "Sourcing" },
  { id: "t7", name: "Chase Coimbra on sneaker tooling", status: "On Hold", priority: "High", assigneeId: "m-mara", dueDate: "2026-07-08", files: 0, tag: "Sourcing" },
  { id: "t8", name: "Build AW25 line sheet draft", status: "New Request", priority: "Low", assigneeId: "m-devon", dueDate: "2026-07-12", files: 0, tag: "Marketing" },
  { id: "t9", name: "QC checklist for Core tote", status: "In Review", priority: "Medium", assigneeId: "m-priya", dueDate: "2026-06-26", files: 1, tag: "QC" },
  { id: "t10", name: "Update size chart for boxy fits", status: "Done", priority: "Low", assigneeId: "m-yuki", dueDate: "2026-06-10", files: 1, tag: "Docs" },
  { id: "t11", name: "Order corozo button samples", status: "In Progress", priority: "Low", assigneeId: "m-yuki", dueDate: "2026-07-01", files: 0, tag: "Sourcing" },
];

// ── Dashboard helpers ────────────────────────────────────────
export function productsByStatusTrack() {
  const counts: Record<Track, number> = {
    Development: 0,
    "Sample Rounds": 0,
    Production: 0,
    "Dead ends": 0,
  };
  for (const p of PRODUCTS) {
    const t = TRACKS.find((tr) => tr.statuses.includes(p.status));
    if (t) counts[t.track]++;
  }
  return counts;
}

export interface ActivityItem {
  id: string;
  who: string;
  action: string;
  at: string;
  context: string;
}

export const RECENT_ACTIVITY: ActivityItem[] = [
  { id: "ra1", who: "Mara Lindqvist", action: "moved Reliquary Hoodie to Sample In Review", at: "2h ago", context: "Sample Tracker" },
  { id: "ra2", who: "Yuki Tanaka", action: "requested Round 2 on Ember Scarf", at: "5h ago", context: "Sample Tracker" },
  { id: "ra3", who: "Devon Reyes", action: "uploaded 6 references to Moodboard", at: "Yesterday", context: "Moodboard" },
  { id: "ra4", who: "Priya Nair", action: "started QC on Core Canvas Tote", at: "Yesterday", context: "Sample Tracker" },
  { id: "ra5", who: "Grisha Obolenskiy", action: "approved bomber bulk PO — 220 units", at: "3 days ago", context: "Tasks" },
];

export interface Deadline {
  id: string;
  label: string;
  date: string;
  daysOut: number;
  tone: "danger" | "warn" | "default";
}

export const UPCOMING_DEADLINES: Deadline[] = [
  { id: "d1", label: "Reliquary hoodie techpack v3", date: "Jun 27", daysOut: 2, tone: "danger" },
  { id: "d2", label: "Core tote QC sign-off", date: "Jun 26", daysOut: 1, tone: "danger" },
  { id: "d3", label: "Ember scarf Round 2 revisions", date: "Jun 28", daysOut: 3, tone: "warn" },
  { id: "d4", label: "Saltwater tee shoot", date: "Jun 30", daysOut: 5, tone: "warn" },
  { id: "d5", label: "İstanbul sweater pricing", date: "Jul 02", daysOut: 7, tone: "default" },
];

// Shopify placeholder stats
export const SHOPIFY_STATS = {
  revenue30d: 48230,
  revenueDelta: 12.4,
  orders30d: 612,
  ordersDelta: 8.1,
  aov: 78.8,
  aovDelta: 3.2,
  topProducts: [
    { name: "Saltwater Boxy Tee", units: 184, revenue: 8832, image: "/products/tee.webp" },
    { name: "Saltwater 6-Panel Cap", units: 142, revenue: 4970, image: "/products/hat.webp" },
    { name: "Core Canvas Tote", units: 121, revenue: 3025, image: "/products/canvastote.webp" },
    { name: "Reliquary Hoodie (pre-order)", units: 88, revenue: 7920, image: "/products/hoodie.webp" },
  ],
  inventoryAlerts: [
    { name: "Saltwater Boxy Tee — M", level: "Low", units: 12 },
    { name: "Saltwater 6-Panel Cap — OS", level: "Critical", units: 3 },
    { name: "Core Canvas Tote — OS", level: "Low", units: 18 },
  ],
};
