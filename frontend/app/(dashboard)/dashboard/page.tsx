"use client";

import Link from "next/link";
import Icon from "@/components/ui/Icon";
import { useApi } from "@/lib/useApi";
import { useAuth } from "@/lib/auth";
import type { DashboardSummary, Animal, Traitement } from "@/lib/types";
import TroupeauBarChart from "@/components/dashboard/TroupeauBarChart";
import CoutsDonutChart from "@/components/dashboard/CoutsDonutChart";

interface Rentabilite { alimentation: number; veterinaire: number; achat: number; total: number; }

function ViewLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="flex items-center justify-end gap-1 font-inter text-[12px] font-medium text-primary hover:underline">
      {label}
      <Icon name="arrow-right" size={13} className="text-primary" />
    </Link>
  );
}

const ALERT_STYLE: Record<string, { icon: string; iconColor: string; bg: string; titleColor: string }> = {
  Critique: { icon: "triangle-alert", iconColor: "text-danger", bg: "bg-danger/5", titleColor: "text-danger" },
  Avertissement: { icon: "clock", iconColor: "text-warning", bg: "bg-warning/5", titleColor: "text-accent-warm" },
  Info: { icon: "check-circle", iconColor: "text-info", bg: "bg-info/5", titleColor: "text-info" },
};

const STOCK_COLOR: Record<string, { fill: string; text: string }> = {
  OK: { fill: "bg-success", text: "text-success" },
  Faible: { fill: "bg-warning", text: "text-warning" },
  Critique: { fill: "bg-danger", text: "text-danger" },
};

