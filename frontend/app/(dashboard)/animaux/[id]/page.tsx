"use client";

import { useState, use } from "react";
import Link from "next/link";
import Icon from "@/components/ui/Icon";
import Badge from "@/components/ui/Badge";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";
import { useApi } from "@/lib/useApi";
import { api } from "@/lib/api";
import type { Animal } from "@/lib/types";

const TABS = ["Infos", "Pesées", "Phases", "Rentabilité"];
const PHASES = ["Veau", "Croissance", "Engraissement", "Finition"] as const;

const PHASE_VARIANT: Record<string, string> = {
  Veau: "phase-croissance",
  Croissance: "phase-croissance",
  Engraissement: "phase-engraissement",
  Finition: "phase-finition",
};

const SANTE_STYLE: Record<string, string> = {
  Sain: "bg-success/10 text-success",
  "En observation": "bg-info/10 text-info",
  "En traitement": "bg-warning/10 text-warning",
  Malade: "bg-danger/10 text-danger",
};

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
  const { success, error: toastError } = useToast();
  const { data: animal, loading, error, refetch } = useApi<Animal>(`/animaux/${id}`);
  const [activeTab, setActiveTab] = useState(0);
  const [confirmPhase, setConfirmPhase] = useState(false);

  const phaseIndex = animal ? PHASES.indexOf(animal.phase) : -1;
  const nextPhase = phaseIndex >= 0 && phaseIndex < PHASES.length - 1 ? PHASES[phaseIndex + 1] : null;

  async function advancePhase() {
    try {
      await api.patch(`/animaux/${id}/phase`, {});
      success(`Phase avancée vers « ${nextPhase} »`);
      refetch();
    } catch (err) {
      toastError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setConfirmPhase(false);
    }
  }

  if (loading) return <div className="flex flex-1 items-center justify-center bg-surface font-inter text-sm text-placeholder">Chargement…</div>;
  if (error || !animal) return <div className="flex flex-1 items-center justify-center bg-surface font-inter text-sm text-danger">{error || "Animal introuvable"}</div>;

  const pesees = animal.pesees ?? [];

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-surface">
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-border-light bg-card px-7">
        <div className="flex items-center gap-1.5">
          <Link href="/animaux" className="font-inter text-sm text-placeholder hover:text-subtle transition-colors">Animaux</Link>
          <span className="font-inter text-sm text-placeholder">/</span>
          <span className="font-dm-sans text-xl font-semibold text-label">Fiche animal</span>
          <span className="font-inter text-sm text-placeholder">/ {animal.identifiant}</span>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/animaux/${id}/pesee/nouveau`} className="flex items-center gap-1.5 rounded-[6px] border border-border-light bg-surface px-3.5 py-2 font-dm-sans text-[13px] font-semibold text-subtle hover:bg-border-light transition-colors">
            <Icon name="trending-up" size={14} />
            Pesée
          </Link>
          <Link href={`/animaux/${id}/modifier`} className="flex items-center gap-1.5 rounded-[6px] border border-border-light bg-surface px-3.5 py-2 font-dm-sans text-[13px] font-semibold text-subtle hover:bg-border-light transition-colors">
            <Icon name="pencil" size={14} />
            Modifier
          </Link>
        </div>
      </header>

      <div className="flex h-12 shrink-0 items-center border-b border-border-light bg-card px-6">
        {TABS.map((tab, i) => (
          <button key={tab} onClick={() => setActiveTab(i)} className={`flex h-12 items-center px-4 font-inter text-sm transition-colors ${i === activeTab ? "border-b-2 border-primary font-semibold text-primary" : "font-normal text-placeholder hover:text-subtle"}`}>
            {tab}
          </button>
        ))}
      </div>

      <div className="flex flex-1 flex-col gap-4 overflow-auto p-6">
        {/* Identity card */}
        <div className="flex items-center justify-between rounded-[10px] border border-border-light bg-card p-5">
          <div className="flex items-center gap-4">
            <div className="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-primary font-dm-sans text-[22px] font-bold text-white">
              {animal.identifiant.slice(-1).toUpperCase()}
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="font-dm-sans text-lg font-bold text-label">{animal.identifiant} — {animal.race?.nom}</span>
              <span className="font-inter text-[13px] text-subtle">{animal.sexe} · {animal.origine === "ferme" ? "Né à la ferme" : animal.origine}</span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <span className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 font-inter text-xs font-semibold ${SANTE_STYLE[animal.etatSante]}`}>{animal.etatSante}</span>
            <span className="font-inter text-[11px] text-placeholder">État de santé</span>
          </div>
        </div>

        {activeTab === 0 && (
          <>
            <div className="flex gap-4">
              <div className="flex flex-1 flex-col gap-3 rounded-[10px] border border-border-light bg-card p-5">
                <span className="font-dm-sans text-sm font-semibold text-label">Identité</span>
                <Row label="Identifiant" value={animal.identifiant} />
                <Row label="Race" value={animal.race?.nom ?? "—"} />
                <Row label="Sexe" value={animal.sexe} />
                <Row label="Père" value={animal.pere || "—"} />
                <Row label="Mère" value={animal.mere || "—"} />
              </div>
              <div className="flex flex-1 flex-col gap-3 rounded-[10px] border border-border-light bg-card p-5">
                <span className="font-dm-sans text-sm font-semibold text-label">Performance</span>
                <div className="flex flex-col gap-0.5">
                  <span className="font-inter text-[11px] text-placeholder">GMQ actuel</span>
                  <span className="font-dm-sans text-base font-bold text-primary">{animal.gmqActuel} kg/j</span>
                </div>
                <Row label="Poids actuel" value={`${animal.poidsActuel} kg`} />
                <Row label="Poids d'entrée" value={`${animal.poidsEntree} kg`} />
                <Row label="Coût cumulé" value={`${animal.coutCumule.toLocaleString("fr-FR")} MAD`} />
              </div>
              <div className="flex flex-1 flex-col gap-3 rounded-[10px] border border-border-light bg-card p-5">
                <span className="font-dm-sans text-sm font-semibold text-label">Localisation</span>
                <Row label="Parcelle" value={animal.parcelle?.nom ?? "—"} />
                <Row label="Lot" value={animal.lot?.nom ?? "—"} />
                <div className="flex flex-col gap-1.5">
                  <span className="font-inter text-[11px] text-placeholder">Phase actuelle</span>
                  <Badge variant={PHASE_VARIANT[animal.phase] as Parameters<typeof Badge>[0]["variant"]}>{animal.phase}</Badge>
                </div>
                <Row label="Date d'entrée" value={new Date(animal.dateEntree).toLocaleDateString("fr-FR")} />
              </div>
            </div>
            <div className="flex justify-end">
              <Link href={`/animaux/${id}/sortie`} className="flex items-center gap-1.5 rounded-[6px] border border-danger bg-card px-3.5 py-2 font-dm-sans text-[13px] font-semibold text-danger hover:bg-danger/5 transition-colors">
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
            {pesees.length === 0 && <div className="py-8 text-center font-inter text-[13px] text-placeholder">Aucune pesée enregistrée</div>}
            {pesees.map((p) => (
              <div key={p.id} className="flex items-center justify-between border-b border-border-light px-5 last:border-b-0" style={{ height: 52 }}>
                <span className="font-inter text-[13px] text-subtle">{new Date(p.date).toLocaleDateString("fr-FR")}</span>
                <span className="font-inter text-[13px] font-semibold text-label">{p.poids} kg</span>
                <span className="font-inter text-[13px] text-primary font-semibold">{p.gmq != null ? `${p.gmq} kg/j` : "—"}</span>
              </div>
            ))}
            <div className="flex items-center justify-end border-t border-border-light px-5 py-3">
              <Link href={`/animaux/${id}/pesee/nouveau`} className="flex items-center gap-1 font-inter text-[13px] text-primary hover:underline">
                <Icon name="plus" size={13} /> Ajouter une pesée
              </Link>
            </div>
          </div>
        )}

        {activeTab === 2 && (
          <div className="flex flex-col gap-4">
            <div className="rounded-[10px] border border-border-light bg-card p-5">
              <div className="flex items-center justify-between">
                <span className="font-dm-sans text-sm font-semibold text-label">Progression des phases</span>
                {nextPhase ? (
                  <button onClick={() => setConfirmPhase(true)} className="flex items-center gap-1.5 rounded-[6px] bg-primary px-3.5 py-2 font-dm-sans text-[13px] font-semibold text-white hover:bg-primary-hover transition-colors">
                    <Icon name="arrow-right" size={14} />
                    Passer à « {nextPhase} »
                  </button>
                ) : (
                  <span className="rounded-full bg-primary-light px-3 py-1 font-inter text-[12px] font-semibold text-primary">Phase finale atteinte</span>
                )}
              </div>
              <div className="mt-5 flex items-center">
                {PHASES.map((ph, i) => (
                  <div key={ph} className="flex flex-1 items-center last:flex-none">
                    <div className="flex flex-col items-center gap-1.5">
                      <div className={`flex h-9 w-9 items-center justify-center rounded-full font-dm-sans text-[13px] font-bold ${i < phaseIndex ? "bg-primary text-white" : i === phaseIndex ? "bg-primary text-white ring-4 ring-primary-light" : "bg-surface text-placeholder border border-border-light"}`}>
                        {i < phaseIndex ? <Icon name="check" size={15} /> : i + 1}
                      </div>
                      <span className={`font-inter text-[11px] ${i === phaseIndex ? "font-semibold text-label" : "text-placeholder"}`}>{ph}</span>
                    </div>
                    {i < PHASES.length - 1 && <div className={`mx-2 h-0.5 flex-1 ${i < phaseIndex ? "bg-primary" : "bg-border-light"}`} />}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 3 && (
          <div className="flex gap-4">
            <div className="flex flex-1 flex-col gap-3 rounded-[10px] border border-border-light bg-card p-5">
              <span className="font-dm-sans text-sm font-semibold text-label">Rentabilité estimée</span>
              <Row label="Coût total d'élevage" value={`${animal.coutCumule.toLocaleString("fr-FR")} MAD`} />
              <Row label="Poids actuel" value={`${animal.poidsActuel} kg`} />
              <Row label="Poids cible d'abattage" value={animal.race?.poidsAbattage ? `${animal.race.poidsAbattage} kg` : "—"} />
              <Row label="Coût / kg produit" value={animal.poidsActuel > 0 ? `${(animal.coutCumule / animal.poidsActuel).toFixed(2)} MAD/kg` : "—"} />
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={confirmPhase}
        variant="primary"
        title="Confirmer la transition de phase"
        message={nextPhase ? `${animal.identifiant} passera de « ${animal.phase} » à « ${nextPhase} ».` : ""}
        confirmLabel="Confirmer"
        onConfirm={advancePhase}
        onCancel={() => setConfirmPhase(false)}
      />
    </div>
  );
}
