/**
 * Animated number. Internals: NumberFlow (https://number-flow.barvian.me),
 * MIT License, Copyright (c) 2024-2026 Max Barvian.
 * (Originally adapted from EasyUI's AnimatedNumber, MIT (c) 2026 Suraj Maurya.)
 * he-IL grouping, dir="ltr" wrapper, reduced-motion handled by NumberFlow
 * (respectMotionPreference: instant updates).
 */
"use client";
import React from "react";
import NumberFlow from "@number-flow/react";
import { cn } from "@/lib/utils";

export interface AnimatedNumberProps {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  stiffness?: number; // kept for API compatibility (unused by NumberFlow)
  damping?: number;   // kept for API compatibility (unused by NumberFlow)
  className?: string;
}

export function AnimatedNumber({ value, decimals = 0, prefix = "", suffix = "", className }: AnimatedNumberProps) {
  return (
    <span className={cn("inline-flex items-baseline font-mono tracking-tight text-slate-50 select-none", className)} dir="ltr">
      <NumberFlow
        value={value}
        locales="he-IL"
        format={{ minimumFractionDigits: decimals, maximumFractionDigits: decimals }}
        prefix={prefix}
        suffix={suffix}
        respectMotionPreference
      />
    </span>
  );
}
