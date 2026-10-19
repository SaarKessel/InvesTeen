# Security & privacy plan (local MVP stage)

- Server-side authorization on every route/action: session cookie -> user id -> ownership checks.
- Passwords: scrypt (node:crypto), per-user salt, timing-safe compare.
- Sessions: random 32-byte token, httpOnly, sameSite=lax, expiry + revocation.
- Input validation with zod at every boundary; parameterized SQL only.
- Idempotent, transactional order execution (see FINANCIAL-SPEC).
- No secrets in client bundles; AI provider key will live server-side only (owner-supplied).
- Data minimization: age BAND only, no birth date, no email required in local MVP.
- guardian_relationships enforces explicit parent-child links; a claim of parenthood grants nothing.
- audit_events for sensitive actions.
- Before any store release: full review of Israeli privacy law (PPA) and minor-protection
  requirements; this local build is not production-hardened and is not deployed.
