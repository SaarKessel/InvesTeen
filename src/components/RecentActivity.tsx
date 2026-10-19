"use client";
/**
 * Recent virtual-order feed. Concept adapted from EasyUI ActivityFeed
 * (https://github.com/Surajmaurya1/easyui, MIT (c) 2026 Suraj Maurya) -
 * status-icon rows with staggered spring entrance; reimplemented lean for
 * InvesTeen (orders data, RTL, navy tokens, reduced-motion safe).
 */
import { motion, useReducedMotion } from "framer-motion";

export interface ActivityRow {
  id: string;
  side: "buy" | "sell";
  symbol: string;
  nameHe: string;
  qty: number;
  totalText: string;
  dayLabel: string;
}

export default function RecentActivity({ rows }: { rows: ActivityRow[] }) {
  const reduced = useReducedMotion();
  return (
    <div className="divide-y divide-navy-800">
      {rows.map((r, i) => (
        <motion.div
          key={r.id}
          initial={reduced ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: reduced ? 0 : i * 0.06, type: "spring", stiffness: 260, damping: 24 }}
          className="flex items-center gap-3 py-3"
        >
          <span className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${r.side === "buy" ? "bg-accent-600/15 text-accent-500" : "bg-amber-500/15 text-amber-400"}`} aria-hidden>
            {r.side === "buy" ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5m-6 6l6-6 6 6" /></svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14m-6-6l6 6 6-6" /></svg>
            )}
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium truncate">{r.side === "buy" ? "קנייה וירטואלית" : "מכירה וירטואלית"} · {r.nameHe}</div>
            <div className="text-xs muted mt-0.5">{r.qty} יח׳ {r.symbol} · {r.dayLabel}</div>
          </div>
          <div className="text-sm font-bold tabular-nums shrink-0" dir="ltr">{r.totalText}</div>
        </motion.div>
      ))}
    </div>
  );
}
