import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { getLesson } from "@/lib/content/lessons";
import { lessonProgress } from "@/lib/learning";
import AppShell from "@/components/AppShell";
import { Card, Badge } from "@/components/ui";
import LessonQuiz from "@/components/LessonQuiz";

export const dynamic = "force-dynamic";

export default function LessonPage({ params }: { params: { id: string } }) {
  const user = requireUser();
  const lesson = getLesson(params.id);
  if (!lesson) notFound();
  const db = getDb();
  const st = lessonProgress(db, user.id)[lesson.id];

  return (
    <AppShell user={user}>
      <Link href="/learn" className="text-sm muted">← חזרה ללומדים</Link>
      <div className="flex items-start justify-between gap-3 mt-2 flex-wrap">
        <h1 className="text-2xl font-bold">{lesson.titleHe}</h1>
        {st?.status === "completed" ? <Badge tone="good">הושלם</Badge> : null}
      </div>
      <p className="muted mt-1">{lesson.descriptionHe}</p>
      <Card className="mt-4">
        <h2 className="font-semibold mb-2">מטרות השיעור</h2>
        <ul className="list-disc pr-5 text-sm text-slate-300 space-y-1">{lesson.objectivesHe.map((o) => <li key={o}>{o}</li>)}</ul>
      </Card>
      {lesson.sections.map((s) => (
        <Card key={s.headingHe} className="mt-3">
          <h2 className="font-semibold mb-1.5">{s.headingHe}</h2>
          <p className="text-slate-300 leading-relaxed">{s.bodyHe}</p>
        </Card>
      ))}
      <h2 className="font-semibold text-lg mt-6 mb-3">בדיקת ידע</h2>
      <LessonQuiz lesson={lesson} />
    </AppShell>
  );
}
