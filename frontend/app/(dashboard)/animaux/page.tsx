"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Icon from "@/components/ui/Icon";
import Badge from "@/components/ui/Badge";
import DataTable, { Column } from "@/components/ui/DataTable";
import { useApi } from "@/lib/useApi";
import type { Animal, Race } from "@/lib/types";

const PHASE_VARIANT: Record<string, string> = {
  Veau: "phase-croissance",
  Croissance: "phase-croissance",
  Engraissement: "phase-engraissement",
  Finition: "phase-finition",
};

const SANTE_VARIANT: Record<string, string> = {
  Sain: "sain",
  "En observation": "phase-croissance",
  "En traitement": "phase-engraissement",
  Malade: "malade",
};

const COLUMNS: Column<Animal>[] = [
  {
    key: "identifiant", label: "Identifiant", width: "w-[110px]",
    render: (row) => <span className="font-inter text-[13px] font-semibold text-label">{row.identifiant}</span>,
  },
  { key: "race", label: "Race", width: "w-[90px]", render: (r) => <span className="font-inter text-[13px] text-subtle">{r.race?.nom ?? "—"}</span> },
  { key: "sexe", label: "Sexe", width: "w-[70px]" },
  {
    key: "phase", label: "Phase", width: "w-[120px]",
    render: (r) => <Badge variant={PHASE_VARIANT[r.phase] as Parameters<typeof Badge>[0]["variant"]}>{r.phase}</Badge>,
  },
  { key: "parcelle", label: "Parcelle", width: "w-[110px]", render: (r) => <span className="font-inter text-[13px] text-subtle">{r.parcelle?.nom ?? "—"}</span> },
  { key: "lot", label: "Lot", width: "w-[80px]", render: (r) => <span className="font-inter text-[13px] text-subtle">{r.lot?.nom ?? "—"}</span> },
  {
    key: "etatSante", label: "Santé", width: "w-[120px]",
    render: (r) => <Badge variant={SANTE_VARIANT[r.etatSante] as Parameters<typeof Badge>[0]["variant"]}>{r.etatSante}</Badge>,
  },
  { key: "gmqActuel", label: "GMQ", width: "w-[70px]", render: (r) => <span className="font-inter text-[13px] text-subtle">{r.gmqActuel}</span> },
  {
    key: "statut", label: "Statut", width: "w-[90px]",
    render: (r) => (
      <span className={`inline-flex rounded-full px-2.5 py-1 font-inter text-[11px] font-semibold ${r.statut === "Sorti" ? "bg-surface text-subtle" : "bg-success/10 text-success"}`}>
        {r.statut === "Sorti" ? `Sorti${r.sortie?.motif ? ` (${r.sortie.motif})` : ""}` : "Actif"}
      </span>
    ),
  },
  {
    key: "_actions", label: "Actions", width: "w-[70px]", align: "right",
    render: (row) => (
      <div className="flex items-center justify-end gap-3">
        <Link href={`/animaux/${row.id}`} className="text-placeholder hover:text-primary transition-colors"><Icon name="eye" size={15} /></Link>
        {row.statut !== "Sorti" && (
          <Link href={`/animaux/${row.id}/modifier`} className="text-placeholder hover:text-primary transition-colors"><Icon name="pencil" size={15} /></Link>
        )}
      </div>
    ),
  },
];

