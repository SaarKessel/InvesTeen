# InvesTeen - Architecture

## Stack
Next.js 14 (App Router) + React 18 + TypeScript (strict), Tailwind CSS, better-sqlite3
(local relational DB, WAL), Vitest. Recharts for visualizations. Zod for input validation.
No external accounts required for local development; AI mentor has a deterministic local
educational fallback until a provider key is supplied by the owner (via vault, server-side only).

## Modules (brief section 14)
1. Auth & Identity - scrypt password hashing, httpOnly session cookies, sessions table.
2. User Profile - age band, goals, preferences.
3. Learning & Curriculum - versioned structured content files, progress rows.
4. Virtual Accounts & Ledger - double-entry style ledger; balances are DERIVED from the ledger.
5. Orders & Transactions - validated, atomic, idempotent (client_order_id).
6. Market Data - provider interface; seeded fictional educational provider (deterministic).
7. Portfolio Analytics - valuation, cost basis (average cost), realized/unrealized P&L,
   allocation, concentration, simple return methodology (no external flows in MVP).
8. Scenario Simulation - curated deterministic scenarios (missions).
9. Gamification - levels, achievements awarded server-side from verified activity.
10. AI Mentor - server-side service layer; never the source of truth for numbers;
    uses engine tools for portfolio facts; strict educational policy.
11. Parent Access - guardian_relationships + consent_records (initial flow).
12. Admin/Content - content files versioned in repo (local MVP).
13. Observability - audit_events table.

## Money conventions
All monetary values are INTEGER minor units (1/100 of a virtual unit). The virtual currency
is labeled VT ("מטבעות וירטואליים") and is never withdrawable or redeemable.
No floating-point arithmetic is authoritative anywhere in the engine.

## Market data
All MVP prices are SIMULATED / FICTIONAL educational data, clearly labeled in UI and API.
Never presented as live. Provider abstraction allows a licensed provider later.
