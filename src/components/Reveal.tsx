"use client";
import React from "react";
import { motion, useReducedMotion } from "framer-motion";

/** Scroll-reveal wrapper (subtle rise + fade). Static under reduced motion. */
export function Reveal({ children, delay = 0, className }: { children: React.ReactNode; delay?: number; className?: string }) {
  const reduced = useReducedMotion() ?? false;
  if (reduced) return <div className={className}>{children}</div>;
  return (
    <motion.div className={className}
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ type: "spring", stiffness: 90, damping: 18, delay }}>
      {children}
    </motion.div>
  );
}
