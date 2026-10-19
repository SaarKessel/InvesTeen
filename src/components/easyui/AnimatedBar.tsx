/**
 * Adapted from EasyUI animated progress bars (https://github.com/Surajmaurya1/easyui)
 * MIT License, Copyright (c) 2026 Suraj Maurya.
 * Adapted: navy/emerald theme, RTL-safe width animation, reduced-motion.
 */
"use client";
import React from "react";
import { motion, useReducedMotion } from "framer-motion";

export function AnimatedBar({ pct, tone = "accent" }: { pct: number; tone?: "accent" | "ice" }) {
  const reduced = useReducedMotion() ?? false;
  const width = `${Math.min(100, Math.max(0, pct))}%`;
  return (
    <div className="h-2 bg-navy-800 rounded-full overflow-hidden" role="img" aria-label={`${pct}%`}>
      <motion.div
        className={`h-full rounded-full ${tone === "accent" ? "bg-accent-600" : "bg-sky-500"}`}
        initial={reduced ? false : { width: 0 }}
        animate={{ width }}
        transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 80, damping: 20 }}
      />
    </div>
  );
}
