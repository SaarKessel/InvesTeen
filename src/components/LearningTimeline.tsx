"use client";
/**
 * Learning-path timeline. Interaction concept adapted from EasyUI
 * InteractiveTimeline (https://github.com/Surajmaurya1/easyui, MIT (c) 2026
 * Suraj Maurya) - status nodes on a connector rail; reimplemented lean for
 * InvesTeen (lesson statuses, RTL, navy tokens, reduced-motion safe).
 */
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";

export interface TimelineLesson {
  id: string;
  titleHe: string;
  status: "completed" | "current" | "pending";
  scorePct?: number | null;
}

function Node({ status }: { status: TimelineLesson["status"] }) {
  if (status === "completed")
    return (
      <span className="w-6 h-6 rounded-full bg-accent-600 border-2 border-accent-600 text-white flex items-center justify-center shrink-0 z-10" aria-label="הושלם">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12.5l5 5L20 6.5" /></svg>
      </span>
    );
  if (status === "current")
    return (
      <span className="relative w-6 h-6 rounded-full bg-navy-900 border-2 border-accent-500 shrink-0 z-10 flex items-center justify-center" aria-label="הבא בתור">
        <span className="w-2 h-2 rounded-full bg-accent-500 animate-ping motion-reduce:animate-none" style={{ animationIterationCount: 3 }} />
      </span>
    );
  return <span className="w-6 h-6 rounded-full bg-navy-900 border-2 border-navy-700 shrink-0 z-10" aria-label="ממתין" />;
}

export default function LearningTimeline({ lessons }: { lessons: TimelineLesson[] }) {
  const reduced = useReducedMotion();
  return (
    <ol className="relative mt-3">
      {lessons.map((l, i) => (
        <motion.li
          key={l.id}
          initial={reduced ? false : { opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: reduced ? 0 : i * 0.05, duration: 0.3 }}
          className="relative flex items-center gap-3 py-2"
        >
          {i < lessons.length - 1 && (
            <span className={`absolute top-8 bottom-[-8px] right-[11px] w-0.5 ${l.status === "completed" ? "bg-accent-600/50" : "bg-navy-700"}`} aria-hidden />
          )}
          <Node status={l.status} />
          <Link href={`/learn/${l.id}`} className={`flex-1 text-sm py-1 rounded-lg transition-colors ${l.status === "current" ? "font-semibold text-slate-100" : l.status === "completed" ? "text-slate-300" : "text-slate-500"} hover:text-accent-500`}>
            {l.titleHe}
            {l.status === "completed" && l.scorePct != null && <span className="text-xs muted"> · {l.scorePct}%</span>}
          </Link>
          {l.status === "current" && <span className="text-xs font-semibold text-accent-500 shrink-0">הבא בתור</span>}
        </motion.li>
      ))}
    </ol>
  );
}
