import type { DatabaseSync } from "node:sqlite";
import type { MarketDataProvider } from "@/lib/market/types";
import { getPortfolio } from "@/lib/engine/portfolio";
import { formatVT } from "@/lib/money";
import { getAccountByUser } from "@/lib/engine/accounts";

/**
 * AI Financial Mentor - service layer (brief section 9).
 * LOCAL EDUCATIONAL FALLBACK: deterministic, rule-based educator. No external AI provider
 * is called until the owner supplies credentials (server-side only, via vault).
 * The mentor explains; the engine computes. The mentor never invents prices or transactions,
 * never gives personalized buy/sell instructions, and never promises returns.
 */

const SAFETY_PATTERNS: { re: RegExp; reply: string }[] = [
  { re: /(איזו מניה|מה לקנות|מה כדאי לקנות|תעשה אותי עשיר|איך להתעשר|מניה שתזנק|מה יעלה)/,
    reply: "אני לא נותן המלצות קנייה או מכירה, ואף אחד לא יכול להבטיח איזו מניה תזנק. במקום זה אשמח ללמד אותך איך חברות עובדות, מה זה סיכון ותשואה, ואיך פיזור מוריד סיכון. רוצה שנתחיל באחד מהנושאים האלה?" },
  { re: /(מכור הכול|למכור הכול|למכור את הכול)/,
    reply: "אני לא אגיד לך מה לעשות עם התיק - גם לא וירטואלי. אבל אפשר ללמוד: ירידות הן חלק טבעי מהשוק (תנודתיות), החלטות ברגש בדרך כלל פוגעות בתוצאה, ואופק זמן ארוך משנה את המשמעות של ירידה זמנית. מה היית רוצה להבין: תנודתיות, פיזור, או פסיכולוגיה של משקיעים?" },
  { re: /(הבטח|מובטח|בטוח שירוויח|בלי סיכון בכלל)/,
    reply: "אין השקעה עם תשואה מובטחת. כל הצהרה כזאת היא סימן אזהרה להונאה. אני יכול להסביר איך מעריכים סיכון בצורה מושכלת." }
];

const CONCEPTS: { re: RegExp; title: string; reply: string }[] = [
  { re: /ריבית דריבית|דריבית/, title: "ריבית דריבית",
    reply: "ריבית דריבית: התשואה מצטרפת לקרן, ובתקופה הבאה מרוויחים גם על הרווחים. 1,000 ב-10% לשנה: אחרי שנה 1,100, אחרי שנתיים 1,210 (ולא 1,200). עם השנים האפקט מואץ - ולכן זמן הוא המשאב הכי חשוב של משקיע. מומלץ: שיעור \"ריבית דריבית: הכוח של זמן\"." },
  { re: /אינפלציה/, title: "אינפלציה",
    reply: "אינפלציה היא עלייה כללית במחירים: אותו שקל קונה פחות. אם האינפלציה 3% בשנה, כסף ששוכב בקופה שומר על הסכום אבל מאבד כוח קנייה. כדי לשמור על ערך צריך תשואה לפחות בגובה האינפלציה. מומלץ: שיעור \"אינפלציה: למה הכסף נשחק?\"." },
  { re: /פיזור|ריכוזיות/, title: "פיזור",
    reply: "פיזור = חלוקת הכסף בין נכסים שונים כדי שמכה באחד לא תהרוס את התיק. פיזור מוריד סיכון ספציפי (חברה או ענף אחד) אבל לא סיכון שוק כללי - בירידה כללית גם תיק מפוזר יורד. מומלץ: שיעור \"פיזור וסיכון\" ומשימת \"אל תשים הכול בסל אחד\"." },
  { re: /מה זה מניה|מניה\b/, title: "מניה",
    reply: "מניה היא חלק בעלות זעיר בחברה. מחירה משתנה לפי ציפיות, רווחים וחדשות, ולכן היא תנודתית. חלופה מפוזרת היא קרן מדד - סל רחב של חברות ביחידה אחת. מומלץ: שיעור \"מניות וקרנות מדד\"." },
  { re: /אג\"ח|אגח|קרן אג/, title: "אג\"ח",
    reply: "אג\"ח הוא הלוואה: מלווים כסף לגוף (מדינה או חברה) ומקבלים ריבית. בדרך כלל תנודתי פחות ממניות, אבל גם עם פוטנציאל תשואה נמוך יותר. בתיק הלימודי יש קרן אג\"ח בדויה (BND) שאפשר לתרגל איתה." },
  { re: /מדד|קרן מדד/, title: "קרן מדד",
    reply: "קרן מדד מחזיקה סל רחב של חברות לפי מדד. קנייה אחת = חשיפה מפוזרת להרבה חברות. תנודתית פחות ממניה בודדת, אבל עדיין חשופה לירידות שוק. מומלץ: שיעור \"מניות וקרנות מדד\"." },
  { re: /סיכון/, title: "סיכון",
    reply: "סיכון הוא האפשרות שהתוצאה תהיה שונה מהצפוי - כולל הפסד. כלל יסוד: פוטנציאל תשואה גבוה בא עם סיכון גבוה. חשוב להבדיל בין תנודתיות זמנית להפסד קבוע, ולהתאים את הסיכון לאופק הזמן." }
];

