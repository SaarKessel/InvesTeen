/**
 * Disposable-demo auto seed. Runs once per fresh database when
 * INVESTEEN_DEMO_SEED=1 (e.g. a serverless demo where the DB lives in
 * ephemeral /tmp). Creates the demo account through the real registration
 * path, then spreads a few orders over past simulation days so the chart
 * shows movement. Demo deployments only - never for durable accounts.
 */
import { getDb } from "@/lib/db";
import { registerUser } from "@/lib/auth";
import { randomBytes } from "node:crypto";

export function ensureDemoSeed(): void {
  if (process.env.INVESTEEN_DEMO_SEED !== "1") return;
  const db = getDb();
  const { c } = db.prepare("SELECT COUNT(*) AS c FROM users").get() as { c: number };
  if (c > 0) return;
  const r = registerUser("yael_learns", "demo1234", "14-15");
  if (!r.ok || !r.userId) return;
  const acct = db.prepare("SELECT id FROM virtual_accounts WHERE user_id = ?").get(r.userId) as { id: string } | undefined;
  if (!acct) return;
  const { m } = db.prepare("SELECT MAX(day) AS m FROM market_prices").get() as { m: number };
  const now = Date.now();
  for (const [sym, qty, back] of [["BND", 10, 50], ["OFK", 40, 30], ["IDX100", 30, 10]] as const) {
    const px = db.prepare("SELECT price_minor AS p FROM market_prices WHERE symbol = ? AND day = ?").get(sym, m - back) as { p: number } | undefined;
    if (!px) continue;
    const gross = qty * px.p;
    const oid = "seed-" + randomBytes(8).toString("hex");
    db.prepare("INSERT INTO simulated_orders (id, client_order_id, account_id, symbol, side, qty, price_minor, price_day, fee_minor, status, created_at) VALUES (?,?,?,?,?,?,?,?,?,'filled',?)")
      .run(oid, oid, acct.id, sym, "buy", qty, px.p, m - back, 0, now);
    db.prepare("INSERT INTO virtual_account_ledger (account_id, entry_type, amount_minor, ref_type, ref_id, created_at) VALUES (?,?,?,?,?,?)")
      .run(acct.id, "trade_buy", -gross, "order", oid, now);
    db.prepare("INSERT INTO positions (account_id, symbol, qty, total_cost_minor) VALUES (?,?,?,?)")
      .run(acct.id, sym, qty, gross);
  }
  console.log("[demo-seed] demo account ready: yael_learns");
}
