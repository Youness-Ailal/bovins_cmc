"use client";

import Link from "next/link";
import Icon from "@/components/ui/Icon";
import TableSkeleton from "@/components/ui/TableSkeleton";
import SanteTabs from "@/components/dashboard/SanteTabs";
import { useApi } from "@/lib/useApi";
import { useAuth } from "@/lib/auth";
import { can } from "@/lib/permissions";
import type { EtatSanteRow } from "@/lib/types";

const ETAT_CONFIG: Record<string, { bg: string; text: string; border: string; barColor: string; icon: string; label: string }> = {
  Sain:            { bg: "bg-success/10", text: "text-success", border: "border-success/20", barColor: "bg-success", icon: "check-circle", label: "Sains" },
  "En traitement": { bg: "bg-warning/10", text: "text-warning", border: "border-warning/20", barColor: "bg-warning", icon: "syringe",      label: "En traitement" },
  Malade:          { bg: "bg-danger/10",  text: "text-danger",  border: "border-danger/20",  barColor: "bg-danger",  icon: "skull",        label: "Malades" },
};

export default function EtatSantePage() {
  const { user } = useAuth();
  const canManage = can(user?.role, "manageSante");
  const { data, loading, error } = useApi<EtatSanteRow[]>("/sante/etats");
  const list = data ?? [];
  const total = list.length;

  const countOf = (etat: string) => list.filter((a) => a.etat === etat).length;
  const sains      = countOf("Sain");
  const traitement = countOf("En traitement");
  const malades    = countOf("Malade");

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-surface">
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-border-light bg-card px-7">
        <div className="flex items-center gap-3">
          <span className="font-dm-sans text-xl font-semibold text-label">État du troupeau</span>
          {total > 0 && (
            <span className="rounded-full border border-border-light bg-surface px-2.5 py-0.5 font-inter text-[12px] font-semibold text-subtle">{total} animaux</span>
          )}
        </div>
        {canManage && (
          <Link href="/sante/etat/nouveau" className="flex items-center gap-1.5 rounded-[6px] bg-primary px-3.5 py-2 font-dm-sans text-[13px] font-semibold text-white hover:bg-primary/90 transition-colors">
            <Icon name="plus" size={14} />
            Enregistrer un état
          </Link>
        )}
      </header>

      <SanteTabs />

      <div className="flex flex-1 flex-col gap-5 overflow-auto p-6">
        {/* KPI cards */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { etat: "Sain",            count: sains,      cfg: ETAT_CONFIG["Sain"] },
            { etat: "En traitement",   count: traitement, cfg: ETAT_CONFIG["En traitement"] },
            { etat: "Malade",          count: malades,    cfg: ETAT_CONFIG["Malade"] },
          ].map(({ etat, count, cfg }) => (
            <div key={etat} className={`flex items-center gap-4 rounded-[12px] border bg-card p-5 ${cfg.border}`}>
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-[10px] ${cfg.bg}`}>
                <Icon name={cfg.icon} size={22} className={cfg.text} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`font-dm-sans text-[34px] font-bold leading-none ${cfg.text}`}>{count}</p>
                <p className="mt-1 font-inter text-[12px] text-subtle">{cfg.label}</p>
              </div>
              {total > 0 && (
                <span className={`shrink-0 font-dm-sans text-[20px] font-bold ${cfg.text} opacity-25`}>
                  {Math.round((count / total) * 100)}%
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Health proportion bar */}
        {total > 0 && (
          <div className="rounded-[12px] border border-border-light bg-card px-5 py-4">
            <div className="flex items-center justify-between mb-2.5">
              <span className="font-inter text-[12px] font-medium text-subtle">État global du troupeau</span>
              <span className="font-inter text-[12px] text-placeholder">{total} animaux suivis</span>
            </div>
            <div className="flex h-3 overflow-hidden rounded-full bg-surface">
              {sains > 0      && <div className="bg-success transition-all" style={{ width: `${(sains / total) * 100}%` }} />}
              {traitement > 0 && <div className="bg-warning transition-all" style={{ width: `${(traitement / total) * 100}%` }} />}
              {malades > 0    && <div className="bg-danger transition-all"  style={{ width: `${(malades / total) * 100}%` }} />}
            </div>
            <div className="mt-2.5 flex gap-5">
              {[
                { label: "Sains",          bar: "bg-success", count: sains },
                { label: "En traitement",  bar: "bg-warning", count: traitement },
                { label: "Malades",        bar: "bg-danger",  count: malades },
              ].map((l) => (
                <div key={l.label} className="flex items-center gap-1.5">
                  <span className={`h-2 w-2 shrink-0 rounded-full ${l.bar}`} />
                  <span className="font-inter text-[11px] text-subtle">{l.label} <span className="font-semibold text-label">({l.count})</span></span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Table */}
        {loading && <TableSkeleton cols={[2, 1, 1, 1, 1, 1]} />}
        {error && <p className="font-inter text-sm text-danger">{error}</p>}
        {!loading && !error && (
          <div className="overflow-hidden rounded-[12px] border border-border-light bg-card">
            {list.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-16">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-surface">
                  <Icon name="heart-pulse" size={26} className="text-placeholder" />
                </div>
                <p className="font-dm-sans text-[15px] font-semibold text-label">Aucun état enregistré</p>
                <p className="font-inter text-[13px] text-placeholder">Enregistrez l'état de santé de vos animaux.</p>
                {canManage && (
                  <Link href="/sante/etat/nouveau" className="mt-1 flex items-center gap-1.5 rounded-[6px] bg-primary px-4 py-2 font-dm-sans text-[13px] font-semibold text-white hover:bg-primary/90 transition-colors">
                    <Icon name="plus" size={14} />
                    Enregistrer un état
                  </Link>
                )}
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border-light">
                    <th className="px-5 py-3 text-left font-inter text-[10px] font-semibold uppercase tracking-wide text-placeholder">Animal</th>
                    <th className="px-4 py-3 text-left font-inter text-[10px] font-semibold uppercase tracking-wide text-placeholder">État de santé</th>
                    <th className="px-4 py-3 text-left font-inter text-[10px] font-semibold uppercase tracking-wide text-placeholder">Température</th>
                    <th className="px-4 py-3 text-left font-inter text-[10px] font-semibold uppercase tracking-wide text-placeholder">Dernière obs.</th>
                    <th className="px-4 py-3 text-left font-inter text-[10px] font-semibold uppercase tracking-wide text-placeholder">Délai retrait</th>
                    {canManage && <th className="px-4 py-3 text-right font-inter text-[10px] font-semibold uppercase tracking-wide text-placeholder">Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {list.map((r) => {
                    const cfg = ETAT_CONFIG[r.etat] ?? ETAT_CONFIG["Sain"];
                    return (
                      <tr key={r.id} className="border-b border-border-light last:border-b-0 hover:bg-surface/60 transition-colors">
                        <td className="px-5 py-3.5">
                          <div className="flex flex-col">
                            <Link href={`/animaux/${r.id}`} className="font-inter text-[13px] font-semibold text-primary hover:underline">
                              {r.identifiant}
                            </Link>
                            <span className="font-inter text-[11px] text-placeholder">{r.race}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-inter text-[11px] font-semibold ${cfg.bg} ${cfg.text}`}>
                            <Icon name={cfg.icon} size={11} />
                            {r.etat}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 font-inter text-[13px] text-subtle">{r.temperature || "—"}</td>
                        <td className="px-4 py-3.5 font-inter text-[13px] text-subtle">
                          {r.derniereObs ? new Date(r.derniereObs).toLocaleDateString("fr-FR") : "—"}
                        </td>
                        <td className="px-4 py-3.5">
                          {r.delaiRetrait === "—" ? (
                            <span className="font-inter text-[13px] text-placeholder">—</span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-danger/10 px-2.5 py-1 font-inter text-[11px] font-semibold text-danger">
                              <Icon name="clock" size={10} />
                              {r.delaiRetrait}
                            </span>
                          )}
                        </td>
                        {canManage && (
                          <td className="px-4 py-3.5 text-right">
                            <Link
                              href={`/sante/etat/nouveau?animal=${r.id}`}
                              className="inline-flex items-center gap-1.5 rounded-[6px] border border-border-light px-2.5 py-1 font-inter text-[11px] font-medium text-subtle hover:bg-surface transition-colors"
                            >
                              <Icon name="pencil" size={11} />
                              Mettre à jour
                            </Link>
                          </td>
                        )}
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
