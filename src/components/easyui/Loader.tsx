/**
 * Adapted from EasyUI (https://github.com/Surajmaurya1/easyui)
 * MIT License, Copyright (c) 2026 Suraj Maurya.
 * Adapted: navy theme, reduced-motion honored, Hebrew label default.
 */
"use client";
import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface LoaderProps {
  size?: number;
  variant?: "arc" | "dots" | "line";
  label?: string;
  color?: string;
  className?: string;
}

export function Loader({ size = 32, variant = "arc", label = "טוען...", color = "#10b981", className }: LoaderProps) {
  const reduced = useReducedMotion() ?? false;
  return (
    <div role="status" aria-busy="true" aria-label={label}
      className={cn("inline-flex flex-col items-center justify-center gap-2 text-slate-100", className)}>
      {variant === "arc" && (
        <div style={{ width: size, height: size }} className="relative flex items-center justify-center">
          <svg className={cn("w-full h-full", !reduced && "animate-spin")} style={{ animationDuration: "2.5s" }} viewBox="0 0 40 40" fill="none">
            <circle cx="20" cy="20" r="16" stroke="#1e3a6e" strokeWidth="3" className="opacity-60" />
            <circle cx="20" cy="20" r="16" stroke={color} strokeWidth="3" strokeLinecap="round" strokeDasharray="100" strokeDashoffset="65" />
          </svg>
        </div>
      )}
      {variant === "dots" && (
        <div style={{ width: size * 1.5, height: size * 0.4 }} className="flex items-center justify-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <motion.span key={i} className="rounded-full" style={{ width: Math.max(4, size * 0.18), height: Math.max(4, size * 0.18), backgroundColor: color }}
              animate={reduced ? { opacity: [0.3, 0.8, 0.3] } : { scale: [0.8, 1.25, 0.8], opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.22, ease: "easeInOut" }} />
          ))}
        </div>
      )}
      {variant === "line" && (
        <div style={{ width: size * 2, height: Math.max(3, size * 0.08) }} className="relative rounded-full bg-navy-800 overflow-hidden">
          <motion.div className="absolute top-0 bottom-0 rounded-full" style={{ width: "35%", backgroundColor: color }}
            animate={reduced ? { opacity: [0.4, 1, 0.4] } : { left: ["-35%", "100%"] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: [0.4, 0, 0.2, 1] }} />
        </div>
      )}
      <span className="sr-only">{label}</span>
    </div>
  );
}
