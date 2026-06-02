"use client";

import { useState } from "react";
import Link from "next/link";
import Icon from "@/components/ui/Icon";
import DataTable, { Column } from "@/components/ui/DataTable";
import SanteTabs from "@/components/dashboard/SanteTabs";
import { traitementStatutStyle } from "@/lib/statusStyles";

interface Traitement {
  id: string;
  animal: string;
  race: string;
  type: string;
  produit: string;
  dateDebut: string;
  dateFin: string;
  statut: "En cours" | "Terminé" | "Planifié";
}

const TRAITEMENTS: Traitement[] = [
  { id: "VET-001", animal: "ANI-012", race: "Holstein", type: "Antibiotique", produit: "Amoxicilline", dateDebut: "01/06/2026", dateFin: "07/06/2026", statut: "En cours" },
  { id: "VET-002", animal: "ANI-031", race: "Angus", type: "Antiparasitaire", produit: "Ivermectine", dateDebut: "28/05/2026", dateFin: "01/06/2026", statut: "Terminé" },
  { id: "VET-003", animal: "ANI-047", race: "Limousin", type: "Anti-inflammatoire", produit: "Méloxicam", dateDebut: "02/06/2026", dateFin: "05/06/2026", statut: "En cours" },
  { id: "VET-004", animal: "ANI-008", race: "Charolais", type: "Vaccin", produit: "FMD Vaccine", dateDebut: "10/06/2026", dateFin: "10/06/2026", statut: "Planifié" },
];

const COLUMNS: Column<Traitement>[] = [
  { key: "id", label: "Réf.", width: "w-[100px]", render: (r) => <span className="font-inter text-[13px] font-semibold text-label">{r.id}</span> },
  {
    key: "animal", label: "Animal", width: "w-[120px]",
    render: (r) => (
      <div className="flex flex-col">
        <Link href={`/animaux/${r.animal}`} className="font-inter text-[13px] font-semibold text-primary hover:underline">{r.animal}</Link>
        <span className="font-inter text-[11px] text-placeholder">{r.race}</span>
      </div>
    ),
  },
  { key: "type", label: "Type", width: "w-[140px]" },
  { key: "produit", label: "Produit", width: "w-[150px]" },
  { key: "dateDebut", label: "Début", width: "w-[100px]" },
  { key: "dateFin", label: "Fin", width: "w-[100px]" },
  {
    key: "statut", label: "Statut", width: "w-[110px]",
    render: (r) => <span className={`inline-flex rounded-full px-2.5 py-1 font-inter text-[11px] font-semibold ${traitementStatutStyle[r.statut]}`}>{r.statut}</span>,
  },
  {
    key: "_actions", label: "Actions", width: "w-[70px]", align: "right",
    render: (r) => (
      <Link href={`/animaux/${r.animal}`} className="flex justify-end text-placeholder hover:text-primary transition-colors"><Icon name="eye" size={15} /></Link>
    ),
  },
];

export default function SantePage() {
  const [search, setSearch] = useState("");
  const filtered = TRAITEMENTS.filter((t) => t.animal.toLowerCase().includes(search.toLowerCase()) || t.produit.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-surface">
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-border-light bg-card px-7">
        <div className="flex items-center gap-1.5">
          <span className="font-dm-sans text-xl font-semibold text-label">Santé</span>
          <span className="font-inter text-sm text-placeholder">/ Suivi vétérinaire</span>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/sante/planification" className="flex items-center gap-1.5 rounded-[6px] border border-border-light bg-surface px-3.5 py-2 font-dm-sans text-[13px] font-semibold text-subtle hover:bg-border-light transition-colors">
            <Icon name="calendar" size={14} />
            Planifier
          </Link>
          <Link href="/sante/traitement/nouveau" className="flex items-center gap-1.5 rounded-[6px] bg-primary px-3.5 py-2 font-dm-sans text-[13px] font-semibold text-white hover:bg-primary-hover transition-colors">
            <Icon name="plus" size={14} />
            Nouveau traitement
          </Link>
        </div>
      </header>

      <SanteTabs />

      <div className="flex flex-1 flex-col gap-4 overflow-auto p-6">
        <div className="flex items-center gap-2 rounded-[8px] border border-border-light bg-card p-3">
          <div className="flex items-center gap-1.5 rounded-[6px] border border-border-light bg-surface px-3 py-1.5">
            <Icon name="search" size={14} className="text-placeholder" />
            <input type="text" placeholder="Animal ou produit…" value={search} onChange={(e) => setSearch(e.target.value)} className="w-44 bg-transparent font-inter text-[13px] text-label placeholder:text-placeholder focus:outline-none" />
          </div>
          {["Type", "Statut"].map((f) => (
            <button key={f} className="flex items-center gap-1 rounded-[6px] border border-border-light px-2.5 py-1.5 font-inter text-[13px] text-subtle hover:bg-surface transition-colors">
              {f}<Icon name="chevron-down" size={12} className="text-placeholder" />
            </button>
          ))}
        </div>
        <DataTable columns={COLUMNS} data={filtered} keyExtractor={(t) => t.id} pagination={{ page: 1, total: 1, count: TRAITEMENTS.length }} />
      </div>
    </div>
  );
}
