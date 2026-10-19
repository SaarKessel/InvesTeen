import { requireUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { getMarketProvider } from "@/lib/market";
import { getAccountByUser } from "@/lib/engine/accounts";
import { getPortfolio } from "@/lib/engine/portfolio";
import { listOrders } from "@/lib/engine/orders";
import AppShell from "@/components/AppShell";
import { Card, DataSourceNote, EmptyState, Pnl } from "@/components/ui";
import { Term } from "@/components/easyui/Tooltip";
import { AnimatedBar } from "@/components/easyui/AnimatedBar";
import { AnimatedVTStat } from "@/components/AnimatedStat";
import { formatVT } from "@/lib/money";

export const dynamic = "force-dynamic";

export default function PortfolioPage() {
  const user = requireUser();
  const db = getDb();
  const market = getMarketProvider();
  const acct = getAccountByUser(db, user.id)!;
  const p = getPortfolio(db, market, acct.id);
  const orders = listOrders(db, acct.id, 25);

  return (
    <AppShell user={user}>
      <h1 className="display text-2xl">התיק הווירטואלי שלי</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5">
        <Card>{p.totalValueMinor !== null ? <AnimatedVTStat label="שווי כולל" valueMinor={p.totalValueMinor} /> : <div className="muted">שווי לא זמין</div>}</Card>
        <Card><AnimatedVTStat label="מזומן" valueMinor={p.cashMinor} /></Card>
        <Card>{p.unrealizedPnlMinor !== null ? <AnimatedVTStat label={<Term explain="רווח או הפסד על נכסים שעדיין מוחזקים - משתנה עם המחיר, ונעול רק במכירה.">לא ממומש</Term>} valueMinor={p.unrealizedPnlMinor} /> : <div className="muted">לא זמין</div>}</Card>
        <Card><AnimatedVTStat label={<Term explain="רווח או הפסד שנעול במכירה בפועל.">ממומש</Term>} valueMinor={p.realizedPnlMinor} /></Card>
      </div>

      {p.allocation.length > 0 && (
        <Card className="mt-4">
          <h2 className="section-title mb-1"><Term explain="איך התיק מתחלק בין נכסים ומזומן. פיזור רחב מוריד תלות בנכס אחד.">הקצאת נכסים</Term></h2>
          <div className="space-y-2">
            {p.allocation.map((a) => (
              <div key={a.label}>
                <div className="flex justify-between text-sm"><span>{a.label}</span><span className="muted">{a.pctOfTotal}%</span></div>
                <div className="mt-1"><AnimatedBar pct={a.pctOfTotal} /></div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card className="mt-4">
        <h2 className="section-title mb-3">פוזיציות</h2>
        {p.positions.length === 0 ? (
          <EmptyState title="אין פוזיציות עדיין" body="בקר בעמוד השווקים ובצע רכישת תרגול ראשונה בכסף וירטואלי." actionHref="/markets" actionLabel="לשווקים" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-slate-400 text-right">
                <tr><th className="py-2">נכס</th><th>כמות</th><th><Term explain="המחיר הממוצע ששולם ליחידה בכל הרכישות. הבסיס לחישוב רווח או הפסד.">עלות ממוצעת</Term></th><th>מחיר נוכחי</th><th>שווי</th><th>לא ממומש</th></tr>
              </thead>
              <tbody>
                {p.positions.map((pos) => (
                  <tr key={pos.symbol} className="border-t border-navy-800 text-center">
                    <td className="py-2 text-right">{pos.nameHe}</td>
                    <td>{pos.qty}</td>
                    <td>{formatVT(pos.avgCostMinor)}</td>
                    <td>{pos.currentPriceMinor !== null ? formatVT(pos.currentPriceMinor) : "לא זמין"}</td>
                    <td>{pos.marketValueMinor !== null ? formatVT(pos.marketValueMinor) : "לא זמין"}</td>
                    <td>{pos.unrealizedPnlMinor !== null ? <Pnl minor={pos.unrealizedPnlMinor} /> : "לא זמין"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card className="mt-4">
        <h2 className="section-title mb-3">היסטוריית פעולות</h2>
        {orders.length === 0 ? <p className="muted text-sm">עוד לא בוצעו פעולות.</p> : (
          <div className="space-y-2 text-sm">
            {orders.map((o) => (
              <div key={o.id} className="flex justify-between border-t border-navy-800 pt-2">
                <span>{o.side === "buy" ? "קנייה" : "מכירה"} · {o.symbol} · {o.qty} יח׳</span>
                <span className="muted">{formatVT(o.priceMinor)} ליח׳</span>
              </div>
            ))}
          </div>
        )}
      </Card>
      <DataSourceNote />
    </AppShell>
  );
}
