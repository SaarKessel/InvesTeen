import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { lessonProgress } from "@/lib/learning";
import { LESSONS } from "@/lib/content/lessons";
import AppShell from "@/components/AppShell";
import { Card, Badge } from "@/components/ui";
import { AnimatedBar } from "@/components/easyui/AnimatedBar";

export const dynamic = "force-dynamic";

export default function LearnPage() {
  const user = requireUser();
  const db = getDb();
  const progress = lessonProgress(db, user.id);
  const modules = [
    { id: "A", title: "יסודות הכסף" },
    { id: "B", title: "יסודות ההשקעה" },
    { id: "C", title: "מבינים שווקים" },
    { id: "D", title: "בונים תיק" },
    { id: "E", title: "פסיכולוגיה של משקיעים" }
  ];
  return (
    <AppShell user={user}>
      <h1 className="display text-2xl">לומדים</h1>
      {modules.map((m) => {
        const moduleLessons = LESSONS.filter((l) => l.moduleId === m.id);
        const doneCount = moduleLessons.filter((l) => progress[l.id]?.status === "completed").length;
        const pct = moduleLessons.length ? Math.round((doneCount / moduleLessons.length) * 100) : 0;
        return (
        <div key={m.id} className="mt-8">
          <div className="flex items-center justify-between mb-2">
            <h2 className="section-title flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-navy-800 border border-navy-600 text-accent-500 text-xs font-bold flex items-center justify-center">{m.id}</span>
              {m.title}
            </h2>
            <span className="text-xs muted">{doneCount}/{moduleLessons.length} הושלמו</span>
          </div>
          <AnimatedBar pct={pct} />
          <div className="grid md:grid-cols-2 gap-3">
            {LESSONS.filter((l) => l.moduleId === m.id).map((l) => {
              const st = progress[l.id];
              return (
                <Link key={l.id} href={`/learn/${l.id}`}>
                  <Card className="h-full hover:border-accent-600/50 transition-colors">
                    <div className="flex justify-between items-start gap-2">
                      <div className="font-medium">{l.titleHe}</div>
                      {st?.status === "completed"
                        ? <Badge tone="good">הושלם {st.scorePct !== null ? `(${st.scorePct}%)` : ""}</Badge>
                        : <Badge>רמה {l.difficulty}</Badge>}
                    </div>
                    <p className="text-sm muted mt-1">{l.descriptionHe}</p>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
        );
      })}
    </AppShell>
  );
}
