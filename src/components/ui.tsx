import Link from "next/link";
import { ReactNode } from "react";
import { SpotlightCard } from "@/components/easyui/SpotlightCard";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <SpotlightCard className={`p-5 ${className}`}>{children}</SpotlightCard>;
}

export function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div>
      <div className="text-sm muted">{label}</div>
      <div className="text-xl font-bold mt-0.5">{value}</div>
      {hint ? <div className="text-xs muted mt-0.5">{hint}</div> : null}
    </div>
  );
}

export function Badge({ children, tone = "default" }: { children: ReactNode; tone?: "default" | "good" | "warn" }) {
  const cls = tone === "good" ? "bg-accent-600/20 text-accent-500 border-accent-600/40"
    : tone === "warn" ? "bg-warn-500/15 text-warn-500 border-warn-500/40"
    : "bg-navy-800 text-slate-300 border-navy-600";
  return <span className={`inline-block text-xs px-2.5 py-1 rounded-full border ${cls}`}>{children}</span>;
}

export function DataSourceNote() {
  return (
    <p className="text-xs muted mt-3">
      נתוני סימולציה חינוכיים בלבד - כל הנכסים בדויים, ואין קשר לניירות ערך אמיתיים. הכסף וירטואלי ואינו ניתן למשיכה.
    </p>
  );
}

export function EmptyState({ title, body, actionHref, actionLabel }: { title: string; body: string; actionHref?: string; actionLabel?: string }) {
  return (
    <Card className="text-center py-12">
      <div className="mx-auto w-12 h-12 rounded-2xl bg-navy-800 border border-navy-600 flex items-center justify-center text-accent-500" aria-hidden>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9" /><path d="M9 10h.01M15 10h.01" /><path d="M9.5 15a3.5 3.5 0 0 0 5 0" />
        </svg>
      </div>
      <div className="section-title mt-4">{title}</div>
      <p className="muted mt-2 max-w-md mx-auto text-sm leading-6">{body}</p>
      {actionHref && actionLabel ? <Link className="btn-primary inline-block mt-5" href={actionHref}>{actionLabel}</Link> : null}
    </Card>
  );
}

export function Pnl({ minor }: { minor: number }) {
  const cls = minor > 0 ? "text-accent-500" : minor < 0 ? "text-danger-500" : "text-slate-300";
  const sign = minor > 0 ? "+" : minor < 0 ? "-" : "";
  const abs = Math.abs(minor);
  const whole = Math.floor(abs / 100).toLocaleString("he-IL");
  const frac = String(abs % 100).padStart(2, "0");
  return <span className={cls} dir="ltr">{sign}{whole}.{frac} VT</span>;
}
