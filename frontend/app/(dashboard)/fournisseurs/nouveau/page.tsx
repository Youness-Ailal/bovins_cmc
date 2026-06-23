"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Icon from "@/components/ui/Icon";
import { api } from "@/lib/api";

const TYPES = ["Aliments", "Médicaments", "Équipements", "Autre"] as const;
const REGIONS = [
  "Casablanca", "Rabat", "Meknès", "Settat", "Marrakech",
  "Agadir", "Fès", "Tanger", "Oujda", "Autre",
];

export default function NouveauFournisseurPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    nom: "",
    contact: "",
    region: "",
    type: "Aliments" as typeof TYPES[number],
    notes: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nom.trim()) { setError("Le nom est requis"); return; }
    setSaving(true);
    setError(null);
    try {
      await api.post("/fournisseurs", form);
      router.push("/fournisseurs");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur lors de la création");
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-surface">
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-border-light bg-card px-7">
        <div className="flex items-center gap-1.5">
          <Link href="/fournisseurs" className="font-inter text-sm text-subtle hover:text-label transition-colors">
            Fournisseurs
          </Link>
          <Icon name="chevron-right" size={14} className="text-placeholder" />
          <span className="font-dm-sans text-xl font-semibold text-label">Nouveau fournisseur</span>
        </div>
        <Link
          href="/fournisseurs"
          className="flex items-center gap-1.5 rounded-[6px] border border-border-light bg-surface px-3.5 py-2 font-dm-sans text-[13px] font-semibold text-subtle hover:bg-border-light transition-colors"
        >
          <Icon name="x" size={14} />
          Annuler
        </Link>
      </header>

      <div className="flex flex-1 overflow-auto p-6">
        <form onSubmit={handleSubmit} className="w-full max-w-xl flex flex-col gap-5">
          {error && (
            <div className="flex items-center gap-2 rounded-[8px] border border-danger/30 bg-danger/5 px-4 py-3">
              <Icon name="alert-circle" size={15} className="text-danger" />
              <span className="font-inter text-[13px] text-danger">{error}</span>
            </div>
          )}

          <div className="flex flex-col gap-4 rounded-[12px] border border-border-light bg-card p-5">
            <span className="font-dm-sans text-[15px] font-semibold text-label">Informations générales</span>

            <div className="flex flex-col gap-1.5">
              <label className="font-inter text-[12px] font-medium text-subtle">Nom *</label>
              <input
                type="text"
                value={form.nom}
                onChange={(e) => set("nom", e.target.value)}
                placeholder="Nom du fournisseur"
                className="h-10 rounded-[6px] border border-border-light bg-surface px-3 font-inter text-[13px] text-label placeholder:text-placeholder focus:border-primary focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-inter text-[12px] font-medium text-subtle">Type</label>
              <div className="flex flex-wrap gap-2">
                {TYPES.map((t) => (
                  <button
                    key={t} type="button"
                    onClick={() => set("type", t)}
                    className={`rounded-full px-3 py-1 font-inter text-[12px] font-semibold transition-colors ${
                      form.type === t
                        ? "bg-primary text-white"
                        : "border border-border-light bg-surface text-subtle hover:bg-border-light"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="font-inter text-[12px] font-medium text-subtle">Contact</label>
                <input
                  type="text"
                  value={form.contact}
                  onChange={(e) => set("contact", e.target.value)}
                  placeholder="Téléphone ou email"
                  className="h-10 rounded-[6px] border border-border-light bg-surface px-3 font-inter text-[13px] text-label placeholder:text-placeholder focus:border-primary focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-inter text-[12px] font-medium text-subtle">Région</label>
                <select
                  value={form.region}
                  onChange={(e) => set("region", e.target.value)}
                  className="h-10 rounded-[6px] border border-border-light bg-surface px-3 font-inter text-[13px] text-label focus:border-primary focus:outline-none"
                >
                  <option value="">Sélectionner…</option>
                  {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-inter text-[12px] font-medium text-subtle">Notes</label>
              <textarea
                value={form.notes}
                onChange={(e) => set("notes", e.target.value)}
                rows={3}
                placeholder="Remarques, conditions de livraison…"
                className="rounded-[6px] border border-border-light bg-surface px-3 py-2 font-inter text-[13px] text-label placeholder:text-placeholder focus:border-primary focus:outline-none resize-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="h-11 rounded-[8px] bg-primary font-dm-sans text-[14px] font-semibold text-white hover:bg-primary/90 disabled:opacity-60 transition-colors"
          >
            {saving ? "Enregistrement…" : "Enregistrer le fournisseur"}
          </button>
        </form>
      </div>
    </div>
  );
}
