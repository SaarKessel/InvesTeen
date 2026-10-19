"use server";
import { z } from "zod";
import { getDb, now } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { DIAGNOSTIC } from "@/lib/content/assessment";
import { LESSONS } from "@/lib/content/lessons";

const Schema = z.object({ answers: z.array(z.coerce.number().int().min(0).max(9)).length(DIAGNOSTIC.length) });

export interface DiagnosticResult {
  ok?: boolean;
  error?: string;
  scorePct?: number;
  weakTopicIds?: string[];
  recommendedLessonIds?: string[];
}

export async function gradeDiagnosticAction(_prev: DiagnosticResult, formData: FormData): Promise<DiagnosticResult> {
  const user = requireUser();
  const parsed = Schema.safeParse({
    answers: DIAGNOSTIC.map((_, i) => formData.get(`answer-${i}`)).map((v) => (v === null ? NaN : v))
  });
  if (!parsed.success) return { error: "יש לענות על כל השאלות." };
  const weak = DIAGNOSTIC.filter((q, i) => parsed.data.answers[i] !== q.correctIndex);
  const scorePct = Math.round(((DIAGNOSTIC.length - weak.length) / DIAGNOSTIC.length) * 100);
  const weakLessonIds = weak.map((q) => q.lessonId);
  const db = getDb();
  db.prepare("INSERT INTO diagnostic_attempts (user_id, weak_lesson_ids, score_pct, created_at) VALUES (?,?,?,?)")
    .run(user.id, JSON.stringify(weakLessonIds), scorePct, now());
  db.prepare("INSERT INTO audit_events (user_id, action, meta, created_at) VALUES (?,?,?,?)")
    .run(user.id, "diagnostic.completed", JSON.stringify({ scorePct }), now());
  // Personalized path: weak topics first (each with its reason), then the remaining lessons.
  const rest = LESSONS.filter((l) => !weakLessonIds.includes(l.id)).map((l) => l.id);
  return { ok: true, scorePct, weakTopicIds: weak.map((q) => q.id), recommendedLessonIds: [...weakLessonIds, ...rest] };
}
