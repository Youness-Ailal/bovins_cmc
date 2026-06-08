"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import Icon from "@/components/ui/Icon";
import { useSaveToast } from "@/lib/useSaveToast";
import { useToast } from "@/components/ui/Toast";
import { api } from "@/lib/api";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

// UC-09 — Créer et associer une ration
// Calcul automatique du coût par tête/jour selon les prix en stock.
// TODO: POST /api/rations

interface Ingredient {
  id: string;
  nom: string;
  quantite: string;
  unite: string;
  prixUnit: number;
}

const STOCK_DISPONIBLE = [
  { id: "s1", nom: "Orge", unite: "kg", prixUnit: 2.5 },
  { id: "s2", nom: "Maïs concassé", unite: "kg", prixUnit: 1.8 },
  { id: "s3", nom: "Foin de luzerne", unite: "kg", prixUnit: 1.8 },
  { id: "s4", nom: "Tourteau de soja", unite: "kg", prixUnit: 6.0 },
  { id: "s5", nom: "Minéraux bovins", unite: "kg", prixUnit: 12.0 },
  { id: "s6", nom: "Mélasse", unite: "L", prixUnit: 3.5 },
];

const PHASE_MAP: Record<string, string> = {
  veau: "Veau", croissance: "Croissance", engraissement: "Engraissement", finition: "Finition",
};

