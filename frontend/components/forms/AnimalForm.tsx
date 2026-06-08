"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Icon from "@/components/ui/Icon";
import DatePicker from "@/components/ui/DatePicker";
import { useSaveToast } from "@/lib/useSaveToast";
import { useToast } from "@/components/ui/Toast";
import { useApi } from "@/lib/useApi";
import { api } from "@/lib/api";
import type { Race, Parcelle, Animal } from "@/lib/types";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

interface AnimalFormProps {
  mode: "create" | "edit";
  animalId?: string;
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="font-inter text-xs font-medium text-label">{label}</label>
      {children}
    </div>
  );
}

const inputCls =
  "h-10 w-full rounded-[6px] border border-border px-3 font-inter text-[13px] text-label bg-card placeholder:text-placeholder transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary";

export default function AnimalForm({ mode, animalId }: AnimalFormProps) {
  const notifySaved = useSaveToast();
  const { error: toastError } = useToast();

  const { data: races } = useApi<Race[]>("/races");
  const { data: parcelles } = useApi<Parcelle[]>("/parcelles");
  const { data: animal } = useApi<Animal>(mode === "edit" && animalId ? `/animaux/${animalId}` : null);

  const [form, setForm] = useState({
    identifiant: "",
    race: "",
    sexe: "Mâle",
    origine: "ferme",
    phase: "Croissance",
    pere: "",
    mere: "",
    poidsEntree: "",
    parcelle: "",
    notes: "",
  });
  const [dateEntree, setDateEntree] = useState<Date | undefined>();
  const [submitting, setSubmitting] = useState(false);

  // Prefill in edit mode
  useEffect(() => {
    if (animal) {
      setForm({
        identifiant: animal.identifiant ?? "",
        race: animal.race?.id ?? "",
        sexe: animal.sexe ?? "Mâle",
        origine: animal.origine ?? "ferme",
        phase: animal.phase ?? "Croissance",
        pere: animal.pere ?? "",
        mere: animal.mere ?? "",
        poidsEntree: String(animal.poidsEntree ?? ""),
        parcelle: animal.parcelle?.id ?? "",
        notes: animal.notes ?? "",
      });
      if (animal.dateEntree) setDateEntree(new Date(animal.dateEntree));
    }
  }, [animal]);

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  const cancelHref = mode === "create" ? "/animaux" : `/animaux/${animalId}`;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.identifiant || !form.race) {
      toastError("Identifiant et race sont requis");
      return;
    }
    setSubmitting(true);
    const payload = {
      identifiant: form.identifiant,
      race: form.race,
      sexe: form.sexe,
      origine: form.origine,
      phase: form.phase,
      pere: form.pere,
      mere: form.mere,
      poidsEntree: Number(form.poidsEntree) || 0,
      dateEntree: dateEntree ?? new Date(),
      parcelle: form.parcelle || null,
      notes: form.notes,
    };
    try {
      if (mode === "create") {
        await api.post("/animaux", payload);
        notifySaved("Animal créé avec succès", "/animaux");
      } else {
        await api.put(`/animaux/${animalId}`, payload);
        notifySaved("Animal mis à jour avec succès", `/animaux/${animalId}`);
      }
    } catch (err) {
      toastError(err instanceof Error ? err.message : "Échec de l'enregistrement");
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-surface">
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-border-light bg-card px-7">
        <div className="flex items-center gap-1.5">
          <Link href="/animaux" className="font-inter text-sm text-placeholder hover:text-subtle transition-colors">Animaux</Link>
          <span className="font-inter text-sm text-placeholder">/</span>
          <span className="font-dm-sans text-xl font-semibold text-label">{mode === "create" ? "Nouvel animal" : "Modifier animal"}</span>
        </div>
        <div className="flex items-center gap-2">
          <Link href={cancelHref} className="flex items-center gap-1.5 rounded-[6px] border border-border-light bg-surface px-3.5 py-2 font-dm-sans text-[13px] font-semibold text-subtle hover:bg-border-light transition-colors">
            Annuler
          </Link>
          <button type="submit" form="animal-form" disabled={submitting} className="flex items-center gap-1.5 rounded-[6px] bg-primary px-3.5 py-2 font-dm-sans text-[13px] font-semibold text-white hover:bg-primary-hover transition-colors disabled:opacity-50">
            <Icon name="save" size={14} />
            {submitting ? "Enregistrement…" : "Enregistrer"}
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-auto p-8">
        <div className="w-full">
          <form id="animal-form" onSubmit={handleSubmit} noValidate className="rounded-[12px] border border-border-light bg-card p-7">
            <h2 className="font-dm-sans text-base font-bold text-label">Informations de l&apos;animal</h2>
            <p className="mt-1 font-inter text-[13px] text-subtle">
              {mode === "create" ? "Remplissez les champs ci-dessous pour créer une nouvelle fiche animal." : "Modifiez les informations de cet animal."}
            </p>

            <div className="mt-6 flex gap-5">
              {/* Left column */}
              <div className="flex flex-1 flex-col gap-4">
                <FormField label="NNI / Identifiant *">
                  <input type="text" placeholder="Ex: ANI-009" value={form.identifiant} onChange={(e) => set("identifiant", e.target.value)} className={inputCls} />
                </FormField>

                <FormField label="Race *">
                  <Select value={form.race} onValueChange={(v) => set("race", v ?? "")}>
                    <SelectTrigger className="h-10 w-full rounded-[6px] border border-border bg-card font-inter text-[13px]">
                      <SelectValue placeholder="Sélectionner une race" />
                    </SelectTrigger>
                    <SelectContent>
                      {(races ?? []).map((r) => <SelectItem key={r.id} value={r.id}>{r.nom}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </FormField>

                <FormField label="Sexe *">
                  <div className="flex gap-2.5">
                    {(["Mâle", "Femelle"] as const).map((s) => (
                      <button key={s} type="button" onClick={() => set("sexe", s)}
                        className={`flex items-center gap-2 rounded-[6px] px-3.5 py-2 font-inter text-[13px] transition-colors ${form.sexe === s ? "border-2 border-primary bg-primary-light font-medium text-primary" : "border border-border bg-card text-subtle"}`}>
                        {s}
                      </button>
                    ))}
                  </div>
                </FormField>

                <FormField label="Origine">
                  <Select value={form.origine} onValueChange={(v) => set("origine", v ?? "ferme")}>
                    <SelectTrigger className="h-10 w-full rounded-[6px] border border-border bg-card font-inter text-[13px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ferme">Né à la ferme</SelectItem>
                      <SelectItem value="achat">Acheté</SelectItem>
                      <SelectItem value="transfert">Transféré</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>

                <FormField label="Phase actuelle *">
                  <Select value={form.phase} onValueChange={(v) => set("phase", v ?? "Croissance")}>
                    <SelectTrigger className="h-10 w-full rounded-[6px] border border-border bg-card font-inter text-[13px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Veau">Veau</SelectItem>
                      <SelectItem value="Croissance">Croissance</SelectItem>
                      <SelectItem value="Engraissement">Engraissement</SelectItem>
                      <SelectItem value="Finition">Finition</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>
              </div>

              {/* Right column */}
              <div className="flex flex-1 flex-col gap-4">
                <FormField label="Père (optionnel)">
                  <input type="text" placeholder="Identifiant du père…" value={form.pere} onChange={(e) => set("pere", e.target.value)} className={inputCls} />
                </FormField>

                <FormField label="Mère (optionnel)">
                  <input type="text" placeholder="Identifiant de la mère…" value={form.mere} onChange={(e) => set("mere", e.target.value)} className={inputCls} />
                </FormField>

                <FormField label="Poids d'entrée (kg) *">
                  <div className="flex h-10 items-center justify-between rounded-[6px] border border-border bg-card px-3 transition-colors focus-within:border-primary focus-within:ring-1 focus-within:ring-primary">
                    <input type="number" min="0" step="0.1" placeholder="0.0" value={form.poidsEntree} onChange={(e) => set("poidsEntree", e.target.value)} className="w-full bg-transparent font-inter text-[13px] text-label focus:outline-none" />
                    <span className="font-inter text-xs text-placeholder">kg</span>
                  </div>
                </FormField>

                <FormField label="Date d'entrée *">
                  <DatePicker value={dateEntree} onChange={setDateEntree} />
                </FormField>

                <FormField label="Parcelle assignée">
                  <Select value={form.parcelle} onValueChange={(v) => set("parcelle", v ?? "")}>
                    <SelectTrigger className="h-10 w-full rounded-[6px] border border-border bg-card font-inter text-[13px]">
                      <SelectValue placeholder="Sélectionner une parcelle" />
                    </SelectTrigger>
                    <SelectContent>
                      {(parcelles ?? []).map((p) => <SelectItem key={p.id} value={p.id}>{p.nom}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </FormField>

              </div>
            </div>

            <div className="mt-5 flex flex-col gap-1.5">
              <label className="font-inter text-xs font-medium text-label">Notes</label>
              <textarea rows={3} value={form.notes} onChange={(e) => set("notes", e.target.value)} className="w-full resize-none rounded-[6px] border border-border bg-card p-3 font-inter text-[13px] text-label placeholder:text-placeholder transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" placeholder="Notes ou observations…" />
            </div>

            <div className="mt-5 flex justify-end gap-2.5">
              <Link href={cancelHref} className="flex items-center rounded-[6px] border border-border bg-surface px-4 py-2 font-dm-sans text-[13px] font-semibold text-subtle hover:bg-border-light transition-colors">
                Annuler
              </Link>
              <button type="submit" disabled={submitting} className="flex items-center gap-1.5 rounded-[6px] bg-primary px-4 py-2 font-dm-sans text-[13px] font-semibold text-white hover:bg-primary-hover transition-colors disabled:opacity-50">
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
