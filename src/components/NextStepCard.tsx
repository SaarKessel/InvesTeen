"use client";
import Link from "next/link";
import { useVariant } from "@/lib/ab";

/**
 * Local-only A/B (see src/lib/ab.ts) for the dashboard "next step" card.
 * A = text + link button. B = full-width tappable row with animated arrow.
 */
export default function NextStepCard({ lessonId, titleHe, descriptionHe }: { lessonId: string; titleHe: string; descriptionHe: string }) {
  const v = useVariant("dashboard-cta");
  if (v === "b") {
    return (
      <Link href={`/learn/${lessonId}`} className="flex items-center justify-between gap-3 group">
        <div className="min-w-0">
          <div className="font-medium group-hover:text-accent-500 transition-colors">{titleHe}</div>
          <div className="text-sm muted">{descriptionHe}</div>
        </div>
        <span className="shrink-0 w-10 h-10 rounded-full bg-accent-600 text-white flex items-center justify-center transition-transform group-hover:-translate-x-1 motion-reduce:transition-none motion-reduce:transform-none" aria-hidden>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5m6-6l-6 6 6 6" />
          </svg>
        </span>
      </Link>
    );
  }
  return (
    <div className="flex items-center justify-between gap-3 flex-wrap">
      <div>
        <div className="font-medium">{titleHe}</div>
        <div className="text-sm muted">{descriptionHe}</div>
      </div>
      <Link className="btn-primary" href={`/learn/${lessonId}`}>להמשיך ללמוד</Link>
    </div>
  );
}
