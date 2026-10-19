import Link from "next/link";
import { Card } from "@/components/ui";
import { HeroBackdrop } from "@/components/HeroBackdrop";
import { RegisterForm } from "@/components/AuthForms";

export default function RegisterPage() {
  return (
    <main className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden">
      <HeroBackdrop />
      <div className="relative z-10 w-full max-w-sm">
        <div className="text-center mb-6">
          <span className="display text-3xl">InvesTeen<span className="text-accent-500">.</span></span>
        </div>
      <Card className="w-full max-w-sm">
        <h1 className="display text-2xl mb-1">הצטרפות ל-InvesTeen</h1>
        <p className="muted text-sm mb-5">מקבלים תיק וירטואלי של 10,000 VT לתרגול - לגמרי בחינם ובלי כסף אמיתי.</p>
        <RegisterForm />
        <p className="text-sm muted mt-4">יש לך חשבון? <Link className="text-accent-500 hover:underline" href="/login">כניסה</Link></p>
      </Card>
      </div>
    </main>
  );
}
