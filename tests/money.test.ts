import { describe, it, expect } from "vitest";
import { toMinor, fromMinor, formatVT, formatPct, assertMinorInteger } from "@/lib/money";

describe("money", () => {
  it("converts units to integer minor units", () => {
    expect(toMinor(10.05)).toBe(1005);
    expect(fromMinor(1005)).toBeCloseTo(10.05);
  });
  it("rejects non-integer minor units", () => {
    expect(() => assertMinorInteger(1.5)).toThrow();
    expect(() => assertMinorInteger(Number.MAX_SAFE_INTEGER + 1)).toThrow();
  });
  it("formats virtual units with the VT label", () => {
    expect(formatVT(1_000_000)).toContain("VT");
    expect(formatVT(-250)).toContain("-2.50");
  });
  it("formats percentages with sign", () => {
    expect(formatPct(5, 100)).toBe("+5.00%");
    expect(formatPct(-25, 1000)).toBe("-2.50%");
    expect(formatPct(1, 0)).toBe("0.00%");
  });
});
