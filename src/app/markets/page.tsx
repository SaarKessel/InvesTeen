import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getMarketProvider } from "@/lib/market";
import AppShell from "@/components/AppShell";
import { DataSourceNote } from "@/components/ui";
import { Sparkline, KindGlyph } from "@/components/Sparkline";
import { formatVT } from "@/lib/money";

export const dynamic = "force-dynamic";

const KIND_HE: Record<string, string> = { stock: "מניה", index_fund: "קרן מדד", bond_fund: "קרן אג\"ח" };

export default function MarketsPage() {
  const user = requireUser();
  const market = getMarketProvider();
  return (
    <AppShell user={user}>
      <h1 className="display text-2xl">שווקים</h1>
      <p className="muted mt-1 text-sm">סימולציה לימודית · כל הנכסים בדויים ונועדו ללמידה בלבד.</p>

      <div className="mt-4 divide-y divide-navy-800 border-t border-b border-navy-800">
        {market.listAssets().map((a) => {
          const q = market.getQuote(a.symbol);
          const hist = market.getHistory(a.symbol).slice(-30).map((pt) => pt.priceMinor);
          const first = hist[0], lastP = hist[hist.length - 1];
          const changePct = first && lastP ? ((lastP - first) / first) * 100 : null;
          return (
            <Link key={a.symbol} href={`/markets/${a.symbol}`} className="flex items-center gap-3 py-4 group">
              <KindGlyph kind={a.kind} />
              <div className="min-w-0 flex-1">
                <div className="font-medium truncate group-hover:text-accent-500 transition-colors">{a.nameHe}</div>
                <div className="text-xs muted mt-0.5">{a.symbol} · {KIND_HE[a.kind]}</div>
              </div>
              <Sparkline points={hist} width={84} height={28} />
              <div className="text-left w-28 shrink-0">
                <div className="font-bold tabular-nums" dir="ltr">{q ? formatVT(q.priceMinor) : "לא זמין"}</div>
                {changePct !== null && (
                  <div className={`text-xs mt-0.5 font-semibold ${changePct >= 0 ? "text-accent-500" : "text-danger-500"}`} dir="ltr">
                    {changePct >= 0 ? "+" : ""}{changePct.toFixed(2)}%
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </div>
      <DataSourceNote />
    </AppShell>
  );
}
