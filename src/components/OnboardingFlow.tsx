"use client";
import React, { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import { Stepper } from "@/components/easyui/Stepper";
import { AnimatedNumber } from "@/components/easyui/AnimatedNumber";
import { gradeDiagnosticAction, type DiagnosticResult } from "@/app/actions/diagnostic";
import { DIAGNOSTIC } from "@/lib/content/assessment";
import { LESSONS } from "@/lib/content/lessons";

const STEPS = ["ברוכים הבאים", "אבחון קצר", "המסלול שלך"];

function SubmitBtn({ ready }: { ready: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary" disabled={pending || !ready}>
      {pending ? "בודק..." : "למסלול שלי"}
    </button>
  );
}

export function OnboardingFlow({ username, ageBand }: { username: string; ageBand: string }) {
  const [step, setStep] = useState(0);
  const [result, formAction] = useFormState<DiagnosticResult, FormData>(gradeDiagnosticAction, {});
  const [answered, setAnswered] = useState<Record<number, boolean>>({});

  const lessonById = (id: string) => LESSONS.find((l) => l.id === id);
  const weakCount = result.weakTopicIds?.length ?? 0;

  return (
    <div>
      <Stepper className="mb-5" current={result.ok ? 2 : step} steps={STEPS} />

      {step === 0 && (
        <div className="space-y-4">
          <h1 className="text-2xl font-bold">ברוכים הבאים ל-InvesTeen, {username}!</h1>
          <p className="text-slate-300 text-sm leading-6">קבוצת הגיל שלך: {ageBand}. כדי להתאים לך מסלול לימוד אישי, נעשה אבחון קצר של 6 שאלות - הוא רק מזהה פערי ידע, לא ציון. אי אפשר "להיכשל" בו.</p>
          <button className="btn-primary" onClick={() => setStep(1)}>התחילו באבחון</button>
        </div>
      )}

      {step === 1 && !result.ok && (
        <form action={formAction} className="space-y-5">
          <h2 className="text-xl font-bold">אבחון קצר</h2>
          {DIAGNOSTIC.map((q, qi) => (
            <fieldset key={q.id} className="space-y-2">
              <legend className="text-sm font-medium text-slate-200">{qi + 1}. {q.questionHe}</legend>
              {q.optionsHe.map((opt, oi) => (
                <label key={oi} className="flex items-center gap-2 rounded-lg border border-navy-700 px-3 py-2 text-sm cursor-pointer has-[:checked]:border-accent-500 has-[:checked]:bg-accent-600/10">
                  <input type="radio" name={`answer-${qi}`} value={oi} required
                    onChange={() => setAnswered((a) => ({ ...a, [qi]: true }))} className="accent-[var(--color-accent-500)]" />
                  {opt}
                </label>
              ))}
            </fieldset>
          ))}
          {result.error && <p className="text-sm text-red-400" role="alert">{result.error}</p>}
          <SubmitBtn ready={Object.keys(answered).length >= DIAGNOSTIC.length} />
        </form>
      )}

      {step === 1 && result.ok && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">המסלול שלך</h2>
          <p className="text-sm text-slate-300">
            ענית נכון על <AnimatedNumber value={result.scorePct ?? 0} suffix="%" /> מהשאלות.
            {weakCount === 0
              ? " יפה מאוד - אין פערים משמעותיים. כדאי לעבור על הכל לחיזוק."
              : ` מצאנו ${weakCount} נושאים לחזק - הם יופיעו ראשונים במסלול שלך.`}
          </p>
          <ul className="space-y-2">
            {(result.recommendedLessonIds ?? []).map((id) => {
              const l = lessonById(id); if (!l) return null;
              const weak = result.weakTopicIds?.some((tid) => DIAGNOSTIC.find((q) => q.id === tid)?.lessonId === id);
              return (
                <li key={id} className="rounded-lg border border-navy-700 px-3 py-2 text-sm">
                  <span className="font-medium text-slate-100">{l.titleHe}</span>
                  {weak && <span className="block text-xs text-accent-400">מומלץ: זיהינו פער בנושא הזה</span>}
                </li>
              );
            })}
          </ul>
          <Link href="/dashboard" className="btn-primary inline-block">בואו נתחיל</Link>
        </div>
      )}
    </div>
  );
}
