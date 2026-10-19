import type { Asset, MarketDataProvider, PricePoint, PriceQuote } from "./types";
import type { DatabaseSync } from "node:sqlite";

/**
 * Seeded educational market-data provider.
 * Every instrument is FICTIONAL and every price is SIMULATED for learning.
 * Deterministic: same seed -> same series, so lessons and tests are reproducible.
 * This provider never claims live data and never fabricates a price for a failed lookup.
 */

const DAYS = 180;

export const EDUCATIONAL_ASSETS: Asset[] = [
  { symbol: "OFK", nameHe: "אופק טכנולוגיות", kind: "stock", sector: "טכנולוגיה", fictional: true,
    descriptionHe: "חברת תוכנה בדויה לצורכי לימוד. מניה בודדת - תנודתיות גבוהה יחסית." },
  { symbol: "SPN", nameHe: "ספיר פארמה", kind: "stock", sector: "בריאות", fictional: true,
    descriptionHe: "חברת תרופות בדויה לצורכי לימוד. מניה בודדת בעלת תנודתיות בינונית." },
  { symbol: "GLB", nameHe: "גלובל סופר", kind: "stock", sector: "צריכה", fictional: true,
    descriptionHe: "רשת שיווק בדויה לצורכי לימוד. מניה בודדת בעלת תנודתיות נמוכה יחסית." },
  { symbol: "IDX100", nameHe: "קרן מדד 100 (בדויה)", kind: "index_fund", sector: "מדד רחב", fictional: true,
    descriptionHe: "קרן מדד רחבה בדויה המדגימה פיזור על פני חברות רבות. תנודתיות נמוכה יותר ממניה בודדת." },
  { symbol: "BND", nameHe: "קרן אג\"ח ממשלתית (בדויה)", kind: "bond_fund", sector: "אג\"ח", fictional: true,
    descriptionHe: "קרן אג\"ח בדויה לצורכי לימוד. תנודתיות נמוכה, מדגימה נכס לווינג." }
];

/** Deterministic PRNG (mulberry32) so every install sees the same educational series. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seedFor(symbol: string): number {
  let h = 2166136261;
  for (const c of symbol) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

interface SeriesSpec { start: number; driftPerDay: number; volatility: number; }

const SERIES_SPECS: Record<string, SeriesSpec> = {
  OFK:   { start: 4200, driftPerDay: 0.0016, volatility: 0.028 },
  SPN:   { start: 8600, driftPerDay: 0.0006, volatility: 0.016 },
  GLB:   { start: 3100, driftPerDay: 0.0004, volatility: 0.010 },
  IDX100:{ start: 5000, driftPerDay: 0.0009, volatility: 0.008 },
  BND:   { start: 10000, driftPerDay: 0.0002, volatility: 0.002 }
};

/** Build the deterministic simulated series for a symbol (integer minor units). */
export function buildSeries(symbol: string): PricePoint[] {
  const spec = SERIES_SPECS[symbol];
  if (!spec) return [];
  const rnd = mulberry32(seedFor(symbol));
  const points: PricePoint[] = [];
  let price = spec.start;
  for (let day = 0; day < DAYS; day++) {
    const shock = (rnd() * 2 - 1) * spec.volatility;
    price = Math.max(100, Math.round(price * (1 + spec.driftPerDay + shock)));
    points.push({ day, priceMinor: price });
  }
  return points;
}

export class SeededMarketProvider implements MarketDataProvider {
  readonly sourceLabel = "נתוני סימולציה חינוכיים (נכסים בדויים)";

  constructor(private db: DatabaseSync) {}

  listAssets(): Asset[] {
    return EDUCATIONAL_ASSETS;
  }

  getAsset(symbol: string): Asset | null {
    return EDUCATIONAL_ASSETS.find((a) => a.symbol === symbol) ?? null;
  }

  currentDay(): number {
    const row = this.db.prepare("SELECT MAX(day) AS d FROM market_prices").get() as { d: number | null };
    return row.d ?? DAYS - 1;
  }

  getQuote(symbol: string): PriceQuote | null {
    const row = this.db
      .prepare("SELECT day, price_minor AS priceMinor FROM market_prices WHERE symbol = ? ORDER BY day DESC LIMIT 1")
      .get(symbol) as { day: number; priceMinor: number } | undefined;
    if (!row) return null; // unavailable - never fabricated
    return { symbol, priceMinor: row.priceMinor, day: row.day, source: "SIMULATED_EDUCATIONAL", asOf: `יום סימולציה ${row.day}` };
  }

  getHistory(symbol: string): PricePoint[] {
    const rows = this.db
      .prepare("SELECT day, price_minor AS priceMinor FROM market_prices WHERE symbol = ? ORDER BY day ASC")
      .all(symbol) as unknown as PricePoint[];
    return rows;
  }
}

/** Idempotently seed assets and their simulated price history. */
export function seedMarketData(db: DatabaseSync): void {
  const count = (db.prepare("SELECT COUNT(*) AS c FROM market_prices").get() as { c: number }).c;
  if (count > 0) return;
  const insAsset = db.prepare(
    "INSERT INTO assets (symbol, name_he, kind, sector, description_he, fictional) VALUES (?,?,?,?,?,1)"
  );
  const insPrice = db.prepare(
    "INSERT INTO market_prices (symbol, day, price_minor, source) VALUES (?,?,?, 'SIMULATED_EDUCATIONAL')"
  );
  db.exec("BEGIN");
  try {
    for (const a of EDUCATIONAL_ASSETS) {
      insAsset.run(a.symbol, a.nameHe, a.kind, a.sector, a.descriptionHe);
      for (const p of buildSeries(a.symbol)) insPrice.run(a.symbol, p.day, p.priceMinor);
    }
    db.exec("COMMIT");
  } catch (e) {
    db.exec("ROLLBACK");
    throw e;
  }
}