export default function ListeAnimauxPage() {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [openFilter, setOpenFilter] = useState<string | null>(null);
  const [pretsOnly, setPretsOnly] = useState(false);

  // "Statut" drives the API query so sorted animals can be shown on demand
  const statutFilter = filters["Statut"]; // undefined=Actifs, "Sortis", "Tous"
  const statutQuery = statutFilter === "Sortis" ? "?statut=Sorti" : statutFilter === "Tous" ? "?statut=all" : "";
  const { data: animaux, loading, error } = useApi<Animal[]>(`/animaux${statutQuery}`);
  const { data: races } = useApi<Race[]>("/races");

  const FILTER_OPTIONS: Record<string, string[]> = useMemo(
    () => ({
      Race: ["Toutes", ...(races ?? []).map((r) => r.nom)],
      Phase: ["Toutes", "Veau", "Croissance", "Engraissement", "Finition"],
      "État santé": ["Tous", "Sain", "En observation", "En traitement", "Malade"],
      Statut: ["Actifs", "Sortis", "Tous"],
    }),
    [races]
  );

  function setFilter(key: string, value: string) {
    setFilters((prev) => {
      const next = { ...prev };
      // Per-filter reset value; Statut resets on "Actifs" ("Tous" is meaningful there)
      const resetValue = key === "Statut" ? "Actifs" : ["Toutes", "Tous"].includes(value) ? value : null;
      if (value === resetValue) delete next[key];
      else next[key] = value;
      return next;
    });
    setOpenFilter(null);
  }

  const list = animaux ?? [];
  const filtered = list.filter((a) => {
    if (search && !a.identifiant.toLowerCase().includes(search.toLowerCase()) && !(a.race?.nom ?? "").toLowerCase().includes(search.toLowerCase())) return false;
    if (filters["Race"] && a.race?.nom !== filters["Race"]) return false;
    if (filters["Phase"] && a.phase !== filters["Phase"]) return false;
    if (filters["État santé"] && a.etatSante !== filters["État santé"]) return false;
    if (pretsOnly && a.phase !== "Finition") return false;
    return true;
  });

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-surface">
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-border-light bg-card px-7">
        <div className="flex items-center gap-1.5">
          <span className="font-dm-sans text-xl font-semibold text-label">Liste des animaux</span>
          <span className="font-inter text-sm text-placeholder">/ Animaux</span>
        </div>
        <Link href="/animaux/nouveau" className="flex items-center gap-1.5 rounded-[6px] bg-primary px-3.5 py-2 font-dm-sans text-[13px] font-semibold text-white hover:bg-primary-hover transition-colors">
          <Icon name="plus" size={14} />
          Nouvel animal
        </Link>
      </header>

      <div className="flex flex-1 flex-col gap-4 overflow-auto p-6">
        <div className="flex flex-wrap items-center gap-2 rounded-[8px] border border-border-light bg-card p-3">
          {Object.keys(FILTER_OPTIONS).map((key) => (
            <div key={key} className="relative">
              <button
                onClick={() => setOpenFilter(openFilter === key ? null : key)}
                className={`flex items-center gap-1 rounded-[6px] border px-2.5 py-1.5 font-inter text-[13px] transition-colors ${
                  filters[key] ? "border-primary bg-primary-light font-medium text-primary" : "border-border-light text-subtle hover:bg-surface"
                }`}
              >
                {filters[key] ? `${key}: ${filters[key]}` : key}
                <Icon name="chevron-down" size={12} className="text-placeholder" />
              </button>
              {openFilter === key && (
                <div className="absolute top-full left-0 z-10 mt-1 min-w-[150px] overflow-hidden rounded-[8px] border border-border-light bg-card shadow-md">
                  {FILTER_OPTIONS[key].map((opt) => (
                    <button key={opt} onClick={() => setFilter(key, opt)} className="flex w-full items-center px-3 py-2 font-inter text-[13px] text-label hover:bg-surface transition-colors">
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
          <div className="flex items-center gap-1.5 rounded-[6px] border border-border-light bg-surface px-3 py-1.5">
            <Icon name="search" size={14} className="text-placeholder" />
            <input type="text" placeholder="Rechercher un animal…" value={search} onChange={(e) => setSearch(e.target.value)} className="w-44 bg-transparent font-inter text-[13px] text-label placeholder:text-placeholder focus:outline-none" />
          </div>
          <button
            onClick={() => setPretsOnly((v) => !v)}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 font-inter text-xs font-medium transition-colors ${pretsOnly ? "bg-primary text-white" : "bg-primary-light text-primary hover:bg-primary hover:text-white"}`}
          >
            <Icon name="check" size={12} />
            Prêts à vendre
          </button>
          <Link href="/animaux/prets-a-vendre" className="ml-auto font-inter text-[12px] text-primary hover:underline">Vue dédiée →</Link>
        </div>

        {loading && <p className="font-inter text-sm text-placeholder">Chargement…</p>}
        {error && <p className="font-inter text-sm text-danger">{error}</p>}
        {!loading && !error && (
          <DataTable columns={COLUMNS} data={filtered} keyExtractor={(a) => a.id} pagination={{ page: 1, total: 1, count: filtered.length }} />
        )}
      </div>
    </div>
  );
}
