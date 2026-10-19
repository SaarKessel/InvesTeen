"use client";
import { useFormState, useFormStatus } from "react-dom";
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
                <label key={j} className="flex items-center gap-2.5 bg-navy-800 rounded-xl px-3 py-2.5 cursor-pointer">
                  <input type="radio" name="answer" value={j} required className="accent-emerald-500" />
                  <span className="text-sm">{opt}</span>
                </label>
              ))}
            </div>
            {answered !== undefined && (
              <p className={`text-sm mt-2 ${answered ? "text-accent-500" : "text-warn-500"}`}>
                {answered ? "נכון! " : "לא מדויק. "}{c.explanationHe}
              </p>
            )}
          </fieldset>
        );
      })}
      {state.error ? <p className="text-danger-500 text-sm">{state.error}</p> : null}
      {state.ok ? <p className="text-accent-500 font-semibold">השיעור הושלם! ציון: {state.scorePct}%</p> : <SubmitBtn />}
    </form>
  );
}
