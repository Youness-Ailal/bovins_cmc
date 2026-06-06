"use client";

import { use } from "react";
import Link from "next/link";
import Icon from "@/components/ui/Icon";
import Badge from "@/components/ui/Badge";
import { useApi } from "@/lib/useApi";
import type { Lot, Animal } from "@/lib/types";

const PHASE_VARIANT: Record<string, string> = {
  Veau: "phase-croissance",
  Croissance: "phase-croissance",
  Engraissement: "phase-engraissement",
  Finition: "phase-finition",
};
const SANTE_VARIANT: Record<string, string> = {
  Sain: "sain",
  "En observation": "phase-croissance",
  "En traitement": "phase-engraissement",
  Malade: "malade",
};

function StatCell({ label, value, color, last }: { label: string; value: string; color: string; last?: boolean }) {
  return (
    <div className={`flex flex-col items-center justify-center gap-1 px-6 py-4 ${!last ? "border-r border-border-light" : ""}`}>
      <span className={`font-dm-sans text-2xl font-bold ${color}`}>{value}</span>
      <span className="font-inter text-xs text-placeholder">{label}</span>
    </div>
  );
}

export default function FicheLotPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: lot, loading, error } = useApi<Lot>(`/lots/${id}`);

  if (loading) return <div className="flex flex-1 items-center justify-center bg-surface font-inter text-sm text-placeholder">Chargement…</div>;
  if (error || !lot) return <div className="flex flex-1 items-center justify-center bg-surface font-inter text-sm text-danger">{error || "Lot introuvable"}</div>;

  const animaux = lot.animaux ?? [];

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-surface">
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-border-light bg-card px-7">
        <div className="flex items-center gap-1.5">
          <Link href="/lots" className="font-inter text-sm text-placeholder hover:text-subtle transition-colors">Lots</Link>
          <span className="font-inter text-sm text-placeholder">/</span>
          <span className="font-dm-sans text-xl font-semibold text-label">Fiche lot</span>
          <span className="font-inter text-sm text-placeholder">/ {lot.nom}</span>
        </div>
      </header>

      <div className="flex shrink-0 border-b border-border-light bg-card">
        <StatCell label="Animaux" value={String(lot.nbAnimaux ?? animaux.length)} color="text-label" />
        <StatCell label="GMQ moyen" value={`${lot.gmqMoyen ?? 0} kg/j`} color="text-primary" />
        <StatCell label="Phase" value={lot.phase || "—"} color="text-label" />
        <StatCell label="Coût total" value={`${(lot.coutTotal ?? 0).toLocaleString("fr-FR")} MAD`} color="text-label" last />
      </div>

      <div className="flex flex-1 flex-col gap-3 overflow-auto p-6">
        <span className="font-dm-sans text-sm font-semibold text-label">Animaux du lot ({animaux.length})</span>
        <div className="overflow-hidden rounded-[10px] border border-border-light bg-card">
          <div className="flex items-center gap-4 bg-surface px-5" style={{ height: 44 }}>
            <span className="w-[130px] shrink-0 font-inter text-[11px] font-bold uppercase tracking-wide text-placeholder">Identifiant</span>
            <span className="w-[110px] shrink-0 font-inter text-[11px] font-bold uppercase tracking-wide text-placeholder">Race</span>
            <span className="w-[130px] shrink-0 font-inter text-[11px] font-bold uppercase tracking-wide text-placeholder">Phase</span>
            <span className="w-[130px] shrink-0 font-inter text-[11px] font-bold uppercase tracking-wide text-placeholder">État santé</span>
            <span className="w-[80px] shrink-0 font-inter text-[11px] font-bold uppercase tracking-wide text-placeholder">GMQ</span>
            <span className="flex-1 font-inter text-[11px] font-bold uppercase tracking-wide text-placeholder">Actions</span>
          </div>
          {animaux.length === 0 && <div className="py-8 text-center font-inter text-[13px] text-placeholder">Aucun animal dans ce lot</div>}
          {animaux.map((a: Animal) => (
            <div key={a.id} className="flex items-center gap-4 border-b border-border-light px-5 last:border-b-0" style={{ height: 52 }}>
              <span className="w-[130px] shrink-0 font-inter text-[13px] font-medium text-label">{a.identifiant}</span>
              <span className="w-[110px] shrink-0 font-inter text-[13px] text-subtle">{a.race?.nom ?? "—"}</span>
              <div className="flex w-[130px] shrink-0 items-center"><Badge variant={PHASE_VARIANT[a.phase] as Parameters<typeof Badge>[0]["variant"]}>{a.phase}</Badge></div>
              <div className="flex w-[130px] shrink-0 items-center"><Badge variant={SANTE_VARIANT[a.etatSante] as Parameters<typeof Badge>[0]["variant"]}>{a.etatSante}</Badge></div>
              <span className="w-[80px] shrink-0 font-inter text-[13px] text-subtle">{a.gmqActuel}</span>
              <div className="flex flex-1 items-center">
                <Link href={`/animaux/${a.id}`} className="text-placeholder hover:text-primary transition-colors"><Icon name="eye" size={15} /></Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
