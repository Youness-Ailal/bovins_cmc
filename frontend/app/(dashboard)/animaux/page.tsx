"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Icon from "@/components/ui/Icon";
import TableSkeleton from "@/components/ui/TableSkeleton";
import { useApi } from "@/lib/useApi";
import { useAuth } from "@/lib/auth";
import { can } from "@/lib/permissions";
import type { Animal, Race } from "@/lib/types";

const SANTE_STYLE: Record<string, { bg: string; text: string; dot: string }> = {
  Sain:             { bg: "bg-success/10", text: "text-success", dot: "bg-success" },
  "En traitement":  { bg: "bg-warning/10", text: "text-warning", dot: "bg-warning" },
  Malade:           { bg: "bg-danger/10",  text: "text-danger",  dot: "bg-danger" },
};

export default function ListeAnimauxPage() {
  const router = useRouter();
  const { user } = useAuth();
  const canManage = can(user?.role, "manageAnimaux");

  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [openFilter, setOpenFilter] = useState<string | null>(null);
  const [pretsOnly, setPretsOnly] = useState(false);

  const statutQuery = filters["Statut"] === "Sortis" ? "?statut=Sorti" : filters["Statut"] === "Tous" ? "?statut=all" : "";
  const { data: animaux, loading, error } = useApi<Animal[]>(`/animaux${statutQuery}`);
  const { data: races } = useApi<Race[]>("/races");

  const FILTER_OPTIONS: Record<string, string[]> = useMemo(() => ({
    Race:        ["Toutes", ...(races ?? []).map((r) => r.nom)],
    Phase:       ["Toutes", "Veau", "Croissance", "Engraissement", "Finition"],
    "Santé":     ["Tous", "Sain", "En traitement", "Malade"],
    Statut:      ["Actifs", "Sortis", "Tous"],
  }), [races]);

  function setFilter(key: string, value: string) {
    setFilters((prev) => {
      const next = { ...prev };
      const reset = key === "Statut" ? "Actifs" : ["Toutes", "Tous"].includes(value) ? value : null;
      if (value === reset) delete next[key];
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
    if (filters["Santé"] && a.etatSante !== filters["Santé"]) return false;
    if (pretsOnly && a.phase !== "Finition") return false;
    return true;
  });

  const actifs = list.filter((a) => a.statut === "Actif").length;
  const alertes = list.filter((a) => a.etatSante !== "Sain").length;
  const pretsCount = list.filter((a) => a.phase === "Finition" && a.statut === "Actif").length;

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-surface" onClick={() => setOpenFilter(null)}>
      {/* Header */}
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-border-light bg-card px-7">
        <div className="flex items-center gap-3">
          <span className="font-dm-sans text-xl font-semibold text-label">Animaux</span>
          <span className="rounded-full bg-surface px-2.5 py-0.5 font-inter text-[12px] font-semibold text-subtle border border-border-light">
            {list.length}
          </span>
        </div>
        {canManage && (
          <Link href="/animaux/nouveau" className="flex items-center gap-1.5 rounded-[6px] bg-primary px-3.5 py-2 font-dm-sans text-[13px] font-semibold text-white hover:bg-primary/90 transition-colors">
            <Icon name="plus" size={14} />
            Nouvel animal
          </Link>
        )}
      </header>

      <div className="flex flex-1 flex-col gap-4 overflow-auto p-6">
        {/* KPI row */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Animaux actifs", value: actifs, icon: "beef", color: "text-primary", bg: "bg-primary/5" },
            { label: "Alertes santé", value: alertes, icon: "heart-pulse", color: alertes > 0 ? "text-danger" : "text-success", bg: alertes > 0 ? "bg-danger/5" : "bg-success/5" },
            { label: "Prêts à vendre", value: pretsCount, icon: "tag", color: "text-success", bg: "bg-success/5" },
          ].map((k) => (
            <div key={k.label} className={`flex items-center gap-3 rounded-[10px] border border-border-light ${k.bg} px-4 py-3`}>
              <Icon name={k.icon} size={18} className={k.color} />
              <div className="flex flex-col">
                <span className={`font-dm-sans text-[22px] font-bold leading-none ${k.color}`}>{k.value}</span>
                <span className="font-inter text-[12px] text-subtle mt-0.5">{k.label}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Filters + search */}
        <div className="flex flex-wrap items-center gap-2" onClick={(e) => e.stopPropagation()}>
          {/* Search */}
          <div className="flex items-center gap-1.5 rounded-[6px] border border-border-light bg-card px-3 py-1.5">
            <Icon name="search" size={13} className="text-placeholder" />
            <input
              type="text" placeholder="Rechercher un animal…" value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-44 bg-transparent font-inter text-[13px] text-label placeholder:text-placeholder focus:outline-none"
            />
          </div>

          {/* Dropdown filters */}
          {Object.keys(FILTER_OPTIONS).map((key) => (
            <div key={key} className="relative">
              <button
                onClick={(e) => { e.stopPropagation(); setOpenFilter(openFilter === key ? null : key); }}
                className={`flex items-center gap-1 rounded-[6px] border px-2.5 py-1.5 font-inter text-[13px] transition-colors ${
                  filters[key]
                    ? "border-primary bg-primary/5 font-medium text-primary"
                    : "border-border-light bg-card text-subtle hover:bg-surface"
                }`}
              >
                {filters[key] ? `${key}: ${filters[key]}` : key}
                <Icon name="chevron-down" size={12} className="text-placeholder" />
              </button>
              {openFilter === key && (
                <div className="absolute top-full left-0 z-20 mt-1 min-w-[150px] overflow-hidden rounded-[8px] border border-border-light bg-card shadow-lg">
                  {FILTER_OPTIONS[key].map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setFilter(key, opt)}
                      className={`flex w-full items-center px-3 py-2 font-inter text-[13px] hover:bg-surface transition-colors ${filters[key] === opt ? "font-semibold text-primary" : "text-label"}`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Prêts à vendre toggle */}
          <button
            onClick={() => setPretsOnly((v) => !v)}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 font-inter text-[12px] font-semibold transition-colors ${
              pretsOnly ? "bg-success text-white" : "bg-success/10 text-success hover:bg-success/20"
            }`}
          >
            <Icon name="tag" size={12} />
            Prêts à vendre
          </button>

          {/* Active filter count */}
          {Object.keys(filters).length > 0 && (
            <button
              onClick={() => setFilters({})}
              className="ml-1 font-inter text-[12px] text-placeholder hover:text-danger transition-colors"
            >
              Effacer filtres
            </button>
          )}

          <Link href="/animaux/prets-a-vendre" className="ml-auto flex items-center gap-1 font-inter text-[12px] text-primary hover:underline">
            Vue dédiée <Icon name="arrow-right" size={12} />
          </Link>
        </div>

        {/* Table */}
        {loading && <TableSkeleton cols={[2, 2, 1, 2, 1, 1]} />}
        {error && <p className="font-inter text-sm text-danger">{error}</p>}
        {!loading && !error && (
          <div className="rounded-[12px] border border-border-light bg-card">
            {/* Column headers */}
            <div className="grid grid-cols-[200px_1fr_90px_130px_110px_80px_44px] border-b border-border-light bg-surface px-5 py-2.5">
              {["Animal", "Race / Sexe", "Parcelle", "Santé", "Poids", "GMQ", ""].map((h) => (
                <span key={h} className="font-inter text-[10px] font-semibold uppercase tracking-wide text-placeholder">{h}</span>
              ))}
            </div>

            {filtered.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-14">
                <Icon name="beef" size={32} className="text-placeholder" />
                <p className="font-inter text-[13px] text-placeholder">
                  {search || Object.keys(filters).length > 0
                    ? "Aucun animal ne correspond aux filtres"
                    : "Enregistrez votre premier animal pour commencer le suivi"}
                </p>
                {canManage && !search && Object.keys(filters).length === 0 && (
                  <Link href="/animaux/nouveau" className="mt-1 font-inter text-[13px] text-primary hover:underline">
                    + Ajouter un animal
                  </Link>
                )}
              </div>
            ) : (
              <div className="divide-y divide-border-light">
                {filtered.map((a) => {
                  const s = SANTE_STYLE[a.etatSante] ?? SANTE_STYLE.Sain;
                  return (
                    <div
                      key={a.id}
                      onClick={() => router.push(`/animaux/${a.id}`)}
                      className="grid cursor-pointer grid-cols-[200px_1fr_90px_130px_110px_80px_44px] items-center gap-2 px-5 py-3 hover:bg-surface transition-colors"
                    >
                      {/* Identifiant */}
                      <div className="flex items-center gap-2.5">
                        <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-dm-sans text-[12px] font-bold ${a.statut === "Sorti" ? "bg-surface text-subtle border border-border-light" : "bg-primary/10 text-primary"}`}>
                          {a.identifiant.slice(-1).toUpperCase()}
                        </div>
                        <span className="font-inter text-[13px] font-semibold text-label truncate">{a.identifiant}</span>
                      </div>

                      {/* Race / Sexe */}
                      <span className="font-inter text-[12px] text-subtle truncate">{a.race?.nom ?? "—"} · {a.sexe}</span>

                      {/* Parcelle */}
                      <span className="font-inter text-[12px] text-subtle truncate">{a.parcelle?.nom ?? "—"}</span>

                      {/* État santé */}
                      <span className={`inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 font-inter text-[11px] font-semibold ${s.bg} ${s.text}`}>
                        <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${s.dot}`} />
                        {a.etatSante}
                      </span>

                      {/* Poids */}
                      <div className="flex flex-col gap-0">
                        <span className="font-dm-sans text-[13px] font-semibold text-label">{a.poidsActuel} kg</span>
                        <span className="font-inter text-[10px] text-placeholder">entrée {a.poidsEntree} kg</span>
                      </div>

                      {/* GMQ */}
                      <span className={`font-dm-sans text-[13px] font-semibold ${Number(a.gmqActuel) > 0 ? "text-primary" : "text-placeholder"}`}>
                        {a.gmqActuel} <span className="font-inter text-[11px] font-normal text-placeholder">kg/j</span>
                      </span>

                      {/* Actions */}
                      <div className="flex items-center justify-end" onClick={(e) => e.stopPropagation()}>
                        {a.statut === "Sorti" ? (
                          <span className="rounded-full bg-surface px-2 py-0.5 font-inter text-[10px] font-semibold text-subtle border border-border-light">Sorti</span>
                        ) : canManage ? (
                          <button
                            onClick={() => router.push(`/animaux/${a.id}/modifier`)}
                            className="rounded-[4px] p-1 text-placeholder hover:text-label transition-colors"
                            title="Modifier"
                          >
                            <Icon name="pencil" size={13} />
                          </button>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Footer count */}
            {filtered.length > 0 && (
              <div className="border-t border-border-light px-5 py-2.5">
                <span className="font-inter text-[12px] text-placeholder">
                  {filtered.length} animal{filtered.length !== 1 ? "x" : ""} affiché{filtered.length !== 1 ? "s" : ""}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
