"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import Icon from "@/components/ui/Icon";
import { useSaveToast } from "@/lib/useSaveToast";
import { useToast } from "@/components/ui/Toast";
import { useApi } from "@/lib/useApi";
import { api } from "@/lib/api";
import type { StockArticle, Parcelle } from "@/lib/types";

const PHASE_OPTS = [
  { value: "Veau",          bg: "bg-info/10",    text: "text-info",    sel: "bg-info text-white" },
  { value: "Croissance",    bg: "bg-primary/10", text: "text-primary", sel: "bg-primary text-white" },
  { value: "Engraissement", bg: "bg-warning/10", text: "text-warning", sel: "bg-warning text-white" },
  { value: "Finition",      bg: "bg-success/10", text: "text-success", sel: "bg-success text-white" },
];

interface IngRow {
  id: string;
  articleId: string;
  nom: string;
  quantite: string;
  unite: string;
  prixUnit: number;
}

export default function NouvelleRationPage() {
  const { data: articles } = useApi<StockArticle[]>("/stocks");
  const { data: parcelles } = useApi<Parcelle[]>("/parcelles");
  const { error: toastError } = useToast();
  const notifySaved = useSaveToast();
  const nextId = useRef(1);

  const [nom, setNom] = useState("");
  const [phase, setPhase] = useState("Croissance");
  const [cible, setCible] = useState("");
  const [notes, setNotes] = useState("");
  const [ingredients, setIngredients] = useState<IngRow[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const stockList = (articles ?? []).filter((a) => a.categorie !== "Médicaments");

  function addRow() {
    const first = stockList[0];
    setIngredients((prev) => [
      ...prev,
      {
        id: String(nextId.current++),
        articleId: first?.id ?? "",
        nom: first?.designation ?? "",
        quantite: "1.0",
        unite: first?.unite ?? "kg",
        prixUnit: first?.prixUnitaire ?? 0,
      },
    ]);
  }

  function selectArticle(rowId: string, articleId: string) {
    const art = stockList.find((a) => a.id === articleId);
    setIngredients((prev) =>
      prev.map((ing) =>
        ing.id !== rowId
          ? ing
          : { ...ing, articleId, nom: art?.designation ?? "", unite: art?.unite ?? "kg", prixUnit: art?.prixUnitaire ?? 0 }
      )
    );
  }

  function updateQty(rowId: string, value: string) {
    setIngredients((prev) => prev.map((ing) => ing.id !== rowId ? ing : { ...ing, quantite: value }));
  }

  function removeRow(rowId: string) {
    setIngredients((prev) => prev.filter((ing) => ing.id !== rowId));
  }

  const coutJour = ingredients.reduce((s, i) => s + parseFloat(i.quantite || "0") * i.prixUnit, 0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nom.trim()) return toastError("Le nom de la ration est requis");
    if (ingredients.length === 0) return toastError("Ajoutez au moins un ingrédient");
    setSubmitting(true);
    try {
      await api.post("/rations", {
        nom,
        phase,
        cible,
        notes,
        ingredients: ingredients.map((i) => ({
          nom: i.nom,
          article: i.articleId || null,
          quantite: Number(i.quantite) || 0,
          unite: i.unite,
          prixUnitaire: i.prixUnit,
        })),
      });
      notifySaved("Ration créée avec succès", "/rations");
    } catch (err) {
      toastError(err instanceof Error ? err.message : "Erreur");
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-surface">
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-border-light bg-card px-7">
        <div className="flex items-center gap-1.5">
          <Link href="/rations" className="font-inter text-sm text-subtle hover:text-label transition-colors">Rations</Link>
          <Icon name="chevron-right" size={14} className="text-placeholder" />
          <span className="font-dm-sans text-[15px] font-semibold text-label">Nouvelle ration</span>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/rations" className="flex items-center gap-1.5 rounded-[6px] border border-border-light bg-surface px-3.5 py-2 font-dm-sans text-[13px] font-semibold text-subtle hover:bg-border-light transition-colors">
            Annuler
          </Link>
          <button
            type="submit" form="ration-form" disabled={submitting || ingredients.length === 0}
            className="flex items-center gap-1.5 rounded-[6px] bg-primary px-3.5 py-2 font-dm-sans text-[13px] font-semibold text-white hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            <Icon name="save" size={14} />
            {submitting ? "Création…" : "Créer la ration"}
          </button>
        </div>
      </header>

      <form id="ration-form" onSubmit={handleSubmit} noValidate className="flex flex-1 flex-col gap-4 overflow-auto p-6">
        {/* General info */}
        <div className="rounded-[12px] border border-border-light bg-card p-5">
          <h2 className="font-dm-sans text-[14px] font-semibold text-label">Informations générales</h2>
          <div className="mt-4 flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="font-inter text-[12px] font-medium text-subtle">Nom de la ration *</label>
                <input
                  type="text" value={nom} onChange={(e) => setNom(e.target.value)}
                  placeholder="Ex: Ration Finition Charolaise"
                  className="h-10 rounded-[6px] border border-border-light bg-surface px-3 font-inter text-[13px] text-label placeholder:text-placeholder focus:border-primary focus:outline-none"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-inter text-[12px] font-medium text-subtle">Parcelle associée</label>
                <select
                  value={cible} onChange={(e) => setCible(e.target.value)}
                  className="h-10 rounded-[6px] border border-border-light bg-surface px-3 font-inter text-[13px] text-label focus:border-primary focus:outline-none"
                >
                  <option value="">— Aucune —</option>
                  {(parcelles ?? []).map((p) => <option key={p.id} value={p.nom}>{p.nom}</option>)}
                </select>
              </div>
            </div>

            {/* Phase chips */}
            <div className="flex flex-col gap-1.5">
              <label className="font-inter text-[12px] font-medium text-subtle">Phase cible *</label>
              <div className="flex gap-2">
                {PHASE_OPTS.map((opt) => (
                  <button
                    key={opt.value} type="button" onClick={() => setPhase(opt.value)}
                    className={`flex-1 rounded-[8px] px-4 py-2.5 font-dm-sans text-[13px] font-semibold transition-all ${
                      phase === opt.value ? opt.sel : `${opt.bg} ${opt.text} hover:opacity-80`
                    }`}
                  >
                    {opt.value}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-inter text-[12px] font-medium text-subtle">Notes</label>
              <input
                type="text" value={notes} onChange={(e) => setNotes(e.target.value)}
                placeholder="Observations, objectifs nutritionnels…"
                className="h-10 rounded-[6px] border border-border-light bg-surface px-3 font-inter text-[13px] text-label placeholder:text-placeholder focus:border-primary focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Ingredients */}
        <div className="rounded-[12px] border border-border-light bg-card p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-dm-sans text-[14px] font-semibold text-label">Composition du lot</h2>
              <p className="mt-0.5 font-inter text-[12px] text-subtle">Quantités totales pour le lot (pas par tête)</p>
            </div>
            <button
              type="button" onClick={addRow}
              className="flex items-center gap-1.5 rounded-[6px] border border-border-light bg-surface px-3 py-1.5 font-inter text-[12px] font-medium text-subtle hover:bg-border-light transition-colors"
            >
              <Icon name="plus" size={13} />
              Ajouter un ingrédient
            </button>
          </div>

          {ingredients.length === 0 ? (
            <div
              onClick={addRow}
              className="mt-4 flex cursor-pointer flex-col items-center gap-2 rounded-[8px] border-2 border-dashed border-border-light py-10 hover:border-primary/40 hover:bg-primary/5 transition-colors"
            >
              <Icon name="wheat" size={26} className="text-placeholder" />
              <p className="font-inter text-[13px] text-placeholder">Cliquez pour ajouter des ingrédients</p>
            </div>
          ) : (
            <div className="mt-4">
              {/* Column headers */}
              <div className="grid grid-cols-[1fr_100px_70px_100px_90px_28px] gap-2 border-b border-border-light pb-2">
                {["Ingrédient", "Quantité totale", "Unité", "Prix unit.", "Coût", ""].map((h) => (
                  <span key={h} className="font-inter text-[10px] font-semibold uppercase tracking-wide text-placeholder">{h}</span>
                ))}
              </div>

              {ingredients.map((ing) => {
                const cout = parseFloat(ing.quantite || "0") * ing.prixUnit;
                return (
                  <div key={ing.id} className="grid grid-cols-[1fr_100px_70px_100px_90px_28px] items-center gap-2 border-b border-border-light py-2.5 last:border-b-0">
                    <select
                      value={ing.articleId}
                      onChange={(e) => selectArticle(ing.id, e.target.value)}
                      className="h-9 rounded-[6px] border border-border-light bg-surface px-2 font-inter text-[12px] text-label focus:border-primary focus:outline-none"
                    >
                      {stockList.length === 0 && <option value="">Chargement…</option>}
                      {stockList.map((a) => <option key={a.id} value={a.id}>{a.designation}</option>)}
                    </select>
                    <div className="flex h-9 items-center gap-1 rounded-[6px] border border-border-light bg-surface px-2">
                      <input
                        type="number" min="0" step="0.1" value={ing.quantite}
                        onChange={(e) => updateQty(ing.id, e.target.value)}
                        className="w-full bg-transparent font-inter text-[12px] text-label focus:outline-none"
                      />
                    </div>
                    <span className="font-inter text-[12px] text-subtle">{ing.unite}</span>
                    <span className="font-inter text-[12px] text-subtle">{ing.prixUnit.toFixed(2)} MAD</span>
                    <span className={`font-dm-sans text-[13px] font-semibold ${cout > 0 ? "text-label" : "text-placeholder"}`}>
                      {cout.toFixed(2)} MAD
                    </span>
                    <button type="button" onClick={() => removeRow(ing.id)} className="text-placeholder hover:text-danger transition-colors">
                      <Icon name="x" size={14} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Cost summary bar */}
        {ingredients.length > 0 && (
          <div className="rounded-[12px] border border-primary/20 bg-primary/5 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-8">
                <div className="flex flex-col gap-0.5">
                  <span className="font-inter text-[11px] text-subtle">Coût total du lot</span>
                  <span className="font-dm-sans text-[28px] font-bold leading-none text-primary">{coutJour.toFixed(2)} <span className="text-[14px] font-normal text-subtle">MAD</span></span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="font-inter text-[11px] text-subtle">Ingrédients</span>
                  <span className="font-dm-sans text-[20px] font-bold leading-none text-label">{ingredients.length}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="font-inter text-[11px] text-subtle">Phase</span>
                  <span className="font-dm-sans text-[14px] font-bold text-label">{phase}</span>
                </div>
                {/* Ingredient cost breakdown */}
                <div className="flex flex-col gap-1">
                  <span className="font-inter text-[11px] text-subtle">Répartition</span>
                  <div className="flex h-2 w-40 overflow-hidden rounded-full bg-border-light">
                    {ingredients.map((ing, idx) => {
                      const cout = parseFloat(ing.quantite || "0") * ing.prixUnit;
                      const pct = coutJour > 0 ? (cout / coutJour) * 100 : 0;
                      const colors = ["bg-primary", "bg-warning", "bg-info", "bg-success", "bg-danger"];
                      return <div key={ing.id} className={colors[idx % colors.length]} style={{ width: `${pct}%` }} />;
                    })}
                  </div>
                </div>
              </div>
              <button
                type="submit" disabled={submitting}
                className="flex items-center gap-1.5 rounded-[6px] bg-primary px-5 py-2.5 font-dm-sans text-[13px] font-semibold text-white hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                <Icon name="save" size={14} />
                {submitting ? "Création…" : "Créer la ration"}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
