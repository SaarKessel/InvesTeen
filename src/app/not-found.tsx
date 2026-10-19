import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <div className="display text-7xl" dir="ltr">404</div>
      <h1 className="section-title mt-4">העמוד לא נמצא</h1>
      <p className="muted mt-2 max-w-sm">הכתובת שהוזנה לא קיימת או הועברה. אפשר לחזור ללמוד ולתרגל מהדשבורד.</p>
      <div className="flex gap-3 mt-8">
        <Link href="/dashboard" className="btn-primary">לדשבורד</Link>
        <Link href="/" className="btn-secondary">לעמוד הבית</Link>
      </div>
    </main>
  );
}
