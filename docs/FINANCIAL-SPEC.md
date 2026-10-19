# Financial calculation specification

- Balances: derived from virtual_account_ledger (append-only). No cached balance is authoritative.
- Order execution: single SQLite transaction: validate -> price check (seeded provider,
  price + explicit timestamp) -> ledger postings -> position update -> order row status=filled.
  Any failure rolls everything back.
- Idempotency: simulated_orders.client_order_id UNIQUE; a duplicate request returns the
  original order and executes nothing twice.
- Validation: quantity > 0; buy requires cash >= qty*price + fee; sell requires held qty;
  price timestamp must exist; all amounts integer minor units.
- Fees: configurable per-order fixed fee in virtual minor units (default 0 in MVP; mission
  scenarios may enable fees to teach cost impact).
- Cost basis: average cost per position. Realized P&L on sell = qty*(sell_price - avg_cost) - fees.
- Portfolio value = cash + sum(position_qty * current_price). Return methodology (MVP):
  simple return = (current_value - starting_value) / starting_value; there are no external
  deposits/withdrawals after account creation, so no TWR needed yet. Documented in UI.
- Missing price: position is valued as "unavailable", excluded from totals, and shown as such.
  Never silently treated as zero.
