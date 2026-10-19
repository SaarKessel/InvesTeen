"use client";
import { useState, useTransition, useRef } from "react";
import { mentorAction } from "@/app/actions/mentor";

interface Msg { role: "user" | "mentor"; content: string; }

export default function MentorChat({ initial }: { initial: Msg[] }) {
  const [messages, setMessages] = useState<Msg[]>(initial);
  const [convId, setConvId] = useState<string | undefined>(undefined);
  const [pending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

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
      <div className="flex-1 overflow-y-auto space-y-3 pb-3">
        {messages.length === 0 && (
          <div className="card p-4 text-sm muted">
            שאלו אותי על מושגים (ריבית דריבית, אינפלציה, פיזור...) או כתבו \"נתח את התיק שלי\".
            אני מורה חינוכי - לא ממליץ על קנייה או מכירה.
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-line ${m.role === "user" ? "bg-accent-600/25 mr-auto" : "bg-navy-800 ml-auto"}`}>
            {m.content}
          </div>
        ))}
        {pending && <div className="bg-navy-800 rounded-2xl px-4 py-2.5 text-sm ml-auto muted">המנטור חושב...</div>}
      </div>
      <form onSubmit={send} className="flex gap-2 pt-2 border-t border-navy-800">
        <input ref={inputRef} className="input" placeholder="שאלה על כסף, השקעות או התיק שלך..." maxLength={500} />
        <button className="btn-primary shrink-0" disabled={pending}>שליחה</button>
      </form>
    </div>
  );
}
