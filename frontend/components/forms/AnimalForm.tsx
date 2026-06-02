"use client";

import { useState } from "react";
import Link from "next/link";
import Icon from "@/components/ui/Icon";
import DatePicker from "@/components/ui/DatePicker";
import { useSaveToast } from "@/lib/useSaveToast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
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
  const [sexe, setSexe] = useState<"male" | "female">("male");
  const [dateEntree, setDateEntree] = useState<Date | undefined>();
  const notifySaved = useSaveToast();

  const breadcrumb = mode === "create" ? "Nouvel animal" : (animalId ?? "Modifier");
  const cancelHref = mode === "create" ? "/animaux" : `/animaux/${animalId}`;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // TODO: integrate with API — POST /api/animaux (create) or PUT /api/animaux/:id (edit)
    notifySaved(
      mode === "create" ? "Animal créé avec succès" : "Animal mis à jour avec succès",
      mode === "create" ? "/animaux" : `/animaux/${animalId}`
    );
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-surface">
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-border-light bg-card px-7">
        <div className="flex items-center gap-1.5">
          <Link href="/animaux" className="font-inter text-sm text-placeholder hover:text-subtle transition-colors">
            Animaux
          </Link>
          <span className="font-inter text-sm text-placeholder">/</span>
          <span className="font-dm-sans text-xl font-semibold text-label">
            {mode === "create" ? "Nouvel animal" : "Modifier animal"}
          </span>
          <span className="font-inter text-sm text-placeholder">/ {breadcrumb}</span>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={cancelHref}
            className="flex items-center gap-1.5 rounded-[6px] border border-border-light bg-surface px-3.5 py-2 font-dm-sans text-[13px] font-semibold text-subtle hover:bg-border-light transition-colors"
          >
            Annuler
          </Link>
          <button
            type="submit"
            form="animal-form"
            className="flex items-center gap-1.5 rounded-[6px] bg-primary px-3.5 py-2 font-dm-sans text-[13px] font-semibold text-white hover:bg-primary-hover transition-colors"
          >
            <Icon name="save" size={14} />
            Enregistrer
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-auto p-8">
        <div className="w-full">
          <form
            id="animal-form"
            onSubmit={handleSubmit}
            noValidate
            className="rounded-[12px] border border-border-light bg-card p-7"
          >
            <h2 className="font-dm-sans text-base font-bold text-label">
              Informations de l&apos;animal
            </h2>
            <p className="mt-1 font-inter text-[13px] text-subtle">
              {mode === "create"
                ? "Remplissez les champs ci-dessous pour créer une nouvelle fiche animal."
                : "Modifiez les informations de cet animal."}
            </p>

            <div className="mt-6 flex gap-5">
              {/* Left column */}
              <div className="flex flex-1 flex-col gap-4">
                <FormField label="NNI / Identifiant *">
                  <input
                    type="text"
                    name="nni"
                    placeholder="Ex: MA-2024-00175"
                    required
                    defaultValue={mode === "edit" ? "MA-2023-00174" : ""}
                    className={inputCls}
                  />
                </FormField>

                <FormField label="Race *">
                  <Select name="race" defaultValue={mode === "edit" ? "holstein" : undefined}>
                    <SelectTrigger className="h-10 w-full rounded-[6px] border border-border bg-card font-inter text-[13px]">
                      <SelectValue placeholder="Sélectionner une race" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="holstein">Holstein</SelectItem>
                      <SelectItem value="angus">Angus</SelectItem>
                      <SelectItem value="limousin">Limousin</SelectItem>
                      <SelectItem value="charolais">Charolais</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>

                <FormField label="Sexe *">
                  <div className="flex gap-2.5">
                    {(["male", "female"] as const).map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setSexe(s)}
                        className={`flex items-center gap-2 rounded-[6px] px-3.5 py-2 font-inter text-[13px] transition-colors ${
                          sexe === s
                            ? "border-2 border-primary bg-primary-light font-medium text-primary"
                            : "border border-border bg-card text-subtle"
                        }`}
                      >
                        {s === "male" ? "Mâle" : "Femelle"}
                      </button>
                    ))}
                  </div>
                </FormField>

                <FormField label="Origine">
                  <Select name="origine" defaultValue="ferme">
                    <SelectTrigger className="h-10 w-full rounded-[6px] border border-border bg-card font-inter text-[13px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ferme">Né à la ferme</SelectItem>
                      <SelectItem value="achat">Acheté</SelectItem>
                      <SelectItem value="transfert">Transféré</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>

                <FormField label="Phase actuelle *">
                  <Select name="phase" defaultValue={mode === "edit" ? "croissance" : undefined}>
                    <SelectTrigger className="h-10 w-full rounded-[6px] border border-border bg-card font-inter text-[13px]">
                      <SelectValue placeholder="Sélectionner la phase" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="croissance">Croissance</SelectItem>
                      <SelectItem value="engraissement">Engraissement</SelectItem>
                      <SelectItem value="finition">Finition</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>
              </div>

              {/* Right column */}
              <div className="flex flex-1 flex-col gap-4">
                <FormField label="Père (optionnel)">
                  <input
                    type="text"
                    name="pere"
                    placeholder="Identifiant du père…"
                    defaultValue={mode === "edit" ? "BL-450-P" : ""}
                    className={inputCls}
                  />
                </FormField>

                <FormField label="Mère (optionnel)">
                  <input
                    type="text"
                    name="mere"
                    placeholder="Identifiant de la mère…"
                    defaultValue={mode === "edit" ? "BL-312-M" : ""}
                    className={inputCls}
                  />
                </FormField>

                <FormField label="Poids d'entrée (kg) *">
                  <div className="flex h-10 items-center justify-between rounded-[6px] border border-border bg-card px-3 transition-colors focus-within:border-primary focus-within:ring-1 focus-within:ring-primary">
                    <input
                      type="number"
                      name="poidsEntree"
                      min="0"
                      step="0.1"
                      defaultValue={mode === "edit" ? "320" : ""}
                      placeholder="0.0"
                      className="w-full bg-transparent font-inter text-[13px] text-label focus:outline-none"
                    />
                    <span className="font-inter text-xs text-placeholder">kg</span>
                  </div>
                </FormField>

                <FormField label="Date d'entrée *">
                  <DatePicker value={dateEntree} onChange={setDateEntree} />
                </FormField>

                <FormField label="Parcelle assignée">
                  <Select name="parcelle" defaultValue={mode === "edit" ? "parcelle-alpha" : undefined}>
                    <SelectTrigger className="h-10 w-full rounded-[6px] border border-border bg-card font-inter text-[13px]">
                      <SelectValue placeholder="Sélectionner une parcelle" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="parcelle-alpha">Parcelle Alpha</SelectItem>
                      <SelectItem value="parcelle-beta">Parcelle Beta</SelectItem>
                      <SelectItem value="parcelle-gamma">Parcelle Gamma</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-1.5">
              <label className="font-inter text-xs font-medium text-label">Notes</label>
              <textarea
                name="notes"
                rows={3}
                className="w-full resize-none rounded-[6px] border border-border bg-card p-3 font-inter text-[13px] text-label placeholder:text-placeholder transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="Notes ou observations…"
              />
            </div>

            <div className="mt-5 flex justify-end gap-2.5">
              <Link
                href={cancelHref}
                className="flex items-center rounded-[6px] border border-border bg-surface px-4 py-2 font-dm-sans text-[13px] font-semibold text-subtle hover:bg-border-light transition-colors"
              >
                Annuler
              </Link>
              <button
                type="submit"
                className="flex items-center gap-1.5 rounded-[6px] bg-primary px-4 py-2 font-dm-sans text-[13px] font-semibold text-white hover:bg-primary-hover transition-colors"
              >
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
