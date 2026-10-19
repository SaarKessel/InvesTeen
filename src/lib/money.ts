/**
 * Money conventions (docs/FINANCIAL-SPEC.md):
 * All monetary values are INTEGER minor units (1/100 of one virtual unit).
 * The virtual currency "VT" is educational only - never withdrawable or redeemable.
 * No floating-point arithmetic is authoritative for balances.
 */
export type MinorUnits = number; // integer, 1/100 of a virtual unit

export function toMinor(units: number): MinorUnits {
  if (!Number.isFinite(units)) throw new Error("invalid amount");
  return Math.round(units * 100);
}

export function fromMinor(minor: MinorUnits): number {
  return minor / 100;
}

export function assertMinorInteger(minor: MinorUnits, label = "amount"): void {
  if (!Number.isSafeInteger(minor)) throw new Error(`${label} must be an integer number of minor units`);
}

/** Format minor units as a localized virtual-units string, always labeled virtual. */
export function formatVT(minor: MinorUnits): string {
  const sign = minor < 0 ? "-" : "";
  const abs = Math.abs(minor);
  const whole = Math.floor(abs / 100).toLocaleString("he-IL");
  const frac = String(abs % 100).padStart(2, "0");
  return `${sign}${whole}.${frac} VT`;
}

/** Signed percent string for returns, e.g. "+3.25%" / "-1.10%". */
export function formatPct(numerator: number, denominator: number): string {
  if (denominator === 0) return "0.00%";
  const pct = (numerator / denominator) * 100;
  const sign = pct > 0 ? "+" : "";
  return `${sign}${pct.toFixed(2)}%`;
}
