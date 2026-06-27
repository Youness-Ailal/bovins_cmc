"use client";

import Link from "next/link";
import Icon from "@/components/ui/Icon";
import { useState } from "react";
import DatePicker from "@/components/ui/DatePicker";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { api } from "@/lib/api";
import { exportCsv } from "@/lib/exportCsv";
import { useToast } from "@/components/ui/Toast";
import type { Animal, StockMouvement, Traitement, Distribution } from "@/lib/types";

const EXPORTS = [
  { id: "animaux", label: "Animaux", desc: "Fiche complète, phases, GMQ, coûts", icon: "scan-line" },
  { id: "rations", label: "Distributions alimentaires", desc: "Historique des distributions et coûts", icon: "utensils" },
  { id: "sante", label: "Traitements vétérinaires", desc: "Protocoles, produits, délais de retrait", icon: "heart-pulse" },
  { id: "stocks", label: "Mouvements de stock", desc: "Entrées, sorties, soldes", icon: "package" },
];

const FORMATS = [
  { id: "csv", label: "CSV", desc: "Compatible Excel, Google Sheets" },
];

function inRange(dateStr: string, from?: Date, to?: Date) {
  const d = new Date(dateStr);
  if (from && d < from) return false;
  if (to) { const end = new Date(to); end.setHours(23, 59, 59); if (d > end) return false; }
  return true;
}

export default function ExportPage() {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [format, setFormat] = useState("csv");
  const [dateDebut, setDateDebut] = useState<Date | undefined>();
  const [dateFin, setDateFin] = useState<Date | undefined>();
  const [exporting, setExporting] = useState(false);
  const { success, error: toastError } = useToast();

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  async function handleDownload() {
    if (selected.size === 0) return;

    setExporting(true);
    try {
      const stamp = new Date().toISOString().slice(0, 10);

      if (selected.has("animaux")) {
        const data = await api.get<Animal[]>("/animaux?statut=all");
        const rows = data.filter((a) => inRange(a.dateEntree, dateDebut, dateFin));
        exportCsv(`animaux-${stamp}`, [
          { header: "Identifiant", value: (r) => r.identifiant },
          { header: "NNI", value: (r) => r.nni },
          { header: "Race", value: (r) => r.race?.nom ?? "" },
          { header: "Sexe", value: (r) => r.sexe },
          { header: "Phase", value: (r) => r.phase },
          { header: "Poids entrée (kg)", value: (r) => r.poidsEntree },
          { header: "Poids actuel (kg)", value: (r) => r.poidsActuel },
          { header: "GMQ (kg/j)", value: (r) => r.gmqActuel },
          { header: "Coût cumulé (MAD)", value: (r) => r.coutCumule },
          { header: "État santé", value: (r) => r.etatSante },
          { header: "Statut", value: (r) => r.statut },
          { header: "Date entrée", value: (r) => new Date(r.dateEntree).toLocaleDateString("fr-FR") },
        ], rows);
      }

      if (selected.has("stocks")) {
        const data = await api.get<StockMouvement[]>("/stocks/mouvements");
        const rows = data.filter((m) => inRange(m.date, dateDebut, dateFin));
        exportCsv(`mouvements-stock-${stamp}`, [
          { header: "Date", value: (r) => new Date(r.date).toLocaleDateString("fr-FR") },
          { header: "Article", value: (r) => r.article?.designation ?? "" },
          { header: "Type", value: (r) => r.type },
          { header: "Quantité", value: (r) => r.quantite },
          { header: "Unité", value: (r) => r.article?.unite ?? "" },
          { header: "Qté après", value: (r) => r.quantiteApres },
          { header: "Prix unitaire (MAD)", value: (r) => r.prixUnitaire },
          { header: "Motif", value: (r) => r.motif ?? "" },
          { header: "Utilisateur", value: (r) => r.utilisateur ? `${r.utilisateur.prenom ?? ""} ${r.utilisateur.nom ?? ""}`.trim() : "" },
        ], rows);
      }

      if (selected.has("sante")) {
        const data = await api.get<Traitement[]>("/sante/traitements");
        const rows = data.filter((t) => inRange(t.dateDebut, dateDebut, dateFin));
        exportCsv(`traitements-${stamp}`, [
          { header: "Animal", value: (r) => typeof r.animal === "object" ? (r.animal.identifiant ?? r.animal.id) : r.animal },
          { header: "Type", value: (r) => r.type },
          { header: "Produit", value: (r) => r.produit },
          { header: "Dose", value: (r) => `${r.dose} ${r.doseUnite}` },
          { header: "Voie", value: (r) => r.voie },
          { header: "Date début", value: (r) => new Date(r.dateDebut).toLocaleDateString("fr-FR") },
          { header: "Date fin", value: (r) => r.dateFin ? new Date(r.dateFin).toLocaleDateString("fr-FR") : "" },
          { header: "Délai retrait (j)", value: (r) => r.delaiRetrait },
          { header: "Vétérinaire", value: (r) => r.veterinaire },
          { header: "Statut", value: (r) => r.statut },
        ], rows);
      }

      if (selected.has("rations")) {
        const data = await api.get<Distribution[]>("/rations/distributions");
        const rows = data.filter((d) => inRange(d.date, dateDebut, dateFin));
        exportCsv(`distributions-${stamp}`, [
          { header: "Date", value: (r) => new Date(r.date).toLocaleDateString("fr-FR") },
          { header: "Ration", value: (r) => r.ration?.nom ?? "" },
          { header: "Cible", value: (r) => r.cible },
          { header: "Nb animaux", value: (r) => r.nbAnimaux },
          { header: "Quantité (kg)", value: (r) => r.quantite },
          { header: "Coût estimé (MAD)", value: (r) => r.coutEstime },
        ], rows);
      }

      success(`Export CSV terminé — ${selected.size} fichier(s) téléchargé(s)`);
    } catch (err) {
      toastError(err instanceof Error ? err.message : "Erreur lors de l'export");
    } finally {
      setExporting(false);
    }
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
                disabled={selected.size === 0 || exporting}
                className="flex items-center gap-2 rounded-[6px] bg-primary px-5 py-2.5 font-dm-sans text-[13px] font-semibold text-white hover:bg-primary-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Icon name={exporting ? "loader" : "download"} size={14} className={exporting ? "animate-spin" : ""} />
                {exporting ? "Export en cours…" : `Télécharger (${selected.size} module${selected.size !== 1 ? "s" : ""})`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
