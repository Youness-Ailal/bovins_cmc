"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Icon from "@/components/ui/Icon";
import Badge from "@/components/ui/Badge";
import ProgressBar from "@/components/ui/ProgressBar";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { useApi } from "@/lib/useApi";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";
import type { Parcelle, Ration, Animal } from "@/lib/types";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

const PHASE_VARIANT: Record<string, Parameters<typeof Badge>[0]["variant"]> = {
  Veau: "phase-croissance",
  Croissance: "phase-croissance",
  Engraissement: "phase-engraissement",
  Finition: "phase-finition",
};

const SANTE_VARIANT: Record<string, Parameters<typeof Badge>[0]["variant"]> = {
  Sain: "sain",
  "En traitement": "phase-engraissement",
  Malade: "malade",
};

const TYPE_LABELS: Record<string, string> = {
  paturage: "Paturage",
  engraissement: "Engraissement",
  quarantaine: "Quarantaine",
  veaux: "Veaux",
  "": "Non defini",
};

function StatCard({ label, value, icon, tone }: { label: string; value: string; icon: string; tone?: string }) {
  return (
    <div className="flex items-center gap-4 rounded-[8px] border border-border-light bg-card p-4">
      <div className={`flex h-10 w-10 items-center justify-center rounded-[8px] ${tone ?? "bg-primary-light text-primary"}`}>
        <Icon name={icon} size={18} />
      </div>
      <div className="min-w-0">
        <p className="font-inter text-[11px] font-bold uppercase tracking-wide text-placeholder">{label}</p>
        <p className="mt-1 truncate font-dm-sans text-xl font-bold text-label">{value}</p>
      </div>
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

const inputCls = "h-10 w-full rounded-[8px] border border-border bg-card px-3 font-inter text-[13px] text-label focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary";

export default function FicheParcellePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const canManage = true;
  const { data: parcelle, loading, error, refetch } = useApi<Parcelle>(`/parcelles/${id}`);
  const { data: rations } = useApi<Ration[]>("/rations");
  const { success, error: toastError } = useToast();

  const [nom, setNom] = useState("");
  const [reference, setReference] = useState("");
  const [capacite, setCapacite] = useState("");
  const [superficie, setSuperficie] = useState("");
  const [type, setType] = useState("");
  const [ration, setRation] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (parcelle) {
      setNom(parcelle.nom);
      setReference(parcelle.reference ?? "");
      setCapacite(String(parcelle.capaciteMax ?? 0));
      setSuperficie(String(parcelle.superficie ?? 0));
      setType(parcelle.type ?? "");
      setRation(parcelle.ration?.id ?? "");
      setNotes(parcelle.notes ?? "");
    }
  }, [parcelle]);

  async function save() {
    if (!nom.trim()) return toastError("Le nom est requis");
    setSaving(true);
    try {
      await api.put(`/parcelles/${id}`, {
        nom: nom.trim(),
        reference,
        capaciteMax: Number(capacite) || 0,
        superficie: Number(superficie) || 0,
        type,
        ration: ration || null,
        notes,
      });
      success("Parcelle mise a jour");
      refetch();
    } catch (err) {
      toastError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    try {
      await api.del(`/parcelles/${id}`);
      success("Parcelle supprimee");
      router.push("/parcelles");
    } catch (err) {
      toastError(err instanceof Error ? err.message : "Erreur");
    }
  }

  if (loading) return <div className="flex flex-1 items-center justify-center bg-surface font-inter text-sm text-placeholder">Chargement...</div>;
  if (error || !parcelle) return <div className="flex flex-1 items-center justify-center bg-surface font-inter text-sm text-danger">{error || "Parcelle introuvable"}</div>;

  const animaux = parcelle.animaux ?? [];
  const occupation = parcelle.occupation ?? 0;
  const freePlaces = Math.max(0, parcelle.capaciteMax - (parcelle.nbActuels ?? 0));
  const occupancyColor = occupation >= 100 ? "bg-danger" : occupation >= 85 ? "bg-warning" : "bg-success";

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-surface">
      <div className="flex flex-1 flex-col gap-5 overflow-auto p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Link href="/parcelles" className="font-inter text-sm text-placeholder transition-colors hover:text-subtle">Parcelles /</Link>
            <h1 className="mt-1 font-dm-sans text-3xl font-bold text-label">{parcelle.nom}</h1>
            <p className="mt-1 font-inter text-sm text-subtle">{parcelle.reference || "Reference non definie"} - {TYPE_LABELS[parcelle.type] ?? parcelle.type}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link href={`/parcelles/transfert?parcelle=${parcelle.id}`} className="flex h-10 items-center gap-2 rounded-[6px] border border-border-light bg-card px-3.5 font-inter text-sm font-semibold text-subtle transition-colors hover:bg-border-light">
              <Icon name="arrow-right" size={16} />
              Transferer ici
            </Link>
            {canManage && (
              <button onClick={save} disabled={saving} className="flex h-10 items-center gap-2 rounded-[6px] bg-primary px-4 font-inter text-sm font-semibold text-white transition-colors hover:bg-primary-hover disabled:opacity-50">
                <Icon name="save" size={16} />
                {saving ? "Enregistrement..." : "Enregistrer"}
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Occupation" value={`${occupation}%`} icon="activity" tone={occupation >= 100 ? "bg-danger/10 text-danger" : occupation >= 85 ? "bg-warning/10 text-warning" : "bg-success/10 text-success"} />
          <StatCard label="Animaux" value={`${parcelle.nbActuels ?? 0}/${parcelle.capaciteMax}`} icon="users" />
          <StatCard label="Places libres" value={String(freePlaces)} icon="target" />
          <StatCard label="Ration" value={parcelle.ration?.nom ?? "Aucune"} icon="utensils" />
        </div>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_340px]">
          <section className="overflow-hidden rounded-[12px] border border-border-light bg-card">
            <div className="flex items-center justify-between border-b border-border-light bg-surface px-5 py-4">
              <div>
                <h2 className="font-dm-sans text-base font-bold text-label">Animaux affectes</h2>
                <p className="font-inter text-xs text-subtle">{animaux.length} animal(aux) dans cette parcelle</p>
              </div>
              <div className="w-40">
                <ProgressBar value={occupation} color={occupancyColor} height={8} />
              </div>
            </div>
            <div className="grid grid-cols-[1.1fr_1fr_1fr_1fr_64px] items-center gap-4 border-b border-border-light px-5 py-3">
              {["Identifiant", "Race", "Phase", "Sante", ""].map((h) => (
                <span key={h} className="font-inter text-[11px] font-bold uppercase tracking-wide text-placeholder">{h}</span>
              ))}
            </div>
            {animaux.length === 0 && <div className="py-10 text-center font-inter text-[13px] text-placeholder">Aucun animal dans cette parcelle</div>}
            {animaux.map((a: Animal) => (
              <div key={a.id} className="grid min-h-[56px] grid-cols-[1.1fr_1fr_1fr_1fr_64px] items-center gap-4 border-b border-border-light px-5 py-3 last:border-b-0">
                <span className="font-inter text-[13px] font-semibold text-label">{a.identifiant}</span>
                <span className="font-inter text-[13px] text-subtle">{a.race?.nom ?? "-"}</span>
                <Badge variant={PHASE_VARIANT[a.phase]} className="w-fit text-[10px]">{a.phase}</Badge>
                <Badge variant={SANTE_VARIANT[a.etatSante]} className="w-fit text-[10px]">{a.etatSante}</Badge>
                <Link href={`/animaux/${a.id}`} className="flex h-8 w-8 items-center justify-center rounded-[6px] text-placeholder transition-colors hover:bg-surface hover:text-primary">
                  <Icon name="eye" size={14} />
                </Link>
              </div>
            ))}
          </section>

          <aside className="flex flex-col gap-4 rounded-[12px] border border-border-light bg-card p-5">
            <div>
              <h2 className="font-dm-sans text-base font-bold text-label">Parametres</h2>
              <p className="font-inter text-xs text-subtle">Informations utilisees pour les affectations.</p>
            </div>
            <FormField label="Nom de la parcelle">
              <input disabled={!canManage} type="text" value={nom} onChange={(e) => setNom(e.target.value)} className={inputCls} />
            </FormField>
            <FormField label="Reference">
              <input disabled={!canManage} type="text" value={reference} onChange={(e) => setReference(e.target.value)} className={inputCls} />
            </FormField>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Capacite">
                <input disabled={!canManage} type="number" value={capacite} onChange={(e) => setCapacite(e.target.value)} className={inputCls} />
              </FormField>
              <FormField label="Superficie ha">
                <input disabled={!canManage} type="number" step="0.1" value={superficie} onChange={(e) => setSuperficie(e.target.value)} className={inputCls} />
              </FormField>
            </div>
            <FormField label="Type">
              <Select disabled={!canManage} value={type} onValueChange={(v) => setType(v ?? "")}>
                <SelectTrigger className="h-10 w-full rounded-[8px] border border-border bg-card font-inter text-[13px] text-label"><SelectValue placeholder="Aucun" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="paturage">Paturage</SelectItem>
                  <SelectItem value="engraissement">Engraissement</SelectItem>
                  <SelectItem value="quarantaine">Quarantaine / Isolement</SelectItem>
                  <SelectItem value="veaux">Parc a veaux</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
            <FormField label="Ration associee">
              <Select disabled={!canManage} value={ration} onValueChange={(v) => setRation(v ?? "")}>
                <SelectTrigger className="h-10 w-full rounded-[8px] border border-border bg-card font-inter text-[13px] text-label"><SelectValue placeholder="Aucune" /></SelectTrigger>
                <SelectContent>
                  {(rations ?? []).map((r) => <SelectItem key={r.id} value={r.id}>{r.nom}</SelectItem>)}
                </SelectContent>
              </Select>
            </FormField>
            <FormField label="Notes">
              <textarea disabled={!canManage} value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} className="w-full resize-none rounded-[8px] border border-border bg-card p-3 font-inter text-[13px] text-label focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
            </FormField>
            {canManage && (
              <button onClick={() => setConfirmDelete(true)} disabled={(parcelle.nbActuels ?? 0) > 0} className="mt-2 flex h-10 items-center justify-center gap-2 rounded-[8px] border border-danger/20 bg-danger/10 font-inter text-[13px] font-semibold text-danger transition-colors hover:bg-danger/15 disabled:cursor-not-allowed disabled:opacity-50">
                <Icon name="trash-2" size={14} />
                Supprimer la parcelle
              </button>
            )}
          </aside>
        </div>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title="Supprimer la parcelle"
        message="Cette action est definitive. Une parcelle contenant des animaux ne peut pas etre supprimee."
        confirmLabel="Supprimer"
        onConfirm={remove}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}
