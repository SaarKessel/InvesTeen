import { requireUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { userLevel, userAchievements, LEVELS } from "@/lib/gamification";
import { lessonProgress } from "@/lib/learning";
import { LESSONS } from "@/lib/content/lessons";
import AppShell from "@/components/AppShell";
import { Card, Badge } from "@/components/ui";
import { AnimatedBar } from "@/components/easyui/AnimatedBar";
import { AnimatedNumber } from "@/components/easyui/AnimatedNumber";
import StarBorder from "@/components/reactbits/StarBorder";

export const dynamic = "force-dynamic";

export default function ProgressPage() {
  const user = requireUser();
  const db = getDb();
  const level = userLevel(db, user.id);
  const achievements = userAchievements(db, user.id);
  const progress = lessonProgress(db, user.id);
  const completed = LESSONS.filter((l) => progress[l.id]?.status === "completed").length;
  const next = LEVELS.find((l) => l.lessonsRequired > completed);

  return (
    <AppShell user={user}>
      <h1 className="display text-2xl">ההתקדמות שלי</h1>
      <Card className="mt-5">
        <StarBorder as="div" color="#10b981" backgroundColor="#0e1116" borderColor="rgba(16,185,129,0.25)" radius={14} thickness={1} glow={0.35} className="w-full justify-start p-4">
          <div className="flex items-center justify-between flex-wrap gap-2 w-full">
            <div>
              <div className="text-sm muted">רמה נוכחית</div>
              <div className="display text-2xl">רמה <AnimatedNumber value={level.level} /> · {level.titleHe}</div>
            </div>
            <Badge tone="good">{completed} שיעורים הושלמו</Badge>
          </div>
        </StarBorder>
        {next && (
          <div className="mt-4">
            <div className="flex justify-between text-xs muted mb-1.5">
              <span>התקדמות לרמה {next.level} ({next.titleHe})</span>
              <span>{completed}/{next.lessonsRequired} שיעורים</span>
            </div>
            <AnimatedBar pct={Math.round((completed / next.lessonsRequired) * 100)} />
          </div>
        )}
      </Card>
      <Card className="mt-4">
        <h2 className="section-title mb-3">הישגים</h2>
        {achievements.length === 0 ? <p className="muted text-sm">עוד אין הישגים. סיים שיעור ראשון כדי לפתוח את הראשון!</p> : (
          <div className="grid md:grid-cols-2 gap-3">
            {achievements.map((a) => (
              <StarBorder as="div" key={a.id} color="#10b981" backgroundColor="#171b21" borderColor="rgba(255,255,255,0.08)" radius={12} thickness={1} glow={0.25} className="w-full justify-start p-3 flex items-start gap-3">
                <span className="w-9 h-9 rounded-xl bg-accent-600/15 border border-accent-600/40 text-accent-500 flex items-center justify-center shrink-0" aria-hidden>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="9" r="5" /><path d="M8.5 13.5L7 21l5-2.5L17 21l-1.5-7.5" />
                  </svg>
                </span>
                <span>
                  <span className="font-medium block">{a.titleHe}</span>
                  <span className="text-sm muted">{a.descriptionHe}</span>
                </span>
              </StarBorder>
            ))}
          </div>
        )}
      </Card>
      <p className="text-xs muted mt-4">רמות והישגים מבוססים על למידה והבנה - לא על רווחים וירטואליים, כמות פעולות או זמן באפליקציה.</p>
    </AppShell>
  );
}
