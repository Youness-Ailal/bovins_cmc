"use client";

import Link from "next/link";
import Icon from "@/components/ui/Icon";
import { useSaveToast } from "@/lib/useSaveToast";
import { useToast } from "@/components/ui/Toast";
import { useApi } from "@/lib/useApi";
import { api } from "@/lib/api";
import DatePicker from "@/components/ui/DatePicker";
import { useState } from "react";
import type { Ration, Parcelle, Lot } from "@/lib/types";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="font-inter text-xs font-medium text-label">{label}</label>
      {children}
    </div>
  );
}

export default function DistributionRationPage() {
  const { data: rations } = useApi<Ration[]>("/rations");
  const { data: parcelles } = useApi<Parcelle[]>("/parcelles");
  const { data: lots } = useApi<Lot[]>("/lots");
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [rationId, setRationId] = useState("");
  const [cible, setCible] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const notifySaved = useSaveToast();
  const { error: toastError } = useToast();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget as HTMLFormElement);
    if (!rationId) return toastError("Sélectionnez une ration");
    setSubmitting(true);
    try {
      await api.post("/rations/distributions", {
        ration: rationId,
        cible,
        date: date ?? new Date(),
        quantite: Number(fd.get("quantite")) || 0,
        nbAnimaux: Number(fd.get("nbAnimaux")) || 0,
        notes: String(fd.get("notes") || ""),
      });
      notifySaved("Distribution enregistrée — stock déduit", "/rations");
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
          <span className="font-dm-sans text-xl font-semibold text-label">Distribution de ration</span>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/rations" className="flex items-center gap-1.5 rounded-[6px] border border-border-light bg-surface px-3.5 py-2 font-dm-sans text-[13px] font-semibold text-subtle hover:bg-border-light transition-colors">
            Annuler
          </Link>
          <button type="submit" form="distribution-form" className="flex items-center gap-1.5 rounded-[6px] bg-primary px-3.5 py-2 font-dm-sans text-[13px] font-semibold text-white hover:bg-primary-hover transition-colors">
            <Icon name="check" size={14} />
            Confirmer
          </button>
        </div>
      </header>

      <div className="flex flex-1 items-start justify-center overflow-auto p-8">
        <div className="w-full max-w-[600px]">
          <form id="distribution-form" onSubmit={handleSubmit} noValidate className="rounded-[12px] border border-border-light bg-card p-8">
            <h2 className="font-dm-sans text-base font-bold text-label">Enregistrement de distribution</h2>
            <p className="mt-1 font-inter text-[13px] text-subtle">Indiquez la ration distribuée, les destinataires et la quantité.</p>

            <div className="mt-6 flex flex-col gap-4">
              <FormField label="Ration distribuée *">
                <Select value={rationId} onValueChange={(v) => setRationId(v ?? "")}>
                  <SelectTrigger className="h-10 w-full rounded-[6px] border border-border bg-card">
                    <SelectValue placeholder="Sélectionner une ration" />
                  </SelectTrigger>
                  <SelectContent>
                    {(rations ?? []).map((r) => <SelectItem key={r.id} value={r.id}>{r.nom}</SelectItem>)}
                  </SelectContent>
                </Select>
              </FormField>

              <div className="flex gap-4">
                <FormField label="Cible (Parcelle ou Lot) *">
                  <Select value={cible} onValueChange={(v) => setCible(v ?? "")}>
                    <SelectTrigger className="h-10 w-full rounded-[6px] border border-border bg-card">
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      {(parcelles ?? []).map((p) => <SelectItem key={p.id} value={p.nom}>{p.nom}</SelectItem>)}
                      {(lots ?? []).map((l) => <SelectItem key={l.id} value={l.nom}>{l.nom}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </FormField>
                <FormField label="Date de distribution *">
                  <DatePicker value={date} onChange={setDate} />
                </FormField>
              </div>

              <div className="flex gap-4">
                <FormField label="Quantité distribuée (kg) *">
                  <div className="flex h-10 items-center justify-between rounded-[6px] border border-border bg-card px-3 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary">
                    <input type="number" name="quantite" min="0" step="0.1" defaultValue="0" className="w-full bg-transparent font-inter text-[13px] text-label focus:outline-none" />
                    <span className="font-inter text-xs text-placeholder">kg</span>
                  </div>
                </FormField>
                <FormField label="Nb animaux concernés">
                  <input type="number" name="nbAnimaux" min="1" defaultValue="78" className="h-10 w-full rounded-[6px] border border-border bg-card px-3 font-inter text-[13px] text-label focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
                </FormField>
              </div>

              {/* Summary panel */}
              <div className="rounded-[8px] bg-surface p-4">
                <span className="font-inter text-[11px] font-semibold uppercase tracking-wide text-placeholder">Résumé estimé</span>
                <div className="mt-2 flex gap-8">
                  {[
                    { label: "Coût estimé", value: "1 435 MAD" },
                    { label: "Coût / animal", value: "18.40 MAD" },
                    { label: "Stock restant Orge", value: "40 kg" },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex flex-col gap-0.5">
                      <span className="font-inter text-[11px] text-placeholder">{label}</span>
                      <span className="font-inter text-[13px] font-semibold text-label">{value}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-2 flex items-center gap-1.5 text-warning">
                  <Icon name="triangle-alert" size={12} />
                  <span className="font-inter text-[11px]">Stock Orge en dessous du seuil après distribution</span>
                </div>
              </div>

              <FormField label="Notes">
                <textarea name="notes" rows={3} className="w-full resize-none rounded-[6px] border border-border bg-card p-3 font-inter text-[13px] text-label placeholder:text-placeholder focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" placeholder="Observations…" />
              </FormField>
            </div>

            <div className="mt-6 flex justify-end gap-2.5">
              <Link href="/rations" className="flex items-center rounded-[6px] border border-border bg-surface px-4 py-2 font-dm-sans text-[13px] font-semibold text-subtle hover:bg-border-light transition-colors">
                Annuler
              </Link>
              <button type="submit" className="flex items-center gap-1.5 rounded-[6px] bg-primary px-4 py-2 font-dm-sans text-[13px] font-semibold text-white hover:bg-primary-hover transition-colors">
                <Icon name="check" size={14} />
                Confirmer la distribution
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
