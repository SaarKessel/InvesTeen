/**
 * Adapted from EasyUI DirectionalTooltip (https://github.com/Surajmaurya1/easyui)
 * MIT License, Copyright (c) 2026 Suraj Maurya.
 * Adapted: navy theme, RTL, focus + hover, reduced-motion.
 */
"use client";
import React, { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { motionTransitions } from "@/lib/motion-tokens";

/** Educational term tooltip: dotted-underlined term with a short plain-language explanation. */
export function Term({ children, explain }: { children: React.ReactNode; explain: string }) {
  const [open, setOpen] = useState(false);
  const reduced = useReducedMotion() ?? false;
  return (
    <span className="relative inline-block">
      <button type="button"
        className="underline decoration-dotted decoration-accent-500/70 underline-offset-4 cursor-help text-inherit"
        aria-expanded={open}
        onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)} onBlur={() => setOpen(false)}
        onClick={() => setOpen((o) => !o)}>
        {children}
      </button>
      <AnimatePresence>
        {open && (
          <motion.span role="tooltip"
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 4, scale: 0.97 }}
            animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: 4, scale: 0.97 }}
            transition={reduced ? { duration: 0.1 } : motionTransitions.springSnappy}
            className="absolute z-30 bottom-full mb-2 right-1/2 translate-x-1/2 w-56 card p-3 text-xs text-slate-200 leading-relaxed border-navy-600 shadow-xl">
            {explain}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}
