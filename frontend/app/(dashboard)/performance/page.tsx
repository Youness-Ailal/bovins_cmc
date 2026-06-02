"use client";

import { useState } from "react";
import Link from "next/link";
import Icon from "@/components/ui/Icon";
import DataTable, { Column } from "@/components/ui/DataTable";
import { alerteNiveauStyle } from "@/lib/statusStyles";

interface Alerte {
  id: string;
  type: "Critique" | "Avertissement" | "Info";
  message: string;
  animal: string;
  date: string;
  traitee: boolean;
}

const INITIAL_ALERTES: Alerte[] = [
  { id: "ALT-001", type: "Critique", message: "Mortalité signalée", animal: "ANI-047", date: "02/06/2026", traitee: false },
  { id: "ALT-002", type: "Avertissement", message: "IC élevé (>8.0)", animal: "LOT-B", date: "01/06/2026", traitee: false },
  { id: "ALT-003", type: "Avertissement", message: "Pesée en retard (>14j)", animal: "ANI-012, ANI-015, +10", date: "01/06/2026", traitee: false },
  { id: "ALT-004", type: "Info", message: "Stock orge sous seuil", animal: "—", date: "02/06/2026", traitee: false },
  { id: "ALT-005", type: "Critique", message: "Délai de retrait en cours", animal: "ANI-031", date: "28/05/2026", traitee: true },
];

export default function PerformancePage() {
  const [alertes, setAlertes] = useState<Alerte[]>(INITIAL_ALERTES);

  function marquerTraitee(id: string) {
    // TODO: PATCH /api/alertes/:id/traiter
    setAlertes((prev) => prev.map((a) => a.id === id ? { ...a, traitee: true } : a));
  }

  function ignorer(id: string) {
    // TODO: DELETE /api/alertes/:id
    setAlertes((prev) => prev.filter((a) => a.id !== id));
  }

  const nonTraitees = alertes.filter((a) => !a.traitee).length;

  const COLUMNS: Column<Alerte>[] = [
    { key: "id", label: "Réf.", width: "w-[100px]", render: (r) => <span className="font-inter text-[13px] font-semibold text-label">{r.id}</span> },
    {
      key: "type",
      label: "Niveau",
      width: "w-[120px]",
      render: (r) => <span className={`inline-flex rounded-full px-2.5 py-1 font-inter text-[11px] font-semibold ${alerteNiveauStyle[r.type]}`}>{r.type}</span>,
    },
    { key: "message", label: "Message", width: "w-[280px]" },
    { key: "animal", label: "Concerné", width: "w-[160px]" },
    { key: "date", label: "Date", width: "w-[110px]" },
    {
      key: "traitee",
      label: "État",
      width: "w-[100px]",
      render: (r) => (
        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-inter text-[11px] font-semibold ${r.traitee ? "bg-success/10 text-success" : "bg-surface text-subtle"}`}>
          {r.traitee ? "Traitée" : "En attente"}
        </span>
      ),
    },
    {
      key: "_actions",
      label: "Actions",
      width: "w-[80px]",
      align: "right",
      render: (r) => (
        <div className="flex items-center gap-2">
          {!r.traitee && (
            <button
              onClick={() => marquerTraitee(r.id)}
              title="Marquer comme traitée"
              className="text-placeholder hover:text-success transition-colors"
            >
              <Icon name="check" size={15} />
            </button>
          )}
          <button
            onClick={() => ignorer(r.id)}
            title="Ignorer"
            className="text-placeholder hover:text-danger transition-colors"
          >
            <Icon name="x" size={15} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-surface">
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-border-light bg-card px-7">
        <div className="flex items-center gap-1.5">
          <span className="font-dm-sans text-xl font-semibold text-label">Centre des alertes</span>
          {nonTraitees > 0 && (
            <span className="ml-1 flex items-center rounded-full bg-danger px-2 py-0.5 font-inter text-[11px] font-semibold text-white">
              {nonTraitees}
            </span>
          )}
          <span className="font-inter text-sm text-placeholder">/ Performance</span>
        </div>
        <Link
          href="/performance/export"
          className="flex items-center gap-1.5 rounded-[6px] border border-border-light bg-surface px-3.5 py-2 font-dm-sans text-[13px] font-semibold text-subtle hover:bg-border-light transition-colors"
        >
          <Icon name="trending-down" size={14} />
          Exporter les données
        </Link>
      </header>

      <div className="flex flex-1 flex-col gap-4 overflow-auto p-6">
        {/* Summary cards */}
        <div className="flex gap-4">
          {[
            { label: "Critiques", count: alertes.filter((a) => a.type === "Critique" && !a.traitee).length, color: "text-danger" },
            { label: "Avertissements", count: alertes.filter((a) => a.type === "Avertissement" && !a.traitee).length, color: "text-warning" },
            { label: "Informations", count: alertes.filter((a) => a.type === "Info" && !a.traitee).length, color: "text-info" },
            { label: "Traitées", count: alertes.filter((a) => a.traitee).length, color: "text-success" },
          ].map(({ label, count, color }) => (
            <div key={label} className="flex flex-1 flex-col gap-1 rounded-[8px] border border-border-light bg-card p-4">
              <span className="font-inter text-[11px] text-placeholder">{label}</span>
              <span className={`font-dm-sans text-2xl font-bold ${color}`}>{count}</span>
            </div>
          ))}
        </div>

        <DataTable
          columns={COLUMNS}
          data={alertes}
          keyExtractor={(a) => a.id}
          pagination={{ page: 1, total: 1, count: alertes.length }}
        />
      </div>
    </div>
  );
}
