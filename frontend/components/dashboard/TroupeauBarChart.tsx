"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";

const PHASE_COLORS: Record<string, string> = {
  Veau:          "#93C5FD",
  Croissance:    "#2D7A3A",
  Engraissement: "#F59E0B",
  Finition:      "#16A34A",
};

interface Props {
  repartition: Record<string, number>;
}

export default function TroupeauBarChart({ repartition }: Props) {
  const data = Object.entries(repartition).map(([phase, value]) => ({ phase, value }));

  if (data.length === 0) {
    return <div className="flex h-[160px] items-center justify-center font-inter text-[13px] text-placeholder">Aucune donnée</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={160}>
      <BarChart data={data} barCategoryGap="30%" margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#F0EDE8" vertical={false} />
        <XAxis
          dataKey="phase"
          tick={{ fontFamily: "Inter, sans-serif", fontSize: 11, fill: "#9CA3AF" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          allowDecimals={false}
          tick={{ fontFamily: "Inter, sans-serif", fontSize: 11, fill: "#9CA3AF" }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          cursor={{ fill: "#F0EDE8" }}
          contentStyle={{ border: "1px solid #F0EDE8", borderRadius: 8, fontFamily: "Inter, sans-serif", fontSize: 12 }}
          formatter={(value) => [`${value} animaux`, ""]}
          labelStyle={{ fontWeight: 600, color: "#1A1A1A" }}
        />
        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
          {data.map((entry) => (
            <Cell key={entry.phase} fill={PHASE_COLORS[entry.phase] ?? "#2D7A3A"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
