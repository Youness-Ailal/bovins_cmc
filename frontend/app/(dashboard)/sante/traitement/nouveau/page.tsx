"use client";

import { useState } from "react";
import Link from "next/link";
import Icon from "@/components/ui/Icon";
import { useSaveToast } from "@/lib/useSaveToast";
import { useToast } from "@/components/ui/Toast";
import { useApi } from "@/lib/useApi";
import { api } from "@/lib/api";
import DatePicker from "@/components/ui/DatePicker";
import type { Animal, StockArticle } from "@/lib/types";

const TYPE_OPTS = [
  { value: "Antibiotique",       icon: "skull",        sel: "bg-danger/10 border-danger/30 text-danger" },
  { value: "Antiparasitaire",    icon: "dna",          sel: "bg-warning/10 border-warning/30 text-warning" },
  { value: "Anti-inflammatoire", icon: "shield-alert", sel: "bg-info/10 border-info/30 text-info" },
  { value: "Vaccin",             icon: "syringe",      sel: "bg-success/10 border-success/30 text-success" },
  { value: "Autre",              icon: "stethoscope",  sel: "bg-surface border-border-light text-subtle" },
];

const VOIE_OPTS = [
  { value: "Injection intramusculaire (IM)", label: "Injection IM" },
  { value: "Injection intraveineuse (IV)",   label: "Injection IV" },
  { value: "Injection sous-cutanée (SC)",    label: "Injection SC" },
  { value: "Voie orale",                     label: "Voie orale" },
  { value: "Voie topique / externe",         label: "Topique / externe" },
  { value: "Intranasale",                    label: "Intranasale" },
];

const selectCls = "h-10 w-full rounded-[6px] border border-border-light bg-surface px-3 font-inter text-[13px] text-label focus:border-primary focus:outline-none";
const inputCls  = "h-10 w-full rounded-[6px] border border-border-light bg-surface px-3 font-inter text-[13px] text-label placeholder:text-placeholder focus:border-primary focus:outline-none";

function Label({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <div className="flex items-baseline gap-2">
      <label className="font-inter text-[12px] font-medium text-subtle">{children}</label>
      {hint && <span className="font-inter text-[11px] text-placeholder">{hint}</span>}
    </div>
  );
}

