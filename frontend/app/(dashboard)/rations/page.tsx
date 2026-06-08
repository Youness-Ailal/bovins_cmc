"use client";

import { useState } from "react";
import Link from "next/link";
import Icon from "@/components/ui/Icon";
import Badge from "@/components/ui/Badge";
import DataTable, { Column } from "@/components/ui/DataTable";
import TableSkeleton from "@/components/ui/TableSkeleton";
import { useApi } from "@/lib/useApi";
import type { Ration } from "@/lib/types";

const PHASE_VARIANT: Record<string, string> = {
  Veau: "phase-croissance",
  Croissance: "phase-croissance",
  Engraissement: "phase-engraissement",
  Finition: "phase-finition",
};

const COLUMNS: Column<Ration>[] = [
  { key: "nom", label: "Nom de la ration", width: "w-[240px]", render: (r) => <span className="font-inter text-[13px] font-semibold text-label">{r.nom}</span> },
  {
    key: "phase", label: "Phase", width: "w-[140px]",
    render: (r) => (r.phase ? <Badge variant={PHASE_VARIANT[r.phase] as Parameters<typeof Badge>[0]["variant"]}>{r.phase}</Badge> : <span className="text-placeholder">—</span>),
  },
  {
    key: "nbIngredients", label: "Ingrédients", width: "w-[110px]",
    render: (r) => (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-surface px-2.5 py-1 font-inter text-[12px] font-medium text-subtle">
        <Icon name="wheat" size={12} className="text-placeholder" />
        {r.nbIngredients}
      </span>
    ),
  },
  { key: "coutJour", label: "Coût/j", width: "w-[130px]", render: (r) => <span className="inline-flex items-baseline gap-1"><span className="font-inter text-[13px] font-semibold text-label">{r.coutJour.toFixed(2)}</span><span className="font-inter text-[11px] text-placeholder">MAD</span></span> },
  { key: "cible", label: "Assignée à", width: "w-[200px]", render: (r) => <span className="font-inter text-[13px] text-subtle">{r.cible || "—"}</span> },
  {
    key: "_actions", label: "Actions", width: "w-[160px]", align: "right",
    render: (r) => (
      <div className="flex items-center justify-end gap-2">
        <Link href={`/rations/distribution?ration=${r.id}`} className="flex items-center gap-1 rounded-[6px] bg-primary-light px-2.5 py-1.5 font-inter text-[12px] font-semibold text-primary hover:bg-primary hover:text-white transition-colors">
          <Icon name="utensils" size={13} />
          Distribuer
        </Link>
        <Link href={`/rations/${r.id}`} className="text-placeholder hover:text-primary transition-colors"><Icon name="eye" size={15} /></Link>
      </div>
    ),
  },
];

export default function ListeRationsPage() {
  const { data: rations, loading, error } = useApi<Ration[]>("/rations");
  const [search, setSearch] = useState("");
  const filtered = (rations ?? []).filter((r) => r.nom.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-surface">
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-border-light bg-card px-7">
        <div className="flex items-center gap-1.5">
          <span className="font-dm-sans text-xl font-semibold text-label">Rations</span>
          <span className="font-inter text-sm text-placeholder">/ Liste des rations</span>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/rations/historique" className="flex items-center gap-1.5 rounded-[6px] border border-border-light bg-surface px-3.5 py-2 font-dm-sans text-[13px] font-semibold text-subtle hover:bg-border-light transition-colors">
            Historique
          </Link>
          <Link href="/rations/nouvelle" className="flex items-center gap-1.5 rounded-[6px] bg-primary px-3.5 py-2 font-dm-sans text-[13px] font-semibold text-white hover:bg-primary-hover transition-colors">
            <Icon name="plus" size={14} />
            Nouvelle ration
          </Link>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-4 overflow-auto p-6">
        <div className="flex items-center gap-2 rounded-[8px] border border-border-light bg-card p-3">
          <div className="flex items-center gap-1.5 rounded-[6px] border border-border-light bg-surface px-3 py-1.5">
            <Icon name="search" size={14} className="text-placeholder" />
            <input type="text" placeholder="Rechercher une ration…" value={search} onChange={(e) => setSearch(e.target.value)} className="w-48 bg-transparent font-inter text-[13px] text-label placeholder:text-placeholder focus:outline-none" />
          </div>
        </div>

        {loading && <TableSkeleton cols={[3, 2, 1, 1, 2, 2]} />}
        {error && <p className="font-inter text-sm text-danger">{error}</p>}
        {!loading && !error && (
          <DataTable columns={COLUMNS} data={filtered} keyExtractor={(r) => r.id} pagination={{ page: 1, total: 1, count: (rations ?? []).length }} empty={{ icon: "utensils", title: "Aucune ration", hint: search ? "Aucune ration ne correspond à la recherche." : "Composez une ration pour nourrir vos lots." }} />
        )}
      </div>
    </div>
  );
}
