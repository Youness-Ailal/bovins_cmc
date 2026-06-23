"use client";

import Link from "next/link";
import Icon from "@/components/ui/Icon";
import ProgressBar from "@/components/ui/ProgressBar";
import EmptyState from "@/components/ui/EmptyState";
import TableSkeleton from "@/components/ui/TableSkeleton";
import { useApi } from "@/lib/useApi";
import { useAuth } from "@/lib/auth";
import { can } from "@/lib/permissions";
import type { Parcelle } from "@/lib/types";

function OccupationBar({ pct }: { pct: number }) {
  // High occupancy = good fill, but >90% should warn (overcrowding risk).
  const color = pct >= 90 ? "bg-danger" : pct >= 70 ? "bg-warning" : "bg-success";
  return (
    <div className="flex items-center gap-2.5">
      <ProgressBar value={pct} color={color} height={8} className="w-32" />
      <span className="font-inter text-[13px] font-medium text-subtle">{pct}%</span>
    </div>
  );
}

export default function ListeParcellesPage() {
  const { user } = useAuth();
  const canManage = can(user?.role, "manageParcelles");
  const { data: parcelles, loading, error } = useApi<Parcelle[]>("/parcelles");

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-surface">
      <div className="flex flex-1 flex-col gap-6 overflow-auto p-8">
        <div className="flex items-center justify-between">
          <span className="font-dm-sans text-2xl font-bold text-label">Liste des parcelles</span>
          {canManage && (
            <Link href="/parcelles/nouvelle" className="flex items-center gap-2 rounded-[8px] bg-primary px-4 py-2.5 font-inter text-sm font-semibold text-white hover:bg-primary-hover transition-colors">
              <Icon name="plus" size={16} />
              Nouvelle parcelle
            </Link>
          )}
        </div>

        {loading && <TableSkeleton cols={[2, 2, 3, 2, 1]} />}
        {error && <p className="font-inter text-sm text-danger">{error}</p>}

        {!loading && !error && (
          <div className="overflow-hidden rounded-[12px] border border-border-light bg-card shadow-[0_1px_2px_rgba(27,46,31,0.04)]">
            <div className="flex items-center gap-4 border-b border-border-light bg-surface px-5" style={{ height: 44 }}>
              <span className="flex-1 font-inter text-[11px] font-bold uppercase tracking-wide text-placeholder">Nom parcelle</span>
              <span className="flex-1 font-inter text-[11px] font-bold uppercase tracking-wide text-placeholder">Capacité max</span>
              <span className="w-[260px] shrink-0 font-inter text-[11px] font-bold uppercase tracking-wide text-placeholder">Occupation actuelle</span>
              <span className="flex-1 font-inter text-[11px] font-bold uppercase tracking-wide text-placeholder">Ration assignée</span>
              <span className="w-[51px] shrink-0 font-inter text-[11px] font-bold uppercase tracking-wide text-placeholder">Actions</span>
            </div>

            {(parcelles ?? []).map((p) => (
              <div key={p.id} className="flex items-center gap-4 border-b border-border-light px-5 last:border-b-0 hover:bg-primary-light/40 transition-colors" style={{ height: 56 }}>
                <span className="flex-1 font-inter text-sm font-medium text-label">{p.nom}</span>
                <span className="flex-1 font-inter text-sm text-subtle">{p.capaciteMax} animaux</span>
                <div className="flex w-[260px] shrink-0 items-center gap-2.5">
                  <OccupationBar pct={p.occupation ?? 0} />
                  <span className="font-inter text-[13px] text-subtle">{p.nbActuels ?? 0} animaux</span>
                </div>
                <span className="flex-1 font-inter text-sm text-subtle">{p.ration?.nom ?? "—"}</span>
                <div className="flex w-[51px] shrink-0 items-center gap-3">
                  <Link href={`/parcelles/${p.id}`} className="text-placeholder hover:text-primary transition-colors">
                    <Icon name="eye" size={15} />
                  </Link>
                </div>
              </div>
            ))}
            {(parcelles ?? []).length === 0 && (
              <EmptyState icon="map" title="Aucune parcelle" hint="Créez une parcelle pour répartir vos animaux." />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
