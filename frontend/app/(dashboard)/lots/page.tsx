"use client";

import Link from "next/link";
import Icon from "@/components/ui/Icon";
import Badge from "@/components/ui/Badge";
import DataTable, { Column } from "@/components/ui/DataTable";
import { useApi } from "@/lib/useApi";
import type { Lot } from "@/lib/types";

const PHASE_VARIANT: Record<string, string> = {
  Croissance: "phase-croissance",
  Engraissement: "phase-engraissement",
  Finition: "phase-finition",
};

const COLUMNS: Column<Lot>[] = [
  { key: "nom", label: "Nom du lot", width: "w-[140px]", render: (r) => <span className="font-inter text-[13px] font-semibold text-label">{r.nom}</span> },
  { key: "nbAnimaux", label: "Nb animaux", width: "w-[100px]", render: (r) => <span className="font-inter text-[13px] text-subtle">{r.nbAnimaux ?? 0}</span> },
  {
    key: "phase", label: "Phase", width: "w-[140px]",
    render: (r) => (r.phase ? <Badge variant={PHASE_VARIANT[r.phase] as Parameters<typeof Badge>[0]["variant"]}>{r.phase}</Badge> : <span className="text-placeholder">—</span>),
  },
  { key: "gmqMoyen", label: "GMQ moyen", width: "w-[110px]", render: (r) => <span className="font-inter text-[13px] text-subtle">{r.gmqMoyen ?? 0} kg/j</span> },
  { key: "coutTotal", label: "Coût total (MAD)", width: "w-[150px]", render: (r) => <span className="font-inter text-[13px] text-label">{(r.coutTotal ?? 0).toLocaleString("fr-FR")}</span> },
  { key: "dateCreation", label: "Date création", width: "w-[120px]", render: (r) => <span className="font-inter text-[13px] text-subtle">{r.dateCreation ? new Date(r.dateCreation).toLocaleDateString("fr-FR") : "—"}</span> },
  {
    key: "_actions", label: "Actions", width: "w-[80px]", align: "right",
    render: (r) => (
      <div className="flex items-center justify-end gap-3">
        <Link href={`/lots/${r.id}`} className="text-placeholder hover:text-primary transition-colors"><Icon name="eye" size={15} /></Link>
      </div>
    ),
  },
];

export default function ListeLotsPage() {
  const { data: lots, loading, error } = useApi<Lot[]>("/lots");

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-surface">
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-border-light bg-card px-7">
        <div className="flex items-center gap-1.5">
          <span className="font-dm-sans text-xl font-semibold text-label">Liste des lots</span>
          <span className="font-inter text-sm text-placeholder">/ Lots</span>
        </div>
        <Link href="/lots/nouveau" className="flex items-center gap-1.5 rounded-[6px] bg-primary px-3.5 py-2 font-dm-sans text-[13px] font-semibold text-white hover:bg-primary-hover transition-colors">
          <Icon name="plus" size={14} />
          Nouveau lot
        </Link>
      </header>

      <div className="flex flex-1 flex-col gap-4 overflow-auto p-6">
        {loading && <p className="font-inter text-sm text-placeholder">Chargement…</p>}
        {error && <p className="font-inter text-sm text-danger">{error}</p>}
        {!loading && !error && (
          <DataTable columns={COLUMNS} data={lots ?? []} keyExtractor={(l) => l.id} pagination={{ page: 1, total: 1, count: (lots ?? []).length }} />
        )}
      </div>
    </div>
  );
}
