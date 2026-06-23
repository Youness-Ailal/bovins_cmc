"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import Icon from "@/components/ui/Icon";
import { useApi } from "@/lib/useApi";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/Toast";
import type { StockArticle, Fournisseur } from "@/lib/types";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

const CAT_OPTIONS = ["Céréales", "Fourrages", "Concentrés", "Compléments", "Additifs", "Médicaments"];
const UNITE_OPTIONS = ["kg", "L", "unites", "sacs", "doses"];

export default function ModifierArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { error: toastError } = useToast();
  const { data: article, loading } = useApi<StockArticle>(`/stocks/${id}`);
  const { data: fournisseurs } = useApi<Fournisseur[]>("/fournisseurs");

  const [form, setForm] = useState({
    designation: "", reference: "", categorie: "", unite: "kg",
    seuil: "", prixUnitaire: "", datePeremption: "", fournisseur: "", notes: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!article) return;
    setForm({
      designation: article.designation,
      reference: article.reference,
      categorie: article.categorie,
      unite: article.unite,
      seuil: String(article.seuil),
      prixUnitaire: String(article.prixUnitaire),
      datePeremption: article.datePeremption ? article.datePeremption.slice(0, 10) : "",
      fournisseur: article.fournisseur?.id ?? "",
      notes: article.notes,
    });
  }, [article]);

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.designation.trim()) return toastError("La désignation est requise");
    setSaving(true);
    try {
      await api.put(`/stocks/${id}`, {
        designation: form.designation,
        reference: form.reference,
        categorie: form.categorie,
        unite: form.unite,
        seuil: Number(form.seuil) || 0,
        prixUnitaire: Number(form.prixUnitaire) || 0,
        datePeremption: form.datePeremption || null,
        fournisseur: form.fournisseur || null,
        notes: form.notes,
      });
      router.push(`/stocks/${id}`);
    } catch (err) {
      toastError(err instanceof Error ? err.message : "Erreur lors de la sauvegarde");
      setSaving(false);
    }
  }

  if (loading) return <div className="flex flex-1 items-center justify-center font-inter text-sm text-placeholder">Chargement…</div>;

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-surface">
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-border-light bg-card px-7">
        <div className="flex items-center gap-1.5">
          <Link href="/stocks" className="font-inter text-sm text-subtle hover:text-label transition-colors">Stocks</Link>
          <Icon name="chevron-right" size={14} className="text-placeholder" />
          <Link href={`/stocks/${id}`} className="font-inter text-sm text-subtle hover:text-label transition-colors">{article?.designation}</Link>
          <Icon name="chevron-right" size={14} className="text-placeholder" />
          <span className="font-dm-sans text-xl font-semibold text-label">Modifier</span>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/stocks/${id}`} className="flex items-center gap-1.5 rounded-[6px] border border-border-light bg-surface px-3.5 py-2 font-dm-sans text-[13px] font-semibold text-subtle hover:bg-border-light transition-colors">
            Annuler
          </Link>
          <button
            type="submit" form="modifier-form" disabled={saving}
            className="flex items-center gap-1.5 rounded-[6px] bg-primary px-3.5 py-2 font-dm-sans text-[13px] font-semibold text-white hover:bg-primary/90 disabled:opacity-60 transition-colors"
          >
            <Icon name="save" size={14} />
            {saving ? "Sauvegarde…" : "Sauvegarder"}
          </button>
        </div>
      </header>

      <div className="flex flex-1 items-start justify-center overflow-auto p-8">
        <form id="modifier-form" onSubmit={handleSubmit} className="w-full max-w-[640px] flex flex-col gap-5">
          <div className="rounded-[12px] border border-border-light bg-card p-6">
            <h2 className="font-dm-sans text-base font-bold text-label">Informations de l'article</h2>
            <div className="mt-5 flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-inter text-[12px] font-medium text-subtle">Désignation *</label>
                  <input
                    type="text" value={form.designation} onChange={(e) => set("designation", e.target.value)}
                    className="h-10 rounded-[6px] border border-border-light bg-surface px-3 font-inter text-[13px] text-label focus:border-primary focus:outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-inter text-[12px] font-medium text-subtle">Référence</label>
                  <input
                    type="text" value={form.reference} onChange={(e) => set("reference", e.target.value)}
                    placeholder="STK-001"
                    className="h-10 rounded-[6px] border border-border-light bg-surface px-3 font-inter text-[13px] text-label placeholder:text-placeholder focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-inter text-[12px] font-medium text-subtle">Catégorie</label>
                  <Select value={form.categorie} onValueChange={(v) => v && set("categorie", v)}>
                    <SelectTrigger className="h-10 rounded-[6px] border border-border-light bg-surface">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CAT_OPTIONS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-inter text-[12px] font-medium text-subtle">Unité</label>
                  <Select value={form.unite} onValueChange={(v) => v && set("unite", v)}>
                    <SelectTrigger className="h-10 rounded-[6px] border border-border-light bg-surface">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {UNITE_OPTIONS.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-inter text-[12px] font-medium text-subtle">Seuil d'alerte ({form.unite})</label>
                  <input
                    type="number" min="0" step="0.01" value={form.seuil} onChange={(e) => set("seuil", e.target.value)}
                    className="h-10 rounded-[6px] border border-border-light bg-surface px-3 font-inter text-[13px] text-label focus:border-primary focus:outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-inter text-[12px] font-medium text-subtle">Prix unitaire (MAD/{form.unite})</label>
                  <input
                    type="number" min="0" step="0.01" value={form.prixUnitaire} onChange={(e) => set("prixUnitaire", e.target.value)}
                    className="h-10 rounded-[6px] border border-border-light bg-surface px-3 font-inter text-[13px] text-label focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-inter text-[12px] font-medium text-subtle">Date de péremption</label>
                  <input
                    type="date" value={form.datePeremption} onChange={(e) => set("datePeremption", e.target.value)}
                    className="h-10 rounded-[6px] border border-border-light bg-surface px-3 font-inter text-[13px] text-label focus:border-primary focus:outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-inter text-[12px] font-medium text-subtle">Fournisseur</label>
                  <select
                    value={form.fournisseur} onChange={(e) => set("fournisseur", e.target.value)}
                    className="h-10 rounded-[6px] border border-border-light bg-surface px-3 font-inter text-[13px] text-label focus:border-primary focus:outline-none"
                  >
                    <option value="">— Aucun —</option>
                    {(fournisseurs ?? []).map((f) => (
                      <option key={f.id} value={f.id}>{f.nom} ({f.type})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-inter text-[12px] font-medium text-subtle">Notes</label>
                <textarea
                  rows={3} value={form.notes} onChange={(e) => set("notes", e.target.value)}
                  placeholder="Observations…"
                  className="resize-none rounded-[6px] border border-border-light bg-surface px-3 py-2 font-inter text-[13px] text-label placeholder:text-placeholder focus:border-primary focus:outline-none"
                />
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
