"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Icon from "@/components/ui/Icon";
import DataTable, { Column } from "@/components/ui/DataTable";
import TableSkeleton from "@/components/ui/TableSkeleton";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import ProgressBar from "@/components/ui/ProgressBar";
import { useToast } from "@/components/ui/Toast";
import { useApi } from "@/lib/useApi";
import { api } from "@/lib/api";
import type { StockArticle } from "@/lib/types";

const STATUT_STYLE: Record<string, { dot: string; text: string; fill: string }> = {
  OK: { dot: "bg-success", text: "text-success", fill: "bg-success" },
  Faible: { dot: "bg-warning", text: "text-warning", fill: "bg-warning" },
  Critique: { dot: "bg-danger", text: "text-danger", fill: "bg-danger" },
};

// Fill ratio of a stock article: quantité relative to 2× its alert threshold,
// so the bar sits at ~50% when exactly at threshold.
function stockPct(a: StockArticle): number {
  const ref = a.seuil > 0 ? a.seuil * 2 : Math.max(a.quantite, 1);
  return Math.min(100, Math.round((a.quantite / ref) * 100));
}

export default function StocksPage() {
  const router = useRouter();
  const { success, error: toastError } = useToast();
  const { data: articles, loading, error, refetch } = useApi<StockArticle[]>("/stocks");
  const [search, setSearch] = useState("");
  const [toDelete, setToDelete] = useState<StockArticle | null>(null);

  async function confirmDelete() {
    if (!toDelete) return;
    try {
      await api.del(`/stocks/${toDelete.id}`);
      success(`Article « ${toDelete.designation} » supprimé`);
      refetch();
    } catch (err) {
      toastError(err instanceof Error ? err.message : "Échec de la suppression");
    } finally {
      setToDelete(null);
    }
  }

  const COLUMNS: Column<StockArticle>[] = [
    { key: "designation", label: "Désignation", width: "w-[170px]", render: (r) => <span className="font-inter text-[13px] font-semibold text-label">{r.designation}</span> },
    { key: "categorie", label: "Catégorie", width: "w-[120px]", render: (r) => <span className="font-inter text-[13px] text-subtle">{r.categorie}</span> },
    {
      key: "niveau", label: "Niveau de stock", width: "w-[230px]",
      render: (r) => {
        const s = STATUT_STYLE[r.statut];
        return (
          <div className="flex w-[210px] flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="font-inter text-[13px] font-semibold text-label">{r.quantite} {r.unite}</span>
              <span className="font-inter text-[11px] text-placeholder">seuil {r.seuil}</span>
            </div>
            <ProgressBar value={stockPct(r)} color={s.fill} height={6} />
          </div>
        );
      },
    },
    {
      key: "statut", label: "Statut", width: "w-[110px]",
      render: (r) => {
        const s = STATUT_STYLE[r.statut];
        return (
          <span className={`inline-flex items-center gap-1.5 font-inter text-[12px] font-semibold ${s.text}`}>
            <span className={`h-2 w-2 rounded-full ${s.dot}`} />
            {r.statut}
          </span>
        );
      },
    },
    { key: "datePeremption", label: "Péremption", width: "w-[100px]", render: (r) => <span className="font-inter text-[13px] text-subtle">{r.datePeremption ? new Date(r.datePeremption).toLocaleDateString("fr-FR", { month: "2-digit", year: "numeric" }) : "—"}</span> },
    {
      key: "_actions", label: "Actions", width: "w-[70px]", align: "right",
      render: (r) => (
        <div className="flex items-center justify-end gap-3">
          <button onClick={() => router.push("/stocks/mouvement")} title="Mouvement" className="text-placeholder hover:text-primary transition-colors"><Icon name="trending-up" size={15} /></button>
          <button onClick={() => setToDelete(r)} title="Supprimer" className="text-placeholder hover:text-danger transition-colors"><Icon name="x" size={15} /></button>
        </div>
      ),
    },
  ];

  const list = articles ?? [];
  const filtered = list.filter((a) => a.designation.toLowerCase().includes(search.toLowerCase()) || a.categorie.toLowerCase().includes(search.toLowerCase()));
  const sousSeuilCount = list.filter((a) => a.statut !== "OK").length;

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-surface">
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-border-light bg-card px-7">
        <div className="flex items-center gap-1.5">
          <span className="font-dm-sans text-xl font-semibold text-label">Stocks</span>
          <span className="font-inter text-sm text-placeholder">/ Aliments & Consommables</span>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/stocks/mouvement" className="flex items-center gap-1.5 rounded-[6px] border border-border-light bg-surface px-3.5 py-2 font-dm-sans text-[13px] font-semibold text-subtle hover:bg-border-light transition-colors">
            <Icon name="trending-up" size={14} />
            Mouvement
          </Link>
          <Link href="/stocks/nouveau" className="flex items-center gap-1.5 rounded-[6px] bg-primary px-3.5 py-2 font-dm-sans text-[13px] font-semibold text-white hover:bg-primary-hover transition-colors">
            <Icon name="plus" size={14} />
            Nouvel article
          </Link>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-4 overflow-auto p-6">
        {sousSeuilCount > 0 && (
          <div className="flex items-center gap-3 rounded-[8px] border border-warning/30 bg-warning/5 px-4 py-3">
            <Icon name="triangle-alert" size={16} className="shrink-0 text-warning" />
            <span className="font-inter text-[13px] text-warning">
              {sousSeuilCount} article{sousSeuilCount > 1 ? "s" : ""} sous seuil —{" "}
              <Link href="/stocks/historique" className="font-semibold underline">Voir historique →</Link>
            </span>
          </div>
        )}

        <div className="flex items-center gap-2 rounded-[8px] border border-border-light bg-card p-3">
          <div className="flex items-center gap-1.5 rounded-[6px] border border-border-light bg-surface px-3 py-1.5">
            <Icon name="search" size={14} className="text-placeholder" />
            <input type="text" placeholder="Rechercher un article…" value={search} onChange={(e) => setSearch(e.target.value)} className="w-48 bg-transparent font-inter text-[13px] text-label placeholder:text-placeholder focus:outline-none" />
          </div>
          <Link href="/stocks/historique" className="ml-auto flex items-center gap-1.5 rounded-[6px] border border-border-light px-3 py-1.5 font-inter text-[13px] text-subtle hover:bg-surface transition-colors">
            <Icon name="trending-down" size={14} />
            Historique
          </Link>
        </div>

        {loading && <TableSkeleton cols={[2, 2, 3, 2, 1, 1]} />}
        {error && <p className="font-inter text-sm text-danger">{error}</p>}
        {!loading && !error && (
          <DataTable columns={COLUMNS} data={filtered} keyExtractor={(a) => a.id} pagination={{ page: 1, total: 1, count: list.length }} empty={{ icon: "package", title: "Aucun article en stock", hint: search ? "Aucun résultat pour cette recherche." : "Ajoutez un premier article pour suivre vos niveaux." }} />
        )}
      </div>

      <ConfirmDialog
        open={toDelete !== null}
        title="Supprimer l'article ?"
        message={`L'article « ${toDelete?.designation ?? ""} » sera retiré du stock. Cette action est irréversible.`}
        confirmLabel="Supprimer"
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
