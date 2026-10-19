"use client";
import { useFormState, useFormStatus } from "react-dom";
import { registerAction, loginAction } from "@/app/actions/auth";
import { Loader } from "@/components/easyui/Loader";
import { AGE_BANDS } from "@/lib/constants";

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button className="btn-primary w-full flex items-center justify-center gap-2" disabled={pending}>
      {pending && <Loader size={16} color="#fff" label="" />}
      {pending ? "רגע..." : label}
    </button>
  );
}

export function RegisterForm() {
  const [state, action] = useFormState<{ error?: string }, FormData>(registerAction, {});
  return (
    <form action={action} className="space-y-4">
      <div>
        <label className="label" htmlFor="username">שם משתמש</label>
        <input className="input" id="username" name="username" required minLength={2} maxLength={24} autoComplete="username" />
      </div>
      <div>
        <label className="label" htmlFor="password">סיסמה</label>
        <input className="input" id="password" name="password" type="password" required minLength={6} autoComplete="new-password" />
      </div>
      <div>
        <label className="label" htmlFor="ageBand">קבוצת גיל</label>
        <select className="input" id="ageBand" name="ageBand" required defaultValue="">
          <option value="" disabled>בחר</option>
          {AGE_BANDS.map((b) => <option key={b} value={b}>{b}</option>)}
        </select>
      </div>
      {state.error ? <p className="text-danger-500 text-sm">{state.error}</p> : null}
      <Submit label="יצירת חשבון לימודי" />
      <p className="text-xs muted">אנחנו שומרים רק שם משתמש וקבוצת גיל - בלי תאריך לידה, בלי אימייל, בלי פרטים מזהים.</p>
    </form>
  );
}

export function LoginForm() {
  const [state, action] = useFormState<{ error?: string }, FormData>(loginAction, {});
  return (
    <form action={action} className="space-y-4">
      <div>
        <label className="label" htmlFor="username">שם משתמש</label>
        <input className="input" id="username" name="username" required autoComplete="username" />
      </div>
      <div>
        <label className="label" htmlFor="password">סיסמה</label>
        <input className="input" id="password" name="password" type="password" required autoComplete="current-password" />
      </div>
      {state.error ? <p className="text-danger-500 text-sm">{state.error}</p> : null}
      <Submit label="כניסה" />
    </form>
  );
}
