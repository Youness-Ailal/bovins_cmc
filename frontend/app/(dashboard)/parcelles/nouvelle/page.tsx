"use client";

import { useState } from "react";
import Link from "next/link";
import Icon from "@/components/ui/Icon";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useSaveToast } from "@/lib/useSaveToast";
import { useToast } from "@/components/ui/Toast";
import { useApi } from "@/lib/useApi";
import { api } from "@/lib/api";
import type { Ration } from "@/lib/types";

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

export default function NouvelleParcellePage() {
  const notifySaved = useSaveToast();
  const { error: toastError } = useToast();
  const { data: rations } = useApi<Ration[]>("/rations");
  const [type, setType] = useState("");
  const [ration, setRation] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget as HTMLFormElement);
    const nom = String(fd.get("nom") || "").trim();
    if (!nom) return toastError("Le nom est requis");
    setSubmitting(true);
    try {
      await api.post("/parcelles", {
        nom,
        reference: String(fd.get("reference") || ""),
        capaciteMax: Number(fd.get("capacite")) || 0,
        superficie: Number(fd.get("superficie")) || 0,
        type,
        ration: ration || null,
        notes: String(fd.get("notes") || ""),
      });
      notifySaved("Parcelle créée avec succès", "/parcelles");
    } catch (err) {
      toastError(err instanceof Error ? err.message : "Erreur");
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-surface">
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-border-light bg-card px-7">
        <div className="flex items-center gap-1.5">
          <Link href="/parcelles" className="font-inter text-sm text-placeholder hover:text-subtle transition-colors">Parcelles</Link>
          <span className="font-inter text-sm text-placeholder">/</span>
          <span className="font-dm-sans text-xl font-semibold text-label">Nouvelle parcelle</span>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/parcelles" className="flex items-center gap-1.5 rounded-[6px] border border-border-light bg-surface px-3.5 py-2 font-dm-sans text-[13px] font-semibold text-subtle hover:bg-border-light transition-colors">
            Annuler
          </Link>
          <button type="submit" form="parcelle-form" className="flex items-center gap-1.5 rounded-[6px] bg-primary px-3.5 py-2 font-dm-sans text-[13px] font-semibold text-white hover:bg-primary-hover transition-colors">
            <Icon name="save" size={14} />
            Créer la parcelle
          </button>
        </div>
      </header>

      <div className="flex flex-1 items-start justify-center overflow-auto p-8">
        <div className="w-full max-w-[560px]">
          <form id="parcelle-form" onSubmit={handleSubmit} noValidate className="rounded-[12px] border border-border-light bg-card p-8">
            <h2 className="font-dm-sans text-base font-bold text-label">Informations de la parcelle</h2>
            <p className="mt-1 font-inter text-[13px] text-subtle">Créez un paddock pour héberger vos animaux.</p>

            <div className="mt-6 flex flex-col gap-4">
              <div className="flex gap-4">
                <FormField label="Nom de la parcelle *">
                  <input type="text" name="nom" placeholder="Ex: Parcelle Delta" required className={inputCls} />
                </FormField>
                <FormField label="Référence">
                  <input type="text" name="reference" placeholder="Ex: P-04" className={inputCls} />
                </FormField>
              </div>

              <div className="flex gap-4">
                <FormField label="Capacité maximale (animaux) *" hint="Limite vérifiée lors des affectations">
                  <input type="number" name="capacite" min="0" placeholder="0" required className={inputCls} />
                </FormField>
                <FormField label="Superficie (ha)">
                  <input type="number" name="superficie" min="0" step="0.1" placeholder="0.0" className={inputCls} />
                </FormField>
              </div>

              <FormField label="Type de parcelle">
                <Select value={type} onValueChange={(v) => setType(v ?? "")}>
                  <SelectTrigger className="h-10 w-full rounded-[6px] border border-border bg-card">
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paturage">Pâturage</SelectItem>
                    <SelectItem value="engraissement">Enclos d&apos;engraissement</SelectItem>
                    <SelectItem value="quarantaine">Quarantaine / Isolement</SelectItem>
                    <SelectItem value="veaux">Parc à veaux</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>

              <FormField label="Ration assignée (optionnel)">
                <Select value={ration} onValueChange={(v) => setRation(v ?? "")}>
                  <SelectTrigger className="h-10 w-full rounded-[6px] border border-border bg-card">
                    <SelectValue placeholder="Aucune ration" />
                  </SelectTrigger>
                  <SelectContent>
                    {(rations ?? []).map((r) => <SelectItem key={r.id} value={r.id}>{r.nom}</SelectItem>)}
                  </SelectContent>
                </Select>
              </FormField>

              <FormField label="Notes">
                <textarea name="notes" rows={3} className="w-full resize-none rounded-[6px] border border-border bg-card p-3 font-inter text-[13px] text-label placeholder:text-placeholder focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" placeholder="Emplacement, particularités…" />
              </FormField>
            </div>

            <div className="mt-6 flex justify-end gap-2.5">
              <Link href="/parcelles" className="flex items-center rounded-[6px] border border-border bg-surface px-4 py-2 font-dm-sans text-[13px] font-semibold text-subtle hover:bg-border-light transition-colors">
                Annuler
              </Link>
              <button type="submit" className="flex items-center gap-1.5 rounded-[6px] bg-primary px-4 py-2 font-dm-sans text-[13px] font-semibold text-white hover:bg-primary-hover transition-colors">
                <Icon name="save" size={14} />
                Créer la parcelle
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
