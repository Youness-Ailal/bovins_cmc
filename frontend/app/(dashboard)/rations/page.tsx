"use client";

import { useState } from "react";
import Link from "next/link";
import Icon from "@/components/ui/Icon";
import TableSkeleton from "@/components/ui/TableSkeleton";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { useApi } from "@/lib/useApi";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";
import type { Ration, Distribution } from "@/lib/types";

const PHASE_STYLE: Record<string, { bg: string; text: string; border: string }> = {
  Veau:          { bg: "bg-info/10",    text: "text-info",    border: "border-info/20" },
  Croissance:    { bg: "bg-primary/10", text: "text-primary", border: "border-primary/20" },
  Engraissement: { bg: "bg-warning/10", text: "text-warning", border: "border-warning/20" },
  Finition:      { bg: "bg-success/10", text: "text-success", border: "border-success/20" },
};

export default function RationsPage() {
  const canManage = true;
  const canDistribuer = true;
  const { data: rations, loading, error, refetch } = useApi<Ration[]>("/rations");
  const { data: distributions } = useApi<Distribution[]>("/rations/distributions");
  const { success, error: toastError } = useToast();
  const [phaseFilter, setPhaseFilter] = useState("Toutes");
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Ration | null>(null);

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await api.del(`/rations/${deleteTarget.id}`);
      success(`Ration « ${deleteTarget.nom} » supprimée`);
      refetch();
    } catch (err) {
      toastError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setDeleteTarget(null);
    }
  }

  const list = rations ?? [];
  const dists = distributions ?? [];
  const now = new Date();
  const thisMonth = dists.filter((d) => {
    const dd = new Date(d.date);
    return dd.getMonth() === now.getMonth() && dd.getFullYear() === now.getFullYear();
  });
  const coutMoyen = list.length > 0 ? list.reduce((s, r) => s + r.coutJour, 0) / list.length : 0;

  const filtered = list.filter((r) => {
    if (phaseFilter !== "Toutes" && r.phase !== phaseFilter) return false;
    if (search && !r.nom.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-surface">
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-border-light bg-card px-7">
        <div className="flex items-center gap-3">
          <span className="font-dm-sans text-xl font-semibold text-label">Rations alimentaires</span>
          <span className="rounded-full border border-border-light bg-surface px-2.5 py-0.5 font-inter text-[12px] font-semibold text-subtle">{list.length}</span>
        </div>
        <div className="flex items-center gap-2">
          {canDistribuer && (
            <Link href="/rations/distribution" className="flex items-center gap-1.5 rounded-[6px] border border-border-light bg-surface px-3.5 py-2 font-dm-sans text-[13px] font-semibold text-subtle hover:bg-border-light transition-colors">
              <Icon name="utensils" size={14} />
              Distribution
            </Link>
          )}
          <Link href="/rations/historique" className="flex items-center gap-1.5 rounded-[6px] border border-border-light bg-surface px-3.5 py-2 font-dm-sans text-[13px] font-semibold text-subtle hover:bg-border-light transition-colors">
            <Icon name="history" size={14} />
            Historique
          </Link>
          {canManage && (
            <Link href="/rations/nouvelle" className="flex items-center gap-1.5 rounded-[6px] bg-primary px-3.5 py-2 font-dm-sans text-[13px] font-semibold text-white hover:bg-primary/90 transition-colors">
              <Icon name="plus" size={14} />
              Nouvelle ration
            </Link>
          )}
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-5 overflow-auto p-6">
        {/* KPI row */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Rations actives", value: String(list.length), icon: "utensils", bg: "bg-primary/5", color: "text-primary" },
            { label: "Distributions ce mois", value: String(thisMonth.length), icon: "calendar", bg: "bg-success/5", color: "text-success" },
            { label: "Coût moyen du lot", value: `${coutMoyen.toFixed(2)} MAD`, icon: "coins", bg: "bg-warning/5", color: "text-warning" },
          ].map((k) => (
            <div key={k.label} className="flex items-center gap-4 rounded-[12px] border border-border-light bg-card p-4">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px] ${k.bg}`}>
                <Icon name={k.icon} size={18} className={k.color} />
              </div>
              <div>
                <p className="font-dm-sans text-[22px] font-bold leading-none text-label">{k.value}</p>
                <p className="mt-0.5 font-inter text-[12px] text-subtle">{k.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Phase filter + search */}
        <div className="flex flex-wrap items-center gap-2">
          {["Toutes", "Veau", "Croissance", "Engraissement", "Finition"].map((ph) => (
            <button
              key={ph}
              onClick={() => setPhaseFilter(ph)}
              className={`rounded-full px-3.5 py-1.5 font-inter text-[12px] font-semibold transition-colors ${
                phaseFilter === ph
                  ? "bg-primary text-white"
                  : "border border-border-light bg-card text-subtle hover:bg-surface"
              }`}
            >
              {ph}
            </button>
          ))}
          <div className="ml-auto flex items-center gap-1.5 rounded-[6px] border border-border-light bg-card px-3 py-1.5">
            <Icon name="search" size={13} className="text-placeholder" />
            <input
              type="text" placeholder="Rechercher une ration…" value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-40 bg-transparent font-inter text-[13px] text-label placeholder:text-placeholder focus:outline-none"
            />
          </div>
        </div>

        {/* Cards */}
        {loading && <TableSkeleton cols={[3, 2, 1, 2]} />}
        {error && <p className="font-inter text-sm text-danger">{error}</p>}
        {!loading && !error && filtered.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-16">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-surface">
              <Icon name="utensils" size={28} className="text-placeholder" />
            </div>
            <p className="font-dm-sans text-[15px] font-semibold text-label">
              {search || phaseFilter !== "Toutes" ? "Aucune ration ne correspond" : "Aucune ration créée"}
            </p>
            <p className="font-inter text-[13px] text-placeholder">
              {search || phaseFilter !== "Toutes" ? "Modifiez les filtres pour voir plus de résultats." : "Composez votre première ration pour alimenter vos animaux."}
            </p>
            {canManage && !search && phaseFilter === "Toutes" && (
              <Link href="/rations/nouvelle" className="mt-1 flex items-center gap-1.5 rounded-[6px] bg-primary px-4 py-2 font-dm-sans text-[13px] font-semibold text-white hover:bg-primary/90 transition-colors">
                <Icon name="plus" size={14} />
                Créer la première ration
              </Link>
            )}
          </div>
        )}
        {!loading && !error && filtered.length > 0 && (
          <div className="grid gap-4 grid-cols-2 xl:grid-cols-3">
            {filtered.map((r) => {
              const ps = PHASE_STYLE[r.phase] ?? PHASE_STYLE.Croissance;
              const ings = r.ingredients ?? [];
              const preview = ings.slice(0, 3).map((i) => i.nom).join(" · ");
              const overflow = ings.length > 3 ? ` +${ings.length - 3}` : "";
              return (
                <div key={r.id} className={`flex flex-col rounded-[14px] border bg-card p-5 transition-shadow hover:shadow-sm ${ps.border}`}>
                  <div className="flex items-start justify-between gap-2">
                    <span className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-1 font-inter text-[11px] font-semibold ${ps.bg} ${ps.text}`}>
                      {r.phase || "—"}
                    </span>
                    <div className="flex flex-col items-end shrink-0">
                      <span className="font-dm-sans text-[20px] font-bold leading-none text-label">{r.coutJour.toFixed(2)}</span>
                      <span className="font-inter text-[10px] text-placeholder">MAD / lot</span>
                    </div>
                  </div>

                  <h3 className="mt-3 font-dm-sans text-[15px] font-bold text-label">{r.nom}</h3>

                  <p className="mt-1 min-h-[18px] font-inter text-[12px] text-subtle">
                    {preview ? `${preview}${overflow}` : <span className="italic text-placeholder">Aucun ingrédient</span>}
                  </p>

                  {r.cible && (
                    <div className="mt-2 flex items-center gap-1.5">
                      <Icon name="map-pin" size={11} className="text-placeholder" />
                      <span className="font-inter text-[11px] text-placeholder">{r.cible}</span>
                    </div>
                  )}

                  <div className="mt-4 flex items-center gap-2 border-t border-border-light pt-4">
                    {canDistribuer && (
                      <Link
                        href={`/rations/distribution?ration=${r.id}`}
                        className="flex items-center gap-1.5 rounded-[6px] bg-primary px-3 py-1.5 font-inter text-[12px] font-semibold text-white hover:bg-primary/90 transition-colors"
                      >
                        <Icon name="utensils" size={12} />
                        Distribuer
                      </Link>
                    )}
                    {canManage && (
                      <Link
                        href={`/rations/${r.id}`}
                        className="flex items-center gap-1.5 rounded-[6px] border border-border-light bg-surface px-3 py-1.5 font-inter text-[12px] font-semibold text-subtle hover:bg-border-light transition-colors"
                      >
                        <Icon name="pencil" size={12} />
                        Modifier
                      </Link>
                    )}
                    <span className="ml-auto font-inter text-[11px] text-placeholder">
                      {r.nbIngredients} ingrédient{r.nbIngredients !== 1 ? "s" : ""}
                    </span>
                    <button
                      onClick={() => setDeleteTarget(r)}
                      className="rounded-[4px] p-1.5 text-placeholder hover:text-danger hover:bg-danger/5 transition-colors"
                      title="Supprimer"
                    >
                      <Icon name="trash-2" size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        variant="danger"
        title="Supprimer la ration"
        message={deleteTarget ? `La ration « ${deleteTarget.nom} » sera supprimée définitivement.` : ""}
        confirmLabel="Supprimer"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
