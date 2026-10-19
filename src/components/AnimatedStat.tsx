"use client";
import React from "react";
import { AnimatedNumber } from "@/components/easyui/AnimatedNumber";

/** Stat with rolling-digit animation for virtual-money values (minor units in, VT out). */
export function AnimatedVTStat({ label, valueMinor, hint }: { label: React.ReactNode; valueMinor: number; hint?: string }) {
  return (
    <div>
      <div className="text-sm muted">{label}</div>
      <div className="text-xl font-bold mt-0.5 flex items-baseline gap-1">
        <AnimatedNumber value={valueMinor / 100} decimals={2} />
        <span className="text-sm font-semibold text-slate-400">VT</span>
      </div>
      {hint ? <div className="text-xs muted mt-0.5">{hint}</div> : null}
    </div>
  );
}

export function AnimatedPctStat({ label, valuePct, hint }: { label: React.ReactNode; valuePct: number; hint?: string }) {
  return (
    <div>
      <div className="text-sm muted">{label}</div>
      <div className="text-xl font-bold mt-0.5">
        <AnimatedNumber value={valuePct} decimals={2} suffix="%" />
      </div>
      {hint ? <div className="text-xs muted mt-0.5">{hint}</div> : null}
    </div>
  );
}
