import type { DatabaseSync } from "node:sqlite";
import { now } from "@/lib/db";
import { getLesson } from "@/lib/content/lessons";
import { award } from "@/lib/gamification";

/**
 * Lesson completion - server-side grading. The answer key never leaves the server;
 * achievements cannot be unlocked by client state.
 */
export function completeLesson(
  db: DatabaseSync,
  userId: string,
  lessonId: string,
  answers: number[]
): { ok: boolean; scorePct?: number; correct?: boolean[]; errorHe?: string } {
  const lesson = getLesson(lessonId);
  if (!lesson) return { ok: false, errorHe: "השיעור לא נמצא." };
  if (!Array.isArray(answers) || answers.length !== lesson.checks.length) {
    return { ok: false, errorHe: "יש לענות על כל השאלות." };
  }
  const correct = lesson.checks.map((c, i) => answers[i] === c.correctIndex);
  const scorePct = Math.round((correct.filter(Boolean).length / lesson.checks.length) * 100);
  if (scorePct < 67) {
    return { ok: false, scorePct, correct, errorHe: "כמעט! כדי לסיים שיעור צריך לפחות שתי תשובות נכונות. קרא שוב את הסעיפים ונסה שוב." };
  }
  db.prepare(
    `INSERT INTO lesson_progress (user_id, lesson_id, status, score_pct, completed_at) VALUES (?,?,?,?,?)
     ON CONFLICT(user_id, lesson_id) DO UPDATE SET status='completed', score_pct=excluded.score_pct, completed_at=excluded.completed_at`
  ).run(userId, lessonId, "completed", scorePct, now());
  award(db, userId, "first-lesson");
  if (lessonId === "a3-compound-growth") award(db, userId, "compound-explorer");
  if (lessonId === "a2-inflation") award(db, userId, "inflation-fighter");
  if (lessonId === "b2-diversification-risk") award(db, userId, "diversification-understood");
  return { ok: true, scorePct, correct };
}

export function lessonProgress(db: DatabaseSync, userId: string): Record<string, { status: string; scorePct: number | null }> {
  const rows = db.prepare(
    "SELECT lesson_id AS id, status, score_pct AS scorePct FROM lesson_progress WHERE user_id = ?"
  ).all(userId) as unknown as { id: string; status: string; scorePct: number | null }[];
  return Object.fromEntries(rows.map((r) => [r.id, { status: r.status, scorePct: r.scorePct }]));
}

export function missionProgress(db: DatabaseSync, userId: string): Record<string, string> {
  const rows = db.prepare("SELECT mission_id AS id, status FROM mission_progress WHERE user_id = ?").all(userId) as unknown as { id: string; status: string }[];
  return Object.fromEntries(rows.map((r) => [r.id, r.status]));
}

export function completeMission(db: DatabaseSync, userId: string, missionId: string, resultJson: string): void {
  db.prepare(
    `INSERT INTO mission_progress (user_id, mission_id, status, result_json, completed_at) VALUES (?,?,?,?,?)
     ON CONFLICT(user_id, mission_id) DO UPDATE SET status='completed', result_json=excluded.result_json, completed_at=excluded.completed_at`
  ).run(userId, missionId, "completed", resultJson, now());
}
