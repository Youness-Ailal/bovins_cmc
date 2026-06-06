"use client";

import { use, useState } from "react";
import Link from "next/link";
import Icon from "@/components/ui/Icon";
import { useSaveToast } from "@/lib/useSaveToast";
import { useToast } from "@/components/ui/Toast";
import { useApi } from "@/lib/useApi";
import { api } from "@/lib/api";
import type { Race } from "@/lib/types";

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

export default function ModifierRacePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: race, loading } = useApi<Race>(`/races/${id}`);
  const [submitting, setSubmitting] = useState(false);

  const notifySaved = useSaveToast();
  const { error: toastError } = useToast();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget as HTMLFormElement);
    setSubmitting(true);
    try {
      await api.put(`/races/${id}`, {
        nom: String(fd.get("nom") || ""),
        origine: String(fd.get("origine") || ""),
        poidsAdulte: Number(fd.get("poidsAdulte")) || 0,
        gmqCible: Number(fd.get("gmqCible")) || 0,
        icCible: Number(fd.get("ic")) || 0,
        dureeEngraissement: Number(fd.get("dureeEngraissement")) || 0,
        description: String(fd.get("description") || ""),
      });
      notifySaved("Race mise à jour avec succès", "/administration/races");
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
          <span className="font-dm-sans text-xl font-semibold text-label">Modifier race</span>
          <span className="font-inter text-sm text-placeholder">/ {id}</span>
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
          {loading || !race ? (
            <p className="font-inter text-sm text-placeholder">Chargement…</p>
          ) : (
          <form id="race-form" onSubmit={handleSubmit} noValidate className="rounded-[12px] border border-border-light bg-card p-8">
            <h2 className="font-dm-sans text-base font-bold text-label">Modifier la race</h2>
            <p className="mt-1 font-inter text-[13px] text-subtle">Mettez à jour les paramètres zootechniques de {race.nom}.</p>

            <div className="mt-6 flex flex-col gap-4">
              <div className="flex gap-4">
                <FormField label="Nom de la race *">
                  <input type="text" name="nom" defaultValue={race.nom} required className={inputCls} />
                </FormField>
                <FormField label="Origine">
                  <input type="text" name="origine" defaultValue={race.origine} className={inputCls} />
                </FormField>
              </div>
              <div className="flex gap-4">
                <FormField label="Poids adulte moyen (kg)" hint="Référence pour le suivi de croissance">
                  <input type="number" name="poidsAdulte" defaultValue={race.poidsAdulte} min="0" className={inputCls} />
                </FormField>
                <FormField label="GMQ cible (kg/j)" hint="Gain Moyen Quotidien objectif">
                  <input type="number" name="gmqCible" defaultValue={race.gmqCible} min="0" step="0.01" className={inputCls} />
                </FormField>
              </div>
              <div className="flex gap-4">
                <FormField label="IC cible">
                  <input type="number" name="ic" defaultValue={race.icCible} min="0" step="0.1" className={inputCls} />
                </FormField>
                <FormField label="Durée d'engraissement (jours)">
                  <input type="number" name="dureeEngraissement" defaultValue={race.dureeEngraissement} min="0" className={inputCls} />
                </FormField>
              </div>
              <FormField label="Description / Notes">
                <textarea name="description" rows={3} defaultValue={race.description} className="w-full resize-none rounded-[6px] border border-border bg-card p-3 font-inter text-[13px] text-label placeholder:text-placeholder focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" placeholder="Caractéristiques…" />
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
          )}
        </div>
      </div>
    </div>
  );
}
