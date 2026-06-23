"use client";

import { use, useState } from "react";
import Link from "next/link";
import Icon from "@/components/ui/Icon";
import { useSaveToast } from "@/lib/useSaveToast";
import { useToast } from "@/components/ui/Toast";
import { api, downloadFile } from "@/lib/api";
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
  const [dateSortie, setDateSortie] = useState<Date | undefined>(new Date());
  const [submitting, setSubmitting] = useState(false);

  const notifySaved = useSaveToast();
  const { error: toastError } = useToast();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget as HTMLFormElement);
    setSubmitting(true);
    try {
      await api.post(`/animaux/${id}/sortie`, {
        motif,
        date: dateSortie ?? new Date(),
        poids: Number(fd.get("poidsFinal")) || 0,
        prix: Number(fd.get("prixVente")) || 0,
        notes: String(fd.get("notes") || ""),
      });

      // For a sale/slaughter, propose the transport laissez-passer (best-effort:
      // a download failure must not block the redirect / success flow).
      if (motif === "vente" || motif === "abattage") {
        try {
          const qs = new URLSearchParams({ destination: "À compléter" }).toString();
          await downloadFile(`/animaux/${id}/laissez-passer?${qs}`, `laissez-passer-${id}.pdf`);
        } catch {
          /* ignore — the user can still download it from the animal sheet */
        }
      }

      notifySaved("Sortie enregistrée — fiche clôturée", "/animaux");
    } catch (err) {
      toastError(err instanceof Error ? err.message : "Erreur");
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-surface">
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-border-light bg-card px-7">
        <div className="flex items-center gap-1.5">
          <Link href="/animaux" className="font-inter text-sm text-placeholder hover:text-subtle transition-colors">Animaux</Link>
          <span className="font-inter text-sm text-placeholder">/</span>
          <Link href={`/animaux/${id}`} className="font-inter text-sm text-placeholder hover:text-subtle transition-colors">{id}</Link>
          <span className="font-inter text-sm text-placeholder">/</span>
          <span className="font-dm-sans text-xl font-semibold text-label">Formulaire de sortie</span>
        </div>
        <Link
          href={`/animaux/${id}`}
          className="flex items-center gap-1.5 rounded-[6px] border border-border-light bg-surface px-3.5 py-2 font-dm-sans text-[13px] font-semibold text-subtle hover:bg-border-light transition-colors"
        >
          Annuler
        </Link>
      </header>

      <div className="flex flex-1 overflow-auto p-8">
        <div className="w-full">
          {/* Warning banner */}
          <div className="mb-4 flex items-start gap-3 rounded-[8px] border border-warning/30 bg-warning/5 px-4 py-3.5">
            <Icon name="triangle-alert" size={16} className="mt-0.5 shrink-0 text-warning" />
            <p className="font-inter text-[13px] leading-relaxed text-warning">
              Vérifiez que le délai de retrait est bien écoulé avant de confirmer une sortie vente ou abattage.
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="rounded-[12px] border border-border-light bg-card p-7">
            <h2 className="font-dm-sans text-base font-bold text-label">Enregistrement de sortie</h2>
            <p className="mt-1 font-inter text-[13px] text-subtle">Animal : <strong>{id}</strong> — Holstein · Mâle</p>

            <div className="mt-5 flex flex-col gap-2.5">
              <label className="font-inter text-xs font-medium text-label">Motif de sortie *</label>
              <div className="flex gap-3">
                {MOTIFS.map(({ id: mId, icon, label }) => (
                  <button
                    key={mId}
                    type="button"
                    onClick={() => setMotif(mId)}
                    className={`flex flex-1 flex-col items-center gap-2 rounded-[8px] p-4 font-dm-sans text-[13px] font-semibold transition-colors ${
                      motif === mId
                        ? "border-2 border-primary bg-primary-light text-primary"
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

            <div className="mt-5 flex gap-4">
              <div className="flex flex-1 flex-col gap-1.5">
                <label className="font-inter text-xs font-medium text-label">Date de sortie *</label>
                <DatePicker value={dateSortie} onChange={setDateSortie} />
              </div>

              <div className="flex flex-1 flex-col gap-1.5">
                <label className="font-inter text-xs font-medium text-label">Poids final (kg)</label>
                <div className="flex h-10 items-center justify-between rounded-[6px] border border-border bg-card px-3 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary">
                  <input
                    type="number"
                    name="poidsFinal"
                    min="0"
                    step="0.1"
                    placeholder="0.00"
                    className="w-full bg-transparent font-inter text-[13px] text-label focus:outline-none"
                  />
                  <span className="font-inter text-xs text-placeholder">kg</span>
                </div>
              </div>

              {motif === "vente" && (
                <div className="flex flex-1 flex-col gap-1.5">
                  <label className="font-inter text-xs font-medium text-label">Prix de vente (MAD)</label>
                  <div className="flex h-10 items-center justify-between rounded-[6px] border border-border bg-card px-3 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary">
                    <input
                      type="number"
                      name="prixVente"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      className="w-full bg-transparent font-inter text-[13px] text-label focus:outline-none"
                    />
                    <span className="font-inter text-xs text-placeholder">MAD</span>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-4 flex flex-col gap-1.5">
              <label className="font-inter text-xs font-medium text-label">Notes</label>
              <textarea
                name="notes"
                rows={3}
                className="w-full resize-none rounded-[6px] border border-border bg-card p-3 font-inter text-[13px] text-label placeholder:text-placeholder focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="Remarques, contexte de sortie…"
              />
            </div>

            <div className="mt-6 flex justify-end gap-2.5">
              <Link
                href={`/animaux/${id}`}
                className="flex items-center rounded-[6px] border border-border bg-surface px-4 py-2 font-dm-sans text-[13px] font-semibold text-subtle hover:bg-border-light transition-colors"
              >
                Annuler
              </Link>
              <button
                type="submit"
                className="flex items-center gap-2 rounded-[6px] bg-danger px-4 py-2.5 font-dm-sans text-[13px] font-semibold text-white hover:bg-danger/90 transition-colors"
              >
                <Icon name="check" size={15} />
                Confirmer la sortie
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
