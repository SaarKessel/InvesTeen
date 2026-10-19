/**
 * Adapted from EasyUI stepper (https://github.com/Surajmaurya1/easyui)
 * MIT License, Copyright (c) 2026 Suraj Maurya.
 * Adapted: navy theme, RTL, reduced-motion.
 */
"use client";
import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { motionTransitions } from "@/lib/motion-tokens";

export function Stepper({ steps, current, className }: { steps: string[]; current: number; className?: string }) {
  const reduced = useReducedMotion() ?? false;
  return (
    <ol className={cn("flex items-center gap-2", className)} aria-label="שלבי תהליך">
      {steps.map((label, i) => {
        const done = i < current, active = i === current;
        return (
          <li key={label} className="flex items-center gap-2 min-w-0">
            <motion.span
              initial={false}
              animate={reduced ? {} : { scale: active ? 1.08 : 1 }}
              transition={motionTransitions.springSnappy}
              className={cn("flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold shrink-0 border",
                done ? "bg-accent-600 border-accent-600 text-white" :
                active ? "border-accent-500 text-accent-500" : "border-navy-600 text-slate-500")}
              aria-current={active ? "step" : undefined}>
              {done ? "✓" : i + 1}
            </motion.span>
            {/* Mobile: show only the active step's label so nothing truncates; all labels from sm up. */}
            <span className={cn("text-xs whitespace-nowrap",
              active ? "text-slate-100 font-medium" : "text-slate-500 hidden sm:inline")}>{label}</span>
            {i < steps.length - 1 && <span className={cn("h-px w-3 sm:w-8 shrink-0", done ? "bg-accent-600" : "bg-navy-700")} />}
          </li>
        );
      })}
    </ol>
  );
}
