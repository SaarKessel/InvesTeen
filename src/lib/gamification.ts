import type { DatabaseSync } from "node:sqlite";
import { now } from "@/lib/db";

/**
 * Levels & achievements (brief section 10). Earned through learning and reasoning,
 * never through portfolio profit, trading frequency, or time spent.
 */

export interface LevelDef { level: number; titleHe: string; lessonsRequired: number; }

export const LEVELS: LevelDef[] = [
  { level: 1, titleHe: "חוקר כסף", lessonsRequired: 0 },
  { level: 2, titleHe: "בונה חיסכון", lessonsRequired: 1 },
  { level: 3, titleHe: "לומד שוק", lessonsRequired: 2 },
  { level: 4, titleHe: "אדריכל תיקים", lessonsRequired: 3 },
  { level: 5, titleHe: "אנליסט סיכונים", lessonsRequired: 4 },
  { level: 6, titleHe: "חושב לטווח ארוך", lessonsRequired: 5 },
  { level: 7, titleHe: "אסטרטג פיננסי", lessonsRequired: 7 }
];

export const ACHIEVEMENTS: { id: string; titleHe: string; descriptionHe: string }[] = [
  { id: "first-lesson", titleHe: "צעד ראשון", descriptionHe: "השלמת שיעור ראשון." },
  { id: "diversification-understood", titleHe: "מביני פיזור", descriptionHe: "השלמת את שיעור הפיזור ומשימת \"אל תשים הכול בסל אחד\"." },
  { id: "compound-explorer", titleHe: "חוקר ריבית דריבית", descriptionHe: "השלמת את שיעור ריבית דריבית ואת משימת העמלות." },
  { id: "inflation-fighter", titleHe: "לוחם אינפלציה", descriptionHe: "השלמת את שיעור האינפלציה ומשימת כוח הקנייה." },
  { id: "first-diversified-buy", titleHe: "בונה תיק", descriptionHe: "רכשת שני נכסים שונים בתיק הווירטואלי." }
];

export function seedAchievements(db: DatabaseSync): void {
  const ins = db.prepare("INSERT OR IGNORE INTO achievements (id, title_he, description_he) VALUES (?,?,?)");
  for (const a of ACHIEVEMENTS) ins.run(a.id, a.titleHe, a.descriptionHe);
}

/** Award server-side after verified activity. Idempotent per user. */
export function award(db: DatabaseSync, userId: string, achievementId: string): boolean {
  seedAchievements(db);
  const res = db.prepare(
    "INSERT OR IGNORE INTO user_achievements (user_id, achievement_id, awarded_at) VALUES (?,?,?)"
  ).run(userId, achievementId, now());
  return Number(res.changes) > 0;
}

export function userLevel(db: DatabaseSync, userId: string): LevelDef {
  const completed = (db.prepare(
    "SELECT COUNT(*) AS c FROM lesson_progress WHERE user_id = ? AND status = 'completed'"
  ).get(userId) as { c: number }).c;
  let current = LEVELS[0];
  for (const l of LEVELS) if (completed >= l.lessonsRequired) current = l;
  return current;
}

export function userAchievements(db: DatabaseSync, userId: string): { id: string; titleHe: string; descriptionHe: string; awardedAt: number }[] {
  seedAchievements(db);
  return db.prepare(
    `SELECT a.id, a.title_he AS titleHe, a.description_he AS descriptionHe, ua.awarded_at AS awardedAt
     FROM user_achievements ua JOIN achievements a ON a.id = ua.achievement_id
     WHERE ua.user_id = ? ORDER BY ua.awarded_at DESC`
  ).all(userId) as unknown as { id: string; titleHe: string; descriptionHe: string; awardedAt: number }[];
}
