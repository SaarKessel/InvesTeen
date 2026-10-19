"use client";
import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { useVariant } from "@/lib/ab";

/**
 * Local-only A/B (see src/lib/ab.ts): variant assignment and impressions stay
 * in this browser's localStorage. No network, no real users.
 * A = original hero copy. B = alternative copy. Both follow the same rules:
 * educational only, virtual money, no return promises, no investment advice.
 */
export default function LandingHero() {
  const v = useVariant("landing-hero");
  const copy = v === "b"
    ? {
        tagline: "ההשקעה הראשונה שלך - בלי לסכן שקל",
        body: "תיק וירטואלי בכסף לימודי, שיעורים קצרים בעברית, משימות ומנטור חינוכי. כל הנכסים בדויים, כל הכסף סימולציה, כל הידע - שלך.",
        cta: "יוצאים לדרך"
      }
    : {
        tagline: "לומדים כסף. מתרגלים השקעות. בונים עתיד.",
        body: "פלטפורמה חינוכית לבני נוער: תיק השקעות וירטואלי בכסף לימודי, שיעורים קצרים, משימות ומנטור AI חינוכי. בלי כסף אמיתי, בלי סיכון, בלי לחץ.",
        cta: "מתחילים ללמוד"
      };
  return (
    <section className="pt-16 pb-6 sm:pb-10 text-center">
      <Reveal>
        <span className="inline-block text-xs px-3 py-1.5 rounded-full border border-accent-600/50 bg-accent-600/10 text-accent-400 font-medium">
          פלטפורמה חינוכית · 100% כסף וירטואלי · בלי ייעוץ השקעות
        </span>
      </Reveal>
      <Reveal delay={0.08}>
        <h1 className="display text-5xl sm:text-6xl mt-6">InvesTeen<span className="text-accent-500">.</span></h1>
      </Reveal>
      <Reveal delay={0.14}>
        <p className="mt-3 text-xl text-slate-200 font-medium">{copy.tagline}</p>
      </Reveal>
      <Reveal delay={0.2}>
        <p className="mt-4 max-w-xl mx-auto muted leading-7">{copy.body}</p>
      </Reveal>
      <Reveal delay={0.26}>
        <div className="flex gap-3 mt-8 justify-center">
          <Link href="/register" className="btn-primary text-base px-6 py-3">{copy.cta}</Link>
          <Link href="/login" className="btn-secondary text-base px-6 py-3">יש לי חשבון</Link>
        </div>
      </Reveal>
    </section>
  );
}
