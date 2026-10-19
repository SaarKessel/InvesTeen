"use client";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

export default function PriceChart({ data }: { data: { day: number; price: number }[] }) {
  const first = data[0]?.price ?? 0;
  return (
    <div dir="ltr" className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
          <XAxis dataKey="day" tick={{ fill: "#94a3b8", fontSize: 11 }} tickFormatter={(d) => `יום ${d}`} />
          <YAxis domain={["auto", "auto"]} tick={{ fill: "#94a3b8", fontSize: 11 }} width={70} />
          <Tooltip
            contentStyle={{ background: "#162a52", border: "1px solid #274b8c", borderRadius: 12, color: "#e2e8f0" }}
            formatter={(v: number) => [`${v.toLocaleString("he-IL", { minimumFractionDigits: 2 })} VT`, "מחיר סימולציה"]}
            labelFormatter={(d) => `יום סימולציה ${d}`}
          />
          <ReferenceLine y={first} stroke="#557ec6" strokeDasharray="4 4" />
          <Line type="monotone" dataKey="price" stroke="#10b981" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
