import { DatabaseSync } from "node:sqlite";
import path from "node:path";
import fs from "node:fs";

/**
 * Local relational store (node:sqlite). The ledger is append-only; balances are derived.
 * This module is server-only. Never import it from client components.
 */

const MIGRATIONS: string[] = [
  `CREATE TABLE IF NOT EXISTS users (
     id TEXT PRIMARY KEY,
     username TEXT NOT NULL UNIQUE COLLATE NOCASE,
     password_hash TEXT NOT NULL,
     age_band TEXT NOT NULL CHECK (age_band IN ('12-13','14-15','16-17')),
     created_at INTEGER NOT NULL
   )`,
  `CREATE TABLE IF NOT EXISTS sessions (
     token TEXT PRIMARY KEY,
     user_id TEXT NOT NULL REFERENCES users(id),
     expires_at INTEGER NOT NULL,
     created_at INTEGER NOT NULL
   )`,
  `CREATE TABLE IF NOT EXISTS virtual_accounts (
     id TEXT PRIMARY KEY,
     user_id TEXT NOT NULL UNIQUE REFERENCES users(id),
     starting_balance_minor INTEGER NOT NULL CHECK (starting_balance_minor > 0),
     created_at INTEGER NOT NULL
   )`,
  `CREATE TABLE IF NOT EXISTS virtual_account_ledger (
     id INTEGER PRIMARY KEY AUTOINCREMENT,
     account_id TEXT NOT NULL REFERENCES virtual_accounts(id),
     entry_type TEXT NOT NULL CHECK (entry_type IN ('initial_deposit','trade_buy','trade_sell','fee','adjustment')),
     amount_minor INTEGER NOT NULL,
     ref_type TEXT,
     ref_id TEXT,
     created_at INTEGER NOT NULL
   )`,
  `CREATE INDEX IF NOT EXISTS idx_ledger_account ON virtual_account_ledger(account_id)`,
  `CREATE TABLE IF NOT EXISTS assets (
     symbol TEXT PRIMARY KEY,
     name_he TEXT NOT NULL,
     kind TEXT NOT NULL CHECK (kind IN ('stock','index_fund','bond_fund')),
     sector TEXT,
     description_he TEXT NOT NULL,
     fictional INTEGER NOT NULL DEFAULT 1
   )`,
  `CREATE TABLE IF NOT EXISTS market_prices (
     symbol TEXT NOT NULL REFERENCES assets(symbol),
     day INTEGER NOT NULL,
     price_minor INTEGER NOT NULL CHECK (price_minor > 0),
     source TEXT NOT NULL DEFAULT 'SIMULATED_EDUCATIONAL',
     PRIMARY KEY (symbol, day)
   )`,
  `CREATE TABLE IF NOT EXISTS simulated_orders (
     id TEXT PRIMARY KEY,
     client_order_id TEXT NOT NULL UNIQUE,
     account_id TEXT NOT NULL REFERENCES virtual_accounts(id),
     symbol TEXT NOT NULL REFERENCES assets(symbol),
     side TEXT NOT NULL CHECK (side IN ('buy','sell')),
     qty INTEGER NOT NULL CHECK (qty > 0),
     price_minor INTEGER NOT NULL CHECK (price_minor > 0),
     price_day INTEGER NOT NULL,
     fee_minor INTEGER NOT NULL DEFAULT 0 CHECK (fee_minor >= 0),
     status TEXT NOT NULL CHECK (status IN ('filled','rejected')),
     error TEXT,
     created_at INTEGER NOT NULL
   )`,
  `CREATE INDEX IF NOT EXISTS idx_orders_account ON simulated_orders(account_id, created_at)`,
  `CREATE TABLE IF NOT EXISTS positions (
     account_id TEXT NOT NULL REFERENCES virtual_accounts(id),
     symbol TEXT NOT NULL REFERENCES assets(symbol),
     qty INTEGER NOT NULL CHECK (qty >= 0),
     total_cost_minor INTEGER NOT NULL CHECK (total_cost_minor >= 0),
     PRIMARY KEY (account_id, symbol)
   )`,
  `CREATE TABLE IF NOT EXISTS realized_events (
     id INTEGER PRIMARY KEY AUTOINCREMENT,
     account_id TEXT NOT NULL REFERENCES virtual_accounts(id),
     symbol TEXT NOT NULL,
     qty INTEGER NOT NULL,
     proceeds_minor INTEGER NOT NULL,
     cost_minor INTEGER NOT NULL,
     fee_minor INTEGER NOT NULL,
     pnl_minor INTEGER NOT NULL,
     order_id TEXT NOT NULL REFERENCES simulated_orders(id),
     created_at INTEGER NOT NULL
   )`,
  `CREATE TABLE IF NOT EXISTS lesson_progress (
     user_id TEXT NOT NULL REFERENCES users(id),
     lesson_id TEXT NOT NULL,
     status TEXT NOT NULL CHECK (status IN ('started','completed')),
     score_pct INTEGER,
     completed_at INTEGER,
     PRIMARY KEY (user_id, lesson_id)
   )`,
  `CREATE TABLE IF NOT EXISTS mission_progress (
     user_id TEXT NOT NULL REFERENCES users(id),
     mission_id TEXT NOT NULL,
     status TEXT NOT NULL CHECK (status IN ('started','completed')),
     result_json TEXT,
     completed_at INTEGER,
     PRIMARY KEY (user_id, mission_id)
   )`,
  `CREATE TABLE IF NOT EXISTS achievements (
     id TEXT PRIMARY KEY,
     title_he TEXT NOT NULL,
     description_he TEXT NOT NULL
   )`,
  `CREATE TABLE IF NOT EXISTS user_achievements (
     user_id TEXT NOT NULL REFERENCES users(id),
     achievement_id TEXT NOT NULL REFERENCES achievements(id),
     awarded_at INTEGER NOT NULL,
     PRIMARY KEY (user_id, achievement_id)
   )`,
  `CREATE TABLE IF NOT EXISTS ai_conversations (
     id TEXT PRIMARY KEY,
     user_id TEXT NOT NULL REFERENCES users(id),
     created_at INTEGER NOT NULL
   )`,
  `CREATE TABLE IF NOT EXISTS ai_messages (
     id INTEGER PRIMARY KEY AUTOINCREMENT,
     conversation_id TEXT NOT NULL REFERENCES ai_conversations(id),
     role TEXT NOT NULL CHECK (role IN ('user','mentor')),
     content TEXT NOT NULL,
     created_at INTEGER NOT NULL
   )`,
  `CREATE TABLE IF NOT EXISTS guardian_relationships (
     guardian_user_id TEXT NOT NULL REFERENCES users(id),
     teen_user_id TEXT NOT NULL REFERENCES users(id),
     status TEXT NOT NULL CHECK (status IN ('pending','active')),
     created_at INTEGER NOT NULL,
     PRIMARY KEY (guardian_user_id, teen_user_id)
   )`,
  `CREATE TABLE IF NOT EXISTS consent_records (
     id INTEGER PRIMARY KEY AUTOINCREMENT,
     teen_user_id TEXT NOT NULL REFERENCES users(id),
     guardian_user_id TEXT NOT NULL REFERENCES users(id),
     scope TEXT NOT NULL,
     granted INTEGER NOT NULL CHECK (granted IN (0,1)),
     created_at INTEGER NOT NULL
   )`,
  `CREATE TABLE IF NOT EXISTS diagnostic_attempts (
     id INTEGER PRIMARY KEY AUTOINCREMENT,
     user_id TEXT NOT NULL REFERENCES users(id),
     weak_lesson_ids TEXT NOT NULL,
     score_pct INTEGER NOT NULL,
     created_at INTEGER NOT NULL
   )`,
  `CREATE TABLE IF NOT EXISTS order_undos (
     order_id TEXT PRIMARY KEY REFERENCES simulated_orders(id),
     undo_order_id TEXT NOT NULL REFERENCES simulated_orders(id),
     created_at INTEGER NOT NULL
   )`,
  `CREATE TABLE IF NOT EXISTS audit_events (
     id INTEGER PRIMARY KEY AUTOINCREMENT,
     user_id TEXT,
     action TEXT NOT NULL,
     meta TEXT,
     created_at INTEGER NOT NULL
   )`
];

let db: DatabaseSync | null = null;

export function getDb(dbPath?: string): DatabaseSync {
  if (db) return db;
  const p = dbPath ?? path.join(process.cwd(), "data", "investeen.db");
  if (p !== ":memory:") fs.mkdirSync(path.dirname(p), { recursive: true });
  db = new DatabaseSync(p);
  db.exec("PRAGMA journal_mode = WAL");
  db.exec("PRAGMA foreign_keys = ON");
  for (const m of MIGRATIONS) db.exec(m);
  return db;
}

/** Test helper: fresh in-memory DB. */
export function freshTestDb(): DatabaseSync {
  const d = new DatabaseSync(":memory:");
  d.exec("PRAGMA foreign_keys = ON");
  for (const m of MIGRATIONS) d.exec(m);
  return d;
}

export function now(): number {
  return Date.now();
}

export function newId(): string {
  return crypto.randomUUID();
}
