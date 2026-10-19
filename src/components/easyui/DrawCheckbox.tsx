/**
 * Adapted from EasyUI (https://github.com/Surajmaurya1/easyui)
 * MIT License, Copyright (c) 2026 Suraj Maurya.
 * Adapted: navy/emerald tokens instead of CSS vars, reduced-motion = instant check.
 */
"use client";
import React, { forwardRef, useId, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface DrawCheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: React.ReactNode;
  description?: string;
}

export const DrawCheckbox = forwardRef<HTMLInputElement, DrawCheckboxProps>(
  ({ className, label, description, checked, defaultChecked, disabled, id, onChange, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id || generatedId;
    const [internal, setInternal] = useState(defaultChecked || false);
    const isControlled = checked !== undefined;
    const current = isControlled ? checked : internal;
    const reduced = useReducedMotion();

    return (
      <div className={cn("flex items-start gap-2.5 select-none", disabled && "opacity-30 cursor-not-allowed", className)}>
        <div className="relative flex items-center justify-center mt-0.5">
          <input
            ref={ref}
            id={inputId}
            type="checkbox"
            checked={!!current}
            disabled={disabled}
            onChange={(e) => { if (!isControlled) setInternal(e.target.checked); onChange?.(e); }}
            className="peer sr-only"
            {...props}
          />
          <motion.div
            onClick={() => { if (!disabled) (document.getElementById(inputId) as HTMLInputElement | null)?.click(); }}
            initial={false}
            animate={{ scale: current && !reduced ? [0.9, 1.04, 1] : 1 }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              "w-4.5 h-4.5 w-[18px] h-[18px] rounded-[5px] border flex items-center justify-center cursor-pointer transition-colors",
              current ? "bg-accent-600 border-accent-600" : "bg-navy-800 border-navy-600 hover:border-navy-500"
            )}
          >
            {current && (
              <motion.svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="#fff" strokeWidth="2.4"
                strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <motion.path d="M3.5 8.5 L6.5 11.5 L12.5 5"
                  initial={{ pathLength: reduced ? 1 : 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: reduced ? 0 : 0.28, ease: [0.65, 0, 0.35, 1] }} />
              </motion.svg>
            )}
          </motion.div>
        </div>
        {(label || description) && (
          <label htmlFor={inputId} className={cn("cursor-pointer", disabled && "cursor-not-allowed")}>
            {label && <div className="text-sm font-medium text-slate-200 leading-tight">{label}</div>}
            {description && <div className="text-xs text-slate-400 mt-0.5 leading-relaxed">{description}</div>}
          </label>
        )}
      </div>
    );
  }
);
DrawCheckbox.displayName = "DrawCheckbox";
