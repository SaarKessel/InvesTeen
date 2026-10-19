"use client";
import { useState, useTransition, useRef, useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { mentorAction } from "@/app/actions/mentor";

function ThinkingDots() {
  return (
    <span className="inline-flex gap-1 items-center px-1" aria-label="המנטור חושב">
      {[0, 1, 2].map((i) => (
        <motion.span key={i} className="w-1.5 h-1.5 rounded-full bg-slate-400 inline-block"
          animate={{ opacity: [0.25, 1, 0.25] }}
          transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.18 }} />
      ))}
    </span>
  );
}

interface Msg { role: "user" | "mentor"; content: string; }

export default function MentorChat({ initial }: { initial: Msg[] }) {
  const [messages, setMessages] = useState<Msg[]>(initial);
  const [convId, setConvId] = useState<string | undefined>(undefined);
  const [pending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion() ?? false;
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: reduced ? "auto" : "smooth" });
  }, [messages, pending, reduced]);

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    const text = inputRef.current?.value.trim();
    if (!text || pending) return;
    setMessages((m) => [...m, { role: "user", content: text }]);
    if (inputRef.current) inputRef.current.value = "";
    startTransition(async () => {
      const fd = new FormData();
      if (convId) fd.set("conversationId", convId);
      fd.set("message", text);
      const r = await mentorAction({}, fd);
      if (r.conversationId) setConvId(r.conversationId);
      setMessages((m) => [...m, { role: "mentor", content: r.reply ?? r.error ?? "שגיאה זמנית. נסה שוב." }]);
    });
  };

  return (
    <div className="flex flex-col h-[70vh]">
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-3 pb-3">
        {messages.length === 0 && (
          <div className="card p-4 text-sm muted">
            שאלו אותי על מושגים (ריבית דריבית, אינפלציה, פיזור...) או כתבו \"נתח את התיק שלי\".
            אני מורה חינוכי - לא ממליץ על קנייה או מכירה.
          </div>
        )}
        {messages.map((m, i) => (
          <motion.div key={i}
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.98 }}
            animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
            className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-line ${m.role === "user" ? "bg-accent-600/25 mr-auto" : "bg-navy-800 ml-auto"}`}>
            {m.content}
          </motion.div>
        ))}
        {pending && (
          <div className="bg-navy-800 rounded-2xl px-4 py-3 text-sm ml-auto w-fit">
            <ThinkingDots />
          </div>
        )}
      </div>
      <form onSubmit={send} className="flex gap-2 pt-2 border-t border-navy-800">
        <input ref={inputRef} className="input" placeholder="שאלה על כסף, השקעות או התיק שלך..." maxLength={500} />
        <button className="btn-primary shrink-0" disabled={pending}>שליחה</button>
      </form>
    </div>
  );
}
