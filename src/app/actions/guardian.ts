"use server";
import { revalidatePath } from "next/cache";
import { getDb, now } from "@/lib/db";
import { requireUser } from "@/lib/auth";

export type GuardianState = { error?: string; ok?: boolean };

/** Teen (or any user) requests to link a guardian by username. Nothing is shared until the guardian approves. */
export async function requestGuardianAction(_prev: GuardianState, formData: FormData): Promise<GuardianState> {
  const user = requireUser();
  const db = getDb();
  const guardianName = String(formData.get("guardian") ?? "").trim();
  const guardian = db.prepare("SELECT id FROM users WHERE username = ?").get(guardianName) as { id: string } | undefined;
  if (!guardian) return { error: "לא נמצא משתמש בשם הזה. ההורה צריך לפתוח חשבון קודם." };
  if (guardian.id === user.id) return { error: "אי אפשר לקשר חשבון לעצמו." };
  db.prepare(
    "INSERT OR REPLACE INTO guardian_relationships (guardian_user_id, teen_user_id, status, created_at) VALUES (?,?,?,?)"
  ).run(guardian.id, user.id, "pending", now());
  db.prepare("INSERT INTO audit_events (user_id, action, meta, created_at) VALUES (?,?,?,?)")
    .run(user.id, "guardian.requested", JSON.stringify({ guardian: guardianName }), now());
  revalidatePath("/parent");
  return { ok: true };
}

/** Guardian approves a pending link. Only the named guardian can approve; writes a consent record. */
export async function approveGuardianAction(formData: FormData) {
  const user = requireUser();
  const db = getDb();
  const teenId = String(formData.get("teenId") ?? "");
  const rel = db.prepare(
    "SELECT * FROM guardian_relationships WHERE guardian_user_id = ? AND teen_user_id = ? AND status = 'pending'"
  ).get(user.id, teenId);
  if (!rel) return;
  db.exec("BEGIN IMMEDIATE");
  try {
    db.prepare("UPDATE guardian_relationships SET status = 'active' WHERE guardian_user_id = ? AND teen_user_id = ?")
      .run(user.id, teenId);
    db.prepare("INSERT INTO consent_records (teen_user_id, guardian_user_id, scope, granted, created_at) VALUES (?,?,?,1,?)")
      .run(teenId, user.id, "view_learning_progress", now());
    db.prepare("INSERT INTO audit_events (user_id, action, meta, created_at) VALUES (?,?,?,?)")
      .run(user.id, "guardian.approved", JSON.stringify({ teenId }), now());
    db.exec("COMMIT");
  } catch (e) {
    db.exec("ROLLBACK");
    throw e;
  }
  revalidatePath("/parent");
}

/** Guardian revokes an active link. */
export async function revokeGuardianAction(formData: FormData) {
  const user = requireUser();
  const db = getDb();
  const teenId = String(formData.get("teenId") ?? "");
  db.prepare("DELETE FROM guardian_relationships WHERE guardian_user_id = ? AND teen_user_id = ?").run(user.id, teenId);
  db.prepare("DELETE FROM consent_records WHERE guardian_user_id = ? AND teen_user_id = ?").run(user.id, teenId);
  db.prepare("INSERT INTO audit_events (user_id, action, meta, created_at) VALUES (?,?,?,?)")
    .run(user.id, "guardian.revoked", JSON.stringify({ teenId }), now());
  revalidatePath("/parent");
}
