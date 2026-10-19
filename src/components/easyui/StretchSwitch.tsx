/**
 * Adapted from EasyUI (https://github.com/Surajmaurya1/easyui)
 * MIT License, Copyright (c) 2026 Suraj Maurya.
 * Adapted: navy/emerald theme, forced LTR track for RTL pages, reduced-motion (no stretch).
 */
"use client";
import React, { useState } from "react";
import { motion, useMotionValue, animate, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { motionTransitions } from "@/lib/motion-tokens";

const TRACK_WIDTH = 40, THUMB_SIZE = 16, TRACK_PADDING = 2;
const TRAVEL = TRACK_WIDTH - THUMB_SIZE - TRACK_PADDING * 2;

export function StretchSwitch({ checked, defaultChecked = false, disabled = false, onChange, label, description, className }: {
  checked?: boolean; defaultChecked?: boolean; disabled?: boolean;
  onChange?: (checked: boolean) => void; label?: React.ReactNode; description?: string; className?: string;
}) {
  const [isOn, setIsOn] = useState(defaultChecked);
  const isControlled = checked !== undefined;
  const current = isControlled ? checked : isOn;
  const x = useMotionValue(current ? TRAVEL : 0);
  const [pressed, setPressed] = useState(false);
  const reduced = useReducedMotion() ?? false;

  React.useEffect(() => {
    animate(x, current ? TRAVEL : 0, reduced ? { duration: 0.1 } : motionTransitions.springSnappy);
  }, [current, x, reduced]);

  const flip = () => {
    if (disabled) return;
    const next = !current;
    if (!isControlled) setIsOn(next);
    onChange?.(next);
  };

  return (
    <div className={cn("flex items-center justify-between gap-3", className)}>
      {(label || description) && (
        <div>
          {label && <div className="text-sm font-medium text-slate-100">{label}</div>}
          {description && <div className="text-xs text-slate-500 mt-0.5">{description}</div>}
        </div>
      )}
      <button type="button" role="switch" aria-checked={current} disabled={disabled} onClick={flip}
        onPointerDown={() => setPressed(true)} onPointerUp={() => setPressed(false)} onPointerLeave={() => setPressed(false)}
        dir="ltr"
        className={cn("relative rounded-full p-0.5 transition-colors cursor-pointer disabled:opacity-50",
          current ? "bg-accent-600" : "bg-navy-700")}
        style={{ width: TRACK_WIDTH, height: THUMB_SIZE + TRACK_PADDING * 2 }}>
        <motion.div className="rounded-full bg-white" style={{ x }}
          animate={reduced ? {} : { scaleX: pressed ? 1.25 : 1, scaleY: pressed ? 0.85 : 1 }}
          transition={motionTransitions.springSnappy}
          layout={false}
          // width/height fixed
          initial={false}>
          <div style={{ width: THUMB_SIZE, height: THUMB_SIZE }} />
        </motion.div>
      </button>
    </div>
  );
}
