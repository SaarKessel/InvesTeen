import type { DatabaseSync } from "node:sqlite";
import type { MinorUnits } from "@/lib/money";
import type { MarketDataProvider } from "@/lib/market/types";
import { cashBalance } from "./ledger";

export interface PositionView {
  symbol: string;
  nameHe: string;
  kind: string;
  sector: string | null;
  qty: number;
  avgCostMinor: MinorUnits;
  costBasisMinor: MinorUnits;
  /** null when the current simulated price is unavailable - never silently zero. */
  currentPriceMinor: MinorUnits | null;
  marketValueMinor: MinorUnits | null;
  unrealizedPnlMinor: MinorUnits | null;
  priceDay: number | null;
}

export interface AllocationSlice {
  label: string;
  valueMinor: MinorUnits;
  pctOfTotal: number; // 0-100, one decimal
}

export interface PortfolioView {
  accountId: string;
  startingBalanceMinor: MinorUnits;
  /** All externally contributed virtual capital (initial deposit + adjustments). */
  contributedCapitalMinor: MinorUnits;
  cashMinor: MinorUnits;
  positions: PositionView[];
  investedValueMinor: MinorUnits; // positions with available prices only
  totalValueMinor: MinorUnits | null; // null when any position is unpriced
  unrealizedPnlMinor: MinorUnits | null;
  realizedPnlMinor: MinorUnits;
  /** Return vs contributed capital - deposits/adjustments are never counted as investment gains. */
  simpleReturnPct: number | null;
  allocation: AllocationSlice[];
  concentrationTopPct: number | null; // largest position as % of invested value
  hasUnpricedPositions: boolean;
}

export function getPortfolio(db: DatabaseSync, market: MarketDataProvider, accountId: string): PortfolioView {
  const acct = db
    .prepare("SELECT starting_balance_minor AS s FROM virtual_accounts WHERE id = ?")
    .get(accountId) as { s: number };
  const contrib = db
    .prepare("SELECT COALESCE(SUM(amount_minor),0) AS c FROM virtual_account_ledger WHERE account_id = ? AND entry_type IN ('initial_deposit','adjustment')")
    .get(accountId) as { c: number };
  const cash = cashBalance(db, accountId);
  const rows = db
    .prepare(
      `SELECT p.symbol, p.qty, p.total_cost_minor AS cost, a.name_he AS nameHe, a.kind, a.sector
       FROM positions p JOIN assets a ON a.symbol = p.symbol
       WHERE p.account_id = ? AND p.qty > 0 ORDER BY p.symbol`
    )
    .all(accountId) as unknown as { symbol: string; qty: number; cost: number; nameHe: string; kind: string; sector: string | null }[];

  const positions: PositionView[] = rows.map((r) => {
    const q = market.getQuote(r.symbol);
    const avg = Math.floor(r.cost / r.qty);
    if (!q) {
      return { symbol: r.symbol, nameHe: r.nameHe, kind: r.kind, sector: r.sector, qty: r.qty,
        avgCostMinor: avg, costBasisMinor: r.cost, currentPriceMinor: null, marketValueMinor: null,
        unrealizedPnlMinor: null, priceDay: null };
    }
    const mv = r.qty * q.priceMinor;
    return { symbol: r.symbol, nameHe: r.nameHe, kind: r.kind, sector: r.sector, qty: r.qty,
      avgCostMinor: avg, costBasisMinor: r.cost, currentPriceMinor: q.priceMinor, marketValueMinor: mv,
      unrealizedPnlMinor: mv - r.cost, priceDay: q.day };
  });

  const hasUnpriced = positions.some((p) => p.marketValueMinor === null);
  const invested = positions.reduce((s, p) => s + (p.marketValueMinor ?? 0), 0);
  const unrealized = positions.reduce((s, p) => s + (p.unrealizedPnlMinor ?? 0), 0);
  const realizedRow = db
    .prepare("SELECT COALESCE(SUM(pnl_minor),0) AS r FROM realized_events WHERE account_id = ?")
    .get(accountId) as { r: number };
  const total = hasUnpriced ? null : cash + invested;
  const simpleReturnPct =
    total === null || contrib.c === 0 ? null : ((total - contrib.c) / contrib.c) * 100;

  const allocation: AllocationSlice[] = [];
  if (total !== null && total > 0) {
    allocation.push({ label: "מזומן", valueMinor: cash, pctOfTotal: round1((cash / total) * 100) });
    for (const p of positions) {
      allocation.push({ label: p.nameHe, valueMinor: p.marketValueMinor!, pctOfTotal: round1((p.marketValueMinor! / total) * 100) });
    }
  }

  const top = invested > 0
    ? Math.max(0, ...positions.map((p) => (p.marketValueMinor ?? 0))) / invested * 100
    : null;

  return {
    accountId,
    startingBalanceMinor: acct.s,
    contributedCapitalMinor: contrib.c,
    cashMinor: cash,
    positions,
    investedValueMinor: invested,
    totalValueMinor: total,
    unrealizedPnlMinor: hasUnpriced ? null : unrealized,
    realizedPnlMinor: realizedRow.r,
    simpleReturnPct,
    allocation,
    concentrationTopPct: top === null ? null : round1(top),
    hasUnpricedPositions: hasUnpriced
  };
}

function round1(x: number): number {
  return Math.round(x * 10) / 10;
}
