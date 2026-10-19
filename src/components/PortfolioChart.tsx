"use client";
/**
 * Robinhood-style portfolio chart: range tabs (1D/1W/1M/3M/1Y/ALL),
 * pointer scrub (mouse + touch) with crosshair and live value, green/red line
 * by range change. Reduced-motion: instant updates, no animated transitions.
 */
import React, { useMemo, useRef, useState } from "react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { useReducedMotion } from "framer-motion";
import type { PortfolioPoint } from "@/lib/engine/portfolioHistory";

const RANGES = [
  { id: "1D", days: 1 }, { id: "1W", days: 7 }, { id: "1M", days: 30 },
  { id: "3M", days: 90 }, { id: "1Y", days: 180 }, { id: "ALL", days: Infinity }
] as const;
type RangeId = (typeof RANGES)[number]["id"];

export function fmtVT(n: number): string {
  return `${n.toLocaleString("he-IL", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} VT`;
}

export default function PortfolioChart({ data, labelHe = "שווי התיק הווירטואלי" }: { data: PortfolioPoint[]; labelHe?: string }) {
  const reduced = useReducedMotion() ?? false;
  const [range, setRange] = useState<RangeId>("1M");
  const [scrubIdx, setScrubIdx] = useState<number | null>(null);
  const chartRef = useRef<HTMLDivElement>(null);

  const maxDay = data[data.length - 1]?.day ?? 0;
  const r = RANGES.find((x) => x.id === range)!;
  const filtered = useMemo(() => {
    const from = r.days === Infinity ? 0 : Math.max(0, maxDay - r.days);
    const slice = data.filter((d) => d.day >= from);
    return slice.length >= 2 ? slice : data.slice(-2);
  }, [data, maxDay, r]);

  const first = filtered[0], last = filtered[filtered.length - 1];
  const delta = last.valueMinor - first.valueMinor;
  const deltaPct = first.valueMinor > 0 ? (delta / first.valueMinor) * 100 : 0;
  const up = delta >= 0;
  const color = up ? "#10b981" : "#f43f5e";
  const shown = scrubIdx !== null ? filtered[scrubIdx] : last;
  const scrubPct = scrubIdx !== null && filtered.length > 1 ? (scrubIdx / (filtered.length - 1)) * 100 : null;

  const handleScrub = (e: React.PointerEvent) => {
    const el = chartRef.current; if (!el) return;
    const rect = el.getBoundingClientRect();
    const t = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    setScrubIdx(Math.round(t * (filtered.length - 1)));
  };

  return (
    <div>
      <div className="px-1">
        <div className="text-sm muted">{labelHe}</div>
        <div className="display text-4xl sm:text-5xl mt-1 tabular-nums" dir="ltr">{fmtVT(shown.valueMinor / 100)}</div>
        <div className={`mt-1 text-sm font-semibold ${up ? "text-accent-500" : "text-danger-500"}`} dir="ltr">
          {up ? "+" : "-"}{fmtVT(Math.abs(delta) / 100)} ({up ? "+" : ""}{deltaPct.toFixed(2)}%)
          <span className="muted font-normal"> · {scrubIdx !== null ? `יום סימולציה ${shown.day}` : range === "ALL" ? "כל הסימולציה" : `${r.days} ימים אחרונים`}</span>
        </div>
      </div>

      <div ref={chartRef} dir="ltr" className="relative h-52 sm:h-64 w-full mt-2 touch-none select-none"
        onPointerDown={handleScrub} onPointerMove={(e) => e.buttons > 0 && handleScrub(e)}
        onPointerUp={() => setScrubIdx(null)} onPointerLeave={() => setScrubIdx(null)}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={filtered} margin={{ top: 10, right: 2, bottom: 2, left: 2 }}>
            <XAxis dataKey="day" hide />
            <YAxis domain={["auto", "auto"]} hide />
            <Line type="monotone" dataKey="valueMinor" stroke={color} strokeWidth={2} dot={false}
              isAnimationActive={!reduced} animationDuration={450} />
          </LineChart>
        </ResponsiveContainer>
        {scrubPct !== null && (
          <>
            <div className="absolute top-0 bottom-0 w-px bg-slate-500/70 pointer-events-none" style={{ left: `${scrubPct}%` }} />
          </>
        )}
      </div>

      <div className="flex gap-1 mt-3 border-t border-navy-800 pt-3" dir="ltr" role="tablist" aria-label="טווח זמן">
        {RANGES.map((x) => (
          <button key={x.id} role="tab" aria-selected={range === x.id}
            onClick={() => { setRange(x.id); setScrubIdx(null); }}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${range === x.id ? "text-accent-500 bg-accent-600/10" : "text-slate-500 hover:text-slate-300"}`}>
            {x.id}
          </button>
        ))}
      </div>
    </div>
  );
}
