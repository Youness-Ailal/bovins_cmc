"use client";

import { useState } from "react";
import Link from "next/link";
import Icon from "@/components/ui/Icon";
import { useSaveToast } from "@/lib/useSaveToast";
import { useToast } from "@/components/ui/Toast";
import { api } from "@/lib/api";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

const ROLE_MAP: Record<string, string> = {
  admin: "Admin",
  responsable: "Responsable",
  veterinaire: "Vétérinaire",
};

function FormField({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="font-inter text-xs font-medium text-label">{label}</label>
      {children}
      {hint && <span className="font-inter text-[11px] text-placeholder">{hint}</span>}
    </div>
  );
}

const inputCls = "h-10 w-full rounded-[6px] border border-border bg-card px-3 font-inter text-[13px] text-label placeholder:text-placeholder transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary";

export default function NouvelUtilisateurPage() {
  const [sendEmail, setSendEmail] = useState(true);
  const [role, setRole] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const notifySaved = useSaveToast();
  const { error: toastError } = useToast();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget as HTMLFormElement);
    const password = String(fd.get("password") || "");
    if (password !== String(fd.get("confirmPassword") || "")) return toastError("Les mots de passe ne correspondent pas");
    if (password.length < 6) return toastError("Le mot de passe doit faire au moins 6 caractères");
    if (!role) return toastError("Le rôle est requis");
    setSubmitting(true);
    try {
      await api.post("/users", {
        prenom: String(fd.get("prenom") || ""),
        nom: String(fd.get("nom") || ""),
        email: String(fd.get("email") || ""),
        password,
        role: ROLE_MAP[role],
      });
      notifySaved("Compte créé avec succès", "/administration");
    } catch (err) {
      toastError(err instanceof Error ? err.message : "Erreur");
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-surface">
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-border-light bg-card px-7">
        <div className="flex items-center gap-1.5">
          <Link href="/administration" className="font-inter text-sm text-placeholder hover:text-subtle transition-colors">Administration</Link>
          <span className="font-inter text-sm text-placeholder">/</span>
          <span className="font-dm-sans text-xl font-semibold text-label">Nouvel utilisateur</span>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/administration" className="flex items-center gap-1.5 rounded-[6px] border border-border-light bg-surface px-3.5 py-2 font-dm-sans text-[13px] font-semibold text-subtle hover:bg-border-light transition-colors">
            Annuler
          </Link>
          <button type="submit" form="user-create-form" className="flex items-center gap-1.5 rounded-[6px] bg-primary px-3.5 py-2 font-dm-sans text-[13px] font-semibold text-white hover:bg-primary-hover transition-colors">
            <Icon name="save" size={14} />
            Créer le compte
          </button>
        </div>
      </header>

      <div className="flex flex-1 items-start justify-center overflow-auto p-8">
        <div className="w-full max-w-[560px]">
          <form id="user-create-form" onSubmit={handleSubmit} noValidate autoComplete="off" className="rounded-[12px] border border-border-light bg-card p-8">
            <h2 className="font-dm-sans text-base font-bold text-label">Informations du compte</h2>
            <p className="mt-1 font-inter text-[13px] text-subtle">Créez un accès pour un nouvel intervenant.</p>

            <div className="mt-6 flex flex-col gap-4">
              <div className="flex gap-4">
                <FormField label="Prénom *">
                  <input type="text" name="prenom" placeholder="Ex: Youness" required autoComplete="given-name" className={inputCls} />
                </FormField>
                <FormField label="Nom *">
                  <input type="text" name="nom" placeholder="Ex: Ailal" required autoComplete="family-name" className={inputCls} />
                </FormField>
              </div>
              <FormField label="Adresse email *" hint="Sera utilisée comme identifiant de connexion">
                <input type="email" name="email" placeholder="nom@bovitrack.ma" required autoComplete="email" className={inputCls} />
              </FormField>
              <FormField label="Rôle *">
                <Select value={role} onValueChange={(v) => setRole(v ?? "")}>
                  <SelectTrigger className="h-10 w-full rounded-[6px] border border-border bg-card">
                    <SelectValue placeholder="Sélectionner un rôle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrateur — accès total</SelectItem>
                    <SelectItem value="responsable">Responsable ferme — lecture + écriture</SelectItem>
                    <SelectItem value="veterinaire">Vétérinaire — santé & traitements</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
              <div className="flex gap-4">
                <FormField label="Mot de passe *" hint="Min. 8 caractères, 1 majuscule, 1 chiffre">
                  <input type="password" name="password" placeholder="••••••••" required autoComplete="new-password" className={inputCls} />
                </FormField>
                <FormField label="Confirmer *">
                  <input type="password" name="confirmPassword" placeholder="••••••••" required autoComplete="new-password" className={inputCls} />
                </FormField>
              </div>
              <button
                type="button"
                onClick={() => setSendEmail((v) => !v)}
                className={`flex items-center gap-2.5 rounded-[8px] border px-3 py-2.5 transition-colors ${sendEmail ? "border-primary bg-primary-light" : "border-border-light bg-surface"}`}
              >
                <div className={`flex h-4 w-4 items-center justify-center rounded-[3px] border transition-colors ${sendEmail ? "border-primary bg-primary" : "border-border"}`}>
                  {sendEmail && <Icon name="check" size={11} className="text-white" />}
                </div>
                <span className={`font-inter text-[13px] ${sendEmail ? "text-primary font-medium" : "text-subtle"}`}>
                  Envoyer les identifiants par email
                </span>
              </button>
            </div>

            <div className="mt-6 flex justify-end gap-2.5">
              <Link href="/administration" className="flex items-center rounded-[6px] border border-border bg-surface px-4 py-2 font-dm-sans text-[13px] font-semibold text-subtle hover:bg-border-light transition-colors">
                Annuler
              </Link>
              <button type="submit" className="flex items-center gap-1.5 rounded-[6px] bg-primary px-4 py-2 font-dm-sans text-[13px] font-semibold text-white hover:bg-primary-hover transition-colors">
                <Icon name="save" size={14} />
                Créer le compte
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
