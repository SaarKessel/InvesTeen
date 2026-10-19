import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { getMarketProvider } from "@/lib/market";
import { getAccountByUser } from "@/lib/engine/accounts";
import { getPortfolio } from "@/lib/engine/portfolio";
import { getPortfolioHistory } from "@/lib/engine/portfolioHistory";
import { userLevel } from "@/lib/gamification";
import { lessonProgress } from "@/lib/learning";
import { LESSONS } from "@/lib/content/lessons";
import AppShell from "@/components/AppShell";
import { Card, Badge, DataSourceNote, EmptyState, Pnl } from "@/components/ui";
import { Term } from "@/components/easyui/Tooltip";
import { Sparkline } from "@/components/Sparkline";
import PortfolioChart from "@/components/PortfolioChart";
import NextStepCard from "@/components/NextStepCard";
import { formatVT } from "@/lib/money";

export const dynamic = "force-dynamic";

export default function DashboardPage() {
  const user = requireUser();
  const db = getDb();
  const market = getMarketProvider();
  const acct = getAccountByUser(db, user.id)!;
  const p = getPortfolio(db, market, acct.id);
  const history = getPortfolioHistory(db, market, acct.id, acct.startingBalanceMinor);
  const level = userLevel(db, user.id);
  const progress = lessonProgress(db, user.id);
  const nextLesson = LESSONS.find((l) => progress[l.id]?.status !== "completed");

  const insights: string[] = [];
  if (p.concentrationTopPct !== null && p.concentrationTopPct > 60)
    insights.push(`התיק מרוכז: הנכס הגדול הוא ${p.concentrationTopPct}% מהחלק המושקע. שיעור הפיזור מסביר למה זה משנה.`);
  if (Object.values(progress).some((x) => x.status === "completed"))
    insights.push("כל הכבוד - כבר סיימת שיעורים. הידע נשמר אצלך לתמיד.");
  if (p.positions.length === 0)
    insights.push("התיק עדיין במזומן. כדאי לבקר בעמוד השווקים ולנסות רכישת תרגול קטנה.");

  return (
    <AppShell user={user}>
      {/* Greeting row */}
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-lg font-semibold text-slate-300">שלום, {user.username}</h1>
        <Badge tone="good">רמה {level.level}: {level.titleHe}</Badge>
      </div>

      {/* Hero: big value + interactive chart (Robinhood-style) */}
      <section className="mt-4">
        <PortfolioChart data={history} />
      </section>

      {/* Holdings as minimal rows with thin dividers */}
      <section className="mt-6">
        <div className="flex items-center justify-between border-b border-navy-800 pb-2">
          <h2 className="section-title">התיק שלי</h2>
          <Link href="/portfolio" className="text-sm text-accent-500 hover:underline">לתיק המלא</Link>
        </div>
        <div className="divide-y divide-navy-800">
          <div className="flex items-center justify-between py-3.5 gap-3">
            <div>
              <div className="font-medium"><Term explain="כסף וירטואלי פנוי שעוד לא מושקע. זמין מיד לרכישות תרגול.">מזומן</Term></div>
              <div className="text-xs muted mt-0.5">זמין לסחר וירטואלי</div>
            </div>
            <div className="font-bold tabular-nums" dir="ltr">{formatVT(p.cashMinor)}</div>
          </div>
          {p.positions.map((pos) => {
            const spark = market.getHistory(pos.symbol).slice(-30).map((pt) => pt.priceMinor);
            return (
              <Link key={pos.symbol} href={`/markets/${pos.symbol}`} className="flex items-center justify-between py-3.5 gap-3 group">
                <div className="min-w-0">
                  <div className="font-medium truncate group-hover:text-accent-500 transition-colors">{pos.nameHe}</div>
                  <div className="text-xs muted mt-0.5">{pos.qty} יח׳ · {pos.symbol}</div>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <Sparkline points={spark} width={72} height={24} />
                  <div className="text-left w-28">
                    <div className="font-bold tabular-nums" dir="ltr">{pos.marketValueMinor !== null ? formatVT(pos.marketValueMinor) : "לא זמין"}</div>
                    <div className="text-xs mt-0.5">{pos.unrealizedPnlMinor !== null ? <Pnl minor={pos.unrealizedPnlMinor} /> : <span className="muted">לא זמין</span>}</div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
        {p.positions.length === 0 && (
          <p className="text-sm muted py-4">אין פוזיציות עדיין. <Link href="/markets" className="text-accent-500 hover:underline">לשווקים</Link></p>
        )}
        <div className="flex justify-between text-sm border-t border-navy-800 pt-3 mt-1">
          <span className="muted"><Term explain="רווח או הפסד שנעול במכירה בפועל.">רווח/הפסד ממומש</Term></span>
          <Pnl minor={p.realizedPnlMinor} />
        </div>
      </section>

      {insights.length > 0 && (
        <Card className="mt-6">
          <h2 className="section-title mb-2">תובנות לימודיות</h2>
          <ul className="list-disc pr-5 space-y-1 text-sm text-slate-300">
            {insights.map((i) => <li key={i}>{i}</li>)}
          </ul>
        </Card>
      )}

      <Card className="mt-4">
        <h2 className="section-title mb-2">הצעד הבא שלך</h2>
        {nextLesson ? (
          <NextStepCard lessonId={nextLesson.id} titleHe={nextLesson.titleHe} descriptionHe={nextLesson.descriptionHe} />
        ) : (
          <EmptyState title="סיימת את כל השיעורים!" body="אפשר להמשיך למשימות באתגרים או לתרגל בתיק הווירטואלי." actionHref="/challenges" actionLabel="למשימות" />
        )}
      </Card>

      <DataSourceNote />
    </AppShell>
  );
}
