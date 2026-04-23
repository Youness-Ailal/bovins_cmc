import Link from "next/link";
import Icon from "@/components/ui/Icon";
import Badge from "@/components/ui/Badge";

export default async function FicheAnimalPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tabs = ["Infos", "Pesées", "Phases", "Rentabilité"];

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-surface">
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-border-light bg-card px-7">
        <div className="flex items-center gap-1.5">
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

      <div className="flex h-12 shrink-0 items-center border-b border-border-light bg-card px-6">
        {tabs.map((tab, i) => (
          <button
            key={tab}
            className={`flex h-12 items-center px-4 font-inter text-sm transition-colors ${
              i === 0
                ? "border-b-2 border-primary font-semibold text-primary"
                : "font-normal text-placeholder hover:text-subtle"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="flex flex-1 flex-col gap-4 overflow-auto p-6">
        <div className="flex items-center justify-between rounded-[10px] border border-border-light bg-card p-5">
          <div className="flex items-center gap-4">
            <div className="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-primary font-dm-sans text-[22px] font-bold text-white">
              A
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
            <span className="flex items-center gap-1.5 rounded-full bg-[#DFE6E1] px-3.5 py-1.5 font-inter text-xs font-semibold text-[#004D1A]">
              <Icon name="check" size={12} />
              Sain
            </span>
            <span className="font-inter text-[11px] text-placeholder">État de santé</span>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="flex flex-1 flex-col gap-3 rounded-[10px] border border-border-light bg-card p-5">
            <span className="font-dm-sans text-sm font-semibold text-label">Identité</span>
            <Row label="NNI" value="MA-2023-00174" />
            <Row label="Race" value="Holstein" />
            <Row label="Sexe" value="Mâle" />
            <Row label="Père" value="BL-450-P" />
            <Row label="Mère" value="BL-312-M" />
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
              <span className="font-inter text-[13px] font-medium text-label">Janvier 2025</span>
            </div>
          </div>

          <div className="flex flex-1 flex-col gap-3 rounded-[10px] border border-border-light bg-card p-5">
            <span className="font-dm-sans text-sm font-semibold text-label">Localisation</span>
            <Row label="Parcelle" value="P-01 — Champ Nord" />
            <Row label="Lot" value="LOT-A" />
            <div className="flex flex-col gap-1.5">
              <span className="font-inter text-[11px] text-placeholder">Phase actuelle</span>
              <Badge variant="phase-finition">Croissance</Badge>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Link
            href={`/animaux/${id}/sortie`}
            className="flex items-center gap-1.5 rounded-[6px] border border-danger bg-white px-3.5 py-2 font-dm-sans text-[13px] font-semibold text-danger hover:bg-red-50 transition-colors"
          >
            Enregistrer une sortie
          </Link>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="font-inter text-[11px] text-placeholder">{label}</span>
      <span className="font-inter text-[13px] font-medium text-label">{value}</span>
    </div>
  );
}