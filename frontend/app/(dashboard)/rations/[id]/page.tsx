"use client";

import { use, useRef, useState } from "react";
import Link from "next/link";
import Icon from "@/components/ui/Icon";
import Badge from "@/components/ui/Badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useSaveToast } from "@/lib/useSaveToast";

interface Ingredient {
  id: string;
  nom: string;
  quantite: string;
  unite: string;
  coutUnit: number;
}

const STOCK_DISPONIBLE = [
  { nom: "Orge", unite: "kg", coutUnit: 2.5 },
  { nom: "Maïs concassé", unite: "kg", coutUnit: 1.8 },
  { nom: "Foin de luzerne", unite: "kg", coutUnit: 1.8 },
  { nom: "Tourteau de soja", unite: "kg", coutUnit: 6.0 },
  { nom: "Minéraux bovins", unite: "kg", coutUnit: 12.0 },
  { nom: "Mélasse", unite: "L", coutUnit: 3.5 },
];

const INITIAL: Ingredient[] = [
  { id: "1", nom: "Orge", quantite: "5.0", unite: "kg", coutUnit: 2.5 },
  { id: "2", nom: "Foin de luzerne", quantite: "3.0", unite: "kg", coutUnit: 1.8 },
  { id: "3", nom: "Tourteau de soja", quantite: "0.5", unite: "kg", coutUnit: 6.0 },
];

const PHASE_BADGE: Record<string, { variant: string; label: string }> = {
  croissance: { variant: "phase-croissance", label: "Croissance" },
  engraissement: { variant: "phase-engraissement", label: "Engraissement" },
  finition: { variant: "phase-finition", label: "Finition" },
};

