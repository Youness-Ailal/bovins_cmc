"use client";

import { useState } from "react";
import Link from "next/link";
import Icon from "@/components/ui/Icon";
import DataTable, { Column } from "@/components/ui/DataTable";
import TableSkeleton from "@/components/ui/TableSkeleton";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import AdminTabs from "@/components/dashboard/AdminTabs";
import { useToast } from "@/components/ui/Toast";
import { useApi } from "@/lib/useApi";
import { api } from "@/lib/api";
import type { Race } from "@/lib/types";

export default function RacesPage() {
  const { success, error: toastError } = useToast();
  const { data: races, loading, error, refetch } = useApi<Race[]>("/races");
  const [toDelete, setToDelete] = useState<Race | null>(null);

  function requestDelete(race: Race) {
    if ((race.nbAnimaux ?? 0) > 0) {
      toastError(`Impossible : ${race.nbAnimaux} animaux sont liés à la race ${race.nom}`);
      return;
    }
    setToDelete(race);
  }

  async function confirmDelete() {
    if (!toDelete) return;
    try {
      await api.del(`/races/${toDelete.id}`);
      success(`Race « ${toDelete.nom} » supprimée`);
      refetch();
    } catch (err) {
      toastError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setToDelete(null);
    }
  }

  const COLUMNS: Column<Race>[] = [
    { key: "nom", label: "Race", width: "w-[150px]", render: (r) => <span className="font-inter text-[13px] font-semibold text-label">{r.nom}</span> },
    { key: "origine", label: "Origine", width: "w-[160px]", render: (r) => <span className="font-inter text-[13px] text-subtle">{r.origine || "—"}</span> },
    { key: "poidsAdulte", label: "Poids adulte", width: "w-[120px]", render: (r) => <span className="font-inter text-[13px] text-subtle">{r.poidsAdulte} kg</span> },
    { key: "gmqCible", label: "GMQ cible", width: "w-[120px]", render: (r) => <span className="font-inter text-[13px] text-subtle">{r.gmqCible} kg/j</span> },
    { key: "poidsAbattage", label: "Poids abattage", width: "w-[130px]", render: (r) => <span className="font-inter text-[13px] text-subtle">{r.poidsAbattage} kg</span> },
    { key: "nbAnimaux", label: "Animaux", width: "w-[90px]", render: (r) => <span className="font-inter text-[13px] text-subtle">{r.nbAnimaux ?? 0}</span> },
    {
      key: "_actions", label: "Actions", width: "w-[70px]", align: "right",
      render: (r) => (
        <div className="flex items-center justify-end gap-3">
          <Link href={`/administration/races/${r.id}`} className="text-placeholder hover:text-primary transition-colors"><Icon name="pencil" size={15} /></Link>
          <button onClick={() => requestDelete(r)} title="Supprimer" className="text-placeholder hover:text-danger transition-colors"><Icon name="x" size={15} /></button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-surface">
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-border-light bg-card px-7">
        <div className="flex items-center gap-1.5">
          <span className="font-dm-sans text-xl font-semibold text-label">Administration</span>
          <span className="font-inter text-sm text-placeholder">/ Races</span>
        </div>
        <Link href="/administration/races/nouveau" className="flex items-center gap-1.5 rounded-[6px] bg-primary px-3.5 py-2 font-dm-sans text-[13px] font-semibold text-white hover:bg-primary-hover transition-colors">
          <Icon name="plus" size={14} />
          Nouvelle race
        </Link>
      </header>

      <AdminTabs />

      <div className="flex flex-1 flex-col gap-4 overflow-auto p-6">
        {loading && <TableSkeleton cols={[2, 2, 2, 2, 2, 1, 1]} />}
        {error && <p className="font-inter text-sm text-danger">{error}</p>}
        {!loading && !error && (
          <DataTable columns={COLUMNS} data={races ?? []} keyExtractor={(r) => r.id} pagination={{ page: 1, total: 1, count: (races ?? []).length }} empty={{ icon: "tag", title: "Aucune race", hint: "Ajoutez les races de votre élevage et leurs objectifs de croissance." }} />
        )}
      </div>

      <ConfirmDialog
        open={toDelete !== null}
        title="Supprimer la race ?"
        message={`La race « ${toDelete?.nom ?? ""} » sera supprimée définitivement.`}
        confirmLabel="Supprimer"
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
