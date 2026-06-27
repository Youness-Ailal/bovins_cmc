"use client";

import { useState, use } from "react";
import Link from "next/link";
import Icon from "@/components/ui/Icon";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";
import { useApi } from "@/lib/useApi";
import { api, downloadFile } from "@/lib/api";
import type { Animal } from "@/lib/types";

const PHASES = ["Veau", "Croissance", "Engraissement", "Finition"] as const;

const PHASE_STYLE: Record<string, { bg: string; text: string }> = {
  Veau:         { bg: "bg-info/10",    text: "text-info" },
  Croissance:   { bg: "bg-primary/10", text: "text-primary" },
  Engraissement:{ bg: "bg-warning/10", text: "text-warning" },
  Finition:     { bg: "bg-success/10", text: "text-success" },
};

const SANTE_STYLE: Record<string, { bg: string; text: string; dot: string; border: string }> = {
  Sain:           { bg: "bg-success/10", text: "text-success", dot: "bg-success", border: "border-success/20" },
  "En traitement": { bg: "bg-warning/10",text: "text-warning", dot: "bg-warning", border: "border-warning/20" },
  Malade:          { bg: "bg-danger/10", text: "text-danger",  dot: "bg-danger",  border: "border-danger/20" },
};

const TRAITEMENT_STATUT: Record<string, string> = {
  "En cours":  "bg-warning/10 text-warning",
  "Terminé":   "bg-success/10 text-success",
  "Planifié":  "bg-info/10 text-info",
};

const TABS = [
  { id: "identite",  label: "Identité",   icon: "tag" },
  { id: "croissance",label: "Croissance",  icon: "trending-up" },
  { id: "sante",     label: "Santé",       icon: "heart-pulse" },
  { id: "parcours",  label: "Parcours",    icon: "layers" },
  { id: "finances",  label: "Finances",    icon: "coins" },
];

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b border-border-light py-2.5 last:border-b-0">
      <span className="font-inter text-[12px] text-subtle">{label}</span>
      <span className="font-inter text-[13px] font-semibold text-label">{value}</span>
    </div>
  );
}

function KpiCard({ label, value, sub, icon, highlight }: { label: string; value: string; sub?: string; icon: string; highlight?: boolean }) {
  return (
    <div className="flex flex-col gap-2 rounded-[12px] border border-border-light bg-card p-4">
      <div className="flex items-center justify-between">
        <span className="font-inter text-[12px] text-subtle">{label}</span>
        <Icon name={icon} size={14} className="text-placeholder" />
      </div>
      <span className={`font-dm-sans text-[22px] font-bold leading-none ${highlight ? "text-primary" : "text-label"}`}>{value}</span>
      {sub && <span className="font-inter text-[11px] text-subtle">{sub}</span>}
    </div>
  );
}