export default function NouvelleRationPage() {
  const [nom, setNom] = useState("");
  const [phase, setPhase] = useState("");
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [cible, setCible] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { error: toastError } = useToast();
  const nextId = useRef(1);

  function ajouterIngredient() {
    const s = STOCK_DISPONIBLE[0];
    setIngredients((prev) => [
      ...prev,
      { id: String(nextId.current++), nom: s.nom, quantite: "1.0", unite: s.unite, prixUnit: s.prixUnit },
    ]);
  }

  function updateIngredient(id: string, field: keyof Ingredient, value: string | number) {
    setIngredients((prev) =>
      prev.map((ing) => {
        if (ing.id !== id) return ing;
        if (field === "nom") {
          const s = STOCK_DISPONIBLE.find((x) => x.nom === value);
          return { ...ing, nom: String(value), unite: s?.unite ?? ing.unite, prixUnit: s?.prixUnit ?? ing.prixUnit };
        }
        return { ...ing, [field]: value };
      })
    );
  }

  function supprimerIngredient(id: string) {
    setIngredients((prev) => prev.filter((ing) => ing.id !== id));
  }

  const coutJour = ingredients.reduce(
    (sum, ing) => sum + parseFloat(ing.quantite || "0") * ing.prixUnit,
    0
  );

  const notifySaved = useSaveToast();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nom) return toastError("Le nom de la ration est requis");
    if (ingredients.length === 0) return toastError("Ajoutez au moins un ingrédient");
    setSubmitting(true);
    try {
      await api.post("/rations", {
        nom,
        phase: PHASE_MAP[phase] ?? "",
        cible,
        ingredients: ingredients.map((i) => ({
          nom: i.nom,
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
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-border-light bg-card px-7">
        <div className="flex items-center gap-1.5">
          <Link href="/rations" className="font-inter text-sm text-placeholder hover:text-subtle transition-colors">Rations</Link>
          <span className="font-inter text-sm text-placeholder">/</span>
          <span className="font-dm-sans text-xl font-semibold text-label">Nouvelle ration</span>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/rations" className="flex items-center gap-1.5 rounded-[6px] border border-border-light bg-surface px-3.5 py-2 font-dm-sans text-[13px] font-semibold text-subtle hover:bg-border-light transition-colors">
            Annuler
          </Link>
          <button type="submit" form="ration-form" className="flex items-center gap-1.5 rounded-[6px] bg-primary px-3.5 py-2 font-dm-sans text-[13px] font-semibold text-white hover:bg-primary-hover transition-colors">
            <Icon name="save" size={14} />
            Créer la ration
          </button>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-4 overflow-auto p-6">
        <form id="ration-form" onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          {/* Infos générales */}
          <div className="rounded-[12px] border border-border-light bg-card p-6">
            <span className="font-dm-sans text-sm font-bold text-label">Informations générales</span>
            <div className="mt-4 flex gap-4">
              <div className="flex flex-1 flex-col gap-1.5">
                <label className="font-inter text-xs font-medium text-label">Nom de la ration *</label>
                <input type="text" value={nom} onChange={(e) => setNom(e.target.value)} placeholder="Ex: Ration Finition Charolaise" className="h-10 w-full rounded-[6px] border border-border bg-card px-3 font-inter text-[13px] text-label placeholder:text-placeholder focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>
              <div className="flex w-[220px] flex-col gap-1.5">
                <label className="font-inter text-xs font-medium text-label">Phase cible *</label>
                <Select value={phase} onValueChange={(v) => setPhase(v ?? "")} name="phase">
                  <SelectTrigger className="h-10 w-full rounded-[6px] border border-border bg-card">
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="veau">Veau</SelectItem>
                    <SelectItem value="croissance">Croissance (Jeune)</SelectItem>
                    <SelectItem value="engraissement">Engraissement (Adulte)</SelectItem>
                    <SelectItem value="finition">Finition</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex w-[220px] flex-col gap-1.5">
                <label className="font-inter text-xs font-medium text-label">Associer à</label>
                <Select value={cible} onValueChange={(v) => setCible(v ?? "")} name="cible">
                  <SelectTrigger className="h-10 w-full rounded-[6px] border border-border bg-card">
                    <SelectValue placeholder="Parcelle…" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="parcelle-alpha">Parcelle Alpha</SelectItem>
                    <SelectItem value="parcelle-beta">Parcelle Beta</SelectItem>
                    <SelectItem value="parcelle-gamma">Parcelle Gamma</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Ingrédients */}
          <div className="rounded-[12px] border border-border-light bg-card p-6">
            <span className="font-dm-sans text-sm font-bold text-label">Composition (quantités par tête / jour)</span>

            <div className="mt-4 overflow-hidden rounded-[8px] border border-border-light">
              {/* Header */}
              <div className="flex items-center gap-3 bg-surface px-4" style={{ height: 40 }}>
                <span className="flex-1 font-inter text-[11px] font-bold uppercase tracking-wide text-placeholder">Ingrédient</span>
                <span className="w-[110px] shrink-0 font-inter text-[11px] font-bold uppercase tracking-wide text-placeholder">Quantité/j</span>
                <span className="w-[70px] shrink-0 font-inter text-[11px] font-bold uppercase tracking-wide text-placeholder">Unité</span>
                <span className="w-[110px] shrink-0 font-inter text-[11px] font-bold uppercase tracking-wide text-placeholder">Prix unit.</span>
                <span className="w-[110px] shrink-0 font-inter text-[11px] font-bold uppercase tracking-wide text-placeholder">Coût/j/tête</span>
                <span className="w-8 shrink-0" />
              </div>

              {/* Rows */}
              {ingredients.length === 0 ? (
                <div className="flex items-center justify-center py-6 font-inter text-[13px] text-placeholder">
                  Aucun ingrédient — cliquez sur &quot;Ajouter&quot; pour commencer
                </div>
              ) : (
                ingredients.map((ing) => {
                  const cout = (parseFloat(ing.quantite || "0") * ing.prixUnit).toFixed(2);
                  return (
                    <div key={ing.id} className="flex items-center gap-3 border-t border-border-light px-4" style={{ height: 48 }}>
                      <div className="flex-1">
                        <Select value={ing.nom} onValueChange={(v) => updateIngredient(ing.id, "nom", v ?? "")}>
                          <SelectTrigger className="h-8 w-full rounded-[4px] border border-border bg-surface font-inter text-[13px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {STOCK_DISPONIBLE.map((s) => (
                              <SelectItem key={s.id} value={s.nom}>{s.nom}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={ing.quantite}
                        onChange={(e) => updateIngredient(ing.id, "quantite", e.target.value)}
                        className="w-[110px] shrink-0 rounded-[4px] border border-border bg-surface px-2 py-1 font-inter text-[13px] text-label focus:border-primary focus:outline-none"
                      />
                      <span className="w-[70px] shrink-0 font-inter text-[13px] text-subtle">{ing.unite}</span>
                      <span className="w-[110px] shrink-0 font-inter text-[13px] text-subtle">{ing.prixUnit.toFixed(2)} MAD</span>
                      <span className="w-[110px] shrink-0 font-inter text-[13px] font-semibold text-label">{cout} MAD</span>
                      <button
                        type="button"
                        onClick={() => supprimerIngredient(ing.id)}
                        className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-placeholder hover:text-danger transition-colors"
                      >
                        <Icon name="x" size={14} />
                      </button>
                    </div>
                  );
                })
              )}

              {/* Add row */}
              <button
                type="button"
                onClick={ajouterIngredient}
                className="flex w-full items-center gap-2 border-t border-border-light px-4 py-2.5 font-inter text-[13px] text-primary hover:bg-surface transition-colors"
              >
                <Icon name="plus" size={14} />
                Ajouter un ingrédient
              </button>
            </div>
          </div>

          {/* Coût total */}
          <div className="flex items-center justify-between rounded-[10px] border border-border-light bg-card px-6 py-4">
            <div className="flex gap-8">
              <div className="flex flex-col gap-0.5">
                <span className="font-inter text-[11px] text-placeholder">Coût total / tête / jour</span>
                <span className="font-dm-sans text-2xl font-bold text-primary">{coutJour.toFixed(2)} MAD</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="font-inter text-[11px] text-placeholder">Ingrédients</span>
                <span className="font-dm-sans text-2xl font-bold text-label">{ingredients.length}</span>
              </div>
              {cible && (
                <div className="flex flex-col gap-0.5">
                  <span className="font-inter text-[11px] text-placeholder">Assignée à</span>
                  <span className="font-inter text-[13px] font-semibold text-label">{cible}</span>
                </div>
              )}
            </div>
            <button
              type="submit"
              disabled={ingredients.length === 0}
              className="flex items-center gap-1.5 rounded-[6px] bg-primary px-5 py-2.5 font-dm-sans text-[13px] font-semibold text-white hover:bg-primary-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Icon name="save" size={14} />
              Créer la ration
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
