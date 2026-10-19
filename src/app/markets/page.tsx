import { requireUser } from "@/lib/auth";
import { getMarketProvider } from "@/lib/market";
import AppShell from "@/components/AppShell";
import { DataSourceNote } from "@/components/ui";
import MarketsList, { type MarketRow } from "@/components/MarketsList";
import { formatVT } from "@/lib/money";

export const dynamic = "force-dynamic";

const KIND_HE: Record<string, string> = { stock: "מניה", index_fund: "קרן מדד", bond_fund: "קרן אג\"ח" };

export default function MarketsPage() {
  const user = requireUser();
  const market = getMarketProvider();
  const rows: MarketRow[] = market.listAssets().map((a) => {
    const q = market.getQuote(a.symbol);
    const hist = market.getHistory(a.symbol).slice(-30).map((pt) => pt.priceMinor);
    const first = hist[0], lastP = hist[hist.length - 1];
    const changePct = first && lastP ? ((lastP - first) / first) * 100 : null;
    return {
      symbol: a.symbol,
      kind: a.kind,
      nameHe: a.nameHe,
      kindHe: KIND_HE[a.kind] ?? a.kind,
      priceText: q ? formatVT(q.priceMinor) : "לא זמין",
      changePct,
      spark: hist
    };
  });
  return (
    <AppShell user={user}>
      <h1 className="display text-2xl">שווקים</h1>
      <p className="muted mt-1 text-sm">סימולציה לימודית · כל הנכסים בדויים ונועדו ללמידה בלבד.</p>
      <MarketsList rows={rows} />
      <DataSourceNote />
    </AppShell>
  );
}
