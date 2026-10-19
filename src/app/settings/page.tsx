import { requireUser } from "@/lib/auth";
import { logoutAction } from "@/app/actions/auth";
import AppShell from "@/components/AppShell";
import { Card, Badge } from "@/components/ui";
import Link from "next/link";
import { deleteAccountAction } from "@/app/actions/account";
import { MotionSwitch } from "@/components/MotionSwitch";

export const dynamic = "force-dynamic";

export default function SettingsPage() {
  const user = requireUser();
  return (
    <AppShell user={user}>
      <h1 className="display text-2xl">הגדרות</h1>
      <Card className="mt-5 space-y-3">
        <div className="flex justify-between"><span className="muted">שם משתמש</span><b>{user.username}</b></div>
        <div className="flex justify-between"><span className="muted">קבוצת גיל</span><Badge>{user.ageBand}</Badge></div>
        <div className="flex justify-between"><span className="muted">סוג חשבון</span><span>לימודי - כסף וירטואלי בלבד</span></div>
      </Card>
      <Card className="mt-4">
        <h2 className="font-semibold mb-3">נגישות</h2>
        <MotionSwitch />
      </Card>
      <Card className="mt-4">
        <h2 className="font-semibold mb-2">הורים</h2>
        <p className="text-sm muted">הורים יכולים לראות התקדמות בלמידה דרך <Link className="text-accent-500" href="/parent">עמוד ההורה</Link>.</p>
      </Card>
      <Card className="mt-4">
        <h2 className="font-semibold mb-2 text-danger-500">מחיקת חשבון</h2>
        <p className="text-sm muted mb-3">מחיקה מוחקת את כל הנתונים: תיק, פעולות, התקדמות ושיחות. אי אפשר לבטל.
          כדי לאשר, כתוב את שם המשתמש שלך ({user.username}).</p>
        <form action={deleteAccountAction} className="flex gap-2">
          <input className="input" name="confirm" placeholder="שם משתמש לאישור" required />
          <button className="btn-secondary border-danger-600 text-danger-500 shrink-0">מחיקה</button>
        </form>
      </Card>
      <form action={logoutAction} className="mt-6">
        <button className="btn-secondary w-full">התנתקות</button>
      </form>
      <p className="text-xs muted mt-6">
        InvesTeen היא פלטפורמה חינוכית. אין כסף אמיתי, אין ייעוץ השקעות, וכל הנתונים סימולציה בדויה.
      </p>
    </AppShell>
  );
}
