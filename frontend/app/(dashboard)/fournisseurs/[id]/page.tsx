"use client";

import { use, useState } from "react";
import Link from "next/link";
import Icon from "@/components/ui/Icon";
import { useApi } from "@/lib/useApi";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import type { Fournisseur } from "@/lib/types";

const TYPE_COLORS: Record<string, string> = {
  Aliments: "bg-success/10 text-success",
  Médicaments: "bg-info/10 text-info",
  Équipements: "bg-warning/10 text-warning",
  Autre: "bg-subtle/10 text-subtle",
};


export default function FournisseurDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { data, loading, error } = useApi<Fournisseur>(`/fournisseurs/${id}`);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm("Supprimer ce fournisseur ?")) return;
    setDeleting(true);
    try {
      await api.del(`/fournisseurs/${id}`);
      router.push("/fournisseurs");
    } catch {
      setDeleting(false);
    }
  }

  if (loading) return <div className="flex flex-1 items-center justify-center font-inter text-sm text-placeholder">Chargement…</div>;
  if (error || !data) return <div className="flex flex-1 items-center justify-center font-inter text-sm text-danger">{error ?? "Introuvable"}</div>;

  const commandes = data.commandes ?? [];

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-surface">
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-border-light bg-card px-7">
        <div className="flex items-center gap-1.5">
          <Link href="/fournisseurs" className="font-inter text-sm text-subtle hover:text-label transition-colors">Fournisseurs</Link>
          <Icon name="chevron-right" size={14} className="text-placeholder" />
          <span className="font-dm-sans text-xl font-semibold text-label">{data.nom}</span>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/fournisseurs/commandes/nouvelle"
            className="flex items-center gap-1.5 rounded-[6px] bg-primary px-3.5 py-2 font-dm-sans text-[13px] font-semibold text-white hover:bg-primary/90 transition-colors"
          >
            <Icon name="plus" size={14} />
            Nouvelle commande
          </Link>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex items-center gap-1.5 rounded-[6px] border border-danger/30 bg-danger/5 px-3.5 py-2 font-dm-sans text-[13px] font-semibold text-danger hover:bg-danger/10 transition-colors disabled:opacity-60"
          >
            <Icon name="trash-2" size={14} />
          </button>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-5 overflow-auto p-6">
        <div className="grid grid-cols-2 gap-5">
          {/* Info card */}
          <div className="flex flex-col gap-3 rounded-[12px] border border-border-light bg-card p-5">
            <div className="flex items-center justify-between">
              <span className="font-dm-sans text-[15px] font-semibold text-label">Informations</span>
              <span className={`rounded-full px-2.5 py-0.5 font-inter text-[11px] font-semibold ${TYPE_COLORS[data.type] ?? ""}`}>
                {data.type}
              </span>
            </div>
            {[
              { label: "Région", value: data.region || "—" },
              { label: "Contact", value: data.contact || "—" },
              { label: "Commandes passées", value: String(data.nbCommandes ?? commandes.length) },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between border-b border-border-light pb-2">
                <span className="font-inter text-[12px] text-subtle">{label}</span>
                <span className="font-inter text-[13px] font-semibold text-label">{value}</span>
              </div>
            ))}
            {data.notes && (
              <p className="font-inter text-[12px] text-subtle italic">{data.notes}</p>
            )}
          </div>

          {/* Articles habituels */}
          <div className="flex flex-col gap-3 rounded-[12px] border border-border-light bg-card p-5">
            <span className="font-dm-sans text-[15px] font-semibold text-label">Articles habituels</span>
            {data.articlesHabituels.length === 0 ? (
              <p className="font-inter text-[13px] text-placeholder">Aucun article enregistré</p>
            ) : (
              data.articlesHabituels.map((ah, i) => (
                <div key={i} className="flex items-center justify-between border-b border-border-light pb-2">
                  <span className="font-inter text-[13px] text-label">{ah.article?.nom ?? ah.article?.designation ?? "Article"}</span>
                  <span className="font-dm-sans text-[13px] font-semibold text-label">
                    {ah.prixHabituel.toLocaleString("fr-FR")} MAD
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Dernières commandes */}
        <div className="rounded-[12px] border border-border-light bg-card">
          <div className="flex items-center justify-between border-b border-border-light px-5 py-3">
            <span className="font-dm-sans text-[14px] font-semibold text-label">Dernières commandes</span>
            <Link href="/fournisseurs/commandes" className="font-inter text-[12px] text-primary hover:underline">
              Voir toutes
            </Link>
          </div>
          {commandes.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-10">
              <Icon name="shopping-cart" size={28} className="text-placeholder" />
              <p className="font-inter text-[13px] text-placeholder">Aucune commande</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-border-light">
                  {["Date", "Articles", "Total"].map((h) => (
                    <th key={h} className="px-5 py-2.5 text-left font-inter text-[11px] font-semibold text-placeholder">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {commandes.map((c) => (
                  <tr key={c.id} className="border-b border-border-light last:border-0">
                    <td className="px-5 py-3 font-inter text-[13px] text-label">
                      {new Date(c.date).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="px-5 py-3 font-inter text-[13px] text-subtle">{c.lignes.length} article{c.lignes.length !== 1 ? "s" : ""}</td>
                    <td className="px-5 py-3 font-dm-sans text-[13px] font-semibold text-label">
                      {c.montantTotal.toLocaleString("fr-FR")} MAD
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
