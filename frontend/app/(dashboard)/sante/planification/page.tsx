"use client";

import { useState } from "react";
import Link from "next/link";
import Icon from "@/components/ui/Icon";
import TableSkeleton from "@/components/ui/TableSkeleton";
import SanteTabs from "@/components/dashboard/SanteTabs";
import { useApi } from "@/lib/useApi";
import { useAuth } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { planStatutStyle } from "@/lib/statusStyles";
import type { PlanTraitement } from "@/lib/types";

const STATUT_FILTERS = ["Tous", "À faire", "Rappel J-3", "En retard", "Fait"];

function animalCode(p: PlanTraitement): string {
  return typeof p.animal === "object" ? (p.animal.identifiant ?? "—") : String(p.animal);
}

export default function PlanificationPage() {
  const { user } = useAuth();
  const canManage = can(user?.role, "manageSante");
  const { data: plans, loading, error } = useApi<PlanTraitement[]>("/sante/plans");
  const [statutFilter, setStatutFilter] = useState("Tous");

  const list = plans ?? [];
  const countOf = (s: string) => list.filter((p) => p.statut === s).length;
  const enRetard = countOf("En retard");

  const filtered = list.filter((p) => statutFilter === "Tous" || p.statut === statutFilter);

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-surface">
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-border-light bg-card px-7">
        <div className="flex items-center gap-3">
          <span className="font-dm-sans text-xl font-semibold text-label">Planification</span>
          <span className="rounded-full border border-border-light bg-surface px-2.5 py-0.5 font-inter text-[12px] font-semibold text-subtle">{list.length}</span>
        </div>
        {canManage && (
          <Link href="/sante/traitement/nouveau" className="flex items-center gap-1.5 rounded-[6px] bg-primary px-3.5 py-2 font-dm-sans text-[13px] font-semibold text-white hover:bg-primary/90 transition-colors">
            <Icon name="plus" size={14} />
            Planifier un traitement
          </Link>
        )}
      </header>

      <SanteTabs />

      <div className="flex flex-1 flex-col gap-5 overflow-auto p-6">
        {/* Urgency banner */}
        {enRetard > 0 && (
          <div className="flex items-center gap-3 rounded-[10px] border border-danger/20 bg-danger/5 px-4 py-3">
            <Icon name="triangle-alert" size={16} className="shrink-0 text-danger" />
            <span className="font-inter text-[13px] text-label">
              <strong>{enRetard} traitement{enRetard > 1 ? "s" : ""} en retard</strong> — planifiez ou clôturez-les pour maintenir le suivi à jour.
            </span>
            <button
              onClick={() => setStatutFilter("En retard")}
              className="ml-auto shrink-0 font-inter text-[12px] font-semibold text-danger hover:underline"
            >
              Voir →
            </button>
          </div>
        )}

        {/* KPI cards — clickable as filters */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: "À faire",    statut: "À faire",    icon: "clock",          bg: "bg-info/5",    color: "text-info" },
            { label: "En retard",  statut: "En retard",  icon: "triangle-alert", bg: "bg-danger/5",  color: "text-danger" },
            { label: "Rappel J-3", statut: "Rappel J-3", icon: "bell",           bg: "bg-warning/5", color: "text-warning" },
            { label: "Faits",      statut: "Fait",       icon: "check-circle",   bg: "bg-success/5", color: "text-success" },
          ].map((k) => (
            <button
              key={k.label}
              onClick={() => setStatutFilter(statutFilter === k.statut ? "Tous" : k.statut)}
              className={`flex items-center gap-3 rounded-[12px] border bg-card p-4 text-left transition-all hover:shadow-sm ${
                statutFilter === k.statut ? "border-primary ring-1 ring-primary/20" : "border-border-light"
              }`}
            >
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px] ${k.bg}`}>
                <Icon name={k.icon} size={17} className={k.color} />
              </div>
              <div>
                <p className="font-dm-sans text-[22px] font-bold leading-none text-label">{countOf(k.statut)}</p>
                <p className="mt-0.5 font-inter text-[11px] text-subtle">{k.label}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Reminder info */}
        <div className="flex items-center gap-2.5 rounded-[8px] border border-info/20 bg-info/5 px-4 py-2.5">
          <Icon name="bell" size={14} className="shrink-0 text-info" />
          <span className="font-inter text-[12px] text-subtle">
            Rappels automatiques envoyés à <strong className="text-label">J-3</strong> et <strong className="text-label">J-1</strong> avant chaque traitement planifié.
          </span>
        </div>

        {/* Status filter chips */}
        <div className="flex flex-wrap items-center gap-2">
          {STATUT_FILTERS.map((s) => (
            <button
              key={s}
              onClick={() => setStatutFilter(s)}
              className={`rounded-full px-3.5 py-1.5 font-inter text-[12px] font-semibold transition-colors ${
                statutFilter === s
                  ? "bg-primary text-white"
                  : "border border-border-light bg-card text-subtle hover:bg-surface"
              }`}
            >
              {s}
              {s !== "Tous" && (
                <span className={`ml-1.5 ${statutFilter === s ? "opacity-70" : "opacity-50"}`}>{countOf(s)}</span>
              )}
            </button>
          ))}
        </div>

        {/* Table */}
        {loading && <TableSkeleton cols={[2, 2, 2, 1, 1, 1]} />}
        {error && <p className="font-inter text-sm text-danger">{error}</p>}
        {!loading && !error && (
          <div className="overflow-hidden rounded-[12px] border border-border-light bg-card">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-16">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-surface">
                  <Icon name="calendar" size={26} className="text-placeholder" />
                </div>
                <p className="font-dm-sans text-[15px] font-semibold text-label">Aucun traitement planifié</p>
                <p className="font-inter text-[13px] text-placeholder">
                  {statutFilter !== "Tous"
                    ? "Aucun traitement dans cette catégorie."
                    : "Planifiez des soins préventifs pour votre troupeau."}
                </p>
                {canManage && statutFilter === "Tous" && (
                  <Link href="/sante/traitement/nouveau" className="mt-1 flex items-center gap-1.5 rounded-[6px] bg-primary px-4 py-2 font-dm-sans text-[13px] font-semibold text-white hover:bg-primary/90 transition-colors">
                    <Icon name="plus" size={14} />
                    Planifier un traitement
                  </Link>
                )}
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border-light">
                    <th className="px-5 py-3 text-left font-inter text-[10px] font-semibold uppercase tracking-wide text-placeholder">Animal</th>
                    <th className="px-4 py-3 text-left font-inter text-[10px] font-semibold uppercase tracking-wide text-placeholder">Type</th>
                    <th className="px-4 py-3 text-left font-inter text-[10px] font-semibold uppercase tracking-wide text-placeholder">Produit</th>
                    <th className="px-4 py-3 text-left font-inter text-[10px] font-semibold uppercase tracking-wide text-placeholder">Date prévue</th>
                    <th className="px-4 py-3 text-left font-inter text-[10px] font-semibold uppercase tracking-wide text-placeholder">Fréquence</th>
                    <th className="px-4 py-3 text-left font-inter text-[10px] font-semibold uppercase tracking-wide text-placeholder">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p) => (
                    <tr key={p.id} className={`border-b border-border-light last:border-b-0 hover:bg-surface/60 transition-colors ${p.statut === "En retard" ? "bg-danger/5" : ""}`}>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10">
                            <Icon name="beef" size={13} className="text-primary" />
                          </div>
                          <span className="font-inter text-[13px] font-semibold text-primary">{animalCode(p)}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 font-inter text-[13px] text-label">{p.type}</td>
                      <td className="px-4 py-3.5 font-inter text-[13px] text-label">{p.produit}</td>
                      <td className="px-4 py-3.5 font-inter text-[13px] text-subtle">
                        {new Date(p.datePrevue).toLocaleDateString("fr-FR")}
                      </td>
                      <td className="px-4 py-3.5 font-inter text-[13px] text-subtle">{p.frequence}</td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex rounded-full px-2.5 py-1 font-inter text-[11px] font-semibold ${planStatutStyle[p.statut] ?? "bg-surface text-subtle"}`}>
                          {p.statut}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
