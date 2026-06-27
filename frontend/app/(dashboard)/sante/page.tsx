"use client";

import { useState } from "react";
import Link from "next/link";
import Icon from "@/components/ui/Icon";
import TableSkeleton from "@/components/ui/TableSkeleton";
import SanteTabs from "@/components/dashboard/SanteTabs";
import { traitementStatutStyle } from "@/lib/statusStyles";
import { useApi } from "@/lib/useApi";
import { useAuth } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { api, downloadFile } from "@/lib/api";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { exportCsv } from "@/lib/exportCsv";
import { useToast } from "@/components/ui/Toast";
import type { Traitement } from "@/lib/types";

const TYPE_STYLE: Record<string, { bg: string; text: string }> = {
  "Antibiotique":       { bg: "bg-danger/10",  text: "text-danger" },
  "Antiparasitaire":    { bg: "bg-warning/10", text: "text-warning" },
  "Anti-inflammatoire": { bg: "bg-info/10",    text: "text-info" },
  "Vaccin":             { bg: "bg-success/10", text: "text-success" },
  "Autre":              { bg: "bg-surface",    text: "text-subtle" },
};

const STATUT_FILTERS = ["Tous", "En cours", "Planifié", "Terminé"];

function animalCode(t: Traitement): string {
  return typeof t.animal === "object" ? (t.animal.identifiant ?? "—") : t.animal;
}
function raceName(t: Traitement): string {
  return typeof t.animal === "object" && t.animal.race ? (t.animal.race.nom ?? "") : "";
}

