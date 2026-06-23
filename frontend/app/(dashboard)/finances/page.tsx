"use client";

import { useState } from "react";
import Link from "next/link";
import Icon from "@/components/ui/Icon";
import DataTable, { Column } from "@/components/ui/DataTable";
import TableSkeleton from "@/components/ui/TableSkeleton";
import { useApi } from "@/lib/useApi";
import type { FinancesTroupeau, FinancesAnimal } from "@/lib/types";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Cell,
} from "recharts";

function MargeCell({ marge }: { marge: number }) {
  const color = marge > 20 ? "text-success" : marge > 0 ? "text-warning" : "text-danger";
  const bg = marge > 20 ? "bg-success/10" : marge > 0 ? "bg-warning/10" : "bg-danger/10";
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 font-inter text-[12px] font-semibold ${color} ${bg}`}>
      {marge > 0 ? "+" : ""}{marge}%
    </span>
  );
}

const COLUMNS: Column<FinancesAnimal>[] = [
  {
    key: "identifiant", label: "Animal", width: "w-[130px]",
    render: (r) => (
      <Link href={`/finances/animal/${r.id}`} className="font-inter text-[13px] font-semibold text-primary hover:underline">
        {r.identifiant}
      </Link>
    ),
  },
  { key: "race", label: "Race", width: "w-[100px]", render: (r) => <span className="font-inter text-[13px] text-subtle">{r.race || "—"}</span> },
  { key: "phase", label: "Phase", width: "w-[110px]", render: (r) => <span className="font-inter text-[13px] text-subtle">{r.phase}</span> },
  { key: "poidsActuel", label: "Poids", width: "w-[80px]", render: (r) => <span className="font-inter text-[13px] text-label">{r.poidsActuel} kg</span> },
  {
    key: "coutTotal", label: "Coût total", width: "w-[110px]",
    render: (r) => <span className="font-inter text-[13px] font-semibold text-label">{r.coutTotal.toLocaleString("fr-FR")} MAD</span>,
  },
  {
    key: "revenu", label: "Revenu projeté", width: "w-[120px]",
    render: (r) => <span className="font-inter text-[13px] text-success font-semibold">{r.revenu.toLocaleString("fr-FR")} MAD</span>,
  },
  {
    key: "benefice", label: "Bénéfice", width: "w-[110px]",
    render: (r) => (
      <span className={`font-inter text-[13px] font-semibold ${r.benefice >= 0 ? "text-success" : "text-danger"}`}>
        {r.benefice >= 0 ? "+" : ""}{r.benefice.toLocaleString("fr-FR")} MAD
      </span>
    ),
  },
  { key: "marge", label: "Marge", width: "w-[90px]", render: (r) => <MargeCell marge={r.marge} /> },
  {
    key: "_actions", label: "", width: "w-[50px]", align: "right",
    render: (r) => (
      <Link href={`/finances/animal/${r.id}`} className="text-placeholder hover:text-primary transition-colors">
        <Icon name="arrow-right" size={15} />
      </Link>
    ),
  },
];

export default function FinancesPage() {
  const { data, loading, error } = useApi<FinancesTroupeau>("/finances/troupeau");
  const [search, setSearch] = useState("");

  const animaux = data?.animaux ?? [];
  const filtered = animaux.filter(
    (a) => a.identifiant.toLowerCase().includes(search.toLowerCase()) || a.race.toLowerCase().includes(search.toLowerCase())
  );

  const chartData = [...(data?.animaux ?? [])]
    .sort((a, b) => b.benefice - a.benefice)
    .slice(0, 10)
    .map((a) => ({ name: a.identifiant, benefice: a.benefice, marge: a.marge }));

  const kpis = data?.kpis;

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-surface">
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-border-light bg-card px-7">
        <div className="flex items-center gap-1.5">
          <span className="font-dm-sans text-xl font-semibold text-label">Finances</span>
          <span className="font-inter text-sm text-placeholder">/ Rentabilité du troupeau</span>
        </div>
        <Link
          href="/administration/parametres"
          className="flex items-center gap-1.5 rounded-[6px] border border-border-light bg-surface px-3.5 py-2 font-dm-sans text-[13px] font-semibold text-subtle hover:bg-border-light transition-colors"
        >
          <Icon name="settings" size={14} />
          Prix de vente: {data?.prixVente ?? 35} MAD/kg
        </Link>
      </header>

      <div className="flex flex-1 flex-col gap-5 overflow-auto p-6">
        {loading && <TableSkeleton cols={[2, 2, 2, 2]} />}
        {error && <p className="font-inter text-sm text-danger">{error}</p>}

        {kpis && (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-4 gap-4">
              {[
                { label: "Coût total troupeau", value: `${kpis.coutTotal.toLocaleString("fr-FR")} MAD`, icon: "wallet", iconBg: "bg-danger/10", iconColor: "text-danger" },
                { label: "Revenu projeté", value: `${kpis.revenuTotal.toLocaleString("fr-FR")} MAD`, icon: "trending-up", iconBg: "bg-success/10", iconColor: "text-success" },
                { label: "Bénéfice net projeté", value: `${kpis.beneficeTotal >= 0 ? "+" : ""}${kpis.beneficeTotal.toLocaleString("fr-FR")} MAD`, icon: "coins", iconBg: kpis.beneficeTotal >= 0 ? "bg-success/10" : "bg-danger/10", iconColor: kpis.beneficeTotal >= 0 ? "text-success" : "text-danger" },
                { label: "Marge globale", value: `${kpis.margeGlobale >= 0 ? "+" : ""}${kpis.margeGlobale}%`, icon: "percent", iconBg: "bg-primary-light", iconColor: "text-primary" },
              ].map((k) => (
                <div key={k.label} className="flex flex-col gap-3 rounded-[12px] border border-border-light bg-card p-5">
                  <div className="flex items-center justify-between">
                    <span className="font-inter text-[13px] font-medium text-subtle">{k.label}</span>
                    <div className={`flex h-9 w-9 items-center justify-center rounded-[6px] ${k.iconBg}`}>
                      <Icon name={k.icon} size={18} className={k.iconColor} />
                    </div>
                  </div>
                  <span className={`font-dm-sans text-[22px] font-bold leading-none ${k.value.includes("+") && !k.value.includes("MAD") ? "text-success" : "text-label"}`}>{k.value}</span>
                  <span className="font-inter text-[11px] text-subtle">{kpis.nbRentables} / {kpis.total} animaux rentables</span>
                </div>
              ))}
            </div>

            {/* Chart — top 10 by benefice */}
            <div className="rounded-[12px] border border-border-light bg-card p-5">
              <div className="mb-4 flex items-center gap-2">
                <Icon name="bar-chart-2" size={18} className="text-primary" />
                <span className="font-dm-sans text-[15px] font-semibold text-label">Top 10 animaux — Bénéfice projeté</span>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartData} barCategoryGap="30%" margin={{ top: 4, right: 4, left: 8, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F0EDE8" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontFamily: "Inter, sans-serif", fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontFamily: "Inter, sans-serif", fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v} MAD`} width={70} />
                  <ReferenceLine y={0} stroke="#E5E7EB" strokeWidth={1} />
                  <Tooltip
                    cursor={{ fill: "#F0EDE8" }}
                    contentStyle={{ border: "1px solid #F0EDE8", borderRadius: 8, fontFamily: "Inter, sans-serif", fontSize: 12 }}
                    formatter={(value) => [`${Number(value).toLocaleString("fr-FR")} MAD`, "Bénéfice"]}
                  />
                  <Bar dataKey="benefice" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry) => (
                      <Cell key={entry.name} fill={entry.benefice >= 0 ? "#2D7A3A" : "#EF4444"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        )}

        {/* Table */}
        <div className="rounded-[12px] border border-border-light bg-card">
          <div className="flex items-center justify-between border-b border-border-light px-5 py-3">
            <span className="font-dm-sans text-[14px] font-semibold text-label">Tous les animaux</span>
            <div className="flex items-center gap-1.5 rounded-[6px] border border-border-light bg-surface px-3 py-1.5">
              <Icon name="search" size={13} className="text-placeholder" />
              <input
                type="text"
                placeholder="Rechercher…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-36 bg-transparent font-inter text-[13px] text-label placeholder:text-placeholder focus:outline-none"
              />
            </div>
          </div>
          {loading && <TableSkeleton cols={[2, 1, 1, 1, 2, 2, 2, 1, 1]} />}
          {!loading && !error && (
            <DataTable
              columns={COLUMNS}
              data={filtered}
              keyExtractor={(a) => a.id}
              pagination={{ page: 1, total: 1, count: filtered.length }}
              empty={{ icon: "trending-up", title: "Aucun animal actif", hint: "Les données financières apparaîtront une fois que des animaux sont enregistrés." }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
