import type { Product } from "@/lib/mock/types";
import { manufacturer } from "@/lib/mock/data";

export interface CostingInputs {
  freight: number; // per unit
  dutiesPct: number;
  retail: number;
}

export interface Costing extends CostingInputs {
  production: number; // per-unit production (bulk) cost
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
  return {
    freight: defaultFreight(p),
    dutiesPct: 12,
    retail: p.retailPrice ?? Math.round(p.bulkPrice * 4),
  };
}

export function computeCosting(p: Product, i: CostingInputs): Costing {
  const production = p.bulkPrice;
  const duties = (production * i.dutiesPct) / 100;
  const landed = production + i.freight + duties;
  const marginAmt = i.retail - landed;
  const marginPct = i.retail > 0 ? (marginAmt / i.retail) * 100 : 0;
  const markup = landed > 0 ? i.retail / landed : 0;
  return { ...i, production, duties, landed, marginAmt, marginPct, markup };
}

/** Convenience for tables — margin % at default assumptions. */
export function quickMargin(p: Product): Costing {
  return computeCosting(p, defaultInputs(p));
}
