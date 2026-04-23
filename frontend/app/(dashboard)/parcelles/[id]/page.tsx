"use client";

import { use, useState } from "react";
import Link from "next/link";
import Icon from "@/components/ui/Icon";
import Badge from "@/components/ui/Badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const PARCELLE_ANIMALS = [
  { id: "ANI-001", race: "Holstein", phase: "Croissance" as const, sante: "Sain" as const, gmq: "0.82" },
  { id: "ANI-002", race: "Angus", phase: "Engraissement" as const, sante: "Sain" as const, gmq: "0.74" },
  { id: "ANI-003", race: "Limousin", phase: "Finition" as const, sante: "Malade" as const, gmq: "0.65" },
  { id: "ANI-004", race: "Charolais", phase: "Croissance" as const, sante: "Sain" as const, gmq: "0.91" },
];

const PHASE_VARIANT = {
  Croissance: "phase-croissance",
  Engraissement: "phase-engraissement",
  Finition: "phase-finition",
} as const;

const SANTE_VARIANT = {
  Sain: "sain",
  Malade: "malade",
} as const;

const RATIONS = ["Ration Bovins Adultes", "Ration Veaux", "Ration Mixte", "Ration Engraissement"];

export default function FicheParcellePage({ params }: { params: Promise<{ id: string }> }) {
  use(params);
  const [nom, setNom] = useState("Parcelle Alpha");
  const [capacite, setCapacite] = useState("120");
  const [ration, setRation] = useState("Ration Bovins Adultes");

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-surface">
      {/* Content */}
      <div className="flex flex-1 flex-col gap-5 overflow-auto p-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-dm-sans text-2xl font-bold text-label">Parcelle Alpha</span>
            <button className="text-placeholder hover:text-subtle transition-colors">
              <Icon name="pencil" size={18} />
            </button>
          </div>
          <div className="flex items-center rounded-full bg-[#DFDFE6] px-3.5 py-1.5">
            <span className="font-inter text-[13px] font-semibold text-[#000066]">Capacité max : 120 animaux</span>
          </div>
        </div>

        {/* Stats row */}
        <div className="flex gap-4">
          <StatCard label="OCCUPATION" value="65 %" valueColor="text-success" />
          <StatCard label="RATION ACTUELLE" value="Ration Bovins Adultes" valueColor="text-label" valueSizeClass="font-dm-sans text-[15px] font-semibold" />
          <StatCard label="NB ANIMAUX" value="78" valueColor="text-label" />
        </div>

        {/* Body */}
        <div className="flex flex-1 gap-5">
          {/* Left: animals table */}
          <div className="flex flex-1 overflow-hidden rounded-[12px] border border-border-light bg-card">
            <div className="flex w-full flex-col">
              {/* Table header */}
              <div className="flex items-center bg-surface px-5" style={{ height: 44 }}>
                <span className="w-[130px] shrink-0 font-inter text-[11px] font-bold uppercase tracking-wide text-placeholder">Identifiant</span>
                <span className="w-[110px] shrink-0 font-inter text-[11px] font-bold uppercase tracking-wide text-placeholder">Race</span>
                <span className="w-[120px] shrink-0 font-inter text-[11px] font-bold uppercase tracking-wide text-placeholder">Phase</span>
                <span className="w-[120px] shrink-0 font-inter text-[11px] font-bold uppercase tracking-wide text-placeholder">Santé</span>
                <span className="w-[90px] shrink-0 font-inter text-[11px] font-bold uppercase tracking-wide text-placeholder">GMQ</span>
                <span className="flex-1 font-inter text-[11px] font-bold uppercase tracking-wide text-placeholder">Action</span>
              </div>

              {/* Rows */}
              {PARCELLE_ANIMALS.map((a, i) => (
                <div
                  key={a.id}
                  className={`flex items-center px-5 ${i < PARCELLE_ANIMALS.length - 1 ? "border-b border-border-light" : ""}`}
                  style={{ height: 52 }}
                >
                  <span className="w-[130px] shrink-0 font-inter text-[13px] font-medium text-label">{a.id}</span>
                  <span className="w-[110px] shrink-0 font-inter text-[13px] text-subtle">{a.race}</span>
                  <div className="flex w-[120px] shrink-0 items-center">
                    <Badge variant={PHASE_VARIANT[a.phase]} className="text-[10px]">{a.phase}</Badge>
                  </div>
                  <div className="flex w-[120px] shrink-0 items-center">
                    <Badge variant={SANTE_VARIANT[a.sante]} className="text-[10px]">{a.sante}</Badge>
                  </div>
                  <span className="w-[90px] shrink-0 font-inter text-[13px] text-subtle">{a.gmq}</span>
                  <div className="flex flex-1 items-center">
                    <Link href={`/animaux/${a.id}`} className="text-placeholder hover:text-subtle transition-colors">
                      <Icon name="eye" size={13} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: edit form */}
          <div className="flex w-[300px] shrink-0 flex-col gap-4 rounded-[12px] border border-border-light bg-card p-5">
            <span className="font-dm-sans text-base font-bold text-label">Modifier la parcelle</span>

            <FormField label="Nom de la parcelle">
              <input
                type="text"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                className="h-10 w-full rounded-[8px] border border-border bg-card px-3 font-inter text-[13px] text-label focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </FormField>

            <FormField label="Capacité maximale">
              <input
                type="number"
                value={capacite}
                onChange={(e) => setCapacite(e.target.value)}
                className="h-10 w-full rounded-[8px] border border-border bg-card px-3 font-inter text-[13px] text-label focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </FormField>

            <FormField label="Ration associée">
              <Select value={ration} onValueChange={setRation}>
                <SelectTrigger className="h-10 w-full rounded-[8px] border border-border bg-card font-inter text-[13px] text-label focus:border-primary focus:ring-primary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RATIONS.map((r) => (
                    <SelectItem key={r} value={r}>{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <button className="flex h-10 items-center justify-center gap-2 rounded-[8px] bg-primary font-inter text-[13px] font-semibold text-white hover:bg-primary-hover transition-colors">
              <Icon name="save" size={14} />
              Enregistrer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  valueColor,
  valueSizeClass,
}: {
  label: string;
  value: string;
  valueColor: string;
  valueSizeClass?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5 rounded-[10px] border border-border-light bg-card p-4">
      <span className="font-inter text-[11px] font-bold uppercase tracking-wide text-placeholder">{label}</span>
      <span className={`${valueSizeClass ?? "font-dm-sans text-[22px] font-bold"} ${valueColor}`}>{value}</span>
    </div>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="font-inter text-xs font-semibold text-subtle">{label}</label>
      {children}
    </div>
  );
}