export default function SantePage() {
  const { user } = useAuth();
  const canManage = can(user?.role, "manageSante");
  const { data: traitements, loading, error, refetch } = useApi<Traitement[]>("/sante/traitements");
  const { success, error: toastError } = useToast();
  const [search, setSearch] = useState("");
  const [statutFilter, setStatutFilter] = useState("Tous");
  const [exporting, setExporting] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function handleStatutChange(id: string, statut: string) {
    setUpdatingId(id);
    try {
      await api.put(`/sante/traitements/${id}`, { statut });
      success("Statut du traitement mis à jour");
      refetch();
    } catch (err) {
      toastError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setUpdatingId(null);
    }
  }

  const list = traitements ?? [];
  const countOf = (s: string) => list.filter((t) => t.statut === s).length;

  const filtered = list.filter((t) => {
    if (statutFilter !== "Tous" && t.statut !== statutFilter) return false;
    const q = search.toLowerCase();
    return !q || animalCode(t).toLowerCase().includes(q) || t.produit.toLowerCase().includes(q) || t.type.toLowerCase().includes(q);
  });

  function handleExportCsv() {
    exportCsv<Traitement>(`traitements-${new Date().toISOString().slice(0, 10)}`, [
      { header: "Animal", value: (t) => animalCode(t) },
      { header: "Type", value: (t) => t.type },
      { header: "Produit", value: (t) => t.produit },
      { header: "Dose", value: (t) => `${t.dose} ${t.doseUnite}`.trim() },
      { header: "Voie", value: (t) => t.voie },
      { header: "Début", value: (t) => new Date(t.dateDebut).toLocaleDateString("fr-FR") },
      { header: "Fin", value: (t) => (t.dateFin ? new Date(t.dateFin).toLocaleDateString("fr-FR") : "") },
      { header: "Vétérinaire", value: (t) => t.veterinaire },
      { header: "Délai retrait (j)", value: (t) => t.delaiRetrait },
      { header: "Statut", value: (t) => t.statut },
    ], filtered);
  }

  async function handleRegistrePdf() {
    setExporting(true);
    try {
      await downloadFile("/sante/traitements/registre", "registre-traitements.pdf");
      success("Registre des traitements téléchargé");
    } catch (err) {
      toastError(err instanceof Error ? err.message : "Erreur lors de la génération");
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-surface">
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-border-light bg-card px-7">
        <div className="flex items-center gap-3">
          <span className="font-dm-sans text-xl font-semibold text-label">Santé</span>
          <span className="rounded-full border border-border-light bg-surface px-2.5 py-0.5 font-inter text-[12px] font-semibold text-subtle">{list.length}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            disabled={filtered.length === 0}
            className="flex items-center gap-1.5 rounded-[6px] border border-border-light bg-surface px-3.5 py-2 font-dm-sans text-[13px] font-semibold text-subtle hover:bg-border-light transition-colors disabled:opacity-50"
          >
            <Icon name="file-text" size={14} />
            Exporter CSV
          </button>
          <button
            onClick={handleRegistrePdf}
            disabled={exporting}
            className="flex items-center gap-1.5 rounded-[6px] border border-border-light bg-surface px-3.5 py-2 font-dm-sans text-[13px] font-semibold text-subtle hover:bg-border-light transition-colors disabled:opacity-50"
          >
            <Icon name="clipboard-list" size={14} />
            Registre PDF
          </button>
          {canManage && (
            <>
              <Link href="/sante/planification" className="flex items-center gap-1.5 rounded-[6px] border border-border-light bg-surface px-3.5 py-2 font-dm-sans text-[13px] font-semibold text-subtle hover:bg-border-light transition-colors">
                <Icon name="calendar" size={14} />
                Planifier
              </Link>
              <Link href="/sante/traitement/nouveau" className="flex items-center gap-1.5 rounded-[6px] bg-primary px-3.5 py-2 font-dm-sans text-[13px] font-semibold text-white hover:bg-primary/90 transition-colors">
                <Icon name="plus" size={14} />
                Nouveau traitement
              </Link>
            </>
          )}
        </div>
      </header>

      <SanteTabs />

      <div className="flex flex-1 flex-col gap-5 overflow-auto p-6">
        {/* KPI cards */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: "En cours",  value: countOf("En cours"),  icon: "syringe",      bg: "bg-info/5",     color: "text-info" },
            { label: "Planifiés", value: countOf("Planifié"),  icon: "calendar",     bg: "bg-warning/5",  color: "text-warning" },
            { label: "Terminés",  value: countOf("Terminé"),   icon: "check-circle", bg: "bg-success/5",  color: "text-success" },
            { label: "Total",     value: list.length,          icon: "stethoscope",  bg: "bg-primary/5",  color: "text-primary" },
          ].map((k) => (
            <div key={k.label} className="flex items-center gap-3 rounded-[12px] border border-border-light bg-card p-4">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px] ${k.bg}`}>
                <Icon name={k.icon} size={18} className={k.color} />
              </div>
              <div>
                <p className="font-dm-sans text-[24px] font-bold leading-none text-label">{k.value}</p>
                <p className="mt-0.5 font-inter text-[11px] text-subtle">{k.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Filters + search */}
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
          <div className="ml-auto flex items-center gap-1.5 rounded-[6px] border border-border-light bg-card px-3 py-1.5">
            <Icon name="search" size={13} className="text-placeholder" />
            <input
              type="text" placeholder="Animal, produit, type…" value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-44 bg-transparent font-inter text-[13px] text-label placeholder:text-placeholder focus:outline-none"
            />
          </div>
        </div>

        {/* Table */}
        {loading && <TableSkeleton cols={[2, 2, 2, 1, 1, 1]} />}
        {error && <p className="font-inter text-sm text-danger">{error}</p>}
        {!loading && !error && (
          <div className="overflow-hidden rounded-[12px] border border-border-light bg-card">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-16">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-surface">
                  <Icon name="stethoscope" size={26} className="text-placeholder" />
                </div>
                <p className="font-dm-sans text-[15px] font-semibold text-label">Aucun traitement</p>
                <p className="font-inter text-[13px] text-placeholder">
                  {search || statutFilter !== "Tous"
                    ? "Modifiez les filtres pour voir plus de résultats."
                    : "Enregistrez un traitement pour commencer le suivi vétérinaire."}
                </p>
                {canManage && !search && statutFilter === "Tous" && (
                  <Link
                    href="/sante/traitement/nouveau"
                    className="mt-1 flex items-center gap-1.5 rounded-[6px] bg-primary px-4 py-2 font-dm-sans text-[13px] font-semibold text-white hover:bg-primary/90 transition-colors"
                  >
                    <Icon name="plus" size={14} />
                    Nouveau traitement
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
                    <th className="px-4 py-3 text-left font-inter text-[10px] font-semibold uppercase tracking-wide text-placeholder">Début</th>
                    <th className="px-4 py-3 text-left font-inter text-[10px] font-semibold uppercase tracking-wide text-placeholder">Fin prévue</th>
                    <th className="px-4 py-3 text-left font-inter text-[10px] font-semibold uppercase tracking-wide text-placeholder">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((t) => {
                    const ts = TYPE_STYLE[t.type] ?? TYPE_STYLE["Autre"];
                    return (
                      <tr key={t.id} className="border-b border-border-light last:border-b-0 hover:bg-surface/60 transition-colors">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10">
                              <Icon name="beef" size={13} className="text-primary" />
                            </div>
                            <div className="flex flex-col">
                              <span className="font-inter text-[13px] font-semibold text-primary">{animalCode(t)}</span>
                              {raceName(t) && <span className="font-inter text-[11px] text-placeholder">{raceName(t)}</span>}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={`inline-flex rounded-full px-2.5 py-1 font-inter text-[11px] font-semibold ${ts.bg} ${ts.text}`}>{t.type}</span>
                        </td>
                        <td className="px-4 py-3.5 font-inter text-[13px] text-label">{t.produit}</td>
                        <td className="px-4 py-3.5 font-inter text-[13px] text-subtle">
                          {new Date(t.dateDebut).toLocaleDateString("fr-FR")}
                        </td>
                        <td className="px-4 py-3.5 font-inter text-[13px] text-subtle">
                          {t.dateFin ? new Date(t.dateFin).toLocaleDateString("fr-FR") : "—"}
                        </td>
                        <td className="px-4 py-3.5">
                          {canManage ? (
                            <Select
                              value={t.statut}
                              disabled={updatingId === t.id}
                              onValueChange={(v) => v && v !== t.statut && handleStatutChange(t.id, v)}
                            >
                              <SelectTrigger
                                size="sm"
                                aria-label="Changer le statut du traitement"
                                className={`w-fit gap-1 rounded-full border-0 px-2.5 font-inter text-[11px] font-semibold shadow-none focus-visible:ring-0 ${traitementStatutStyle[t.statut] ?? "bg-surface text-subtle"}`}
                              >
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="font-inter">
                                {["En cours", "Planifié", "Terminé"].map((s) => (
                                  <SelectItem key={s} value={s}>{s}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <span className={`inline-flex rounded-full px-2.5 py-1 font-inter text-[11px] font-semibold ${traitementStatutStyle[t.statut] ?? "bg-surface text-subtle"}`}>
                              {t.statut}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
