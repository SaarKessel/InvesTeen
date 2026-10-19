import { requireUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { MISSIONS } from "@/lib/content/missions";
import { missionProgress } from "@/lib/learning";
import AppShell from "@/components/AppShell";
import { Card, Badge } from "@/components/ui";
import MissionRunner from "@/components/MissionRunner";

export const dynamic = "force-dynamic";

export default function ChallengesPage() {
  const user = requireUser();
  const db = getDb();
  const progress = missionProgress(db, user.id);
  return (
    <AppShell user={user}>
      <h1 className="display text-2xl">משימות</h1>
      <p className="muted mt-1">תרגילים אינטראקטיביים עם הנחות מוצהרות. זה לימוד - לא תחזית שוק.</p>
      <div className="space-y-4 mt-5">
        {MISSIONS.map((m) => (
          <Card key={m.id}>
            <div className="flex justify-between items-start gap-2">
              <h2 className="section-title">{m.titleHe}</h2>
              {progress[m.id] === "completed" ? <Badge tone="good">הושלמה</Badge> : <Badge>משימה</Badge>}
            </div>
            <p className="text-sm text-slate-300 mt-1">{m.objectiveHe}</p>
            <p className="text-xs muted mt-1">קריטריון הצלחה: {m.successHe}</p>
            <MissionRunner missionId={m.id} kind={m.kind} done={progress[m.id] === "completed"} />
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
