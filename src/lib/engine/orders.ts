import type { DatabaseSync } from "node:sqlite";
import type { MinorUnits } from "@/lib/money";
import { newId, now } from "@/lib/db";
import type { MarketDataProvider } from "@/lib/market/types";
import { cashBalance, postEntry } from "./ledger";

export type OrderSide = "buy" | "sell";
export type OrderErrorCode =
  | "INVALID_QUANTITY"
  | "UNKNOWN_ASSET"
  | "PRICE_UNAVAILABLE"
  | "INSUFFICIENT_CASH"
  | "INSUFFICIENT_POSITION";

export interface OrderResult {
  ok: boolean;
  orderId?: string;
  status?: "filled" | "rejected";
  errorCode?: OrderErrorCode;
  errorHe?: string;
  priceMinor?: MinorUnits;
  feeMinor?: MinorUnits;
  totalMinor?: MinorUnits;
  duplicate?: boolean;
}

export interface SimulatedOrder {
  id: string;
  clientOrderId: string;
  accountId: string;
  symbol: string;
  side: OrderSide;
  qty: number;
  priceMinor: MinorUnits;
  priceDay: number;
  feeMinor: MinorUnits;
  status: "filled" | "rejected";
  createdAt: number;
}

const ERR_HE: Record<OrderErrorCode, string> = {
  INVALID_QUANTITY: "הכמות חייבת להיות מספר שלם וחיובי.",
  UNKNOWN_ASSET: "הנכס לא נמצא בקטלוג הלימודי.",
  PRICE_UNAVAILABLE: "אין מחיר סימולציה זמין כרגע לנכס הזה. לא בוצעה פעולה.",
  INSUFFICIENT_CASH: "אין מספיק מזומן וירטואלי לביצוע הקנייה.",
  INSUFFICIENT_POSITION: "אין מספיק יחידות בבעלותך לביצוע המכירה."
};

/**
 * Execute a simulated market order atomically.
 * - Idempotent on clientOrderId (duplicate submissions return the original result).
 * - Entire execution is one SQLite transaction: any failure rolls back everything.
 * - Fee: fixed per-order educational fee in minor units (default 0 in MVP).
 */
