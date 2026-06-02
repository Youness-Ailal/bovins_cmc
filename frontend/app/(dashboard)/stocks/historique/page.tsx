"use client";

import { useState } from "react";
import Link from "next/link";
import Icon from "@/components/ui/Icon";
import DataTable, { Column } from "@/components/ui/DataTable";

interface Mouvement {
  id: string;
  date: string;
  article: string;
  type: "Entrée" | "Sortie" | "Ajustement";
  quantite: string;
  utilisateur: string;
  motif: string;
}

const MOUVEMENTS: Mouvement[] = [
  { id: "MOV-041", date: "02/06/2026", article: "Orge", type: "Sortie", quantite: "-80 kg", utilisateur: "Youness B.", motif: "Distribution LOT-A" },
  { id: "MOV-040", date: "01/06/2026", article: "Foin de luzerne", type: "Entrée", quantite: "+500 kg", utilisateur: "Admin", motif: "Livraison fournisseur" },
  { id: "MOV-039", date: "01/06/2026", article: "Tourteau de soja", type: "Sortie", quantite: "-55 kg", utilisateur: "Youness B.", motif: "Distribution LOT-B" },
  { id: "MOV-038", date: "31/05/2026", article: "Minéraux bovins", type: "Ajustement", quantite: "-5 kg", utilisateur: "Admin", motif: "Correction inventaire" },
  { id: "MOV-037", date: "30/05/2026", article: "Mélasse", type: "Entrée", quantite: "+60 L", utilisateur: "Admin", motif: "Livraison fournisseur" },
];

const TYPE_COLOR: Record<Mouvement["type"], string> = {
  Entrée: "text-success font-semibold",
  Sortie: "text-danger font-semibold",
  Ajustement: "text-subtle",
};

const COLUMNS: Column<Mouvement>[] = [
  { key: "id", label: "Réf.", width: "w-[100px]", render: (r) => <span className="font-inter text-[13px] font-semibold text-label">{r.id}</span> },
  { key: "date", label: "Date", width: "w-[110px]" },
  { key: "article", label: "Article", width: "w-[160px]" },
  {
    key: "type",
    label: "Type",
    width: "w-[110px]",
    render: (r) => <span className={`font-inter text-[13px] ${TYPE_COLOR[r.type]}`}>{r.type}</span>,
  },
  {
    key: "quantite",
    label: "Quantité",
    width: "w-[100px]",
    render: (r) => (
      <span className={`font-inter text-[13px] font-semibold ${r.type === "Entrée" ? "text-success" : r.type === "Sortie" ? "text-danger" : "text-subtle"}`}>
        {r.quantite}
      </span>
    ),
  },
  { key: "utilisateur", label: "Utilisateur", width: "w-[140px]" },
  { key: "motif", label: "Motif", width: "w-[200px]", render: (r) => <span className="font-inter text-[13px] text-subtle">{r.motif}</span> },
];

export default function HistoriqueStocksPage() {
  const [search, setSearch] = useState("");
  const filtered = MOUVEMENTS.filter((m) =>
    m.article.toLowerCase().includes(search.toLowerCase()) || m.motif.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-surface">
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-border-light bg-card px-7">
        <div className="flex items-center gap-1.5">
          <span className="font-dm-sans text-xl font-semibold text-label">Historique des mouvements</span>
          <span className="font-inter text-sm text-placeholder">/ Stocks</span>
        </div>
        <Link href="/stocks" className="flex items-center gap-1.5 rounded-[6px] border border-border-light bg-surface px-3.5 py-2 font-dm-sans text-[13px] font-semibold text-subtle hover:bg-border-light transition-colors">
          <Icon name="arrow-left" size={14} />
          Retour aux stocks
        </Link>
      </header>

      <div className="flex flex-1 flex-col gap-4 overflow-auto p-6">
        <div className="flex items-center gap-2 rounded-[8px] border border-border-light bg-card p-3">
          <div className="flex items-center gap-1.5 rounded-[6px] border border-border-light bg-surface px-3 py-1.5">
            <Icon name="search" size={14} className="text-placeholder" />
            <input type="text" placeholder="Rechercher…" value={search} onChange={(e) => setSearch(e.target.value)} className="w-44 bg-transparent font-inter text-[13px] text-label placeholder:text-placeholder focus:outline-none" />
          </div>
          {["Type", "Article", "Période"].map((f) => (
            <button key={f} className="flex items-center gap-1 rounded-[6px] border border-border-light px-2.5 py-1.5 font-inter text-[13px] text-subtle hover:bg-surface transition-colors">
              {f}<Icon name="chevron-down" size={12} className="text-placeholder" />
            </button>
          ))}
        </div>

        <DataTable
          columns={COLUMNS}
          data={filtered}
          keyExtractor={(m) => m.id}
          pagination={{ page: 1, total: 5, count: 41 }}
        />
      </div>
    </div>
  );
}
