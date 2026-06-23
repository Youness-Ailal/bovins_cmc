"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import Icon from "@/components/ui/Icon";
import { useSaveToast } from "@/lib/useSaveToast";
import { useToast } from "@/components/ui/Toast";
import { useApi } from "@/lib/useApi";
import { api } from "@/lib/api";
import DatePicker from "@/components/ui/DatePicker";
import { useSearchParams } from "next/navigation";
import type { Animal } from "@/lib/types";

const ETAT_MAP: Record<string, string> = {
  sain: "Sain", traitement: "En traitement", malade: "Malade",
};

const ETATS = [
  {
    id: "sain",
    label: "Sain",
    desc: "Aucun signe clinique",
    icon: "check-circle",
    active: "border-success/40 bg-success/10 text-success",
    inactive: "border-border-light bg-surface text-placeholder",
  },
  {
    id: "traitement",
    label: "En traitement",
    desc: "Sous médication active",
    icon: "syringe",
    active: "border-warning/40 bg-warning/10 text-warning",
    inactive: "border-border-light bg-surface text-placeholder",
  },
  {
    id: "malade",
    label: "Malade",
    desc: "Symptômes sévères",
    icon: "skull",
    active: "border-danger/40 bg-danger/10 text-danger",
    inactive: "border-border-light bg-surface text-placeholder",
  },
];

const ACTION_OPTS = [
  { value: "",            label: "Aucune action requise" },
  { value: "surveillance", label: "Surveillance renforcée" },
  { value: "traitement",  label: "Démarrer un traitement" },
  { value: "isolement",   label: "Isolement immédiat" },
  { value: "veterinaire", label: "Appeler le vétérinaire" },
];

const selectCls = "h-10 w-full rounded-[6px] border border-border-light bg-surface px-3 font-inter text-[13px] text-label focus:border-primary focus:outline-none";
const inputCls  = "h-10 w-full rounded-[6px] border border-border-light bg-surface px-3 font-inter text-[13px] text-label placeholder:text-placeholder focus:border-primary focus:outline-none";

