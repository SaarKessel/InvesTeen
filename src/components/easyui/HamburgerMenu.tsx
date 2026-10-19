/**
 * Adapted from EasyUI HamburgerMenu (https://github.com/Surajmaurya1/easyui)
 * MIT License, Copyright (c) 2026 Suraj Maurya.
 * Adapted: navy theme, RTL slide-over, reduced-motion.
 */
"use client";
import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { motionTransitions } from "@/lib/motion-tokens";

export interface MenuLink { href: string; label: string }

export function HamburgerMenu({ links, label = "תפריט" }: { links: MenuLink[]; label?: string }) {
  const [open, setOpen] = useState(false);
  const reduced = useReducedMotion() ?? false;
  return (
    <>
      <button aria-label={label} aria-expanded={open} onClick={() => setOpen(true)}
        className="flex flex-col items-center justify-center gap-[3px] w-9 h-9 rounded-xl hover:bg-navy-800 text-slate-300">
        <motion.span animate={open ? { rotate: 45, y: 5 } : { rotate: 0, y: 0 }} transition={reduced ? { duration: 0 } : motionTransitions.springSnappy} className="block w-4.5 w-[18px] h-[2px] bg-current rounded" />
        <motion.span animate={open ? { opacity: 0 } : { opacity: 1 }} className="block w-[18px] h-[2px] bg-current rounded" />
        <motion.span animate={open ? { rotate: -45, y: -5 } : { rotate: 0, y: 0 }} transition={reduced ? { duration: 0 } : motionTransitions.springSnappy} className="block w-[18px] h-[2px] bg-current rounded" />
      </button>
      <AnimatePresence>
        {open && (
          <>
            <motion.div className="fixed inset-0 bg-black/50 z-40"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setOpen(false)} />
            <motion.aside
              initial={reduced ? { opacity: 0 } : { x: "-100%" }}
              animate={reduced ? { opacity: 1 } : { x: 0 }}
              exit={reduced ? { opacity: 0 } : { x: "-100%" }}
              transition={reduced ? { duration: 0.12 } : motionTransitions.springGentle}
              className="fixed top-0 bottom-0 left-0 w-64 bg-navy-900 border-r border-navy-700 z-50 p-5 flex flex-col gap-1">
              <div className="flex items-center justify-between mb-4">
                <span className="font-extrabold">InvesTeen<span className="text-accent-500">.</span></span>
                <button aria-label="סגירת תפריט" onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-200 p-1">✕</button>
              </div>
              {links.map((l) => (
                <Link key={l.href} href={l.href} onClick={() => setOpen(false)}
                  className="px-3 py-2.5 rounded-xl hover:bg-navy-800 text-slate-200">{l.label}</Link>
              ))}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
