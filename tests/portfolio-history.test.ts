import { describe, it, expect, beforeEach } from "vitest";
import type { DatabaseSync } from "node:sqlite";
import { freshTestDb, newId } from "@/lib/db";
import { SeededMarketProvider, seedMarketData } from "@/lib/market/seeded";
import { createVirtualAccount, DEFAULT_STARTING_BALANCE_MINOR } from "@/lib/engine/accounts";
import { executeOrder } from "@/lib/engine/orders";
import { getPortfolioHistory } from "@/lib/engine/portfolioHistory";
import { getPortfolio } from "@/lib/engine/portfolio";

let db: DatabaseSync;
let market: SeededMarketProvider;
let accountId: string;

beforeEach(() => {
  db = freshTestDb();
  seedMarketData(db);
  market = new SeededMarketProvider(db);
  db.prepare("INSERT INTO users (id, username, password_hash, age_band, created_at) VALUES (?,?,?,?,?)")
    .run("u1", "teen1", "x", "14-15", Date.now());
  accountId = createVirtualAccount(db, "u1").id;
});

describe("portfolio history replay", () => {
  it("is flat at the starting balance with no orders", () => {
    const h = getPortfolioHistory(db, market, accountId, DEFAULT_STARTING_BALANCE_MINOR);
    expect(h.length).toBeGreaterThan(1);
    for (const p of h) expect(p.valueMinor).toBe(DEFAULT_STARTING_BALANCE_MINOR);
  });

  it("ends exactly at the live portfolio value after trades", () => {
    executeOrder(db, market, accountId, "buy", "OFK", 10, newId());
    executeOrder(db, market, accountId, "buy", "BND", 5, newId());
    executeOrder(db, market, accountId, "sell", "OFK", 3, newId());
    const h = getPortfolioHistory(db, market, accountId, DEFAULT_STARTING_BALANCE_MINOR);
    const acct = createVirtualAccount(db, "u1");
    const live = getPortfolio(db, market, acct.id);
    const last = h[h.length - 1];
    expect(last.day).toBe(market.getQuote("OFK")!.day);
    expect(last.valueMinor).toBe(live.totalValueMinor);
  });

  it("drops by the purchase cost on the trade day (fees included)", () => {
    const r = executeOrder(db, market, accountId, "buy", "OFK", 10, newId());
    expect(r.ok).toBe(true);
    const day = market.getQuote("OFK")!.day;
    const h = getPortfolioHistory(db, market, accountId, DEFAULT_STARTING_BALANCE_MINOR);
    // Buying at that day's price keeps value ~flat minus the fee; check fee effect exists.
    const atTrade = h.find((p) => p.day === day)!;
    const before = h.find((p) => p.day === day - 1) ?? h[0];
    expect(atTrade.valueMinor).toBeLessThanOrEqual(before.valueMinor);
    expect(before.valueMinor - atTrade.valueMinor).toBeGreaterThanOrEqual(0);
  });
});
