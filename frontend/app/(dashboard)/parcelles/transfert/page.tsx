"use client";

import { useState } from "react";
import Link from "next/link";
import Icon from "@/components/ui/Icon";
import { useSaveToast } from "@/lib/useSaveToast";
import DatePicker from "@/components/ui/DatePicker";
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

type TransfertType = "individuel" | "lot";

export default function TransfertParcellesPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [type, setType] = useState<TransfertType>("individuel");

  const notifySaved = useSaveToast();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // TODO: POST /api/parcelles/transfert
    notifySaved("Transfert effectué avec succès", "/parcelles");
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-surface">
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-border-light bg-card px-7">
        <div className="flex items-center gap-1.5">
          <Link href="/parcelles" className="font-inter text-sm text-placeholder hover:text-subtle transition-colors">Parcelles</Link>
          <span className="font-inter text-sm text-placeholder">/</span>
          <span className="font-dm-sans text-xl font-semibold text-label">Affectation / Transfert</span>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/parcelles" className="flex items-center gap-1.5 rounded-[6px] border border-border-light bg-surface px-3.5 py-2 font-dm-sans text-[13px] font-semibold text-subtle hover:bg-border-light transition-colors">
            Annuler
          </Link>
          <button type="submit" form="transfert-form" className="flex items-center gap-1.5 rounded-[6px] bg-primary px-3.5 py-2 font-dm-sans text-[13px] font-semibold text-white hover:bg-primary-hover transition-colors">
            <Icon name="check" size={14} />
            Confirmer le transfert
          </button>
        </div>
      </header>

      <div className="flex flex-1 items-start justify-center overflow-auto p-8">
        <div className="w-full max-w-[600px]">
          <form id="transfert-form" onSubmit={handleSubmit} noValidate className="rounded-[12px] border border-border-light bg-card p-8">
            <h2 className="font-dm-sans text-base font-bold text-label">Transfert d&apos;animaux</h2>
            <p className="mt-1 font-inter text-[13px] text-subtle">Déplacez un animal ou un lot vers une autre parcelle.</p>

            <div className="mt-6 flex flex-col gap-4">
              <FormField label="Type de transfert">
                <div className="flex gap-2.5">
                  {([
                    { id: "individuel", label: "Animal individuel" },
                    { id: "lot", label: "Lot complet" },
                  ] as const).map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setType(t.id)}
                      className={`flex flex-1 items-center justify-center gap-2 rounded-[6px] py-2.5 font-inter text-[13px] transition-colors ${
                        type === t.id
                          ? "border-2 border-primary bg-primary-light font-medium text-primary"
                          : "border border-border bg-card text-subtle"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </FormField>

              <FormField label={type === "individuel" ? "Animal *" : "Lot *"}>
                <Select name="cibleId">
                  <SelectTrigger className="h-10 w-full rounded-[6px] border border-border bg-card">
                    <SelectValue placeholder={type === "individuel" ? "Rechercher un animal…" : "Rechercher un lot…"} />
                  </SelectTrigger>
                  <SelectContent>
                    {type === "individuel" ? (
                      <>
                        <SelectItem value="ani-001">ANI-001 — Holstein (Parcelle Alpha)</SelectItem>
                        <SelectItem value="ani-003">ANI-003 — Limousin (Parcelle Alpha)</SelectItem>
                        <SelectItem value="ani-012">ANI-012 — Holstein (Parcelle Beta)</SelectItem>
                      </>
                    ) : (
                      <>
                        <SelectItem value="lot-a">LOT-A — 15 animaux (Parcelle Alpha)</SelectItem>
                        <SelectItem value="lot-b">LOT-B — 8 animaux (Parcelle Beta)</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </FormField>

              <div className="flex gap-4">
                <FormField label="Parcelle d'origine">
                  <input type="text" disabled defaultValue="Parcelle Alpha" className={`${inputCls} bg-surface text-subtle cursor-not-allowed`} />
                </FormField>
                <FormField label="Parcelle de destination *">
                  <Select name="parcelleDestId">
                    <SelectTrigger className="h-10 w-full rounded-[6px] border border-border bg-card">
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="parcelle-beta">Parcelle Beta (46 libres)</SelectItem>
                      <SelectItem value="parcelle-gamma">Parcelle Gamma (42 libres)</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>
              </div>

              <FormField label="Date de transfert *">
                <DatePicker value={date} onChange={setDate} />
              </FormField>

              <FormField label="Motif du transfert">
                <Select name="motif">
                  <SelectTrigger className="h-10 w-full rounded-[6px] border border-border bg-card">
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="phase">Changement de phase</SelectItem>
                    <SelectItem value="sante">Isolement sanitaire</SelectItem>
                    <SelectItem value="capacite">Gestion de capacité</SelectItem>
                    <SelectItem value="autre">Autre</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>

              <FormField label="Notes">
                <textarea name="notes" rows={3} className="w-full resize-none rounded-[6px] border border-border bg-card p-3 font-inter text-[13px] text-label placeholder:text-placeholder focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" placeholder="Contexte ou observations…" />
              </FormField>
            </div>

            <div className="mt-6 flex justify-end gap-2.5">
              <Link href="/parcelles" className="flex items-center rounded-[6px] border border-border bg-surface px-4 py-2 font-dm-sans text-[13px] font-semibold text-subtle hover:bg-border-light transition-colors">
                Annuler
              </Link>
              <button type="submit" className="flex items-center gap-1.5 rounded-[6px] bg-primary px-4 py-2 font-dm-sans text-[13px] font-semibold text-white hover:bg-primary-hover transition-colors">
                <Icon name="check" size={14} />
                Confirmer
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
