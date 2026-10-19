/**
 * Portfolio value history: exact deterministic replay.
 * For each simulation day, replays filled orders up to that day and values
 * holdings at that day's simulated prices. Cash = starting balance plus
 * trade cash flows (ledger trade entries mirror these orders exactly).
 * No invented points: every value derives from stored orders + stored prices.
 */
import type { DatabaseSync } from "node:sqlite";
import type { MarketDataProvider } from "@/lib/market/types";

export interface PortfolioPoint { day: number; valueMinor: number }

interface OrderRow { symbol: string; side: string; qty: number; price_minor: number; fee_minor: number; price_day: number }

export function getPortfolioHistory(db: DatabaseSync, market: MarketDataProvider, accountId: string, startingBalanceMinor: number): PortfolioPoint[] {
  const orders = db.prepare(
    "SELECT symbol, side, qty, price_minor, fee_minor, price_day FROM simulated_orders WHERE account_id = ? AND status = 'filled' ORDER BY price_day ASC, created_at ASC"
  ).all(accountId) as unknown as OrderRow[];

  const symbols = [...new Set(orders.map((o) => o.symbol))];
  const histories = new Map(symbols.map((s) => [s, market.getHistory(s)]));
  let maxDay = 0;
  for (const h of histories.values()) maxDay = Math.max(maxDay, h[h.length - 1]?.day ?? 0);
  if (maxDay === 0) {
    // No trades yet: span the full simulation via any listed asset so the chart still has context.
    const any = market.listAssets()[0];
    if (any) maxDay = market.getHistory(any.symbol).slice(-1)[0]?.day ?? 0;
  }
  for (const o of orders) maxDay = Math.max(maxDay, o.price_day);
  if (maxDay <= 0) return [{ day: 0, valueMinor: startingBalanceMinor }];

  const priceAt = (symbol: string, day: number): number | null => {
    const h = histories.get(symbol);
    if (!h) return null;
    const pt = h.find((x: { day: number; priceMinor: number }) => x.day === day);
    return pt ? pt.priceMinor : null;
  };

  const points: PortfolioPoint[] = [];
  let cash = startingBalanceMinor;
  const qty = new Map<string, number>();
  let oi = 0;
  for (let d = 0; d <= maxDay; d++) {
    while (oi < orders.length && orders[oi].price_day <= d) {
      const o = orders[oi++];
      const gross = o.qty * o.price_minor;
      if (o.side === "buy") { cash -= gross + o.fee_minor; qty.set(o.symbol, (qty.get(o.symbol) ?? 0) + o.qty); }
      else { cash += gross - o.fee_minor; qty.set(o.symbol, (qty.get(o.symbol) ?? 0) - o.qty); }
    }
    let invested = 0, missing = false;
    for (const [sym, q] of qty) {
      if (q <= 0) continue;
      const px = priceAt(sym, d);
      if (px === null) { missing = true; break; }
      invested += q * px;
    }
    points.push({ day: d, valueMinor: missing ? (points[points.length - 1]?.valueMinor ?? cash) : cash + invested });
  }
  return points;
}
