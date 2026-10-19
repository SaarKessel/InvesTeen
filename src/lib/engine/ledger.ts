import type { DatabaseSync } from "node:sqlite";
import type { MinorUnits } from "@/lib/money";
import { now } from "@/lib/db";

export type LedgerEntryType = "initial_deposit" | "trade_buy" | "trade_sell" | "fee" | "adjustment";

export interface LedgerEntry {
  id: number;
  accountId: string;
  entryType: LedgerEntryType;
  amountMinor: MinorUnits;
  refType: string | null;
  refId: string | null;
  createdAt: number;
}

/** Append-only posting. Balances are never updated directly - only derived. */
export function postEntry(
  db: DatabaseSync,
  accountId: string,
  entryType: LedgerEntryType,
  amountMinor: MinorUnits,
  refType: string | null = null,
  refId: string | null = null
): void {
  if (!Number.isSafeInteger(amountMinor)) throw new Error("ledger amount must be integer minor units");
  db.prepare(
    "INSERT INTO virtual_account_ledger (account_id, entry_type, amount_minor, ref_type, ref_id, created_at) VALUES (?,?,?,?,?,?)"
  ).run(accountId, entryType, amountMinor, refType, refId, now());
}

/** Cash balance derived from the append-only ledger. This is the ONLY source of truth. */
export function cashBalance(db: DatabaseSync, accountId: string): MinorUnits {
  const row = db
    .prepare("SELECT COALESCE(SUM(amount_minor),0) AS bal FROM virtual_account_ledger WHERE account_id = ?")
    .get(accountId) as { bal: number };
  return row.bal;
}

export function ledgerHistory(db: DatabaseSync, accountId: string): LedgerEntry[] {
  const rows = db
    .prepare(
      "SELECT id, account_id AS accountId, entry_type AS entryType, amount_minor AS amountMinor, ref_type AS refType, ref_id AS refId, created_at AS createdAt FROM virtual_account_ledger WHERE account_id = ? ORDER BY id ASC"
    )
    .all(accountId) as unknown as LedgerEntry[];
  return rows;
}
