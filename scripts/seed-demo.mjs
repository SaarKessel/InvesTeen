// Reseed the demo user's activity with historically-spread orders so the
// portfolio chart shows real movement. Uses only stored simulated prices.
import { DatabaseSync } from "node:sqlite";
import { randomBytes } from "node:crypto";
const db = new DatabaseSync("data/investeen.db");
const uid = "demo-teen";
const acct = db.prepare("SELECT id, starting_balance_minor AS sb FROM virtual_accounts WHERE user_id = ?").get(uid);
if (!acct) { console.error("demo user missing"); process.exit(1); }
const aid = acct.id;
db.exec("BEGIN");
db.prepare("DELETE FROM simulated_orders WHERE account_id = ?").run(aid);
db.prepare("DELETE FROM positions WHERE account_id = ?").run(aid);
db.prepare("DELETE FROM realized_events WHERE account_id = ?").run(aid);
db.prepare("DELETE FROM virtual_account_ledger WHERE account_id = ? AND entry_type != 'initial_deposit'").run(aid);
const buys = [["BND", 10, 100], ["OFK", 40, 120], ["IDX100", 30, 150]];
const now = Date.now();
for (const [sym, qty, day] of buys) {
  const px = db.prepare("SELECT price_minor AS p FROM market_prices WHERE symbol = ? AND day = ?").get(sym, day);
  if (!px) { console.error("no price", sym, day); process.exit(1); }
  const gross = qty * px.p;
  const oid = "seed-" + randomBytes(8).toString("hex");
  db.prepare("INSERT INTO simulated_orders (id, client_order_id, account_id, symbol, side, qty, price_minor, price_day, fee_minor, status, created_at) VALUES (?,?,?,?,?,?,?,?,?,'filled',?)")
    .run(oid, oid, aid, sym, "buy", qty, px.p, day, 0, now);
  db.prepare("INSERT INTO virtual_account_ledger (account_id, entry_type, amount_minor, ref_type, ref_id, created_at) VALUES (?,?,?,?,?,?)")
    .run(aid, "trade_buy", -gross, "order", oid, now);
  db.prepare("INSERT INTO positions (account_id, symbol, qty, total_cost_minor) VALUES (?,?,?,?)")
    .run(aid, sym, qty, gross);
}
db.exec("COMMIT");
console.log("demo reseeded");
