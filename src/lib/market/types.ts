import type { MinorUnits } from "@/lib/money";

export type AssetKind = "stock" | "index_fund" | "bond_fund";

export interface Asset {
  symbol: string;
  nameHe: string;
  kind: AssetKind;
  sector: string | null;
  descriptionHe: string;
  /** All MVP assets are fictional educational instruments. */
  fictional: true;
}

export interface PriceQuote {
  symbol: string;
  priceMinor: MinorUnits;
  /** Simulation day index; every quote carries an explicit timestamp/day. */
  day: number;
  source: "SIMULATED_EDUCATIONAL";
  asOf: string; // human-readable label, never "live"
}

export interface PricePoint {
  day: number;
  priceMinor: MinorUnits;
}

export interface MarketDataProvider {
  readonly sourceLabel: string;
  listAssets(): Asset[];
  getAsset(symbol: string): Asset | null;
  /** Current simulated quote, or null when data is unavailable (never fabricated). */
  getQuote(symbol: string): PriceQuote | null;
  getHistory(symbol: string): PricePoint[];
  currentDay(): number;
}
