"use client";

import { use } from "react";
import Link from "next/link";
import Icon from "@/components/ui/Icon";
import { useApi } from "@/lib/useApi";
import type { FinancesAnimal } from "@/lib/types";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

const COST_COLORS = ["#F59E0B", "#3B82F6", "#D97706"];

export default function FinancesAnimalPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data, loading, error } = useApi<FinancesAnimal>(`/finances/animal/${id}`);

  if (loading) return <div className="flex flex-1 items-center justify-center font-inter text-sm text-placeholder">Chargement…</div>;
  if (error || !data) return <div className="flex flex-1 items-center justify-center font-inter text-sm text-danger">{error ?? "Animal introuvable"}</div>;

  const coutData = [
    { name: "Alimentation", value: data.coutAlimentation },
    { name: "Santé", value: data.coutSante },
    { name: "Achat", value: data.coutAchat },
  ].filter((d) => d.value > 0);

  const marginColor = data.marge > 20 ? "text-success" : data.marge > 0 ? "text-warning" : "text-danger";
  const marginBg = data.marge > 20 ? "bg-success/10" : data.marge > 0 ? "bg-warning/10" : "bg-danger/10";

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-surface">
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-border-light bg-card px-7">
        <div className="flex items-center gap-1.5">
          <Link href="/finances" className="font-inter text-sm text-subtle hover:text-label transition-colors">Finances</Link>
          <Icon name="chevron-right" size={14} className="text-placeholder" />
          <span className="font-dm-sans text-xl font-semibold text-label">{data.identifiant}</span>
          <span className="font-inter text-sm text-placeholder">/ Rentabilité</span>
        </div>
        <Link
          href={`/animaux/${id}`}
          className="flex items-center gap-1.5 rounded-[6px] border border-border-light bg-surface px-3.5 py-2 font-dm-sans text-[13px] font-semibold text-subtle hover:bg-border-light transition-colors"
        >
          <Icon name="arrow-left" size={14} />
          Fiche animal
        </Link>
      </header>

      <div className="flex flex-1 flex-col gap-5 overflow-auto p-6">
        {/* KPI row */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Coût total", value: `${data.coutTotal.toLocaleString("fr-FR")} MAD`, icon: "wallet", iconBg: "bg-danger/10", iconColor: "text-danger" },
            { label: "Revenu projeté", value: `${data.revenu.toLocaleString("fr-FR")} MAD`, icon: "trending-up", iconBg: "bg-success/10", iconColor: "text-success" },
            { label: "Bénéfice net", value: `${data.benefice >= 0 ? "+" : ""}${data.benefice.toLocaleString("fr-FR")} MAD`, icon: "coins", iconBg: data.benefice >= 0 ? "bg-success/10" : "bg-danger/10", iconColor: data.benefice >= 0 ? "text-success" : "text-danger" },
            { label: "Coût / jour", value: `${data.coutJour?.toLocaleString("fr-FR") ?? "—"} MAD/j`, icon: "calendar", iconBg: "bg-primary-light", iconColor: "text-primary" },
          ].map((k) => (
            <div key={k.label} className="flex flex-col gap-3 rounded-[12px] border border-border-light bg-card p-5">
              <div className="flex items-center justify-between">
                <span className="font-inter text-[13px] font-medium text-subtle">{k.label}</span>
                <div className={`flex h-9 w-9 items-center justify-center rounded-[6px] ${k.iconBg}`}>
                  <Icon name={k.icon} size={18} className={k.iconColor} />
                </div>
              </div>
              <span className="font-dm-sans text-[22px] font-bold leading-none text-label">{k.value}</span>
            </div>
          ))}
        </div>

        <div className="flex gap-4">
          {/* Donut chart des coûts */}
          <div className="flex flex-1 flex-col gap-4 rounded-[12px] border border-border-light bg-card p-5">
            <div className="flex items-center gap-2">
              <Icon name="pie-chart" size={16} className="text-primary" />
              <span className="font-dm-sans text-[15px] font-semibold text-label">Répartition des coûts</span>
            </div>
            <div className="flex items-center gap-6">
              <ResponsiveContainer width={180} height={180}>
                <PieChart>
                  <Pie data={coutData} cx="50%" cy="50%" innerRadius={50} outerRadius={72} paddingAngle={2} dataKey="value" strokeWidth={0}>
                    {coutData.map((_, i) => <Cell key={i} fill={COST_COLORS[i]} />)}
                  </Pie>
                  <Tooltip
                    contentStyle={{ border: "1px solid #F0EDE8", borderRadius: 8, fontFamily: "Inter, sans-serif", fontSize: 12 }}
                    formatter={(value) => [`${Number(value).toLocaleString("fr-FR")} MAD`, ""]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col gap-3">
                {coutData.map((d, i) => (
                  <div key={d.name} className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 shrink-0 rounded-[3px]" style={{ backgroundColor: COST_COLORS[i] }} />
                    <div className="flex flex-col">
                      <span className="font-inter text-[11px] text-subtle">{d.name}</span>
                      <span className="font-dm-sans text-[13px] font-semibold text-label">
                        {d.value.toLocaleString("fr-FR")} MAD
                        <span className="ml-1 font-inter text-[10px] font-normal text-placeholder">
                          ({Math.round((d.value / data.coutTotal) * 100)}%)
                        </span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Résumé financier */}
          <div className="flex flex-1 flex-col gap-4 rounded-[12px] border border-border-light bg-card p-5">
            <div className="flex items-center gap-2">
              <Icon name="receipt" size={16} className="text-primary" />
              <span className="font-dm-sans text-[15px] font-semibold text-label">Résumé financier</span>
            </div>
            <div className="flex flex-col gap-2.5">
              {[
                { label: "Race", value: data.race || "—" },
                { label: "Phase actuelle", value: data.phase },
                { label: "Poids entrée", value: `${data.poidsEntree} kg` },
                { label: "Poids actuel", value: `${data.poidsActuel} kg` },
                { label: "Gain de poids", value: `+${data.poidsActuel - data.poidsEntree} kg (${data.jours} jours)` },
                { label: "GMQ", value: `${data.gmqActuel} kg/jour` },
                { label: "Prix achat estimé", value: `${data.prixAchat} MAD/kg` },
                { label: "Prix vente cible", value: `${data.prixVente} MAD/kg` },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between border-b border-border-light pb-1.5">
                  <span className="font-inter text-[12px] text-subtle">{label}</span>
                  <span className="font-inter text-[13px] font-semibold text-label">{value}</span>
                </div>
              ))}
              <div className="flex items-center justify-between pt-1">
                <span className="font-dm-sans text-[13px] font-semibold text-label">Marge bénéficiaire</span>
                <span className={`rounded-full px-3 py-1 font-dm-sans text-[14px] font-bold ${marginColor} ${marginBg}`}>
                  {data.marge >= 0 ? "+" : ""}{data.marge}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
