"use client";
import { useState, useTransition } from "react";
import { completeMissionAction } from "@/app/actions/learn";
import { AnimatedNumber } from "@/components/easyui/AnimatedNumber";

/**
 * Interactive mission runner. Educational, deterministic math with documented assumptions.
 * This is a learning exercise - NOT the portfolio engine and NOT a prediction.
 */
export default function MissionRunner({ missionId, kind, done }: { missionId: string; kind: string; done: boolean }) {
  const [result, setResult] = useState<string | null>(null);
  const [completed, setCompleted] = useState(done);
  const [pending, startTransition] = useTransition();

  const finish = (summary: string) => {
    startTransition(async () => {
      const fd = new FormData();
      fd.set("missionId", missionId);
      fd.set("resultJson", JSON.stringify({ summary }));
      await completeMissionAction({}, fd);
      setCompleted(true);
    });
  };

  if (completed) {
    return <p className="text-accent-500 font-semibold mt-4">המשימה הושלמה! {result}</p>;
  }

  if (kind === "inflation") return <InflationMission onResult={setResult} onFinish={finish} pending={pending} />;
  if (kind === "fees") return <FeesMission onResult={setResult} onFinish={finish} pending={pending} />;
  return <DiversificationMission onResult={setResult} onFinish={finish} pending={pending} />;
}

function Field({ label, value, onChange, min, max, step = 1 }: { label: string; value: number; onChange: (v: number) => void; min: number; max: number; step?: number }) {
  return (
    <div>
      <label className="label">{label}: <b dir="ltr">{value}</b></label>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full accent-emerald-500" />
    </div>
  );
}

function InflationMission({ onResult, onFinish, pending }: { onResult: (s: string) => void; onFinish: (s: string) => void; pending: boolean }) {
  const [amount, setAmount] = useState(1000);
  const [years, setYears] = useState(10);
  const [infl, setInfl] = useState(3);
  const power = amount / Math.pow(1 + infl / 100, years);
  return (
    <div className="space-y-4 mt-4">
      <p className="text-sm muted">הנחות מוצהרות: אינפלציה שנתית קבועה של {infl}%. זה תרגיל חישובי, לא תחזית.</p>
      <Field label={'סכום התחלתי (ש"ח)'} value={amount} onChange={setAmount} min={100} max={10000} step={100} />
      <Field label="שנים" value={years} onChange={setYears} min={1} max={30} />
      <Field label="אינפלציה שנתית (%)" value={infl} onChange={setInfl} min={0} max={10} />
      <div className="card p-4">
        כוח הקנייה של {amount.toLocaleString("he-IL")} ש"ח בעוד {years} שנים:{" "}
        <b dir="ltr"><AnimatedNumber value={Math.round(power)} /> ש"ח</b> במחירי היום.
      </div>
      <button className="btn-primary" disabled={pending}
        onClick={() => { const s = `חושב כוח קנייה: ${amount} ש"ח, ${years} שנים, ${infl}% אינפלציה = ${power.toFixed(0)} ש"ח במחירי היום.`; onResult(s); onFinish(s); }}>
        הבנתי - סיום משימה
      </button>
    </div>
  );
}

function FeesMission({ onResult, onFinish, pending }: { onResult: (s: string) => void; onFinish: (s: string) => void; pending: boolean }) {
  const [years, setYears] = useState(20);
  const [fee, setFee] = useState(2);
  const start = 10000, ret = 7;
  const noFee = start * Math.pow(1 + ret / 100, years);
  const withFee = start * Math.pow(1 + (ret - fee) / 100, years);
  const diff = noFee - withFee;
  return (
    <div className="space-y-4 mt-4">
      <p className="text-sm muted">הנחות מוצהרות: הפקדה חד-פעמית של 10,000 ש"ח, תשואה שנתית תאורטית של {ret}% לפני עמלות. תרגיל חישובי בלבד.</p>
      <Field label="שנים" value={years} onChange={setYears} min={1} max={40} />
      <Field label="עמלה שנתית (%)" value={fee} onChange={setFee} min={0} max={3} step={0.5} />
      <div className="grid grid-cols-2 gap-3 text-center">
        <div className="card p-4"><div className="text-sm muted">בלי עמלה</div><div className="font-bold text-lg" dir="ltr"><AnimatedNumber value={Math.round(noFee)} /></div></div>
        <div className="card p-4"><div className="text-sm muted">עם עמלה של {fee}%</div><div className="font-bold text-lg" dir="ltr"><AnimatedNumber value={Math.round(withFee)} /></div></div>
      </div>
      <div className="card p-4">ההבדל שהעמלה "אכלה": <b className="text-warn-500" dir="ltr">{diff.toLocaleString("he-IL", { maximumFractionDigits: 0 })} ש"ח</b></div>
      <button className="btn-primary" disabled={pending}
        onClick={() => { const s = `הושוו עמלות: ${fee}% לאורך ${years} שנים עולים ${diff.toFixed(0)} ש"ח.`; onResult(s); onFinish(s); }}>
        הבנתי - סיום משימה
      </button>
    </div>
  );
}

function DiversificationMission({ onResult, onFinish, pending }: { onResult: (s: string) => void; onFinish: (s: string) => void; pending: boolean }) {
  const [concentrated, setConcentrated] = useState(100); // % in tech in the concentrated portfolio
  const [ran, setRan] = useState(false);
  // Documented scenario: tech sector falls 30%, other sectors fall 5%. Diversified = 25% tech / 75% spread.
  const techShock = -30, otherShock = -5;
  const conc = (concentrated / 100) * techShock + (1 - concentrated / 100) * otherShock;
  const div = 0.25 * techShock + 0.75 * otherShock;
  return (
    <div className="space-y-4 mt-4">
      <p className="text-sm muted">תרחיש מוגדר מראש עם הנחות ידועות: ענף הטכנולוגיה יורד 30%, שאר הענפים יורדים 5%. זה תרחיש לימודי, לא תחזית.</p>
      <Field label="כמה אחוז מהתיק המרוכז בטכנולוגיה?" value={concentrated} onChange={setConcentrated} min={10} max={100} />
      <button className="btn-secondary" onClick={() => setRan(true)}>הרצת התרחיש</button>
      {ran && (
        <div className="grid grid-cols-2 gap-3 text-center">
          <div className="card p-4"><div className="text-sm muted">תיק מרוכז ({concentrated}% טכנו)</div><div className="font-bold text-danger-500" dir="ltr">{conc.toFixed(1)}%</div></div>
          <div className="card p-4"><div className="text-sm muted">תיק מפוזר (25% טכנו)</div><div className="font-bold text-danger-500" dir="ltr">{div.toFixed(1)}%</div></div>
        </div>
      )}
      {ran && (
        <button className="btn-primary" disabled={pending}
          onClick={() => { const s = `תרחיש ירידה: תיק מרוכז (${concentrated}% טכנו) ירד ${conc.toFixed(1)}% מול תיק מפוזר שירד ${div.toFixed(1)}%.`; onResult(s); onFinish(s); }}>
          הבנתי את ההבדל - סיום משימה
        </button>
      )}
    </div>
  );
}
