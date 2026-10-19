# Release Readiness - InvesTeen MVP

Status: ready for owner-driven deployment. No real money, no real market data, educational simulation only.

## Environment

| Variable | Required | Default | Purpose |
|---|---|---|---|
| `INVESTEEN_DB` | no | `data/investeen.db` | SQLite file path. Set in e2e/tests so dev data is untouched. |

No external API keys are required for the MVP. There are no third-party secrets in the codebase; the AI mentor runs on the local deterministic fallback until the owner supplies a provider key (out of scope for this MVP, must arrive via the owner's secret flow, never in chat).

## Requirements

- Node.js >= 20 (uses the built-in `node:sqlite` module; Node 22+ recommended).
- pnpm (or npm) for install.

## Build and run

    pnpm install
    pnpm build
    pnpm start          # serves the production build on :3000

## Quality gates (all green at release commit)

    pnpm test           # vitest: 32 tests - money math, ledger, orders, learning, mentor guardrails
    pnpm typecheck      # tsc --noEmit, strict
    pnpm build          # next build
    pnpm test:e2e       # full user journey, throwaway DB, headless Chrome (needs `pnpm build` first)

## Database

- SQLite via `node:sqlite`, file at `INVESTEEN_DB` (default `data/investeen.db`).
- Migrations run automatically on first connection (`MIGRATIONS` in `src/lib/db.ts`, idempotent `CREATE TABLE IF NOT EXISTS`). No separate migration step.
- WAL mode + foreign keys enabled. Single-instance deployment only (SQLite is not multi-writer; see Limitations).
- Backups: copy the db file (plus `-wal`/`-shm` while running) or snapshot the volume.
- Demo seed: `node scripts/seed-demo.mjs` creates demo user `yael_learns` with chart-moving history. Never run against production data.

## Deploying (owner action)

Verified against Vercel and Node docs, 2026-10-19:

### Route A - disposable phone demo on Vercel (verified locally, 8/8 e2e + cold-start seed test)

Vercel's function filesystem is read-only with a writable /tmp (up to 500 MB), and instances do not share it (Vercel KB: SQLite cannot provide permanent storage on Vercel). That is fine for a demo if the app reseeds on cold start - which this repo now does:

- Set env vars in the Vercel project: `INVESTEEN_DB=/tmp/investeen.db` and `INVESTEEN_DEMO_SEED=1`.
- `src/instrumentation.ts` + `src/lib/demoSeed.ts` create the demo account (yael_learns) and chart-moving history automatically whenever a fresh instance boots with an empty DB. Registration and login work for the life of a warm instance.
- Node: `engines >=22.13.0` (node:sqlite works without flags from 22.13; Vercel offers 22.x and 24.x, both qualify; only the major is pinned).
- Expected behavior: users/sessions/orders vanish on cold starts, redeploys and across concurrent instances. Say so on the demo link.

Owner setup for Route A: empty GitHub repo + push (PAT via vault), a free Vercel account, import the repo, set the two env vars above. No spending, no DB migration, no code changes.

### Route B - durable accounts (later)

SQLite is single-writer, so durability needs ONE of:
1. A single VM/container (any small VPS, Fly.io machine, Railway/Render service) running `pnpm start` with a mounted volume for `data/` - no code changes; or
2. Swapping the DB layer to a hosted Postgres - a real code change; do it only before real users.

Owner setup for Route B (option 1): a hosting account, one always-on instance, a persistent volume mounted at the app `data/` dir, `pnpm install && pnpm build && pnpm start` behind HTTPS. Keep `INVESTEEN_DEMO_SEED` unset.

Git remote, hosting account, and the deploy itself stay with the owner (per project rules).

## Operational notes

- Logs: server actions log to stdout; audit trail lives in the `audit_events` table.
- Session cookies: httpOnly, server-side tokens in the `sessions` table; no JWT secret to rotate.
- Monitoring: at MVP scale, watch process uptime and disk space for the SQLite file.

## Known limitations (honest list)

1. **AI mentor is a local rule-based fallback.** It answers from fixed educational templates and refuses advice/predictions, but it is not a real LLM. Wiring a provider requires the owner's API key and a prompt/safety review.
2. **SQLite = single instance.** No horizontal scaling, no multi-writer. Fine for MVP demo; move to Postgres before real users.
3. **Market data is a deterministic simulation** of fictional assets (labeled VT). Prices are generated locally; nothing is real market data.
4. **Auth is minimal**: username + scrypt password, no email, no password reset flow, no rate limiting beyond server-side checks. Add reset + throttling before public exposure.
5. **Parent oversight** is a linked-viewer model (stepper: request -> approval -> active), not a full guardian KYC flow.
6. **Ephemeral filesystems wipe data** on serverless platforms - see Deploying.
7. **No push/notification infrastructure**; reminders are in-app only.

## Not production claims

Per the master prompt: this MVP is not claimed production-ready for real users until items 1, 2, and 4 above are addressed. It is complete and verified as a local/single-instance educational demo.
