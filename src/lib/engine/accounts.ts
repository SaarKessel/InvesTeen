import type { DatabaseSync } from "node:sqlite";
import type { MinorUnits } from "@/lib/money";
import { newId, now } from "@/lib/db";
import { postEntry } from "./ledger";

export interface VirtualAccount {
  id: string;
  userId: string;
  startingBalanceMinor: MinorUnits;
  createdAt: number;
}

export const DEFAULT_STARTING_BALANCE_MINOR = 1_000_000; // 10,000.00 virtual units

/**
 * Create the virtual account exactly once per user (users.user_id UNIQUE on the account row
 * plus a transaction guard). The starting balance enters through the ledger as an
 * initial_deposit so the ledger always explains the balance.
 */
export function createVirtualAccount(
  db: DatabaseSync,
  userId: string,
  startingBalanceMinor: MinorUnits = DEFAULT_STARTING_BALANCE_MINOR
): VirtualAccount {
  const existing = getAccountByUser(db, userId);
  if (existing) return existing;
  const id = newId();
  db.exec("BEGIN IMMEDIATE");
  try {
    const again = getAccountByUser(db, userId);
    if (again) { db.exec("COMMIT"); return again; }
    db.prepare(
      "INSERT INTO virtual_accounts (id, user_id, starting_balance_minor, created_at) VALUES (?,?,?,?)"
    ).run(id, userId, startingBalanceMinor, now());
    postEntry(db, id, "initial_deposit", startingBalanceMinor, "account", id);
    db.exec("COMMIT");
  } catch (e) {
    db.exec("ROLLBACK");
    throw e;
  }
  return { id, userId, startingBalanceMinor, createdAt: now() };
}

export function getAccountByUser(db: DatabaseSync, userId: string): VirtualAccount | null {
  const row = db
    .prepare("SELECT id, user_id AS userId, starting_balance_minor AS startingBalanceMinor, created_at AS createdAt FROM virtual_accounts WHERE user_id = ?")
    .get(userId) as VirtualAccount | undefined;
  return row ?? null;
}
