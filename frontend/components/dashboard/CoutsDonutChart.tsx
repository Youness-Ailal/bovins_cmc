"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

interface Props {
  alimentation: number;
  veterinaire: number;
  achat: number;
}

const SEGMENTS = [
  { key: "alimentation", label: "Alimentation", color: "#D97706" },
  { key: "veterinaire",  label: "Vétérinaire",  color: "#3B82F6" },
  { key: "achat",        label: "Achat animaux", color: "#F59E0B" },
] as const;

export default function CoutsDonutChart({ alimentation, veterinaire, achat }: Props) {
  const values = { alimentation, veterinaire, achat };
  const data = SEGMENTS.map((s) => ({ name: s.label, value: values[s.key], color: s.color })).filter((d) => d.value > 0);
  const total = data.reduce((s, d) => s + d.value, 0);

  if (total === 0) {
    return <div className="flex h-[140px] items-center justify-center font-inter text-[13px] text-placeholder">Aucune donnée</div>;
  }

  return (
    <div className="flex items-center gap-4">
      <ResponsiveContainer width={140} height={140}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={42}
            outerRadius={62}
            paddingAngle={2}
            dataKey="value"
            strokeWidth={0}
          >
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ border: "1px solid #F0EDE8", borderRadius: 8, fontFamily: "Inter, sans-serif", fontSize: 12 }}
            formatter={(value) => [`${Number(value).toLocaleString("fr-FR")} MAD`, ""]}
          />
        </PieChart>
      </ResponsiveContainer>

      <div className="flex flex-col gap-2">
        {data.map((d) => (
          <div key={d.name} className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 shrink-0 rounded-[3px]" style={{ backgroundColor: d.color }} />
            <div className="flex flex-col">
              <span className="font-inter text-[11px] text-subtle">{d.name}</span>
              <span className="font-dm-sans text-[12px] font-semibold text-label">
                {d.value.toLocaleString("fr-FR")} MAD
                <span className="ml-1 font-inter text-[10px] font-normal text-placeholder">
                  ({Math.round((d.value / total) * 100)}%)
                </span>
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
