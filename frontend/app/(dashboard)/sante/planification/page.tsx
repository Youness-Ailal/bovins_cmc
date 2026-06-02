"use client";

import Link from "next/link";
import Icon from "@/components/ui/Icon";
import DataTable, { Column } from "@/components/ui/DataTable";
import SanteTabs from "@/components/dashboard/SanteTabs";

interface PlanTraitement {
  id: string;
  animal: string;
  type: string;
  produit: string;
  datePrevue: string;
  frequence: string;
  statut: "À faire" | "Rappel J-3" | "En retard";
}

const PLAN: PlanTraitement[] = [
  { id: "PLN-001", animal: "ANI-008", type: "Vaccin", produit: "FMD Vaccine", datePrevue: "10/06/2026", frequence: "Annuel", statut: "À faire" },
  { id: "PLN-002", animal: "ANI-015", type: "Antiparasitaire", produit: "Ivermectine", datePrevue: "05/06/2026", frequence: "Trimestriel", statut: "Rappel J-3" },
  { id: "PLN-003", animal: "ANI-003", type: "Antibiotique", produit: "Pénicilline", datePrevue: "01/06/2026", frequence: "Ponctuel", statut: "En retard" },
];

const STATUT_STYLE: Record<PlanTraitement["statut"], string> = {
  "À faire": "bg-[#E0ECFF] text-info",
  "Rappel J-3": "bg-[#EDE7DC] text-[#7A3F00]",
  "En retard": "bg-[#F0E0DC] text-[#8C1C00]",
};

const COLUMNS: Column<PlanTraitement>[] = [
  { key: "id", label: "Réf.", width: "w-[100px]", render: (r) => <span className="font-inter text-[13px] font-semibold text-label">{r.id}</span> },
  { key: "animal", label: "Animal", width: "w-[110px]", render: (r) => <Link href={`/animaux/${r.animal}`} className="font-inter text-[13px] font-semibold text-primary hover:underline">{r.animal}</Link> },
  { key: "type", label: "Type", width: "w-[140px]" },
  { key: "produit", label: "Produit", width: "w-[150px]" },
  { key: "datePrevue", label: "Date prévue", width: "w-[120px]" },
  { key: "frequence", label: "Fréquence", width: "w-[120px]" },
  { key: "statut", label: "Statut", width: "w-[120px]", render: (r) => <span className={`inline-flex rounded-full px-2.5 py-1 font-inter text-[11px] font-semibold ${STATUT_STYLE[r.statut]}`}>{r.statut}</span> },
  {
    key: "_actions", label: "Actions", width: "w-[70px]", align: "right",
    render: () => (
      <div className="flex items-center gap-2">
        <button className="text-placeholder hover:text-primary transition-colors"><Icon name="check" size={15} /></button>
        <button className="text-placeholder hover:text-primary transition-colors"><Icon name="pencil" size={15} /></button>
      </div>
    ),
  },
];

export default function PlanificationPage() {
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
        <DataTable
          columns={COLUMNS}
          data={PLAN}
          keyExtractor={(p) => p.id}
          pagination={{ page: 1, total: 1, count: PLAN.length }}
        />
      </div>
    </div>
  );
}
