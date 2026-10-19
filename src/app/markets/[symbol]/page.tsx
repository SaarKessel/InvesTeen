import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { getMarketProvider } from "@/lib/market";
import { getAccountByUser } from "@/lib/engine/accounts";
import AppShell from "@/components/AppShell";
import { Card, Badge, DataSourceNote } from "@/components/ui";
import { Term } from "@/components/easyui/Tooltip";
import PortfolioChart from "@/components/PortfolioChart";
import TradeForm from "@/components/TradeForm";
import { formatVT } from "@/lib/money";

export const dynamic = "force-dynamic";

export default function AssetPage({ params }: { params: { symbol: string } }) {
  const user = requireUser();
  const db = getDb();
  const market = getMarketProvider();
  const asset = market.getAsset(params.symbol);
  if (!asset) notFound();
  const quote = market.getQuote(asset.symbol);
  const raw = market.getHistory(asset.symbol);
  const history = raw.map((p) => ({ day: p.day, valueMinor: p.priceMinor }));
  const last = raw[raw.length - 1]?.priceMinor ?? null;
  const prev = raw[raw.length - 2]?.priceMinor ?? null;
  const dayChangePct = last !== null && prev ? ((last - prev) / prev) * 100 : null;
  const acct = getAccountByUser(db, user.id)!;
  const pos = db.prepare("SELECT qty FROM positions WHERE account_id = ? AND symbol = ?").get(acct.id, asset.symbol) as { qty: number } | undefined;

  return (
    <AppShell user={user}>
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="display text-2xl">{asset.nameHe} <span className="muted text-lg font-normal">({asset.symbol})</span></h1>
          <p className="muted mt-1 max-w-xl">{asset.descriptionHe}</p>
        </div>
        <Badge>{asset.sector}</Badge>
      </div>

      <section className="mt-4">
        <PortfolioChart data={history} labelHe={`מחיר ${asset.nameHe} (סימולציה)`} />
        <div className="text-xs muted mt-1">{quote ? `${quote.asOf} · ${market.sourceLabel}` : "נתוני סימולציה חסרים"}</div>
      </section>

      <div className="grid md:grid-cols-2 gap-3 mt-4">
        <Card>
          <h2 className="section-title mb-3">קנייה וירטואלית</h2>
          <TradeForm symbol={asset.symbol} side="buy" />
        </Card>
        <Card>
          <h2 className="section-title mb-3">מכירה וירטואלית</h2>
          <p className="text-sm muted mb-3">בבעלותך: {pos?.qty ?? 0} יחידות</p>
          <TradeForm symbol={asset.symbol} side="sell" />
        </Card>
      </div>
      <DataSourceNote />
    </AppShell>
  );
}
