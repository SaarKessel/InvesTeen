/**
 * Interactive learning missions (brief section 10.2).
 * Deterministic, documented assumptions; never presented as predictions.
 */

export interface Mission {
  id: string;
  titleHe: string;
  objectiveHe: string;
  prerequisitesHe: string[];
  successHe: string;
  /** Implementation key used by the mission runner. */
  kind: "diversification" | "inflation" | "fees";
}

export const MISSIONS: Mission[] = [
  {
    id: "m3-diversification",
    titleHe: "אל תשים הכול בסל אחד",
    objectiveHe: "לבנות שני תיקים - מרוכז ומפוזר - ולראות איך הם מתנהגים באותו תרחיש ירידה בענף.",
    prerequisitesHe: ["b2-diversification-risk"],
    successHe: "השוואת שני תיקים בתרחיש והסברת ההבדל במילים שלך.",
    kind: "diversification"
  },
  {
    id: "m2-inflation",
    titleHe: "נצח את האינפלציה",
    objectiveHe: "לחשב כוח קנייה של סכום קבוע לאורך שנים ולראות איזו תשואה משמרת אותו.",
    prerequisitesHe: ["a2-inflation"],
    successHe: "חישוב נכון של כוח קנייה בעתיד לפי הנחות מוצהרות.",
    kind: "inflation"
  },
  {
    id: "m6-fees",
    titleHe: "עלות העמלות",
    objectiveHe: "להשוות תוצאה ארוכת שנים של אותה השקעה עם עמלות שונות.",
    prerequisitesHe: ["a3-compound-growth"],
    successHe: "הבנה איך הבדל קטן בעמלה מצטבר להבדל גדול לאורך זמן.",
    kind: "fees"
  }
];

export function getMission(id: string): Mission | null {
  return MISSIONS.find((m) => m.id === id) ?? null;
}
