"use client";

import { useState } from "react";
import Link from "next/link";
import Icon from "@/components/ui/Icon";
import DataTable, { Column } from "@/components/ui/DataTable";
import TableSkeleton from "@/components/ui/TableSkeleton";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import AdminTabs from "@/components/dashboard/AdminTabs";
import { useToast } from "@/components/ui/Toast";
import { userRoleStyle } from "@/lib/statusStyles";
import { useApi } from "@/lib/useApi";
import { api } from "@/lib/api";
import type { User } from "@/lib/types";

const ROLE_STYLE = userRoleStyle;

export default function AdministrationPage() {
  const { success, error: toastError } = useToast();
  const { data: utilisateurs, loading, error, refetch } = useApi<User[]>("/users");
  const [toDelete, setToDelete] = useState<User | null>(null);

  async function confirmDelete() {
    if (!toDelete) return;
    try {
      await api.del(`/users/${toDelete.id}`);
      success(`Utilisateur « ${toDelete.prenom} ${toDelete.nom} » désactivé`);
      refetch();
    } catch (err) {
      toastError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setToDelete(null);
    }
  }

  const COLUMNS: Column<User>[] = [
    {
      key: "nom", label: "Nom", width: "w-[200px]",
      render: (r) => (
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary font-dm-sans text-[11px] font-bold text-white">
            {`${r.prenom?.[0] ?? ""}${r.nom?.[0] ?? ""}`.toUpperCase()}
          </div>
          <span className="font-inter text-[13px] font-medium text-label">{r.prenom} {r.nom}</span>
        </div>
      ),
    },
    { key: "email", label: "Email", width: "w-[230px]", render: (r) => <span className="font-inter text-[13px] text-subtle">{r.email}</span> },
    { key: "role", label: "Rôle", width: "w-[140px]", render: (r) => <span className={`inline-flex rounded-full px-2.5 py-1 font-inter text-[11px] font-semibold ${ROLE_STYLE[r.role] ?? "bg-surface text-subtle"}`}>{r.role}</span> },
    { key: "statut", label: "Statut", width: "w-[90px]", render: (r) => <span className={`inline-flex rounded-full px-2.5 py-1 font-inter text-[11px] font-semibold ${r.statut === "Actif" ? "bg-success/10 text-success" : "bg-surface text-subtle"}`}>{r.statut}</span> },
    { key: "derniereConnexion", label: "Dernière connexion", width: "w-[160px]", render: (r) => <span className="font-inter text-[13px] text-subtle">{r.derniereConnexion ? new Date(r.derniereConnexion).toLocaleDateString("fr-FR") : "—"}</span> },
    {
      key: "_actions", label: "Actions", width: "w-[70px]", align: "right",
      render: (r) => (
        <div className="flex items-center justify-end gap-3">
          <Link href={`/administration/utilisateurs/${r.id}`} className="text-placeholder hover:text-primary transition-colors"><Icon name="pencil" size={15} /></Link>
          <button onClick={() => setToDelete(r)} title="Désactiver" className="text-placeholder hover:text-danger transition-colors"><Icon name="x" size={15} /></button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-surface">
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-border-light bg-card px-7">
        <div className="flex items-center gap-1.5">
          <span className="font-dm-sans text-xl font-semibold text-label">Administration</span>
          <span className="font-inter text-sm text-placeholder">/ Utilisateurs</span>
        </div>
        <Link href="/administration/utilisateurs/nouveau" className="flex items-center gap-1.5 rounded-[6px] bg-primary px-3.5 py-2 font-dm-sans text-[13px] font-semibold text-white hover:bg-primary-hover transition-colors">
          <Icon name="plus" size={14} />
          Nouvel utilisateur
        </Link>
      </header>

      <AdminTabs />

      <div className="flex flex-1 flex-col gap-4 overflow-auto p-6">
        {loading && <TableSkeleton cols={[2, 3, 2, 1, 2, 1]} />}
        {error && <p className="font-inter text-sm text-danger">{error}</p>}
        {!loading && !error && (
          <DataTable columns={COLUMNS} data={utilisateurs ?? []} keyExtractor={(u) => u.id} pagination={{ page: 1, total: 1, count: (utilisateurs ?? []).length }} empty={{ icon: "users", title: "Aucun utilisateur", hint: "Invitez les membres de votre équipe à accéder à BOVITRACK." }} />
        )}
      </div>

      <ConfirmDialog
        open={toDelete !== null}
        title="Désactiver l'utilisateur ?"
        message={`Le compte de « ${toDelete ? `${toDelete.prenom} ${toDelete.nom}` : ""} » sera désactivé et ne pourra plus se connecter.`}
        confirmLabel="Désactiver"
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
