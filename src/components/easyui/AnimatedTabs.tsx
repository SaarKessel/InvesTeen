/**
 * Adapted from EasyUI (https://github.com/Surajmaurya1/easyui)
 * MIT License, Copyright (c) 2026 Suraj Maurya.
 * Adapted: navy tokens, tab/tablist ARIA roles, content rendering removed
 * (tabs control external content here), reduced-motion = instant indicator.
 */
"use client";
import React, { useId } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { motionTransitions } from "@/lib/motion-tokens";

export interface AnimatedTabsProps {
  tabs: { id: string; label: string }[];
  activeTab: string;
  onChange: (id: string) => void;
  ariaLabel: string;
  className?: string;
  dir?: "ltr" | "rtl";
}

export function AnimatedTabs({ tabs, activeTab, onChange, ariaLabel, className, dir }: AnimatedTabsProps) {
  const uid = useId();
  const reduced = useReducedMotion();
  return (
    <div role="tablist" aria-label={ariaLabel} dir={dir}
      className={cn("flex items-center gap-1 p-1 rounded-xl bg-navy-900 border border-navy-700/60", className)}>
      {tabs.map((tab) => {
        const active = activeTab === tab.id;
        return (
          <button key={tab.id} role="tab" aria-selected={active} onClick={() => onChange(tab.id)}
            className={cn(
              "relative flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors select-none",
              active ? "text-accent-500" : "text-slate-500 hover:text-slate-300"
            )}>
            {active && (
              <motion.div layoutId={`tab-${uid}`}
                className="absolute inset-0 rounded-lg bg-accent-600/10 border border-accent-600/30"
                transition={reduced ? { duration: 0 } : motionTransitions.springMorph} />
            )}
            <span className="relative z-10">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
