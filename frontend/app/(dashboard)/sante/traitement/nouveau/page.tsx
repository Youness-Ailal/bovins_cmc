"use client";

import Link from "next/link";
import Icon from "@/components/ui/Icon";
import { useSaveToast } from "@/lib/useSaveToast";
import DatePicker from "@/components/ui/DatePicker";
import { useState } from "react";
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

export default function NouveauTraitementPage() {
  const [dateDebut, setDateDebut] = useState<Date | undefined>(new Date());
  const [dateFin, setDateFin] = useState<Date | undefined>();
  const [doseUnite, setDoseUnite] = useState("ml");

  const notifySaved = useSaveToast();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // TODO: POST /api/sante/traitements
    notifySaved("Traitement enregistré — stock médicament déduit", "/sante");
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-surface">
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-border-light bg-card px-7">
        <div className="flex items-center gap-1.5">
          <Link href="/sante" className="font-inter text-sm text-placeholder hover:text-subtle transition-colors">Santé</Link>
          <span className="font-inter text-sm text-placeholder">/</span>
          <span className="font-dm-sans text-xl font-semibold text-label">Nouveau traitement</span>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/sante" className="flex items-center gap-1.5 rounded-[6px] border border-border-light bg-surface px-3.5 py-2 font-dm-sans text-[13px] font-semibold text-subtle hover:bg-border-light transition-colors">
            Annuler
          </Link>
          <button type="submit" form="traitement-form" className="flex items-center gap-1.5 rounded-[6px] bg-primary px-3.5 py-2 font-dm-sans text-[13px] font-semibold text-white hover:bg-primary-hover transition-colors">
            <Icon name="save" size={14} />
            Enregistrer
          </button>
        </div>
      </header>

      <div className="flex flex-1 items-start justify-center overflow-auto p-8">
        <div className="w-full max-w-[640px]">
          <form id="traitement-form" onSubmit={handleSubmit} noValidate className="rounded-[12px] border border-border-light bg-card p-8">
            <h2 className="font-dm-sans text-base font-bold text-label">Enregistrement de traitement</h2>
            <p className="mt-1 font-inter text-[13px] text-subtle">Renseignez le protocole vétérinaire pour cet animal.</p>

            <div className="mt-6 flex flex-col gap-4">
              <div className="flex gap-4">
                <FormField label="Animal concerné *">
                  <Select name="animalId">
                    <SelectTrigger className="h-10 w-full rounded-[6px] border border-border bg-card">
                      <SelectValue placeholder="Rechercher un animal…" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ani-001">ANI-001 — Holstein</SelectItem>
                      <SelectItem value="ani-012">ANI-012 — Holstein</SelectItem>
                      <SelectItem value="ani-031">ANI-031 — Angus</SelectItem>
                      <SelectItem value="ani-047">ANI-047 — Limousin</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>
                <FormField label="Type de traitement *">
                  <Select name="type">
                    <SelectTrigger className="h-10 w-full rounded-[6px] border border-border bg-card">
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="antibiotique">Antibiotique</SelectItem>
                      <SelectItem value="antiparasitaire">Antiparasitaire</SelectItem>
                      <SelectItem value="anti-inflammatoire">Anti-inflammatoire</SelectItem>
                      <SelectItem value="vaccin">Vaccin</SelectItem>
                      <SelectItem value="autre">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>
              </div>

              <div className="flex gap-4">
                <FormField label="Produit (médicament en stock) *" hint="Le stock du produit sera déduit automatiquement">
                  <Select name="produit">
                    <SelectTrigger className="h-10 w-full rounded-[6px] border border-border bg-card">
                      <SelectValue placeholder="Sélectionner un médicament" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="amoxicilline">Amoxicilline — 240 ml en stock</SelectItem>
                      <SelectItem value="ivermectine">Ivermectine — 12 doses en stock</SelectItem>
                      <SelectItem value="meloxicam">Méloxicam — 80 ml en stock</SelectItem>
                      <SelectItem value="penicilline">Pénicilline — 150 ml en stock</SelectItem>
                      <SelectItem value="vaccin-bvdv">Vaccin BVDV — 25 doses en stock</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>
                <FormField label="Dose administrée">
                  <div className="flex h-10 items-center gap-0 rounded-[6px] border border-border bg-card overflow-hidden focus-within:border-primary focus-within:ring-1 focus-within:ring-primary">
                    <input type="number" name="dose" min="0" step="0.01" placeholder="0" className="flex-1 bg-transparent px-3 font-inter text-[13px] text-label focus:outline-none" />
                    <Select value={doseUnite} onValueChange={(v) => setDoseUnite(v ?? "")} name="doseUnite">
                      <SelectTrigger className="h-10 w-20 border-none border-l border-border-light rounded-none bg-surface font-inter text-[13px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ml">ml</SelectItem>
                        <SelectItem value="mg">mg</SelectItem>
                        <SelectItem value="g">g</SelectItem>
                        <SelectItem value="comp">comp.</SelectItem>
                        <SelectItem value="dose">dose</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </FormField>
              </div>

              <div className="flex gap-4">
                <FormField label="Voie d'administration">
                  <Select name="voie">
                    <SelectTrigger className="h-10 w-full rounded-[6px] border border-border bg-card">
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="injection-im">Injection intramusculaire (IM)</SelectItem>
                      <SelectItem value="injection-iv">Injection intraveineuse (IV)</SelectItem>
                      <SelectItem value="injection-sc">Injection sous-cutanée (SC)</SelectItem>
                      <SelectItem value="orale">Voie orale</SelectItem>
                      <SelectItem value="topique">Voie topique / externe</SelectItem>
                      <SelectItem value="intranasale">Intranasale</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>
                <FormField label="Vétérinaire / Intervenant">
                  <input type="text" name="veterinaire" placeholder="Nom du vétérinaire…" className={inputCls} />
                </FormField>
              </div>

              <div className="flex gap-4">
                <FormField label="Date de début *">
                  <DatePicker value={dateDebut} onChange={setDateDebut} />
                </FormField>
                <FormField label="Date de fin" hint="Laisser vide pour les traitements ponctuels">
                  <DatePicker value={dateFin} onChange={setDateFin} placeholder="Optionnel" />
                </FormField>
              </div>

              <FormField label="Délai de retrait (jours)" hint="Calculé selon le médicament — bloque la sortie tant qu'il n'est pas écoulé">
                <input type="number" name="delaiRetrait" min="0" defaultValue="0" className={inputCls} />
              </FormField>

              {/* Stock deduction note (UC-12 «include» Déduire stock médicament) */}
              <div className="flex items-start gap-2.5 rounded-[8px] bg-info/5 border border-info/20 p-3">
                <Icon name="package" size={15} className="mt-0.5 shrink-0 text-info" />
                <span className="font-inter text-[12px] leading-relaxed text-subtle">
                  À l&apos;enregistrement, la dose sera <strong className="text-label">déduite automatiquement</strong> du stock médicament, et le <strong className="text-label">délai de retrait</strong> sera appliqué à la fiche de l&apos;animal.
                </span>
              </div>

              <FormField label="Observations">
                <textarea name="observations" rows={3} className="w-full resize-none rounded-[6px] border border-border bg-card p-3 font-inter text-[13px] text-label placeholder:text-placeholder focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" placeholder="Symptômes, contexte, évolution…" />
              </FormField>
            </div>

            <div className="mt-6 flex justify-end gap-2.5">
              <Link href="/sante" className="flex items-center rounded-[6px] border border-border bg-surface px-4 py-2 font-dm-sans text-[13px] font-semibold text-subtle hover:bg-border-light transition-colors">
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
