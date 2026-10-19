import type { DatabaseSync } from "node:sqlite";
import { userLevel } from "@/lib/gamification";

export interface PendingRequest { teenId: string; teenUsername: string; createdAt: number; }
export interface LinkedTeen {
  teenId: string; teenUsername: string; level: number; levelTitle: string;
  lessonsCompleted: number; achievementsCount: number; missionsCompleted: number;
}

export function pendingRequestsFor(db: DatabaseSync, guardianId: string): PendingRequest[] {
  return db.prepare(
    `SELECT g.teen_user_id AS teenId, u.username AS teenUsername, g.created_at AS createdAt
     FROM guardian_relationships g JOIN users u ON u.id = g.teen_user_id
     WHERE g.guardian_user_id = ? AND g.status = 'pending' ORDER BY g.created_at DESC`
  ).all(guardianId) as unknown as PendingRequest[];
}

export function outgoingRequestOf(db: DatabaseSync, teenId: string): { guardianUsername: string; status: string } | null {
  const row = db.prepare(
    `SELECT u.username AS guardianUsername, g.status FROM guardian_relationships g
     JOIN users u ON u.id = g.guardian_user_id WHERE g.teen_user_id = ? ORDER BY g.created_at DESC LIMIT 1`
  ).get(teenId) as { guardianUsername: string; status: string } | undefined;
  return row ?? null;
}

/** Progress visible to a guardian: learning only - never mentor conversations. */
export function linkedTeensProgress(db: DatabaseSync, guardianId: string): LinkedTeen[] {
  const rows = db.prepare(
    `SELECT g.teen_user_id AS teenId, u.username AS teenUsername
     FROM guardian_relationships g JOIN users u ON u.id = g.teen_user_id
     WHERE g.guardian_user_id = ? AND g.status = 'active'`
  ).all(guardianId) as unknown as { teenId: string; teenUsername: string }[];
  return rows.map((r) => {
    const level = userLevel(db, r.teenId);
    const lessons = (db.prepare("SELECT COUNT(*) AS c FROM lesson_progress WHERE user_id = ? AND status='completed'").get(r.teenId) as { c: number }).c;
    const ach = (db.prepare("SELECT COUNT(*) AS c FROM user_achievements WHERE user_id = ?").get(r.teenId) as { c: number }).c;
    const missions = (db.prepare("SELECT COUNT(*) AS c FROM mission_progress WHERE user_id = ? AND status='completed'").get(r.teenId) as { c: number }).c;
    return { teenId: r.teenId, teenUsername: r.teenUsername, level: level.level, levelTitle: level.titleHe,
      lessonsCompleted: lessons, achievementsCount: ach, missionsCompleted: missions };
  });
}
