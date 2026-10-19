/**
 * Adapted from EasyUI UndoToast (https://github.com/Surajmaurya1/easyui)
 * MIT License, Copyright (c) 2026 Suraj Maurya.
 * Adapted: navy theme, RTL, provider-based, optional undo action.
 */
"use client";
import React, { createContext, useCallback, useContext, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { motionTransitions } from "@/lib/motion-tokens";

interface Toast {
  id: number;
  title: string;
  body?: string;
  undoLabel?: string;
  onUndo?: () => void;
}

const ToastCtx = createContext<{ push: (t: Omit<Toast, "id">) => void }>({ push: () => {} });

export function useToast() { return useContext(ToastCtx); }

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const idRef = useRef(0);
  const reduced = useReducedMotion() ?? false;

  const dismiss = useCallback((id: number) => setToasts((ts) => ts.filter((t) => t.id !== id)), []);

  const push = useCallback((t: Omit<Toast, "id">) => {
    const id = ++idRef.current;
    setToasts((ts) => [...ts.slice(-2), { ...t, id }]);
    setTimeout(() => dismiss(id), t.onUndo ? 8000 : 4500);
  }, [dismiss]);

  return (
    <ToastCtx.Provider value={{ push }}>
      {children}
      <div className="fixed bottom-20 md:bottom-6 inset-x-0 z-50 flex flex-col items-center gap-2 pointer-events-none px-4">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div key={t.id}
              initial={reduced ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.97 }}
              animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.98 }}
              transition={reduced ? { duration: 0.12 } : motionTransitions.springGentle}
              className="pointer-events-auto card px-4 py-3 flex items-center gap-4 max-w-md w-full border-navy-600">
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-slate-100">{t.title}</div>
                {t.body && <div className="text-xs text-slate-400 mt-0.5">{t.body}</div>}
              </div>
              {t.onUndo && (
                <button className="text-sm font-semibold text-accent-500 hover:text-accent-600 shrink-0"
                  onClick={() => { t.onUndo!(); dismiss(t.id); }}>
                  {t.undoLabel ?? "ביטול"}
                </button>
              )}
              <button aria-label="סגירה" className="text-slate-500 hover:text-slate-300 shrink-0" onClick={() => dismiss(t.id)}>✕</button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastCtx.Provider>
  );
}
