"use client";

import Link from "next/link";
import Icon from "@/components/ui/Icon";
import { useSaveToast } from "@/lib/useSaveToast";
import { useToast } from "@/components/ui/Toast";
import { api } from "@/lib/api";
import DatePicker from "@/components/ui/DatePicker";
import { useState } from "react";
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

const inputCls = "h-10 w-full rounded-[6px] border border-border bg-card px-3 font-inter text-[13px] text-label placeholder:text-placeholder transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary";

export default function NouveauLotPage() {
  const notifySaved = useSaveToast();
  const { error: toastError } = useToast();
  const [nom, setNom] = useState("");
  const [phase, setPhase] = useState("");
  const [description, setDescription] = useState("");
  const [dateCreation, setDateCreation] = useState<Date | undefined>(new Date());
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nom) return toastError("Le nom du lot est requis");
    setSubmitting(true);
    try {
      await api.post("/lots", { nom, phase, description, dateCreation: dateCreation ?? new Date() });
      notifySaved("Lot créé avec succès", "/lots");
    } catch (err) {
      toastError(err instanceof Error ? err.message : "Erreur");
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-surface">
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-border-light bg-card px-7">
        <div className="flex items-center gap-1.5">
          <Link href="/lots" className="font-inter text-sm text-placeholder hover:text-subtle transition-colors">Lots</Link>
          <span className="font-inter text-sm text-placeholder">/</span>
          <span className="font-dm-sans text-xl font-semibold text-label">Nouveau lot</span>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/lots" className="flex items-center gap-1.5 rounded-[6px] border border-border-light bg-surface px-3.5 py-2 font-dm-sans text-[13px] font-semibold text-subtle hover:bg-border-light transition-colors">
            Annuler
          </Link>
          <button type="submit" form="lot-form" disabled={submitting} className="flex items-center gap-1.5 rounded-[6px] bg-primary px-3.5 py-2 font-dm-sans text-[13px] font-semibold text-white hover:bg-primary-hover transition-colors disabled:opacity-50">
            <Icon name="save" size={14} />
            Créer le lot
          </button>
        </div>
      </header>

      <div className="flex flex-1 items-start justify-center overflow-auto p-8">
        <div className="w-full max-w-[560px]">
          <form id="lot-form" onSubmit={handleSubmit} noValidate className="rounded-[12px] border border-border-light bg-card p-8">
            <h2 className="font-dm-sans text-base font-bold text-label">Informations du lot</h2>
            <p className="mt-1 font-inter text-[13px] text-subtle">Créez un nouveau groupe d&apos;animaux pour le suivi collectif.</p>

            <div className="mt-6 flex flex-col gap-4">
              <div className="flex gap-4">
                <FormField label="Nom du lot *">
                  <input type="text" value={nom} onChange={(e) => setNom(e.target.value)} placeholder="Ex: LOT-C" className={inputCls} />
                </FormField>
                <FormField label="Date de création *">
                  <DatePicker value={dateCreation} onChange={setDateCreation} />
                </FormField>
              </div>

              <FormField label="Phase majoritaire">
                <Select value={phase} onValueChange={(v) => setPhase(v ?? "")}>
                  <SelectTrigger className="h-10 w-full rounded-[6px] border border-border bg-card">
                    <SelectValue placeholder="Sélectionner la phase" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Croissance">Croissance</SelectItem>
                    <SelectItem value="Engraissement">Engraissement</SelectItem>
                    <SelectItem value="Finition">Finition</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>

              <FormField label="Description / Objectif">
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full resize-none rounded-[6px] border border-border bg-card p-3 font-inter text-[13px] text-label placeholder:text-placeholder focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" placeholder="Objectif de production, critères de sélection…" />
              </FormField>
            </div>

            <div className="mt-6 flex justify-end gap-2.5">
              <Link href="/lots" className="flex items-center rounded-[6px] border border-border bg-surface px-4 py-2 font-dm-sans text-[13px] font-semibold text-subtle hover:bg-border-light transition-colors">
                Annuler
              </Link>
              <button type="submit" disabled={submitting} className="flex items-center gap-1.5 rounded-[6px] bg-primary px-4 py-2 font-dm-sans text-[13px] font-semibold text-white hover:bg-primary-hover transition-colors disabled:opacity-50">
                <Icon name="save" size={14} />
                Créer le lot
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
