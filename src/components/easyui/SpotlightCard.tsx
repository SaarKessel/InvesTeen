/**
 * Adapted from EasyUI (https://github.com/Surajmaurya1/easyui)
 * MIT License, Copyright (c) 2026 Suraj Maurya.
 * Adapted: navy theme; spotlight follows pointer (desktop), reduced-motion safe.
 */
"use client";
import React, { useRef } from "react";
import { motion, useMotionTemplate, useMotionValue, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface SpotlightCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  spotlightColor?: string;
  spotlightSize?: number;
  className?: string;
}

export function SpotlightCard({ children, spotlightColor = "rgba(16, 185, 129, 0.09)", spotlightSize = 350, className, ...props }: SpotlightCardProps) {
  const mouseX = useMotionValue(-1000);
  const mouseY = useMotionValue(-1000);
  const cardRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion() ?? false;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reduced || !cardRef.current) return;
    const { left, top } = cardRef.current.getBoundingClientRect();
    mouseX.set(e.clientX - left);
    mouseY.set(e.clientY - top);
  };

  const backgroundGradient = useMotionTemplate`radial-gradient(${spotlightSize}px circle at ${mouseX}px ${mouseY}px, ${spotlightColor}, transparent 80%)`;
  const borderGradient = useMotionTemplate`radial-gradient(220px circle at ${mouseX}px ${mouseY}px, rgba(255, 255, 255, 0.14), transparent 80%)`;

  return (
    <div ref={cardRef} onMouseMove={handleMouseMove}
      onMouseLeave={() => { mouseX.set(-1000); mouseY.set(-1000); }}
      className={cn("group relative card overflow-hidden transition-colors duration-300 hover:border-navy-600", className)} {...props}>
      {!reduced && (
        <>
          <motion.div className="pointer-events-none absolute -inset-px rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={{ background: borderGradient }} />
          <motion.div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={{ background: backgroundGradient }} />
        </>
      )}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
