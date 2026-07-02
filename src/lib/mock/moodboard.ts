import { MOODBOARD_PHOTOS } from "./data";

// Are.na-style "blocks": a board holds mixed media, not just images.
export type BlockKind = "image" | "video" | "link" | "file" | "note";

export interface Block {
  id: string;
  kind: BlockKind;
  src?: string; // image / video poster / link OG image / file thumb
  url?: string; // link / video / file source
  title?: string; // link / file / video label
  note?: string; // note text
  fileType?: string; // file
  ratio: number; // masonry aspect (h/w)
  addedAt: string;
}

export interface Board {
  id: string;
  name: string;
  parentId: string | null;
  blockIds: string[];
  createdAt: string;
  updatedAt: string;
  contributors: string[];
  visibility: "Private" | "Team" | "Public";
  linkedCollection?: string;
  /** Cross-link: this board is a reference set for a specific product. */
  linkedProductId?: string;
  /** Natural-language AI-sort rule for filing imports into this board. */
  rule?: string;
}

const R = [0.72, 1, 1.25, 1.4];

// Image blocks from the real /public/moodboard photos.
const imageBlocks: Block[] = MOODBOARD_PHOTOS.map((src, i) => ({
  id: `bk-img-${i}`,
  kind: "image",
  src,
  ratio: R[i % 4],
  addedAt: "2026-06-14",
}));

// A few non-image blocks so the board feels like Are.na, not a photo grid.
const otherBlocks: Block[] = [
  {
    id: "bk-vid-1",
    kind: "video",
    src: MOODBOARD_PHOTOS[3],
    url: "https://www.youtube.com/watch?v=aw25",
    title: "AW25 runway — full walk",
    ratio: 0.56,
    addedAt: "2026-06-10",
  },
  {
    id: "bk-link-1",
    kind: "link",
    src: MOODBOARD_PHOTOS[7],
    url: "https://www.ssense.com/en-us/women/outerwear",
    title: "SSENSE — utility outerwear edit",
    ratio: 1,
    addedAt: "2026-06-08",
  },
  {
    id: "bk-link-2",
    kind: "link",
    src: MOODBOARD_PHOTOS[11],
    url: "https://www.are.na/olivine/rust-palette",
    title: "Are.na — rust palette channel",
    ratio: 0.8,
    addedAt: "2026-06-05",
  },
  {
    id: "bk-note-1",
    kind: "note",
    note: "Palette holds at rust / moss / bone / ink. Keep everything earthy — no true blacks, warm the shadows.",
    ratio: 0.7,
    addedAt: "2026-06-04",
  },
  {
    id: "bk-file-1",
    kind: "file",
    fileType: "PDF",
    title: "WGSN — Resort 26 trend report.pdf",
    ratio: 1.3,
    addedAt: "2026-06-02",
  },
];

export const BLOCKS: Block[] = [...imageBlocks, ...otherBlocks];

// Boards (channels). Some images intentionally appear in multiple boards
// (backlinks), and a couple of boards are nested inside another.
export const BOARDS: Board[] = [
  {
    id: "bd-color",
    name: "Color Story",
    parentId: null,
    blockIds: ["bk-img-0", "bk-img-6", "bk-img-12", "bk-img-18", "bk-note-1", "bk-link-2"],
    createdAt: "2026-03-02",
    updatedAt: "2026-06-14",
    contributors: ["Grisha Obolenskiy", "Mara Vidal"],
    visibility: "Team",
    linkedCollection: "AW25 — Reliquary",
    linkedProductId: "p-reliquary-hoodie",
    rule: "Swatches, dyed fabric, and anything about palette or color.",
  },
  {
    id: "bd-rust",
    name: "Rust & Bone",
    parentId: "bd-color",
    blockIds: ["bk-img-0", "bk-img-3", "bk-img-9"],
    createdAt: "2026-04-11",
    updatedAt: "2026-06-12",
    contributors: ["Grisha Obolenskiy"],
    visibility: "Team",
    rule: "Rust, oxidized metal, bone, and off-white tones.",
  },
  {
    id: "bd-sil",
    name: "Silhouettes",
    parentId: null,
    blockIds: ["bk-img-1", "bk-img-7", "bk-img-13", "bk-img-19", "bk-vid-1"],
    createdAt: "2026-03-02",
    updatedAt: "2026-06-13",
    contributors: ["Grisha Obolenskiy", "Theo Lund"],
    visibility: "Team",
    linkedCollection: "AW25 — Reliquary",
    linkedProductId: "p-reliquary-hoodie",
    rule: "Full looks, garment shapes, boxy/oversized/utility cuts.",
  },
  {
    id: "bd-tex",
    name: "Textures",
    parentId: null,
    blockIds: ["bk-img-2", "bk-img-8", "bk-img-14", "bk-img-20", "bk-file-1"],
    createdAt: "2026-03-02",
    updatedAt: "2026-06-11",
    contributors: ["Mara Vidal"],
    visibility: "Team",
    rule: "Fabric close-ups, knits, weaves, washes, surface detail.",
  },
  {
    id: "bd-hard",
    name: "Hardware",
    parentId: null,
    blockIds: ["bk-img-4", "bk-img-10", "bk-img-16", "bk-img-22"],
    createdAt: "2026-03-02",
    updatedAt: "2026-06-09",
    contributors: ["Theo Lund"],
    visibility: "Private",
    rule: "Zippers, buckles, eyelets, trims, metal finishes.",
  },
  {
    id: "bd-graph",
    name: "Graphics",
    parentId: null,
    blockIds: ["bk-img-5", "bk-img-11", "bk-img-17", "bk-img-23", "bk-link-1"],
    createdAt: "2026-03-02",
    updatedAt: "2026-06-07",
    contributors: ["Grisha Obolenskiy"],
    visibility: "Public",
    rule: "Prints, embroidery, logos, type, motifs.",
  },
  {
    id: "bd-runway",
    name: "Runway",
    parentId: null,
    blockIds: ["bk-img-15", "bk-img-21", "bk-vid-1", "bk-link-1"],
    createdAt: "2026-03-02",
    updatedAt: "2026-06-06",
    contributors: ["Grisha Obolenskiy", "Mara Vidal", "Theo Lund"],
    visibility: "Team",
    linkedProductId: "p-bomber",
    rule: "Runway, editorial, show footage, styled references.",
  },
];

export const blockById = (id: string) => BLOCKS.find((b) => b.id === id);
export const boardById = (boards: Board[], id: string) => boards.find((b) => b.id === id);
export const rootBoards = (boards: Board[]) => boards.filter((b) => b.parentId === null);
export const childBoards = (boards: Board[], parentId: string) =>
  boards.filter((b) => b.parentId === parentId);

/** Backlinks: which boards a block is filed in. */
export const boardsContaining = (boards: Board[], blockId: string) =>
  boards.filter((b) => b.blockIds.includes(blockId));

/** Moodboard folders linked to a product (surfaced in Product Status / Pieces). */
export const boardsForProduct = (productId: string): Board[] =>
  BOARDS.filter((b) => b.linkedProductId === productId);

/** Total items = direct blocks + immediate sub-boards. */
export const boardCount = (boards: Board[], b: Board) =>
  b.blockIds.length + childBoards(boards, b.id).length;

/** Path from root to a board, for breadcrumbs. */
export const boardPath = (boards: Board[], id: string): Board[] => {
  const path: Board[] = [];
  let cur = boardById(boards, id);
  while (cur) {
    path.unshift(cur);
    cur = cur.parentId ? boardById(boards, cur.parentId) : undefined;
  }
  return path;
};
