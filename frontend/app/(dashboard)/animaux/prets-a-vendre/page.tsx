// UC-19 — Liste animaux prêts à vendre
// Animaux ayant atteint ou dépassé leur poids cible avec délai de retrait écoulé.
// Classés par coût/jour décroissant pour prioriser les sorties.

import Link from "next/link";
import Icon from "@/components/ui/Icon";
import Badge from "@/components/ui/Badge";
import DataTable, { Column } from "@/components/ui/DataTable";

interface AnimalPret {
  id: string;
  race: string;
  sexe: string;
  poids: string;
  poidsCible: string;
  depassement: string;
  coutJour: string;
  coutTotal: string;
  lot: string;
  parcelle: string;
  delaiRetrait: string;
}

// Classés par coût/jour décroissant (ceux qui coûtent le plus à garder — à vendre en priorité)
const PRETS: AnimalPret[] = [
  { id: "ANI-003", race: "Limousin", sexe: "Mâle", poids: "510 kg", poidsCible: "480 kg", depassement: "+30 kg", coutJour: "22.60 MAD", coutTotal: "15 780 MAD", lot: "LOT-B", parcelle: "P-01", delaiRetrait: "Écoulé" },
  { id: "ANI-019", race: "Charolais", sexe: "Mâle", poids: "495 kg", poidsCible: "480 kg", depassement: "+15 kg", coutJour: "20.40 MAD", coutTotal: "18 200 MAD", lot: "LOT-A", parcelle: "P-02", delaiRetrait: "Écoulé" },
  { id: "ANI-022", race: "Angus", sexe: "Femelle", poids: "482 kg", poidsCible: "460 kg", depassement: "+22 kg", coutJour: "19.80 MAD", coutTotal: "12 900 MAD", lot: "LOT-A", parcelle: "P-01", delaiRetrait: "Écoulé" },
  { id: "ANI-031", race: "Holstein", sexe: "Mâle", poids: "520 kg", poidsCible: "500 kg", depassement: "+20 kg", coutJour: "18.40 MAD", coutTotal: "21 450 MAD", lot: "LOT-B", parcelle: "P-02", delaiRetrait: "Écoulé" },
];

const COLUMNS: Column<AnimalPret>[] = [
  {
    key: "id",
    label: "Identifiant",
    width: "w-[110px]",
    render: (r) => (
      <Link href={`/animaux/${r.id}`} className="font-inter text-[13px] font-semibold text-primary hover:underline">
        {r.id}
      </Link>
    ),
  },
  { key: "race", label: "Race", width: "w-[100px]" },
  { key: "sexe", label: "Sexe", width: "w-[70px]" },
  {
    key: "poids",
    label: "Poids actuel",
    width: "w-[110px]",
    render: (r) => <span className="font-inter text-[13px] font-semibold text-label">{r.poids}</span>,
  },
  { key: "poidsCible", label: "Poids cible", width: "w-[100px]" },
  {
    key: "depassement",
    label: "Dépassement",
    width: "w-[110px]",
    render: (r) => <span className="font-inter text-[13px] font-semibold text-success">{r.depassement}</span>,
  },
  {
    key: "coutJour",
    label: "Coût/jour",
    width: "w-[120px]",
    render: (r) => <span className="font-inter text-[13px] font-semibold text-warning">{r.coutJour}</span>,
  },
  { key: "coutTotal", label: "Coût total", width: "w-[120px]" },
  { key: "parcelle", label: "Parcelle", width: "w-[80px]" },
  {
    key: "delaiRetrait",
    label: "Délai retrait",
    width: "w-[110px]",
    render: (r) => <Badge variant="sain">{r.delaiRetrait}</Badge>,
  },
  {
    key: "_actions",
    label: "Actions",
    width: "w-[100px]",
    align: "right",
    render: (r) => (
      <Link
        href={`/animaux/${r.id}/sortie`}
        className="flex items-center gap-1 rounded-[4px] bg-danger/10 px-2 py-1 font-inter text-[11px] font-semibold text-danger hover:bg-danger/20 transition-colors"
      >
        <Icon name="scissors" size={12} />
        Sortie
      </Link>
    ),
  },
];

export default function PretsAVendrePage() {
  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-surface">
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-border-light bg-card px-7">
        <div className="flex items-center gap-1.5">
          <Link href="/animaux" className="font-inter text-sm text-placeholder hover:text-subtle transition-colors">Animaux</Link>
          <span className="font-inter text-sm text-placeholder">/</span>
          <span className="font-dm-sans text-xl font-semibold text-label">Prêts à vendre</span>
          <span className="ml-1.5 flex items-center rounded-full bg-success/10 px-2 py-0.5 font-inter text-[11px] font-semibold text-success">
            {PRETS.length} animaux
          </span>
        </div>
        <Link href="/animaux" className="flex items-center gap-1.5 rounded-[6px] border border-border-light bg-surface px-3.5 py-2 font-dm-sans text-[13px] font-semibold text-subtle hover:bg-border-light transition-colors">
          <Icon name="arrow-left" size={14} />
          Retour
        </Link>
      </header>

      <div className="flex flex-1 flex-col gap-4 overflow-auto p-6">
        {/* Info banner */}
        <div className="flex items-start gap-3 rounded-[8px] border border-success/30 bg-success/5 px-4 py-3">
          <Icon name="check-circle" size={16} className="mt-0.5 shrink-0 text-success" />
          <div className="flex flex-col gap-0.5">
            <span className="font-inter text-[13px] font-semibold text-success">
              {PRETS.length} animaux ont atteint leur poids cible avec délai de retrait écoulé
            </span>
            <span className="font-inter text-[12px] text-subtle">
              Classés par coût/jour décroissant — les plus coûteux à maintenir apparaissent en premier.
            </span>
          </div>
        </div>

        {/* Summary */}
        <div className="flex gap-4">
          {[
            { label: "Coût/jour total", value: "81.20 MAD", color: "text-warning" },
            { label: "Coût cumulé total", value: "68 330 MAD", color: "text-label" },
            { label: "Gain potentiel estimé", value: "+24 500 MAD", color: "text-success" },
            { label: "Poids total disponible", value: "2 007 kg", color: "text-primary" },
          ].map(({ label, value, color }) => (
            <div key={label} className="flex flex-1 flex-col gap-1 rounded-[8px] border border-border-light bg-card p-4">
              <span className="font-inter text-[11px] text-placeholder">{label}</span>
              <span className={`font-dm-sans text-xl font-bold ${color}`}>{value}</span>
            </div>
          ))}
        </div>

        <DataTable
          columns={COLUMNS}
          data={PRETS}
          keyExtractor={(a) => a.id}
          pagination={{ page: 1, total: 1, count: PRETS.length }}
        />
      </div>
    </div>
  );
}
