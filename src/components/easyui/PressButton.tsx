/**
 * Adapted from EasyUI (https://github.com/Surajmaurya1/easyui)
 * MIT License, Copyright (c) 2026 Suraj Maurya.
 * Adapted: maps to InvesTeen button tokens, reduced-motion = no compression.
 */
"use client";
import React, { forwardRef, useState } from "react";
import { motion, useReducedMotion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";
import { motionTransitions } from "@/lib/motion-tokens";

export interface PressButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  variant?: "primary" | "secondary";
  fullWidth?: boolean;
  children?: React.ReactNode;
}

export const PressButton = forwardRef<HTMLButtonElement, PressButtonProps>(
  ({ variant = "primary", fullWidth = false, disabled, className, children, type = "button", ...props }, ref) => {
    const [pressed, setPressed] = useState(false);
    const reduced = useReducedMotion();
    return (
      <motion.button
        ref={ref}
        type={type}
        disabled={disabled}
        onTapStart={() => setPressed(true)}
        onTap={() => setPressed(false)}
        onTapCancel={() => setPressed(false)}
        animate={reduced ? undefined : { scaleX: pressed ? 0.97 : 1, scaleY: pressed ? 0.94 : 1 }}
        transition={motionTransitions.springSnappy}
        className={cn(
          "relative inline-flex items-center justify-center gap-2 font-semibold rounded-xl px-4 py-2.5 select-none transition-colors duration-150",
          variant === "primary"
            ? "bg-accent-600 hover:bg-accent-500 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            : "bg-navy-800 hover:bg-navy-700 text-slate-100 border border-navy-600 disabled:opacity-50 disabled:cursor-not-allowed",
          fullWidth && "w-full",
          className
        )}
        {...props}
      >
        {children}
      </motion.button>
    );
  }
);
PressButton.displayName = "PressButton";
