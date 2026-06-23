"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Icon from "@/components/ui/Icon";
import { useSaveToast } from "@/lib/useSaveToast";
import { useToast } from "@/components/ui/Toast";
import { useApi } from "@/lib/useApi";
import { api } from "@/lib/api";
import DatePicker from "@/components/ui/DatePicker";
import type { Ration, Parcelle } from "@/lib/types";

const PHASE_STYLE: Record<string, { bg: string; text: string }> = {
  Veau:          { bg: "bg-info/10",    text: "text-info" },
  Croissance:    { bg: "bg-primary/10", text: "text-primary" },
  Engraissement: { bg: "bg-warning/10", text: "text-warning" },
  Finition:      { bg: "bg-success/10", text: "text-success" },
};

function DistributionForm() {
  const params = useSearchParams();
  const preRation = params.get("ration") ?? "";

  const { data: rations } = useApi<Ration[]>("/rations");
  const { data: parcelles } = useApi<Parcelle[]>("/parcelles");
  const { error: toastError } = useToast();
  const notifySaved = useSaveToast();

  const [rationId, setRationId] = useState(preRation);
  const [cible, setCible] = useState("");
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [nbAnimaux, setNbAnimaux] = useState("1");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const selectedRation = (rations ?? []).find((r) => r.id === rationId) ?? null;
  const ps = selectedRation ? PHASE_STYLE[selectedRation.phase] ?? PHASE_STYLE.Croissance : null;
  const nb = Math.max(1, Number(nbAnimaux || 1));

  // Batch quantities — the ration defines the total batch, not per-head
  const qtyBatch = selectedRation
    ? (selectedRation.ingredients ?? []).reduce((s, i) => s + i.quantite, 0)
    : 0;
  const coutBatch = selectedRation ? selectedRation.coutJour : 0; // total batch cost
  const coutParAnimal = nb > 0 ? coutBatch / nb : 0;
  const qtyParAnimal = nb > 0 ? qtyBatch / nb : 0;

  useEffect(() => {
    if (preRation && rations?.length) setRationId(preRation);
  }, [preRation, rations]);

  // Pre-fill cible from ration, but only if user hasn't manually chosen one
  useEffect(() => {
    if (selectedRation?.cible) setCible(selectedRation.cible);
    else setCible("");
  }, [selectedRation?.id]);

  // Auto-fill nb animaux from selected parcelle
  const selectedParcelle = (parcelles ?? []).find((p) => p.nom === cible) ?? null;
  useEffect(() => {
    if (selectedParcelle?.nbActuels && selectedParcelle.nbActuels > 0) {
      setNbAnimaux(String(selectedParcelle.nbActuels));
    }
  }, [cible, selectedParcelle?.nbActuels]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!rationId) return toastError("Sélectionnez une ration");
    if (!cible) return toastError("Sélectionnez une cible");
    setSubmitting(true);
    try {
      await api.post("/rations/distributions", {
        ration: rationId,
        cible,
        date: date ?? new Date(),
        quantite: qtyBatch,
        nbAnimaux: nb,
        notes,
      });
      notifySaved("Distribution enregistrée — stock déduit", "/rations");
    } catch (err) {
      toastError(err instanceof Error ? err.message : "Erreur");
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-surface">
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-border-light bg-card px-7">
        <div className="flex items-center gap-1.5">
          <Link href="/rations" className="font-inter text-sm text-subtle hover:text-label transition-colors">Rations</Link>
          <Icon name="chevron-right" size={14} className="text-placeholder" />
          <span className="font-dm-sans text-[15px] font-semibold text-label">Distribution</span>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/rations/historique" className="flex items-center gap-1.5 rounded-[6px] border border-border-light bg-surface px-3.5 py-2 font-dm-sans text-[13px] font-semibold text-subtle hover:bg-border-light transition-colors">
            <Icon name="history" size={14} />
            Historique
          </Link>
          <Link href="/rations" className="flex items-center gap-1.5 rounded-[6px] border border-border-light bg-surface px-3.5 py-2 font-dm-sans text-[13px] font-semibold text-subtle hover:bg-border-light transition-colors">
            Annuler
          </Link>
          <button
            type="submit" form="dist-form" disabled={submitting}
            className="flex items-center gap-1.5 rounded-[6px] bg-primary px-3.5 py-2 font-dm-sans text-[13px] font-semibold text-white hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            <Icon name="check" size={14} />
            {submitting ? "Enregistrement…" : "Confirmer"}
          </button>
        </div>
      </header>

      <form id="dist-form" onSubmit={handleSubmit} noValidate className="flex flex-1 gap-6 overflow-auto p-6">
        {/* Left: form — only essential inputs */}
        <div className="flex flex-1 flex-col gap-4">
          <div className="rounded-[12px] border border-border-light bg-card p-5">
            <h2 className="font-dm-sans text-[14px] font-semibold text-label">Ration et cible</h2>
            <div className="mt-4 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="font-inter text-[12px] font-medium text-subtle">Ration à distribuer *</label>
                <select
                  value={rationId} onChange={(e) => setRationId(e.target.value)}
                  className="h-10 rounded-[6px] border border-border-light bg-surface px-3 font-inter text-[13px] text-label focus:border-primary focus:outline-none"
                >
                  <option value="">— Choisir une ration —</option>
                  {(rations ?? []).map((r) => (
                    <option key={r.id} value={r.id}>{r.nom} — {r.phase}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-inter text-[12px] font-medium text-subtle">
                    Cible *
                    {selectedRation?.cible && cible === selectedRation.cible && (
                      <span className="ml-1.5 rounded-full bg-primary/10 px-1.5 py-0.5 font-inter text-[9px] font-semibold text-primary">pré-sélectionnée</span>
                    )}
                  </label>
                  <select
                    value={cible} onChange={(e) => setCible(e.target.value)}
                    className="h-10 rounded-[6px] border border-border-light bg-surface px-3 font-inter text-[13px] text-label focus:border-primary focus:outline-none"
                  >
                    <option value="">— Choisir —</option>
                    {(parcelles ?? []).map((p) => <option key={p.id} value={p.nom}>{p.nom}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-inter text-[12px] font-medium text-subtle">Date *</label>
                  <DatePicker value={date} onChange={setDate} />
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[12px] border border-border-light bg-card p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-dm-sans text-[14px] font-semibold text-label">Nombre d'animaux</h2>
              {selectedParcelle?.nbActuels != null && selectedParcelle.nbActuels > 0 && (
                <span className="flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 font-inter text-[11px] font-semibold text-success">
                  <Icon name="check" size={11} />
                  {selectedParcelle.nbActuels} dans {selectedParcelle.nom}
                </span>
              )}
            </div>
            <p className="mt-0.5 font-inter text-[12px] text-subtle">
              {selectedParcelle ? "Pré-rempli d'après la parcelle — modifiable." : "Les quantités et le coût sont calculés automatiquement d'après la ration."}
            </p>
            <div className="mt-4 flex h-12 w-48 items-center gap-2 rounded-[6px] border border-border-light bg-surface px-3 focus-within:border-primary">
              <Icon name="beef" size={16} className="text-placeholder" />
              <input
                type="number" min="1" value={nbAnimaux} onChange={(e) => setNbAnimaux(e.target.value)}
                className="w-full bg-transparent font-dm-sans text-[18px] font-bold text-label focus:outline-none"
              />
              <span className="shrink-0 font-inter text-[12px] text-placeholder">animaux</span>
            </div>
          </div>

          <div className="rounded-[12px] border border-border-light bg-card p-5">
            <h2 className="font-dm-sans text-[14px] font-semibold text-label">Notes</h2>
            <textarea
              value={notes} onChange={(e) => setNotes(e.target.value)} rows={3}
              placeholder="Observations sur cette distribution…"
              className="mt-3 w-full resize-none rounded-[6px] border border-border-light bg-surface p-3 font-inter text-[13px] text-label placeholder:text-placeholder focus:border-primary focus:outline-none"
            />
          </div>
        </div>

        {/* Right: ration preview + auto-computed summary */}
        <div className="w-[300px] shrink-0 flex flex-col gap-4">
          {/* Ration recipe */}
          <div className="rounded-[12px] border border-border-light bg-card p-5">
            <h2 className="font-dm-sans text-[14px] font-semibold text-label">Recette</h2>
            {!selectedRation ? (
              <div className="mt-6 flex flex-col items-center gap-2 text-center">
                <Icon name="utensils" size={28} className="text-placeholder" />
                <p className="font-inter text-[12px] text-placeholder">Sélectionnez une ration</p>
              </div>
            ) : (
              <div className="mt-3 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className={`rounded-full px-2.5 py-1 font-inter text-[11px] font-semibold ${ps?.bg} ${ps?.text}`}>{selectedRation.phase}</span>
                  <span className="font-dm-sans text-[15px] font-bold text-label truncate ml-2">{selectedRation.nom}</span>
                </div>

                <div className="flex flex-col gap-1 rounded-[8px] bg-surface p-3">
                  <span className="font-inter text-[10px] font-semibold uppercase tracking-wide text-placeholder mb-1">
                    Composition du lot
                  </span>
                  {(selectedRation.ingredients ?? []).map((ing, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="font-inter text-[12px] text-label truncate">{ing.nom}</span>
                      <span className="font-inter text-[11px] font-semibold text-subtle shrink-0 ml-2">{ing.quantite} {ing.unite}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Auto-computed totals */}
          <div className="rounded-[12px] border border-primary/20 bg-primary/5 p-5">
            <h2 className="font-dm-sans text-[14px] font-semibold text-label">Récapitulatif</h2>
            <p className="mt-0.5 font-inter text-[11px] text-subtle">Lot réparti entre {nb} animal{nb !== 1 ? "x" : ""}</p>

            <div className="mt-4 flex flex-col gap-3">
              <div className="flex flex-col gap-0.5">
                <span className="font-inter text-[11px] text-subtle">Coût total du lot</span>
                <span className="font-dm-sans text-[28px] font-bold leading-none text-primary">
                  {coutBatch.toFixed(2)} <span className="font-inter text-[14px] font-normal text-subtle">MAD</span>
                </span>
              </div>

              <div className="flex flex-col gap-1.5 rounded-[8px] bg-card p-3">
                {qtyBatch > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="font-inter text-[12px] text-subtle">Quantité totale du lot</span>
                    <span className="font-dm-sans text-[13px] font-semibold text-label">{qtyBatch.toFixed(1)} kg</span>
                  </div>
                )}
                <div className="flex items-center justify-between border-t border-border-light pt-1.5">
                  <span className="font-inter text-[12px] text-subtle">Coût / animal</span>
                  <span className="font-dm-sans text-[13px] font-semibold text-label">{coutParAnimal.toFixed(2)} MAD</span>
                </div>
                {qtyParAnimal > 0 && (
                  <div className="flex items-center justify-between border-t border-border-light pt-1.5">
                    <span className="font-inter text-[12px] text-subtle">Quantité / animal</span>
                    <span className="font-dm-sans text-[13px] font-semibold text-label">{qtyParAnimal.toFixed(2)} kg</span>
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit" disabled={submitting || !rationId || !cible}
              className="mt-4 w-full rounded-[6px] bg-primary py-2.5 font-dm-sans text-[13px] font-semibold text-white hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {submitting ? "Enregistrement…" : "Confirmer la distribution"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default function DistributionPage() {
  return (
    <Suspense>
      <DistributionForm />
    </Suspense>
  );
}
