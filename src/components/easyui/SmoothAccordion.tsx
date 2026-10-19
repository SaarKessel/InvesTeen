/**
 * Adapted from EasyUI (https://github.com/Surajmaurya1/easyui)
 * MIT License, Copyright (c) 2026 Suraj Maurya.
 * Adapted: navy theme, RTL, reduced-motion (instant open).
 */
"use client";
import React, { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { motionTransitions } from "@/lib/motion-tokens";

export interface AccordionItem { id: string; title: string; subtitle?: string; content: React.ReactNode; }

export function SmoothAccordion({ items, allowMultiple = false, defaultOpen = [], className }: {
  items: AccordionItem[]; allowMultiple?: boolean; defaultOpen?: string[]; className?: string;
}) {
  const [openIds, setOpenIds] = useState<string[]>(defaultOpen);
  const reduced = useReducedMotion() ?? false;
  const toggle = (id: string) => {
    if (allowMultiple) setOpenIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
    else setOpenIds((prev) => (prev.includes(id) ? [] : [id]));
  };
  return (
    <div className={cn("flex flex-col divide-y divide-navy-700/60 rounded-2xl border border-navy-700/60 bg-navy-900 overflow-hidden", className)}>
      {items.map((item) => {
        const isOpen = openIds.includes(item.id);
        return (
          <div key={item.id}>
            <button onClick={() => toggle(item.id)} aria-expanded={isOpen}
              className="flex w-full items-center justify-between p-4 text-right font-medium text-slate-100 hover:bg-navy-800 transition-colors cursor-pointer">
              <div>
                <div className="text-sm font-medium">{item.title}</div>
                {item.subtitle && <div className="text-xs text-slate-500 mt-0.5">{item.subtitle}</div>}
              </div>
              <motion.svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 shrink-0 text-slate-400"
                animate={{ rotate: isOpen ? 180 : 0 }} transition={reduced ? { duration: 0 } : motionTransitions.springSnappy}>
                <path d="m6 9 6 6 6-6" />
              </motion.svg>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div key="content"
                  initial={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }}
                  animate={reduced ? { opacity: 1 } : { height: "auto", opacity: 1 }}
                  exit={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }}
                  transition={reduced ? { duration: 0.1 } : motionTransitions.springGentle}
                  className="overflow-hidden">
                  <div className="px-4 pb-4 text-sm text-slate-300 leading-relaxed">{item.content}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
