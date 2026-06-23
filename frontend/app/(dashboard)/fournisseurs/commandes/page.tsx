"use client";

import Link from "next/link";
import Icon from "@/components/ui/Icon";
import DataTable, { Column } from "@/components/ui/DataTable";
import TableSkeleton from "@/components/ui/TableSkeleton";
import { useApi } from "@/lib/useApi";
import { api } from "@/lib/api";
import type { CommandeAchat } from "@/lib/types";

interface CommandesMeta { total: number; total30: number; total90: number }

export default function CommandesPage() {
  const { data: raw, loading, error, refetch } = useApi<{ data: CommandeAchat[]; meta: CommandesMeta } | CommandeAchat[]>("/fournisseurs/commandes");

  const commandes: CommandeAchat[] = Array.isArray(raw)
    ? (raw as CommandeAchat[])
    : ((raw as { data: CommandeAchat[] })?.data ?? []);
  const meta: CommandesMeta = Array.isArray(raw)
    ? { total: commandes.length, total30: 0, total90: 0 }
    : ((raw as { meta: CommandesMeta })?.meta ?? { total: commandes.length, total30: 0, total90: 0 });

  async function handleDelete(id: string) {
    if (!confirm("Supprimer cette commande ?")) return;
    await api.del(`/fournisseurs/commandes/${id}`);
    refetch?.();
  }

  const COLUMNS: Column<CommandeAchat>[] = [
    {
      key: "date", label: "Date", width: "w-[110px]",
      render: (r) => <span className="font-inter text-[13px] text-label">{new Date(r.date).toLocaleDateString("fr-FR")}</span>,
    },
    {
      key: "fournisseur", label: "Fournisseur", width: "w-[180px]",
      render: (r) => (
        <Link href={`/fournisseurs/${typeof r.fournisseur === "object" ? r.fournisseur.id : ""}`}
          className="font-inter text-[13px] font-semibold text-primary hover:underline">
          {typeof r.fournisseur === "object" ? r.fournisseur.nom : "—"}
        </Link>
      ),
    },
    {
      key: "lignes", label: "Articles", width: "w-[250px]",
      render: (r) => (
        <span className="font-inter text-[12px] text-subtle">
          {r.lignes.map((l) => {
            const nom = typeof l.article === "object" ? l.article.designation : "—";
            const unite = typeof l.article === "object" ? l.article.unite : "";
            return `${l.quantite} ${unite} ${nom}`;
          }).join(", ")}
        </span>
      ),
    },
    {
      key: "montantTotal", label: "Montant", width: "w-[120px]", align: "right",
      render: (r) => (
        <span className="font-dm-sans text-[13px] font-semibold text-label">
          {r.montantTotal.toLocaleString("fr-FR")} MAD
        </span>
      ),
    },
    {
      key: "_actions", label: "", width: "w-[80px]", align: "right",
      render: (r) => (
        <div className="flex items-center justify-end gap-2">
          <Link href={`/fournisseurs/commandes/${r.id}`} className="text-placeholder hover:text-primary transition-colors">
            <Icon name="arrow-right" size={14} />
          </Link>
          <button
            onClick={() => handleDelete(r.id)}
            className="text-placeholder hover:text-danger transition-colors"
            title="Supprimer"
          >
            <Icon name="trash-2" size={14} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-surface">
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-border-light bg-card px-7">
        <div className="flex items-center gap-1.5">
          <Link href="/fournisseurs" className="font-inter text-sm text-subtle hover:text-label transition-colors">Fournisseurs</Link>
          <Icon name="chevron-right" size={14} className="text-placeholder" />
          <span className="font-dm-sans text-xl font-semibold text-label">Commandes d'achat</span>
        </div>
        <Link
          href="/fournisseurs/commandes/nouvelle"
          className="flex items-center gap-1.5 rounded-[6px] bg-primary px-3.5 py-2 font-dm-sans text-[13px] font-semibold text-white hover:bg-primary/90 transition-colors"
        >
          <Icon name="plus" size={14} />
          Nouvelle commande
        </Link>
      </header>

      <div className="flex flex-1 flex-col gap-5 overflow-auto p-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total commandes", value: String(meta.total), icon: "shopping-cart", iconBg: "bg-primary-light", iconColor: "text-primary" },
            { label: "Achats 30 derniers jours", value: `${meta.total30.toLocaleString("fr-FR")} MAD`, icon: "calendar", iconBg: "bg-info/10", iconColor: "text-info" },
            { label: "Achats 90 derniers jours", value: `${meta.total90.toLocaleString("fr-FR")} MAD`, icon: "trending-up", iconBg: "bg-success/10", iconColor: "text-success" },
          ].map((k) => (
            <div key={k.label} className="flex flex-col gap-3 rounded-[12px] border border-border-light bg-card p-5">
              <div className="flex items-center justify-between">
                <span className="font-inter text-[13px] font-medium text-subtle">{k.label}</span>
                <div className={`flex h-9 w-9 items-center justify-center rounded-[6px] ${k.iconBg}`}>
                  <Icon name={k.icon} size={18} className={k.iconColor} />
                </div>
              </div>
              <span className="font-dm-sans text-[22px] font-bold leading-none text-label">{k.value}</span>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="rounded-[12px] border border-border-light bg-card">
          <div className="border-b border-border-light px-5 py-3">
            <span className="font-dm-sans text-[14px] font-semibold text-label">
              {commandes.length} commande{commandes.length !== 1 ? "s" : ""}
            </span>
          </div>
          {loading && <TableSkeleton cols={[1, 2, 3, 2, 1]} />}
          {error && <p className="p-5 font-inter text-sm text-danger">{error}</p>}
          {!loading && !error && (
            <DataTable
              columns={COLUMNS}
              data={commandes}
              keyExtractor={(c) => c.id}
              pagination={{ page: 1, total: 1, count: commandes.length }}
              empty={{
                icon: "shopping-cart",
                title: "Aucune commande",
                hint: "Créez une commande pour réapprovisionner votre stock.",
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
