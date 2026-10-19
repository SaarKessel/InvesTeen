"use client";
import React from "react";
import { PillNav, type PillLink } from "@/components/easyui/PillNav";
import { HamburgerMenu } from "@/components/easyui/HamburgerMenu";

const P = {
  home: "M3 10.5 12 3l9 7.5V21a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z",
  learn: "M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2zm2 12h13",
  chart: "M3 3v18h18M7 14l4-4 3 3 5-6",
  briefcase: "M4 8h16v11H4zM9 8V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3M4 13h16",
  target: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zm0-5a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm0-3a1 1 0 1 0 0-2",
  mentor: "M4 5h16v11H8l-4 4zM8 9h8M8 12h5",
  star: "m12 3 2.7 5.8 6.3.8-4.6 4.4 1.2 6.2-5.6-3-5.6 3 1.2-6.2L3 9.6l6.3-.8z",
  gear: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm7.4-3a7.4 7.4 0 0 0-.1-1.2l2-1.6-2-3.4-2.4 1a7.5 7.5 0 0 0-2-1.2L14.5 3h-5L9 5.6a7.5 7.5 0 0 0-2 1.2l-2.4-1-2 3.4 2 1.6a7.4 7.4 0 0 0 0 2.4l-2 1.6 2 3.4 2.4-1a7.5 7.5 0 0 0 2 1.2l2.4 1 2-3.4-2-1.6c.07-.4.1-.8.1-1.2z",
  users: "M16 19v-1a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v1m18 0v-1a4 4 0 0 0-3-3.87M14 3.13a4 4 0 0 1 0 7.75M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0z"
};

function I({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

const ALL: (PillLink & { d: string })[] = [
  { href: "/dashboard", label: "בית", d: P.home, icon: <I d={P.home} /> },
  { href: "/learn", label: "לומדים", d: P.learn, icon: <I d={P.learn} /> },
  { href: "/markets", label: "שווקים", d: P.chart, icon: <I d={P.chart} /> },
  { href: "/portfolio", label: "התיק שלי", d: P.briefcase, icon: <I d={P.briefcase} /> },
  { href: "/challenges", label: "משימות", d: P.target, icon: <I d={P.target} /> },
  { href: "/mentor", label: "מנטור", d: P.mentor, icon: <I d={P.mentor} /> },
  { href: "/progress", label: "התקדמות", d: P.star, icon: <I d={P.star} /> },
  { href: "/parent", label: "הורים", d: P.users, icon: <I d={P.users} /> },
  { href: "/settings", label: "הגדרות", d: P.gear, icon: <I d={P.gear} /> }
];

const MOBILE_MAIN = ALL.slice(0, 5);
const MOBILE_MORE = ALL.slice(5).map(({ href, label }) => ({ href, label }));

export function SidebarNav() {
  return <PillNav links={ALL} variant="sidebar" group="sidebar" />;
}

export function BottomNav() {
  return (
    <>
      <PillNav links={MOBILE_MAIN} variant="bottom" group="bottom" />
      <div className="flex flex-col items-center text-[11px] text-slate-400 px-2 py-1">
        <HamburgerMenu links={[...MOBILE_MORE]} label="עוד" />
        <span>עוד</span>
      </div>
    </>
  );
}
