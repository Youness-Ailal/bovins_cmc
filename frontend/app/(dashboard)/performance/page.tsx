"use client";

import Link from "next/link";
import Icon from "@/components/ui/Icon";
import DataTable, { Column } from "@/components/ui/DataTable";
import { alerteNiveauStyle } from "@/lib/statusStyles";
import { useApi } from "@/lib/useApi";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";
import type { Alerte } from "@/lib/types";

export default function PerformancePage() {
  const canManage = true;
  const { data: alertes, loading, error, refetch } = useApi<Alerte[]>("/alertes");
  const { success, error: toastError } = useToast();
  const list = alertes ?? [];

  async function marquerTraitee(id: string) {
    try {
      await api.patch(`/alertes/${id}/traiter`);
      success("Alerte marquée comme traitée");
      refetch();
    } catch (err) {
      toastError(err instanceof Error ? err.message : "Erreur");
    }
  }

  async function ignorer(id: string) {
    try {
      await api.del(`/alertes/${id}`);
      success("Alerte supprimée");
      refetch();
    } catch (err) {
      toastError(err instanceof Error ? err.message : "Erreur");
    }
  }

  const nonTraitees = list.filter((a) => !a.traitee).length;

  const COLUMNS: Column<Alerte>[] = [
    {
      key: "niveau", label: "Niveau", width: "w-[130px]",
      render: (r) => <span className={`inline-flex rounded-full px-2.5 py-1 font-inter text-[11px] font-semibold ${alerteNiveauStyle[r.niveau]}`}>{r.niveau}</span>,
    },
    { key: "message", label: "Message", width: "w-[300px]", render: (r) => <span className="font-inter text-[13px] text-label">{r.message}</span> },
    { key: "concerne", label: "Concerné", width: "w-[150px]", render: (r) => <span className="font-inter text-[13px] text-subtle">{r.concerne || "—"}</span> },
    { key: "date", label: "Date", width: "w-[110px]", render: (r) => <span className="font-inter text-[13px] text-subtle">{new Date(r.date).toLocaleDateString("fr-FR")}</span> },
    {
      key: "traitee", label: "État", width: "w-[110px]",
      render: (r) => <span className={`inline-flex rounded-full px-2.5 py-1 font-inter text-[11px] font-semibold ${r.traitee ? "bg-success/10 text-success" : "bg-surface text-subtle"}`}>{r.traitee ? "Traitée" : "En attente"}</span>,
    },
    {
      key: "_actions", label: "Actions", width: "w-[80px]", align: "right",
      render: (r) => canManage ? (
        <div className="flex items-center justify-end gap-2">
          {!r.traitee && <button onClick={() => marquerTraitee(r.id)} title="Marquer comme traitée" className="text-placeholder hover:text-success transition-colors"><Icon name="check" size={15} /></button>}
          <button onClick={() => ignorer(r.id)} title="Supprimer" className="text-placeholder hover:text-danger transition-colors"><Icon name="x" size={15} /></button>
        </div>
      ) : null,
    },
  ];

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-surface">
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-border-light bg-card px-7">
        <div className="flex items-center gap-1.5">
          <span className="font-dm-sans text-xl font-semibold text-label">Centre des alertes</span>
          {nonTraitees > 0 && <span className="ml-1 flex items-center rounded-full bg-danger px-2 py-0.5 font-inter text-[11px] font-semibold text-white">{nonTraitees}</span>}
          <span className="font-inter text-sm text-placeholder">/ Performance</span>
        </div>
        <Link href="/performance/export" className="flex items-center gap-1.5 rounded-[6px] border border-border-light bg-surface px-3.5 py-2 font-dm-sans text-[13px] font-semibold text-subtle hover:bg-border-light transition-colors">
          <Icon name="trending-down" size={14} />
          Exporter les données
        </Link>
      </header>

      <div className="flex flex-1 flex-col gap-4 overflow-auto p-6">
        <div className="flex gap-4">
          {[
            { label: "Critiques", count: list.filter((a) => a.niveau === "Critique" && !a.traitee).length, color: "text-danger" },
            { label: "Avertissements", count: list.filter((a) => a.niveau === "Avertissement" && !a.traitee).length, color: "text-warning" },
            { label: "Informations", count: list.filter((a) => a.niveau === "Info" && !a.traitee).length, color: "text-info" },
            { label: "Traitées", count: list.filter((a) => a.traitee).length, color: "text-success" },
          ].map(({ label, count, color }) => (
            <div key={label} className="flex flex-1 flex-col gap-1 rounded-[8px] border border-border-light bg-card p-4">
              <span className="font-inter text-[11px] text-placeholder">{label}</span>
              <span className={`font-dm-sans text-2xl font-bold ${color}`}>{count}</span>
            </div>
          ))}
        </div>

        {loading && <p className="font-inter text-sm text-placeholder">Chargement…</p>}
        {error && <p className="font-inter text-sm text-danger">{error}</p>}
        {!loading && !error && (
          <DataTable columns={COLUMNS} data={list} keyExtractor={(a) => a.id} pagination={{ page: 1, total: 1, count: list.length }} />
        )}
      </div>
    </div>
  );
}
