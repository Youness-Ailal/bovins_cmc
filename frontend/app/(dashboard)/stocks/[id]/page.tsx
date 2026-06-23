"use client";

import { use } from "react";
import Link from "next/link";
import Icon from "@/components/ui/Icon";
import ProgressBar from "@/components/ui/ProgressBar";
import { useApi } from "@/lib/useApi";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import type { StockArticle, StockMouvement } from "@/lib/types";

const STATUT_STYLE = {
  OK: { bar: "bg-success", text: "text-success", bg: "bg-success/10", label: "Niveau OK" },
  Faible: { bar: "bg-warning", text: "text-warning", bg: "bg-warning/10", label: "Stock faible" },
  Critique: { bar: "bg-danger", text: "text-danger", bg: "bg-danger/10", label: "Stock critique" },
};

const TYPE_LABEL: Record<string, string> = { entree: "Entrée", sortie: "Sortie", ajustement: "Ajustement" };
const TYPE_ICON: Record<string, string> = { entree: "arrow-down-to-line", sortie: "arrow-up-from-line", ajustement: "sliders-horizontal" };
const TYPE_COLOR: Record<string, string> = { entree: "text-success bg-success/10", sortie: "text-danger bg-danger/10", ajustement: "text-info bg-info/10" };

function stockPct(a: StockArticle): number {
  const ref = a.seuil > 0 ? a.seuil * 2 : Math.max(a.quantite, 1);
  return Math.min(100, Math.round((a.quantite / ref) * 100));
}