export default function FicheRationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [phase, setPhase] = useState("engraissement");
  const [ingredients, setIngredients] = useState<Ingredient[]>(INITIAL);
  const nextId = useRef(100);
  const notifySaved = useSaveToast();

  function updateIngredient(rowId: string, field: keyof Ingredient, value: string) {
    setIngredients((prev) =>
      prev.map((ing) => {
        if (ing.id !== rowId) return ing;
        if (field === "nom") {
          const s = STOCK_DISPONIBLE.find((x) => x.nom === value);
          return { ...ing, nom: value, unite: s?.unite ?? ing.unite, coutUnit: s?.coutUnit ?? ing.coutUnit };
        }
        return { ...ing, [field]: value };
      })
    );
  }

  function addIngredient() {
    const s = STOCK_DISPONIBLE[0];
    setIngredients((prev) => [
      ...prev,
      { id: String(nextId.current++), nom: s.nom, quantite: "1.0", unite: s.unite, coutUnit: s.coutUnit },
    ]);
  }

  function removeIngredient(rowId: string) {
    setIngredients((prev) => prev.filter((ing) => ing.id !== rowId));
  }

  const total = ingredients
    .reduce((s, i) => s + parseFloat(i.quantite || "0") * i.coutUnit, 0)
    .toFixed(2);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // TODO: PUT /api/rations/:id { nom, phase, ingredients }
    notifySaved("Ration enregistrée avec succès", "/rations");
  }

  const badge = PHASE_BADGE[phase];

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-surface">
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-border-light bg-card px-7">
        <div className="flex items-center gap-1.5">
          <Link href="/rations" className="font-inter text-sm text-placeholder hover:text-subtle transition-colors">Rations</Link>
          <span className="font-inter text-sm text-placeholder">/</span>
          <span className="font-dm-sans text-xl font-semibold text-label">Fiche Ration</span>
          <span className="font-inter text-sm text-placeholder">/ {id}</span>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/rations" className="flex items-center gap-1.5 rounded-[6px] border border-border-light bg-surface px-3.5 py-2 font-dm-sans text-[13px] font-semibold text-subtle hover:bg-border-light transition-colors">
            Annuler
          </Link>
          <button type="submit" form="ration-edit-form" className="flex items-center gap-1.5 rounded-[6px] bg-primary px-3.5 py-2 font-dm-sans text-[13px] font-semibold text-white hover:bg-primary-hover transition-colors">
            <Icon name="save" size={14} />
            Enregistrer
          </button>
        </div>
      </header>

      <form id="ration-edit-form" onSubmit={handleSubmit} noValidate className="flex flex-1 flex-col gap-5 overflow-auto p-6">
        {/* Name + Phase */}
        <div className="flex gap-4">
          <div className="flex flex-1 flex-col gap-1.5">
            <label className="font-inter text-xs font-medium text-label">Nom de la ration *</label>
            <input type="text" name="nom" defaultValue="Ration Bovins Adultes" required className="h-10 w-full rounded-[6px] border border-border bg-card px-3 font-inter text-[13px] text-label focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
          </div>
          <div className="flex w-[280px] flex-col gap-1.5">
            <label className="font-inter text-xs font-medium text-label">Phase cible *</label>
            <Select value={phase} onValueChange={(v) => setPhase(v ?? "")}>
              <SelectTrigger className="h-10 w-full rounded-[6px] border border-border bg-card">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="croissance">Croissance</SelectItem>
                <SelectItem value="engraissement">Engraissement</SelectItem>
                <SelectItem value="finition">Finition</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Ingredients table */}
        <div className="flex flex-col gap-3">
          <span className="font-dm-sans text-sm font-bold text-label">Ingrédients</span>
          <div className="overflow-hidden rounded-[10px] border border-border-light bg-card">
            {/* Header */}
            <div className="flex items-center gap-4 bg-surface px-5" style={{ height: 44 }}>
              <span className="flex-1 font-inter text-[11px] font-bold uppercase tracking-wide text-placeholder">Ingrédient</span>
              <span className="w-[110px] font-inter text-[11px] font-bold uppercase tracking-wide text-placeholder">Quantité/j</span>
              <span className="w-[80px] font-inter text-[11px] font-bold uppercase tracking-wide text-placeholder">Unité</span>
              <span className="w-[110px] font-inter text-[11px] font-bold uppercase tracking-wide text-placeholder">Coût unit.</span>
              <span className="w-[110px] font-inter text-[11px] font-bold uppercase tracking-wide text-placeholder">Coût total</span>
              <span className="w-8" />
            </div>

            {ingredients.map((ing) => {
              const cout = (parseFloat(ing.quantite || "0") * ing.coutUnit).toFixed(2);
              return (
                <div key={ing.id} className="flex items-center gap-4 border-b border-border-light px-5" style={{ height: 52 }}>
                  <div className="flex-1">
                    <Select value={ing.nom} onValueChange={(v) => updateIngredient(ing.id, "nom", v ?? "")}>
                      <SelectTrigger className="h-8 w-full rounded-[4px] border border-border bg-surface font-inter text-[13px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STOCK_DISPONIBLE.map((s) => (
                          <SelectItem key={s.nom} value={s.nom}>{s.nom}</SelectItem>
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
                    className="w-[110px] rounded-[4px] border border-border bg-surface px-2 py-1 font-inter text-[13px] text-label focus:border-primary focus:outline-none"
                  />
                  <span className="w-[80px] font-inter text-[13px] text-subtle">{ing.unite}</span>
                  <span className="w-[110px] font-inter text-[13px] text-subtle">{ing.coutUnit.toFixed(2)} MAD</span>
                  <span className="w-[110px] font-inter text-[13px] font-semibold text-label">{cout} MAD</span>
                  <button type="button" onClick={() => removeIngredient(ing.id)} className="flex h-6 w-6 items-center justify-center text-placeholder hover:text-danger transition-colors">
                    <Icon name="x" size={14} />
                  </button>
                </div>
              );
            })}

            {/* Add row */}
            <button type="button" onClick={addIngredient} className="flex w-full items-center gap-2 px-5 py-3 font-inter text-[13px] text-primary hover:bg-surface transition-colors">
              <Icon name="plus" size={14} />
              Ajouter un ingrédient
            </button>
          </div>
        </div>

        {/* Footer costs + actions */}
        <div className="flex items-center justify-between rounded-[10px] border border-border-light bg-card px-6 py-4">
          <div className="flex gap-8">
            <div className="flex flex-col gap-0.5">
              <span className="font-inter text-[11px] text-placeholder">Coût total / animal / jour</span>
              <span className="font-dm-sans text-lg font-bold text-primary">{total} MAD</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="font-inter text-[11px] text-placeholder">Phase</span>
              <Badge variant={badge.variant as Parameters<typeof Badge>[0]["variant"]}>{badge.label}</Badge>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="font-inter text-[11px] text-placeholder">Ingrédients</span>
              <span className="font-dm-sans text-lg font-bold text-label">{ingredients.length}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/rations/distribution" className="flex items-center gap-1.5 rounded-[6px] border border-primary px-4 py-2 font-dm-sans text-[13px] font-semibold text-primary hover:bg-primary-light transition-colors">
              <Icon name="utensils" size={14} />
              Distribuer
            </Link>
            <button type="submit" className="flex items-center gap-1.5 rounded-[6px] bg-primary px-4 py-2 font-dm-sans text-[13px] font-semibold text-white hover:bg-primary-hover transition-colors">
              <Icon name="save" size={14} />
              Enregistrer la ration
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
