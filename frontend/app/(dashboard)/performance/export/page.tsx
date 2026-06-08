"use client";

import Link from "next/link";
import Icon from "@/components/ui/Icon";
import { useState } from "react";
import DatePicker from "@/components/ui/DatePicker";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

const EXPORTS = [
  { id: "animaux", label: "Animaux", desc: "Fiche complète, phases, GMQ, coûts", icon: "scan-line" },
  { id: "rations", label: "Distributions alimentaires", desc: "Historique des distributions et coûts", icon: "utensils" },
  { id: "sante", label: "Traitements vétérinaires", desc: "Protocoles, produits, délais de retrait", icon: "heart-pulse" },
  { id: "stocks", label: "Mouvements de stock", desc: "Entrées, sorties, soldes", icon: "package" },
];

const FORMATS = [
  { id: "csv", label: "CSV", desc: "Compatible Excel, Google Sheets" },
  { id: "xlsx", label: "Excel (.xlsx)", desc: "Format natif Microsoft Excel" },
  { id: "pdf", label: "PDF", desc: "Rapport imprimable" },
];

export default function ExportPage() {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [format, setFormat] = useState("csv");
  const [dateDebut, setDateDebut] = useState<Date | undefined>();
  const [dateFin, setDateFin] = useState<Date | undefined>();

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function handleDownload() {
    if (selected.size === 0) return;
    // TODO: GET /api/export?modules=...&format=...&from=...&to=...
    alert(`Export en ${format.toUpperCase()} — ${selected.size} module(s) sélectionné(s)`);
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-surface">
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-border-light bg-card px-7">
        <div className="flex items-center gap-1.5">
          <Link href="/performance" className="font-inter text-sm text-placeholder hover:text-subtle transition-colors">Performance</Link>
          <span className="font-inter text-sm text-placeholder">/</span>
          <span className="font-dm-sans text-xl font-semibold text-label">Export des données</span>
        </div>
        <Link href="/performance" className="flex items-center gap-1.5 rounded-[6px] border border-border-light bg-surface px-3.5 py-2 font-dm-sans text-[13px] font-semibold text-subtle hover:bg-border-light transition-colors">
          <Icon name="arrow-left" size={14} />
          Retour
        </Link>
      </header>

      <div className="flex flex-1 items-start justify-center overflow-auto p-8">
        <div className="w-full max-w-[640px] flex flex-col gap-5">
          {/* Période */}
          <div className="rounded-[12px] border border-border-light bg-card p-6">
            <span className="font-dm-sans text-sm font-bold text-label">Période</span>
            <div className="mt-4 flex gap-4">
              <div className="flex flex-1 flex-col gap-1.5">
                <label className="font-inter text-xs font-medium text-label">Du</label>
                <DatePicker value={dateDebut} onChange={setDateDebut} />
              </div>
              <div className="flex flex-1 flex-col gap-1.5">
                <label className="font-inter text-xs font-medium text-label">Au</label>
                <DatePicker value={dateFin} onChange={setDateFin} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-inter text-xs font-medium text-label">Raccourci</label>
                <Select onValueChange={(v) => {
                  const now = new Date();
                  const from = new Date(now);
                  if (v === "7j") from.setDate(now.getDate() - 7);
                  else if (v === "30j") from.setDate(now.getDate() - 30);
                  else if (v === "3m") from.setMonth(now.getMonth() - 3);
                  else if (v === "6m") from.setMonth(now.getMonth() - 6);
                  else from.setFullYear(now.getFullYear(), 0, 1);
                  setDateDebut(from);
                  setDateFin(now);
                }}>
                  <SelectTrigger className="h-10 rounded-[6px] border border-border bg-card">
                    <SelectValue placeholder="Choisir…" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7j">7 derniers jours</SelectItem>
                    <SelectItem value="30j">30 derniers jours</SelectItem>
                    <SelectItem value="3m">3 derniers mois</SelectItem>
                    <SelectItem value="6m">6 derniers mois</SelectItem>
                    <SelectItem value="an">Cette année</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Modules */}
          <div className="rounded-[12px] border border-border-light bg-card p-6">
            <span className="font-dm-sans text-sm font-bold text-label">Données à exporter</span>
            <div className="mt-4 flex flex-col gap-2">
              {EXPORTS.map((exp) => {
                const active = selected.has(exp.id);
                return (
                  <button
                    key={exp.id}
                    type="button"
                    onClick={() => toggle(exp.id)}
                    className={`flex items-center gap-4 rounded-[8px] border px-4 py-3 text-left transition-colors ${active ? "border-primary bg-primary-light" : "border-border-light bg-surface hover:border-border"}`}
                  >
                    <Icon name={exp.icon} size={18} className={active ? "text-primary" : "text-subtle"} />
                    <div className="flex flex-col gap-0.5 flex-1">
                      <span className={`font-inter text-[13px] font-semibold ${active ? "text-primary" : "text-label"}`}>{exp.label}</span>
                      <span className="font-inter text-[11px] text-placeholder">{exp.desc}</span>
                    </div>
                    <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-[4px] border transition-colors ${active ? "border-primary bg-primary" : "border-border"}`}>
                      {active && <Icon name="check" size={12} className="text-white" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Format + action */}
          <div className="rounded-[12px] border border-border-light bg-card p-6">
            <span className="font-dm-sans text-sm font-bold text-label">Format d&apos;export</span>
            <div className="mt-3 flex gap-2">
              {FORMATS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFormat(f.id)}
                  className={`flex flex-1 flex-col items-center gap-1 rounded-[8px] border px-3 py-2.5 transition-colors ${format === f.id ? "border-primary bg-primary-light" : "border-border-light bg-surface hover:border-border"}`}
                >
                  <span className={`font-inter text-[13px] font-semibold ${format === f.id ? "text-primary" : "text-label"}`}>{f.label}</span>
                  <span className="font-inter text-[10px] text-placeholder text-center">{f.desc}</span>
                </button>
              ))}
            </div>

            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={handleDownload}
                disabled={selected.size === 0}
                className="flex items-center gap-2 rounded-[6px] bg-primary px-5 py-2.5 font-dm-sans text-[13px] font-semibold text-white hover:bg-primary-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Icon name="trending-down" size={14} />
                Télécharger ({selected.size} module{selected.size !== 1 ? "s" : ""})
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
