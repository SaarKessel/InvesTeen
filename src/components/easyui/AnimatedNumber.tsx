/**
 * Adapted from EasyUI (https://github.com/Surajmaurya1/easyui)
 * MIT License, Copyright (c) 2026 Suraj Maurya.
 * Adapted: he-IL grouping, reduced-motion renders final value, navy theme.
 */
"use client";
import React, { useEffect } from "react";
import { motion, useSpring, useTransform, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface AnimatedNumberProps {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  stiffness?: number;
  damping?: number;
  className?: string;
}

function DigitColumn({ digit, stiffness = 160, damping = 18 }: { digit: string; stiffness?: number; damping?: number }) {
  const isNumber = !isNaN(parseInt(digit, 10));
  const numValue = isNumber ? parseInt(digit, 10) : 0;
  const spring = useSpring(numValue, { stiffness, damping, mass: 0.8 });
  const y = useTransform(spring, (current) => `-${current * 10}%`);
  useEffect(() => { spring.set(numValue); }, [spring, numValue]);
  if (!isNumber) return <span className="inline-block">{digit}</span>;
  return (
    <div className="inline-block relative overflow-hidden h-[1.15em] leading-[1.15em] w-[0.58em] text-center">
      <motion.div style={{ y }} className="flex flex-col select-none">
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
          <div key={n} className="h-[1.15em] flex items-center justify-center">{n}</div>
        ))}
      </motion.div>
    </div>
  );
}

export function AnimatedNumber({ value, decimals = 0, prefix = "", suffix = "", stiffness = 170, damping = 22, className }: AnimatedNumberProps) {
  const reduced = useReducedMotion() ?? false;
  const fixed = Math.abs(value).toFixed(decimals);
  const [intPart, decPart] = fixed.split(".");
  const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const formattedStr = `${value < 0 ? "-" : ""}${formattedInt}${decPart !== undefined && decimals > 0 ? "." + decPart : ""}`;

  if (reduced) {
    return <span className={cn("inline-flex items-baseline font-mono tracking-tight text-slate-50 select-none", className)} dir="ltr">{prefix}{formattedStr}{suffix}</span>;
  }
  return (
    <span className={cn("inline-flex items-baseline font-mono tracking-tight text-slate-50 select-none", className)} dir="ltr" aria-label={`${prefix}${formattedStr}${suffix}`}>
      {prefix && <span className="mr-0.5">{prefix}</span>}
      <span className="inline-flex items-baseline overflow-hidden">
        {formattedStr.split("").map((char, index) => (
          <DigitColumn key={`${index}-${char === "," || char === "." || char === "-" ? char : "num"}`} digit={char} stiffness={stiffness} damping={damping} />
        ))}
      </span>
      {suffix && <span className="ml-0.5">{suffix}</span>}
    </span>
  );
}
