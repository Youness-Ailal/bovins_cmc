"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Icon from "@/components/ui/Icon";
import Badge from "@/components/ui/Badge";
import DataTable, { Column } from "@/components/ui/DataTable";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";

interface Article {
  id: string;
  designation: string;
  categorie: string;
  quantite: string;
  unite: string;
  seuil: string;
  peremption: string;
  statut: "OK" | "Faible" | "Critique";
}

const INITIAL_ARTICLES: Article[] = [
  { id: "STK-001", designation: "Orge", categorie: "Céréales", quantite: "120", unite: "kg", seuil: "200", peremption: "—", statut: "Faible" },
  { id: "STK-002", designation: "Foin de luzerne", categorie: "Fourrages", quantite: "850", unite: "kg", seuil: "500", peremption: "—", statut: "OK" },
  { id: "STK-003", designation: "Tourteau de soja", categorie: "Concentrés", quantite: "45", unite: "kg", seuil: "100", peremption: "—", statut: "Critique" },
  { id: "STK-004", designation: "Minéraux bovins", categorie: "Compléments", quantite: "30", unite: "kg", seuil: "25", peremption: "12/2026", statut: "OK" },
  { id: "STK-005", designation: "Mélasse", categorie: "Additifs", quantite: "60", unite: "L", seuil: "50", peremption: "06/2026", statut: "OK" },
];

const STATUT_VARIANT: Record<Article["statut"], string> = {
  OK: "sain",
  Faible: "phase-engraissement",
  Critique: "malade",
};

export default function StocksPage() {
  const router = useRouter();
  const { success } = useToast();
  const [search, setSearch] = useState("");
  const [articles, setArticles] = useState<Article[]>(INITIAL_ARTICLES);
  const [toDelete, setToDelete] = useState<Article | null>(null);

  function confirmDelete() {
    if (!toDelete) return;
    // TODO: DELETE /api/stocks/:id
    setArticles((prev) => prev.filter((a) => a.id !== toDelete.id));
    success(`Article « ${toDelete.designation} » supprimé`);
    setToDelete(null);
  }

  const COLUMNS: Column<Article>[] = [
    { key: "id", label: "Référence", width: "w-[110px]", render: (r) => <span className="font-inter text-[13px] font-semibold text-label">{r.id}</span> },
    { key: "designation", label: "Désignation", width: "w-[180px]" },
    { key: "categorie", label: "Catégorie", width: "w-[130px]" },
    {
      key: "quantite",
      label: "Quantité",
      width: "w-[100px]",
      render: (r) => <span className="font-inter text-[13px] text-label">{r.quantite} {r.unite}</span>,
    },
    { key: "seuil", label: "Seuil min.", width: "w-[100px]", render: (r) => <span className="font-inter text-[13px] text-subtle">{r.seuil} {r.unite}</span> },
    { key: "peremption", label: "Péremption", width: "w-[110px]" },
    {
      key: "statut",
      label: "Statut",
      width: "w-[90px]",
      render: (r) => <Badge variant={STATUT_VARIANT[r.statut] as Parameters<typeof Badge>[0]["variant"]}>{r.statut}</Badge>,
    },
    {
      key: "_actions",
      label: "Actions",
      width: "w-[70px]",
      align: "right",
      render: (r) => (
        <div className="flex items-center gap-3">
          <button onClick={() => router.push("/stocks/mouvement")} title="Mouvement" className="text-placeholder hover:text-primary transition-colors"><Icon name="pencil" size={15} /></button>
          <button onClick={() => setToDelete(r)} title="Supprimer" className="text-placeholder hover:text-danger transition-colors"><Icon name="x" size={15} /></button>
        </div>
      ),
    },
  ];

  const filtered = articles.filter(
    (a) =>
      a.designation.toLowerCase().includes(search.toLowerCase()) ||
      a.categorie.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-surface">
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-border-light bg-card px-7">
        <div className="flex items-center gap-1.5">
          <span className="font-dm-sans text-xl font-semibold text-label">Stocks</span>
          <span className="font-inter text-sm text-placeholder">/ Aliments & Consommables</span>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/stocks/mouvement"
            className="flex items-center gap-1.5 rounded-[6px] border border-border-light bg-surface px-3.5 py-2 font-dm-sans text-[13px] font-semibold text-subtle hover:bg-border-light transition-colors"
          >
            <Icon name="trending-up" size={14} />
            Mouvement
          </Link>
          <Link
            href="/stocks/nouveau"
            className="flex items-center gap-1.5 rounded-[6px] bg-primary px-3.5 py-2 font-dm-sans text-[13px] font-semibold text-white hover:bg-primary-hover transition-colors"
          >
            <Icon name="plus" size={14} />
            Nouvel article
          </Link>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-4 overflow-auto p-6">
        {/* Alert strip */}
        <div className="flex items-center gap-3 rounded-[8px] border border-warning/30 bg-warning/5 px-4 py-3">
          <Icon name="triangle-alert" size={16} className="shrink-0 text-warning" />
          <span className="font-inter text-[13px] text-warning">
            3 articles sous seuil · 1 proche péremption —{" "}
            <Link href="/stocks/historique" className="font-semibold underline">Voir historique →</Link>
          </span>
        </div>

        {/* Filter bar */}
        <div className="flex items-center gap-2 rounded-[8px] border border-border-light bg-card p-3">
          <div className="flex items-center gap-1.5 rounded-[6px] border border-border-light bg-surface px-3 py-1.5">
            <Icon name="search" size={14} className="text-placeholder" />
            <input
              type="text"
              placeholder="Rechercher un article…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-48 bg-transparent font-inter text-[13px] text-label placeholder:text-placeholder focus:outline-none"
            />
          </div>
          {["Catégorie", "Statut"].map((f) => (
            <button key={f} className="flex items-center gap-1 rounded-[6px] border border-border-light px-2.5 py-1.5 font-inter text-[13px] text-subtle hover:bg-surface transition-colors">
              {f}<Icon name="chevron-down" size={12} className="text-placeholder" />
            </button>
          ))}
          <Link href="/stocks/historique" className="ml-auto flex items-center gap-1.5 rounded-[6px] border border-border-light px-3 py-1.5 font-inter text-[13px] text-subtle hover:bg-surface transition-colors">
            <Icon name="trending-down" size={14} />
            Historique
          </Link>
        </div>

        <DataTable
          columns={COLUMNS}
          data={filtered}
          keyExtractor={(a) => a.id}
          pagination={{ page: 1, total: 1, count: articles.length }}
        />
      </div>

      <ConfirmDialog
        open={toDelete !== null}
        title="Supprimer l'article ?"
        message={`L'article « ${toDelete?.designation ?? ""} » sera retiré du stock. Cette action est irréversible.`}
        confirmLabel="Supprimer"
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
