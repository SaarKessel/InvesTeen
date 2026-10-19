"use server";
import { z } from "zod";
import { getDb, now } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { completeLesson, completeMission } from "@/lib/learning";
import { MISSIONS } from "@/lib/content/missions";

const LessonSchema = z.object({
  lessonId: z.string().min(1).max(64),
  answers: z.array(z.coerce.number().int().min(0).max(9)).max(20)
});

export type LessonResult = { ok?: boolean; error?: string; scorePct?: number; correct?: boolean[] };

export async function completeLessonAction(_prev: LessonResult, formData: FormData): Promise<LessonResult> {
  const user = requireUser();
  const parsed = LessonSchema.safeParse({
    lessonId: formData.get("lessonId"),
    answers: formData.getAll("answer")
  });
  if (!parsed.success) return { error: "יש לענות על כל השאלות." };
  const db = getDb();
  const r = completeLesson(db, user.id, parsed.data.lessonId, parsed.data.answers);
  if (!r.ok) return { error: r.errorHe, scorePct: r.scorePct, correct: r.correct };
  db.prepare("INSERT INTO audit_events (user_id, action, meta, created_at) VALUES (?,?,?,?)")
    .run(user.id, "lesson.completed", JSON.stringify({ lessonId: parsed.data.lessonId, scorePct: r.scorePct }), now());
  return { ok: true, scorePct: r.scorePct, correct: r.correct };
}

export async function completeMissionAction(_prev: { ok?: boolean; error?: string }, formData: FormData) {
  const user = requireUser();
  const missionId = String(formData.get("missionId") ?? "");
  const resultJson = String(formData.get("resultJson") ?? "{}");
  if (!MISSIONS.some((m) => m.id === missionId)) return { error: "המשימה לא נמצאה." };
  const db = getDb();
  completeMission(db, user.id, missionId, resultJson);
  return { ok: true };
}