export default function DashboardPage() {
  const { user } = useAuth();
  const { data, loading, error } = useApi<DashboardSummary>("/dashboard");
  const { data: renta } = useApi<Rentabilite>("/dashboard/rentabilite");
  const { data: prets } = useApi<Animal[]>("/animaux/prets-a-vendre");

  const today = new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
  const initials = user ? `${user.prenom?.[0] ?? ""}${user.nom?.[0] ?? ""}`.toUpperCase() : "—";

  const rep = data?.repartition ?? {};
  const totalAnimaux = Object.values(rep).reduce((s, n) => s + n, 0);

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-surface">
      <div className="flex flex-1 flex-col gap-[22px] overflow-auto px-9 py-7">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-0.5">
            <span className="font-dm-sans text-2xl font-bold text-label">Tableau de bord</span>
            <span className="font-inter text-[13px] text-subtle">Vue d&apos;ensemble de votre élevage · {today}</span>
          </div>
          <div className="flex items-center gap-2.5">
            <Link href="/performance" className="flex h-[38px] w-[38px] items-center justify-center rounded-[6px] border border-border bg-card hover:bg-surface transition-colors">
              <Icon name="bell" size={18} className="text-subtle" />
            </Link>
            <div className="flex h-[38px] w-[38px] items-center justify-center rounded-full bg-primary">
              <span className="font-dm-sans text-[14px] font-semibold text-white">{initials}</span>
            </div>
          </div>
        </div>

        {loading && <p className="font-inter text-sm text-placeholder">Chargement…</p>}
        {error && <p className="font-inter text-sm text-danger">{error}</p>}

        {data && (
          <>
            {/* KPI Row */}
            <div className="flex gap-4">
              {[
                { label: "GMQ Moyen", value: `${data.kpis.gmqMoyen} kg/j`, icon: "trending-up", iconBg: "bg-success/10", iconColor: "text-success" },
                { label: "Coût/kg Moyen", value: `${data.kpis.coutKgMoyen} MAD`, icon: "coins", iconBg: "bg-info/10", iconColor: "text-info" },
                { label: "Troupeau Total", value: String(data.kpis.troupeauTotal), icon: "users", iconBg: "bg-primary-light", iconColor: "text-primary" },
                { label: "Prêts à vendre", value: String(data.kpis.pretsAVendre), icon: "shopping-cart", iconBg: "bg-warning/10", iconColor: "text-warning" },
              ].map((k) => (
                <div key={k.label} className="flex flex-1 flex-col gap-3 rounded-[12px] border border-border-light bg-card p-5">
                  <div className="flex items-center justify-between">
                    <span className="font-inter text-[13px] font-medium text-subtle">{k.label}</span>
                    <div className={`flex h-9 w-9 items-center justify-center rounded-[6px] ${k.iconBg}`}>
                      <Icon name={k.icon} size={18} className={k.iconColor} />
                    </div>
                  </div>
                  <span className="font-dm-sans text-[28px] font-bold leading-none text-label">{k.value}</span>
                </div>
              ))}
            </div>

            {/* Mid Row */}
            <div className="flex items-stretch gap-4">
              {/* Répartition par phase */}
              <div className="flex flex-1 flex-col gap-3 rounded-[12px] border border-border-light bg-card p-5">
                <span className="font-dm-sans text-[15px] font-semibold text-label">Répartition par phase</span>
                <TroupeauBarChart repartition={rep} />
                <div className="flex items-center justify-between border-t border-border-light pt-2">
                  <span className="font-inter text-[12px] font-medium text-subtle">Total : {totalAnimaux} animaux actifs</span>
                  <ViewLink href="/animaux" label="Voir détails" />
                </div>
              </div>

              {/* Rentabilité */}
              <div className="flex flex-1 flex-col gap-4 rounded-[12px] border border-border-light bg-card p-5">
                <div className="flex items-center gap-2">
                  <Icon name="wallet" size={16} className="text-primary" />
                  <span className="font-dm-sans text-[15px] font-semibold text-label">Répartition des coûts</span>
                </div>
                <CoutsDonutChart
                  alimentation={renta?.alimentation ?? 0}
                  veterinaire={renta?.veterinaire ?? 0}
                  achat={renta?.achat ?? 0}
                />
                <div className="h-px bg-border-light" />
                <div className="flex items-center justify-between">
                  <span className="font-inter text-[13px] font-semibold text-label">Coût total</span>
                  <span className="font-dm-sans text-base font-bold text-label">{(renta?.total ?? 0).toLocaleString("fr-FR")} MAD</span>
                </div>
                <div className="mt-auto flex items-center justify-center">
                  <ViewLink href="/performance/export" label="Voir les fiches de rentabilité" />
                </div>
              </div>

              {/* Alertes */}
              <div className="flex w-[380px] shrink-0 flex-col gap-2 rounded-[12px] border border-border-light bg-card p-5">
                <div className="flex items-center justify-between">
                  <span className="font-dm-sans text-[15px] font-semibold text-label">Alertes actives</span>
                  <span className="rounded-[10px] bg-danger/10 px-2 py-0.5 font-inter text-[11px] font-semibold text-danger">{data.kpis.alertesActives} alertes</span>
                </div>
                {data.alertes.length === 0 && <p className="font-inter text-[12px] text-placeholder py-2">Aucune alerte active.</p>}
                {data.alertes.map((a) => {
                  const s = ALERT_STYLE[a.niveau] ?? ALERT_STYLE.Info;
                  return (
                    <div key={a.id} className={`flex items-center gap-2.5 rounded-[6px] p-2 ${s.bg}`}>
                      <Icon name={s.icon} size={16} className={`shrink-0 ${s.iconColor}`} />
                      <div className="flex min-w-0 flex-col gap-0.5">
                        <span className={`font-inter text-[12px] font-semibold leading-tight ${s.titleColor}`}>{a.message}</span>
                        <span className="font-inter text-[11px] leading-tight text-subtle">{a.concerne || "—"}</span>
                      </div>
                    </div>
                  );
                })}
                <div className="flex items-center justify-center gap-1 pt-1">
                  <ViewLink href="/performance" label="Voir toutes les alertes" />
                </div>
              </div>
            </div>

            {/* Bottom Row */}
            <div className="flex gap-4 flex-1">
              {/* Stock */}
              <div className="flex flex-1 flex-col gap-3.5 rounded-[12px] border border-border-light bg-card p-5">
                <div className="flex items-center gap-2">
                  <Icon name="warehouse" size={18} className="text-primary" />
                  <span className="font-dm-sans text-[15px] font-semibold text-label">Niveaux de stock</span>
                </div>
                <div className="flex flex-1 flex-col gap-2.5">
                  {data.stock.map((s) => {
                    const c = STOCK_COLOR[s.statut] ?? STOCK_COLOR.OK;
                    const pct = s.seuil > 0 ? Math.min(100, Math.round((s.quantite / (s.seuil * 2)) * 100)) : 50;
                    return (
                      <div key={s.id} className="flex flex-col gap-1">
                        <div className="flex items-center justify-between">
                          <span className="font-inter text-[13px] font-medium text-label">{s.nom}</span>
                          <span className={`font-inter text-[12px] font-semibold ${c.text}`}>{s.quantite} {s.unite}</span>
                        </div>
                        <div className="h-[6px] w-full overflow-hidden rounded-[3px] bg-[#F3F4F6]">
                          <div className={`h-full rounded-[3px] ${c.fill}`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
                <ViewLink href="/stocks/mouvement" label="Réapprovisionner" />
              </div>

              {/* Traitements */}
              <div className="flex flex-1 flex-col gap-3.5 rounded-[12px] border border-border-light bg-card p-5">
                <div className="flex items-center gap-2">
                  <Icon name="calendar" size={18} className="text-primary" />
                  <span className="font-dm-sans text-[15px] font-semibold text-label">Traitements à venir</span>
                </div>
                <div className="flex flex-1 flex-col gap-3">
                  {data.traitements.length === 0 && <p className="font-inter text-[12px] text-placeholder">Aucun traitement en cours.</p>}
                  {data.traitements.map((t: Traitement, i) => {
                    const animalCode = typeof t.animal === "object" ? t.animal.identifiant : t.animal;
                    return (
                      <div key={t.id}>
                        {i > 0 && <div className="mb-3 h-px bg-border-light" />}
                        <div className="flex items-start gap-3">
                          <div className={`mt-1 h-[10px] w-[10px] shrink-0 rounded-full ${t.statut === "En cours" ? "bg-warning" : "bg-info"}`} />
                          <div className="flex flex-1 flex-col gap-0.5">
                            <span className="font-inter text-[12px] font-semibold text-label">{animalCode} · {t.produit}</span>
                            <span className="font-inter text-[11px] text-placeholder">{t.type} · {new Date(t.dateDebut).toLocaleDateString("fr-FR")}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <ViewLink href="/sante/calendrier" label="Voir le calendrier" />
              </div>

              {/* Prêts à vendre */}
              <div className="flex flex-1 flex-col gap-2.5 rounded-[12px] border border-border-light bg-card p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon name="shopping-cart" size={16} className="text-primary" />
                    <span className="font-dm-sans text-[15px] font-semibold text-label">Prêts à vendre</span>
                  </div>
                  <span className="rounded-[10px] bg-success/10 px-2 py-0.5 font-inter text-[11px] font-semibold text-success">{(prets ?? []).length}</span>
                </div>
                <div className="flex flex-col">
                  {(prets ?? []).slice(0, 4).map((a, i, arr) => (
                    <div key={a.id} className={`flex items-center gap-2.5 py-1.5 ${i < arr.length - 1 ? "border-b border-border-light" : ""}`}>
                      <div className="h-2 w-2 shrink-0 rounded-[2px] bg-success" />
                      <div className="flex flex-1 flex-col gap-0.5">
                        <span className="font-inter text-[12px] font-semibold text-label">{a.identifiant} · {a.race?.nom}</span>
                        <span className="font-inter text-[11px] text-subtle">{a.poidsActuel} kg · GMQ {a.gmqActuel}</span>
                      </div>
                    </div>
                  ))}
                  {(prets ?? []).length === 0 && <p className="font-inter text-[12px] text-placeholder py-2">Aucun animal prêt.</p>}
                </div>
                <div className="flex items-center justify-center gap-1 pt-1">
                  <ViewLink href="/animaux/prets-a-vendre" label="Voir tous les animaux" />
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
