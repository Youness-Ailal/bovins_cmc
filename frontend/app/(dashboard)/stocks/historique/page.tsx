"use client";

import { useState } from "react";
import Link from "next/link";
import Icon from "@/components/ui/Icon";
import DataTable, { Column } from "@/components/ui/DataTable";
import { useApi } from "@/lib/useApi";
import type { StockMouvement } from "@/lib/types";

const TYPE_LABEL: Record<string, string> = { entree: "Entrée", sortie: "Sortie", ajustement: "Ajustement" };
const TYPE_COLOR: Record<string, string> = { entree: "text-success", sortie: "text-danger", ajustement: "text-subtle" };

const COLUMNS: Column<StockMouvement>[] = [
  { key: "date", label: "Date", width: "w-[120px]", render: (r) => <span className="font-inter text-[13px] text-subtle">{new Date(r.date).toLocaleDateString("fr-FR")}</span> },
  { key: "article", label: "Article", width: "w-[180px]", render: (r) => <span className="font-inter text-[13px] font-semibold text-label">{r.article?.designation ?? "—"}</span> },
  { key: "type", label: "Type", width: "w-[110px]", render: (r) => <span className={`font-inter text-[13px] font-semibold ${TYPE_COLOR[r.type]}`}>{TYPE_LABEL[r.type]}</span> },
  {
    key: "quantite", label: "Quantité", width: "w-[110px]",
    render: (r) => <span className={`font-inter text-[13px] font-semibold ${TYPE_COLOR[r.type]}`}>{r.type === "entree" ? "+" : r.type === "sortie" ? "-" : "→"}{r.quantite} {r.article?.unite ?? ""}</span>,
  },
  { key: "quantiteApres", label: "Stock après", width: "w-[110px]", render: (r) => <span className="font-inter text-[13px] text-subtle">{r.quantiteApres} {r.article?.unite ?? ""}</span> },
  { key: "utilisateur", label: "Utilisateur", width: "w-[140px]", render: (r) => <span className="font-inter text-[13px] text-subtle">{r.utilisateur ? `${r.utilisateur.prenom ?? ""} ${r.utilisateur.nom ?? ""}`.trim() : "—"}</span> },
  { key: "motif", label: "Motif", width: "w-[200px]", render: (r) => <span className="font-inter text-[13px] text-subtle">{r.motif || "—"}</span> },
];

export default function HistoriqueStocksPage() {
  const { data: mouvements, loading, error } = useApi<StockMouvement[]>("/stocks/mouvements");
  const [search, setSearch] = useState("");
  const filtered = (mouvements ?? []).filter((m) => (m.article?.designation ?? "").toLowerCase().includes(search.toLowerCase()) || (m.motif ?? "").toLowerCase().includes(search.toLowerCase()));

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
        </div>
        {loading && <p className="font-inter text-sm text-placeholder">Chargement…</p>}
        {error && <p className="font-inter text-sm text-danger">{error}</p>}
        {!loading && !error && (
          <DataTable columns={COLUMNS} data={filtered} keyExtractor={(m) => m.id} pagination={{ page: 1, total: 1, count: (mouvements ?? []).length }} />
        )}
      </div>
    </div>
  );
}
