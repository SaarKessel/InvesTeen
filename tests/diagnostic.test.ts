import { describe, it, expect } from "vitest";
import { DIAGNOSTIC } from "@/lib/content/assessment";
import { LESSONS } from "@/lib/content/lessons";

describe("diagnostic assessment", () => {
  it("has one question per topic and each maps to an existing lesson", () => {
    expect(DIAGNOSTIC.length).toBeGreaterThanOrEqual(6);
    for (const q of DIAGNOSTIC) {
      expect(LESSONS.some((l) => l.id === q.lessonId)).toBe(true);
      expect(q.correctIndex).toBeLessThan(q.optionsHe.length);
    }
  });
});
