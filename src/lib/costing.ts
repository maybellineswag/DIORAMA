import type { Product } from "@/lib/mock/types";
import { manufacturer } from "@/lib/mock/data";

export interface CostingInputs {
  production: number; // per-unit production (bulk) cost
  freight: number; // per unit
  dutiesPct: number;
  retail: number;
}

/** A factory's quote for a product's type: per-unit production + freight. */
export function manufacturerQuote(
  p: Product,
  mfId: string | null,
): { production: number; freight: number } | null {
  const mf = manufacturer(mfId);
  const cap = mf?.capabilities.find((c) => c.product === p.type);
  if (!cap) return null;
  const production = parseFloat(cap.avgUnitPrice.replace(/[^0-9.]/g, "")) || 0;
  const freight = parseFloat(cap.shippingEst.replace(/[^0-9.]/g, "")) || 0;
  return { production, freight };
}

/** Landed cost + margin from raw figures (used by the sourcing compare table). */
export function landed(production: number, freight: number, dutiesPct: number, retail: number) {
  const duties = (production * dutiesPct) / 100;
  const total = production + freight + duties;
  const marginAmt = retail - total;
  const marginPct = retail > 0 ? (marginAmt / retail) * 100 : 0;
  return { production, freight, duties, landed: total, marginAmt, marginPct };
}

export interface Costing extends CostingInputs {
  duties: number; // per unit
  landed: number; // total landed cost per unit
  marginAmt: number; // retail - landed
  marginPct: number; // 0–100
  markup: number; // retail / landed
}

/** Pull a sensible per-unit freight estimate from the assigned manufacturer. */
export function defaultFreight(p: Product): number {
  const mf = manufacturer(p.manufacturerId);
  const cap = mf?.capabilities.find((c) => c.product === p.type);
  if (cap) {
    const n = parseFloat(cap.shippingEst.replace(/[^0-9.]/g, ""));
    if (!Number.isNaN(n)) return n;
  }
  // Fallback: ~12% of production cost.
  return Math.round(p.bulkPrice * 0.12 * 100) / 100;
}

export function defaultInputs(p: Product): CostingInputs {
  // Prefer the assigned factory's live quote; fall back to the stored bulk price.
  const q = manufacturerQuote(p, p.manufacturerId);
  return {
    production: q?.production || p.bulkPrice,
    freight: q?.freight ?? defaultFreight(p),
    dutiesPct: 12,
    retail: p.retailPrice ?? Math.round(p.bulkPrice * 4),
  };
}

export function computeCosting(p: Product, i: CostingInputs): Costing {
  const duties = (i.production * i.dutiesPct) / 100;
  const total = i.production + i.freight + duties;
  const marginAmt = i.retail - total;
  const marginPct = i.retail > 0 ? (marginAmt / i.retail) * 100 : 0;
  const markup = total > 0 ? i.retail / total : 0;
  return { ...i, duties, landed: total, marginAmt, marginPct, markup };
}

/** Convenience for tables — margin % at default assumptions. */
export function quickMargin(p: Product): Costing {
  return computeCosting(p, defaultInputs(p));
}
