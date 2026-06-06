"use client";

import { use, useState } from "react";
import Link from "next/link";
import Icon from "@/components/ui/Icon";
import { useSaveToast } from "@/lib/useSaveToast";
import { useToast } from "@/components/ui/Toast";
import { useApi } from "@/lib/useApi";
import { api } from "@/lib/api";
import DatePicker from "@/components/ui/DatePicker";
import type { Animal } from "@/lib/types";

// UC-02 — Enregistrer une pesée. Le GMQ est recalculé côté serveur.

function calcGMQ(poidsActuel: number, poidsPrecedent: number, jours: number): string {
  if (jours <= 0 || poidsActuel <= poidsPrecedent) return "—";
  return ((poidsActuel - poidsPrecedent) / jours).toFixed(3);
}

function daysBetween(d1: Date, d2: string | Date): number {
  const prev = new Date(d2);
  return Math.max(1, Math.round((d1.getTime() - prev.getTime()) / 86400000));
}

export default function NouvellePageSee({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: animal } = useApi<Animal>(`/animaux/${id}`);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [poids, setPoids] = useState<string>("");
  const [observateur, setObservateur] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { error: toastError } = useToast();
  const notifySaved = useSaveToast();

  const derniere = (animal?.pesees ?? [])[0];
  const gmqCalc =
    poids && date && derniere
      ? calcGMQ(parseFloat(poids), derniere.poids, daysBetween(date, derniere.date))
      : null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!poids) return toastError("Le poids est requis");
    setSubmitting(true);
    try {
      await api.post(`/animaux/${id}/pesees`, { poids: Number(poids), date: date ?? new Date(), observateur, notes });
      notifySaved("Pesée enregistrée — GMQ recalculé", `/animaux/${id}`);
    } catch (err) {
      toastError(err instanceof Error ? err.message : "Erreur");
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-surface">
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-border-light bg-card px-7">
        <div className="flex items-center gap-1.5">
          <Link href="/animaux" className="font-inter text-sm text-placeholder hover:text-subtle transition-colors">Animaux</Link>
          <span className="font-inter text-sm text-placeholder">/</span>
          <Link href={`/animaux/${id}`} className="font-inter text-sm text-placeholder hover:text-subtle transition-colors">{id}</Link>
          <span className="font-inter text-sm text-placeholder">/</span>
          <span className="font-dm-sans text-xl font-semibold text-label">Enregistrer une pesée</span>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/animaux/${id}`} className="flex items-center gap-1.5 rounded-[6px] border border-border-light bg-surface px-3.5 py-2 font-dm-sans text-[13px] font-semibold text-subtle hover:bg-border-light transition-colors">
            Annuler
          </Link>
          <button type="submit" form="pesee-form" className="flex items-center gap-1.5 rounded-[6px] bg-primary px-3.5 py-2 font-dm-sans text-[13px] font-semibold text-white hover:bg-primary-hover transition-colors">
            <Icon name="save" size={14} />
            Enregistrer
          </button>
        </div>
      </header>

      <div className="flex flex-1 items-start justify-center overflow-auto p-8">
        <div className="w-full max-w-[560px] flex flex-col gap-4">
          {/* Contexte animal */}
          <div className="rounded-[10px] border border-border-light bg-card p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary font-dm-sans text-sm font-bold text-white">
                {id.slice(-1).toUpperCase()}
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="font-dm-sans text-sm font-semibold text-label">{animal?.identifiant ?? id} — {animal?.race?.nom ?? ""}</span>
                <span className="font-inter text-[12px] text-subtle">
                  {derniere ? `Dernière pesée : ${new Date(derniere.date).toLocaleDateString("fr-FR")} · ${derniere.poids} kg` : "Aucune pesée précédente"}
                </span>
              </div>
            </div>
          </div>

          <form id="pesee-form" onSubmit={handleSubmit} noValidate className="rounded-[12px] border border-border-light bg-card p-7">
            <h2 className="font-dm-sans text-base font-bold text-label">Nouvelle pesée</h2>
            <p className="mt-1 font-inter text-[13px] text-subtle">Le GMQ est calculé automatiquement depuis la pesée précédente.</p>

            <div className="mt-5 flex flex-col gap-4">
              <div className="flex gap-4">
                <div className="flex flex-1 flex-col gap-1.5">
                  <label className="font-inter text-xs font-medium text-label">Date de la pesée *</label>
                  <DatePicker value={date} onChange={setDate} />
                </div>
                <div className="flex flex-1 flex-col gap-1.5">
                  <label className="font-inter text-xs font-medium text-label">Poids vif (kg) *</label>
                  <div className="flex h-10 items-center justify-between rounded-[6px] border border-border bg-card px-3 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary">
                    <input
                      type="number"
                      name="poids"
                      min="0"
                      step="0.1"
                      placeholder="0.0"
                      value={poids}
                      onChange={(e) => setPoids(e.target.value)}
                      required
                      className="w-full bg-transparent font-inter text-[13px] text-label focus:outline-none"
                    />
                    <span className="font-inter text-xs text-placeholder">kg</span>
                  </div>
                </div>
              </div>

              {/* GMQ auto-calculé */}
              <div className={`rounded-[8px] p-4 ${gmqCalc ? "bg-primary-light border border-primary/20" : "bg-surface border border-border-light"}`}>
                <span className="font-inter text-[11px] font-semibold uppercase tracking-wide text-placeholder">GMQ calculé automatiquement</span>
                <div className="mt-2 flex items-end gap-4">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-inter text-[11px] text-placeholder">GMQ depuis dernière pesée</span>
                    <span className={`font-dm-sans text-2xl font-bold ${gmqCalc ? "text-primary" : "text-border-ui"}`}>
                      {gmqCalc ? `${gmqCalc} kg/j` : "— kg/j"}
                    </span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="font-inter text-[11px] text-placeholder">Gain depuis dernière pesée</span>
                    <span className="font-inter text-[13px] font-medium text-label">
                      {poids && derniere ? `+${(parseFloat(poids) - derniere.poids).toFixed(1)} kg` : "—"}
                    </span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="font-inter text-[11px] text-placeholder">Intervalle</span>
                    <span className="font-inter text-[13px] font-medium text-label">
                      {date && derniere ? `${daysBetween(date, derniere.date)} jours` : "—"}
                    </span>
                  </div>
                </div>
                {gmqCalc && parseFloat(gmqCalc) < 1.1 && (
                  <div className="mt-2 flex items-center gap-1.5 text-warning">
                    <Icon name="triangle-alert" size={13} />
                    <span className="font-inter text-[11px]">GMQ en dessous du seuil cible (1.1 kg/j pour Holstein)</span>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-inter text-xs font-medium text-label">Observateur</label>
                <input type="text" value={observateur} onChange={(e) => setObservateur(e.target.value)} placeholder="Nom de la personne ayant réalisé la pesée" className="h-10 w-full rounded-[6px] border border-border bg-card px-3 font-inter text-[13px] text-label placeholder:text-placeholder focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-inter text-xs font-medium text-label">Notes</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="w-full resize-none rounded-[6px] border border-border bg-card p-3 font-inter text-[13px] text-label placeholder:text-placeholder focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" placeholder="Conditions de pesée, observations…" />
              </div>
            </div>

            {/* Historique récent */}
            <div className="mt-5 border-t border-border-light pt-4">
              <span className="font-inter text-[11px] font-semibold uppercase tracking-wide text-placeholder">Historique récent</span>
              <div className="mt-2 flex flex-col gap-1.5">
                {(animal?.pesees ?? []).slice(0, 3).map((p) => (
                  <div key={p.id} className="flex items-center justify-between">
                    <span className="font-inter text-[12px] text-subtle">{new Date(p.date).toLocaleDateString("fr-FR")}</span>
                    <span className="font-inter text-[12px] font-semibold text-label">{p.poids} kg</span>
                  </div>
                ))}
                {(animal?.pesees ?? []).length === 0 && <span className="font-inter text-[12px] text-placeholder">Aucune pesée enregistrée</span>}
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2.5">
              <Link href={`/animaux/${id}`} className="flex items-center rounded-[6px] border border-border bg-surface px-4 py-2 font-dm-sans text-[13px] font-semibold text-subtle hover:bg-border-light transition-colors">
                Annuler
              </Link>
              <button type="submit" className="flex items-center gap-1.5 rounded-[6px] bg-primary px-4 py-2 font-dm-sans text-[13px] font-semibold text-white hover:bg-primary-hover transition-colors">
                <Icon name="save" size={14} />
                Enregistrer la pesée
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
