"use client";

import { use, useState } from "react";
import Link from "next/link";
import Icon from "@/components/ui/Icon";
import DatePicker from "@/components/ui/DatePicker";

type Motif = "vente" | "abattage" | "mort";

const MOTIFS: { id: Motif; icon: string; label: string }[] = [
  { id: "vente", icon: "tag", label: "Vente" },
  { id: "abattage", icon: "scissors", label: "Abattage" },
  { id: "mort", icon: "skull", label: "Mort" },
];

export default function SortieAnimalPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [motif, setMotif] = useState<Motif>("vente");
  const [dateSortie, setDateSortie] = useState<Date | undefined>();

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-surface">
      {/* Page header */}
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-border-light bg-card px-7">
        <div className="flex items-center gap-1.5">
          <span className="font-dm-sans text-xl font-semibold text-label">Formulaire de sortie</span>
          <span className="font-inter text-sm text-placeholder">/ {id}</span>
        </div>
        <Link
          href={`/animaux/${id}`}
          className="flex items-center gap-1.5 rounded-[6px] border border-border-light bg-surface px-3.5 py-2 font-dm-sans text-[13px] font-semibold text-subtle hover:bg-border-light transition-colors"
        >
          Annuler
        </Link>
      </header>

      {/* Content */}
      <div className="flex flex-1 overflow-auto p-8">
        <div className="w-full">
          {/* Warning banner */}
          <div className="mb-4 flex items-start gap-3 rounded-[8px] border border-[#804200] bg-[#E9E3D8] px-4 py-3.5">
            <Icon name="triangle-alert" size={16} className="mt-0.5 shrink-0 text-[#804200]" />
            <p className="font-inter text-[13px] leading-relaxed text-[#804200]">
              Le délai de retrait n&apos;est pas encore écoulé. Vérifiez que l&apos;animal répond aux critères de sortie avant de confirmer.
            </p>
          </div>

          {/* Form card */}
          <div className="rounded-[12px] border border-border-light bg-card p-7">
            {/* Motif section */}
            <div className="flex flex-col gap-2.5">
              <label className="font-inter text-xs font-medium text-label">Motif de sortie *</label>
              <div className="flex gap-3">
                {MOTIFS.map(({ id: mId, icon, label }) => (
                  <button
                    key={mId}
                    type="button"
                    onClick={() => setMotif(mId)}
                    className={`flex flex-1 flex-col items-center gap-2 rounded-[8px] p-4 font-dm-sans text-[13px] font-semibold transition-colors ${
                      motif === mId
                        ? "border-2 border-primary bg-[#E8F5E9] text-primary"
                        : "border border-border bg-card text-subtle"
                    }`}
                  >
                    <Icon
                      name={icon}
                      size={22}
                      className={motif === mId ? "text-primary" : "text-subtle"}
                    />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Date de sortie */}
            <div className="mt-5 flex flex-col gap-1.5">
              <label className="font-inter text-xs font-medium text-label">Date de sortie *</label>
              <DatePicker value={dateSortie} onChange={setDateSortie} />
            </div>

            {/* Poids final */}
            <div className="mt-4 flex flex-col gap-1.5">
              <label className="font-inter text-xs font-medium text-label">Poids final (kg)</label>
              <div className="flex h-10 items-center justify-between rounded-[6px] border border-border bg-card px-3">
                <input
                  type="number"
                  defaultValue="0.00"
                  className="w-full bg-transparent font-inter text-[13px] text-placeholder focus:outline-none"
                />
                <span className="font-inter text-xs text-placeholder">kg</span>
              </div>
            </div>

            {/* Notes */}
            <div className="mt-4 flex flex-col gap-1.5">
              <label className="font-inter text-xs font-medium text-label">Notes</label>
              <textarea
                rows={3}
                className="w-full resize-none rounded-[6px] border border-border bg-card p-3 font-inter text-[13px] text-label placeholder:text-placeholder focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="Remarques, contexte de sortie…"
              />
            </div>

            {/* Actions */}
            <div className="mt-6 flex justify-end gap-2.5">
              <Link
                href={`/animaux/${id}`}
                className="flex items-center rounded-[6px] border border-border bg-surface px-4 py-2 font-dm-sans text-[13px] font-semibold text-subtle hover:bg-border-light transition-colors"
              >
                Annuler
              </Link>
              <button className="flex items-center gap-2 rounded-[6px] bg-danger px-4 py-2.5 font-dm-sans text-[13px] font-semibold text-white hover:bg-red-700 transition-colors">
                <Icon name="check" size={15} />
                Confirmer la sortie
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
