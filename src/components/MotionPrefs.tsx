"use client";
import React, { useEffect, useState } from "react";
import { MotionConfig } from "framer-motion";

const KEY = "it-reduced-motion";

export function motionPrefReduced(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(KEY) === "1";
}

export function setMotionPref(reduced: boolean): void {
  window.localStorage.setItem(KEY, reduced ? "1" : "0");
  window.dispatchEvent(new CustomEvent("it-motion-pref", { detail: reduced }));
}

/** Client hook: true when motion should be reduced (system pref OR in-app toggle). */
export function useReducedMotionPref(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const sys = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(motionPrefReduced() || sys.matches);
    update();
    const handler = () => update();
    window.addEventListener("it-motion-pref", handler);
    sys.addEventListener("change", handler);
    return () => { window.removeEventListener("it-motion-pref", handler); sys.removeEventListener("change", handler); };
  }, []);
  return reduced;
}

/** Wraps the app: honors system preference, plus an in-app override from Settings. */
export function MotionPrefs({ children }: { children: React.ReactNode }) {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const sys = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => {
      const r = motionPrefReduced() || sys.matches;
      setReduced(motionPrefReduced());
      document.documentElement.dataset.rm = r ? "1" : "0";
    };
    apply();
    const handler = () => apply();
    window.addEventListener("it-motion-pref", handler);
    sys.addEventListener("change", handler);
    return () => { window.removeEventListener("it-motion-pref", handler); sys.removeEventListener("change", handler); };
  }, []);
  return <MotionConfig reducedMotion={reduced ? "always" : "user"}>{children}</MotionConfig>;
}
