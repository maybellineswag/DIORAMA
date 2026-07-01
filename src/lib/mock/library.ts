import { ASSETS } from "./data";
import type { Asset } from "./types";

/** The fixed slots every garment Piece is scaffolded with. */
export const SLOTS = [
  "Graphic Assets",
  "Mockup",
  "Notions",
  "Pattern",
  "Tags",
  "Techpack",
] as const;
export type SlotKey = (typeof SLOTS)[number];

export interface Piece {
  id: string;
  name: string;
  seed: string;
  image?: string;
  collection: string;
  drop: string;
  productId?: string;
  /** Each slot references library asset ids (not copies). */
  slots: Record<SlotKey, string[]>;
}

/** The reusable "parts bin" — everything that isn't a Piece or a Guide. */
export const LIBRARY_ASSETS: Asset[] = ASSETS.filter(
  (a) => a.category !== "Pieces" && a.category !== "Guides",
);

export const LIBRARY_CATEGORIES = [
  "All",
  "Graphics",
  "Hardware",
  "Notions",
  "Templates",
] as const;

// Assets created at runtime (e.g. a mockup uploaded when making a new piece)
// so they resolve in slots and previews until a real backend exists.
const runtimeAssets: Asset[] = [];
export const registerAsset = (a: Asset) => {
  if (!runtimeAssets.some((x) => x.id === a.id)) runtimeAssets.push(a);
};

export const assetById = (id: string): Asset | undefined =>
  ASSETS.find((a) => a.id === id) ?? runtimeAssets.find((a) => a.id === id);

const emptySlots = (): Record<SlotKey, string[]> => ({
  "Graphic Assets": [],
  Mockup: [],
  Notions: [],
  Pattern: [],
  Tags: [],
  Techpack: [],
});

export const PIECES: Piece[] = [
  {
    id: "pc-hoodie",
    name: "Reliquary Heavyweight Hoodie",
    seed: "hoodie-reliquary",
    image: "/products/hoodie.webp",
    collection: "AW25 — Reliquary",
    drop: "Drop 01 · Oct 2026",
    productId: "p-reliquary-hoodie",
    slots: {
      ...emptySlots(),
      "Graphic Assets": ["as-motif-leaf", "as-logo-primary"],
      Mockup: ["as-tpl-mockup"],
      Notions: ["as-zip", "as-button", "as-eyelet"],
      Tags: ["as-wovenlabel", "as-carelabel"],
      Techpack: ["as-tpl-techpack"],
    },
  },
  {
    id: "pc-tee",
    name: "Saltwater Boxy Tee",
    seed: "tee-saltwater",
    image: "/products/tee.webp",
    collection: "SS25 — Saltwater",
    drop: "Drop 01 · Mar 2026",
    productId: "p-saltwater-tee",
    slots: {
      ...emptySlots(),
      "Graphic Assets": ["as-repeat-tide", "as-logo-primary"],
      Mockup: ["as-tpl-mockup"],
      Notions: ["as-wovenlabel"],
      Tags: ["as-carelabel"],
      Techpack: ["as-tpl-techpack"],
    },
  },
  {
    id: "pc-scarf",
    name: "Ember Chain-Stitch Scarf",
    seed: "scarf-ember",
    image: "/products/scarf.webp",
    collection: "Capsule 01 — Ember",
    drop: "Capsule · Nov 2026",
    productId: "p-ember-scarf",
    slots: {
      ...emptySlots(),
      "Graphic Assets": ["as-chain"],
      Tags: ["as-wovenlabel"],
      Techpack: ["as-tpl-techpack"],
    },
  },
  {
    id: "pc-bomber",
    name: "Nocturne Bomber Jacket",
    seed: "bomber-nocturne",
    image: "/products/bomberjacket.webp",
    collection: "AW25 — Reliquary",
    drop: "Drop 02 · Nov 2026",
    productId: "p-bomber",
    slots: {
      ...emptySlots(),
      "Graphic Assets": ["as-logo-primary"],
      Mockup: ["as-tpl-mockup"],
      Notions: ["as-zip", "as-eyelet"],
      Tags: ["as-wovenlabel", "as-carelabel"],
      Techpack: ["as-tpl-techpack"],
    },
  },
];

/** Are.na-style backlinks: which pieces reference a given asset. */
export const piecesUsing = (pieces: Piece[], assetId: string): Piece[] =>
  pieces.filter((p) =>
    Object.values(p.slots).some((ids) => ids.includes(assetId)),
  );
