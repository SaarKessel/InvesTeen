"use client";
import { useEffect, useMemo, useRef } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { tradeAction, undoTradeAction, type TradeState } from "@/app/actions/trade";
import { useToast } from "@/components/easyui/Toasts";
import { useRouter } from "next/navigation";

function SubmitBtn({ side }: { side: "buy" | "sell" }) {
  const { pending } = useFormStatus();
  return (
    <button className={side === "buy" ? "btn-primary" : "btn-secondary"} disabled={pending}>
      {pending ? "מבצע..." : side === "buy" ? "קנייה וירטואלית" : "מכירה וירטואלית"}
    </button>
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
        <input className="input" id={`qty-${side}`} name="qty" type="number" min={1} step={1} required inputMode="numeric" />
      </div>
      {state.error ? <p className="text-danger-500 text-sm">{state.error}</p> : null}
      <SubmitBtn side={side} />
    </form>
  );
}
