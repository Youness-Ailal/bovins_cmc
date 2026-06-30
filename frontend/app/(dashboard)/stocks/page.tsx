"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Icon from "@/components/ui/Icon";
import ProgressBar from "@/components/ui/ProgressBar";
import TableSkeleton from "@/components/ui/TableSkeleton";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";
import { useApi } from "@/lib/useApi";
import { api, downloadFile } from "@/lib/api";
import { exportCsv } from "@/lib/exportCsv";
import type { StockArticle } from "@/lib/types";

const STATUT_STYLE = {
  OK:       { dot: "bg-success", text: "text-success", bar: "bg-success" },
  Faible:   { dot: "bg-warning", text: "text-warning", bar: "bg-warning" },
  Critique: { dot: "bg-danger",  text: "text-danger",  bar: "bg-danger"  },
};

const CATEGORIES = ["Céréales", "Fourrages", "Concentrés", "Compléments", "Additifs", "Médicaments"] as const;

function stockPct(a: StockArticle): number {
  const ref = a.seuil > 0 ? a.seuil * 2 : Math.max(a.quantite, 1);
  return Math.min(100, Math.round((a.quantite / ref) * 100));
}

export default function StocksPage() {
  const router = useRouter();
  const canManage = true;
  const canMouvement = true;
  const { success, error: toastError } = useToast();
  const { data: articles, loading, error, refetch } = useApi<StockArticle[]>("/stocks");
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState<string>("Tous");
  const [toDelete, setToDelete] = useState<StockArticle | null>(null);
  const [exporting, setExporting] = useState(false);

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

  const list = articles ?? [];
  const filtered = list.filter((a) => {
    const matchSearch = a.designation.toLowerCase().includes(search.toLowerCase()) || a.categorie.toLowerCase().includes(search.toLowerCase());
    const matchCat = catFilter === "Tous" || a.categorie === catFilter;
    return matchSearch && matchCat;
  });

  function handleExportCsv() {
    exportCsv<StockArticle>(`stocks-${new Date().toISOString().slice(0, 10)}`, [
      { header: "Désignation", value: (a) => a.designation },
      { header: "Référence", value: (a) => a.reference },
      { header: "Catégorie", value: (a) => a.categorie },
      { header: "Unité", value: (a) => a.unite },
      { header: "Quantité", value: (a) => a.quantite },
      { header: "Seuil", value: (a) => a.seuil },
      { header: "Prix unitaire (MAD)", value: (a) => a.prixUnitaire },
      { header: "Valeur (MAD)", value: (a) => Math.round(a.quantite * a.prixUnitaire) },
      { header: "Statut", value: (a) => a.statut },
      { header: "Fournisseur", value: (a) => a.fournisseur?.nom ?? "" },
      { header: "Date péremption", value: (a) => (a.datePeremption ? new Date(a.datePeremption).toLocaleDateString("fr-FR") : "") },
    ], filtered);
  }

  async function handleRapportPdf() {
    setExporting(true);
    try {
      await downloadFile("/stocks/rapport", "etat-stocks.pdf");
      success("État des stocks téléchargé");
    } catch (err) {
      toastError(err instanceof Error ? err.message : "Erreur lors de la génération");
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-surface">
      {/* Header */}
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-border-light bg-card px-7">
        <div className="flex items-center gap-1.5">
          <span className="font-dm-sans text-xl font-semibold text-label">Stocks</span>
          <span className="font-inter text-sm text-placeholder">/ {list.length} articles</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            disabled={filtered.length === 0}
            className="flex items-center gap-1.5 rounded-[6px] border border-border-light bg-surface px-3.5 py-2 font-dm-sans text-[13px] font-semibold text-subtle hover:bg-border-light transition-colors disabled:opacity-50"
          >
            <Icon name="file-text" size={14} />
            Exporter CSV
          </button>
          <button
            onClick={handleRapportPdf}
            disabled={exporting}
            className="flex items-center gap-1.5 rounded-[6px] border border-border-light bg-surface px-3.5 py-2 font-dm-sans text-[13px] font-semibold text-subtle hover:bg-border-light transition-colors disabled:opacity-50"
          >
            <Icon name="clipboard-list" size={14} />
            Rapport PDF
          </button>
          <Link
            href="/stocks/historique"
            className="flex items-center gap-1.5 rounded-[6px] border border-border-light bg-surface px-3.5 py-2 font-dm-sans text-[13px] font-semibold text-subtle hover:bg-border-light transition-colors"
          >
            <Icon name="history" size={14} />
            Historique
          </Link>
          {canMouvement && (
            <Link
              href="/stocks/mouvement"
              className="flex items-center gap-1.5 rounded-[6px] border border-border-light bg-surface px-3.5 py-2 font-dm-sans text-[13px] font-semibold text-subtle hover:bg-border-light transition-colors"
            >
              <Icon name="arrow-left-right" size={14} />
              Mouvement
            </Link>
          )}
          {canManage && (
            <Link
              href="/stocks/nouveau"
              className="flex items-center gap-1.5 rounded-[6px] bg-primary px-3.5 py-2 font-dm-sans text-[13px] font-semibold text-white hover:bg-primary/90 transition-colors"
            >
              <Icon name="plus" size={14} />
              Nouvel article
            </Link>
          )}
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-4 overflow-auto p-6">
        {/* Search + category filter */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 rounded-[6px] border border-border-light bg-card px-3 py-1.5">
            <Icon name="search" size={13} className="text-placeholder" />
            <input
              type="text" placeholder="Rechercher un article…" value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-44 bg-transparent font-inter text-[13px] text-label placeholder:text-placeholder focus:outline-none"
            />
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {["Tous", ...CATEGORIES].map((c) => (
              <button
                key={c} onClick={() => setCatFilter(c)}
                className={`rounded-full px-3 py-1 font-inter text-[11px] font-semibold transition-colors ${
                  catFilter === c
                    ? "bg-primary text-white"
                    : "border border-border-light bg-card text-subtle hover:bg-border-light"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Articles grid */}
        {loading && <TableSkeleton cols={[2, 2, 3, 1, 1]} />}
        {error && <p className="font-inter text-sm text-danger">{error}</p>}
        {!loading && !error && (
          <div className="rounded-[12px] border border-border-light bg-card">
            <div className="border-b border-border-light px-5 py-3">
              <span className="font-dm-sans text-[14px] font-semibold text-label">
                {filtered.length} article{filtered.length !== 1 ? "s" : ""}
                {catFilter !== "Tous" && <span className="ml-1 font-inter text-[12px] font-normal text-subtle">— {catFilter}</span>}
              </span>
            </div>

            {filtered.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-12">
                <Icon name="package" size={32} className="text-placeholder" />
                <p className="font-inter text-[13px] text-placeholder">Aucun article{search ? " pour cette recherche" : ""}</p>
                {canManage && <Link href="/stocks/nouveau" className="mt-1 font-inter text-[13px] text-primary hover:underline">+ Ajouter un article</Link>}
              </div>
            ) : (
              <div className="divide-y divide-border-light">
                {filtered.map((a) => {
                  const s = STATUT_STYLE[a.statut as keyof typeof STATUT_STYLE] ?? STATUT_STYLE.OK;
                  return (
                    <div
                      key={a.id}
                      onClick={() => router.push(`/stocks/${a.id}`)}
                      className="flex cursor-pointer items-center gap-4 px-5 py-3.5 hover:bg-surface transition-colors"
                    >
                      {/* Statut dot */}
                      <span className={`h-2 w-2 shrink-0 rounded-full ${s.dot}`} />

                      {/* Name + categorie */}
                      <div className="flex w-[200px] shrink-0 flex-col gap-0.5">
                        <span className="font-inter text-[13px] font-semibold text-label">{a.designation}</span>
                        <span className="font-inter text-[11px] text-subtle">{a.categorie}</span>
                      </div>

                      {/* Progress bar */}
                      <div className="flex flex-1 flex-col gap-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-dm-sans text-[13px] font-semibold text-label">
                            {a.quantite % 1 === 0 ? a.quantite : a.quantite.toFixed(1)} {a.unite}
                          </span>
                          {a.seuil > 0 && (
                            <span className="font-inter text-[11px] text-placeholder">seuil {a.seuil} {a.unite}</span>
                          )}
                        </div>
                        {a.seuil > 0 && <ProgressBar value={stockPct(a)} color={s.bar} height={5} />}
                      </div>

                      {/* Fournisseur */}
                      <div className="w-[120px] shrink-0">
                        {a.fournisseur ? (
                          <span
                            onClick={(e) => { e.stopPropagation(); router.push(`/fournisseurs/${a.fournisseur!.id}`); }}
                            className="font-inter text-[12px] text-primary hover:underline"
                          >
                            {a.fournisseur.nom}
                          </span>
                        ) : (
                          <span className="font-inter text-[12px] text-placeholder">—</span>
                        )}
                      </div>

                      {/* Péremption */}
                      <div className="w-[90px] shrink-0 text-right">
                        {a.datePeremption ? (
                          <span className="font-inter text-[11px] text-subtle">
                            {new Date(a.datePeremption).toLocaleDateString("fr-FR", { month: "2-digit", year: "numeric" })}
                          </span>
                        ) : <span className="font-inter text-[11px] text-placeholder">—</span>}
                      </div>

                      {/* Actions */}
                      <div
                        className="flex shrink-0 items-center gap-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {canMouvement && (
                          <button
                            onClick={() => router.push(`/stocks/mouvement?article=${a.id}`)}
                            title="Mouvement"
                            className="rounded-[4px] p-1 text-placeholder hover:bg-surface hover:text-primary transition-colors"
                          >
                            <Icon name="arrow-left-right" size={14} />
                          </button>
                        )}
                        {canManage && (
                          <button
                            onClick={() => router.push(`/stocks/${a.id}/modifier`)}
                            title="Modifier"
                            className="rounded-[4px] p-1 text-placeholder hover:bg-surface hover:text-label transition-colors"
                          >
                            <Icon name="pencil" size={14} />
                          </button>
                        )}
                        {canManage && (
                          <button
                            onClick={() => setToDelete(a)}
                            title="Supprimer"
                            className="rounded-[4px] p-1 text-placeholder hover:bg-surface hover:text-danger transition-colors"
                          >
                            <Icon name="trash-2" size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={toDelete !== null}
        title="Supprimer l'article ?"
        message={`L'article « ${toDelete?.designation ?? ""} » et ses mouvements seront supprimés.`}
        confirmLabel="Supprimer"
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
