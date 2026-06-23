"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import Icon from "@/components/ui/Icon";
import Badge from "@/components/ui/Badge";
import { useApi } from "@/lib/useApi";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";
import type { Parcelle, Ration, Animal } from "@/lib/types";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

const PHASE_VARIANT: Record<string, string> = {
  Veau: "phase-croissance", Croissance: "phase-croissance", Engraissement: "phase-engraissement", Finition: "phase-finition",
};
const SANTE_VARIANT: Record<string, string> = {
  Sain: "sain", "En traitement": "phase-engraissement", Malade: "malade",
};

function StatCard({ label, value, valueColor, valueSizeClass }: { label: string; value: string; valueColor: string; valueSizeClass?: string }) {
  return (
    <div className="flex flex-1 flex-col gap-1.5 rounded-[10px] border border-border-light bg-card p-4">
      <span className="font-inter text-[11px] font-bold uppercase tracking-wide text-placeholder">{label}</span>
      <span className={`${valueSizeClass ?? "font-dm-sans text-[22px] font-bold"} ${valueColor}`}>{value}</span>
    </div>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="font-inter text-xs font-semibold text-subtle">{label}</label>
      {children}
    </div>
  );
}

export default function FicheParcellePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: parcelle, loading, error, refetch } = useApi<Parcelle>(`/parcelles/${id}`);
  const { data: rations } = useApi<Ration[]>("/rations");
  const { success, error: toastError } = useToast();

  const [nom, setNom] = useState("");
  const [capacite, setCapacite] = useState("");
  const [ration, setRation] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (parcelle) {
      setNom(parcelle.nom);
      setCapacite(String(parcelle.capaciteMax));
      setRation(parcelle.ration?.id ?? "");
    }
  }, [parcelle]);

  async function save() {
    setSaving(true);
    try {
      await api.put(`/parcelles/${id}`, { nom, capaciteMax: Number(capacite) || 0, ration: ration || null });
      success("Parcelle mise à jour");
      refetch();
    } catch (err) {
      toastError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="flex flex-1 items-center justify-center bg-surface font-inter text-sm text-placeholder">Chargement…</div>;
  if (error || !parcelle) return <div className="flex flex-1 items-center justify-center bg-surface font-inter text-sm text-danger">{error || "Parcelle introuvable"}</div>;

  const animaux = parcelle.animaux ?? [];

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-surface">
      <div className="flex flex-1 flex-col gap-5 overflow-auto p-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/parcelles" className="font-inter text-sm text-placeholder hover:text-subtle transition-colors">Parcelles /</Link>
            <span className="font-dm-sans text-2xl font-bold text-label">{parcelle.nom}</span>
          </div>
          <div className="flex items-center rounded-full bg-info/10 px-3.5 py-1.5">
            <span className="font-inter text-[13px] font-semibold text-info">Capacité max : {parcelle.capaciteMax} animaux</span>
          </div>
        </div>

        <div className="flex gap-4">
          <StatCard label="OCCUPATION" value={`${parcelle.occupation ?? 0} %`} valueColor={(parcelle.occupation ?? 0) >= 90 ? "text-danger" : (parcelle.occupation ?? 0) >= 70 ? "text-warning" : "text-success"} />
          <StatCard label="RATION ACTUELLE" value={parcelle.ration?.nom ?? "—"} valueColor="text-label" valueSizeClass="font-dm-sans text-[15px] font-semibold" />
          <StatCard label="NB ANIMAUX" value={String(parcelle.nbActuels ?? 0)} valueColor="text-label" />
        </div>

        <div className="flex flex-1 gap-5">
          <div className="flex flex-1 overflow-hidden rounded-[12px] border border-border-light bg-card">
            <div className="flex w-full flex-col">
              <div className="flex items-center bg-surface px-5" style={{ height: 44 }}>
                <span className="w-[130px] shrink-0 font-inter text-[11px] font-bold uppercase tracking-wide text-placeholder">Identifiant</span>
                <span className="w-[110px] shrink-0 font-inter text-[11px] font-bold uppercase tracking-wide text-placeholder">Race</span>
                <span className="w-[120px] shrink-0 font-inter text-[11px] font-bold uppercase tracking-wide text-placeholder">Phase</span>
                <span className="w-[120px] shrink-0 font-inter text-[11px] font-bold uppercase tracking-wide text-placeholder">Santé</span>
                <span className="flex-1 font-inter text-[11px] font-bold uppercase tracking-wide text-placeholder">Action</span>
              </div>
              {animaux.length === 0 && <div className="py-8 text-center font-inter text-[13px] text-placeholder">Aucun animal dans cette parcelle</div>}
              {animaux.map((a: Animal, i) => (
                <div key={a.id} className={`flex items-center px-5 ${i < animaux.length - 1 ? "border-b border-border-light" : ""}`} style={{ height: 52 }}>
                  <span className="w-[130px] shrink-0 font-inter text-[13px] font-medium text-label">{a.identifiant}</span>
                  <span className="w-[110px] shrink-0 font-inter text-[13px] text-subtle">{a.race?.nom ?? "—"}</span>
                  <div className="flex w-[120px] shrink-0 items-center"><Badge variant={PHASE_VARIANT[a.phase] as Parameters<typeof Badge>[0]["variant"]} className="text-[10px]">{a.phase}</Badge></div>
                  <div className="flex w-[120px] shrink-0 items-center"><Badge variant={SANTE_VARIANT[a.etatSante] as Parameters<typeof Badge>[0]["variant"]} className="text-[10px]">{a.etatSante}</Badge></div>
                  <div className="flex flex-1 items-center"><Link href={`/animaux/${a.id}`} className="text-placeholder hover:text-primary transition-colors"><Icon name="eye" size={13} /></Link></div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex w-[300px] shrink-0 flex-col gap-4 rounded-[12px] border border-border-light bg-card p-5">
            <span className="font-dm-sans text-base font-bold text-label">Modifier la parcelle</span>
            <FormField label="Nom de la parcelle">
              <input type="text" value={nom} onChange={(e) => setNom(e.target.value)} className="h-10 w-full rounded-[8px] border border-border bg-card px-3 font-inter text-[13px] text-label focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
            </FormField>
            <FormField label="Capacité maximale">
              <input type="number" value={capacite} onChange={(e) => setCapacite(e.target.value)} className="h-10 w-full rounded-[8px] border border-border bg-card px-3 font-inter text-[13px] text-label focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
            </FormField>
            <FormField label="Ration associée">
              <Select value={ration} onValueChange={(v) => setRation(v ?? "")}>
                <SelectTrigger className="h-10 w-full rounded-[8px] border border-border bg-card font-inter text-[13px] text-label"><SelectValue placeholder="Aucune" /></SelectTrigger>
                <SelectContent>
                  {(rations ?? []).map((r) => <SelectItem key={r.id} value={r.id}>{r.nom}</SelectItem>)}
                </SelectContent>
              </Select>
            </FormField>
            <button onClick={save} disabled={saving} className="flex h-10 items-center justify-center gap-2 rounded-[8px] bg-primary font-inter text-[13px] font-semibold text-white hover:bg-primary-hover transition-colors disabled:opacity-50">
              <Icon name="save" size={14} />
              Enregistrer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
