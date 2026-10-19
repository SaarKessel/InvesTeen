import type { DatabaseSync } from "node:sqlite";
import { now } from "@/lib/db";

/**
 * Account + data deletion workflow (brief sections 13/17).
 * Removes all user rows across every table. The audit log keeps one anonymized event.
 */
export function deleteAccount(db: DatabaseSync, userId: string): void {
  const acct = db.prepare("SELECT id FROM virtual_accounts WHERE user_id = ?").get(userId) as { id: string } | undefined;
  db.exec("BEGIN IMMEDIATE");
  try {
    if (acct) {
      db.prepare("DELETE FROM virtual_account_ledger WHERE account_id = ?").run(acct.id);
      db.prepare("DELETE FROM simulated_orders WHERE account_id = ?").run(acct.id);
      db.prepare("DELETE FROM positions WHERE account_id = ?").run(acct.id);
      db.prepare("DELETE FROM realized_events WHERE account_id = ?").run(acct.id);
      db.prepare("DELETE FROM virtual_accounts WHERE id = ?").run(acct.id);
    }
    db.prepare("DELETE FROM sessions WHERE user_id = ?").run(userId);
    db.prepare("DELETE FROM lesson_progress WHERE user_id = ?").run(userId);
    db.prepare("DELETE FROM mission_progress WHERE user_id = ?").run(userId);
    db.prepare("DELETE FROM user_achievements WHERE user_id = ?").run(userId);
    const convs = db.prepare("SELECT id FROM ai_conversations WHERE user_id = ?").all(userId) as unknown as { id: string }[];
    for (const c of convs) db.prepare("DELETE FROM ai_messages WHERE conversation_id = ?").run(c.id);
    db.prepare("DELETE FROM ai_conversations WHERE user_id = ?").run(userId);
    db.prepare("DELETE FROM guardian_relationships WHERE guardian_user_id = ? OR teen_user_id = ?").run(userId, userId);
    db.prepare("DELETE FROM consent_records WHERE teen_user_id = ? OR guardian_user_id = ?").run(userId, userId);
    db.prepare("DELETE FROM users WHERE id = ?").run(userId);
    db.prepare("INSERT INTO audit_events (user_id, action, created_at) VALUES (NULL, 'user.deleted', ?)").run(now());
    db.exec("COMMIT");
  } catch (e) {
    db.exec("ROLLBACK");
    throw e;
  }
}
