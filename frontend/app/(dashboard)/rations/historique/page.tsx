"use client";

import { useState } from "react";
import Link from "next/link";
import Icon from "@/components/ui/Icon";
import DataTable, { Column } from "@/components/ui/DataTable";

interface Distribution {
  id: string;
  date: string;
  ration: string;
  cible: string;
  nbAnimaux: number;
  quantite: string;
  cout: string;
}

const DISTRIBUTIONS: Distribution[] = [
  { id: "DST-021", date: "02/06/2026", ration: "Ration Bovins Adultes", cible: "Parcelle Alpha", nbAnimaux: 78, quantite: "624 kg", cout: "1 435 MAD" },
  { id: "DST-020", date: "01/06/2026", ration: "Ration Veaux", cible: "Parcelle Gamma", nbAnimaux: 58, quantite: "290 kg", cout: "742 MAD" },
  { id: "DST-019", date: "01/06/2026", ration: "Ration Bovins Adultes", cible: "Parcelle Beta", nbAnimaux: 34, quantite: "272 kg", cout: "627 MAD" },
  { id: "DST-018", date: "31/05/2026", ration: "Ration Finition", cible: "LOT-B", nbAnimaux: 8, quantite: "96 kg", cout: "181 MAD" },
];

const COLUMNS: Column<Distribution>[] = [
  { key: "id", label: "Réf.", width: "w-[100px]", render: (r) => <span className="font-inter text-[13px] font-semibold text-label">{r.id}</span> },
  { key: "date", label: "Date", width: "w-[110px]" },
  { key: "ration", label: "Ration", width: "w-[220px]" },
  { key: "cible", label: "Cible", width: "w-[160px]" },
  { key: "nbAnimaux", label: "Animaux", width: "w-[90px]", render: (r) => <span className="font-inter text-[13px] text-subtle">{r.nbAnimaux}</span> },
  { key: "quantite", label: "Quantité", width: "w-[110px]" },
  { key: "cout", label: "Coût total", width: "w-[120px]", render: (r) => <span className="font-inter text-[13px] font-semibold text-label">{r.cout}</span> },
];

export default function HistoriqueDistributionsPage() {
  const [search, setSearch] = useState("");
  const filtered = DISTRIBUTIONS.filter((d) => d.ration.toLowerCase().includes(search.toLowerCase()) || d.cible.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-surface">
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-border-light bg-card px-7">
        <div className="flex items-center gap-1.5">
          <span className="font-dm-sans text-xl font-semibold text-label">Historique des distributions</span>
          <span className="font-inter text-sm text-placeholder">/ Rations</span>
        </div>
        <Link href="/rations" className="flex items-center gap-1.5 rounded-[6px] border border-border-light bg-surface px-3.5 py-2 font-dm-sans text-[13px] font-semibold text-subtle hover:bg-border-light transition-colors">
          <Icon name="arrow-left" size={14} />
          Retour aux rations
        </Link>
      </header>

      <div className="flex flex-1 flex-col gap-4 overflow-auto p-6">
        <div className="flex items-center gap-2 rounded-[8px] border border-border-light bg-card p-3">
          <div className="flex items-center gap-1.5 rounded-[6px] border border-border-light bg-surface px-3 py-1.5">
            <Icon name="search" size={14} className="text-placeholder" />
            <input type="text" placeholder="Rechercher…" value={search} onChange={(e) => setSearch(e.target.value)} className="w-44 bg-transparent font-inter text-[13px] text-label placeholder:text-placeholder focus:outline-none" />
          </div>
          {["Ration", "Cible", "Période"].map((f) => (
            <button key={f} className="flex items-center gap-1 rounded-[6px] border border-border-light px-2.5 py-1.5 font-inter text-[13px] text-subtle hover:bg-surface transition-colors">
              {f}<Icon name="chevron-down" size={12} className="text-placeholder" />
            </button>
          ))}
        </div>

        <DataTable
          columns={COLUMNS}
          data={filtered}
          keyExtractor={(d) => d.id}
          pagination={{ page: 1, total: 3, count: 21 }}
        />
      </div>
    </div>
  );
}