export default function StockArticleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { data: article, loading, error } = useApi<StockArticle>(`/stocks/${id}`);
  const { data: mouvements, loading: loadingMvts } = useApi<StockMouvement[]>(`/stocks/mouvements?article=${id}`);

  async function handleDelete() {
    if (!confirm(`Supprimer « ${article?.designation} » ? Les mouvements liés seront aussi supprimés.`)) return;
    await api.del(`/stocks/${id}`);
    router.push("/stocks");
  }

  if (loading) return <div className="flex flex-1 items-center justify-center font-inter text-sm text-placeholder">Chargement…</div>;
  if (error || !article) return <div className="flex flex-1 items-center justify-center font-inter text-sm text-danger">{error ?? "Article introuvable"}</div>;

  const s = STATUT_STYLE[article.statut as keyof typeof STATUT_STYLE] ?? STATUT_STYLE.OK;
  const fournisseur = article.fournisseur;
  const mvts = mouvements ?? [];

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-surface">
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-border-light bg-card px-7">
        <div className="flex items-center gap-1.5">
          <Link href="/stocks" className="font-inter text-sm text-subtle hover:text-label transition-colors">Stocks</Link>
          <Icon name="chevron-right" size={14} className="text-placeholder" />
          <span className="font-dm-sans text-xl font-semibold text-label">{article.designation}</span>
          <span className={`ml-1 rounded-full px-2 py-0.5 font-inter text-[10px] font-semibold ${s.text} ${s.bg}`}>{s.label}</span>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/stocks/${id}/modifier`}
            className="flex items-center gap-1.5 rounded-[6px] border border-border-light bg-surface px-3.5 py-2 font-dm-sans text-[13px] font-semibold text-subtle hover:bg-border-light transition-colors"
          >
            <Icon name="pencil" size={13} />
            Modifier
          </Link>
          <button
            onClick={handleDelete}
            className="flex items-center gap-1 rounded-[6px] border border-danger/30 bg-danger/5 px-3 py-2 font-dm-sans text-[12px] font-semibold text-danger hover:bg-danger/10 transition-colors"
          >
            <Icon name="trash-2" size={13} />
          </button>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-5 overflow-auto p-6">
        {/* Info + Stock level */}
        <div className="grid grid-cols-3 gap-4">
          {/* Stock level card */}
          <div className="col-span-2 flex flex-col gap-4 rounded-[12px] border border-border-light bg-card p-5">
            <div className="flex items-center justify-between">
              <span className="font-dm-sans text-[15px] font-semibold text-label">Niveau de stock</span>
              <div className="flex items-center gap-2">
                <Link
                  href={`/stocks/mouvement?article=${id}&type=sortie`}
                  className="flex items-center gap-1.5 rounded-[6px] border border-warning/30 bg-warning/5 px-3 py-1.5 font-dm-sans text-[12px] font-semibold text-warning hover:bg-warning/10 transition-colors"
                >
                  <Icon name="arrow-up-from-line" size={12} />
                  Sortie
                </Link>
                <Link
                  href={`/stocks/mouvement?article=${id}&type=entree`}
                  className="flex items-center gap-1.5 rounded-[6px] border border-success/30 bg-success/5 px-3 py-1.5 font-dm-sans text-[12px] font-semibold text-success hover:bg-success/10 transition-colors"
                >
                  <Icon name="arrow-down-to-line" size={12} />
                  Entrée
                </Link>
                {fournisseur && (
                  <Link
                    href={`/fournisseurs/commandes/nouvelle?fournisseur=${fournisseur.id}&article=${id}`}
                    className="flex items-center gap-1.5 rounded-[6px] bg-primary px-3 py-1.5 font-dm-sans text-[12px] font-semibold text-white hover:bg-primary/90 transition-colors"
                  >
                    <Icon name="truck" size={12} />
                    Commander
                  </Link>
                )}
              </div>
            </div>

            <div className="flex items-end gap-6">
              <div>
                <span className="font-dm-sans text-[38px] font-bold leading-none text-label">
                  {article.quantite % 1 === 0 ? article.quantite : article.quantite.toFixed(1)}
                </span>
                <span className="ml-1.5 font-inter text-[15px] text-subtle">{article.unite}</span>
              </div>
              {article.seuil > 0 && (
                <div className="mb-1 font-inter text-[12px] text-subtle">
                  Seuil d'alerte: <span className="font-semibold text-label">{article.seuil} {article.unite}</span>
                </div>
              )}
            </div>
            {article.seuil > 0 && (
              <ProgressBar value={stockPct(article)} color={s.bar} height={8} />
            )}
          </div>

          {/* Details card */}
          <div className="flex flex-col gap-3 rounded-[12px] border border-border-light bg-card p-5">
            <span className="font-dm-sans text-[15px] font-semibold text-label">Détails</span>
            {[
              { label: "Référence", value: article.reference || "—" },
              { label: "Catégorie", value: article.categorie },
              { label: "Unité", value: article.unite },
              { label: "Prix unitaire", value: article.prixUnitaire ? `${article.prixUnitaire} MAD/${article.unite}` : "—" },
              { label: "Péremption", value: article.datePeremption ? new Date(article.datePeremption).toLocaleDateString("fr-FR", { month: "long", year: "numeric" }) : "—" },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between border-b border-border-light pb-2 last:border-0 last:pb-0">
                <span className="font-inter text-[11px] text-subtle">{label}</span>
                <span className="font-inter text-[12px] font-semibold text-label">{value}</span>
              </div>
            ))}
            {fournisseur ? (
              <div className="flex items-center justify-between">
                <span className="font-inter text-[11px] text-subtle">Fournisseur</span>
                <Link href={`/fournisseurs/${fournisseur.id}`} className="font-inter text-[12px] font-semibold text-primary hover:underline">
                  {fournisseur.nom}
                </Link>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <span className="font-inter text-[11px] text-subtle">Fournisseur</span>
                <Link href={`/stocks/${id}/modifier`} className="font-inter text-[11px] text-placeholder hover:text-primary transition-colors">
                  + Associer
                </Link>
              </div>
            )}
            {article.notes && (
              <p className="mt-1 font-inter text-[11px] italic text-subtle">{article.notes}</p>
            )}
          </div>
        </div>

        {/* Movement history */}
        <div className="rounded-[12px] border border-border-light bg-card">
          <div className="flex items-center justify-between border-b border-border-light px-5 py-3">
            <div className="flex items-center gap-2">
              <Icon name="history" size={15} className="text-primary" />
              <span className="font-dm-sans text-[14px] font-semibold text-label">Historique des mouvements</span>
              <span className="font-inter text-[12px] text-placeholder">({mvts.length})</span>
            </div>
            <Link
              href={`/stocks/mouvement?article=${id}`}
              className="flex items-center gap-1 font-inter text-[12px] text-primary hover:underline"
            >
              <Icon name="plus" size={12} />
              Nouveau mouvement
            </Link>
          </div>

          {loadingMvts && <div className="px-5 py-6 font-inter text-sm text-placeholder">Chargement…</div>}
          {!loadingMvts && mvts.length === 0 && (
            <div className="flex flex-col items-center gap-2 py-10">
              <Icon name="history" size={28} className="text-placeholder" />
              <p className="font-inter text-[13px] text-placeholder">Aucun mouvement enregistré</p>
            </div>
          )}
          {!loadingMvts && mvts.length > 0 && (
            <div className="flex flex-col">
              {mvts.map((m) => {
                const tc = TYPE_COLOR[m.type] ?? "text-subtle bg-subtle/10";
                return (
                  <div key={m.id} className="flex items-center gap-4 border-b border-border-light px-5 py-3 last:border-0">
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-[6px] ${tc}`}>
                      <Icon name={TYPE_ICON[m.type] ?? "activity"} size={14} className={tc.split(" ")[0]} />
                    </div>
                    <div className="flex flex-1 flex-col gap-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-inter text-[13px] font-semibold text-label">
                          {TYPE_LABEL[m.type]} — {m.type === "entree" ? "+" : m.type === "sortie" ? "−" : "→"}{m.quantite} {article.unite}
                        </span>
                        {m.commandeSource && (
                          <span className="rounded-full bg-primary/10 px-2 py-0.5 font-inter text-[10px] font-semibold text-primary">
                            Réapprovisionnement
                          </span>
                        )}
                      </div>
                      {m.motif && <span className="font-inter text-[11px] text-subtle">{m.motif}</span>}
                    </div>
                    <div className="flex flex-col items-end gap-0.5">
                      <span className="font-inter text-[12px] text-subtle">{new Date(m.date).toLocaleDateString("fr-FR")}</span>
                      <span className="font-inter text-[11px] text-placeholder">→ {m.quantiteApres} {article.unite}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
