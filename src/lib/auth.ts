import { scryptSync, randomBytes, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getDb, newId, now } from "@/lib/db";
import { createVirtualAccount } from "@/lib/engine/accounts";
import { seedMarketData } from "@/lib/market/seeded";

/** Server-only auth: scrypt password hashing + httpOnly session cookies. */

const SESSION_COOKIE = "it_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30;

import { AGE_BANDS, type AgeBand } from "@/lib/constants";
export { AGE_BANDS } from "@/lib/constants";
export type { AgeBand } from "@/lib/constants";

export interface SessionUser {
  id: string;
  username: string;
  ageBand: AgeBand;
}

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `scrypt:${salt}:${hash}`;
}

function verifyPassword(password: string, stored: string): boolean {
  const [scheme, salt, hash] = stored.split(":");
  if (scheme !== "scrypt" || !salt || !hash) return false;
  const candidate = scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, "hex");
  return candidate.length === expected.length && timingSafeEqual(candidate, expected);
}

export type RegisterResult = { ok: true; userId: string } | { ok: false; errorHe: string };

export function registerUser(username: string, password: string, ageBand: AgeBand): RegisterResult {
  const db = getDb();
  seedMarketData(db);
  const name = username.trim();
  if (name.length < 2 || name.length > 24) return { ok: false, errorHe: "שם משתמש צריך להיות בין 2 ל-24 תווים." };
  if (!/^[\w\u0590-\u05FF.-]+$/u.test(name)) return { ok: false, errorHe: "שם משתמש יכול להכיל אותיות, ספרות, נקודה, מקף וקו תחתון בלבד." };
  if (password.length < 6) return { ok: false, errorHe: "הסיסמה צריכה להיות באורך 6 תווים לפחות." };
  if (!AGE_BANDS.includes(ageBand)) return { ok: false, errorHe: "יש לבחור קבוצת גיל." };
  const exists = db.prepare("SELECT id FROM users WHERE username = ?").get(name);
  if (exists) return { ok: false, errorHe: "שם המשתמש כבר תפוס. כדאי לבחור שם אחר." };
  const id = newId();
  db.prepare("INSERT INTO users (id, username, password_hash, age_band, created_at) VALUES (?,?,?,?,?)")
    .run(id, name, hashPassword(password), ageBand, now());
  createVirtualAccount(db, id); // initial virtual balance, exactly once
  db.prepare("INSERT INTO audit_events (user_id, action, created_at) VALUES (?,?,?)").run(id, "user.registered", now());
  return { ok: true, userId: id };
}

export function loginUser(username: string, password: string): SessionUser | null {
  const db = getDb();
  const row = db.prepare("SELECT id, username, password_hash AS ph, age_band AS ageBand FROM users WHERE username = ?")
    .get(username.trim()) as { id: string; username: string; ph: string; ageBand: AgeBand } | undefined;
  if (!row || !verifyPassword(password, row.ph)) return null;
  return { id: row.id, username: row.username, ageBand: row.ageBand };
}

export function createSession(userId: string): string {
  const db = getDb();
  const token = randomBytes(32).toString("hex");
  db.prepare("INSERT INTO sessions (token, user_id, expires_at, created_at) VALUES (?,?,?,?)")
    .run(token, userId, now() + SESSION_TTL_MS, now());
  cookies().set(SESSION_COOKIE, token, {
    httpOnly: true, sameSite: "lax", path: "/", maxAge: SESSION_TTL_MS / 1000
  });
  return token;
}

export function destroySession(): void {
  const db = getDb();
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (token) db.prepare("DELETE FROM sessions WHERE token = ?").run(token);
  cookies().delete(SESSION_COOKIE);
}

export function currentUser(): SessionUser | null {
  const db = getDb();
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const row = db.prepare(
    `SELECT u.id, u.username, u.age_band AS ageBand FROM sessions s JOIN users u ON u.id = s.user_id
     WHERE s.token = ? AND s.expires_at > ?`
  ).get(token, now()) as SessionUser | undefined;
  return row ?? null;
}

export function requireUser(): SessionUser {
  const u = currentUser();
  if (!u) redirect("/login");
  return u;
}
