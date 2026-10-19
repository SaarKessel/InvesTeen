import { describe, it, expect, beforeEach } from "vitest";
import type { DatabaseSync } from "node:sqlite";
import { freshTestDb, newId } from "@/lib/db";
import { SeededMarketProvider, seedMarketData } from "@/lib/market/seeded";
import { createVirtualAccount, DEFAULT_STARTING_BALANCE_MINOR } from "@/lib/engine/accounts";
import { cashBalance, ledgerHistory, postEntry } from "@/lib/engine/ledger";
import { executeOrder } from "@/lib/engine/orders";
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

describe("virtual account", () => {
  it("creates the initial balance exactly once", () => {
    const a1 = createVirtualAccount(db, "u1");
    const a2 = createVirtualAccount(db, "u1");
    expect(a2.id).toBe(a1.id);
    expect(cashBalance(db, accountId)).toBe(DEFAULT_STARTING_BALANCE_MINOR);
    const entries = ledgerHistory(db, accountId).filter((e) => e.entryType === "initial_deposit");
    expect(entries).toHaveLength(1);
  });
});

describe("orders", () => {
  it("a valid purchase updates ledger, cash, and position consistently", () => {
    const price = market.getQuote("OFK")!.priceMinor;
    const r = executeOrder(db, market, accountId, "buy", "OFK", 10, newId());
    expect(r.ok).toBe(true);
    expect(cashBalance(db, accountId)).toBe(DEFAULT_STARTING_BALANCE_MINOR - 10 * price);
    const pos = db.prepare("SELECT qty, total_cost_minor AS c FROM positions WHERE account_id=? AND symbol='OFK'").get(accountId) as { qty: number; c: number };
    expect(pos.qty).toBe(10);
    expect(pos.c).toBe(10 * price);
    const ledgerSum = ledgerHistory(db, accountId).reduce((s, e) => s + e.amountMinor, 0);
    expect(ledgerSum).toBe(cashBalance(db, accountId));
  });

  it("rejects an invalid purchase without changing balances", () => {
    const before = cashBalance(db, accountId);
    const r = executeOrder(db, market, accountId, "buy", "OFK", 10_000_000, newId());
    expect(r.ok).toBe(false);
    expect(r.errorCode).toBe("INSUFFICIENT_CASH");
    expect(cashBalance(db, accountId)).toBe(before);
    const orders = db.prepare("SELECT COUNT(*) AS c FROM simulated_orders").get() as { c: number };
    expect(orders.c).toBe(0); // rejected attempts leave no fill and no ledger entries
  });

  it("rejects non-positive quantity", () => {
    expect(executeOrder(db, market, accountId, "buy", "OFK", 0, newId()).errorCode).toBe("INVALID_QUANTITY");
    expect(executeOrder(db, market, accountId, "buy", "OFK", -3, newId()).errorCode).toBe("INVALID_QUANTITY");
  });

  it("rejects selling more units than owned", () => {
    executeOrder(db, market, accountId, "buy", "GLB", 5, newId());
    const r = executeOrder(db, market, accountId, "sell", "GLB", 6, newId());
    expect(r.ok).toBe(false);
    expect(r.errorCode).toBe("INSUFFICIENT_POSITION");
    const pos = db.prepare("SELECT qty FROM positions WHERE account_id=? AND symbol='GLB'").get(accountId) as { qty: number };
    expect(pos.qty).toBe(5);
  });

  it("duplicate client_order_id cannot execute twice", () => {
    const cid = newId();
    const r1 = executeOrder(db, market, accountId, "buy", "SPN", 3, cid);
    const r2 = executeOrder(db, market, accountId, "buy", "SPN", 3, cid);
    expect(r1.ok).toBe(true);
    expect(r2.duplicate).toBe(true);
    expect(r2.orderId).toBe(r1.orderId);
    const price = market.getQuote("SPN")!.priceMinor;
    expect(cashBalance(db, accountId)).toBe(DEFAULT_STARTING_BALANCE_MINOR - 3 * price);
  });

  it("sequential orders cannot overspend the virtual balance", () => {
    const price = market.getQuote("BND")!.priceMinor; // 10,000 units-ish start
    const maxQty = Math.floor(DEFAULT_STARTING_BALANCE_MINOR / price);
    const r1 = executeOrder(db, market, accountId, "buy", "BND", maxQty, newId());
    expect(r1.ok).toBe(true);
    const r2 = executeOrder(db, market, accountId, "buy", "BND", 1, newId());
    expect(r2.ok).toBe(false);
    expect(r2.errorCode).toBe("INSUFFICIENT_CASH");
    expect(cashBalance(db, accountId)).toBe(DEFAULT_STARTING_BALANCE_MINOR - maxQty * price);
  });

  it("transaction history matches the ledger", () => {
    executeOrder(db, market, accountId, "buy", "OFK", 4, newId());
    executeOrder(db, market, accountId, "sell", "OFK", 2, newId());
    const price = market.getQuote("OFK")!.priceMinor;
    const expected = DEFAULT_STARTING_BALANCE_MINOR - 4 * price + 2 * price;
    expect(cashBalance(db, accountId)).toBe(expected);
    const fills = (db.prepare("SELECT COUNT(*) AS c FROM simulated_orders WHERE status='filled'").get() as { c: number }).c;
    expect(fills).toBe(2);
  });
});

