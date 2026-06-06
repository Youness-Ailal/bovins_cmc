"use client";

import { useEffect, useState } from "react";
import Icon from "@/components/ui/Icon";
import AdminTabs from "@/components/dashboard/AdminTabs";
import { useToast } from "@/components/ui/Toast";
import { useApi } from "@/lib/useApi";
import { api } from "@/lib/api";
import { alerteNiveauStyle } from "@/lib/statusStyles";
import type { Parametres, AlerteConfig } from "@/lib/types";

const DEFAULTS: AlerteConfig[] = [
  { id: "AC-001", nom: "GMQ en dessous du seuil", description: "Alerte si le GMQ d'un animal est inférieur à la cible de sa race", seuil: "80", unite: "% de la cible", active: true, niveau: "Critique" },
  { id: "AC-002", nom: "IC trop élevé", description: "Alerte si l'Indice de Consommation dépasse le seuil fixé", seuil: "8.0", unite: "", active: true, niveau: "Avertissement" },
  { id: "AC-003", nom: "Pesée en retard", description: "Rappel si aucune pesée n'a été enregistrée depuis N jours", seuil: "14", unite: "jours", active: true, niveau: "Info" },
  { id: "AC-004", nom: "Stock sous seuil", description: "Alerte quand un article atteint son seuil d'alerte minimum", seuil: "—", unite: "par article", active: true, niveau: "Avertissement" },
  { id: "AC-005", nom: "Délai de retrait actif", description: "Notification quand un animal a un délai de retrait en cours", seuil: "—", unite: "", active: true, niveau: "Critique" },
  { id: "AC-006", nom: "Traitement planifié", description: "Rappel avant la date prévue d'un traitement", seuil: "3", unite: "jours avant", active: false, niveau: "Info" },
];

export default function AlertesConfigPage() {
  const { data, loading } = useApi<Parametres>("/parametres");
  const { success, error: toastError } = useToast();
  const [config, setConfig] = useState<AlerteConfig[]>(DEFAULTS);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (data) {
      setConfig(data.alertesConfig && data.alertesConfig.length > 0 ? data.alertesConfig : DEFAULTS);
    }
  }, [data]);

  function toggleAlerte(id: string) {
    setConfig((prev) => prev.map((a) => (a.id === id ? { ...a, active: !a.active } : a)));
  }
  function setSeuil(id: string, seuil: string) {
    setConfig((prev) => prev.map((a) => (a.id === id ? { ...a, seuil } : a)));
  }

  async function save() {
    setSaving(true);
    try {
      // Persist alert config alongside the singleton settings document
      await api.put("/parametres", { alertesConfig: config });
      success("Configuration des alertes enregistrée");
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
          <span className="font-inter text-sm text-placeholder">/ Alertes</span>
        </div>
        <button onClick={save} disabled={saving} className="flex items-center gap-1.5 rounded-[6px] bg-primary px-3.5 py-2 font-dm-sans text-[13px] font-semibold text-white hover:bg-primary-hover transition-colors disabled:opacity-50">
          <Icon name="save" size={14} />
          Enregistrer
        </button>
      </header>

      <AdminTabs />

      <div className="flex flex-1 flex-col gap-4 overflow-auto p-6">
        {loading ? (
          <p className="font-inter text-sm text-placeholder">Chargement…</p>
        ) : (
          <div className="overflow-hidden rounded-[10px] border border-border-light bg-card">
            {config.map((alerte, i) => (
              <div key={alerte.id} className={`flex items-center gap-4 px-6 py-4 ${i < config.length - 1 ? "border-b border-border-light" : ""}`}>
                <div className="flex flex-1 flex-col gap-1">
                  <div className="flex items-center gap-2.5">
                    <span className="font-inter text-[13px] font-semibold text-label">{alerte.nom}</span>
                    <span className={`inline-flex rounded-full px-2 py-0.5 font-inter text-[10px] font-semibold ${alerteNiveauStyle[alerte.niveau]}`}>{alerte.niveau}</span>
                  </div>
                  <span className="font-inter text-[12px] text-subtle">{alerte.description}</span>
                </div>
                {alerte.seuil !== "—" ? (
                  <div className="flex items-center gap-2 w-[180px]">
                    <span className="font-inter text-xs text-placeholder shrink-0">Seuil :</span>
                    <input
                      type="text"
                      value={alerte.seuil}
                      onChange={(e) => setSeuil(alerte.id, e.target.value)}
                      className="h-8 w-20 rounded-[4px] border border-border px-2 font-inter text-[13px] text-label focus:border-primary focus:outline-none"
                    />
                    {alerte.unite && <span className="font-inter text-xs text-placeholder">{alerte.unite}</span>}
                  </div>
                ) : (
                  <div className="w-[180px]" />
                )}
                <button
                  onClick={() => toggleAlerte(alerte.id)}
                  className={`relative flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${alerte.active ? "bg-primary" : "bg-border-ui"}`}
                >
                  <span className={`absolute h-4 w-4 rounded-full bg-white shadow transition-transform ${alerte.active ? "translate-x-6" : "translate-x-1"}`} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
