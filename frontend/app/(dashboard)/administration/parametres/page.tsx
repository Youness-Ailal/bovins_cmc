"use client";

import { useEffect, useState } from "react";
import Icon from "@/components/ui/Icon";
import AdminTabs from "@/components/dashboard/AdminTabs";
import { useToast } from "@/components/ui/Toast";
import { useApi } from "@/lib/useApi";
import { api } from "@/lib/api";
import type { Parametres } from "@/lib/types";

function Section({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[12px] border border-border-light bg-card p-6">
      <div className="mb-4">
        <span className="font-dm-sans text-sm font-bold text-label">{title}</span>
        {desc && <p className="mt-0.5 font-inter text-[12px] text-subtle">{desc}</p>}
      </div>
      <div className="flex flex-col gap-4">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <label className="w-[220px] shrink-0 font-inter text-[13px] text-subtle">{label}</label>
      {children}
    </div>
  );
}

const inputCls = "h-10 flex-1 rounded-[6px] border border-border bg-card px-3 font-inter text-[13px] text-label placeholder:text-placeholder transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary";

type Form = Pick<Parametres, "nomFerme" | "siret" | "adresse" | "responsable" | "devise" | "unitePoids" | "frequencePesee" | "seuilIC" | "poidsMinVente" | "notifs">;

const EMPTY: Form = {
  nomFerme: "", siret: "", adresse: "", responsable: "", devise: "MAD", unitePoids: "kg",
  frequencePesee: 14, seuilIC: 7.5, poidsMinVente: 400,
  notifs: { email: true, rapport: false, pesee: true, stock: true },
};

export default function ParametresPage() {
  const { data, loading } = useApi<Parametres>("/parametres");
  const { success, error: toastError } = useToast();
  const [form, setForm] = useState<Form>(EMPTY);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (data) {
      setForm({
        nomFerme: data.nomFerme ?? "", siret: data.siret ?? "", adresse: data.adresse ?? "",
        responsable: data.responsable ?? "", devise: data.devise ?? "MAD", unitePoids: data.unitePoids ?? "kg",
        frequencePesee: data.frequencePesee ?? 14, seuilIC: data.seuilIC ?? 7.5, poidsMinVente: data.poidsMinVente ?? 400,
        notifs: data.notifs ?? EMPTY.notifs,
      });
    }
  }, [data]);

  function set<K extends keyof Form>(key: K, value: Form[K]) {
    setForm((p) => ({ ...p, [key]: value }));
  }
  function toggleNotif(key: keyof Form["notifs"]) {
    setForm((p) => ({ ...p, notifs: { ...p.notifs, [key]: !p.notifs[key] } }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put("/parametres", form);
      success("Paramètres enregistrés");
    } catch (err) {
      toastError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-surface">
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-border-light bg-card px-7">
        <div className="flex items-center gap-1.5">
          <span className="font-dm-sans text-xl font-semibold text-label">Administration</span>
          <span className="font-inter text-sm text-placeholder">/ Paramètres</span>
        </div>
        <button type="submit" form="parametres-form" disabled={saving} className="flex items-center gap-1.5 rounded-[6px] bg-primary px-3.5 py-2 font-dm-sans text-[13px] font-semibold text-white hover:bg-primary-hover transition-colors disabled:opacity-50">
          <Icon name="save" size={14} />
          Enregistrer les modifications
        </button>
      </header>

      <AdminTabs />

      <div className="flex flex-1 flex-col gap-5 overflow-auto p-6">
        {loading ? (
          <p className="font-inter text-sm text-placeholder">Chargement…</p>
        ) : (
          <>
            <form id="parametres-form" onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
              <Section title="Informations de la ferme" desc="Ces informations apparaissent dans les rapports exportés.">
                <Field label="Nom de l'exploitation"><input type="text" value={form.nomFerme} onChange={(e) => set("nomFerme", e.target.value)} className={inputCls} /></Field>
                <Field label="Identifiant officiel"><input type="text" value={form.siret} onChange={(e) => set("siret", e.target.value)} placeholder="Ex: 123-456-789" className={inputCls} /></Field>
                <Field label="Adresse"><input type="text" value={form.adresse} onChange={(e) => set("adresse", e.target.value)} placeholder="Adresse de la ferme" className={inputCls} /></Field>
                <Field label="Responsable principal"><input type="text" value={form.responsable} onChange={(e) => set("responsable", e.target.value)} className={inputCls} /></Field>
              </Section>

              <Section title="Paramètres de production" desc="Paramètres utilisés pour les calculs et les alertes automatiques.">
                <Field label="Devise"><input type="text" value={form.devise} onChange={(e) => set("devise", e.target.value)} className={inputCls} /></Field>
                <Field label="Unité de poids"><input type="text" value={form.unitePoids} onChange={(e) => set("unitePoids", e.target.value)} className={inputCls} /></Field>
                <Field label="Fréquence de pesée (jours)"><input type="number" value={form.frequencePesee} onChange={(e) => set("frequencePesee", Number(e.target.value))} min="1" className={inputCls} /></Field>
                <Field label="Seuil IC global (alerte si dépassé)"><input type="number" value={form.seuilIC} onChange={(e) => set("seuilIC", Number(e.target.value))} step="0.1" min="0" className={inputCls} /></Field>
                <Field label="Poids minimum de vente (kg)"><input type="number" value={form.poidsMinVente} onChange={(e) => set("poidsMinVente", Number(e.target.value))} min="0" className={inputCls} /></Field>
              </Section>

              <Section title="Notifications" desc="Choisissez les canaux et types de notifications à activer.">
                {(
                  [
                    { key: "email", label: "Alertes par email" },
                    { key: "rapport", label: "Rapport hebdomadaire automatique" },
                    { key: "pesee", label: "Rappels de pesée" },
                    { key: "stock", label: "Alertes de stock faible" },
                  ] as { key: keyof Form["notifs"]; label: string }[]
                ).map(({ key, label }) => (
                  <Field key={key} label={label}>
                    <button
                      type="button"
                      onClick={() => toggleNotif(key)}
                      className={`relative flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${form.notifs[key] ? "bg-primary" : "bg-border-ui"}`}
                    >
                      <span className={`absolute h-4 w-4 rounded-full bg-white shadow transition-transform ${form.notifs[key] ? "translate-x-6" : "translate-x-1"}`} />
                    </button>
                  </Field>
                ))}
              </Section>
            </form>

            <Section title="Zone de danger" desc="Actions irréversibles — procédez avec précaution.">
              <div className="rounded-[8px] border border-danger/30 bg-danger/5 p-4">
                <span className="font-inter text-[13px] font-semibold text-danger">Réinitialiser les données de démonstration</span>
                <p className="mt-1 font-inter text-[12px] text-subtle">Supprime uniquement les données de test injectées lors de l&apos;installation. Les données réelles ne sont pas affectées.</p>
                <button type="button" className="mt-3 flex items-center gap-1.5 rounded-[6px] border border-danger/50 bg-card px-3 py-1.5 font-dm-sans text-[13px] font-semibold text-danger hover:bg-danger/5 transition-colors">
                  <Icon name="x" size={14} />
                  Réinitialiser
                </button>
              </div>
            </Section>
          </>
        )}
      </div>
    </div>
  );
}
