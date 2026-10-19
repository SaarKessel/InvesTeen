import { requireUser } from "@/lib/auth";
import AppShell from "@/components/AppShell";
import MentorChat from "@/components/MentorChat";
import { Badge } from "@/components/ui";

export const dynamic = "force-dynamic";

export default function MentorPage() {
  const user = requireUser();
  return (
    <AppShell user={user}>
      <div className="flex items-center gap-3 flex-wrap">
        <h1 className="display text-2xl">המנטור הפיננסי</h1>
        <Badge tone="warn">מצב חינוכי מקומי - בלי AI חיצוני עדיין</Badge>
      </div>
      <p className="muted mt-1 text-sm">מורה חינוכי בלבד: מסביר מושגים ומנתח את התיק הווירטואלי. לא ממליץ על קנייה/מכירה ולא מבטיח תשואות.</p>
      <div className="mt-4"><MentorChat initial={[]} /></div>
    </AppShell>
  );
}
