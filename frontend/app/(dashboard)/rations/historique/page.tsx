"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Icon from "@/components/ui/Icon";
import TableSkeleton from "@/components/ui/TableSkeleton";
import { useApi } from "@/lib/useApi";
import type { Distribution } from "@/lib/types";

export default function HistoriqueDistributionsPage() {
  const { data: distributions, loading, error } = useApi<Distribution[]>("/rations/distributions");
  const [search, setSearch] = useState("");
  const [periode, setPeriode] = useState("tout");

  const list = distributions ?? [];

  const now = new Date();

  const filtered = useMemo(() => {
    return list.filter((d) => {
      const nom = typeof d.ration === "string" ? "" : (d.ration?.nom ?? "");
      const matchSearch = nom.toLowerCase().includes(search.toLowerCase()) || (d.cible ?? "").toLowerCase().includes(search.toLowerCase());
      if (!matchSearch) return false;
      if (periode === "mois") {
        const dd = new Date(d.date);
        return dd.getMonth() === now.getMonth() && dd.getFullYear() === now.getFullYear();
      }
      if (periode === "semaine") {
        const dd = new Date(d.date);
        const diff = (now.getTime() - dd.getTime()) / (1000 * 60 * 60 * 24);
        return diff <= 7;
      }
      return true;
    });
  }, [list, search, periode]);

  // KPIs
  const thisMonthList = list.filter((d) => {
    const dd = new Date(d.date);
    return dd.getMonth() === now.getMonth() && dd.getFullYear() === now.getFullYear();
  });
  const coutMois = thisMonthList.reduce((s, d) => s + (d.coutEstime ?? 0), 0);

  const rationFreq = useMemo(() => {
    const freq: Record<string, { nom: string; count: number }> = {};
    list.forEach((d) => {
      const id = typeof d.ration === "string" ? d.ration : (d.ration as { id?: string })?.id ?? "?";
      const nom = typeof d.ration === "string" ? d.ration : ((d.ration as { nom?: string })?.nom ?? "—");
      if (!freq[id]) freq[id] = { nom, count: 0 };
      freq[id].count++;
    });
    return Object.values(freq).sort((a, b) => b.count - a.count)[0] ?? null;
  }, [list]);

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-surface">
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-border-light bg-card px-7">
        <div className="flex items-center gap-1.5">
          <Link href="/rations" className="font-inter text-sm text-subtle hover:text-label transition-colors">Rations</Link>
          <Icon name="chevron-right" size={14} className="text-placeholder" />
          <span className="font-dm-sans text-[15px] font-semibold text-label">Historique des distributions</span>
        </div>
        <Link
          href="/rations/distribution"
          className="flex items-center gap-1.5 rounded-[6px] bg-primary px-3.5 py-2 font-dm-sans text-[13px] font-semibold text-white hover:bg-primary/90 transition-colors"
        >
          <Icon name="plus" size={14} />
          Nouvelle distribution
        </Link>
      </header>

      <div className="flex flex-1 flex-col gap-5 overflow-auto p-6">
        {/* KPI row */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total distributions", value: String(list.length), icon: "utensils", bg: "bg-primary/5", color: "text-primary" },
            { label: "Coût ce mois", value: `${coutMois.toLocaleString("fr-FR")} MAD`, icon: "coins", bg: "bg-warning/5", color: "text-warning" },
            { label: "Ration la + utilisée", value: rationFreq ? rationFreq.nom : "—", icon: "star", bg: "bg-success/5", color: "text-success", sub: rationFreq ? `${rationFreq.count}×` : "" },
          ].map((k) => (
            <div key={k.label} className="flex items-center gap-4 rounded-[12px] border border-border-light bg-card p-4">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px] ${k.bg}`}>
                <Icon name={k.icon} size={18} className={k.color} />
              </div>
              <div className="min-w-0">
                <div className="flex items-baseline gap-2">
                  <p className="font-dm-sans text-[18px] font-bold leading-none text-label truncate">{k.value}</p>
                  {"sub" in k && k.sub && <span className="font-inter text-[11px] text-subtle">{k.sub}</span>}
                </div>
                <p className="mt-0.5 font-inter text-[12px] text-subtle">{k.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-[6px] border border-border-light bg-card px-3 py-1.5">
            <Icon name="search" size={13} className="text-placeholder" />
            <input
              type="text" placeholder="Ration ou parcelle…" value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-40 bg-transparent font-inter text-[13px] text-label placeholder:text-placeholder focus:outline-none"
            />
          </div>
          <div className="flex gap-1 rounded-[6px] border border-border-light bg-card p-1">
            {[
              { value: "tout", label: "Tout" },
              { value: "mois", label: "Ce mois" },
              { value: "semaine", label: "7 jours" },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => setPeriode(opt.value)}
                className={`rounded-[4px] px-3 py-1 font-inter text-[12px] font-semibold transition-colors ${
                  periode === opt.value ? "bg-primary text-white" : "text-subtle hover:text-label"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <span className="ml-auto font-inter text-[12px] text-placeholder">
            {filtered.length} enregistrement{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Table */}
        {loading && <TableSkeleton cols={[2, 2, 1, 1, 1, 1]} />}
        {error && <p className="font-inter text-sm text-danger">{error}</p>}
        {!loading && !error && (
          <div className="rounded-[12px] border border-border-light bg-card">
            <div className="grid grid-cols-[140px_1fr_140px_100px_110px_130px] border-b border-border-light bg-surface px-5 py-2.5">
              {["Date", "Ration", "Cible", "Animaux", "Quantité", "Coût total"].map((h) => (
                <span key={h} className="font-inter text-[10px] font-semibold uppercase tracking-wide text-placeholder">{h}</span>
              ))}
            </div>

            {filtered.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-14">
                <Icon name="history" size={28} className="text-placeholder" />
                <p className="font-inter text-[13px] text-placeholder">Aucune distribution trouvée</p>
              </div>
            ) : (
              <div className="divide-y divide-border-light">
                {filtered.map((d) => {
                  const nom = typeof d.ration === "string" ? "—" : ((d.ration as { nom?: string })?.nom ?? "—");
                  return (
                    <div
                      key={d.id}
                      className="grid grid-cols-[140px_1fr_140px_100px_110px_130px] items-center gap-2 px-5 py-3"
                    >
                      <div className="flex flex-col gap-0.5">
                        <span className="font-inter text-[13px] text-label">
                          {new Date(d.date).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })}
                        </span>
                        <span className="font-inter text-[10px] text-placeholder">
                          {new Date(d.date).getFullYear()}
                        </span>
                      </div>
                      <span className="font-inter text-[13px] font-semibold text-label truncate">{nom}</span>
                      <span className="font-inter text-[12px] text-subtle truncate">{d.cible || "—"}</span>
                      <div className="flex items-center gap-1.5">
                        <Icon name="beef" size={12} className="text-placeholder" />
                        <span className="font-inter text-[13px] text-label">{d.nbAnimaux}</span>
                      </div>
                      <span className="font-inter text-[13px] text-subtle">{d.quantite} kg</span>
                      <span className="font-dm-sans text-[13px] font-semibold text-label">
                        {(d.coutEstime ?? 0).toLocaleString("fr-FR")} MAD
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {filtered.length > 0 && (
              <div className="flex items-center justify-between border-t border-border-light px-5 py-3">
                <span className="font-inter text-[12px] text-placeholder">{filtered.length} distribution{filtered.length !== 1 ? "s" : ""}</span>
                <div className="flex items-center gap-4">
                  <span className="font-inter text-[12px] text-subtle">
                    Total animaux: <span className="font-semibold text-label">{filtered.reduce((s, d) => s + d.nbAnimaux, 0)}</span>
                  </span>
                  <span className="font-inter text-[12px] text-subtle">
                    Coût total: <span className="font-semibold text-primary">{filtered.reduce((s, d) => s + (d.coutEstime ?? 0), 0).toLocaleString("fr-FR")} MAD</span>
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
