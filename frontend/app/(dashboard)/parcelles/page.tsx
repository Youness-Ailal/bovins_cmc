import Link from "next/link";
import Icon from "@/components/ui/Icon";

const PARCELLES = [
  {
    id: "parcelle-alpha",
    nom: "Parcelle Alpha",
    capacite: "120 animaux",
    occupation: 65,
    nbActuels: 78,
    ration: "Ration Bovins Adultes",
  },
  {
    id: "parcelle-beta",
    nom: "Parcelle Beta",
    capacite: "80 animaux",
    occupation: 42,
    nbActuels: 34,
    ration: "Ration Veaux",
  },
  {
    id: "parcelle-gamma",
    nom: "Parcelle Gamma",
    capacite: "100 animaux",
    occupation: 58,
    nbActuels: 58,
    ration: "Ration Mixte",
  },
];

function OccupationBar({ pct }: { pct: number }) {
  const color =
    pct >= 90 ? "bg-danger" : pct >= 70 ? "bg-warning" : "bg-success";
  return (
    <div className="flex items-center gap-2.5">
      <div className="h-2 w-32 overflow-hidden rounded-full bg-surface">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="font-inter text-[13px] text-subtle">{pct}%</span>
    </div>
  );
}

export default function ListeParcellesPage() {
  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-surface">
      {/* Content area (no separate page header — design shows content starting directly) */}
      <div className="flex flex-1 flex-col gap-6 overflow-auto p-8">
        {/* Header row */}
        <div className="flex items-center justify-between">
          <span className="font-dm-sans text-2xl font-bold text-label">Liste des parcelles</span>
          <Link
            href="/parcelles/nouvelle"
            className="flex items-center gap-2 rounded-[8px] bg-primary px-4 py-2.5 font-inter text-sm font-semibold text-white hover:bg-primary-hover transition-colors"
          >
            <Icon name="plus" size={16} />
            Nouvelle parcelle
          </Link>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-[12px] border border-border-light bg-card">
          {/* Header */}
          <div className="flex items-center gap-4 bg-surface px-5" style={{ height: 44 }}>
            <span className="flex-1 font-inter text-[11px] font-bold uppercase tracking-wide text-placeholder">Nom parcelle</span>
            <span className="flex-1 font-inter text-[11px] font-bold uppercase tracking-wide text-placeholder">Capacité max</span>
            <span className="w-[260px] shrink-0 font-inter text-[11px] font-bold uppercase tracking-wide text-placeholder">Occupation actuelle</span>
            <span className="flex-1 font-inter text-[11px] font-bold uppercase tracking-wide text-placeholder">Ration assignée</span>
            <span className="w-[51px] shrink-0 font-inter text-[11px] font-bold uppercase tracking-wide text-placeholder">Actions</span>
          </div>

          {/* Rows */}
          {PARCELLES.map((p) => (
            <div
              key={p.id}
              className="flex items-center gap-4 border-b border-border-light px-5 last:border-b-0"
              style={{ height: 56 }}
            >
              <span className="flex-1 font-inter text-sm font-medium text-label">{p.nom}</span>
              <span className="flex-1 font-inter text-sm text-subtle">{p.capacite}</span>
              <div className="flex w-[260px] shrink-0 items-center gap-2.5">
                <OccupationBar pct={p.occupation} />
                <span className="font-inter text-[13px] text-subtle">{p.nbActuels} animaux</span>
              </div>
              <span className="flex-1 font-inter text-sm text-subtle">{p.ration}</span>
              <div className="flex w-[51px] shrink-0 items-center gap-3">
                <Link href={`/parcelles/${p.id}`} className="text-placeholder hover:text-subtle transition-colors">
                  <Icon name="eye" size={15} />
                </Link>
                <button className="text-placeholder hover:text-subtle transition-colors">
                  <Icon name="pencil" size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
