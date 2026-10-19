"use client";
import { useFormState, useFormStatus } from "react-dom";
import { requestGuardianAction, type GuardianState } from "@/app/actions/guardian";

function Btn({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return <button className="btn-primary shrink-0" disabled={pending}>{pending ? "שולח..." : label}</button>;
}

export function RequestGuardianForm() {
  const [state, action] = useFormState<GuardianState, FormData>(requestGuardianAction, {});
  return (
    <form action={action} className="flex gap-2 mt-2">
      <input className="input" name="guardian" placeholder="שם המשתמש של ההורה" required />
      <Btn label="שליחת בקשה" />
      {state.error ? <p className="text-danger-500 text-sm w-full">{state.error}</p> : null}
      {state.ok ? <p className="text-accent-500 text-sm w-full">הבקשה נשלחה. ההורה יאשר בצד שלו.</p> : null}
    </form>
  );
}
