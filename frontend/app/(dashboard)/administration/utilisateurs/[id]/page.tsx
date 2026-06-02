"use client";

import { use } from "react";
import Link from "next/link";
import Icon from "@/components/ui/Icon";
import { useSaveToast } from "@/lib/useSaveToast";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="font-inter text-xs font-medium text-label">{label}</label>
      {children}
    </div>
  );
}

const inputCls = "h-10 w-full rounded-[6px] border border-border bg-card px-3 font-inter text-[13px] text-label placeholder:text-placeholder transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary";

const USERS: Record<string, { prenom: string; nom: string; email: string; role: string; statut: string }> = {
  "USR-001": { prenom: "Youness", nom: "Ailal", email: "youness@bovitrack.ma", role: "admin", statut: "actif" },
  "USR-002": { prenom: "Salma", nom: "Benali", email: "salma@bovitrack.ma", role: "responsable", statut: "actif" },
  "USR-003": { prenom: "Mohamed", nom: "Ouali", email: "mohamed@bovitrack.ma", role: "operateur", statut: "actif" },
  "USR-004": { prenom: "Hajar", nom: "Idrissi", email: "hajar@bovitrack.ma", role: "operateur", statut: "inactif" },
};

export default function ModifierUtilisateurPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const user = USERS[id] ?? { prenom: "", nom: "", email: "", role: "operateur", statut: "actif" };

  const notifySaved = useSaveToast();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // TODO: PUT /api/utilisateurs/:id
    notifySaved("Utilisateur mis à jour avec succès", "/administration");
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-surface">
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-border-light bg-card px-7">
        <div className="flex items-center gap-1.5">
          <Link href="/administration" className="font-inter text-sm text-placeholder hover:text-subtle transition-colors">Administration</Link>
          <span className="font-inter text-sm text-placeholder">/</span>
          <span className="font-dm-sans text-xl font-semibold text-label">Modifier utilisateur</span>
          <span className="font-inter text-sm text-placeholder">/ {id}</span>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/administration" className="flex items-center gap-1.5 rounded-[6px] border border-border-light bg-surface px-3.5 py-2 font-dm-sans text-[13px] font-semibold text-subtle hover:bg-border-light transition-colors">
            Annuler
          </Link>
          <button type="submit" form="user-form" className="flex items-center gap-1.5 rounded-[6px] bg-primary px-3.5 py-2 font-dm-sans text-[13px] font-semibold text-white hover:bg-primary-hover transition-colors">
            <Icon name="save" size={14} />
            Enregistrer
          </button>
        </div>
      </header>

      <div className="flex flex-1 items-start justify-center overflow-auto p-8">
        <div className="w-full max-w-[560px]">
          <form id="user-form" onSubmit={handleSubmit} noValidate className="rounded-[12px] border border-border-light bg-card p-8">
            <h2 className="font-dm-sans text-base font-bold text-label">Modifier le compte</h2>
            <p className="mt-1 font-inter text-[13px] text-subtle">Mettez à jour les informations de l&apos;utilisateur {id}.</p>

            <div className="mt-6 flex flex-col gap-4">
              <div className="flex gap-4">
                <FormField label="Prénom *">
                  <input type="text" name="prenom" defaultValue={user.prenom} required className={inputCls} />
                </FormField>
                <FormField label="Nom *">
                  <input type="text" name="nom" defaultValue={user.nom} required className={inputCls} />
                </FormField>
              </div>
              <FormField label="Adresse email *">
                <input type="email" name="email" defaultValue={user.email} required className={inputCls} />
              </FormField>
              <FormField label="Rôle *">
                <Select name="role" defaultValue={user.role}>
                  <SelectTrigger className="h-10 w-full rounded-[6px] border border-border bg-card">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrateur</SelectItem>
                    <SelectItem value="responsable">Responsable ferme</SelectItem>
                    <SelectItem value="operateur">Opérateur</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
              <FormField label="Statut">
                <Select name="statut" defaultValue={user.statut}>
                  <SelectTrigger className="h-10 w-full rounded-[6px] border border-border bg-card">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="actif">Actif</SelectItem>
                    <SelectItem value="inactif">Inactif</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
              <div className="rounded-[8px] bg-surface p-4">
                <span className="font-inter text-[11px] font-semibold uppercase tracking-wide text-placeholder">Réinitialiser le mot de passe</span>
                <p className="mt-1 font-inter text-[12px] text-subtle">Un email de réinitialisation sera envoyé à l&apos;adresse ci-dessus.</p>
                <button type="button" className="mt-3 flex items-center gap-1.5 rounded-[6px] border border-border-light bg-card px-3 py-1.5 font-dm-sans text-[13px] font-semibold text-subtle hover:bg-border-light transition-colors">
                  <Icon name="arrow-left" size={13} />
                  Envoyer le lien
                </button>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2.5">
              <Link href="/administration" className="flex items-center rounded-[6px] border border-border bg-surface px-4 py-2 font-dm-sans text-[13px] font-semibold text-subtle hover:bg-border-light transition-colors">
                Annuler
              </Link>
              <button type="submit" className="flex items-center gap-1.5 rounded-[6px] bg-primary px-4 py-2 font-dm-sans text-[13px] font-semibold text-white hover:bg-primary-hover transition-colors">
                <Icon name="save" size={14} />
                Enregistrer
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
