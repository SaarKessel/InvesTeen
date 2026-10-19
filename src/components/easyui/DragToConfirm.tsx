/**
 * Adapted from EasyUI (https://github.com/Surajmaurya1/easyui)
 * MIT License, Copyright (c) 2026 Suraj Maurya.
 * Adapted: navy/emerald tokens, inline SVG icons (no lucide dep), track is
 * dir="ltr" internally (a physical gesture), Hebrew labels via props,
 * reduced-motion = instant transitions, screen-reader fallback button kept.
 */
"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useTransform, animate, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { motionTransitions } from "@/lib/motion-tokens";

export interface DragToConfirmProps {
  label: string;
  confirmedLabel?: string;
  tone?: "confirm" | "sell";
  onConfirm?: () => void;
  onReset?: () => void;
  autoResetDelay?: number;
  disabled?: boolean;
  pending?: boolean;
  className?: string;
}

const Chevron = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M9 6l6 6-6 6" />
  </svg>
);
const Check = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M4.5 12.5l5 5 10-11" />
  </svg>
);

export function DragToConfirm({
  label,
  confirmedLabel = "אושר",
  tone = "confirm",
  onConfirm,
  onReset,
  autoResetDelay = 2500,
  disabled = false,
  pending = false,
  className
}: DragToConfirmProps) {
  const [isConfirmed, setIsConfirmed] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragMax, setDragMax] = useState(200);
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reduced = useReducedMotion();
  const x = useMotionValue(0);

  const isDisabled = disabled || pending;

  const calc = useCallback(() => {
    if (trackRef.current) setDragMax(Math.max(40, trackRef.current.offsetWidth - 48));
  }, []);
  useEffect(() => {
    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, [calc]);
  useEffect(() => () => { if (resetTimerRef.current) clearTimeout(resetTimerRef.current); }, []);

  const textOpacity = useTransform(x, [0, dragMax * 0.55], [1, 0]);
  const fillWidth = useTransform(x, (v) => `${Math.min(dragMax + 44, v + 44)}px`);

  const confirm = useCallback(() => {
    animate(x, dragMax, reduced ? { duration: 0 } : motionTransitions.springSnappy);
    setIsConfirmed(true);
    onConfirm?.();
    if (autoResetDelay > 0) {
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
      resetTimerRef.current = setTimeout(() => {
        setIsConfirmed(false);
        animate(x, 0, reduced ? { duration: 0 } : motionTransitions.springResponsive);
        onReset?.();
      }, autoResetDelay);
    }
  }, [autoResetDelay, dragMax, onConfirm, onReset, reduced, x]);

  const toneCls = tone === "sell"
    ? { fill: "bg-amber-500/15", track: "bg-amber-500/10 border-amber-500/40", handle: "bg-amber-500 text-navy-950 border-amber-500", text: "text-amber-400 font-semibold" }
    : { fill: "bg-accent-500/15", track: "bg-accent-500/10 border-accent-500/40", handle: "bg-accent-600 text-white border-accent-600", text: "text-accent-500 font-semibold" };

  return (
    <div className={cn("w-full select-none", className)} dir="ltr">
      <div
        ref={trackRef}
        className={cn(
          "relative h-12 p-1 rounded-full border flex items-center overflow-hidden transition-colors duration-200",
          isConfirmed ? toneCls.track : "bg-navy-900 border-navy-700",
          isDisabled && "opacity-40 cursor-not-allowed"
        )}
      >
        <motion.div style={{ width: isConfirmed ? "100%" : fillWidth }}
          className={cn("absolute left-0 top-0 bottom-0 rounded-full pointer-events-none", toneCls.fill)} />
        <motion.div style={{ opacity: isConfirmed ? 0 : textOpacity }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none text-xs font-medium text-slate-400 tracking-tight">
          {pending ? "מבצע..." : label}
        </motion.div>
        {isConfirmed && (
          <motion.div initial={{ opacity: 0, scale: reduced ? 1 : 0.94 }} animate={{ opacity: 1, scale: 1 }}
            transition={reduced ? { duration: 0 } : motionTransitions.springSnappy}
            className={cn("absolute inset-0 flex items-center justify-center pointer-events-none text-xs tracking-tight", toneCls.text)}>
            {confirmedLabel}
          </motion.div>
        )}
        <motion.div
          drag={isDisabled || isConfirmed ? false : "x"}
          dragConstraints={{ left: 0, right: dragMax }}
          dragElastic={0.06}
          dragMomentum={false}
          style={{ x }}
          onDragEnd={() => {
            if (x.get() >= dragMax * 0.85 && !isConfirmed && !isDisabled) confirm();
            else animate(x, 0, reduced ? { duration: 0 } : motionTransitions.springResponsive);
          }}
          whileDrag={reduced ? undefined : { scale: 1.04 }}
          transition={reduced ? { duration: 0 } : motionTransitions.springSnappy}
          className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center z-20 relative touch-none cursor-grab active:cursor-grabbing transition-colors",
            isConfirmed ? toneCls.handle : "bg-navy-800 border border-navy-600 text-slate-200 hover:border-navy-500"
          )}
          tabIndex={isDisabled ? -1 : 0}
          role="slider"
          aria-label={label}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={isConfirmed ? 100 : Math.round((x.get() / (dragMax || 1)) * 100)}
          onKeyDown={(e) => {
            if (["Enter", " ", "ArrowRight"].includes(e.key)) { e.preventDefault(); if (!isDisabled && !isConfirmed) confirm(); }
          }}
        >
          {isConfirmed ? <Check /> : <Chevron />}
        </motion.div>
      </div>
      {/* Screen-reader / keyboard fallback: the confirm path without dragging */}
      <button type="button" className="sr-only" onClick={() => { if (!isDisabled && !isConfirmed) confirm(); }} disabled={isDisabled || isConfirmed}>
        {label}
      </button>
    </div>
  );
}
