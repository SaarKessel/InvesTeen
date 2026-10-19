import React from "react";

/** Tiny server-rendered SVG sparkline (no client JS). Emerald when rising, red when falling. */
export function Sparkline({ points, width = 96, height = 28 }: { points: number[]; width?: number; height?: number }) {
  if (points.length < 2) return null;
  const min = Math.min(...points), max = Math.max(...points);
  const span = max - min || 1;
  const step = width / (points.length - 1);
  const pts = points.map((p, i) => [(i * step), (height - 3 - ((p - min) / span) * (height - 6))] as const);
  const d = pts.map((xy, i) => `${i === 0 ? "M" : "L"}${xy[0].toFixed(1)},${xy[1].toFixed(1)}`).join(" ");
  const up = points[points.length - 1] >= points[0];
  const color = up ? "#10b981" : "#f43f5e";
  const gid = `sg-${up ? "u" : "d"}-${points.length}-${Math.round(min)}`;
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden className="shrink-0" style={{ direction: "ltr" }}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${d} L${width},${height} L0,${height} Z`} fill={`url(#${gid})`} stroke="none" />
      <path d={d} fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function KindGlyph({ kind }: { kind: string }) {
  const paths: Record<string, React.ReactNode> = {
    stock: <><path d="M4 17l4-6 4 3 5-8" /><path d="M17 6h3v3" /></>,
    index_fund: <><rect x="4" y="12" width="3.5" height="7" rx="1" /><rect x="10" y="8" width="3.5" height="11" rx="1" /><rect x="16" y="4" width="3.5" height="15" rx="1" /></>,
    bond_fund: <><path d="M5 5h14v14H5z" /><path d="M5 10h14M9 15h6" /></>
  };
  return (
    <span className="w-9 h-9 rounded-xl bg-navy-800 border border-navy-600 flex items-center justify-center text-accent-500 shrink-0" aria-hidden>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        {paths[kind] ?? paths.stock}
      </svg>
    </span>
  );
}
