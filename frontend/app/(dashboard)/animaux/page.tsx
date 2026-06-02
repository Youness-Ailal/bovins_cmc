"use client";

import { useState } from "react";
import Link from "next/link";
import Icon from "@/components/ui/Icon";
import Badge from "@/components/ui/Badge";
import DataTable, { Column } from "@/components/ui/DataTable";

type Phase = "Croissance" | "Engraissement" | "Finition";
type Sante = "Sain" | "Malade";

interface Animal {
  id: string;
  race: string;
  sexe: string;
  phase: Phase;
  parcelle: string;
  lot: string;
  sante: Sante;
  gmq: string;
  cout: string;
}

const ANIMALS: Animal[] = [
  { id: "ANI-001", race: "Holstein",  sexe: "Mâle",    phase: "Croissance",    parcelle: "P-01", lot: "LOT-A", sante: "Sain",   gmq: "0.82", cout: "12 450" },
  { id: "ANI-002", race: "Angus",     sexe: "Femelle",  phase: "Engraissement", parcelle: "P-02", lot: "LOT-A", sante: "Sain",   gmq: "0.74", cout: "8 920"  },
  { id: "ANI-003", race: "Limousin",  sexe: "Mâle",    phase: "Finition",      parcelle: "P-01", lot: "LOT-B", sante: "Malade", gmq: "0.65", cout: "15 780" },
];

const PHASE_VARIANT: Record<Phase, string> = {
  Croissance:    "phase-croissance",
  Engraissement: "phase-engraissement",
  Finition:      "phase-finition",
};

const SANTE_VARIANT: Record<Sante, string> = {
  Sain:   "sain",
  Malade: "malade",
};

const COLUMNS: Column<Animal>[] = [
  {
    key: "id",
    label: "Identifiant",
    width: "w-[110px]",
    render: (row) => (
      <span className="font-inter text-[13px] font-semibold text-label">{row.id}</span>
    ),
  },
  { key: "race",     label: "Race",     width: "w-[90px]"  },
  { key: "sexe",     label: "Sexe",     width: "w-[60px]"  },
  {
    key: "phase",
    label: "Phase",
    width: "w-[110px]",
    render: (row) => (
      <Badge variant={PHASE_VARIANT[row.phase] as Parameters<typeof Badge>[0]["variant"]}>{row.phase}</Badge>
    ),
  },
  { key: "parcelle", label: "Parcelle", width: "w-[75px]"  },
  { key: "lot",      label: "Lot",      width: "w-[60px]"  },
  {
    key: "sante",
    label: "Santé",
    width: "w-[90px]",
    render: (row) => (
      <Badge variant={SANTE_VARIANT[row.sante] as Parameters<typeof Badge>[0]["variant"]}>{row.sante}</Badge>
    ),
  },
  { key: "gmq",  label: "GMQ (kg/j)", width: "w-[80px]"  },
  { key: "cout", label: "Coût (MAD)", width: "w-[100px]" },
  {
    key: "_actions",
    label: "Actions",
    width: "w-[60px]",
    align: "right",
    render: (row) => (
      <div className="flex items-center gap-3">
        <Link href={`/animaux/${row.id}`} className="text-placeholder hover:text-primary transition-colors">
          <Icon name="eye" size={15} />
        </Link>
        <Link href={`/animaux/${row.id}/modifier`} className="text-placeholder hover:text-primary transition-colors">
          <Icon name="pencil" size={15} />
        </Link>
      </div>
    ),
  },
];

const FILTER_OPTIONS: Record<string, string[]> = {
  Race: ["Toutes", "Holstein", "Angus", "Limousin", "Charolais"],
  Phase: ["Toutes", "Croissance", "Engraissement", "Finition"],
  Parcelle: ["Toutes", "P-01", "P-02"],
  Lot: ["Tous", "LOT-A", "LOT-B"],
  "État santé": ["Tous", "Sain", "Malade"],
};

export default function ListeAnimauxPage() {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [openFilter, setOpenFilter] = useState<string | null>(null);
  const [pretsOnly, setPretsOnly] = useState(false);

  function setFilter(key: string, value: string) {
    setFilters((prev) => {
      const next = { ...prev };
      if (value === "Toutes" || value === "Tous") delete next[key];
      else next[key] = value;
      return next;
    });
    setOpenFilter(null);
  }

  const filtered = ANIMALS.filter((a) => {
    if (search && !a.id.toLowerCase().includes(search.toLowerCase()) && !a.race.toLowerCase().includes(search.toLowerCase())) return false;
    if (filters["Race"] && a.race !== filters["Race"]) return false;
    if (filters["Phase"] && a.phase !== filters["Phase"]) return false;
    if (filters["Parcelle"] && a.parcelle !== filters["Parcelle"]) return false;
    if (filters["Lot"] && a.lot !== filters["Lot"]) return false;
    if (filters["État santé"] && a.sante !== filters["État santé"]) return false;
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
        <Link
          href="/animaux/nouveau"
          className="flex items-center gap-1.5 rounded-[6px] bg-primary px-3.5 py-2 font-dm-sans text-[13px] font-semibold text-white hover:bg-primary-hover transition-colors"
        >
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
                  filters[key]
                    ? "border-primary bg-primary-light font-medium text-primary"
                    : "border-border-light text-subtle hover:bg-surface"
                }`}
              >
                {filters[key] ? `${key}: ${filters[key]}` : key}
                <Icon name="chevron-down" size={12} className="text-placeholder" />
              </button>
              {openFilter === key && (
                <div className="absolute top-full left-0 z-10 mt-1 min-w-[140px] overflow-hidden rounded-[8px] border border-border-light bg-card shadow-md">
                  {FILTER_OPTIONS[key].map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setFilter(key, opt)}
                      className="flex w-full items-center px-3 py-2 font-inter text-[13px] text-label hover:bg-surface transition-colors"
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
          <div className="flex items-center gap-1.5 rounded-[6px] border border-border-light bg-surface px-3 py-1.5">
            <Icon name="search" size={14} className="text-placeholder" />
            <input
              type="text"
              placeholder="Rechercher un animal…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-44 bg-transparent font-inter text-[13px] text-label placeholder:text-placeholder focus:outline-none"
            />
          </div>
          <button
            onClick={() => setPretsOnly((v) => !v)}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 font-inter text-xs font-medium transition-colors ${
              pretsOnly ? "bg-primary text-white" : "bg-primary-light text-primary hover:bg-primary hover:text-white"
            }`}
          >
            <Icon name="check" size={12} />
            Prêts à vendre
          </button>
          <Link href="/animaux/prets-a-vendre" className="ml-auto font-inter text-[12px] text-primary hover:underline">
            Vue dédiée →
          </Link>
        </div>

        <DataTable
          columns={COLUMNS}
          data={filtered}
          keyExtractor={(a) => a.id}
          pagination={{ page: 1, total: 12, count: 48 }}
        />
      </div>
    </div>
  );
}