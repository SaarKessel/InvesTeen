/**
 * Adapted from EasyUI PillNavigation (https://github.com/Surajmaurya1/easyui)
 * MIT License, Copyright (c) 2026 Suraj Maurya.
 * Adapted: link-based (uses current route), navy theme, RTL, reduced-motion
 * (static highlight instead of sliding layoutId).
 */
"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { motionTransitions } from "@/lib/motion-tokens";

export interface PillLink { href: string; label: string; icon: React.ReactNode }

export function PillNav({ links, variant, group }: { links: PillLink[]; variant: "sidebar" | "bottom"; group: string }) {
  const pathname = usePathname();
  const reduced = useReducedMotion() ?? false;
  return (
    <>
      {links.map((l) => {
        const active = pathname === l.href || (l.href !== "/dashboard" && pathname.startsWith(l.href));
        return (
          <Link key={l.href} href={l.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "relative transition-colors",
              variant === "sidebar"
                ? "px-3 py-2 rounded-xl flex items-center gap-2.5"
                : "flex flex-col items-center text-[11px] px-2 py-1",
              active ? "text-slate-50" : "text-slate-400 hover:text-slate-200"
            )}>
            {active && (
              reduced ? (
                <span className={cn("absolute inset-0 bg-navy-800 border border-navy-600", variant === "sidebar" ? "rounded-xl" : "rounded-lg")} />
              ) : (
                <motion.span layoutId={`pill-${group}`} transition={motionTransitions.springMorph}
                  className={cn("absolute inset-0 bg-navy-800 border border-navy-600", variant === "sidebar" ? "rounded-xl" : "rounded-lg")} />
              )
            )}
            <span className="relative z-10 flex items-center gap-2.5 flex-col md:flex-row">
              <span className={variant === "bottom" ? "" : ""}>{l.icon}</span>
              {variant === "bottom" ? <span>{l.label}</span> : l.label}
            </span>
          </Link>
        );
      })}
    </>
  );
}
