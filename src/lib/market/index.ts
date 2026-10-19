import { getDb } from "@/lib/db";
import { SeededMarketProvider, seedMarketData } from "./seeded";
import type { MarketDataProvider } from "./types";

let provider: MarketDataProvider | null = null;

/** Server-side provider singleton. Seeded educational data only until a licensed provider is integrated. */
export function getMarketProvider(): MarketDataProvider {
  if (!provider) {
    const db = getDb();
    seedMarketData(db);
    provider = new SeededMarketProvider(db);
  }
  return provider;
}

export type { MarketDataProvider } from "./types";