function NouvelEtatSanteForm() {
  const params    = useSearchParams();
  const preAnimal = params.get("animal") ?? "";

  const { data: animaux } = useApi<Animal[]>("/animaux");
  const [animalId, setAnimalId] = useState(preAnimal);
  const [etat, setEtat]         = useState("sain");
  const [action, setAction]     = useState("");
  const [date, setDate]         = useState<Date | undefined>(new Date());
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { if (preAnimal) setAnimalId(preAnimal); }, [preAnimal]);

  const notifySaved = useSaveToast();
  const { error: toastError } = useToast();

  const selectedAnimal = (animaux ?? []).find((a) => a.id === animalId) ?? null;
  const selectedEtat   = ETATS.find((e) => e.id === etat)!;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!animalId) return toastError("Sélectionnez un animal");
    const fd = new FormData(e.currentTarget as HTMLFormElement);
    setSubmitting(true);
    try {
      await api.post("/sante/etats", {
        animal:     animalId,
        etat:       ETAT_MAP[etat],
        date:       date ?? new Date(),
        temperature: fd.get("temperature") ? Number(fd.get("temperature")) : null,
        poids:       fd.get("poids")       ? Number(fd.get("poids"))       : null,
        symptomes:   String(fd.get("symptomes") || ""),
        action,
      });
      notifySaved("État de santé enregistré", "/sante/etat");
    } catch (err) {
      toastError(err instanceof Error ? err.message : "Erreur");
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-surface">
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-border-light bg-card px-7">
        <div className="flex items-center gap-1.5">
          <Link href="/sante/etat" className="font-inter text-sm text-subtle hover:text-label transition-colors">État de santé</Link>
          <Icon name="chevron-right" size={14} className="text-placeholder" />
          <span className="font-dm-sans text-[15px] font-semibold text-label">Nouvelle observation</span>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/sante/etat" className="flex items-center gap-1.5 rounded-[6px] border border-border-light bg-surface px-3.5 py-2 font-dm-sans text-[13px] font-semibold text-subtle hover:bg-border-light transition-colors">
            Annuler
          </Link>
          <button
            type="submit" form="etat-form" disabled={submitting || !animalId}
            className="flex items-center gap-1.5 rounded-[6px] bg-primary px-3.5 py-2 font-dm-sans text-[13px] font-semibold text-white hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            <Icon name="save" size={14} />
            {submitting ? "Enregistrement…" : "Enregistrer"}
          </button>
        </div>
      </header>

      <form id="etat-form" onSubmit={handleSubmit} noValidate className="flex flex-1 gap-6 overflow-auto p-6">
        {/* Left: form */}
        <div className="flex flex-1 flex-col gap-4 min-w-0">

          {/* Animal & date */}
          <div className="rounded-[12px] border border-border-light bg-card p-5">
            <h2 className="font-dm-sans text-[14px] font-semibold text-label">Animal &amp; date</h2>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="font-inter text-[12px] font-medium text-subtle">Animal concerné *</label>
                <select value={animalId} onChange={(e) => setAnimalId(e.target.value)} className={selectCls}>
                  <option value="">— Sélectionner un animal —</option>
                  {(animaux ?? []).map((a) => (
                    <option key={a.id} value={a.id}>{a.identifiant}{a.race?.nom ? ` — ${a.race.nom}` : ""}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-inter text-[12px] font-medium text-subtle">Date d'observation *</label>
                <DatePicker value={date} onChange={setDate} />
              </div>
            </div>
          </div>

          {/* État picker */}
          <div className="rounded-[12px] border border-border-light bg-card p-5">
            <h2 className="font-dm-sans text-[14px] font-semibold text-label">État de santé observé *</h2>
            <div className="mt-4 grid grid-cols-3 gap-3">
              {ETATS.map(({ id, label, desc, icon, active, inactive }) => (
                <button
                  key={id} type="button" onClick={() => setEtat(id)}
                  className={`flex flex-col items-center gap-2.5 rounded-[10px] border-2 px-4 py-5 transition-all ${etat === id ? active : inactive}`}
                >
                  <Icon name={icon} size={24} />
                  <div className="text-center">
                    <p className="font-dm-sans text-[13px] font-bold">{label}</p>
                    <p className={`mt-0.5 font-inter text-[11px] ${etat === id ? "opacity-70" : "text-placeholder"}`}>{desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Mesures cliniques */}
          <div className="rounded-[12px] border border-border-light bg-card p-5">
            <h2 className="font-dm-sans text-[14px] font-semibold text-label">Mesures cliniques</h2>
            <p className="mt-0.5 font-inter text-[12px] text-subtle">Optionnel — renseignez si disponible.</p>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="font-inter text-[12px] font-medium text-subtle">Température (°C)</label>
                <input type="number" name="temperature" min="35" max="43" step="0.1" placeholder="38.5" className={inputCls} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-inter text-[12px] font-medium text-subtle">Poids observé (kg)</label>
                <input type="number" name="poids" min="0" step="0.1" placeholder="0" className={inputCls} />
              </div>
            </div>
          </div>

          {/* Symptômes & action */}
          <div className="rounded-[12px] border border-border-light bg-card p-5">
            <h2 className="font-dm-sans text-[14px] font-semibold text-label">Symptômes &amp; action</h2>
            <div className="mt-4 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="font-inter text-[12px] font-medium text-subtle">Symptômes observés</label>
                <textarea
                  name="symptomes" rows={3}
                  placeholder="Décrivez les symptômes : fièvre, abattement, perte d'appétit…"
                  className="w-full resize-none rounded-[6px] border border-border-light bg-surface p-3 font-inter text-[13px] text-label placeholder:text-placeholder focus:border-primary focus:outline-none"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-inter text-[12px] font-medium text-subtle">Action recommandée</label>
                <select value={action} onChange={(e) => setAction(e.target.value)} className={selectCls}>
                  {ACTION_OPTS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Right: summary panel */}
        <div className="w-[260px] shrink-0 flex flex-col gap-4">
          {/* Animal card */}
          <div className="rounded-[12px] border border-border-light bg-card p-5">
            <h2 className="font-dm-sans text-[13px] font-semibold text-label">Animal</h2>
            {selectedAnimal ? (
              <div className="mt-3 flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <Icon name="beef" size={18} className="text-primary" />
                </div>
                <div>
                  <p className="font-dm-sans text-[15px] font-bold text-label">{selectedAnimal.identifiant}</p>
                  <p className="font-inter text-[12px] text-subtle">{selectedAnimal.race?.nom ?? "Race inconnue"}</p>
                </div>
              </div>
            ) : (
              <p className="mt-3 font-inter text-[12px] text-placeholder">Aucun animal sélectionné</p>
            )}
          </div>

          {/* Etat preview */}
          <div className={`rounded-[12px] border-2 p-5 ${selectedEtat.active}`}>
            <div className="flex items-center gap-3">
              <Icon name={selectedEtat.icon} size={28} />
              <div>
                <p className="font-dm-sans text-[16px] font-bold">{selectedEtat.label}</p>
                <p className="font-inter text-[12px] opacity-70">{selectedEtat.desc}</p>
              </div>
            </div>
          </div>

          {/* Action badge */}
          {action && action !== "" && (
            <div className="flex items-center gap-2.5 rounded-[10px] border border-warning/20 bg-warning/5 px-4 py-3">
              <Icon name="triangle-alert" size={14} className="shrink-0 text-warning" />
              <span className="font-inter text-[12px] text-warning font-semibold">
                {ACTION_OPTS.find((o) => o.value === action)?.label}
              </span>
            </div>
          )}

          <button
            type="submit" form="etat-form" disabled={submitting || !animalId}
            className="w-full rounded-[8px] bg-primary py-3 font-dm-sans text-[13px] font-semibold text-white hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {submitting ? "Enregistrement…" : "Enregistrer l'observation"}
          </button>
          {!animalId && (
            <p className="text-center font-inter text-[11px] text-placeholder">Sélectionnez un animal pour continuer.</p>
          )}
        </div>
      </form>
    </div>
  );
}

export default function NouvelEtatSantePage() {
  return (
    <Suspense>
      <NouvelEtatSanteForm />
    </Suspense>
  );
}
