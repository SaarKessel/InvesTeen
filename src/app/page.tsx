import Link from "next/link";
import { SmoothAccordion } from "@/components/easyui/SmoothAccordion";
import { SpotlightCard } from "@/components/easyui/SpotlightCard";
import { HeroBackdrop } from "@/components/HeroBackdrop";
import { Reveal } from "@/components/Reveal";
import { currentUser } from "@/lib/auth";
import LandingHero from "@/components/LandingHero";
import { redirect } from "next/navigation";

const FEATURES: { title: string; body: string; icon: string }[] = [
  { title: "תיק וירטואלי", body: "סחר תרגול בכסף לימודי (VT) על נכסי סימולציה בדויים. בלי הפקדות, בלי סיכון, בלי לחץ.", icon: "M4 17l4-6 4 3 5-8M17 6h3v3" },
  { title: "שיעורים קצרים", body: "מושגי כסף והשקעות בעברית פשוטה: חיסכון, אינפלציה, ריבית דריבית, פיזור ועוד.", icon: "M5 4h11a3 3 0 013 3v13H8a3 3 0 01-3-3V4zM9 8h6M9 12h6" },
  { title: "משימות ואתגרים", body: "תרגול מודרך שמחבר את מה שלמדת לפעולות בתיק - עם משוב מיידי וברור.", icon: "M9 12l2 2 4-5M12 21a9 9 0 100-18 9 9 0 000 18z" },
  { title: "מנטור AI חינוכי", body: "שאלות על כסף? המנטור מסביר ומלמד - בלי המלצות קניה או מכירה, תמיד.", icon: "M8 10h8M8 14h5M21 12a9 9 0 11-4-7.5L21 4l-1 4a9 9 0 010 4z" },
  { title: "התקדמות ורמות", body: "רמות, הישגים ומסלול אישי שמתחיל באבחון קצר ומתאים עצמו לפערי הידע שלך.", icon: "M12 3l2.5 5 5.5.8-4 4 1 5.7-5-2.7-5 2.7 1-5.7-4-4L9.5 8 12 3z" },
  { title: "שקיפות להורים", body: "אחרי קישור מאושר משני הצדדים, ההורה רואה התקדמות בלמידה בלבד. השיחות עם המנטור פרטיות.", icon: "M16 11a3 3 0 100-6 3 3 0 000 6zM6 20v-1a5 5 0 015-5h2a5 5 0 015 5v1M7 9a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM3 20v-1a4 4 0 014-4" }
];

const STEPS: { n: string; title: string; body: string }[] = [
  { n: "1", title: "נרשמים ועושים אבחון קצר", body: "שש שאלות שמזהות פערי ידע - לא ציון, רק נקודת פתיחה." },
  { n: "2", title: "מקבלים מסלול אישי", body: "השיעורים שיהקלו עליך בדיוק במקומות שצריך, בסדר הנכון." },
  { n: "3", title: "מתרגלים בתיק וירטואלי", body: "קונים ומוכרים נכסי סימולציה, לומדים מהתוצאה, ועולים רמה." }
];

export default function Landing() {
  if (currentUser()) redirect("/dashboard");
  return (
    <main className="relative min-h-screen overflow-hidden">
      <HeroBackdrop />
      <div className="relative z-10 mx-auto max-w-4xl px-6 pb-16">
        <LandingHero />

        {/* How it works */}
        <section className="py-10">
          <Reveal><h2 className="section-title text-center text-2xl">איך זה עובד?</h2></Reveal>
          <div className="grid sm:grid-cols-3 gap-4 mt-8">
            {STEPS.map((s, i) => (
              <Reveal key={s.n} delay={i * 0.08}>
                <SpotlightCard className="p-5 h-full text-center">
                  <div className="mx-auto w-10 h-10 rounded-full border-2 border-accent-500 text-accent-500 flex items-center justify-center font-bold">{s.n}</div>
                  <div className="font-semibold mt-3">{s.title}</div>
                  <p className="text-sm muted mt-2 leading-6">{s.body}</p>
                </SpotlightCard>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="py-10">
          <Reveal><h2 className="section-title text-center text-2xl">מה יש בפנים?</h2></Reveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
            {FEATURES.map((f, i) => (
              <Reveal key={f.title} delay={(i % 3) * 0.06}>
                <SpotlightCard className="p-5 h-full">
                  <div className="w-10 h-10 rounded-xl bg-navy-800 border border-navy-600 flex items-center justify-center text-accent-500" aria-hidden>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={f.icon} /></svg>
                  </div>
                  <div className="font-semibold mt-3">{f.title}</div>
                  <p className="text-sm muted mt-1.5 leading-6">{f.body}</p>
                </SpotlightCard>
              </Reveal>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="py-10 max-w-xl mx-auto w-full">
          <Reveal><h2 className="section-title text-center text-2xl mb-6">שאלות נפוצות</h2></Reveal>
          <Reveal delay={0.08}>
            <SmoothAccordion items={[
              { id: "q1", title: "זה כסף אמיתי?", content: "לא. כל הכסף ב-InvesTeen וירטואלי (VT) ומיועד ללמידה בלבד. אי אפשר להפקיד, למשוך או לקנות דבר." },
              { id: "q2", title: "זה ייעוץ השקעות?", content: "לא. הפלטפורמה מלמדת מושגים ומאפשרת תרגול, אבל אף פעם לא ממליצה מה לקנות או למכור ולא מבטיחה תשואות." },
              { id: "q3", title: "מה ההורים רואים?", content: "אחרי קישור מאושר משני הצדדים, ההורה רואה התקדמות בלמידה בלבד: שיעורים, משימות והישגים. שיחות עם המנטור נשארות פרטיות." },
              { id: "q4", title: "אילו פרטים נשמרים?", content: "מינימום: שם משתמש וקבוצת גיל. בלי תאריך לידה, בלי אימייל, בלי כרטיס אשראי, ובאפשרותך למחוק את החשבון והנתונים בכל רגע." }
            ]} />
          </Reveal>
        </section>

        <footer className="pt-8 text-center">
          <Link href="/register" className="btn-primary inline-block px-8 py-3">בונים עתיד פיננסי - בבטחה</Link>
          <p className="mt-8 text-xs muted max-w-sm mx-auto leading-5">
            חינוכי בלבד. אין כאן ייעוץ השקעות, אין כסף אמיתי, וכל הנכסים והמחירים הם סימולציה לימודית בדויה.
          </p>
        </footer>
      </div>
    </main>
  );
}
