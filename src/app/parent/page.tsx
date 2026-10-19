import { requireUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { pendingRequestsFor, linkedTeensProgress, outgoingRequestOf } from "@/lib/guardian";
import { approveGuardianAction, revokeGuardianAction } from "@/app/actions/guardian";
import { RequestGuardianForm } from "@/components/GuardianForms";
import AppShell from "@/components/AppShell";
import { Card, Badge } from "@/components/ui";

export const dynamic = "force-dynamic";

export default function ParentPage() {
  const user = requireUser();
  const db = getDb();
  const pending = pendingRequestsFor(db, user.id);
  const linked = linkedTeensProgress(db, user.id);
  const outgoing = outgoingRequestOf(db, user.id);

  return (
    <AppShell user={user}>
      <h1 className="display text-2xl">עמוד הורה</h1>
      <p className="muted mt-1 text-sm">קשר הורה-ילד נוצר רק באישור שני הצדדים. ההורה רואה התקדמות בלמידה בלבד - לעולם לא שיחות עם המנטור.</p>

      <Card className="mt-5">
        <h2 className="font-semibold">קישור הורה לחשבון שלי</h2>
        {outgoing ? (
          <p className="text-sm mt-2 text-slate-300">
            בקשה ל-{outgoing.guardianUsername}: {outgoing.status === "pending" ? <Badge tone="warn">ממתינה לאישור ההורה</Badge> : <Badge tone="good">פעיל</Badge>}
          </p>
        ) : (
          <>
            <p className="text-sm muted mt-1">הזן את שם המשתמש של ההורה (ההורה פותח חשבון חינם ומאשר).</p>
            <RequestGuardianForm />
          </>
        )}
      </Card>

      {pending.length > 0 && (
        <Card className="mt-4">
          <h2 className="font-semibold mb-2">בקשות שממתינות לאישורך כהורה</h2>
          {pending.map((r) => (
            <form key={r.teenId} action={approveGuardianAction} className="flex items-center justify-between gap-2 border-t border-navy-800 pt-2 mt-2">
              <span className="text-sm">{r.teenUsername} מבקש/ת לקשר אותך כהורה</span>
              <input type="hidden" name="teenId" value={r.teenId} />
              <button className="btn-primary text-sm">אישור קישור</button>
            </form>
          ))}
        </Card>
      )}

      {linked.length > 0 && (
        <Card className="mt-4">
          <h2 className="font-semibold mb-2">התקדמות בלמידה</h2>
          <div className="space-y-3">
            {linked.map((t) => (
              <div key={t.teenId} className="bg-navy-800 rounded-xl p-3">
                <div className="flex justify-between items-center flex-wrap gap-2">
                  <b>{t.teenUsername}</b>
                  <Badge tone="good">רמה {t.level}: {t.levelTitle}</Badge>
                </div>
                <div className="text-sm muted mt-1">
                  {t.lessonsCompleted} שיעורים · {t.missionsCompleted} משימות · {t.achievementsCount} הישגים
                </div>
                <form action={revokeGuardianAction} className="mt-2">
                  <input type="hidden" name="teenId" value={t.teenId} />
                  <button className="text-xs text-danger-500 underline">הסרת קישור</button>
                </form>
              </div>
            ))}
          </div>
        </Card>
      )}

      <p className="text-xs muted mt-4">
        פרטיות: הכסף וירטואלי לחלוטין, אין רכישות ואין פרסומות. נשמרים שם משתמש וקבוצת גיל בלבד.
      </p>
    </AppShell>
  );
}