const FALLBACK = "אני המנטור החינוכי של InvesTeen (מצב מקומי, בלי חיבור AI חיצוני עדיין). אני יכול להסביר מושגים כמו ריבית דריבית, אינפלציה, פיזור, מניות, אג\"ח וקרנות מדד, ולנתח את התיק הווירטואלי שלך. נסה לשאול: \"למה התיק שלי ירד?\" או \"מה זה פיזור?\".";

export function mentorRespond(db: DatabaseSync, market: MarketDataProvider, userId: string, message: string): string {
  const text = message.trim();
  if (!text) return FALLBACK;

  for (const s of SAFETY_PATTERNS) if (s.re.test(text)) return s.reply;

  if (/(התיק שלי|הפורטפוליו|למה.*(ירד|עלה)|ניתוח|analyze|portfolio)/i.test(text)) {
    return analyzePortfolio(db, market, userId);
  }

  for (const c of CONCEPTS) if (c.re.test(text)) return c.reply;
  return FALLBACK;
}

function analyzePortfolio(db: DatabaseSync, market: MarketDataProvider, userId: string): string {
  const acct = getAccountByUser(db, userId);
  if (!acct) return "לא נמצא חשבון וירטואלי. השלם את ההרשמה כדי לקבל תיק לימודי.";
  const p = getPortfolio(db, market, acct.id);
  const lines: string[] = [];
  lines.push("ניתוח התיק הווירטואלי שלך (מספרים מחושבים משרת הלימוד, נתוני סימולציה בדויים):");
  lines.push(`מזומן: ${formatVT(p.cashMinor)}`);
  if (p.positions.length === 0) {
    lines.push("אין עדיין פוזיציות. כדאי לבקר בעמוד \"שווקים\", לקרוא על נכס בדוי ולבצע רכישת תרגול קטנה.");
  } else {
    for (const pos of p.positions) {
      if (pos.marketValueMinor === null) {
        lines.push(`${pos.nameHe}: ${pos.qty} יחידות - מחיר סימולציה לא זמין כרגע (לא נספר בשווי).`);
      } else {
        const pnl = pos.unrealizedPnlMinor!;
        const sign = pnl >= 0 ? "רווח" : "הפסד";
        lines.push(`${pos.nameHe}: ${pos.qty} יחידות, שווי ${formatVT(pos.marketValueMinor)}, ${sign} לא ממומש של ${formatVT(Math.abs(pnl))}.`);
      }
    }
    if (p.totalValueMinor !== null && p.simpleReturnPct !== null) {
      lines.push(`שווי כולל: ${formatVT(p.totalValueMinor)} | תשואה מול ההון שהופקד: ${p.simpleReturnPct.toFixed(2)}%.`);
    }
    if (p.concentrationTopPct !== null && p.concentrationTopPct > 60) {
      lines.push(`שים לב: הנכס הגדול מהווה ${p.concentrationTopPct}% מהחלק המושקע - זו ריכוזיות גבוהה. שיעור \"פיזור וסיכון\" מסביר למה זה משנה.`);
    }
  }
  return lines.join("\n");
}
