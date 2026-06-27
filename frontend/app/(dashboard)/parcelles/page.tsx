"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Icon from "@/components/ui/Icon";
import ProgressBar from "@/components/ui/ProgressBar";
import EmptyState from "@/components/ui/EmptyState";
import TableSkeleton from "@/components/ui/TableSkeleton";
import { useApi } from "@/lib/useApi";
import type { Parcelle } from "@/lib/types";

type Filter = "all" | "available" | "warning" | "full";

const TYPE_LABELS: Record<string, string> = {
  paturage: "Paturage",
  engraissement: "Engraissement",
  quarantaine: "Quarantaine",
  veaux: "Veaux",
  "": "Non defini",
};

function occupancyState(pct: number) {
  if (pct >= 100) return { label: "Complet", color: "bg-danger", text: "text-danger", tone: "bg-danger/10" };
  if (pct >= 85) return { label: "A surveiller", color: "bg-warning", text: "text-warning", tone: "bg-warning/10" };
  return { label: "Disponible", color: "bg-success", text: "text-success", tone: "bg-success/10" };
}

function StatTile({ icon, label, value, hint }: { icon: string; label: string; value: string; hint: string }) {
  return (
    <div className="flex min-h-[96px] items-center gap-4 rounded-[8px] border border-border-light bg-card px-5 py-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px] bg-primary-light text-primary">
        <Icon name={icon} size={19} />
      </div>
      <div className="min-w-0">
        <p className="font-inter text-[11px] font-bold uppercase tracking-[0.04em] text-placeholder">{label}</p>
        <p className="mt-1 font-dm-sans text-2xl font-bold text-label">{value}</p>
        <p className="mt-0.5 truncate font-inter text-xs text-subtle">{hint}</p>
      </div>
    </div>
  );
}

function OccupationBar({ current, max, pct }: { current: number; max: number; pct: number }) {
  const state = occupancyState(pct);
  return (
    <div className="flex w-full flex-col gap-1.5">
      <div className="flex items-center justify-between gap-3">
        <span className="font-inter text-[13px] font-semibold text-label">{current}/{max || 0}</span>
        <span className={`rounded-full px-2 py-0.5 font-inter text-[11px] font-semibold ${state.tone} ${state.text}`}>
          {state.label}
        </span>
      </div>
      <ProgressBar value={pct} color={state.color} height={8} />
    </div>
  );
}