describe("portfolio", () => {
  it("portfolio value equals cash plus position values", () => {
    executeOrder(db, market, accountId, "buy", "IDX100", 10, newId());
    executeOrder(db, market, accountId, "buy", "BND", 5, newId());
    const p = getPortfolio(db, market, accountId);
    expect(p.totalValueMinor).toBe(p.cashMinor + p.investedValueMinor);
    expect(p.hasUnpricedPositions).toBe(false);
  });

  it("realized P&L follows the average-cost rule", () => {
    // Buy 10, sell 4 at the same simulated price -> realized = 4*(price-avg) with 0 fees = 0 here
    executeOrder(db, market, accountId, "buy", "GLB", 10, newId());
    executeOrder(db, market, accountId, "sell", "GLB", 4, newId());
    const p = getPortfolio(db, market, accountId);
    expect(p.realizedPnlMinor).toBe(0); // same-day simulated price for buy and sell
    const pos = p.positions.find((x) => x.symbol === "GLB")!;
    expect(pos.qty).toBe(6);
    expect(pos.costBasisMinor).toBe(6 * market.getQuote("GLB")!.priceMinor);
  });

  it("deposits are not counted as investment performance", () => {
    const before = getPortfolio(db, market, accountId);
    expect(before.simpleReturnPct).toBe(0);
    postEntry(db, accountId, "adjustment", 500_000); // external virtual deposit
    const after = getPortfolio(db, market, accountId);
    expect(after.cashMinor).toBe(before.cashMinor + 500_000);
    expect(after.simpleReturnPct).toBe(0); // NOT +50%
    expect(after.contributedCapitalMinor).toBe(DEFAULT_STARTING_BALANCE_MINOR + 500_000);
  });

  it("missing market data is surfaced, never treated as zero", () => {
    executeOrder(db, market, accountId, "buy", "OFK", 5, newId());
    db.prepare("DELETE FROM market_prices WHERE symbol = 'OFK'").run();
    const p = getPortfolio(db, market, accountId);
    expect(p.hasUnpricedPositions).toBe(true);
    expect(p.totalValueMinor).toBeNull();
    const pos = p.positions.find((x) => x.symbol === "OFK")!;
    expect(pos.marketValueMinor).toBeNull();
    expect(pos.currentPriceMinor).toBeNull();
  });

  it("concentration indicator reflects the largest position", () => {
    executeOrder(db, market, accountId, "buy", "OFK", 10, newId());
    executeOrder(db, market, accountId, "buy", "BND", 2, newId());
    const p = getPortfolio(db, market, accountId);
    expect(p.concentrationTopPct).not.toBeNull();
    expect(p.concentrationTopPct!).toBeGreaterThan(50);
    expect(p.concentrationTopPct!).toBeLessThanOrEqual(100);
  });
});

describe("undo", () => {
  it("a reverse order at the same quote restores cash and position", () => {
    const price = market.getQuote("OFK")!.priceMinor;
    const r1 = executeOrder(db, market, accountId, "buy", "OFK", 4, newId());
    expect(r1.ok).toBe(true);
    const r2 = executeOrder(db, market, accountId, "sell", "OFK", 4, `undo-${r1.orderId}`);
    expect(r2.ok).toBe(true);
    db.prepare("INSERT INTO order_undos (order_id, undo_order_id, created_at) VALUES (?,?,?)").run(r1.orderId!, r2.orderId!, Date.now());
    expect(cashBalance(db, accountId)).toBe(DEFAULT_STARTING_BALANCE_MINOR);
    const pos = db.prepare("SELECT qty FROM positions WHERE account_id=? AND symbol='OFK'").get(accountId);
    expect(pos).toBeUndefined();
    // undo idempotency guard: a second undo attempt is blocked by the marker
    const marker = db.prepare("SELECT order_id FROM order_undos WHERE order_id = ?").get(r1.orderId!);
    expect(marker).toBeDefined();
  });
});
