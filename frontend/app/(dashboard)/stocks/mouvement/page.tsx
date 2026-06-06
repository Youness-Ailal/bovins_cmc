"use client";

import { useState } from "react";
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

// UC-08 — Réapprovisionner / enregistrer un mouvement de stock

type TypeMouvement = "entree" | "sortie" | "ajustement";

export default function MouvementStockPage() {
  const { data: articlesData } = useApi<StockArticle[]>("/stocks");
  const articles = (articlesData ?? []).map((a) => ({ id: a.id, nom: a.designation, unite: a.unite, qteActuelle: a.quantite }));

  const [type, setType] = useState<TypeMouvement>("entree");
  const [articleId, setArticleId] = useState("");
  const [quantite, setQuantite] = useState("");
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [motif, setMotif] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const article = articles.find((a) => a.id === articleId);
  const qteApres = article && quantite
    ? type === "entree"
      ? article.qteActuelle + parseFloat(quantite)
      : type === "sortie"
      ? article.qteActuelle - parseFloat(quantite)
      : parseFloat(quantite)
    : null;

  const notifySaved = useSaveToast();
  const { error: toastError } = useToast();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!articleId) return toastError("Sélectionnez un article");
    if (!quantite) return toastError("La quantité est requise");
    setSubmitting(true);
    try {
      await api.post("/stocks/mouvements", { article: articleId, type, quantite: Number(quantite), date: date ?? new Date(), motif });
      notifySaved("Mouvement de stock enregistré", "/stocks");
    } catch (err) {
      toastError(err instanceof Error ? err.message : "Erreur");
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-surface">
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-border-light bg-card px-7">
        <div className="flex items-center gap-1.5">
          <Link href="/stocks" className="font-inter text-sm text-placeholder hover:text-subtle transition-colors">Stocks</Link>
          <span className="font-inter text-sm text-placeholder">/</span>
          <span className="font-dm-sans text-xl font-semibold text-label">Mouvement de stock</span>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/stocks" className="flex items-center gap-1.5 rounded-[6px] border border-border-light bg-surface px-3.5 py-2 font-dm-sans text-[13px] font-semibold text-subtle hover:bg-border-light transition-colors">
            Annuler
          </Link>
          <button type="submit" form="mouvement-form" className="flex items-center gap-1.5 rounded-[6px] bg-primary px-3.5 py-2 font-dm-sans text-[13px] font-semibold text-white hover:bg-primary-hover transition-colors">
            <Icon name="save" size={14} />
            Enregistrer
          </button>
        </div>
      </header>

      <div className="flex flex-1 items-start justify-center overflow-auto p-8">
        <div className="w-full max-w-[580px]">
          <form id="mouvement-form" onSubmit={handleSubmit} noValidate className="rounded-[12px] border border-border-light bg-card p-8">
            <h2 className="font-dm-sans text-base font-bold text-label">Enregistrement de mouvement</h2>
            <p className="mt-1 font-inter text-[13px] text-subtle">Enregistrez une entrée, sortie ou correction de stock.</p>

            <div className="mt-6 flex flex-col gap-4">
              {/* Type de mouvement */}
              <div className="flex flex-col gap-1.5">
                <label className="font-inter text-xs font-medium text-label">Type de mouvement *</label>
                <div className="flex gap-2.5">
                  {([
                    { id: "entree", label: "Entrée / Réapprovisionnement", icon: "plus", color: "border-success" },
                    { id: "sortie", label: "Sortie / Consommation", icon: "trending-down", color: "border-warning" },
                    { id: "ajustement", label: "Ajustement d'inventaire", icon: "check", color: "border-info" },
                  ] as const).map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setType(t.id)}
                      className={`flex flex-1 flex-col items-center gap-1.5 rounded-[8px] border-2 p-3 font-inter text-[12px] font-medium transition-colors ${
                        type === t.id ? `${t.color} bg-surface text-label` : "border-border bg-card text-subtle"
                      }`}
                    >
                      <Icon name={t.icon} size={18} className={type === t.id ? "text-label" : "text-placeholder"} />
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Article */}
              <div className="flex gap-4">
                <div className="flex flex-1 flex-col gap-1.5">
                  <label className="font-inter text-xs font-medium text-label">Article *</label>
                  <Select value={articleId} onValueChange={(v) => setArticleId(v ?? "")} name="articleId">
                    <SelectTrigger className="h-10 w-full rounded-[6px] border border-border bg-card">
                      <SelectValue placeholder="Sélectionner un article" />
                    </SelectTrigger>
                    <SelectContent>
                      {articles.map((a) => (
                        <SelectItem key={a.id} value={a.id}>
                          {a.nom} — {a.qteActuelle} {a.unite} disponibles
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

              {/* Quantité */}
              <div className="flex gap-4">
                <div className="flex flex-1 flex-col gap-1.5">
                  <label className="font-inter text-xs font-medium text-label">
                    {type === "ajustement" ? "Nouvelle quantité *" : "Quantité *"}
                  </label>
                  <div className="flex h-10 items-center justify-between rounded-[6px] border border-border bg-card px-3 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary">
                    <input
                      type="number"
                      name="quantite"
                      min="0"
                      step="0.01"
                      value={quantite}
                      onChange={(e) => setQuantite(e.target.value)}
                      required
                      className="w-full bg-transparent font-inter text-[13px] text-label focus:outline-none"
                    />
                    <span className="font-inter text-xs text-placeholder">{article?.unite ?? "unité"}</span>
                  </div>
                </div>
                {type === "entree" && (
                  <div className="flex flex-1 flex-col gap-1.5">
                    <label className="font-inter text-xs font-medium text-label">Prix d'achat unitaire (MAD)</label>
                    <input type="number" name="prixUnit" min="0" step="0.01" placeholder="0.00" className="h-10 w-full rounded-[6px] border border-border bg-card px-3 font-inter text-[13px] text-label placeholder:text-placeholder focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
                  </div>
                )}
              </div>

              {/* Preview */}
              {article && qteApres !== null && (
                <div className={`rounded-[8px] p-4 ${qteApres < 0 ? "bg-danger/5 border border-danger/20" : "bg-surface"}`}>
                  <span className="font-inter text-[11px] font-semibold uppercase tracking-wide text-placeholder">Aperçu après mouvement</span>
                  <div className="mt-2 flex gap-8">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-inter text-[11px] text-placeholder">Avant</span>
                      <span className="font-inter text-[13px] font-semibold text-subtle">{article.qteActuelle} {article.unite}</span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="font-inter text-[11px] text-placeholder">Mouvement</span>
                      <span className={`font-inter text-[13px] font-semibold ${type === "entree" ? "text-success" : type === "sortie" ? "text-danger" : "text-info"}`}>
                        {type === "entree" ? "+" : type === "sortie" ? "-" : "→"}{quantite} {article.unite}
                      </span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="font-inter text-[11px] text-placeholder">Après</span>
                      <span className={`font-dm-sans text-lg font-bold ${qteApres < 0 ? "text-danger" : "text-label"}`}>
                        {qteApres.toFixed(2)} {article.unite}
                      </span>
                    </div>
                  </div>
                  {qteApres < 0 && (
                    <p className="mt-1.5 font-inter text-[11px] text-danger">Stock insuffisant pour cette sortie.</p>
                  )}
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <label className="font-inter text-xs font-medium text-label">Motif / Référence</label>
                <input type="text" value={motif} onChange={(e) => setMotif(e.target.value)} placeholder="Ex: Distribution LOT-A · Réf. BL-2026-0041" className="h-10 w-full rounded-[6px] border border-border bg-card px-3 font-inter text-[13px] text-label placeholder:text-placeholder focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-inter text-xs font-medium text-label">Notes</label>
                <textarea name="notes" rows={2} className="w-full resize-none rounded-[6px] border border-border bg-card p-3 font-inter text-[13px] text-label placeholder:text-placeholder focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" placeholder="Observations…" />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2.5">
              <Link href="/stocks" className="flex items-center rounded-[6px] border border-border bg-surface px-4 py-2 font-dm-sans text-[13px] font-semibold text-subtle hover:bg-border-light transition-colors">
                Annuler
              </Link>
              <button type="submit" className="flex items-center gap-1.5 rounded-[6px] bg-primary px-4 py-2 font-dm-sans text-[13px] font-semibold text-white hover:bg-primary-hover transition-colors">
                <Icon name="save" size={14} />
                Enregistrer
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
