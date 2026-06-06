"use client";

import Link from "next/link";
import Icon from "@/components/ui/Icon";
import DataTable, { Column } from "@/components/ui/DataTable";
import SanteTabs from "@/components/dashboard/SanteTabs";
import { useApi } from "@/lib/useApi";
import { planStatutStyle } from "@/lib/statusStyles";
import type { PlanTraitement } from "@/lib/types";

function animalCode(p: PlanTraitement): string {
  return typeof p.animal === "object" ? (p.animal.identifiant ?? "—") : String(p.animal);
}

const COLUMNS: Column<PlanTraitement>[] = [
  { key: "animal", label: "Animal", width: "w-[120px]", render: (r) => <span className="font-inter text-[13px] font-semibold text-primary">{animalCode(r)}</span> },
  { key: "type", label: "Type", width: "w-[140px]" },
  { key: "produit", label: "Produit", width: "w-[150px]" },
  { key: "datePrevue", label: "Date prévue", width: "w-[120px]", render: (r) => <span className="font-inter text-[13px] text-subtle">{new Date(r.datePrevue).toLocaleDateString("fr-FR")}</span> },
  { key: "frequence", label: "Fréquence", width: "w-[120px]" },
  { key: "statut", label: "Statut", width: "w-[120px]", render: (r) => <span className={`inline-flex rounded-full px-2.5 py-1 font-inter text-[11px] font-semibold ${planStatutStyle[r.statut] ?? "bg-surface text-subtle"}`}>{r.statut}</span> },
];

export default function PlanificationPage() {
  const { data: plans, loading, error } = useApi<PlanTraitement[]>("/sante/plans");
  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-surface">
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-border-light bg-card px-7">
        <div className="flex items-center gap-1.5">
          <span className="font-dm-sans text-xl font-semibold text-label">Santé</span>
          <span className="font-inter text-sm text-placeholder">/ Planification</span>
        </div>
        <Link href="/sante/traitement/nouveau" className="flex items-center gap-1.5 rounded-[6px] bg-primary px-3.5 py-2 font-dm-sans text-[13px] font-semibold text-white hover:bg-primary-hover transition-colors">
          <Icon name="plus" size={14} />
          Planifier
        </Link>
      </header>

      <SanteTabs />

      <div className="flex flex-1 flex-col gap-4 overflow-auto p-6">
        <div className="flex items-center justify-between rounded-[8px] border border-info/20 bg-info/5 px-4 py-3">
          <div className="flex items-center gap-2.5">
            <Icon name="bell" size={16} className="text-info" />
            <span className="font-inter text-[13px] text-subtle">Rappels automatiques envoyés à <strong className="text-label">J-3</strong> et <strong className="text-label">J-1</strong> avant chaque traitement planifié.</span>
          </div>
        </div>
        {loading && <p className="font-inter text-sm text-placeholder">Chargement…</p>}
        {error && <p className="font-inter text-sm text-danger">{error}</p>}
        {!loading && !error && (
          <DataTable columns={COLUMNS} data={plans ?? []} keyExtractor={(p) => p.id} pagination={{ page: 1, total: 1, count: (plans ?? []).length }} />
        )}
      </div>
    </div>
  );
}
