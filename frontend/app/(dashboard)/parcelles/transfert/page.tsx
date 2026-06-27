"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Icon from "@/components/ui/Icon";
import { useSaveToast } from "@/lib/useSaveToast";
import { useToast } from "@/components/ui/Toast";
import { useApi } from "@/lib/useApi";
import { api } from "@/lib/api";
import DatePicker from "@/components/ui/DatePicker";
import type { Animal, Parcelle } from "@/lib/types";
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

export default function TransfertParcellesPage() {
  const searchParams = useSearchParams();
  const { data: animaux } = useApi<Animal[]>("/animaux");
  const { data: parcelles } = useApi<Parcelle[]>("/parcelles");
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [cibleId, setCibleId] = useState("");
  const [parcelleDestId, setParcelleDestId] = useState(searchParams.get("parcelle") ?? "");
  const [submitting, setSubmitting] = useState(false);

  const notifySaved = useSaveToast();
  const { error: toastError } = useToast();

  const selectedAnimal = (animaux ?? []).find((a) => a.id === cibleId);
  const selectedDestination = (parcelles ?? []).find((p) => p.id === parcelleDestId);
  const freePlaces = selectedDestination ? Math.max(0, selectedDestination.capaciteMax - (selectedDestination.nbActuels ?? 0)) : null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!cibleId || !parcelleDestId) return toastError("Animal et parcelle de destination requis");
    if (selectedAnimal?.parcelle?.id === parcelleDestId) return toastError("L'animal est deja dans cette parcelle");
    setSubmitting(true);
    try {
      await api.post("/parcelles/transfert", { animalId: cibleId, parcelleDestId });
      notifySaved("Transfert effectue avec succes", "/parcelles");
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
          <span className="font-dm-sans text-xl font-semibold text-label">Affectation / Transfert</span>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/parcelles" className="flex items-center gap-1.5 rounded-[6px] border border-border-light bg-surface px-3.5 py-2 font-dm-sans text-[13px] font-semibold text-subtle transition-colors hover:bg-border-light">
            Annuler
          </Link>
          <button disabled={submitting} type="submit" form="transfert-form" className="flex items-center gap-1.5 rounded-[6px] bg-primary px-3.5 py-2 font-dm-sans text-[13px] font-semibold text-white transition-colors hover:bg-primary-hover disabled:opacity-50">
            <Icon name="check" size={14} />
            {submitting ? "Transfert..." : "Confirmer"}
          </button>
        </div>
      </header>

      <div className="flex flex-1 items-start justify-center overflow-auto p-8">
        <div className="grid w-full max-w-[980px] grid-cols-1 gap-5 lg:grid-cols-[1fr_320px]">
          <form id="transfert-form" onSubmit={handleSubmit} noValidate className="rounded-[12px] border border-border-light bg-card p-8">
            <h2 className="font-dm-sans text-base font-bold text-label">Transfert d'animaux</h2>
            <p className="mt-1 font-inter text-[13px] text-subtle">Selectionnez l'animal, verifiez son origine, puis choisissez la parcelle d'accueil.</p>

            <div className="mt-6 flex flex-col gap-4">
              <FormField label="Animal *">
                <Select value={cibleId} onValueChange={(v) => setCibleId(v ?? "")}>
                  <SelectTrigger className="h-10 w-full rounded-[6px] border border-border bg-card">
                    <SelectValue placeholder="Rechercher un animal" />
                  </SelectTrigger>
                  <SelectContent>
                    {(animaux ?? []).map((a) => (
                      <SelectItem key={a.id} value={a.id}>{a.identifiant} - {a.race?.nom} ({a.parcelle?.nom ?? "sans parcelle"})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField label="Parcelle d'origine">
                  <input type="text" disabled value={selectedAnimal?.parcelle?.nom ?? "Non affecte"} className={`${inputCls} cursor-not-allowed bg-surface text-subtle`} />
                </FormField>
                <FormField label="Parcelle de destination *" hint={selectedDestination ? `${freePlaces} place(s) libre(s)` : undefined}>
                  <Select value={parcelleDestId} onValueChange={(v) => setParcelleDestId(v ?? "")}>
                    <SelectTrigger className="h-10 w-full rounded-[6px] border border-border bg-card">
                      <SelectValue placeholder="Selectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      {(parcelles ?? []).map((p) => (
                        <SelectItem key={p.id} value={p.id}>{p.nom} ({Math.max(0, p.capaciteMax - (p.nbActuels ?? 0))} libres)</SelectItem>
                      ))}
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
                    <SelectValue placeholder="Selectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="phase">Changement de phase</SelectItem>
                    <SelectItem value="sante">Isolement sanitaire</SelectItem>
                    <SelectItem value="capacite">Gestion de capacite</SelectItem>
                    <SelectItem value="autre">Autre</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>

              <FormField label="Notes">
                <textarea name="notes" rows={3} className="w-full resize-none rounded-[6px] border border-border bg-card p-3 font-inter text-[13px] text-label placeholder:text-placeholder focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" placeholder="Contexte ou observations" />
              </FormField>
            </div>

            <div className="mt-6 flex justify-end gap-2.5">
              <Link href="/parcelles" className="flex items-center rounded-[6px] border border-border bg-surface px-4 py-2 font-dm-sans text-[13px] font-semibold text-subtle transition-colors hover:bg-border-light">
                Annuler
              </Link>
              <button disabled={submitting} type="submit" className="flex items-center gap-1.5 rounded-[6px] bg-primary px-4 py-2 font-dm-sans text-[13px] font-semibold text-white transition-colors hover:bg-primary-hover disabled:opacity-50">
                <Icon name="check" size={14} />
                {submitting ? "Transfert..." : "Confirmer"}
              </button>
            </div>
          </form>

          <aside className="rounded-[12px] border border-border-light bg-card p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-[8px] bg-primary-light text-primary">
                <Icon name="map-pin" size={18} />
              </div>
              <div>
                <h2 className="font-dm-sans text-base font-bold text-label">Resume</h2>
                <p className="font-inter text-xs text-subtle">Controle avant validation</p>
              </div>
            </div>
            <div className="mt-5 space-y-4">
              <div>
                <p className="font-inter text-[11px] font-bold uppercase tracking-wide text-placeholder">Animal</p>
                <p className="mt-1 font-inter text-sm font-semibold text-label">{selectedAnimal?.identifiant ?? "Non selectionne"}</p>
              </div>
              <div>
                <p className="font-inter text-[11px] font-bold uppercase tracking-wide text-placeholder">Origine</p>
                <p className="mt-1 font-inter text-sm text-subtle">{selectedAnimal?.parcelle?.nom ?? "Non affecte"}</p>
              </div>
              <div>
                <p className="font-inter text-[11px] font-bold uppercase tracking-wide text-placeholder">Destination</p>
                <p className="mt-1 font-inter text-sm text-subtle">{selectedDestination?.nom ?? "Non selectionnee"}</p>
              </div>
              <div className="rounded-[8px] bg-surface p-3">
                <p className="font-inter text-[12px] text-subtle">Places libres</p>
                <p className={`mt-1 font-dm-sans text-2xl font-bold ${freePlaces === 0 ? "text-danger" : "text-label"}`}>
                  {freePlaces ?? "-"}
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
