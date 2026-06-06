"use client";

import { useState } from "react";
import Link from "next/link";
import Icon from "@/components/ui/Icon";
import { useSaveToast } from "@/lib/useSaveToast";
import { useToast } from "@/components/ui/Toast";
import { api } from "@/lib/api";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

function FormField({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="font-inter text-xs font-medium text-label">{label}</label>
      {children}
      {hint && <span className="font-inter text-[11px] text-placeholder">{hint}</span>}
    </div>
  );
}

const inputCls = "h-10 w-full rounded-[6px] border border-border bg-card px-3 font-inter text-[13px] text-label placeholder:text-placeholder transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary";

const CAT_MAP: Record<string, string> = {
  cereales: "Céréales", fourrages: "Fourrages", concentres: "Concentrés",
  complements: "Compléments", additifs: "Additifs", medicaments: "Médicaments",
};

export default function NouvelArticlePage() {
  const [unite, setUnite] = useState("kg");
  const [categorie, setCategorie] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const notifySaved = useSaveToast();
  const { error: toastError } = useToast();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget as HTMLFormElement);
    const designation = String(fd.get("designation") || "").trim();
    if (!designation) return toastError("La désignation est requise");
    if (!categorie) return toastError("La catégorie est requise");
    setSubmitting(true);
    try {
      await api.post("/stocks", {
        designation,
        reference: String(fd.get("reference") || ""),
        categorie: CAT_MAP[categorie],
        unite,
        quantite: Number(fd.get("quantite")) || 0,
        seuil: Number(fd.get("seuil")) || 0,
        prixUnitaire: Number(fd.get("prixUnitaire")) || 0,
        datePeremption: fd.get("datePeremption") || null,
        fournisseur: String(fd.get("fournisseur") || ""),
        notes: String(fd.get("notes") || ""),
      });
      notifySaved("Article ajouté au stock", "/stocks");
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
          <span className="font-dm-sans text-xl font-semibold text-label">Formulaire article</span>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/stocks" className="flex items-center gap-1.5 rounded-[6px] border border-border-light bg-surface px-3.5 py-2 font-dm-sans text-[13px] font-semibold text-subtle hover:bg-border-light transition-colors">
            Annuler
          </Link>
          <button type="submit" form="article-form" className="flex items-center gap-1.5 rounded-[6px] bg-primary px-3.5 py-2 font-dm-sans text-[13px] font-semibold text-white hover:bg-primary-hover transition-colors">
            <Icon name="save" size={14} />
            Enregistrer
          </button>
        </div>
      </header>

      <div className="flex flex-1 items-start justify-center overflow-auto p-8">
        <div className="w-full max-w-[640px]">
          <form id="article-form" onSubmit={handleSubmit} noValidate className="rounded-[12px] border border-border-light bg-card p-8">
            <h2 className="font-dm-sans text-base font-bold text-label">Informations de l&apos;article</h2>
            <p className="mt-1 font-inter text-[13px] text-subtle">Remplissez les champs pour créer un nouvel article de stock.</p>

            <div className="mt-6 flex flex-col gap-4">
              <div className="flex gap-4">
                <FormField label="Désignation *">
                  <input type="text" name="designation" placeholder="Ex: Orge" required className={inputCls} />
                </FormField>
                <FormField label="Référence interne">
                  <input type="text" name="reference" placeholder="Ex: STK-006" className={inputCls} />
                </FormField>
              </div>

              <div className="flex gap-4">
                <FormField label="Catégorie *">
                  <Select value={categorie} onValueChange={(v) => setCategorie(v ?? "")}>
                    <SelectTrigger className="h-10 w-full rounded-[6px] border border-border bg-card">
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cereales">Céréales</SelectItem>
                      <SelectItem value="fourrages">Fourrages</SelectItem>
                      <SelectItem value="concentres">Concentrés</SelectItem>
                      <SelectItem value="complements">Compléments</SelectItem>
                      <SelectItem value="additifs">Additifs</SelectItem>
                      <SelectItem value="medicaments">Médicaments</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>
                <FormField label="Unité de mesure *">
                  <Select value={unite} onValueChange={(v) => setUnite(v ?? "")} name="unite">
                    <SelectTrigger className="h-10 w-full rounded-[6px] border border-border bg-card">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kg">kg</SelectItem>
                      <SelectItem value="L">L</SelectItem>
                      <SelectItem value="unites">Unités</SelectItem>
                      <SelectItem value="sacs">Sacs</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>
              </div>

              <div className="flex gap-4">
                <FormField label={`Quantité initiale (${unite}) *`} hint="Quantité disponible au moment de la création">
                  <div className="flex h-10 items-center justify-between rounded-[6px] border border-border bg-card px-3 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary">
                    <input type="number" name="quantite" min="0" step="0.01" defaultValue="0" className="w-full bg-transparent font-inter text-[13px] text-label focus:outline-none" />
                    <span className="font-inter text-xs text-placeholder">{unite}</span>
                  </div>
                </FormField>
                <FormField label={`Seuil d'alerte (${unite}) *`} hint="En dessous de ce seuil, une alerte sera déclenchée">
                  <div className="flex h-10 items-center justify-between rounded-[6px] border border-border bg-card px-3 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary">
                    <input type="number" name="seuil" min="0" step="0.01" defaultValue="0" className="w-full bg-transparent font-inter text-[13px] text-label focus:outline-none" />
                    <span className="font-inter text-xs text-placeholder">{unite}</span>
                  </div>
                </FormField>
              </div>

              <div className="flex gap-4">
                <FormField label={`Prix unitaire (MAD/${unite})`}>
                  <input type="number" name="prixUnitaire" min="0" step="0.01" placeholder="0.00" className={inputCls} />
                </FormField>
                <FormField label="Date péremption (optionnel)">
                  <input type="date" name="datePeremption" className={inputCls} />
                </FormField>
              </div>

              <FormField label="Fournisseur">
                <input type="text" name="fournisseur" placeholder="Nom du fournisseur…" className={inputCls} />
              </FormField>

              <FormField label="Notes">
                <textarea name="notes" rows={3} className="w-full resize-none rounded-[6px] border border-border bg-card p-3 font-inter text-[13px] text-label placeholder:text-placeholder focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" placeholder="Observations…" />
              </FormField>
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
