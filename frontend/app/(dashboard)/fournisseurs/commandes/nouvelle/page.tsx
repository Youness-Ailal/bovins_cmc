"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Icon from "@/components/ui/Icon";
import { api } from "@/lib/api";
import { useApi } from "@/lib/useApi";
import type { Fournisseur, StockArticle } from "@/lib/types";

interface LigneDraft {
  articleId: string;
  articleLabel: string;
  quantite: number;
  prixUnitaire: number;
  unite: string;
}

function NouvelleCommandeForm() {
  const router = useRouter();
  const params = useSearchParams();
  const preFournisseur = params.get("fournisseur") ?? "";
  const preArticle = params.get("article") ?? "";

  const { data: fournisseurs } = useApi<Fournisseur[]>("/fournisseurs");
  const { data: articles } = useApi<StockArticle[]>("/stocks");

  const [fournisseurId, setFournisseurId] = useState(preFournisseur);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState("");
  const [lignes, setLignes] = useState<LigneDraft[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pre-fill article from URL param once articles are loaded
  useEffect(() => {
    if (!preArticle || !articles?.length || lignes.length > 0) return;
    const art = articles.find((a) => a.id === preArticle);
    if (art) {
      setLignes([{ articleId: art.id, articleLabel: art.designation, quantite: 1, prixUnitaire: art.prixUnitaire, unite: art.unite }]);
    }
  }, [preArticle, articles, lignes.length]);

  function addLigne() {
    setLignes((prev) => [...prev, { articleId: "", articleLabel: "", quantite: 1, prixUnitaire: 0, unite: "kg" }]);
  }

  function removeLigne(i: number) {
    setLignes((prev) => prev.filter((_, idx) => idx !== i));
  }

  function updateLigneArticle(i: number, articleId: string) {
    const art = (articles ?? []).find((a) => a.id === articleId);
    setLignes((prev) => prev.map((l, idx) =>
      idx !== i ? l : {
        ...l, articleId,
        articleLabel: art?.designation ?? "",
        unite: art?.unite ?? "kg",
        prixUnitaire: art?.prixUnitaire ?? 0,
      }
    ));
  }

  function updateLigne(i: number, field: "quantite" | "prixUnitaire", value: number) {
    setLignes((prev) => prev.map((l, idx) => idx !== i ? l : { ...l, [field]: value }));
  }

  const montantTotal = lignes.reduce((s, l) => s + l.quantite * l.prixUnitaire, 0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!fournisseurId) { setError("Sélectionnez un fournisseur"); return; }
    if (lignes.length === 0) { setError("Ajoutez au moins un article"); return; }
    if (lignes.some((l) => !l.articleId)) { setError("Chaque ligne doit avoir un article"); return; }
    setSaving(true);
    setError(null);
    try {
      await api.post("/fournisseurs/commandes", {
        fournisseur: fournisseurId,
        date,
        notes,
        lignes: lignes.map((l) => ({ article: l.articleId, quantite: l.quantite, prixUnitaire: l.prixUnitaire })),
      });
      router.push("/fournisseurs/commandes");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur");
      setSaving(false);
    }
  }

  const selectedFournisseur = (fournisseurs ?? []).find((f) => f.id === fournisseurId);

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-surface">
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-border-light bg-card px-7">
        <div className="flex items-center gap-1.5">
          <Link href="/fournisseurs" className="font-inter text-sm text-subtle hover:text-label transition-colors">Fournisseurs</Link>
          <Icon name="chevron-right" size={14} className="text-placeholder" />
          <Link href="/fournisseurs/commandes" className="font-inter text-sm text-subtle hover:text-label transition-colors">Commandes</Link>
          <Icon name="chevron-right" size={14} className="text-placeholder" />
          <span className="font-dm-sans text-xl font-semibold text-label">Nouvelle commande</span>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/fournisseurs/commandes" className="flex items-center gap-1.5 rounded-[6px] border border-border-light bg-surface px-3.5 py-2 font-dm-sans text-[13px] font-semibold text-subtle hover:bg-border-light transition-colors">
            Annuler
          </Link>
          <button
            type="submit" form="commande-form" disabled={saving}
            className="flex items-center gap-1.5 rounded-[6px] bg-primary px-3.5 py-2 font-dm-sans text-[13px] font-semibold text-white hover:bg-primary/90 disabled:opacity-60 transition-colors"
          >
            <Icon name="package-check" size={14} />
            {saving ? "Enregistrement…" : "Réapprovisionner"}
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-auto p-6">
        <form id="commande-form" onSubmit={handleSubmit} className="w-full max-w-2xl flex flex-col gap-5">
          {error && (
            <div className="flex items-center gap-2 rounded-[8px] border border-danger/30 bg-danger/5 px-4 py-3">
              <Icon name="alert-circle" size={15} className="text-danger" />
              <span className="font-inter text-[13px] text-danger">{error}</span>
            </div>
          )}

          {/* Fournisseur + Date */}
          <div className="flex flex-col gap-4 rounded-[12px] border border-border-light bg-card p-5">
            <span className="font-dm-sans text-[15px] font-semibold text-label">Informations</span>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="font-inter text-[12px] font-medium text-subtle">Fournisseur *</label>
                <select
                  value={fournisseurId} onChange={(e) => setFournisseurId(e.target.value)}
                  className="h-10 rounded-[6px] border border-border-light bg-surface px-3 font-inter text-[13px] text-label focus:border-primary focus:outline-none"
                >
                  <option value="">Sélectionner…</option>
                  {(fournisseurs ?? []).map((f) => <option key={f.id} value={f.id}>{f.nom} ({f.type})</option>)}
                </select>
                {selectedFournisseur && (
                  <span className="font-inter text-[11px] text-subtle">{selectedFournisseur.region} · {selectedFournisseur.contact}</span>
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-inter text-[12px] font-medium text-subtle">Date de réception</label>
                <input
                  type="date" value={date} onChange={(e) => setDate(e.target.value)}
                  className="h-10 rounded-[6px] border border-border-light bg-surface px-3 font-inter text-[13px] text-label focus:border-primary focus:outline-none"
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-inter text-[12px] font-medium text-subtle">Notes / Référence BL</label>
              <input
                type="text" value={notes} onChange={(e) => setNotes(e.target.value)}
                placeholder="Référence bon de livraison, conditions…"
                className="h-10 rounded-[6px] border border-border-light bg-surface px-3 font-inter text-[13px] text-label placeholder:text-placeholder focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          {/* Lignes */}
          <div className="flex flex-col gap-3 rounded-[12px] border border-border-light bg-card p-5">
            <div className="flex items-center justify-between">
              <span className="font-dm-sans text-[15px] font-semibold text-label">Articles</span>
              <button
                type="button" onClick={addLigne}
                className="flex items-center gap-1.5 rounded-[6px] border border-border-light bg-surface px-3 py-1.5 font-inter text-[12px] font-medium text-subtle hover:bg-border-light transition-colors"
              >
                <Icon name="plus" size={13} />
                Ajouter ligne
              </button>
            </div>

            {lignes.length === 0 ? (
              <div
                onClick={addLigne}
                className="flex cursor-pointer flex-col items-center gap-2 rounded-[8px] border-2 border-dashed border-border-light py-8 hover:border-primary/40 hover:bg-primary/5 transition-colors"
              >
                <Icon name="package-plus" size={24} className="text-placeholder" />
                <span className="font-inter text-[13px] text-placeholder">Cliquez pour ajouter des articles</span>
              </div>
            ) : (
              <>
                {/* Column headers */}
                <div className="grid grid-cols-[1fr_90px_110px_90px_24px] gap-2 pb-1">
                  {["Article", "Quantité", "Prix unit. (MAD)", "Sous-total", ""].map((h) => (
                    <span key={h} className="font-inter text-[10px] font-semibold uppercase tracking-wide text-placeholder">{h}</span>
                  ))}
                </div>

                {lignes.map((ligne, i) => (
                  <div key={i} className="grid grid-cols-[1fr_90px_110px_90px_24px] items-center gap-2 border-t border-border-light pt-2">
                    <select
                      value={ligne.articleId} onChange={(e) => updateLigneArticle(i, e.target.value)}
                      className="h-9 rounded-[6px] border border-border-light bg-surface px-2 font-inter text-[12px] text-label focus:border-primary focus:outline-none"
                    >
                      <option value="">Choisir…</option>
                      {(articles ?? []).map((a) => <option key={a.id} value={a.id}>{a.designation}</option>)}
                    </select>
                    <div className="flex h-9 items-center gap-1 rounded-[6px] border border-border-light bg-surface px-2">
                      <input
                        type="number" min="0" step="0.01" value={ligne.quantite}
                        onChange={(e) => updateLigne(i, "quantite", Number(e.target.value))}
                        className="w-full bg-transparent font-inter text-[12px] text-label focus:outline-none"
                      />
                      <span className="font-inter text-[10px] text-placeholder">{ligne.unite}</span>
                    </div>
                    <input
                      type="number" min="0" step="0.01" value={ligne.prixUnitaire}
                      onChange={(e) => updateLigne(i, "prixUnitaire", Number(e.target.value))}
                      className="h-9 rounded-[6px] border border-border-light bg-surface px-2 font-inter text-[12px] text-label focus:border-primary focus:outline-none"
                    />
                    <span className="font-dm-sans text-[12px] font-semibold text-label text-right">
                      {(ligne.quantite * ligne.prixUnitaire).toLocaleString("fr-FR")}
                    </span>
                    <button type="button" onClick={() => removeLigne(i)} className="text-placeholder hover:text-danger transition-colors">
                      <Icon name="x" size={14} />
                    </button>
                  </div>
                ))}

                {/* Total */}
                <div className="flex items-center justify-between border-t border-border-light pt-3 mt-1">
                  <span className="font-dm-sans text-[14px] font-semibold text-label">Total</span>
                  <span className="font-dm-sans text-[20px] font-bold text-label">
                    {montantTotal.toLocaleString("fr-FR")} MAD
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Impact note */}
          <div className="flex items-start gap-2 rounded-[8px] bg-surface px-4 py-3">
            <Icon name="info" size={14} className="mt-0.5 shrink-0 text-primary" />
            <p className="font-inter text-[12px] text-subtle">
              Les quantités commandées seront <strong>ajoutées immédiatement</strong> aux niveaux de stock de chaque article.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function NouvelleCommandePage() {
  return (
    <Suspense>
      <NouvelleCommandeForm />
    </Suspense>
  );
}
