/** Shared domain types for the Diorama prototype (mock data, no backend). */

export type Role = "Owner" | "Admin" | "Editor" | "Viewer";

export interface Member {
  id: string;
  name: string;
  email: string;
  role: Role;
  /** Optional profile photo; falls back to a colored initial when absent. */
  avatar?: string;
}

export interface Workspace {
  id: string;
  name: string;
  handle: string;
  /** Path to an SVG logo in /public, or undefined to render a monogram. */
  logo?: string;
  plan: string;
}

export type Priority = "Low" | "Medium" | "High" | "Urgent";

/** Sample-tracker status. Grouped into tracks for the swimlane board. */
export type SampleStatus =
  // Development
  | "Concept"
  | "Techpack In Progress"
  | "Techpack In Review"
  | "Ready for Quote"
  | "Quote Received"
  | "Ready for Sampling"
  // Sample Rounds
  | "Sample Sent"
  | "Sample In Review"
  | "Revision Requested"
  // Production
  | "Bulk Order Placed"
  | "In Production"
  | "Production Delay"
  | "Quality Check"
  | "Ready to Drop"
  | "Released"
  // Dead ends
  | "On Hold"
  | "Cancelled";

export type Track = "Development" | "Sample Rounds" | "Production" | "Dead ends";

export interface SampleRound {
  round: number;
  dateSent: string | null;
  dateReceived: string | null;
  photos: number;
  revisionNotes: string;
  changedVsPrevious: string;
}

export type CandidateStatus = "Quoted" | "Sampling" | "Awarded" | "Passed";

/** One factory being sourced for a product, with its own sample rounds. */
export interface SampleCandidate {
  manufacturerId: string;
  status: CandidateStatus;
  rating?: number; // 0–5, the team's sample quality rating
  notes?: string;
  /** What this factory did well / poorly on the sample (powers the AI verdict). */
  pros?: string[];
  cons?: string[];
  rounds: SampleRound[];
}

export interface ActivityEntry {
  id: string;
  who: string;
  action: string;
  at: string;
}

export interface FileRef {
  id: string;
  name: string;
  kind: "Techpack" | "Image" | "Pattern" | "3D" | "Doc" | "Spec";
  size: string;
}

export interface Product {
  id: string;
  name: string;
  type: string;
  collection: string;
  drop: string;
  priority: Priority;
  assigneeId: string;
  manufacturerId: string | null;
  status: SampleStatus;
  seed: string;
  /** Real product image in /public/products (falls back to generative thumb). */
  image?: string;
  moq: number;
  pricePerUnit: number;
  bulkPrice: number;
  quantityToOrder: number;
  /** Target retail (sell) price — used for margin/costing. */
  retailPrice?: number;
  /** ISO date the product entered its current status (for time-in-stage). */
  statusSince?: string;
  /** Factories being sourced for this product (multi-factory sampling). */
  candidates?: SampleCandidate[];
  /** Whether a digital mockup exists yet (concepts without one show no image). */
  hasMockup?: boolean;
  rounds: SampleRound[];
  files: FileRef[];
  activity: ActivityEntry[];
}

export type ManufacturerStatus =
  | "Active"
  | "Sampling"
  | "Inactive"
  | "Blacklisted";

export interface CommLogEntry {
  id: string;
  date: string;
  note: string;
}

/** What a factory can make, with per-product terms (MOQ/cost/lead vary per item). */
export interface Capability {
  product: string;
  moq: number;
  sampleCost: string;
  sampleLeadDays: number;
  bulkLeadDays: number;
  /** Avg bulk unit price (every design differs, so it's an average). */
  avgUnitPrice: string;
  /** Estimated shipping added to a bulk quote. */
  shippingEst: string;
}

export interface Manufacturer {
  id: string;
  name: string;
  country: string;
  flag: string;
  status: ManufacturerStatus;
  /** Specializations / techniques they're known for. */
  categories: string[];
  /** Per-product capabilities — the real, granular terms. */
  capabilities: Capability[];
  contactPerson: string;
  whatsapp: string;
  email: string;
  website: string;
  paymentTerms: string;
  rating: number;
  seed: string;
  commLog: CommLogEntry[];
  files: FileRef[];
  /** Relationship + reliability depth (optional). */
  city?: string;
  since?: string;
  onTimePct?: number;
  responseTime?: string;
  capacity?: string;
  certifications?: string[];
}

export type AssetCategory =
  | "Graphics"
  | "Hardware"
  | "Notions"
  | "Pieces"
  | "Templates"
  | "Guides";

export interface Asset {
  id: string;
  name: string;
  category: AssetCategory;
  fileType: string;
  collection: string;
  productType: string;
  season: string;
  size: string;
  updated: string;
  seed: string;
  /** Path to a real file in /public for preview + download. */
  src?: string;
  /** For Pieces: nested sub-assets. */
  subAssets?: { label: string; fileType: string }[];
}

export interface Guide {
  id: string;
  title: string;
  category: string;
  updated: string;
  excerpt: string;
  body: string[];
}

export interface MoodImage {
  id: string;
  seed: string;
  src: string;
  category: string;
  tags: string[];
  ratio: number;
}

export type TaskStatus =
  | "New Request"
  | "In Progress"
  | "In Review"
  | "In Progress After Revision"
  | "Done"
  | "On Hold";

export interface Task {
  id: string;
  name: string;
  status: TaskStatus;
  priority: Priority;
  assigneeId: string;
  dueDate: string;
  files: number;
  tag: string;
}
