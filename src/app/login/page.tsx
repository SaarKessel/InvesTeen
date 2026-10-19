import Link from "next/link";
import { Card } from "@/components/ui";
import { HeroBackdrop } from "@/components/HeroBackdrop";
import { LoginForm } from "@/components/AuthForms";

export default function LoginPage() {
  return (
    <main className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden">
      <HeroBackdrop />
      <div className="relative z-10 w-full max-w-sm">
        <div className="text-center mb-6">
          <span className="display text-3xl">InvesTeen<span className="text-accent-500">.</span></span>
        </div>
      <Card className="w-full max-w-sm">
        <h1 className="display text-2xl mb-5">כניסה</h1>
        <LoginForm />
        <p className="text-sm muted mt-4">חדש כאן? <Link className="text-accent-500 hover:underline" href="/register">יצירת חשבון</Link></p>
      </Card>
      </div>
    </main>
  );
}
