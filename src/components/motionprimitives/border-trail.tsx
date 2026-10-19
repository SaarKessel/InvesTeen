/**
 * Vendored from Motion Primitives (https://motion-primitives.com),
 * component: border-trail. MIT License, Copyright (c) 2024-2026 Ibelick.
 * Local changes: imports point at framer-motion (same API), InvesTeen tokens.
 */
'use client';
import { cn } from "@/lib/utils";
import { motion, Transition, useReducedMotion } from 'framer-motion';

export type BorderTrailProps = {
  className?: string;
  size?: number;
  transition?: Transition;
  onAnimationComplete?: () => void;
  style?: React.CSSProperties;
};

export function BorderTrail({
  className,
  size = 60,
  transition,
  onAnimationComplete,
  style,
}: BorderTrailProps) {
  const reduced = useReducedMotion();
  const defaultTransition: Transition = {
    repeat: Infinity,
    duration: 5,
    ease: 'linear',
  };

  return (
    <div className='pointer-events-none absolute inset-0 rounded-[inherit] border border-transparent [mask-clip:padding-box,border-box] [mask-composite:intersect] [mask-image:linear-gradient(transparent,transparent),linear-gradient(#000,#000)]'>
      <motion.div
        className={cn('absolute aspect-square bg-zinc-500', className)}
        style={{
          width: size,
          offsetPath: `rect(0 auto auto 0 round ${size}px)`,
          ...style,
        }}
        animate={{
          offsetDistance: ['0%', '100%'],
        }}
        transition={reduced ? { duration: 0, repeat: 0 } : transition || defaultTransition}
        onAnimationComplete={onAnimationComplete}
      />
    </div>
  );
}
