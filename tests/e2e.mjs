/**
 * End-to-end smoke flow (Playwright + system Chrome) against a throwaway DB.
 * Run: node tests/e2e.mjs  (builds not required; starts `next start` on port 3200
 * with INVESTEEN_DB=/tmp/investeen-e2e.db - requires a prior `npm run build`).
 */
import { chromium } from "playwright";
import { spawn } from "node:child_process";
import { rmSync } from "node:fs";

const DB = "/tmp/investeen-e2e.db";
rmSync(DB, { force: true }); rmSync(DB + "-wal", { force: true }); rmSync(DB + "-shm", { force: true });

const server = spawn("npx", ["next", "start", "-p", "3200"], {
  env: { ...process.env, INVESTEEN_DB: DB }, stdio: "ignore"
});
const stop = () => { try { server.kill("SIGTERM"); } catch {} };
process.on("exit", stop);

const base = "http://localhost:3200";
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

let failures = 0;
const check = (name, cond) => {
  console.log(`${cond ? "PASS" : "FAIL"}  ${name}`);
  if (!cond) failures++;
};

await wait(4500);
const browser = await chromium.launch({ executablePath: "/usr/bin/google-chrome", args: ["--no-sandbox"] });
try {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();
  page.setDefaultTimeout(10000);

  // 1) Register
  await page.goto(base + "/register");
  await page.fill("#username", "e2e_teen");
  await page.fill("#password", "secret1");
  await page.selectOption("#ageBand", { index: 1 });
  await page.click("button:has-text('יצירת חשבון')");
  await page.waitForURL(/onboarding|dashboard/, { timeout: 15000 });
  check("register redirects into the app", true);

  // 2) Onboarding diagnostic: answer all six, get a path
  await page.goto(base + "/onboarding");
  await page.click("button:has-text('התחילו באבחון')");
  for (let i = 0; i < 6; i++) await page.locator("fieldset").nth(i).locator("input[type=radio]").first().check();
  await page.click("button:has-text('למסלול שלי')");
  await page.waitForSelector("text=המסלול שלך");
  check("diagnostic produces a personalized path", true);

  // 3) Markets -> asset -> buy with stepper
  await page.goto(base + "/markets");
  await page.waitForSelector("text=אופק טכנולוגיות");
  await page.goto(base + "/markets/OFK");
  await page.locator("button[aria-label='עוד']").first().click(); // qty -> 2
  await page.locator("[role=slider][aria-label*='קנייה']").press("Enter"); // keyboard path of DragToConfirm
  await page.waitForSelector("text=בוצעה", { timeout: 15000 }); // undo toast
  check("virtual buy fills and shows the undo toast", true);

  // 4) Dashboard hero shows value < 10,000 after the buy and the chart exists
  await page.goto(base + "/dashboard");
  await page.waitForSelector("text=שווי התיק הווירטואלי");
  const val = await page.locator(".display.tabular-nums").first().textContent();
  const num = Number(String(val).replace(/[^0-9.]/g, ""));
  check(`dashboard total in range after buy (${val})`, num > 9000 && num <= 10000.01);
  await page.click("[role=tab]:has-text('ALL')");
  check("range tabs switch", true);

  // 5) Portfolio row for OFK exists
  await page.goto(base + "/portfolio");
  await page.waitForSelector("text=אופק טכנולוגיות");
  check("portfolio shows the new position", true);

  // 6) Lesson quiz completes
  await page.goto(base + "/learn/a1-saving-vs-investing");
  const groups = await page.locator("fieldset").count();
  for (let i = 0; i < groups; i++) await page.locator("fieldset").nth(i).locator("input[type=radio]").first().check();
  await page.click("button:has-text('בדיקת תשובות')");
  await page.waitForSelector("text=תשובות נכונות", { timeout: 15000 });
  check("lesson quiz grades with per-question answers", true);

  // 7) Mentor answers
  await page.goto(base + "/mentor");
  await page.fill("input.input", "מה זה פיזור?");
  await page.click("button:has-text('שליחה')");
  await page.waitForSelector("text=פיזור", { timeout: 15000 });
  check("mentor replies", true);
} catch (e) {
  console.error("E2E exception:", String(e).slice(0, 500));
  failures++;
} finally {
  await browser.close();
  stop();
}
console.log(failures === 0 ? "E2E: all passed" : `E2E: ${failures} failure(s)`);
process.exit(failures === 0 ? 0 : 1);
