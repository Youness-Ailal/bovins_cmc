"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Icon from "@/components/ui/Icon";
import { useSaveToast } from "@/lib/useSaveToast";
import { useToast } from "@/components/ui/Toast";
import { useApi } from "@/lib/useApi";
import { api } from "@/lib/api";
import DatePicker from "@/components/ui/DatePicker";
import type { StockArticle } from "@/lib/types";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

type TypeMouvement = "entree" | "sortie" | "ajustement";

function MouvementForm() {
  const params = useSearchParams();
  const preArticle = params.get("article") ?? "";
  const preType = (params.get("type") as TypeMouvement | null) ?? "entree";

  const { data: articlesData } = useApi<StockArticle[]>("/stocks");
  const articles = (articlesData ?? []).map((a) => ({
    id: a.id, nom: a.designation, unite: a.unite, qteActuelle: a.quantite,
  }));

  const [type, setType] = useState<TypeMouvement>(preType);
  const [articleId, setArticleId] = useState(preArticle);
  const [quantite, setQuantite] = useState("");
  const [prixUnitaire, setPrixUnitaire] = useState("");
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [motif, setMotif] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const article = articles.find((a) => a.id === articleId);
  const qteApres = article && quantite
    ? type === "entree" ? article.qteActuelle + parseFloat(quantite)
    : type === "sortie" ? article.qteActuelle - parseFloat(quantite)
    : parseFloat(quantite)
    : null;

  const notifySaved = useSaveToast();
  const { error: toastError } = useToast();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!articleId) return toastError("Sélectionnez un article");
    if (!quantite || isNaN(parseFloat(quantite))) return toastError("La quantité est requise");
    if (qteApres !== null && qteApres < 0) return toastError("Stock insuffisant pour cette sortie");
    setSubmitting(true);
    try {
      await api.post("/stocks/mouvements", {
        article: articleId,
        type,
        quantite: Number(quantite),
        prixUnitaire: type === "entree" && prixUnitaire ? Number(prixUnitaire) : undefined,
        date: date ?? new Date(),
        motif,
        notes,
      });
      notifySaved("Mouvement enregistré", `/stocks/${articleId}`);
    } catch (err) {
      toastError(err instanceof Error ? err.message : "Erreur");
      setSubmitting(false);
    }
  }

  const backHref = articleId ? `/stocks/${articleId}` : "/stocks";

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-surface">
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-border-light bg-card px-7">
        <div className="flex items-center gap-1.5">
          <Link href={backHref} className="font-inter text-sm text-placeholder hover:text-subtle transition-colors">
            {articleId && article ? article.nom : "Stocks"}
          </Link>
          <span className="font-inter text-sm text-placeholder">/</span>
          <span className="font-dm-sans text-xl font-semibold text-label">Mouvement de stock</span>
        </div>
        <div className="flex items-center gap-2">
          <Link href={backHref} className="flex items-center gap-1.5 rounded-[6px] border border-border-light bg-surface px-3.5 py-2 font-dm-sans text-[13px] font-semibold text-subtle hover:bg-border-light transition-colors">
            Annuler
          </Link>
          <button
            type="submit" form="mouvement-form" disabled={submitting}
            className="flex items-center gap-1.5 rounded-[6px] bg-primary px-3.5 py-2 font-dm-sans text-[13px] font-semibold text-white hover:bg-primary/90 disabled:opacity-60 transition-colors"
          >
            <Icon name="save" size={14} />
            {submitting ? "Enregistrement…" : "Enregistrer"}
          </button>
        </div>
      </header>

      <div className="flex flex-1 items-start justify-center overflow-auto p-8">
        <form id="mouvement-form" onSubmit={handleSubmit} noValidate className="w-full max-w-[580px] rounded-[12px] border border-border-light bg-card p-8">
          <h2 className="font-dm-sans text-base font-bold text-label">Enregistrement de mouvement</h2>
          <p className="mt-1 font-inter text-[13px] text-subtle">Enregistrez une entrée, sortie ou correction de stock.</p>

          <div className="mt-6 flex flex-col gap-5">
            {/* Type */}
            <div className="flex flex-col gap-1.5">
              <label className="font-inter text-xs font-medium text-label">Type de mouvement *</label>
              <div className="flex gap-2">
                {([
                  { id: "entree", label: "Entrée", sub: "Réapprovisionnement", icon: "arrow-down-to-line", color: "border-success text-success" },
                  { id: "sortie", label: "Sortie", sub: "Consommation", icon: "arrow-up-from-line", color: "border-warning text-warning" },
                  { id: "ajustement", label: "Ajustement", sub: "Inventaire", icon: "sliders-horizontal", color: "border-info text-info" },
                ] as const).map((t) => (
                  <button
                    key={t.id} type="button" onClick={() => setType(t.id)}
                    className={`flex flex-1 flex-col items-center gap-1 rounded-[8px] border-2 px-3 py-3 transition-colors ${
                      type === t.id ? `${t.color} bg-surface` : "border-border-light bg-card text-placeholder"
                    }`}
                  >
                    <Icon name={t.icon} size={18} className={type === t.id ? t.color.split(" ")[1] : "text-placeholder"} />
                    <span className={`font-dm-sans text-[12px] font-semibold ${type === t.id ? "text-label" : "text-subtle"}`}>{t.label}</span>
                    <span className="font-inter text-[10px] text-placeholder">{t.sub}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Article + Date */}
            <div className="flex gap-4">
              <div className="flex flex-1 flex-col gap-1.5">
                <label className="font-inter text-xs font-medium text-label">Article *</label>
                <Select value={articleId} onValueChange={(v) => setArticleId(v ?? "")}>
                  <SelectTrigger className="h-10 w-full rounded-[6px] border border-border bg-card">
                    <SelectValue placeholder="Sélectionner un article" />
                  </SelectTrigger>
                  <SelectContent>
                    {articles.map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.nom} — {a.qteActuelle} {a.unite}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-inter text-xs font-medium text-label">Date *</label>
                <DatePicker value={date} onChange={setDate} />
              </div>
            </div>

            {/* Quantité + Prix */}
            <div className="flex gap-4">
              <div className="flex flex-1 flex-col gap-1.5">
                <label className="font-inter text-xs font-medium text-label">
                  {type === "ajustement" ? "Nouvelle quantité totale *" : "Quantité *"}
                </label>
                <div className="flex h-10 items-center gap-2 rounded-[6px] border border-border-light bg-card px-3 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary">
                  <input
                    type="number" min="0" step="0.01" value={quantite}
                    onChange={(e) => setQuantite(e.target.value)}
                    className="w-full bg-transparent font-inter text-[13px] text-label focus:outline-none"
                  />
                  <span className="font-inter text-xs text-placeholder">{article?.unite ?? "unité"}</span>
                </div>
              </div>
              {type === "entree" && (
                <div className="flex flex-1 flex-col gap-1.5">
                  <label className="font-inter text-xs font-medium text-label">Prix d'achat (MAD/{article?.unite ?? "u"})</label>
                  <input
                    type="number" min="0" step="0.01" placeholder="0.00"
                    value={prixUnitaire} onChange={(e) => setPrixUnitaire(e.target.value)}
                    className="h-10 w-full rounded-[6px] border border-border-light bg-card px-3 font-inter text-[13px] text-label placeholder:text-placeholder focus:border-primary focus:outline-none"
                  />
                </div>
              )}
            </div>

            {/* Preview */}
            {article && qteApres !== null && (
              <div className={`rounded-[8px] p-4 ${qteApres < 0 ? "border border-danger/20 bg-danger/5" : "bg-surface"}`}>
                <p className="font-inter text-[10px] font-semibold uppercase tracking-widest text-placeholder">Aperçu après mouvement</p>
                <div className="mt-3 flex items-center gap-6">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-inter text-[10px] text-placeholder">Avant</span>
                    <span className="font-inter text-[13px] font-semibold text-subtle">{article.qteActuelle} {article.unite}</span>
                  </div>
                  <Icon name="arrow-right" size={14} className="text-placeholder" />
                  <div className="flex flex-col gap-0.5">
                    <span className="font-inter text-[10px] text-placeholder">Mouvement</span>
                    <span className={`font-inter text-[13px] font-semibold ${type === "entree" ? "text-success" : type === "sortie" ? "text-danger" : "text-info"}`}>
                      {type === "entree" ? "+" : type === "sortie" ? "−" : "→"}{quantite} {article.unite}
                    </span>
                  </div>
                  <Icon name="arrow-right" size={14} className="text-placeholder" />
                  <div className="flex flex-col gap-0.5">
                    <span className="font-inter text-[10px] text-placeholder">Après</span>
                    <span className={`font-dm-sans text-lg font-bold ${qteApres < 0 ? "text-danger" : "text-label"}`}>
                      {qteApres % 1 === 0 ? qteApres : qteApres.toFixed(2)} {article.unite}
                    </span>
                  </div>
                </div>
                {qteApres < 0 && <p className="mt-2 font-inter text-[11px] text-danger">⚠ Stock insuffisant — réduisez la quantité.</p>}
              </div>
            )}

            {/* Motif + Notes */}
            <div className="flex flex-col gap-1.5">
              <label className="font-inter text-xs font-medium text-label">Motif</label>
              <input
                type="text" value={motif} onChange={(e) => setMotif(e.target.value)}
                placeholder="Ex: Distribution Parcelle A · BL-2026-0041"
                className="h-10 w-full rounded-[6px] border border-border-light bg-card px-3 font-inter text-[13px] text-label placeholder:text-placeholder focus:border-primary focus:outline-none"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-inter text-xs font-medium text-label">Notes</label>
              <textarea
                rows={2} value={notes} onChange={(e) => setNotes(e.target.value)}
                placeholder="Observations complémentaires…"
                className="resize-none rounded-[6px] border border-border-light bg-card p-3 font-inter text-[13px] text-label placeholder:text-placeholder focus:border-primary focus:outline-none"
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function MouvementStockPage() {
  return (
    <Suspense>
      <MouvementForm />
    </Suspense>
  );
}
