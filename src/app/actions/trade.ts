"use server";
import { z } from "zod";
import { getDb } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { getMarketProvider } from "@/lib/market";
import { getAccountByUser } from "@/lib/engine/accounts";
import { executeOrder } from "@/lib/engine/orders";
import { award } from "@/lib/gamification";
import { now } from "@/lib/db";

const TradeSchema = z.object({
  symbol: z.string().min(1).max(12),
  side: z.enum(["buy", "sell"]),
  qty: z.coerce.number().int().positive().max(1_000_000),
  clientOrderId: z.string().min(8).max(64)
});

export type TradeState = { ok?: boolean; error?: string; orderId?: string; filled?: { price: number; total: number } };

export async function tradeAction(_prev: TradeState, formData: FormData): Promise<TradeState> {
  const user = requireUser();
  const parsed = TradeSchema.safeParse({
    symbol: formData.get("symbol"),
    side: formData.get("side"),
    qty: formData.get("qty"),
    clientOrderId: formData.get("clientOrderId")
  });
  if (!parsed.success) return { error: "קלט לא תקין. בדוק את הכמות ונסה שוב." };
  const db = getDb();
  const market = getMarketProvider();
  const acct = getAccountByUser(db, user.id);
  if (!acct) return { error: "לא נמצא חשבון וירטואלי." };
  const r = executeOrder(db, market, acct.id, parsed.data.side, parsed.data.symbol, parsed.data.qty, parsed.data.clientOrderId);
  if (!r.ok) return { error: r.errorHe ?? "הפעולה נדחתה." };
  // Achievement: bought two different assets (server-side check, not client state)
  const distinct = (db.prepare("SELECT COUNT(DISTINCT symbol) AS c FROM positions WHERE account_id = ? AND qty > 0").get(acct.id) as { c: number }).c;
  if (distinct >= 2) award(db, user.id, "first-diversified-buy");
  db.prepare("INSERT INTO audit_events (user_id, action, meta, created_at) VALUES (?,?,?,?)")
    .run(user.id, `order.${parsed.data.side}`, JSON.stringify({ symbol: parsed.data.symbol, qty: parsed.data.qty }), now());
  return { ok: true, orderId: r.orderId, filled: { price: r.priceMinor!, total: r.totalMinor! } };
}

/** Undo a just-filled virtual order by executing the exact reverse at the current simulated quote.
 *  Guarded: owner only, once per order. Educational; uses the same atomic engine path. */
export async function undoTradeAction(orderId: string): Promise<{ ok?: boolean; error?: string }> {
  const user = requireUser();
  const db = getDb();
  const market = getMarketProvider();
  const acct = getAccountByUser(db, user.id);
  if (!acct) return { error: "לא נמצא חשבון וירטואלי." };
  const order = db.prepare(
    "SELECT id, symbol, side, qty FROM simulated_orders WHERE id = ? AND account_id = ? AND status = 'filled'"
  ).get(orderId, acct.id) as { id: string; symbol: string; side: "buy" | "sell"; qty: number } | undefined;
  if (!order) return { error: "הפעולה לא נמצאה." };
  const undone = db.prepare("SELECT order_id FROM order_undos WHERE order_id = ?").get(orderId);
  if (undone) return { error: "הפעולה הזו כבר בוטלה." };
  const reverse = order.side === "buy" ? "sell" : "buy";
  const r = executeOrder(db, market, acct.id, reverse, order.symbol, order.qty, `undo-${order.id}`);
  if (!r.ok) return { error: `לא ניתן לבטל כרגע: ${r.errorHe ?? "נדחה"}` };
  db.prepare("INSERT INTO order_undos (order_id, undo_order_id, created_at) VALUES (?,?,?)").run(order.id, r.orderId!, Date.now());
  db.prepare("INSERT INTO audit_events (user_id, action, meta, created_at) VALUES (?,?,?,?)")
    .run(user.id, "order.undo", JSON.stringify({ orderId }), Date.now());
  return { ok: true };
}