export default function FicheAnimalPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const canManage = true;
  const canSaisiePesee = true;
  const canSortie = true;
  const { success, error: toastError } = useToast();
  const { data: animalData, loading, error, refetch } = useApi<Animal>(`/animaux/${id}`);
  const [localSante, setLocalSante] = useState<string | null>(null);
  const animal = animalData ? { ...animalData, etatSante: localSante ?? animalData.etatSante } : null;
  const [activeTab, setActiveTab] = useState("identite");
  const [confirmPhase, setConfirmPhase] = useState(false);
  const [updatingSante, setUpdatingSante] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const phaseIndex = animal ? PHASES.indexOf(animal.phase) : -1;
  const nextPhase = phaseIndex >= 0 && phaseIndex < PHASES.length - 1 ? PHASES[phaseIndex + 1] : null;

  async function downloadDoc(path: string, filename: string, label: string) {
    setDownloading(true);
    try {
      await downloadFile(path, filename);
      success(`${label} téléchargé`);
    } catch (err) {
      toastError(err instanceof Error ? err.message : "Erreur lors de la génération du document");
    } finally {
      setDownloading(false);
    }
  }

  async function updateSante(etatSante: string) {
    setUpdatingSante(true);
    setLocalSante(etatSante); // optimistic
    try {
      await api.patch(`/animaux/${id}/sante`, { etatSante });
      success(`État de santé mis à jour : ${etatSante}`);
    } catch (err) {
      setLocalSante(null); // revert on error
      toastError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setUpdatingSante(false);
    }
  }

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
  const traitements = animal.traitements ?? [];
  const sante = SANTE_STYLE[animal.etatSante] ?? SANTE_STYLE.Sain;
  const phase = PHASE_STYLE[animal.phase] ?? PHASE_STYLE.Veau;

  const poidsGain = animal.poidsActuel - animal.poidsEntree;
  const joursElevage = Math.round((Date.now() - new Date(animal.dateEntree).getTime()) / 86400000);
  const targetPoids = animal.race?.poidsAbattage ?? 0;
  const progressVersTarget = targetPoids > 0 ? Math.min(100, Math.round((animal.poidsActuel / targetPoids) * 100)) : 0;
  const coutParJour = animal.coutJour ?? (joursElevage > 0 ? Math.round(animal.coutCumule / joursElevage) : 0);
  const coutParKg = animal.poidsActuel > 0 ? (animal.coutCumule / animal.poidsActuel).toFixed(2) : "—";

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-surface">
      {/* Breadcrumb header */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-border-light bg-card px-7">
        <div className="flex items-center gap-1.5">
          <Link href="/animaux" className="font-inter text-sm text-subtle hover:text-label transition-colors">Animaux</Link>
          <Icon name="chevron-right" size={14} className="text-placeholder" />
          <span className="font-dm-sans text-[15px] font-semibold text-label">{animal.identifiant}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => downloadDoc(`/animaux/${id}/passeport`, `passeport-${animal.identifiant}.pdf`, "Passeport")}
            disabled={downloading}
            className="flex items-center gap-1.5 rounded-[6px] border border-border-light bg-surface px-3 py-1.5 font-dm-sans text-[13px] font-semibold text-subtle hover:bg-border-light transition-colors disabled:opacity-50"
          >
            <Icon name="file-text" size={13} />
            Passeport PDF
          </button>
          {canSaisiePesee && (
            <Link href={`/animaux/${id}/pesee/nouveau`} className="flex items-center gap-1.5 rounded-[6px] border border-border-light bg-surface px-3 py-1.5 font-dm-sans text-[13px] font-semibold text-subtle hover:bg-border-light transition-colors">
              <Icon name="trending-up" size={13} />
              Pesée
            </Link>
          )}
          {canManage && (
            <Link href={`/animaux/${id}/modifier`} className="flex items-center gap-1.5 rounded-[6px] border border-border-light bg-surface px-3 py-1.5 font-dm-sans text-[13px] font-semibold text-subtle hover:bg-border-light transition-colors">
              <Icon name="pencil" size={13} />
              Modifier
            </Link>
          )}
          {canSortie && (
            <Link href={`/animaux/${id}/sortie`} className="flex items-center gap-1.5 rounded-[6px] border border-danger/30 bg-danger/5 px-3 py-1.5 font-dm-sans text-[13px] font-semibold text-danger hover:bg-danger/10 transition-colors">
              <Icon name="scissors" size={13} />
              Sortie
            </Link>
          )}
        </div>
      </header>

      {/* Hero section */}
      <div className="shrink-0 border-b border-border-light bg-card px-7 py-4">
        <div className="flex items-center gap-5">
          {/* Avatar */}
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary font-dm-sans text-2xl font-bold text-white">
            {animal.identifiant.slice(-1).toUpperCase()}
          </div>

          {/* Identity */}
          <div className="flex min-w-0 flex-col gap-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-dm-sans text-[18px] font-bold text-label">{animal.identifiant}</span>
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 font-inter text-[11px] font-semibold ${phase.bg} ${phase.text}`}>
                {animal.phase}
              </span>
              <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-inter text-[11px] font-semibold ${sante.bg} ${sante.text}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${sante.dot}`} />
                {animal.etatSante}
              </span>
              {animal.statut === "Sorti" && (
                <span className="inline-flex items-center rounded-full bg-surface px-2.5 py-0.5 font-inter text-[11px] font-semibold text-subtle border border-border-light">
                  Sorti
                </span>
              )}
            </div>
            <span className="font-inter text-[13px] text-subtle">
              {animal.race?.nom} · {animal.sexe} · {animal.origine === "ferme" ? "Né à la ferme" : animal.origine}
            </span>
          </div>

          {/* KPI strip */}
          <div className="ml-6 flex items-center gap-6 border-l border-border-light pl-6">
            <div className="flex flex-col gap-0.5">
              <span className="font-inter text-[11px] text-placeholder">Poids actuel</span>
              <span className="font-dm-sans text-[20px] font-bold leading-none text-label">{animal.poidsActuel} <span className="text-[13px] font-normal text-subtle">kg</span></span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="font-inter text-[11px] text-placeholder">GMQ actuel</span>
              <span className="font-dm-sans text-[20px] font-bold leading-none text-primary">{animal.gmqActuel} <span className="text-[13px] font-normal text-subtle">kg/j</span></span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="font-inter text-[11px] text-placeholder">Élevage</span>
              <span className="font-dm-sans text-[20px] font-bold leading-none text-label">{joursElevage} <span className="text-[13px] font-normal text-subtle">j</span></span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="font-inter text-[11px] text-placeholder">Coût cumulé</span>
              <span className="font-dm-sans text-[20px] font-bold leading-none text-label">{animal.coutCumule.toLocaleString("fr-FR")} <span className="text-[13px] font-normal text-subtle">MAD</span></span>
            </div>
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex h-11 shrink-0 items-center gap-1 border-b border-border-light bg-card px-5">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex h-11 items-center gap-1.5 px-4 font-inter text-[13px] transition-colors ${
              activeTab === tab.id
                ? "border-b-2 border-primary font-semibold text-primary"
                : "font-normal text-placeholder hover:text-subtle"
            }`}
          >
            <Icon name={tab.icon} size={13} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex flex-1 flex-col gap-4 overflow-auto p-6">

        {/* ── IDENTITÉ ── */}
        {activeTab === "identite" && (
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-[12px] border border-border-light bg-card p-5">
              <h3 className="font-dm-sans text-[14px] font-semibold text-label">Informations générales</h3>
              <div className="mt-3">
                <InfoRow label="Identifiant" value={animal.identifiant} />
                <InfoRow label="NNI" value={animal.nni || "—"} />
                <InfoRow label="Race" value={animal.race?.nom ?? "—"} />
                <InfoRow label="Sexe" value={animal.sexe} />
                <InfoRow label="Origine" value={animal.origine === "ferme" ? "Né à la ferme" : animal.origine} />
                <InfoRow label="Date d'entrée" value={new Date(animal.dateEntree).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })} />
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="rounded-[12px] border border-border-light bg-card p-5">
                <h3 className="font-dm-sans text-[14px] font-semibold text-label">Généalogie</h3>
                <div className="mt-3">
                  <InfoRow label="Père" value={animal.pere || "—"} />
                  <InfoRow label="Mère" value={animal.mere || "—"} />
                </div>
              </div>
              <div className="rounded-[12px] border border-border-light bg-card p-5">
                <h3 className="font-dm-sans text-[14px] font-semibold text-label">Localisation</h3>
                <div className="mt-3">
                  <InfoRow label="Parcelle" value={
                    animal.parcelle ? (
                      <Link href={`/parcelles`} className="text-primary hover:underline">{animal.parcelle.nom}</Link>
                    ) : "—"
                  } />
                  <InfoRow label="Phase" value={animal.phase} />
                  <InfoRow label="Statut" value={animal.statut} />
                </div>
              </div>
            </div>

            {animal.notes && (
              <div className="col-span-2 rounded-[12px] border border-border-light bg-card p-5">
                <h3 className="font-dm-sans text-[14px] font-semibold text-label">Notes</h3>
                <p className="mt-2 font-inter text-[13px] leading-relaxed text-subtle">{animal.notes}</p>
              </div>
            )}
          </div>
        )}

        {/* ── CROISSANCE ── */}
        {activeTab === "croissance" && (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-4 gap-4">
              <KpiCard label="Poids d'entrée" value={`${animal.poidsEntree} kg`} icon="package" />
              <KpiCard label="Poids actuel" value={`${animal.poidsActuel} kg`} icon="trending-up" />
              <KpiCard label="Gain total" value={`+${poidsGain.toFixed(1)} kg`} sub={`en ${joursElevage} jours`} icon="arrow-up" highlight />
              <KpiCard label="GMQ actuel" value={`${animal.gmqActuel} kg/j`} sub={animal.race?.gmqCible ? `cible ${animal.race.gmqCible} kg/j` : undefined} icon="activity" highlight />
            </div>

            {targetPoids > 0 && (
              <div className="rounded-[12px] border border-border-light bg-card p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-dm-sans text-[14px] font-semibold text-label">Progression vers le poids cible</span>
                    <p className="mt-0.5 font-inter text-[12px] text-subtle">Poids cible d'abattage défini par la race</p>
                  </div>
                  <span className="font-dm-sans text-[22px] font-bold text-primary">{progressVersTarget}%</span>
                </div>
                <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-border-light">
                  <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progressVersTarget}%` }} />
                </div>
                <div className="mt-2 flex justify-between">
                  <span className="font-inter text-[11px] text-subtle">{animal.poidsEntree} kg (entrée)</span>
                  <span className="font-inter text-[11px] text-label font-semibold">{animal.poidsActuel} kg actuellement</span>
                  <span className="font-inter text-[11px] text-subtle">Cible : {targetPoids} kg</span>
                </div>
              </div>
            )}

            <div className="rounded-[12px] border border-border-light bg-card">
              <div className="flex items-center justify-between border-b border-border-light px-5 py-3">
                <div>
                  <span className="font-dm-sans text-[14px] font-semibold text-label">Historique des pesées</span>
                  <span className="ml-2 font-inter text-[12px] text-placeholder">{pesees.length} enregistrement{pesees.length !== 1 ? "s" : ""}</span>
                </div>
                {canSaisiePesee && (
                  <Link href={`/animaux/${id}/pesee/nouveau`} className="flex items-center gap-1.5 rounded-[6px] bg-primary px-3 py-1.5 font-inter text-[12px] font-semibold text-white hover:bg-primary/90 transition-colors">
                    <Icon name="plus" size={12} />
                    Nouvelle pesée
                  </Link>
                )}
              </div>

              {pesees.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-12">
                  <Icon name="trending-up" size={28} className="text-placeholder" />
                  <p className="font-inter text-[13px] text-placeholder">Aucune pesée enregistrée</p>
                  {canSaisiePesee && (
                    <Link href={`/animaux/${id}/pesee/nouveau`} className="mt-1 font-inter text-[13px] text-primary hover:underline">
                      + Enregistrer la première pesée
                    </Link>
                  )}
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-[1fr_100px_100px_110px_1fr] border-b border-border-light bg-surface px-5 py-2">
                    {["Date", "Poids", "Gain", "GMQ", "Observateur"].map((h) => (
                      <span key={h} className="font-inter text-[10px] font-semibold uppercase tracking-wide text-placeholder">{h}</span>
                    ))}
                  </div>
                  {pesees.map((p, idx) => {
                    const prev = pesees[idx + 1];
                    const gain = prev ? p.poids - prev.poids : p.poids - animal.poidsEntree;
                    const gmqOk = p.gmq != null && animal.race?.gmqCible && p.gmq >= animal.race.gmqCible;
                    return (
                      <div key={p.id} className="grid grid-cols-[1fr_100px_100px_110px_1fr] items-center border-b border-border-light px-5 py-3 last:border-b-0 hover:bg-surface/50 transition-colors">
                        <span className="font-inter text-[13px] text-subtle">{new Date(p.date).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}</span>
                        <span className="font-dm-sans text-[13px] font-semibold text-label">{p.poids} kg</span>
                        <span className={`font-inter text-[13px] font-semibold ${gain >= 0 ? "text-success" : "text-danger"}`}>
                          {gain >= 0 ? "+" : ""}{gain.toFixed(1)} kg
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className={`font-dm-sans text-[13px] font-semibold ${gmqOk ? "text-success" : p.gmq != null ? "text-warning" : "text-placeholder"}`}>
                            {p.gmq != null ? `${p.gmq} kg/j` : "—"}
                          </span>
                          {p.gmq != null && (
                            <Icon name={gmqOk ? "trending-up" : "trending-down"} size={12} className={gmqOk ? "text-success" : "text-warning"} />
                          )}
                        </div>
                        <span className="font-inter text-[12px] text-subtle truncate">{p.observateur || "—"}</span>
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          </div>
        )}

        {/* ── SANTÉ ── */}
        {activeTab === "sante" && (
          <div className="flex flex-col gap-4">
            {/* Health state card with inline editor */}
            <div className="rounded-[12px] border border-border-light bg-card p-5">
              <div className="flex items-center justify-between">
                <h3 className="font-dm-sans text-[14px] font-semibold text-label">État de santé</h3>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => downloadDoc(`/sante/animal/${id}/carnet`, `carnet-sante-${animal.identifiant}.pdf`, "Carnet de santé")}
                    disabled={downloading}
                    className="flex items-center gap-1.5 rounded-[6px] border border-border-light bg-surface px-3 py-1.5 font-dm-sans text-[12px] font-semibold text-subtle hover:bg-border-light transition-colors disabled:opacity-50"
                  >
                    <Icon name="clipboard-list" size={13} />
                    Carnet de santé PDF
                  </button>
                  <Link href="/sante/etat" className="flex items-center gap-1 font-inter text-[12px] text-primary hover:underline">
                    Module santé <Icon name="arrow-right" size={12} />
                  </Link>
                </div>
              </div>

              {/* Current state banner */}
              <div className={`mt-3 flex items-center gap-3 rounded-[10px] border p-4 ${sante.bg} ${sante.border}`}>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/60">
                  <Icon name="heart-pulse" size={18} className={sante.text} />
                </div>
                <div>
                  <span className={`font-dm-sans text-[16px] font-bold ${sante.text}`}>{animal.etatSante}</span>
                  <p className="font-inter text-[11px] text-subtle">État actuel</p>
                </div>
              </div>

              {/* State picker */}
              {canManage && (
                <div className="mt-4">
                  <p className="font-inter text-[12px] font-medium text-subtle mb-2">Modifier l'état :</p>
                  <div className="grid grid-cols-4 gap-2">
                    {(Object.keys(SANTE_STYLE) as Array<keyof typeof SANTE_STYLE>).map((etat) => {
                      const st = SANTE_STYLE[etat];
                      const isActive = animal.etatSante === etat;
                      return (
                        <button
                          key={etat}
                          disabled={isActive || updatingSante}
                          onClick={() => updateSante(etat)}
                          className={`flex flex-col items-center gap-1.5 rounded-[8px] border px-3 py-2.5 transition-all disabled:cursor-default ${
                            isActive
                              ? `${st.bg} ${st.border} ${st.text} border font-semibold`
                              : `border-border-light bg-surface text-subtle hover:border-primary/30 hover:bg-primary/5 hover:text-label`
                          }`}
                        >
                          <span className={`h-2 w-2 rounded-full ${isActive ? st.dot : "bg-border-light"}`} />
                          <span className="font-inter text-[12px]">{etat}</span>
                          {isActive && <Icon name="check" size={10} className={st.text} />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Treatments list */}
            <div className="rounded-[12px] border border-border-light bg-card">
              <div className="flex items-center justify-between border-b border-border-light px-5 py-3">
                <div>
                  <span className="font-dm-sans text-[14px] font-semibold text-label">Traitements</span>
                  <span className="ml-2 font-inter text-[12px] text-placeholder">{traitements.length} enregistrement{traitements.length !== 1 ? "s" : ""}</span>
                </div>
                <Link
                  href={`/sante/traitement/nouveau?animal=${id}`}
                  className="flex items-center gap-1.5 rounded-[6px] bg-primary px-3 py-1.5 font-inter text-[12px] font-semibold text-white hover:bg-primary/90 transition-colors"
                >
                  <Icon name="plus" size={12} />
                  Nouveau traitement
                </Link>
              </div>

              {traitements.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-12">
                  <Icon name="stethoscope" size={28} className="text-placeholder" />
                  <p className="font-inter text-[13px] text-placeholder">Aucun traitement enregistré pour cet animal</p>
                  <Link href={`/sante/traitement/nouveau?animal=${id}`} className="mt-1 font-inter text-[13px] text-primary hover:underline">
                    + Enregistrer un traitement
                  </Link>
                </div>
              ) : (
                traitements.map((t) => (
                  <div key={t.id} className="flex items-start gap-4 border-b border-border-light px-5 py-4 last:border-b-0">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-warning/10">
                      <Icon name="syringe" size={15} className="text-warning" />
                    </div>
                    <div className="flex flex-1 flex-col gap-0.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-dm-sans text-[13px] font-semibold text-label">{t.produit}</span>
                        <span className={`rounded-full px-2 py-0.5 font-inter text-[10px] font-semibold ${TRAITEMENT_STATUT[t.statut] ?? "bg-surface text-subtle"}`}>{t.statut}</span>
                      </div>
                      <span className="font-inter text-[12px] text-subtle">{t.type} · {t.dose} {t.doseUnite} · Voie {t.voie}</span>
                      <span className="font-inter text-[11px] text-placeholder">
                        Du {new Date(t.dateDebut).toLocaleDateString("fr-FR")}
                        {t.dateFin ? ` au ${new Date(t.dateFin).toLocaleDateString("fr-FR")}` : " (en cours)"}
                        {t.veterinaire ? ` · ${t.veterinaire}` : ""}
                      </span>
                      {t.observations && <span className="mt-0.5 font-inter text-[11px] italic text-placeholder">{t.observations}</span>}
                    </div>
                    {t.delaiRetrait > 0 && (
                      <div className="flex flex-col items-end gap-0.5 shrink-0">
                        <span className="font-inter text-[10px] text-placeholder">Délai retrait</span>
                        <span className="font-dm-sans text-[14px] font-bold text-warning">{t.delaiRetrait} j</span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ── PARCOURS ── */}
        {activeTab === "parcours" && (
          <div className="flex flex-col gap-4">
            <div className="rounded-[12px] border border-border-light bg-card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-dm-sans text-[15px] font-semibold text-label">Progression des phases</span>
                  <p className="mt-0.5 font-inter text-[12px] text-subtle">
                    Phase actuelle : <strong>{animal.phase}</strong>
                    {phaseIndex >= 0 && ` (étape ${phaseIndex + 1} / ${PHASES.length})`}
                  </p>
                </div>
                {nextPhase && canManage ? (
                  <button
                    onClick={() => setConfirmPhase(true)}
                    className="flex items-center gap-1.5 rounded-[6px] bg-primary px-4 py-2 font-dm-sans text-[13px] font-semibold text-white hover:bg-primary/90 transition-colors"
                  >
                    <Icon name="arrow-right" size={14} />
                    Passer à « {nextPhase} »
                  </button>
                ) : !nextPhase ? (
                  <span className="flex items-center gap-1.5 rounded-full bg-success/10 px-3 py-1.5 font-inter text-[12px] font-semibold text-success">
                    <Icon name="check-circle" size={14} />
                    Phase finale atteinte
                  </span>
                ) : null}
              </div>

              <div className="mt-8 flex items-center">
                {PHASES.map((ph, i) => (
                  <div key={ph} className="flex flex-1 items-center last:flex-none">
                    <div className="flex flex-col items-center gap-2">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-full font-dm-sans text-[13px] font-bold transition-all ${
                        i < phaseIndex
                          ? "bg-primary text-white"
                          : i === phaseIndex
                          ? "bg-primary text-white ring-4 ring-primary/20"
                          : "border-2 border-border-light bg-surface text-placeholder"
                      }`}>
                        {i < phaseIndex ? <Icon name="check" size={15} /> : i + 1}
                      </div>
                      <span className={`font-inter text-[12px] ${i === phaseIndex ? "font-semibold text-primary" : i < phaseIndex ? "font-medium text-label" : "text-placeholder"}`}>
                        {ph}
                      </span>
                    </div>
                    {i < PHASES.length - 1 && (
                      <div className={`mx-2 h-0.5 flex-1 rounded-full ${i < phaseIndex ? "bg-primary" : "bg-border-light"}`} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-[12px] border border-border-light bg-card p-5">
                <span className="font-dm-sans text-[14px] font-semibold text-label">Données d'entrée</span>
                <div className="mt-3">
                  <InfoRow label="Date d'entrée" value={new Date(animal.dateEntree).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })} />
                  <InfoRow label="Poids d'entrée" value={`${animal.poidsEntree} kg`} />
                  <InfoRow label="Jours d'élevage" value={`${joursElevage} jours`} />
                </div>
              </div>
              <div className="rounded-[12px] border border-border-light bg-card p-5">
                <span className="font-dm-sans text-[14px] font-semibold text-label">Performance</span>
                <div className="mt-3">
                  <InfoRow label="Poids actuel" value={`${animal.poidsActuel} kg`} />
                  <InfoRow label="Gain total" value={`+${poidsGain.toFixed(1)} kg`} />
                  <InfoRow label="GMQ moyen" value={`${animal.gmqActuel} kg/j`} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── FINANCES ── */}
        {activeTab === "finances" && (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-3 gap-4">
              <KpiCard label="Coût total élevage" value={`${animal.coutCumule.toLocaleString("fr-FR")} MAD`} icon="coins" />
              <KpiCard label="Coût / kg produit" value={`${coutParKg} MAD`} sub="par kg de poids vif" icon="scale" highlight />
              <KpiCard label="Coût / jour" value={`${coutParJour.toLocaleString("fr-FR")} MAD`} sub={`sur ${joursElevage} jours`} icon="calendar" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-[12px] border border-border-light bg-card p-5">
                <h3 className="font-dm-sans text-[14px] font-semibold text-label">Détail des coûts</h3>
                <div className="mt-3">
                  <InfoRow label="Coût total accumulé" value={`${animal.coutCumule.toLocaleString("fr-FR")} MAD`} />
                  <InfoRow label="Durée d'élevage" value={`${joursElevage} jours`} />
                  <InfoRow label="Coût par jour" value={`${coutParJour.toLocaleString("fr-FR")} MAD/j`} />
                  <InfoRow label="Coût par kg produit" value={`${coutParKg} MAD/kg`} />
                </div>
              </div>

              <div className="rounded-[12px] border border-border-light bg-card p-5">
                <h3 className="font-dm-sans text-[14px] font-semibold text-label">Projection vente</h3>
                <div className="mt-3">
                  <InfoRow label="Poids actuel" value={`${animal.poidsActuel} kg`} />
                  {targetPoids > 0 && (
                    <InfoRow label="Poids cible d'abattage" value={`${targetPoids} kg`} />
                  )}
                  {targetPoids > 0 && (
                    <InfoRow label="Kg restants à prendre" value={
                      <span className={targetPoids - animal.poidsActuel > 0 ? "text-warning" : "text-success"}>
                        {Math.max(0, targetPoids - animal.poidsActuel).toFixed(1)} kg
                      </span>
                    } />
                  )}
                  <InfoRow label="Coût / kg à date" value={`${coutParKg} MAD/kg`} />
                </div>

                {animal.statut === "Sorti" && animal.sortie?.prix != null && (
                  <div className="mt-4 rounded-[8px] bg-success/5 border border-success/20 p-3">
                    <p className="font-inter text-[11px] font-semibold text-success uppercase tracking-wide">Sortie enregistrée</p>
                    <div className="mt-1 flex items-center justify-between">
                      <span className="font-inter text-[12px] text-subtle">Prix de vente</span>
                      <span className="font-dm-sans text-[15px] font-bold text-label">{animal.sortie.prix.toLocaleString("fr-FR")} MAD</span>
                    </div>
                    <div className="mt-1 flex items-center justify-between">
                      <span className="font-inter text-[12px] text-subtle">Marge</span>
                      <span className={`font-dm-sans text-[15px] font-bold ${animal.sortie.prix - animal.coutCumule >= 0 ? "text-success" : "text-danger"}`}>
                        {(animal.sortie.prix - animal.coutCumule).toLocaleString("fr-FR")} MAD
                      </span>
                    </div>
                  </div>
                )}
              </div>
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