export default function NouveauTraitementPage() {
  const { data: animaux } = useApi<Animal[]>("/animaux");
  const { data: articles } = useApi<StockArticle[]>("/stocks");
  const medicaments = (articles ?? []).filter((a) => a.categorie === "Médicaments");

  const [animalId, setAnimalId]     = useState("");
  const [type, setType]             = useState("");
  const [articleId, setArticleId]   = useState("");
  const [doseUnite, setDoseUnite]   = useState("ml");
  const [voie, setVoie]             = useState("");
  const [dateDebut, setDateDebut]   = useState<Date | undefined>(new Date());
  const [dateFin, setDateFin]       = useState<Date | undefined>();
  const [delaiRetrait, setDelaiRetrait] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const notifySaved = useSaveToast();
  const { error: toastError } = useToast();

  const selectedAnimal    = (animaux ?? []).find((a) => a.id === animalId) ?? null;
  const selectedMedicament = medicaments.find((m) => m.id === articleId) ?? null;
  const canSubmit = !!animalId && !!type;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!animalId) return toastError("Sélectionnez un animal");
    if (!type)     return toastError("Sélectionnez un type de traitement");
    const fd = new FormData(e.currentTarget as HTMLFormElement);
    setSubmitting(true);
    try {
      await api.post("/sante/traitements", {
        animal:        animalId,
        type,
        produit:       selectedMedicament?.designation || String(fd.get("produitLibre") || "Produit"),
        article:       articleId || null,
        dose:          Number(fd.get("dose")) || 0,
        doseUnite,
        voie,
        dateDebut:     dateDebut ?? new Date(),
        dateFin:       dateFin ?? null,
        veterinaire:   String(fd.get("veterinaire") || ""),
        delaiRetrait,
        observations:  String(fd.get("observations") || ""),
      });
      notifySaved("Traitement enregistré — stock médicament déduit", "/sante");
    } catch (err) {
      toastError(err instanceof Error ? err.message : "Erreur");
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-surface">
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-border-light bg-card px-7">
        <div className="flex items-center gap-1.5">
          <Link href="/sante" className="font-inter text-sm text-subtle hover:text-label transition-colors">Santé</Link>
          <Icon name="chevron-right" size={14} className="text-placeholder" />
          <span className="font-dm-sans text-[15px] font-semibold text-label">Nouveau traitement</span>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/sante" className="flex items-center gap-1.5 rounded-[6px] border border-border-light bg-surface px-3.5 py-2 font-dm-sans text-[13px] font-semibold text-subtle hover:bg-border-light transition-colors">
            Annuler
          </Link>
          <button
            type="submit" form="traitement-form" disabled={submitting || !canSubmit}
            className="flex items-center gap-1.5 rounded-[6px] bg-primary px-3.5 py-2 font-dm-sans text-[13px] font-semibold text-white hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            <Icon name="save" size={14} />
            {submitting ? "Enregistrement…" : "Enregistrer"}
          </button>
        </div>
      </header>

      <form id="traitement-form" onSubmit={handleSubmit} noValidate className="flex flex-1 gap-6 overflow-auto p-6">
        {/* Left: form sections */}
        <div className="flex flex-1 flex-col gap-4 min-w-0">

          {/* Section 1: Animal & type */}
          <div className="rounded-[12px] border border-border-light bg-card p-5">
            <h2 className="font-dm-sans text-[14px] font-semibold text-label">Animal &amp; intervention</h2>
            <div className="mt-4 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label>Animal concerné *</Label>
                <select
                  value={animalId} onChange={(e) => setAnimalId(e.target.value)}
                  className={selectCls}
                >
                  <option value="">— Sélectionner un animal —</option>
                  {(animaux ?? []).map((a) => (
                    <option key={a.id} value={a.id}>{a.identifiant}{a.race?.nom ? ` — ${a.race.nom}` : ""}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label>Type de traitement *</Label>
                <div className="grid grid-cols-5 gap-2">
                  {TYPE_OPTS.map((opt) => (
                    <button
                      key={opt.value} type="button" onClick={() => setType(opt.value)}
                      className={`flex flex-col items-center gap-1.5 rounded-[8px] border px-2 py-3 font-inter text-[11px] font-semibold transition-all ${
                        type === opt.value ? opt.sel : "border-border-light bg-surface text-placeholder hover:bg-card"
                      }`}
                    >
                      <Icon name={opt.icon} size={16} />
                      {opt.value}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label>Vétérinaire / Intervenant</Label>
                <input type="text" name="veterinaire" placeholder="Nom du vétérinaire…" className={inputCls} />
              </div>
            </div>
          </div>

          {/* Section 2: Produit & dose */}
          <div className="rounded-[12px] border border-border-light bg-card p-5">
            <h2 className="font-dm-sans text-[14px] font-semibold text-label">Produit &amp; dose</h2>
            <div className="mt-4 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label hint="— stock déduit automatiquement">Médicament en stock</Label>
                <select
                  value={articleId} onChange={(e) => setArticleId(e.target.value)}
                  className={selectCls}
                >
                  <option value="">— Sélectionner un médicament —</option>
                  {medicaments.map((m) => (
                    <option key={m.id} value={m.id}>{m.designation} ({m.quantite} {m.unite} en stock)</option>
                  ))}
                </select>
                {medicaments.length === 0 && (
                  <p className="font-inter text-[11px] text-placeholder">Aucun médicament en stock — ajoutez d'abord un article de catégorie "Médicaments".</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label>Dose administrée</Label>
                  <div className="flex h-10 overflow-hidden rounded-[6px] border border-border-light focus-within:border-primary">
                    <input
                      type="number" name="dose" min="0" step="0.01" placeholder="0"
                      className="flex-1 bg-surface px-3 font-inter text-[13px] text-label focus:outline-none"
                    />
                    <select
                      value={doseUnite} onChange={(e) => setDoseUnite(e.target.value)}
                      className="w-20 shrink-0 border-l border-border-light bg-card px-2 font-inter text-[12px] text-subtle focus:outline-none"
                    >
                      <option value="ml">ml</option>
                      <option value="mg">mg</option>
                      <option value="g">g</option>
                      <option value="comp">comp.</option>
                      <option value="dose">dose</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label>Voie d'administration</Label>
                  <select value={voie} onChange={(e) => setVoie(e.target.value)} className={selectCls}>
                    <option value="">— Choisir —</option>
                    {VOIE_OPTS.map((v) => (
                      <option key={v.value} value={v.value}>{v.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Dates */}
          <div className="rounded-[12px] border border-border-light bg-card p-5">
            <h2 className="font-dm-sans text-[14px] font-semibold text-label">Durée &amp; retrait</h2>
            <div className="mt-4 grid grid-cols-3 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label>Date de début *</Label>
                <DatePicker value={dateDebut} onChange={setDateDebut} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label hint="— optionnel">Date de fin</Label>
                <DatePicker value={dateFin} onChange={setDateFin} placeholder="Traitement ponctuel" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label hint="— bloque la sortie">Délai de retrait (j.)</Label>
                <input
                  type="number" min="0" value={delaiRetrait}
                  onChange={(e) => setDelaiRetrait(Number(e.target.value))}
                  className={inputCls}
                />
              </div>
            </div>
          </div>

          {/* Section 4: Observations */}
          <div className="rounded-[12px] border border-border-light bg-card p-5">
            <h2 className="font-dm-sans text-[14px] font-semibold text-label">Observations</h2>
            <textarea
              name="observations" rows={4}
              placeholder="Symptômes, contexte, évolution observée…"
              className="mt-3 w-full resize-none rounded-[6px] border border-border-light bg-surface p-3 font-inter text-[13px] text-label placeholder:text-placeholder focus:border-primary focus:outline-none"
            />
          </div>
        </div>

        {/* Right: live summary */}
        <div className="w-[280px] shrink-0 flex flex-col gap-4">
          {/* Animal preview */}
          <div className="rounded-[12px] border border-border-light bg-card p-5">
            <h2 className="font-dm-sans text-[13px] font-semibold text-label">Animal sélectionné</h2>
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
              <div className="mt-3 flex items-center gap-2 text-placeholder">
                <Icon name="beef" size={16} />
                <span className="font-inter text-[12px]">Aucun animal sélectionné</span>
              </div>
            )}
          </div>

          {/* Type preview */}
          <div className="rounded-[12px] border border-border-light bg-card p-5">
            <h2 className="font-dm-sans text-[13px] font-semibold text-label">Type de traitement</h2>
            {type ? (
              <div className="mt-3">
                {(() => {
                  const opt = TYPE_OPTS.find((o) => o.value === type);
                  return (
                    <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 font-inter text-[12px] font-semibold ${opt?.sel}`}>
                      <Icon name={opt?.icon ?? "stethoscope"} size={13} />
                      {type}
                    </span>
                  );
                })()}
              </div>
            ) : (
              <p className="mt-3 font-inter text-[12px] text-placeholder">Non sélectionné</p>
            )}
          </div>

          {/* Produit preview */}
          <div className="rounded-[12px] border border-border-light bg-card p-5">
            <h2 className="font-dm-sans text-[13px] font-semibold text-label">Médicament</h2>
            {selectedMedicament ? (
              <div className="mt-3 flex flex-col gap-1">
                <p className="font-inter text-[13px] font-semibold text-label">{selectedMedicament.designation}</p>
                <p className="font-inter text-[11px] text-subtle">{selectedMedicament.quantite} {selectedMedicament.unite} en stock</p>
                <div className="mt-2 flex items-center gap-1.5 rounded-[6px] bg-info/5 border border-info/20 px-2.5 py-1.5">
                  <Icon name="package" size={11} className="text-info" />
                  <span className="font-inter text-[11px] text-info">Stock déduit automatiquement</span>
                </div>
              </div>
            ) : (
              <p className="mt-3 font-inter text-[12px] text-placeholder">Non sélectionné</p>
            )}
          </div>

          {/* Retrait badge */}
          {delaiRetrait > 0 && (
            <div className="flex items-center gap-2.5 rounded-[10px] border border-danger/20 bg-danger/5 px-4 py-3">
              <Icon name="clock" size={14} className="shrink-0 text-danger" />
              <span className="font-inter text-[12px] text-danger">
                Retrait de <strong>{delaiRetrait} j.</strong> appliqué à la fiche animal.
              </span>
            </div>
          )}

          {/* Confirm */}
          <button
            type="submit" form="traitement-form" disabled={submitting || !canSubmit}
            className="w-full rounded-[8px] bg-primary py-3 font-dm-sans text-[13px] font-semibold text-white hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {submitting ? "Enregistrement…" : "Confirmer le traitement"}
          </button>
          {!canSubmit && (
            <p className="text-center font-inter text-[11px] text-placeholder">Sélectionnez un animal et un type pour continuer.</p>
          )}
        </div>
      </form>
    </div>
  );
}
