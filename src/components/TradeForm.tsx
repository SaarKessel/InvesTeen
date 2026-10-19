"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { Loader } from "@/components/easyui/Loader";
import { useFormState, useFormStatus } from "react-dom";
import { tradeAction, undoTradeAction, type TradeState } from "@/app/actions/trade";
import { useToast } from "@/components/easyui/Toasts";
import { useRouter } from "next/navigation";

function SubmitBtn({ side }: { side: "buy" | "sell" }) {
  const { pending } = useFormStatus();
  return (
    <button className={`${side === "buy" ? "btn-primary" : "btn-secondary"} w-full flex items-center justify-center gap-2`} disabled={pending}>
      {pending && <Loader size={16} color="#fff" label="" />}
      {pending ? "מבצע..." : side === "buy" ? "קנייה וירטואלית" : "מכירה וירטואלית"}
    </button>
  );
}

function QtyStepper({ id }: { id: string }) {
  const [qty, setQty] = useState(1);
  const btn = "w-11 h-11 rounded-xl bg-navy-800 border border-navy-600 text-lg font-bold text-slate-200 hover:border-accent-500 transition-colors disabled:opacity-40";
  return (
    <div className="flex items-center gap-3" dir="ltr">
      <button type="button" className={btn} onClick={() => setQty((q) => Math.max(1, q - 1))} disabled={qty <= 1} aria-label="פחות">-</button>
      <input className="input text-center font-bold text-lg" id={id} name="qty" type="number" min={1} step={1} required inputMode="numeric"
        value={qty} onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))} />
      <button type="button" className={btn} onClick={() => setQty((q) => q + 1)} aria-label="עוד">+</button>
    </div>
  );
}

export default function TradeForm({ symbol, side }: { symbol: string; side: "buy" | "sell" }) {
  const [state, action] = useFormState<TradeState, FormData>(tradeAction, {});
  const clientOrderId = useMemo(() => crypto.randomUUID(), []);
  const toast = useToast();
  const router = useRouter();
  const lastToasted = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (state.ok && state.orderId && lastToasted.current !== state.orderId) {
      lastToasted.current = state.orderId;
      const orderId = state.orderId;
      toast.push({
        title: side === "buy" ? "הקנייה הווירטואלית בוצעה" : "המכירה הווירטואלית בוצעה",
        body: "ניתן לבטל בתוך כמה שניות - הביטול מבצע פעולה הפוכה במחיר הסימולציה הנוכחי.",
        undoLabel: "ביטול הפעולה",
        onUndo: () => { undoTradeAction(orderId).then(() => router.refresh()); }
      });
    }
  }, [state, side, toast, router]);

  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="symbol" value={symbol} />
      <input type="hidden" name="side" value={side} />
      <input type="hidden" name="clientOrderId" value={clientOrderId} />
      <div>
        <label className="label" htmlFor={`qty-${side}`}>כמות יחידות</label>
        <QtyStepper id={`qty-${side}`} />
      </div>
      {state.error ? <p className="text-danger-500 text-sm">{state.error}</p> : null}
      <SubmitBtn side={side} />
    </form>
  );
}