export function executeOrder(
  db: DatabaseSync,
  market: MarketDataProvider,
  accountId: string,
  side: OrderSide,
  symbol: string,
  qty: number,
  clientOrderId: string,
  feeMinor: MinorUnits = 0
): OrderResult {
  if (!clientOrderId || clientOrderId.length < 8) throw new Error("clientOrderId required");

  // Idempotency: a retry of the same client order returns the original outcome.
  const dup = db
    .prepare("SELECT id, status FROM simulated_orders WHERE client_order_id = ?")
    .get(clientOrderId) as { id: string; status: "filled" | "rejected" } | undefined;
  if (dup) return { ok: dup.status === "filled", orderId: dup.id, status: dup.status, duplicate: true };

  const reject = (code: OrderErrorCode): OrderResult => ({ ok: false, status: "rejected", errorCode: code, errorHe: ERR_HE[code] });

  if (!Number.isSafeInteger(qty) || qty <= 0) return reject("INVALID_QUANTITY");
  if (!Number.isSafeInteger(feeMinor) || feeMinor < 0) throw new Error("fee must be non-negative integer minor units");

  const asset = market.getAsset(symbol);
  if (!asset) return reject("UNKNOWN_ASSET");
  const quote = market.getQuote(symbol);
  if (!quote) return reject("PRICE_UNAVAILABLE");

  db.exec("BEGIN IMMEDIATE");
  try {
    // Re-check idempotency inside the write transaction to close the race window.
    const dup2 = db.prepare("SELECT id, status FROM simulated_orders WHERE client_order_id = ?").get(clientOrderId) as
      | { id: string; status: "filled" | "rejected" } | undefined;
    if (dup2) { db.exec("COMMIT"); return { ok: dup2.status === "filled", orderId: dup2.id, status: dup2.status, duplicate: true }; }

    const price = quote.priceMinor;
    const orderId = newId();

    if (side === "buy") {
      const total = qty * price + feeMinor;
      const cash = cashBalance(db, accountId);
      if (cash < total) { db.exec("ROLLBACK"); return reject("INSUFFICIENT_CASH"); }
      insertOrder(db, orderId, clientOrderId, accountId, symbol, side, qty, price, quote.day, feeMinor);
      postEntry(db, accountId, "trade_buy", -(qty * price), "order", orderId);
      if (feeMinor > 0) postEntry(db, accountId, "fee", -feeMinor, "order", orderId);
      addPosition(db, accountId, symbol, qty, qty * price);
      db.exec("COMMIT");
      return { ok: true, orderId, status: "filled", priceMinor: price, feeMinor, totalMinor: total };
    } else {
      const pos = db
        .prepare("SELECT qty, total_cost_minor AS totalCost FROM positions WHERE account_id = ? AND symbol = ?")
        .get(accountId, symbol) as { qty: number; totalCost: number } | undefined;
      if (!pos || pos.qty < qty) { db.exec("ROLLBACK"); return reject("INSUFFICIENT_POSITION"); }
      const proceeds = qty * price - feeMinor;
      // Average-cost convention: proportional cost removed is floored; the remainder stays in basis.
      const costRemoved = pos.qty === qty ? pos.totalCost : Math.floor((pos.totalCost * qty) / pos.qty);
      insertOrder(db, orderId, clientOrderId, accountId, symbol, side, qty, price, quote.day, feeMinor);
      postEntry(db, accountId, "trade_sell", qty * price, "order", orderId);
      if (feeMinor > 0) postEntry(db, accountId, "fee", -feeMinor, "order", orderId);
      removePosition(db, accountId, symbol, qty, costRemoved);
      db.prepare(
        "INSERT INTO realized_events (account_id, symbol, qty, proceeds_minor, cost_minor, fee_minor, pnl_minor, order_id, created_at) VALUES (?,?,?,?,?,?,?,?,?)"
      ).run(accountId, symbol, qty, proceeds, costRemoved, feeMinor, proceeds - costRemoved, orderId, now());
      db.exec("COMMIT");
      return { ok: true, orderId, status: "filled", priceMinor: price, feeMinor, totalMinor: proceeds };
    }
  } catch (e) {
    try { db.exec("ROLLBACK"); } catch { /* already rolled back */ }
    throw e;
  }
}

function insertOrder(
  db: DatabaseSync, id: string, clientOrderId: string, accountId: string,
  symbol: string, side: OrderSide, qty: number, price: MinorUnits, priceDay: number, feeMinor: MinorUnits
): void {
  db.prepare(
    "INSERT INTO simulated_orders (id, client_order_id, account_id, symbol, side, qty, price_minor, price_day, fee_minor, status, created_at) VALUES (?,?,?,?,?,?,?,?,?,'filled',?)"
  ).run(id, clientOrderId, accountId, symbol, side, qty, price, priceDay, feeMinor, now());
}

function addPosition(db: DatabaseSync, accountId: string, symbol: string, qty: number, costMinor: MinorUnits): void {
  db.prepare(
    `INSERT INTO positions (account_id, symbol, qty, total_cost_minor) VALUES (?,?,?,?)
     ON CONFLICT(account_id, symbol) DO UPDATE SET qty = qty + excluded.qty, total_cost_minor = total_cost_minor + excluded.total_cost_minor`
  ).run(accountId, symbol, qty, costMinor);
}

function removePosition(db: DatabaseSync, accountId: string, symbol: string, qty: number, costRemoved: MinorUnits): void {
  db.prepare(
    `UPDATE positions SET qty = qty - ?, total_cost_minor = total_cost_minor - ? WHERE account_id = ? AND symbol = ?`
  ).run(qty, costRemoved, accountId, symbol);
  db.prepare("DELETE FROM positions WHERE account_id = ? AND symbol = ? AND qty = 0").run(accountId, symbol);
}

export function listOrders(db: DatabaseSync, accountId: string, limit = 50): SimulatedOrder[] {
  return db.prepare(
    `SELECT id, client_order_id AS clientOrderId, account_id AS accountId, symbol, side, qty,
            price_minor AS priceMinor, price_day AS priceDay, fee_minor AS feeMinor, status, created_at AS createdAt
     FROM simulated_orders WHERE account_id = ? ORDER BY created_at DESC, id DESC LIMIT ?`
  ).all(accountId, limit) as unknown as SimulatedOrder[];
}
