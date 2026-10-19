/**
 * LOCAL-ONLY A/B variant helper.
 * Assignment is random per browser (localStorage), overridable via
 * ?ab_<flag>=a|b for review/screenshots. "Impressions" are recorded only in
 * localStorage (key it_ab_log, capped at 200 entries) - nothing ever leaves
 * the device. No network, no real users, no analytics backend.
 */
"use client";
import { useEffect, useState } from "react";

export type Variant = "a" | "b";

function assign(flag: string): Variant {
  return Math.random() < 0.5 ? "a" : "b";
}

export function getVariant(flag: string): Variant {
  if (typeof window === "undefined") return "a";
  const key = `it_ab:${flag}`;
  try {
    const url = new URL(window.location.href);
    const override = url.searchParams.get(`ab_${flag}`);
    if (override === "a" || override === "b") {
      window.localStorage.setItem(key, override);
      return override;
    }
    const saved = window.localStorage.getItem(key);
    if (saved === "a" || saved === "b") return saved;
    const v = assign(flag);
    window.localStorage.setItem(key, v);
    return v;
  } catch {
    return "a";
  }
}

export function logImpression(flag: string, variant: Variant): void {
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem("it_ab_log");
    const log: unknown[] = raw ? JSON.parse(raw) : [];
    log.push({ flag, variant, at: Date.now() });
    while (log.length > 200) log.shift();
    window.localStorage.setItem("it_ab_log", JSON.stringify(log));
  } catch {
    /* local-only; ignore */
  }
}

/** React hook: stable variant for a flag, logs one local impression on mount. */
export function useVariant(flag: string): Variant {
  const [variant, setVariant] = useState<Variant>("a");
  useEffect(() => {
    const v = getVariant(flag);
    setVariant(v);
    logImpression(flag, v);
  }, [flag]);
  return variant;
}
