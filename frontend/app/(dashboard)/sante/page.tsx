"use client";

import { useState } from "react";
import Link from "next/link";
import Icon from "@/components/ui/Icon";
import DataTable, { Column } from "@/components/ui/DataTable";
import TableSkeleton from "@/components/ui/TableSkeleton";
import SanteTabs from "@/components/dashboard/SanteTabs";
import { traitementStatutStyle } from "@/lib/statusStyles";
import { useApi } from "@/lib/useApi";
import type { Traitement } from "@/lib/types";

function animalCode(t: Traitement): string {
  return typeof t.animal === "object" ? (t.animal.identifiant ?? "—") : t.animal;
}
function raceName(t: Traitement): string {
  return typeof t.animal === "object" && t.animal.race ? (t.animal.race.nom ?? "") : "";
}

const COLUMNS: Column<Traitement>[] = [
  {
    key: "animal", label: "Animal", width: "w-[160px]",
    render: (r) => (
      <div className="flex items-center gap-2.5">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-light text-primary">
          <Icon name="beef" size={14} />
        </span>
        <div className="flex flex-col">
          <span className="font-inter text-[13px] font-semibold text-primary">{animalCode(r)}</span>
          {raceName(r) && <span className="font-inter text-[11px] text-placeholder">{raceName(r)}</span>}
        </div>
      </div>
    ),
  },
  { key: "type", label: "Type", width: "w-[150px]" },
  { key: "produit", label: "Produit", width: "w-[150px]" },
  { key: "dateDebut", label: "Début", width: "w-[100px]", render: (r) => <span className="font-inter text-[13px] text-subtle">{new Date(r.dateDebut).toLocaleDateString("fr-FR")}</span> },
  { key: "dateFin", label: "Fin", width: "w-[100px]", render: (r) => <span className="font-inter text-[13px] text-subtle">{r.dateFin ? new Date(r.dateFin).toLocaleDateString("fr-FR") : "—"}</span> },
  {
    key: "statut", label: "Statut", width: "w-[110px]",
    render: (r) => <span className={`inline-flex rounded-full px-2.5 py-1 font-inter text-[11px] font-semibold ${traitementStatutStyle[r.statut]}`}>{r.statut}</span>,
  },
];

export default function SantePage() {
  const { data: traitements, loading, error } = useApi<Traitement[]>("/sante/traitements");
  const [search, setSearch] = useState("");
  const filtered = (traitements ?? []).filter((t) => animalCode(t).toLowerCase().includes(search.toLowerCase()) || t.produit.toLowerCase().includes(search.toLowerCase()));

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
        </div>
        {loading && <TableSkeleton cols={[2, 2, 2, 1, 1, 1]} />}
        {error && <p className="font-inter text-sm text-danger">{error}</p>}
        {!loading && !error && (
          <DataTable columns={COLUMNS} data={filtered} keyExtractor={(t) => t.id} pagination={{ page: 1, total: 1, count: (traitements ?? []).length }} empty={{ icon: "stethoscope", title: "Aucun traitement", hint: search ? "Aucun traitement ne correspond à la recherche." : "Enregistrez un traitement pour suivre la santé du troupeau." }} />
        )}
      </div>
    </div>
  );
}
