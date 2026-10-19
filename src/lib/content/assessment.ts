/**
 * Onboarding diagnostic assessment (brief section 5, step 3).
 * Identifies knowledge GAPS - it never labels the user.
 * Each question maps to the lesson that teaches the topic.
 */
export interface DiagnosticQuestion {
  id: string;
  topicHe: string;
  questionHe: string;
  optionsHe: string[];
  correctIndex: number;
  lessonId: string;
}

export const DIAGNOSTIC: DiagnosticQuestion[] = [
  { id: "d-save-invest", topicHe: "חיסכון מול השקעה", lessonId: "a1-saving-vs-investing",
    questionHe: "כסף שצריך בעוד חודשיים למטרה חשובה - מה בדרך כלל מתאים לו?",
    optionsHe: ["השקעה במניה אחת", "חיסכון נזיל ובטוח", "הימור על מטבע"],
    correctIndex: 1 },
  { id: "d-inflation", topicHe: "אינפלציה", lessonId: "a2-inflation",
    questionHe: "אם המחירים עולים 3% בשנה, מה קורה לכסף ששוכב בקופה?",
    optionsHe: ["שום דבר", "כוח הקנייה שלו יורד", "הוא מוכפל"],
    correctIndex: 1 },
  { id: "d-compound", topicHe: "ריבית דריבית", lessonId: "a3-compound-growth",
    questionHe: "1,000 ש\"ח בריבית דריבית של 10% לשנה - כמה אחרי שנתיים?",
    optionsHe: ["1,200 ש\"ח", "1,210 ש\"ח", "1,100 ש\"ח"],
    correctIndex: 1 },
  { id: "d-stock-index", topicHe: "מניות וקרנות מדד", lessonId: "b1-stocks-and-index",
    questionHe: "מהי קרן מדד?",
    optionsHe: ["סל רחב של חברות ביחידה אחת", "הלוואה למדינה", "חשבון בנק"],
    correctIndex: 0 },
  { id: "d-diversification", topicHe: "פיזור", lessonId: "b2-diversification-risk",
    questionHe: "מה המטרה העיקרית של פיזור?",
    optionsHe: ["להבטיח רווח", "להוריד תלות בנכס אחד", "לשלם יותר עמלות"],
    correctIndex: 1 },
  { id: "d-fees", topicHe: "עלויות ועמלות", lessonId: "d1-costs-and-fees",
    questionHe: "מה ההשפעה של עמלה שנתית קטנה לאורך 20 שנה?",
    optionsHe: ["זניחה לחלוטין", "מצטברת להבדל גדול בתוצאה", "תלויה בצבע הלוגו"],
    correctIndex: 1 }
];
