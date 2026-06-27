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
    <div className="flex min-w-0 flex-col gap-1.5">
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
  const [capacity, setCapacity] = useState("");
  const [surface, setSurface] = useState("");
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
        reference: String(fd.get("reference") || "").trim(),
        capaciteMax: Number(capacity) || 0,
        superficie: Number(surface) || 0,
        type,
        ration: ration || null,
        notes: String(fd.get("notes") || "").trim(),
      });
      notifySaved("Parcelle creee avec succes", "/parcelles");
    } catch (err) {
      toastError(err instanceof Error ? err.message : "Erreur");
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-surface">
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-border-light bg-card px-7">
        <div className="flex items-center gap-1.5">
          <Link href="/parcelles" className="font-inter text-sm text-placeholder transition-colors hover:text-subtle">Parcelles</Link>
          <span className="font-inter text-sm text-placeholder">/</span>
          <span className="font-dm-sans text-xl font-semibold text-label">Nouvelle parcelle</span>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/parcelles" className="flex items-center gap-1.5 rounded-[6px] border border-border-light bg-surface px-3.5 py-2 font-dm-sans text-[13px] font-semibold text-subtle transition-colors hover:bg-border-light">
            Annuler
          </Link>
          <button disabled={submitting} type="submit" form="parcelle-form" className="flex items-center gap-1.5 rounded-[6px] bg-primary px-3.5 py-2 font-dm-sans text-[13px] font-semibold text-white transition-colors hover:bg-primary-hover disabled:opacity-50">
            <Icon name="save" size={14} />
            {submitting ? "Creation..." : "Creer"}
          </button>
        </div>
      </header>

      <div className="flex flex-1 items-start justify-center overflow-auto p-8">
        <div className="grid w-full max-w-[980px] grid-cols-1 gap-5 lg:grid-cols-[1fr_300px]">
          <form id="parcelle-form" onSubmit={handleSubmit} noValidate className="rounded-[12px] border border-border-light bg-card p-8">
            <h2 className="font-dm-sans text-lg font-bold text-label">Informations de la parcelle</h2>
            <p className="mt-1 font-inter text-[13px] text-subtle">Definissez un espace, sa capacite et la ration associee avant d'affecter des animaux.</p>

            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField label="Nom de la parcelle *">
                <input type="text" name="nom" placeholder="Ex: Parcelle Delta" required className={inputCls} />
              </FormField>
              <FormField label="Reference">
                <input type="text" name="reference" placeholder="Ex: P-04" className={inputCls} />
              </FormField>
              <FormField label="Capacite maximale *" hint="Controlee lors des transferts">
                <input type="number" value={capacity} onChange={(e) => setCapacity(e.target.value)} min="0" placeholder="0" required className={inputCls} />
              </FormField>
              <FormField label="Superficie en ha">
                <input type="number" value={surface} onChange={(e) => setSurface(e.target.value)} min="0" step="0.1" placeholder="0.0" className={inputCls} />
              </FormField>
              <FormField label="Type de parcelle">
                <Select value={type} onValueChange={(v) => setType(v ?? "")}>
                  <SelectTrigger className="h-10 w-full rounded-[6px] border border-border bg-card">
                    <SelectValue placeholder="Selectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paturage">Paturage</SelectItem>
                    <SelectItem value="engraissement">Enclos d'engraissement</SelectItem>
                    <SelectItem value="quarantaine">Quarantaine / Isolement</SelectItem>
                    <SelectItem value="veaux">Parc a veaux</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
              <FormField label="Ration assignee">
                <Select value={ration} onValueChange={(v) => setRation(v ?? "")}>
                  <SelectTrigger className="h-10 w-full rounded-[6px] border border-border bg-card">
                    <SelectValue placeholder="Aucune ration" />
                  </SelectTrigger>
                  <SelectContent>
                    {(rations ?? []).map((r) => <SelectItem key={r.id} value={r.id}>{r.nom}</SelectItem>)}
                  </SelectContent>
                </Select>
              </FormField>
              <div className="md:col-span-2">
                <FormField label="Notes">
                  <textarea name="notes" rows={4} className="w-full resize-none rounded-[6px] border border-border bg-card p-3 font-inter text-[13px] text-label placeholder:text-placeholder focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" placeholder="Emplacement, particularites, consignes terrain" />
                </FormField>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2.5">
              <Link href="/parcelles" className="flex items-center rounded-[6px] border border-border bg-surface px-4 py-2 font-dm-sans text-[13px] font-semibold text-subtle transition-colors hover:bg-border-light">
                Annuler
              </Link>
              <button disabled={submitting} type="submit" className="flex items-center gap-1.5 rounded-[6px] bg-primary px-4 py-2 font-dm-sans text-[13px] font-semibold text-white transition-colors hover:bg-primary-hover disabled:opacity-50">
                <Icon name="save" size={14} />
                {submitting ? "Creation..." : "Creer la parcelle"}
              </button>
            </div>
          </form>

          <aside className="rounded-[12px] border border-border-light bg-card p-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-[8px] bg-primary-light text-primary">
              <Icon name="map" size={20} />
            </div>
            <h2 className="mt-4 font-dm-sans text-base font-bold text-label">Avant de creer</h2>
            <div className="mt-4 space-y-4 font-inter text-[13px] text-subtle">
              <p>Utilisez une reference courte pour faciliter les recherches terrain.</p>
              <p>La capacite limite les transferts quand la parcelle est pleine.</p>
              <p>Une ration assignee simplifie les distributions quotidiennes.</p>
            </div>
            <div className="mt-5 rounded-[8px] bg-surface p-3">
              <p className="font-inter text-[11px] font-bold uppercase tracking-wide text-placeholder">Apercu capacite</p>
              <p className="mt-1 font-dm-sans text-2xl font-bold text-label">{capacity || 0}</p>
              <p className="font-inter text-xs text-subtle">places disponibles a la creation</p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
