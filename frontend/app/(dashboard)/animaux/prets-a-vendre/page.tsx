"use client";

// UC-19 — Liste animaux prêts à vendre (classés par coût/jour décroissant)

import Link from "next/link";
import Icon from "@/components/ui/Icon";
import Badge from "@/components/ui/Badge";
import DataTable, { Column } from "@/components/ui/DataTable";
import { useApi } from "@/lib/useApi";
import type { Animal } from "@/lib/types";

const COLUMNS: Column<Animal>[] = [
  { key: "identifiant", label: "Identifiant", width: "w-[110px]", render: (r) => <Link href={`/animaux/${r.id}`} className="font-inter text-[13px] font-semibold text-primary hover:underline">{r.identifiant}</Link> },
  { key: "race", label: "Race", width: "w-[100px]", render: (r) => <span className="font-inter text-[13px] text-subtle">{r.race?.nom ?? "—"}</span> },
  { key: "sexe", label: "Sexe", width: "w-[70px]" },
  { key: "poidsActuel", label: "Poids actuel", width: "w-[110px]", render: (r) => <span className="font-inter text-[13px] font-semibold text-label">{r.poidsActuel} kg</span> },
  { key: "poidsCible", label: "Poids cible", width: "w-[100px]", render: (r) => <span className="font-inter text-[13px] text-subtle">{r.race?.poidsAbattage ?? "—"} kg</span> },
  { key: "coutJour", label: "Coût/jour", width: "w-[110px]", render: (r) => <span className="font-inter text-[13px] font-semibold text-warning">{(r.coutJour ?? 0).toFixed(2)} MAD</span> },
  { key: "coutCumule", label: "Coût total", width: "w-[120px]", render: (r) => <span className="font-inter text-[13px] text-label">{r.coutCumule.toLocaleString("fr-FR")} MAD</span> },
  { key: "parcelle", label: "Parcelle", width: "w-[110px]", render: (r) => <span className="font-inter text-[13px] text-subtle">{r.parcelle?.nom ?? "—"}</span> },
  { key: "delai", label: "Délai retrait", width: "w-[110px]", render: () => <Badge variant="sain">Écoulé</Badge> },
  {
    key: "_actions", label: "Actions", width: "w-[100px]", align: "right",
    render: (r) => (
      <Link href={`/animaux/${r.id}/sortie`} className="flex items-center justify-end gap-1 rounded-[4px] bg-danger/10 px-2 py-1 font-inter text-[11px] font-semibold text-danger hover:bg-danger/20 transition-colors">
        <Icon name="scissors" size={12} />
        Sortie
      </Link>
    ),
  },
];

export default function PretsAVendrePage() {
  const { data: prets, loading, error } = useApi<Animal[]>("/animaux/prets-a-vendre");
  const list = prets ?? [];
  const coutJourTotal = list.reduce((s, a) => s + (a.coutJour ?? 0), 0);
  const coutCumuleTotal = list.reduce((s, a) => s + a.coutCumule, 0);
  const poidsTotal = list.reduce((s, a) => s + a.poidsActuel, 0);

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-surface">
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-border-light bg-card px-7">
        <div className="flex items-center gap-1.5">
          <Link href="/animaux" className="font-inter text-sm text-placeholder hover:text-subtle transition-colors">Animaux</Link>
          <span className="font-inter text-sm text-placeholder">/</span>
          <span className="font-dm-sans text-xl font-semibold text-label">Prêts à vendre</span>
          <span className="ml-1.5 flex items-center rounded-full bg-success/10 px-2 py-0.5 font-inter text-[11px] font-semibold text-success">{list.length} animaux</span>
        </div>
        <Link href="/animaux" className="flex items-center gap-1.5 rounded-[6px] border border-border-light bg-surface px-3.5 py-2 font-dm-sans text-[13px] font-semibold text-subtle hover:bg-border-light transition-colors">
          <Icon name="arrow-left" size={14} />
          Retour
        </Link>
      </header>

      <div className="flex flex-1 flex-col gap-4 overflow-auto p-6">
        <div className="flex items-start gap-3 rounded-[8px] border border-success/30 bg-success/5 px-4 py-3">
          <Icon name="check-circle" size={16} className="mt-0.5 shrink-0 text-success" />
          <div className="flex flex-col gap-0.5">
            <span className="font-inter text-[13px] font-semibold text-success">{list.length} animaux ont atteint leur poids cible avec délai de retrait écoulé</span>
            <span className="font-inter text-[12px] text-subtle">Classés par coût/jour décroissant — les plus coûteux à maintenir apparaissent en premier.</span>
          </div>
        </div>

        <div className="flex gap-4">
          {[
            { label: "Coût/jour total", value: `${coutJourTotal.toFixed(2)} MAD`, color: "text-warning" },
            { label: "Coût cumulé total", value: `${coutCumuleTotal.toLocaleString("fr-FR")} MAD`, color: "text-label" },
            { label: "Poids total disponible", value: `${poidsTotal.toLocaleString("fr-FR")} kg`, color: "text-primary" },
          ].map(({ label, value, color }) => (
            <div key={label} className="flex flex-1 flex-col gap-1 rounded-[8px] border border-border-light bg-card p-4">
              <span className="font-inter text-[11px] text-placeholder">{label}</span>
              <span className={`font-dm-sans text-xl font-bold ${color}`}>{value}</span>
            </div>
          ))}
        </div>

        {loading && <p className="font-inter text-sm text-placeholder">Chargement…</p>}
        {error && <p className="font-inter text-sm text-danger">{error}</p>}
        {!loading && !error && (
          <DataTable columns={COLUMNS} data={list} keyExtractor={(a) => a.id} pagination={{ page: 1, total: 1, count: list.length }} />
        )}
      </div>
    </div>
  );
}
