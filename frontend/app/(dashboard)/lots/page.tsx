import Link from "next/link";
import Icon from "@/components/ui/Icon";
import Badge from "@/components/ui/Badge";

const LOTS = [
  {
    id: "LOT-A",
    nbAnimaux: 15,
    phase: "Engraissement" as const,
    gmq: "0.78 kg/j",
    ic: "5.2",
    cout: "48 250",
    date: "12/01/2024",
  },
  {
    id: "LOT-B",
    nbAnimaux: 8,
    phase: "Croissance" as const,
    gmq: "0.82 kg/j",
    ic: "6.4",
    cout: "28 900",
    date: "05/03/2024",
  },
];

const PHASE_VARIANT = {
  Croissance: "phase-croissance",
  Engraissement: "phase-engraissement",
  Finition: "phase-finition",
} as const;

export default function ListeLotsPage() {
  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-surface">
      {/* Page header */}
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-border-light bg-card px-7">
        <div className="flex items-center gap-1.5">
          <span className="font-dm-sans text-xl font-semibold text-label">Liste des lots</span>
          <span className="font-inter text-sm text-placeholder">/ Lots</span>
        </div>
        <button className="flex items-center gap-1.5 rounded-[6px] bg-primary px-3.5 py-2 font-dm-sans text-[13px] font-semibold text-white hover:bg-primary-hover transition-colors">
          <Icon name="plus" size={14} />
          Nouveau lot
        </button>
      </header>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-4 overflow-auto p-6">
        {/* Table */}
        <div className="overflow-hidden rounded-[10px] border border-border-light bg-card">
          {/* Header */}
          <div className="flex items-center gap-4 bg-surface px-4" style={{ height: 44 }}>
            <span className="w-[140px] shrink-0 font-dm-sans text-xs font-semibold text-placeholder">Nom du lot</span>
            <span className="w-[100px] shrink-0 font-dm-sans text-xs font-semibold text-placeholder">Nb animaux</span>
            <span className="w-[140px] shrink-0 font-dm-sans text-xs font-semibold text-placeholder">Phase majoritaire</span>
            <span className="w-[110px] shrink-0 font-dm-sans text-xs font-semibold text-placeholder">GMQ moyen</span>
            <span className="w-[100px] shrink-0 font-dm-sans text-xs font-semibold text-placeholder">IC moyen</span>
            <span className="w-[130px] shrink-0 font-dm-sans text-xs font-semibold text-placeholder">Coût total (MAD)</span>
            <span className="w-[120px] shrink-0 font-dm-sans text-xs font-semibold text-placeholder">Date création</span>
            <span className="flex-1 font-dm-sans text-xs font-semibold text-placeholder">Actions</span>
          </div>

          {/* Rows */}
          {LOTS.map((lot) => (
            <div
              key={lot.id}
              className="flex items-center gap-4 border-b border-border-light px-4 last:border-b-0"
              style={{ height: 52 }}
            >
              <span className="w-[140px] shrink-0 font-inter text-[13px] font-semibold text-label">{lot.id}</span>
              <span className="w-[100px] shrink-0 font-inter text-[13px] text-subtle">{lot.nbAnimaux}</span>
              <div className="flex w-[140px] shrink-0 items-center">
                <Badge variant={PHASE_VARIANT[lot.phase]}>{lot.phase}</Badge>
              </div>
              <span className="w-[110px] shrink-0 font-inter text-[13px] text-subtle">{lot.gmq}</span>
              <span className="w-[100px] shrink-0 font-inter text-[13px] text-subtle">{lot.ic}</span>
              <span className="w-[130px] shrink-0 font-inter text-[13px] text-label">{lot.cout}</span>
              <span className="w-[120px] shrink-0 font-inter text-[13px] text-subtle">{lot.date}</span>
              <div className="flex flex-1 items-center gap-2">
                <Link href={`/lots/${lot.id}`} className="text-placeholder hover:text-subtle transition-colors">
                  <Icon name="eye" size={15} />
                </Link>
                <button className="text-placeholder hover:text-subtle transition-colors">
                  <Icon name="pencil" size={15} />
                </button>
              </div>
            </div>
          ))}

          {/* Pagination */}
          <div className="flex items-center justify-between bg-surface px-4" style={{ height: 48 }}>
            <span className="font-inter text-[13px] text-placeholder">← Précédent</span>
            <span className="font-inter text-xs text-placeholder">Page 1 sur 5 lots actifs — Suivant →</span>
          </div>
        </div>
      </div>
    </div>
  );
}
