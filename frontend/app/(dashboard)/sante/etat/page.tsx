"use client";

// UC-13 — État de santé (vue globale du troupeau)

import Link from "next/link";
import Icon from "@/components/ui/Icon";
import DataTable, { Column } from "@/components/ui/DataTable";
import SanteTabs from "@/components/dashboard/SanteTabs";
import { useApi } from "@/lib/useApi";
import type { EtatSanteRow } from "@/lib/types";

const ETAT_STYLE: Record<string, string> = {
  Sain: "bg-success/10 text-success",
  "En observation": "bg-info/10 text-info",
  "En traitement": "bg-warning/10 text-warning",
  Malade: "bg-danger/10 text-danger",
};

const COLUMNS: Column<EtatSanteRow>[] = [
  {
    key: "identifiant", label: "Animal", width: "w-[140px]",
    render: (r) => (
      <div className="flex flex-col">
        <Link href={`/animaux/${r.id}`} className="font-inter text-[13px] font-semibold text-primary hover:underline">{r.identifiant}</Link>
        <span className="font-inter text-[11px] text-placeholder">{r.race}</span>
      </div>
    ),
  },
  { key: "etat", label: "État de santé", width: "w-[150px]", render: (r) => <span className={`inline-flex rounded-full px-2.5 py-1 font-inter text-[11px] font-semibold ${ETAT_STYLE[r.etat] ?? "bg-surface text-subtle"}`}>{r.etat}</span> },
  { key: "temperature", label: "Température", width: "w-[110px]" },
  { key: "derniereObs", label: "Dernière obs.", width: "w-[120px]", render: (r) => <span className="font-inter text-[13px] text-subtle">{r.derniereObs ? new Date(r.derniereObs).toLocaleDateString("fr-FR") : "—"}</span> },
  { key: "delaiRetrait", label: "Délai retrait", width: "w-[120px]", render: (r) => r.delaiRetrait === "—" ? <span className="font-inter text-[13px] text-placeholder">—</span> : <span className="font-inter text-[13px] font-semibold text-danger">{r.delaiRetrait}</span> },
  {
    key: "_actions", label: "Actions", width: "w-[90px]", align: "right",
    render: () => <Link href="/sante/etat/nouveau" className="flex justify-end items-center gap-1 font-inter text-[12px] font-medium text-primary hover:underline"><Icon name="pencil" size={13} /> MàJ</Link>,
  },
];

export default function EtatSantePage() {
  const { data, loading, error } = useApi<EtatSanteRow[]>("/sante/etats");
  const list = data ?? [];
  const count = (etat: string) => list.filter((a) => a.etat === etat).length;

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-surface">
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-border-light bg-card px-7">
        <div className="flex items-center gap-1.5">
          <span className="font-dm-sans text-xl font-semibold text-label">Santé</span>
          <span className="font-inter text-sm text-placeholder">/ État de santé</span>
        </div>
        <Link href="/sante/etat/nouveau" className="flex items-center gap-1.5 rounded-[6px] bg-primary px-3.5 py-2 font-dm-sans text-[13px] font-semibold text-white hover:bg-primary-hover transition-colors">
          <Icon name="plus" size={14} />
          Enregistrer un état
        </Link>
      </header>

      <SanteTabs />

      <div className="flex flex-1 flex-col gap-4 overflow-auto p-6">
        <div className="flex gap-4">
          {[
            { label: "Sains", count: count("Sain"), color: "text-success" },
            { label: "En observation", count: count("En observation"), color: "text-info" },
            { label: "En traitement", count: count("En traitement"), color: "text-warning" },
            { label: "Malades", count: count("Malade"), color: "text-danger" },
          ].map(({ label, count, color }) => (
            <div key={label} className="flex flex-1 flex-col gap-1 rounded-[8px] border border-border-light bg-card p-4">
              <span className="font-inter text-[11px] text-placeholder">{label}</span>
              <span className={`font-dm-sans text-2xl font-bold ${color}`}>{count}</span>
            </div>
          ))}
        </div>
        {loading && <p className="font-inter text-sm text-placeholder">Chargement…</p>}
        {error && <p className="font-inter text-sm text-danger">{error}</p>}
        {!loading && !error && (
          <DataTable columns={COLUMNS} data={list} keyExtractor={(a) => a.id} pagination={{ page: 1, total: 1, count: list.length }} />
        )}
      </div>
    </div>
  );
}
