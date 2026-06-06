"use client";

import { useState } from "react";
import Link from "next/link";
import Icon from "@/components/ui/Icon";
import { useSaveToast } from "@/lib/useSaveToast";
import { useToast } from "@/components/ui/Toast";
import { api } from "@/lib/api";

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

export default function NouvelleRacePage() {
  const notifySaved = useSaveToast();
  const { error: toastError } = useToast();
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget as HTMLFormElement);
    const nom = String(fd.get("nom") || "").trim();
    if (!nom) return toastError("Le nom de la race est requis");
    setSubmitting(true);
    try {
      await api.post("/races", {
        nom,
        origine: String(fd.get("origine") || ""),
        poidsAdulte: Number(fd.get("poidsAdulte")) || 0,
        gmqCible: Number(fd.get("gmqCible")) || 0,
        icCible: Number(fd.get("ic")) || 0,
        dureeEngraissement: Number(fd.get("dureeEngraissement")) || 0,
        poidsAbattage: Number(fd.get("poidsAbattage")) || 0,
        description: String(fd.get("description") || ""),
      });
      notifySaved("Race créée avec succès", "/administration/races");
    } catch (err) {
      toastError(err instanceof Error ? err.message : "Erreur");
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-surface">
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-border-light bg-card px-7">
        <div className="flex items-center gap-1.5">
          <Link href="/administration/races" className="font-inter text-sm text-placeholder hover:text-subtle transition-colors">Races</Link>
          <span className="font-inter text-sm text-placeholder">/</span>
          <span className="font-dm-sans text-xl font-semibold text-label">Nouvelle race</span>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/administration/races" className="flex items-center gap-1.5 rounded-[6px] border border-border-light bg-surface px-3.5 py-2 font-dm-sans text-[13px] font-semibold text-subtle hover:bg-border-light transition-colors">
            Annuler
          </Link>
          <button type="submit" form="race-form" className="flex items-center gap-1.5 rounded-[6px] bg-primary px-3.5 py-2 font-dm-sans text-[13px] font-semibold text-white hover:bg-primary-hover transition-colors">
            <Icon name="save" size={14} />
            Enregistrer
          </button>
        </div>
      </header>

      <div className="flex flex-1 items-start justify-center overflow-auto p-8">
        <div className="w-full max-w-[560px]">
          <form id="race-form" onSubmit={handleSubmit} noValidate className="rounded-[12px] border border-border-light bg-card p-8">
            <h2 className="font-dm-sans text-base font-bold text-label">Nouvelle race</h2>
            <p className="mt-1 font-inter text-[13px] text-subtle">Définissez les paramètres zootechniques de la race.</p>

            <div className="mt-6 flex flex-col gap-4">
              <div className="flex gap-4">
                <FormField label="Nom de la race *"><input type="text" name="nom" placeholder="Ex: Holstein" required className={inputCls} /></FormField>
                <FormField label="Origine"><input type="text" name="origine" placeholder="Ex: Europe du Nord" className={inputCls} /></FormField>
              </div>
              <div className="flex gap-4">
                <FormField label="Poids adulte moyen (kg)" hint="Référence pour le suivi de croissance">
                  <div className="flex h-10 items-center justify-between rounded-[6px] border border-border bg-card px-3 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary">
                    <input type="number" name="poidsAdulte" min="0" placeholder="0" className="w-full bg-transparent font-inter text-[13px] text-label focus:outline-none" />
                    <span className="font-inter text-xs text-placeholder">kg</span>
                  </div>
                </FormField>
                <FormField label="GMQ cible (kg/j)" hint="Gain Moyen Quotidien objectif">
                  <div className="flex h-10 items-center justify-between rounded-[6px] border border-border bg-card px-3 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary">
                    <input type="number" name="gmqCible" min="0" placeholder="0.00" step="0.01" className="w-full bg-transparent font-inter text-[13px] text-label focus:outline-none" />
                    <span className="font-inter text-xs text-placeholder">kg/j</span>
                  </div>
                </FormField>
              </div>
              <div className="flex gap-4">
                <FormField label="IC cible" hint="Indice de Consommation objectif">
                  <input type="number" name="ic" min="0" placeholder="0.0" step="0.1" className={inputCls} />
                </FormField>
                <FormField label="Durée d'engraissement (jours)">
                  <input type="number" name="dureeEngraissement" min="0" placeholder="0" className={inputCls} />
                </FormField>
              </div>
              <FormField label="Poids cible d'abattage (kg)" hint="Sert de référence aux alertes « prêt à vendre »">
                <div className="flex h-10 items-center justify-between rounded-[6px] border border-border bg-card px-3 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary">
                  <input type="number" name="poidsAbattage" min="0" placeholder="0" className="w-full bg-transparent font-inter text-[13px] text-label focus:outline-none" />
                  <span className="font-inter text-xs text-placeholder">kg</span>
                </div>
              </FormField>
              <FormField label="Description / Notes">
                <textarea name="description" rows={3} className="w-full resize-none rounded-[6px] border border-border bg-card p-3 font-inter text-[13px] text-label placeholder:text-placeholder focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" placeholder="Caractéristiques, particularités de la race…" />
              </FormField>
            </div>

            <div className="mt-6 flex justify-end gap-2.5">
              <Link href="/administration/races" className="flex items-center rounded-[6px] border border-border bg-surface px-4 py-2 font-dm-sans text-[13px] font-semibold text-subtle hover:bg-border-light transition-colors">
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
