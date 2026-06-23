"use client";

import { use } from "react";
import Link from "next/link";
import Icon from "@/components/ui/Icon";
import { useApi } from "@/lib/useApi";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import type { CommandeAchat } from "@/lib/types";

export default function CommandeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { data, loading, error } = useApi<CommandeAchat>(`/fournisseurs/commandes/${id}`);

  async function handleDelete() {
    if (!confirm("Supprimer cette commande ? Les mouvements de stock créés ne seront pas annulés.")) return;
    await api.del(`/fournisseurs/commandes/${id}`);
    router.push("/fournisseurs/commandes");
  }

  if (loading) return <div className="flex flex-1 items-center justify-center font-inter text-sm text-placeholder">Chargement…</div>;
  if (error || !data) return <div className="flex flex-1 items-center justify-center font-inter text-sm text-danger">{error ?? "Commande introuvable"}</div>;

  const fournisseur = typeof data.fournisseur === "object" ? data.fournisseur : null;

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-surface">
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-border-light bg-card px-7">
        <div className="flex items-center gap-1.5">
          <Link href="/fournisseurs/commandes" className="font-inter text-sm text-subtle hover:text-label transition-colors">Commandes</Link>
          <Icon name="chevron-right" size={14} className="text-placeholder" />
          <span className="font-dm-sans text-xl font-semibold text-label">
            {fournisseur?.nom ?? "Commande"} — {new Date(data.date).toLocaleDateString("fr-FR")}
          </span>
        </div>
        <button
          onClick={handleDelete}
          className="flex items-center gap-1.5 rounded-[6px] border border-danger/30 bg-danger/5 px-3.5 py-2 font-dm-sans text-[13px] font-semibold text-danger hover:bg-danger/10 transition-colors"
        >
          <Icon name="trash-2" size={14} />
          Supprimer
        </button>
      </header>

      <div className="flex flex-1 flex-col gap-5 overflow-auto p-6">
        <div className="grid grid-cols-2 gap-5">
          {/* Info */}
          <div className="flex flex-col gap-3 rounded-[12px] border border-border-light bg-card p-5">
            <span className="font-dm-sans text-[15px] font-semibold text-label">Informations</span>
            <div className="flex items-center justify-between border-b border-border-light pb-2">
              <span className="font-inter text-[12px] text-subtle">Fournisseur</span>
              {fournisseur ? (
                <Link href={`/fournisseurs/${fournisseur.id}`} className="font-inter text-[13px] font-semibold text-primary hover:underline">
                  {fournisseur.nom}
                </Link>
              ) : <span className="font-inter text-[13px] text-subtle">—</span>}
            </div>
            <div className="flex items-center justify-between border-b border-border-light pb-2">
              <span className="font-inter text-[12px] text-subtle">Date</span>
              <span className="font-inter text-[13px] font-semibold text-label">{new Date(data.date).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</span>
            </div>
            <div className="flex items-center justify-between border-b border-border-light pb-2">
              <span className="font-inter text-[12px] text-subtle">Articles</span>
              <span className="font-inter text-[13px] font-semibold text-label">{data.lignes.length} référence{data.lignes.length !== 1 ? "s" : ""}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-dm-sans text-[13px] font-semibold text-label">Montant total</span>
              <span className="font-dm-sans text-[18px] font-bold text-label">{data.montantTotal.toLocaleString("fr-FR")} MAD</span>
            </div>
            {data.notes && (
              <p className="mt-1 rounded-[6px] bg-surface px-3 py-2 font-inter text-[12px] italic text-subtle">{data.notes}</p>
            )}
          </div>

          {/* Lignes */}
          <div className="flex flex-col gap-3 rounded-[12px] border border-border-light bg-card p-5">
            <span className="font-dm-sans text-[15px] font-semibold text-label">Articles commandés</span>
            <div className="flex flex-col gap-2">
              <div className="grid grid-cols-4 pb-1">
                {["Article", "Quantité", "Prix unit.", "Sous-total"].map((h) => (
                  <span key={h} className="font-inter text-[10px] font-semibold uppercase tracking-wide text-placeholder">{h}</span>
                ))}
              </div>
              {data.lignes.map((l, i) => {
                const art = typeof l.article === "object" ? l.article : null;
                return (
                  <div key={i} className="grid grid-cols-4 items-center border-t border-border-light pt-2">
                    <span className="font-inter text-[13px] font-semibold text-label">
                      {art ? (
                        <Link href={`/stocks/${art.id}`} className="hover:text-primary hover:underline">
                          {art.designation}
                        </Link>
                      ) : "—"}
                    </span>
                    <span className="font-inter text-[13px] text-label">
                      {l.quantite} {art?.unite ?? ""}
                    </span>
                    <span className="font-inter text-[13px] text-subtle">
                      {l.prixUnitaire.toLocaleString("fr-FR")} MAD
                    </span>
                    <span className="font-dm-sans text-[13px] font-semibold text-label">
                      {(l.quantite * l.prixUnitaire).toLocaleString("fr-FR")} MAD
                    </span>
                  </div>
                );
              })}
              <div className="flex items-center justify-between border-t border-border-light pt-3 mt-1">
                <span className="font-dm-sans text-[13px] font-semibold text-label">Total</span>
                <span className="font-dm-sans text-[16px] font-bold text-label">{data.montantTotal.toLocaleString("fr-FR")} MAD</span>
              </div>
            </div>
          </div>
        </div>

        {/* Note about stock impact */}
        <div className="flex items-start gap-3 rounded-[10px] border border-success/20 bg-success/5 px-4 py-3">
          <Icon name="check-circle" size={16} className="mt-0.5 shrink-0 text-success" />
          <div>
            <p className="font-inter text-[13px] font-semibold text-success">Stock mis à jour automatiquement</p>
            <p className="font-inter text-[12px] text-subtle mt-0.5">
              Cette commande a créé {data.lignes.length} entrée{data.lignes.length !== 1 ? "s" : ""} de stock lors de son enregistrement.
              Consultez l'<Link href="/stocks/historique" className="text-primary hover:underline">historique des mouvements</Link> pour les détails.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
