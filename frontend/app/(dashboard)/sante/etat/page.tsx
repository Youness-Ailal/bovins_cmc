// UC-13 — État de santé (vue globale du troupeau)

import Link from "next/link";
import Icon from "@/components/ui/Icon";
import DataTable, { Column } from "@/components/ui/DataTable";
import SanteTabs from "@/components/dashboard/SanteTabs";

type EtatSante = "Sain" | "En observation" | "En traitement" | "Malade";

interface AnimalSante {
  id: string;
  race: string;
  etat: EtatSante;
  temperature: string;
  derniereObs: string;
  delaiRetrait: string;
}

const ETAT_STYLE: Record<EtatSante, string> = {
  Sain: "bg-success/10 text-success",
  "En observation": "bg-info/10 text-info",
  "En traitement": "bg-warning/10 text-warning",
  Malade: "bg-danger/10 text-danger",
};

const ETATS_SANTE: AnimalSante[] = [
  { id: "ANI-012", race: "Holstein", etat: "En traitement", temperature: "39.2 °C", derniereObs: "02/06/2026", delaiRetrait: "5 j restants" },
  { id: "ANI-047", race: "Limousin", etat: "Malade", temperature: "40.1 °C", derniereObs: "02/06/2026", delaiRetrait: "3 j restants" },
  { id: "ANI-031", race: "Angus", etat: "En observation", temperature: "38.7 °C", derniereObs: "01/06/2026", delaiRetrait: "—" },
  { id: "ANI-001", race: "Holstein", etat: "Sain", temperature: "38.5 °C", derniereObs: "30/05/2026", delaiRetrait: "—" },
  { id: "ANI-019", race: "Charolais", etat: "Sain", temperature: "38.6 °C", derniereObs: "29/05/2026", delaiRetrait: "—" },
];

const COLUMNS: Column<AnimalSante>[] = [
  {
    key: "id", label: "Animal", width: "w-[130px]",
    render: (r) => (
      <div className="flex flex-col">
        <Link href={`/animaux/${r.id}`} className="font-inter text-[13px] font-semibold text-primary hover:underline">{r.id}</Link>
        <span className="font-inter text-[11px] text-placeholder">{r.race}</span>
      </div>
    ),
  },
  {
    key: "etat", label: "État de santé", width: "w-[150px]",
    render: (r) => <span className={`inline-flex rounded-full px-2.5 py-1 font-inter text-[11px] font-semibold ${ETAT_STYLE[r.etat]}`}>{r.etat}</span>,
  },
  { key: "temperature", label: "Température", width: "w-[110px]" },
  { key: "derniereObs", label: "Dernière obs.", width: "w-[120px]" },
  {
    key: "delaiRetrait", label: "Délai retrait", width: "w-[120px]",
    render: (r) => r.delaiRetrait === "—"
      ? <span className="font-inter text-[13px] text-placeholder">—</span>
      : <span className="font-inter text-[13px] font-semibold text-danger">{r.delaiRetrait}</span>,
  },
  {
    key: "_actions", label: "Actions", width: "w-[90px]", align: "right",
    render: () => (
      <Link href="/sante/etat/nouveau" className="flex justify-end items-center gap-1 font-inter text-[12px] font-medium text-primary hover:underline">
        <Icon name="pencil" size={13} /> MàJ
      </Link>
    ),
  },
];

export default function EtatSantePage() {
  const sains = ETATS_SANTE.filter((a) => a.etat === "Sain").length;
  const observation = ETATS_SANTE.filter((a) => a.etat === "En observation").length;
  const enTraitement = ETATS_SANTE.filter((a) => a.etat === "En traitement").length;
  const malades = ETATS_SANTE.filter((a) => a.etat === "Malade").length;

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-surface">
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-border-light bg-card px-7">
        <div className="flex items-center gap-1.5">
          <span className="font-dm-sans text-xl font-semibold text-label">Santé</span>
          <span className="font-inter text-sm text-placeholder">/ État de santé</span>
        </div>
        <Link href="/sante/etat/nouveau" className="flex items-center gap-1.5 rounded-[6px] bg-primary px-3.5 py-2 font-dm-sans text-[13px] font-semibold text-white hover:bg-primary-hover transition-colors">
          <Icon name="plus" size={14} />
          Enregistrer un état
        </Link>
      </header>

      <SanteTabs />

      <div className="flex flex-1 flex-col gap-4 overflow-auto p-6">
        <div className="flex gap-4">
          {[
            { label: "Sains", count: sains, color: "text-success" },
            { label: "En observation", count: observation, color: "text-info" },
            { label: "En traitement", count: enTraitement, color: "text-warning" },
            { label: "Malades", count: malades, color: "text-danger" },
          ].map(({ label, count, color }) => (
            <div key={label} className="flex flex-1 flex-col gap-1 rounded-[8px] border border-border-light bg-card p-4">
              <span className="font-inter text-[11px] text-placeholder">{label}</span>
              <span className={`font-dm-sans text-2xl font-bold ${color}`}>{count}</span>
            </div>
          ))}
        </div>
        <DataTable columns={COLUMNS} data={ETATS_SANTE} keyExtractor={(a) => a.id} pagination={{ page: 1, total: 1, count: ETATS_SANTE.length }} />
      </div>
    </div>
  );
}
