"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { SearchBar } from "@/components/easyui/SearchBar";
import { Sparkline, KindGlyph } from "@/components/Sparkline";

export interface MarketRow {
  symbol: string;
  nameHe: string;
  kind: string;
  kindHe: string;
  priceText: string;
  changePct: number | null;
  spark: number[];
}

export default function MarketsList({ rows }: { rows: MarketRow[] }) {
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return rows;
    return rows.filter((r) =>
      r.nameHe.toLowerCase().includes(needle) ||
      r.symbol.toLowerCase().includes(needle) ||
      r.kindHe.includes(needle)
    );
  }, [rows, q]);

  return (
    <div>
      <SearchBar value={q} onChange={setQ} placeholder="חיפוש נכס, סימול או סוג..." className="mt-4" />
      <div className="mt-4 divide-y divide-navy-800 border-t border-b border-navy-800">
        {filtered.map((r) => (
          <Link key={r.symbol} href={`/markets/${r.symbol}`} className="flex items-center gap-3 py-4 group">
            <KindGlyph kind={r.kind} />
            <div className="min-w-0 flex-1">
              <div className="font-medium truncate group-hover:text-accent-500 transition-colors">{r.nameHe}</div>
              <div className="text-xs muted mt-0.5">{r.symbol} · {r.kindHe}</div>
            </div>
            <Sparkline points={r.spark} width={84} height={28} />
            <div className="text-left w-28 shrink-0">
              <div className="font-bold tabular-nums" dir="ltr">{r.priceText}</div>
              {r.changePct !== null && (
                <div className={`text-xs mt-0.5 font-semibold ${r.changePct >= 0 ? "text-accent-500" : "text-danger-500"}`} dir="ltr">
                  {r.changePct >= 0 ? "+" : ""}{r.changePct.toFixed(2)}%
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
      {filtered.length === 0 && (
        <p className="text-sm muted py-6 text-center">לא נמצאו נכסים שמתאימים לחיפוש. כל הנכסים כאן בדויים וללמידה בלבד.</p>
      )}
    </div>
  );
}
