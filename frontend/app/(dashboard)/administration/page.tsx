"use client";

import { useState } from "react";
import Link from "next/link";
import Icon from "@/components/ui/Icon";
import DataTable, { Column } from "@/components/ui/DataTable";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";
import { userRoleStyle } from "@/lib/statusStyles";

interface Utilisateur {
  id: string;
  nom: string;
  email: string;
  role: "Admin" | "Responsable" | "Opérateur";
  statut: "Actif" | "Inactif";
  derniereConnexion: string;
}

const INITIAL_UTILISATEURS: Utilisateur[] = [
  { id: "USR-001", nom: "Youness Ailal", email: "youness@bovitrack.ma", role: "Admin", statut: "Actif", derniereConnexion: "02/06/2026" },
  { id: "USR-002", nom: "Salma Benali", email: "salma@bovitrack.ma", role: "Responsable", statut: "Actif", derniereConnexion: "01/06/2026" },
  { id: "USR-003", nom: "Mohamed Ouali", email: "mohamed@bovitrack.ma", role: "Opérateur", statut: "Actif", derniereConnexion: "31/05/2026" },
  { id: "USR-004", nom: "Hajar Idrissi", email: "hajar@bovitrack.ma", role: "Opérateur", statut: "Inactif", derniereConnexion: "15/04/2026" },
];

const ROLE_STYLE = userRoleStyle;

const TABS = ["Utilisateurs", "Races", "Alertes", "Paramètres"];

export default function AdministrationPage() {
  const { success } = useToast();
  const [activeTab, setActiveTab] = useState(0);
  const [utilisateurs, setUtilisateurs] = useState<Utilisateur[]>(INITIAL_UTILISATEURS);
  const [toDelete, setToDelete] = useState<Utilisateur | null>(null);

  function confirmDelete() {
    if (!toDelete) return;
    // TODO: DELETE /api/utilisateurs/:id
    setUtilisateurs((prev) => prev.filter((u) => u.id !== toDelete.id));
    success(`Utilisateur « ${toDelete.nom} » désactivé`);
    setToDelete(null);
  }

  const COLUMNS: Column<Utilisateur>[] = [
    { key: "id", label: "ID", width: "w-[100px]", render: (r) => <span className="font-inter text-[13px] font-semibold text-label">{r.id}</span> },
    {
      key: "nom",
      label: "Nom",
      width: "w-[180px]",
      render: (r) => (
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary font-dm-sans text-[11px] font-bold text-white">
            {r.nom.split(" ").map((n) => n[0]).join("").slice(0, 2)}
          </div>
          <span className="font-inter text-[13px] font-medium text-label">{r.nom}</span>
        </div>
      ),
    },
    { key: "email", label: "Email", width: "w-[220px]", render: (r) => <span className="font-inter text-[13px] text-subtle">{r.email}</span> },
    { key: "role", label: "Rôle", width: "w-[120px]", render: (r) => <span className={`inline-flex rounded-full px-2.5 py-1 font-inter text-[11px] font-semibold ${ROLE_STYLE[r.role]}`}>{r.role}</span> },
    { key: "statut", label: "Statut", width: "w-[90px]", render: (r) => <span className={`inline-flex rounded-full px-2.5 py-1 font-inter text-[11px] font-semibold ${r.statut === "Actif" ? "bg-success/10 text-success" : "bg-surface text-subtle"}`}>{r.statut}</span> },
    { key: "derniereConnexion", label: "Dernière connexion", width: "w-[160px]" },
    {
      key: "_actions", label: "Actions", width: "w-[70px]", align: "right",
      render: (r) => (
        <div className="flex items-center gap-3">
          <Link href={`/administration/utilisateurs/${encodeURIComponent(r.id)}`} className="text-placeholder hover:text-primary transition-colors"><Icon name="pencil" size={15} /></Link>
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
          <span className="font-inter text-sm text-placeholder">/ Gestion système</span>
        </div>
        {activeTab === 0 && (
          <Link href="/administration/utilisateurs/nouveau" className="flex items-center gap-1.5 rounded-[6px] bg-primary px-3.5 py-2 font-dm-sans text-[13px] font-semibold text-white hover:bg-primary-hover transition-colors">
            <Icon name="plus" size={14} />
            Nouvel utilisateur
          </Link>
        )}
        {activeTab === 1 && (
          <Link href="/administration/races/nouveau" className="flex items-center gap-1.5 rounded-[6px] bg-primary px-3.5 py-2 font-dm-sans text-[13px] font-semibold text-white hover:bg-primary-hover transition-colors">
            <Icon name="plus" size={14} />
            Nouvelle race
          </Link>
        )}
      </header>

      {/* Tabs */}
      <div className="flex h-12 shrink-0 items-center border-b border-border-light bg-card px-6">
        {TABS.map((tab, i) => (
          <button
            key={tab}
            onClick={() => setActiveTab(i)}
            className={`flex h-12 items-center px-4 font-inter text-sm transition-colors ${i === activeTab ? "border-b-2 border-primary font-semibold text-primary" : "font-normal text-placeholder hover:text-subtle"}`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="flex flex-1 flex-col gap-4 overflow-auto p-6">
        {activeTab === 0 && (
          <DataTable columns={COLUMNS} data={utilisateurs} keyExtractor={(u) => u.id} pagination={{ page: 1, total: 1, count: utilisateurs.length }} />
        )}
        {activeTab === 1 && (
          <div className="flex items-center justify-center flex-1 text-placeholder font-inter text-sm">
            <div className="flex flex-col items-center gap-3">
              <Icon name="settings" size={32} className="text-border-light" />
              <span>Configuration des races bovines</span>
              <Link href="/administration/races" className="font-inter text-sm text-primary hover:underline">Gérer les races →</Link>
            </div>
          </div>
        )}
        {activeTab === 2 && (
          <div className="flex items-center justify-center flex-1 text-placeholder font-inter text-sm">
            <div className="flex flex-col items-center gap-3">
              <Icon name="triangle-alert" size={32} className="text-border-light" />
              <span>Configuration des alertes automatiques</span>
              <Link href="/administration/alertes" className="font-inter text-sm text-primary hover:underline">Gérer les alertes →</Link>
            </div>
          </div>
        )}
        {activeTab === 3 && (
          <div className="flex items-center justify-center flex-1 text-placeholder font-inter text-sm">
            <div className="flex flex-col items-center gap-3">
              <Icon name="settings" size={32} className="text-border-light" />
              <span>Paramètres généraux de la ferme</span>
              <Link href="/administration/parametres" className="font-inter text-sm text-primary hover:underline">Accéder aux paramètres →</Link>
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={toDelete !== null}
        title="Désactiver l'utilisateur ?"
        message={`Le compte de « ${toDelete?.nom ?? ""} » sera désactivé et ne pourra plus se connecter.`}
        confirmLabel="Désactiver"
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
