/**
 * Adapted from EasyUI IOSSearchBar (https://github.com/Surajmaurya1/easyui)
 * MIT License, Copyright (c) 2026 Suraj Maurya.
 * Adapted: navy tokens, inline SVG icons, RTL (logical properties), full-width
 * variant, reduced-motion = instant width change.
 */
"use client";
import React, { useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { motionTransitions } from "@/lib/motion-tokens";

export interface SearchBarProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  clearLabel?: string;
  className?: string;
}

export function SearchBar({ value, onChange, placeholder = "חיפוש...", clearLabel = "ניקוי חיפוש", className }: SearchBarProps) {
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const reduced = useReducedMotion();

  return (
    <motion.div
      animate={{ scale: focused ? 1.01 : 1 }}
      transition={reduced ? { duration: 0 } : motionTransitions.springSmooth}
      className={cn("relative flex items-center w-full", className)}
    >
      <div className={cn(
        "relative w-full flex items-center h-11 px-3.5 rounded-full border transition-colors duration-200",
        focused ? "bg-navy-800 border-accent-600/60" : "bg-navy-900 border-navy-700 hover:border-navy-500"
      )}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden
          className={cn("shrink-0 ms-0.5 me-2.5 transition-colors", focused ? "text-slate-100" : "text-slate-500")}>
          <circle cx="11" cy="11" r="7" /><path d="M20 20l-3.2-3.2" />
        </svg>
        <input
          ref={inputRef}
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyDown={(e) => { if (e.key === "Escape") inputRef.current?.blur(); }}
          placeholder={placeholder}
          aria-label={placeholder}
          className="w-full bg-transparent text-[16px] text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-0 [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-cancel-button]:appearance-none"
        />
        <AnimatePresence>
          {value.length > 0 && (
            <motion.button
              type="button"
              onClick={() => { onChange(""); inputRef.current?.focus(); }}
              initial={{ opacity: 0, scale: reduced ? 1 : 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: reduced ? 1 : 0.8 }}
              transition={{ duration: reduced ? 0 : 0.15 }}
              aria-label={clearLabel}
              className="p-1.5 rounded-full bg-navy-700 text-slate-400 hover:text-white transition-colors shrink-0 ms-1.5"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" aria-hidden>
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
