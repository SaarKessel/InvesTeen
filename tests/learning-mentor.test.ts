import { describe, it, expect, beforeEach } from "vitest";
import type { DatabaseSync } from "node:sqlite";
import { freshTestDb, newId } from "@/lib/db";
import { SeededMarketProvider, seedMarketData } from "@/lib/market/seeded";
import { createVirtualAccount } from "@/lib/engine/accounts";
import { executeOrder } from "@/lib/engine/orders";
import { completeLesson, lessonProgress, completeMission, missionProgress } from "@/lib/learning";
import { mentorRespond } from "@/lib/mentor/service";
import { award, userAchievements, userLevel } from "@/lib/gamification";

let db: DatabaseSync;
let market: SeededMarketProvider;

beforeEach(() => {
  db = freshTestDb();
  seedMarketData(db);
  market = new SeededMarketProvider(db);
  db.prepare("INSERT INTO users (id, username, password_hash, age_band, created_at) VALUES (?,?,?,?,?)")
    .run("u1", "teen1", "x", "14-15", Date.now());
  createVirtualAccount(db, "u1");
});

describe("learning", () => {
  it("grades server-side and persists completion", () => {
    // a1 lesson: correct answers are [1, 0, 2]
    const bad = completeLesson(db, "u1", "a1-saving-vs-investing", [0, 0, 0]);
    expect(bad.ok).toBe(false);
    expect(lessonProgress(db, "u1")["a1-saving-vs-investing"]).toBeUndefined();
    const good = completeLesson(db, "u1", "a1-saving-vs-investing", [1, 0, 2]);
    expect(good.ok).toBe(true);
    expect(good.scorePct).toBe(100);
    expect(lessonProgress(db, "u1")["a1-saving-vs-investing"].status).toBe("completed");
  });

  it("awards achievements from verified activity only", () => {
    completeLesson(db, "u1", "a1-saving-vs-investing", [1, 0, 2]);
    const ids = userAchievements(db, "u1").map((a) => a.id);
    expect(ids).toContain("first-lesson");
    // awarding twice does not duplicate
    expect(award(db, "u1", "first-lesson")).toBe(false);
  });

  it("levels reflect completed lessons", () => {
    expect(userLevel(db, "u1").level).toBe(1);
    completeLesson(db, "u1", "a1-saving-vs-investing", [1, 0, 2]);
    completeLesson(db, "u1", "a2-inflation", [1, 0, 1]);
    expect(userLevel(db, "u1").level).toBe(3);
  });

  it("mission completion persists", () => {
    completeMission(db, "u1", "m2-inflation", "{\"summary\":\"x\"}");
    expect(missionProgress(db, "u1")["m2-inflation"]).toBe("completed");
  });
});

describe("mentor", () => {
  it("refuses personalized stock picks", () => {
    const r = mentorRespond(db, market, "u1", "איזו מניה תעשה אותי עשיר?");
    expect(r).toContain("לא נותן המלצות");
  });
  it("never promises guaranteed returns", () => {
    const r = mentorRespond(db, market, "u1", "יש משהו מובטח בלי סיכון בכלל?");
    expect(r).toContain("אין השקעה עם תשואה מובטחת");
  });
  it("explains concepts", () => {
    expect(mentorRespond(db, market, "u1", "מה זה ריבית דריבית?")).toContain("ריבית דריבית");
    expect(mentorRespond(db, market, "u1", "מה זה פיזור?")).toContain("פיזור");
  });
  it("analyzes the portfolio with engine numbers only", () => {
    const acct = createVirtualAccount(db, "u1");
    executeOrder(db, market, acct.id, "buy", "OFK", 5, newId());
    const r = mentorRespond(db, market, "u1", "נתח את התיק שלי");
    expect(r).toContain("אופק טכנולוגיות");
    expect(r).toContain("סימולציה");
  });
});

describe("account deletion", () => {
  it("removes all user data across tables", async () => {
    const { deleteAccount } = await import("@/lib/deletion");
    const acct = createVirtualAccount(db, "u1");
    executeOrder(db, market, acct.id, "buy", "OFK", 2, newId());
    completeLesson(db, "u1", "a1-saving-vs-investing", [1, 0, 2]);
    db.prepare("INSERT INTO sessions (token, user_id, expires_at, created_at) VALUES (?,?,?,?)").run("tok", "u1", Date.now() + 1000, Date.now());
    db.prepare("INSERT INTO ai_conversations (id, user_id, created_at) VALUES (?,?,?)").run("c1", "u1", Date.now());
    deleteAccount(db, "u1");
    const checks: [string, string][] = [
      ["users", "id = 'u1'"], ["sessions", "user_id = 'u1'"], ["virtual_accounts", `id = '${acct.id}'`],
      ["virtual_account_ledger", `account_id = '${acct.id}'`], ["positions", `account_id = '${acct.id}'`],
      ["simulated_orders", `account_id = '${acct.id}'`], ["lesson_progress", "user_id = 'u1'"],
      ["user_achievements", "user_id = 'u1'"], ["ai_conversations", "user_id = 'u1'"]
    ];
    for (const [table, where] of checks) {
      const c = (db.prepare(`SELECT COUNT(*) AS c FROM ${table} WHERE ${where}`).get() as { c: number }).c;
      expect(c, `${table} should be empty`).toBe(0);
    }
  });
});

describe("guardian flow", () => {
  it("pending -> approve -> guardian sees learning progress only", async () => {
    const { pendingRequestsFor, linkedTeensProgress, outgoingRequestOf } = await import("@/lib/guardian");
    db.prepare("INSERT INTO users (id, username, password_hash, age_band, created_at) VALUES (?,?,?,?,?)").run("g1", "parent1", "x", "16-17", Date.now());
    completeLesson(db, "u1", "a1-saving-vs-investing", [1, 0, 2]);
    // request
    db.prepare("INSERT INTO guardian_relationships (guardian_user_id, teen_user_id, status, created_at) VALUES (?,?,?,?)").run("g1", "u1", "pending", Date.now());
    expect(pendingRequestsFor(db, "g1")).toHaveLength(1);
    expect(linkedTeensProgress(db, "g1")).toHaveLength(0); // nothing shared before approval
    expect(outgoingRequestOf(db, "u1")?.status).toBe("pending");
    // approve
    db.prepare("UPDATE guardian_relationships SET status='active' WHERE guardian_user_id='g1' AND teen_user_id='u1'").run();
    const teens = linkedTeensProgress(db, "g1");
    expect(teens).toHaveLength(1);
    expect(teens[0].teenUsername).toBe("teen1");
    expect(teens[0].lessonsCompleted).toBe(1);
  });
});
