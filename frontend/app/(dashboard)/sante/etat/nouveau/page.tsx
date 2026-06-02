"use client";

import Link from "next/link";
import Icon from "@/components/ui/Icon";
import { useSaveToast } from "@/lib/useSaveToast";
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

const ETATS = [
  { id: "sain", label: "Sain", icon: "check-circle", active: "border-2 border-primary bg-primary-light text-primary", iconActive: "text-primary" },
  { id: "observation", label: "En observation", icon: "eye", active: "border-2 border-info bg-info/5 text-info", iconActive: "text-info" },
  { id: "traitement", label: "En traitement", icon: "syringe", active: "border-2 border-warning bg-warning/5 text-warning", iconActive: "text-warning" },
  { id: "malade", label: "Malade", icon: "skull", active: "border-2 border-danger bg-danger/5 text-danger", iconActive: "text-danger" },
];

export default function NouvelEtatSantePage() {
  const [etat, setEtat] = useState("sain");
  const [date, setDate] = useState<Date | undefined>(new Date());

  const notifySaved = useSaveToast();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // TODO: POST /api/sante/etats
    notifySaved("État de santé enregistré", "/sante");
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-surface">
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-border-light bg-card px-7">
        <div className="flex items-center gap-1.5">
          <Link href="/sante" className="font-inter text-sm text-placeholder hover:text-subtle transition-colors">Santé</Link>
          <span className="font-inter text-sm text-placeholder">/</span>
          <span className="font-dm-sans text-xl font-semibold text-label">État de santé</span>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/sante" className="flex items-center gap-1.5 rounded-[6px] border border-border-light bg-surface px-3.5 py-2 font-dm-sans text-[13px] font-semibold text-subtle hover:bg-border-light transition-colors">
            Annuler
          </Link>
          <button type="submit" form="etat-form" className="flex items-center gap-1.5 rounded-[6px] bg-primary px-3.5 py-2 font-dm-sans text-[13px] font-semibold text-white hover:bg-primary-hover transition-colors">
            <Icon name="save" size={14} />
            Enregistrer
          </button>
        </div>
      </header>

      <div className="flex flex-1 items-start justify-center overflow-auto p-8">
        <div className="w-full max-w-[580px]">
          <form id="etat-form" onSubmit={handleSubmit} noValidate className="rounded-[12px] border border-border-light bg-card p-8">
            <h2 className="font-dm-sans text-base font-bold text-label">Formulaire d&apos;état de santé</h2>
            <p className="mt-1 font-inter text-[13px] text-subtle">Consignez l&apos;état clinique observé d&apos;un animal.</p>

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
                    </SelectContent>
                  </Select>
                </FormField>
                <FormField label="Date d'observation *">
                  <DatePicker value={date} onChange={setDate} />
                </FormField>
              </div>

              <FormField label="État de santé observé *">
                <div className="flex gap-3">
                  {ETATS.map(({ id, label, icon, active, iconActive }) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setEtat(id)}
                      className={`flex flex-1 flex-col items-center gap-2 rounded-[8px] p-4 font-dm-sans text-[13px] font-semibold transition-colors ${
                        etat === id ? active : "border border-border bg-card text-subtle"
                      }`}
                    >
                      <Icon name={icon} size={20} className={etat === id ? iconActive : "text-subtle"} />
                      {label}
                    </button>
                  ))}
                </div>
              </FormField>

              <div className="flex gap-4">
                <FormField label="Température (°C)">
                  <input type="number" name="temperature" min="35" max="43" step="0.1" placeholder="38.5" className={inputCls} />
                </FormField>
                <FormField label="Poids observé (kg)">
                  <input type="number" name="poids" min="0" step="0.1" placeholder="0" className={inputCls} />
                </FormField>
              </div>

              <FormField label="Symptômes observés">
                <textarea name="symptomes" rows={3} className="w-full resize-none rounded-[6px] border border-border bg-card p-3 font-inter text-[13px] text-label placeholder:text-placeholder focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" placeholder="Décrivez les symptômes observés…" />
              </FormField>

              <FormField label="Action recommandée">
                <Select name="action">
                  <SelectTrigger className="h-10 w-full rounded-[6px] border border-border bg-card">
                    <SelectValue placeholder="Aucune action requise" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Aucune action requise</SelectItem>
                    <SelectItem value="surveillance">Surveillance renforcée</SelectItem>
                    <SelectItem value="traitement">Démarrer un traitement</SelectItem>
                    <SelectItem value="isolement">Isolement immédiat</SelectItem>
                    <SelectItem value="veterinaire">Appeler le vétérinaire</SelectItem>
                  </SelectContent>
                </Select>
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
