"use client";

import { useState } from "react";
import Link from "next/link";
import Icon from "@/components/ui/Icon";
import DataTable, { Column } from "@/components/ui/DataTable";
import TableSkeleton from "@/components/ui/TableSkeleton";
import { useApi } from "@/lib/useApi";
import type { Fournisseur } from "@/lib/types";

const TYPE_COLORS: Record<string, string> = {
  Aliments: "bg-success/10 text-success",
  Médicaments: "bg-info/10 text-info",
  Équipements: "bg-warning/10 text-warning",
  Autre: "bg-subtle/10 text-subtle",
};

const TYPES = ["Aliments", "Médicaments", "Équipements", "Autre"] as const;

const COLUMNS: Column<Fournisseur>[] = [
  {
    key: "nom", label: "Nom", width: "w-[200px]",
    render: (r) => (
      <Link href={`/fournisseurs/${r.id}`} className="font-inter text-[13px] font-semibold text-primary hover:underline">
        {r.nom}
      </Link>
    ),
  },
  {
    key: "region", label: "Région", width: "w-[130px]",
    render: (r) => <span className="font-inter text-[13px] text-subtle">{r.region || "—"}</span>,
  },
  {
    key: "contact", label: "Contact", width: "w-[160px]",
    render: (r) => <span className="font-inter text-[13px] text-label">{r.contact || "—"}</span>,
  },
  {
    key: "type", label: "Type", width: "w-[130px]",
    render: (r) => (
      <span className={`inline-flex rounded-full px-2.5 py-0.5 font-inter text-[11px] font-semibold ${TYPE_COLORS[r.type] ?? "bg-subtle/10 text-subtle"}`}>
        {r.type}
      </span>
    ),
  },
  {
    key: "nbCommandes", label: "Commandes", width: "w-[100px]", align: "right",
    render: (r) => (
      <span className="font-dm-sans text-[13px] font-semibold text-label">{r.nbCommandes ?? 0}</span>
    ),
  },
  {
    key: "_actions", label: "", width: "w-[50px]", align: "right",
    render: (r) => (
      <Link href={`/fournisseurs/${r.id}`} className="text-placeholder hover:text-primary transition-colors">
        <Icon name="arrow-right" size={15} />
      </Link>
    ),
  },
];

export default function FournisseursPage() {
  const { data, loading, error } = useApi<Fournisseur[]>("/fournisseurs");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("Tous");

  const fournisseurs = data ?? [];
  const filtered = fournisseurs.filter((f) => {
    const matchSearch =
      f.nom.toLowerCase().includes(search.toLowerCase()) ||
      f.region.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "Tous" || f.type === typeFilter;
    return matchSearch && matchType;
  });

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-surface">
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-border-light bg-card px-7">
        <div className="flex items-center gap-1.5">
          <span className="font-dm-sans text-xl font-semibold text-label">Fournisseurs</span>
          <span className="font-inter text-sm text-placeholder">/ {fournisseurs.length} enregistrés</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/fournisseurs/commandes"
            className="flex items-center gap-1.5 rounded-[6px] border border-border-light bg-surface px-3.5 py-2 font-dm-sans text-[13px] font-semibold text-subtle hover:bg-border-light transition-colors"
          >
            <Icon name="shopping-cart" size={14} />
            Commandes
          </Link>
          <Link
            href="/fournisseurs/nouveau"
            className="flex items-center gap-1.5 rounded-[6px] bg-primary px-3.5 py-2 font-dm-sans text-[13px] font-semibold text-white hover:bg-primary/90 transition-colors"
          >
            <Icon name="plus" size={14} />
            Nouveau fournisseur
          </Link>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-5 overflow-auto p-6">
        {/* Filters */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 rounded-[6px] border border-border-light bg-card px-3 py-1.5">
            <Icon name="search" size={13} className="text-placeholder" />
            <input
              type="text"
              placeholder="Rechercher…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-44 bg-transparent font-inter text-[13px] text-label placeholder:text-placeholder focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-1.5">
            {["Tous", ...TYPES].map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`rounded-full px-3 py-1 font-inter text-[12px] font-semibold transition-colors ${
                  typeFilter === t
                    ? "bg-primary text-white"
                    : "bg-card border border-border-light text-subtle hover:bg-border-light"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="rounded-[12px] border border-border-light bg-card">
          <div className="flex items-center justify-between border-b border-border-light px-5 py-3">
            <span className="font-dm-sans text-[14px] font-semibold text-label">
              {filtered.length} fournisseur{filtered.length !== 1 ? "s" : ""}
            </span>
          </div>
          {loading && <TableSkeleton cols={[2, 1, 2, 1, 1, 1]} />}
          {error && <p className="p-5 font-inter text-sm text-danger">{error}</p>}
          {!loading && !error && (
            <DataTable
              columns={COLUMNS}
              data={filtered}
              keyExtractor={(f) => f.id}
              pagination={{ page: 1, total: 1, count: filtered.length }}
              empty={{
                icon: "truck",
                title: "Aucun fournisseur",
                hint: "Ajoutez votre premier fournisseur pour gérer vos approvisionnements.",
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
