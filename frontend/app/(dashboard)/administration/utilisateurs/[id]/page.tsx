"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import Icon from "@/components/ui/Icon";
import { useSaveToast } from "@/lib/useSaveToast";
import { useToast } from "@/components/ui/Toast";
import { useApi } from "@/lib/useApi";
import { api } from "@/lib/api";
import type { User } from "@/lib/types";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

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

export default function ModifierUtilisateurPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: user, loading } = useApi<User>(`/users/${id}`);
  const notifySaved = useSaveToast();
  const { error: toastError } = useToast();

  const [prenom, setPrenom] = useState("");
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [statut, setStatut] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setPrenom(user.prenom);
      setNom(user.nom);
      setEmail(user.email);
      setRole(user.role);
      setStatut(user.statut);
    }
  }, [user]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password || confirmPassword) {
      if (password.length < 6) return toastError("Le mot de passe doit faire au moins 6 caracteres");
      if (password !== confirmPassword) return toastError("Les mots de passe ne correspondent pas");
    }

    setSubmitting(true);
    try {
      await api.put(`/users/${id}`, {
        prenom,
        nom,
        email,
        role,
        statut,
        password: password || undefined,
      });
      notifySaved("Utilisateur mis a jour avec succes", "/administration");
    } catch (err) {
      toastError(err instanceof Error ? err.message : "Erreur");
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-surface">
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-border-light bg-card px-7">
        <div className="flex items-center gap-1.5">
          <Link href="/administration" className="font-inter text-sm text-placeholder transition-colors hover:text-subtle">Administration</Link>
          <span className="font-inter text-sm text-placeholder">/</span>
          <span className="font-dm-sans text-xl font-semibold text-label">Modifier utilisateur</span>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/administration" className="flex items-center gap-1.5 rounded-[6px] border border-border-light bg-surface px-3.5 py-2 font-dm-sans text-[13px] font-semibold text-subtle transition-colors hover:bg-border-light">
            Annuler
          </Link>
          <button type="submit" form="user-form" disabled={submitting} className="flex items-center gap-1.5 rounded-[6px] bg-primary px-3.5 py-2 font-dm-sans text-[13px] font-semibold text-white transition-colors hover:bg-primary-hover disabled:opacity-50">
            <Icon name="save" size={14} />
            Enregistrer
          </button>
        </div>
      </header>

      <div className="flex flex-1 items-start justify-center overflow-auto p-8">
        <div className="w-full max-w-[640px]">
          {loading ? (
            <p className="font-inter text-sm text-placeholder">Chargement...</p>
          ) : (
            <form id="user-form" onSubmit={handleSubmit} noValidate className="rounded-[12px] border border-border-light bg-card p-8">
              <h2 className="font-dm-sans text-base font-bold text-label">Modifier le compte</h2>
              <p className="mt-1 font-inter text-[13px] text-subtle">Mettez a jour les informations et le mot de passe de l'utilisateur.</p>

              <div className="mt-6 flex flex-col gap-4">
                <div className="flex gap-4">
                  <FormField label="Prenom *">
                    <input type="text" value={prenom} onChange={(e) => setPrenom(e.target.value)} required className={inputCls} />
                  </FormField>
                  <FormField label="Nom *">
                    <input type="text" value={nom} onChange={(e) => setNom(e.target.value)} required className={inputCls} />
                  </FormField>
                </div>

                <FormField label="Adresse email *">
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className={inputCls} />
                </FormField>

                <div className="flex gap-4">
                  <FormField label="Role *">
                    <Select value={role} onValueChange={(v) => setRole(v ?? "")}>
                      <SelectTrigger className="h-10 w-full rounded-[6px] border border-border bg-card"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Admin">Administrateur</SelectItem>
                        <SelectItem value="Responsable">Responsable ferme</SelectItem>
                        <SelectItem value="Vétérinaire">Vétérinaire</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormField>
                  <FormField label="Statut">
                    <Select value={statut} onValueChange={(v) => setStatut(v ?? "")}>
                      <SelectTrigger className="h-10 w-full rounded-[6px] border border-border bg-card"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Actif">Actif</SelectItem>
                        <SelectItem value="Inactif">Inactif</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormField>
                </div>

                <div className="rounded-[10px] border border-border-light bg-surface p-4">
                  <h3 className="font-dm-sans text-sm font-bold text-label">Changer le mot de passe</h3>
                  <p className="mt-1 font-inter text-[12px] text-subtle">Laissez ces champs vides pour conserver le mot de passe actuel.</p>
                  <div className="mt-4 flex gap-4">
                    <FormField label="Nouveau mot de passe" hint="Minimum 6 caracteres">
                      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" placeholder="Nouveau mot de passe" className={inputCls} />
                    </FormField>
                    <FormField label="Confirmer">
                      <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} autoComplete="new-password" placeholder="Confirmer" className={inputCls} />
                    </FormField>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-2.5">
                <Link href="/administration" className="flex items-center rounded-[6px] border border-border bg-surface px-4 py-2 font-dm-sans text-[13px] font-semibold text-subtle transition-colors hover:bg-border-light">
                  Annuler
                </Link>
                <button type="submit" disabled={submitting} className="flex items-center gap-1.5 rounded-[6px] bg-primary px-4 py-2 font-dm-sans text-[13px] font-semibold text-white transition-colors hover:bg-primary-hover disabled:opacity-50">
                  <Icon name="save" size={14} />
                  Enregistrer
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
