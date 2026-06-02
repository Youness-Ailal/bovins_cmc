"use client";

import { useState, use } from "react";
import Link from "next/link";
import Icon from "@/components/ui/Icon";
import Badge from "@/components/ui/Badge";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";

const TABS = ["Infos", "Pesées", "Phases", "Rentabilité"];

const PHASES = ["Veau", "Croissance", "Engraissement", "Finition"] as const;
type Phase = (typeof PHASES)[number];

const PHASE_VARIANT: Record<Phase, string> = {
  Veau: "phase-croissance",
  Croissance: "phase-croissance",
  Engraissement: "phase-engraissement",
  Finition: "phase-finition",
};

const PESEES = [
  { date: "15/05/2026", poids: "320 kg", gmq: "0.82 kg/j" },
  { date: "01/05/2026", poids: "296 kg", gmq: "0.79 kg/j" },
  { date: "15/04/2026", poids: "272 kg", gmq: "0.76 kg/j" },
];

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="font-inter text-[11px] text-placeholder">{label}</span>
      <span className="font-inter text-[13px] font-medium text-label">{value}</span>
    </div>
  );
}

export default function FicheAnimalPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { success } = useToast();
  const [activeTab, setActiveTab] = useState(0);
  const [phaseIndex, setPhaseIndex] = useState(1); // Croissance
  const [confirmPhase, setConfirmPhase] = useState(false);

  const currentPhase = PHASES[phaseIndex];
  const nextPhase = phaseIndex < PHASES.length - 1 ? PHASES[phaseIndex + 1] : null;

  function advancePhase() {
    if (!nextPhase) return;
    // TODO: PATCH /api/animaux/:id/phase
    setPhaseIndex((i) => i + 1);
    success(`${id} passé en phase « ${nextPhase} »`);
    setConfirmPhase(false);
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-surface">
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-border-light bg-card px-7">
        <div className="flex items-center gap-1.5">
          <Link href="/animaux" className="font-inter text-sm text-placeholder hover:text-subtle transition-colors">
            Animaux
          </Link>
          <span className="font-inter text-sm text-placeholder">/</span>
          <span className="font-dm-sans text-xl font-semibold text-label">Fiche animal</span>
          <span className="font-inter text-sm text-placeholder">/ {id}</span>
        </div>
        <Link
          href={`/animaux/${id}/modifier`}
          className="flex items-center gap-1.5 rounded-[6px] border border-border-light bg-surface px-3.5 py-2 font-dm-sans text-[13px] font-semibold text-subtle hover:bg-border-light transition-colors"
        >
          <Icon name="pencil" size={14} />
          Modifier
        </Link>
      </header>

      {/* Tab bar */}
      <div className="flex h-12 shrink-0 items-center border-b border-border-light bg-card px-6">
        {TABS.map((tab, i) => (
          <button
            key={tab}
            onClick={() => setActiveTab(i)}
            className={`flex h-12 items-center px-4 font-inter text-sm transition-colors ${
              i === activeTab
                ? "border-b-2 border-primary font-semibold text-primary"
                : "font-normal text-placeholder hover:text-subtle"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="flex flex-1 flex-col gap-4 overflow-auto p-6">
        {/* Identity card — always visible */}
        <div className="flex items-center justify-between rounded-[10px] border border-border-light bg-card p-5">
          <div className="flex items-center gap-4">
            <div className="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-primary font-dm-sans text-[22px] font-bold text-white">
              {id.slice(-1).toUpperCase()}
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="font-dm-sans text-lg font-bold text-label">{id} — Holstein</span>
              <span className="font-inter text-[13px] text-subtle">Mâle · Bovin laitier</span>
              <div className="flex items-center gap-2">
                <Badge variant="origin">Né à la ferme</Badge>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <span className="flex items-center gap-1.5 rounded-full bg-primary-light px-3.5 py-1.5 font-inter text-xs font-semibold text-primary">
              <Icon name="check" size={12} />
              Sain
            </span>
            <span className="font-inter text-[11px] text-placeholder">État de santé</span>
          </div>
        </div>

        {/* Tab content */}
        {activeTab === 0 && (
          <>
            <div className="flex gap-4">
              <div className="flex flex-1 flex-col gap-3 rounded-[10px] border border-border-light bg-card p-5">
                <span className="font-dm-sans text-sm font-semibold text-label">Identité</span>
                <Row label="NNI" value="MA-2023-00174" />
                <Row label="Race" value="Holstein" />
                <Row label="Sexe" value="Mâle" />
                <Row label="Père" value="BL-450-P" />
                <Row label="Mère" value="BL-312-M" />
                <Row label="Origine" value="Né à la ferme" />
              </div>

              <div className="flex flex-1 flex-col gap-3 rounded-[10px] border border-border-light bg-card p-5">
                <span className="font-dm-sans text-sm font-semibold text-label">Performance</span>
                <div className="flex flex-col gap-0.5">
                  <span className="font-inter text-[11px] text-placeholder">GMQ actuel</span>
                  <span className="font-dm-sans text-base font-bold text-primary">0.82 kg/j</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="font-inter text-[11px] text-placeholder">Indice de consommation (IC)</span>
                  <span className="font-dm-sans text-base font-bold text-label">6.4</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="font-inter text-[11px] text-placeholder">Projection abattage</span>
                  <span className="font-inter text-[13px] font-medium text-label">Janvier 2026</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="font-inter text-[11px] text-placeholder">Délai de retrait</span>
                  <span className="font-inter text-[13px] font-medium text-success">Expiré — OK</span>
                </div>
              </div>

              <div className="flex flex-1 flex-col gap-3 rounded-[10px] border border-border-light bg-card p-5">
                <span className="font-dm-sans text-sm font-semibold text-label">Localisation</span>
                <Row label="Parcelle" value="P-01 — Champ Nord" />
                <Row label="Lot" value="LOT-A" />
                <div className="flex flex-col gap-1.5">
                  <span className="font-inter text-[11px] text-placeholder">Phase actuelle</span>
                  <Badge variant={PHASE_VARIANT[currentPhase] as Parameters<typeof Badge>[0]["variant"]}>{currentPhase}</Badge>
                </div>
                <Row label="Poids actuel (estimé)" value="320 kg" />
                <Row label="Date d'entrée" value="15/03/2023" />
              </div>
            </div>

            <div className="flex justify-end">
              <Link
                href={`/animaux/${id}/sortie`}
                className="flex items-center gap-1.5 rounded-[6px] border border-danger bg-card px-3.5 py-2 font-dm-sans text-[13px] font-semibold text-danger hover:bg-danger/5 transition-colors"
              >
                <Icon name="scissors" size={14} />
                Enregistrer une sortie
              </Link>
            </div>
          </>
        )}

        {activeTab === 1 && (
          <div className="overflow-hidden rounded-[10px] border border-border-light bg-card">
            <div className="flex items-center justify-between bg-surface px-5" style={{ height: 44 }}>
              <span className="font-inter text-[11px] font-bold uppercase tracking-wide text-placeholder">Date</span>
              <span className="font-inter text-[11px] font-bold uppercase tracking-wide text-placeholder">Poids</span>
              <span className="font-inter text-[11px] font-bold uppercase tracking-wide text-placeholder">GMQ calculé</span>
            </div>
            {PESEES.map((p, i) => (
              <div key={i} className="flex items-center justify-between border-b border-border-light px-5 last:border-b-0" style={{ height: 52 }}>
                <span className="font-inter text-[13px] text-subtle">{p.date}</span>
                <span className="font-inter text-[13px] font-semibold text-label">{p.poids}</span>
                <span className="font-inter text-[13px] text-primary font-semibold">{p.gmq}</span>
              </div>
            ))}
            <div className="flex items-center justify-between border-t border-border-light px-5 py-3">
              <span className="font-inter text-[12px] text-placeholder">3 pesées enregistrées</span>
              <Link href={`/animaux/${id}/pesee/nouveau`} className="flex items-center gap-1 font-inter text-[13px] text-primary hover:underline">
                <Icon name="plus" size={13} />
                Ajouter une pesée
              </Link>
            </div>
          </div>
        )}

        {activeTab === 2 && (
          // UC-03 — Gérer les phases de croissance
          <div className="flex flex-col gap-4">
            {/* Phase progression stepper */}
            <div className="rounded-[10px] border border-border-light bg-card p-5">
              <div className="flex items-center justify-between">
                <span className="font-dm-sans text-sm font-semibold text-label">Progression des phases</span>
                {nextPhase ? (
                  <button
                    onClick={() => setConfirmPhase(true)}
                    className="flex items-center gap-1.5 rounded-[6px] bg-primary px-3.5 py-2 font-dm-sans text-[13px] font-semibold text-white hover:bg-primary-hover transition-colors"
                  >
                    <Icon name="arrow-right" size={14} />
                    Passer à « {nextPhase} »
                  </button>
                ) : (
                  <span className="rounded-full bg-primary-light px-3 py-1 font-inter text-[12px] font-semibold text-primary">Phase finale atteinte</span>
                )}
              </div>

              {/* Stepper */}
              <div className="mt-5 flex items-center">
                {PHASES.map((ph, i) => (
                  <div key={ph} className="flex flex-1 items-center last:flex-none">
                    <div className="flex flex-col items-center gap-1.5">
                      <div className={`flex h-9 w-9 items-center justify-center rounded-full font-dm-sans text-[13px] font-bold ${
                        i < phaseIndex ? "bg-primary text-white"
                        : i === phaseIndex ? "bg-primary text-white ring-4 ring-primary-light"
                        : "bg-surface text-placeholder border border-border-light"
                      }`}>
                        {i < phaseIndex ? <Icon name="check" size={15} /> : i + 1}
                      </div>
                      <span className={`font-inter text-[11px] ${i === phaseIndex ? "font-semibold text-label" : "text-placeholder"}`}>{ph}</span>
                    </div>
                    {i < PHASES.length - 1 && (
                      <div className={`mx-2 h-0.5 flex-1 ${i < phaseIndex ? "bg-primary" : "bg-border-light"}`} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* History */}
            <div className="rounded-[10px] border border-border-light bg-card p-5">
              <span className="font-dm-sans text-sm font-semibold text-label">Historique des transitions</span>
              <div className="mt-4 flex flex-col gap-3">
                {PHASES.slice(0, phaseIndex + 1).map((ph, i) => (
                  <div key={ph} className="flex items-center gap-4">
                    <Badge variant={PHASE_VARIANT[ph] as Parameters<typeof Badge>[0]["variant"]}>{ph}</Badge>
                    <span className="font-inter text-[13px] text-subtle">
                      {i === phaseIndex ? "En cours" : `Terminée`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 3 && (
          // UC-17 — Fiche de rentabilité par animal
          <div className="flex flex-col gap-4">
            {/* Cost breakdown */}
            <div className="flex gap-4">
              <div className="flex flex-1 flex-col gap-3 rounded-[10px] border border-border-light bg-card p-5">
                <span className="font-dm-sans text-sm font-semibold text-label">Décomposition des coûts</span>
                <div className="flex flex-col gap-2">
                  {[
                    { label: "Coût alimentation cumulé", value: "8 420 MAD", pct: 68, color: "bg-primary" },
                    { label: "Coût vétérinaire cumulé", value: "1 850 MAD", pct: 15, color: "bg-warning" },
                    { label: "Coût d'achat / entrée", value: "2 180 MAD", pct: 17, color: "bg-info" },
                  ].map(({ label, value, pct, color }) => (
                    <div key={label} className="flex flex-col gap-1">
                      <div className="flex items-center justify-between">
                        <span className="font-inter text-[12px] text-subtle">{label}</span>
                        <span className="font-inter text-[13px] font-semibold text-label">{value}</span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface">
                        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t border-border-light pt-3">
                  <Row label="Coût total d'élevage" value="12 450 MAD" />
                </div>
              </div>

              <div className="flex flex-1 flex-col gap-3 rounded-[10px] border border-border-light bg-card p-5">
                <span className="font-dm-sans text-sm font-semibold text-label">Projection de vente</span>
                <Row label="Poids actuel" value="320 kg" />
                <Row label="Poids cible d'abattage" value="480 kg" />
                <Row label="Jours estimés restants" value="~195 jours (GMQ 0.82 kg/j)" />
                <Row label="Coût/kg produit" value="38.90 MAD/kg" />
                <div className="border-t border-border-light pt-3 flex flex-col gap-2">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-inter text-[11px] text-placeholder">Prix de vente estimé (40 MAD/kg)</span>
                    <span className="font-dm-sans text-xl font-bold text-primary">19 200 MAD</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="font-inter text-[11px] text-placeholder">Marge brute estimée</span>
                    <span className="font-dm-sans text-xl font-bold text-success">+6 750 MAD</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Coût/jour actuel */}
            <div className="flex items-center justify-between rounded-[10px] border border-warning/30 bg-warning/5 px-5 py-4">
              <div className="flex flex-col gap-0.5">
                <span className="font-inter text-[11px] text-placeholder">Coût alimentaire / jour actuel</span>
                <span className="font-dm-sans text-lg font-bold text-warning">18.40 MAD/j</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="font-inter text-[11px] text-placeholder">Rentabilité si vendu aujourd'hui</span>
                <span className="font-inter text-[13px] font-semibold text-danger">Poids insuffisant (320 / 480 kg cible)</span>
              </div>
              <Link href={`/animaux/${id}/sortie`} className="flex items-center gap-1.5 rounded-[6px] border border-border-light bg-card px-3.5 py-2 font-dm-sans text-[13px] font-semibold text-subtle hover:bg-border-light transition-colors">
                <Icon name="scissors" size={13} />
                Enregistrer une sortie
              </Link>
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={confirmPhase}
        variant="primary"
        title="Confirmer la transition de phase"
        message={nextPhase ? `${id} passera de « ${currentPhase} » à « ${nextPhase} ». La ration associée à la nouvelle phase sera appliquée.` : ""}
        confirmLabel="Confirmer"
        onConfirm={advancePhase}
        onCancel={() => setConfirmPhase(false)}
      />
    </div>
  );
}
