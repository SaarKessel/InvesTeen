"use client";
import { useFormState, useFormStatus } from "react-dom";
import { motion, useReducedMotion } from "framer-motion";
import { AnimatedNumber } from "@/components/easyui/AnimatedNumber";
import { completeLessonAction, type LessonResult } from "@/app/actions/learn";
import type { Lesson } from "@/lib/content/lessons";

function SubmitBtn() {
  const { pending } = useFormStatus();
  return <button className="btn-primary w-full" disabled={pending}>{pending ? "בודק..." : "בדיקת תשובות"}</button>;
}

export default function LessonQuiz({ lesson }: { lesson: Lesson }) {
  const [state, action] = useFormState<LessonResult, FormData>(completeLessonAction, {});
  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="lessonId" value={lesson.id} />
      {lesson.checks.map((c, i) => {
        const answered = state.correct ? state.correct[i] : undefined;
        return (
          <fieldset key={i} className="card p-4">
            <legend className="font-medium px-1">{c.questionHe}</legend>
            <div className="space-y-2 mt-2">
              {c.optionsHe.map((opt, j) => (
                <label key={j} className="flex items-center gap-2.5 bg-navy-800 border border-transparent rounded-xl px-3 py-2.5 cursor-pointer transition-colors has-[:checked]:border-accent-500 has-[:checked]:bg-accent-600/10">
                  <input type="radio" name={`q${i}`} value={j} required className="accent-emerald-500" />
                  <span className="text-sm">{opt}</span>
                </label>
              ))}
            </div>
            {answered !== undefined && (
              <motion.p initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 22 }}
                className={`text-sm mt-2 ${answered ? "text-accent-500" : "text-warn-500"}`}>
                {answered ? "נכון! " : "לא מדויק. "}{c.explanationHe}
              </motion.p>
            )}
          </fieldset>
        );
      })}
      {state.error ? <p className="text-danger-500 text-sm">{state.error}</p> : null}
      {state.ok ? (
        <motion.p initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 220, damping: 18 }}
          className="text-accent-500 font-semibold text-lg">
          השיעור הושלם! ציון: <AnimatedNumber value={state.scorePct ?? 0} suffix="%" />
        </motion.p>
      ) : <SubmitBtn />}
    </form>
  );
}