export default function ListeParcellesPage() {
  const canManage = true;
  const { data: parcelles, loading, error } = useApi<Parcelle[]>("/parcelles");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const list = parcelles ?? [];
  const stats = useMemo(() => {
    const totalCapacity = list.reduce((sum, p) => sum + (p.capaciteMax || 0), 0);
    const occupied = list.reduce((sum, p) => sum + (p.nbActuels || 0), 0);
    const available = Math.max(0, totalCapacity - occupied);
    const atRisk = list.filter((p) => (p.occupation ?? 0) >= 85).length;
    return { totalCapacity, occupied, available, atRisk };
  }, [list]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return list.filter((p) => {
      const pct = p.occupation ?? 0;
      const matchesText = !q || [p.nom, p.reference, TYPE_LABELS[p.type] ?? p.type, p.ration?.nom]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(q));
      const matchesFilter =
        filter === "all" ||
        (filter === "available" && pct < 85) ||
        (filter === "warning" && pct >= 85 && pct < 100) ||
        (filter === "full" && pct >= 100);
      return matchesText && matchesFilter;
    });
  }, [filter, list, query]);

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-surface">
      <div className="flex flex-1 flex-col gap-6 overflow-auto p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="font-inter text-[12px] font-semibold uppercase tracking-[0.05em] text-placeholder">Gestion des espaces</p>
            <h1 className="mt-1 font-dm-sans text-3xl font-bold text-label">Parcelles</h1>
            <p className="mt-1 max-w-2xl font-inter text-sm text-subtle">
              Suivez la capacite, les affectations et les zones a risque avant de deplacer les animaux.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link href="/parcelles/transfert" className="flex h-10 items-center gap-2 rounded-[6px] border border-border-light bg-card px-3.5 font-inter text-sm font-semibold text-subtle transition-colors hover:bg-border-light">
              <Icon name="arrow-right" size={16} />
              Transfert
            </Link>
            {canManage && (
              <Link href="/parcelles/nouvelle" className="flex h-10 items-center gap-2 rounded-[6px] bg-primary px-4 font-inter text-sm font-semibold text-white transition-colors hover:bg-primary-hover">
                <Icon name="plus" size={16} />
                Creer une parcelle
              </Link>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatTile icon="map" label="Parcelles" value={String(list.length)} hint="Espaces enregistres" />
          <StatTile icon="users" label="Animaux affectes" value={String(stats.occupied)} hint={`${stats.available} places disponibles`} />
          <StatTile icon="target" label="Capacite totale" value={String(stats.totalCapacity)} hint="Places theoriques" />
          <StatTile icon="triangle-alert" label="Zones a risque" value={String(stats.atRisk)} hint="Occupation superieure a 85%" />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-[8px] border border-border-light bg-card p-3">
          <div className="relative min-w-[260px] flex-1">
            <Icon name="search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-placeholder" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher par nom, reference, type ou ration"
              className="h-10 w-full rounded-[6px] border border-border bg-surface pl-9 pr-3 font-inter text-sm text-label outline-none transition-colors placeholder:text-placeholder focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
          <div className="flex rounded-[6px] border border-border-light bg-surface p-1">
            {[
              ["all", "Toutes"],
              ["available", "Disponibles"],
              ["warning", "A surveiller"],
              ["full", "Completes"],
            ].map(([value, label]) => (
              <button
                key={value}
                onClick={() => setFilter(value as Filter)}
                className={`h-8 rounded-[5px] px-3 font-inter text-[12px] font-semibold transition-colors ${
                  filter === value ? "bg-card text-label shadow-sm" : "text-subtle hover:text-label"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {loading && <TableSkeleton cols={[2, 1, 2, 2, 2, 1]} />}
        {error && <p className="font-inter text-sm text-danger">{error}</p>}

        {!loading && !error && (
          <div className="overflow-hidden rounded-[12px] border border-border-light bg-card shadow-[0_1px_2px_rgba(27,46,31,0.04)]">
            <div className="grid grid-cols-[1.45fr_0.85fr_1.25fr_1.25fr_1.1fr_88px] items-center gap-4 border-b border-border-light bg-surface px-5 py-3">
              {["Parcelle", "Type", "Occupation", "Ration", "Notes", ""].map((h) => (
                <span key={h} className="font-inter text-[11px] font-bold uppercase tracking-[0.04em] text-placeholder">{h}</span>
              ))}
            </div>

            {filtered.map((p) => (
              <div key={p.id} className="grid min-h-[76px] grid-cols-[1.45fr_0.85fr_1.25fr_1.25fr_1.1fr_88px] items-center gap-4 border-b border-border-light px-5 py-3 last:border-b-0 transition-colors hover:bg-primary-light/40">
                <div className="min-w-0">
                  <Link href={`/parcelles/${p.id}`} className="truncate font-inter text-sm font-semibold text-label hover:text-primary">
                    {p.nom}
                  </Link>
                  <p className="mt-0.5 truncate font-inter text-xs text-placeholder">{p.reference || "Reference non definie"}</p>
                </div>
                <span className="w-fit rounded-[4px] border border-border-light bg-surface px-2 py-1 font-inter text-[12px] font-semibold text-subtle">
                  {TYPE_LABELS[p.type] ?? p.type}
                </span>
                <OccupationBar current={p.nbActuels ?? 0} max={p.capaciteMax} pct={p.occupation ?? 0} />
                <span className="truncate font-inter text-sm text-subtle">{p.ration?.nom ?? "Aucune ration"}</span>
                <span className="line-clamp-2 font-inter text-[13px] leading-5 text-subtle">{p.notes || "Aucune note"}</span>
                <div className="flex items-center justify-end gap-2">
                  <Link href={`/parcelles/${p.id}`} title="Voir" className="flex h-8 w-8 items-center justify-center rounded-[6px] text-placeholder transition-colors hover:bg-surface hover:text-primary">
                    <Icon name="eye" size={15} />
                  </Link>
                  <Link href={`/parcelles/transfert?parcelle=${p.id}`} title="Transferer" className="flex h-8 w-8 items-center justify-center rounded-[6px] text-placeholder transition-colors hover:bg-surface hover:text-primary">
                    <Icon name="arrow-right" size={15} />
                  </Link>
                </div>
              </div>
            ))}

            {filtered.length === 0 && (
              <EmptyState icon="map" title="Aucune parcelle" hint="Ajustez la recherche ou creez une nouvelle parcelle." />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
