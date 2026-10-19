"use client";
/**
 * Premium CSS-only cinematic backdrop (EasyUI pass replacement for the WebGL scene).
 * Layered navy/emerald gradients with a slow drift; fully static under reduced motion
 * (system pref via CSS media query + in-app toggle via data attribute on <html>).
 */
import React from "react";

export function HeroBackdrop({ subtle = false }: { subtle?: boolean }) {
  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0" style={{
        background:
          "radial-gradient(55% 45% at 72% 18%, rgba(16,185,129,VAR), transparent 62%)," +
          "radial-gradient(45% 38% at 18% 78%, rgba(125,211,252,VAR2), transparent 60%)," +
          "radial-gradient(80% 60% at 50% 110%, rgba(16,185,129,0.06), transparent 70%)," +
          "linear-gradient(180deg, #081126 0%, #050b1a 100%)"
          .replace(/VAR2/g, subtle ? "0.07" : "0.10").replace(/VAR/g, subtle ? "0.12" : "0.20")
      }} />
      {/* slow drifting aurora layer (motion-safe only) */}
      <div className="hero-aurora absolute -inset-1/2" style={{
        background:
          "conic-gradient(from 120deg at 30% 30%, transparent 0deg, rgba(16,185,129,0.08) 60deg, transparent 120deg," +
          " rgba(125,211,252,0.06) 200deg, transparent 280deg)"
      }} />
      {/* fine grid texture */}
      <div className="absolute inset-0 opacity-[0.05]" style={{
        backgroundImage: "linear-gradient(rgba(226,232,240,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(226,232,240,0.5) 1px, transparent 1px)",
        backgroundSize: "44px 44px",
        maskImage: "radial-gradient(70% 60% at 50% 40%, black, transparent)"
      }} />
    </div>
  );
}
