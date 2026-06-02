"use client";

import Link from "next/link";
import Icon from "@/components/ui/Icon";

// ─── KPI Card ────────────────────────────────────────────────────────────────
interface KpiProps {
  label: string;
  value: string;
  icon: string;
  iconBg: string;
  iconColor: string;
  trend: string;
  trendColor: string;
  period: string;
}

function KpiCard({ label, value, icon, iconBg, iconColor, trend, trendColor, period }: KpiProps) {
  return (
    <div className="flex flex-1 flex-col gap-3 rounded-[12px] border border-border-light bg-card p-5">
      {/* Top row: label + icon badge */}
      <div className="flex items-center justify-between">
        <span className="font-inter text-[13px] font-medium text-subtle">{label}</span>
        <div className={`flex h-9 w-9 items-center justify-center rounded-[6px] ${iconBg}`}>
          <Icon name={icon} size={18} className={iconColor} />
        </div>
      </div>
      {/* Value */}
      <span className="font-dm-sans text-[28px] font-bold leading-none text-label">{value}</span>
      {/* Bottom row: trend + period */}
      <div className="flex items-center gap-1.5">
        <span className={`font-inter text-xs font-semibold ${trendColor}`}>{trend}</span>
        <span className="font-inter text-xs text-placeholder">{period}</span>
      </div>
    </div>
  );
}

// ─── Alert Item ───────────────────────────────────────────────────────────────
function AlertItem({ icon, iconColor, title, titleColor, sub, bg }: {
  icon: string; iconColor: string; title: string; titleColor: string; sub: string; bg: string;
}) {
  return (
    <div className={`flex items-center gap-2.5 rounded-[6px] p-2 ${bg}`}>
      <Icon name={icon} size={16} className={`shrink-0 ${iconColor}`} />
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className={`font-inter text-[12px] font-semibold leading-tight ${titleColor}`}>{title}</span>
        <span className="font-inter text-[11px] leading-tight text-subtle">{sub}</span>
      </div>
    </div>
  );
}

// ─── Stock Row ────────────────────────────────────────────────────────────────
function StockRow({ nom, qte, qteColor, fillPct, fillColor, statut, statutColor }: {
  nom: string; qte: string; qteColor: string;
  fillPct: number; fillColor: string;
  statut: string; statutColor: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span className="font-inter text-[13px] font-medium text-label">{nom}</span>
        <span className={`font-inter text-[12px] font-semibold ${qteColor}`}>{qte}</span>
      </div>
      <div className="h-[6px] w-full overflow-hidden rounded-[3px] bg-[#F3F4F6]">
        <div className={`h-full rounded-[3px] ${fillColor}`} style={{ width: `${fillPct}%` }} />
      </div>
      <span className={`font-inter text-[11px] ${statutColor}`}>{statut}</span>
    </div>
  );
}

// ─── Treatment Row ────────────────────────────────────────────────────────────
function TreatRow({ dotColor, animal, badge, traitement, date }: {
  dotColor: string; animal: string; badge: string; traitement: string; date: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className={`mt-1 h-[10px] w-[10px] shrink-0 rounded-full ${dotColor}`} />
      <div className="flex flex-1 flex-col gap-0.5">
        <div className="flex items-center justify-between">
          <span className="font-inter text-[12px] font-semibold text-label">{animal}</span>
          <span className="font-inter text-[11px] text-placeholder">{badge}</span>
        </div>
        <span className="font-inter text-[13px] text-subtle">{traitement}</span>
        <span className="font-inter text-[11px] text-placeholder">{date}</span>
      </div>
    </div>
  );
}

// ─── Sell Row ─────────────────────────────────────────────────────────────────
function SellRow({ id, race, poids, gmq, cost, last }: {
  id: string; race: string; poids: string; gmq: string; cost: string; last?: boolean;
}) {
  return (
    <div className={`flex items-center gap-2.5 py-1.5 ${!last ? "border-b border-border-light" : ""}`}>
      <div className="h-2 w-2 shrink-0 rounded-[2px] bg-success" />
      <div className="flex flex-1 flex-col gap-0.5">
        <span className="font-inter text-[12px] font-semibold text-label">{id} · {race}</span>
        <span className="font-inter text-[11px] text-subtle">{poids} · GMQ {gmq}</span>
      </div>
      <span className="font-dm-sans text-[12px] font-semibold text-primary">{cost}</span>
    </div>
  );
}

// ─── "Voir" link ──────────────────────────────────────────────────────────────
function ViewLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="flex items-center justify-end gap-1 font-inter text-[12px] font-medium text-primary hover:underline">
      {label}
      <Icon name="arrow-right" size={13} className="text-primary" />
    </Link>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const today = new Date().toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-surface">
      <div className="flex flex-1 flex-col gap-[22px] overflow-auto px-9 py-7">

        {/* ── Header ───────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-0.5">
            <span className="font-dm-sans text-2xl font-bold text-label">Tableau de bord</span>
            <span className="font-inter text-[13px] text-subtle">Vue d&apos;ensemble de votre élevage · {today}</span>
          </div>
          <div className="flex items-center gap-2.5">
            {/* Search */}
            <div className="flex items-center gap-2 rounded-[6px] border border-border bg-card px-3.5 py-2" style={{ width: 220 }}>
              <Icon name="search" size={16} className="text-placeholder" />
              <span className="font-inter text-[13px] text-placeholder">Rechercher un animal...</span>
            </div>
            {/* Bell */}
            <div className="flex h-[38px] w-[38px] items-center justify-center rounded-[6px] border border-border bg-card">
              <Icon name="bell" size={18} className="text-subtle" />
            </div>
            {/* User avatar */}
            <div className="flex h-[38px] w-[38px] items-center justify-center rounded-full bg-primary">
              <span className="font-dm-sans text-[14px] font-semibold text-white">YB</span>
            </div>
          </div>
        </div>

        {/* ── KPI Row ──────────────────────────────────────────────────────── */}
        <div className="flex gap-4">
          <KpiCard label="GMQ Moyen" value="1.42 kg/j" icon="trending-up" iconBg="bg-success/10" iconColor="text-success" trend="+8.2%" trendColor="text-success" period="vs mois dernier" />
          <KpiCard label="IC Moyen" value="5.8" icon="scale" iconBg="bg-warning/10" iconColor="text-warning" trend="-2.1%" trendColor="text-danger" period="vs mois dernier" />
          <KpiCard label="Coût/kg Moyen" value="3.24 MAD" icon="coins" iconBg="bg-info/10" iconColor="text-info" trend="-5.3%" trendColor="text-success" period="vs mois dernier" />
          <KpiCard label="Troupeau Total" value="147" icon="users" iconBg="bg-primary-light" iconColor="text-primary" trend="+12" trendColor="text-success" period="ce trimestre" />
        </div>

        {/* ── Mid Row ──────────────────────────────────────────────────────── */}
        <div className="flex items-stretch gap-4">
          {/* Chart Compact card — Répartition par phase */}
          <div className="flex flex-1 flex-col gap-3 rounded-[12px] border border-border-light bg-card p-5">
            <span className="font-dm-sans text-[15px] font-semibold text-label">Répartition par phase</span>

            {/* Legend */}
            <div className="flex items-center gap-3">
              {[
                { color: "bg-primary", label: "Veaux" },
                { color: "bg-accent-gold", label: "Jeunes" },
                { color: "bg-accent-warm", label: "Adultes" },
              ].map(({ color, label }) => (
                <div key={label} className="flex items-center gap-1.5">
                  <div className={`h-2 w-2 rounded-[2px] ${color}`} />
                  <span className="font-inter text-[11px] text-subtle">{label}</span>
                </div>
              ))}
            </div>

            {/* Bar chart */}
            <div className="flex flex-1 items-end gap-5 px-5 pt-2">
              {[
                { count: 32, h: 120, color: "bg-primary", label: "Veaux" },
                { count: 18, h: 75, color: "bg-accent-gold", label: "Jeunes" },
                { count: 45, h: 150, color: "bg-accent-warm", label: "Adultes" },
              ].map(({ count, h, color, label }) => (
                <div key={label} className="flex flex-1 flex-col items-center gap-1">
                  <span className="font-dm-sans text-[14px] font-bold text-label">{count}</span>
                  <div className={`w-full rounded-t-[6px] ${color}`} style={{ height: h }} />
                  <span className="font-inter text-[11px] font-medium text-placeholder">{label}</span>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="flex items-center justify-between border-t border-border-light pt-2">
              <span className="font-inter text-[12px] font-medium text-subtle">Total: 95 animaux actifs</span>
              <ViewLink href="/animaux" label="Voir détails" />
            </div>
          </div>

          {/* Rentabilité troupeau card */}
          <div className="flex flex-1 flex-col gap-4 rounded-[12px] border border-border-light bg-card p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon name="wallet" size={16} className="text-primary" />
                <span className="font-dm-sans text-[15px] font-semibold text-label">Rentabilité troupeau</span>
              </div>
              <span className="rounded-[10px] bg-surface px-2 py-0.5 font-inter text-[11px] font-medium text-subtle">Ce mois</span>
            </div>

            <div className="flex flex-col gap-2">
              {[
                { dot: "bg-accent-warm", label: "Alimentation", value: "42 800 MAD" },
                { dot: "bg-info", label: "Vétérinaire", value: "8 350 MAD" },
                { dot: "bg-accent-gold", label: "Achat animaux", value: "156 000 MAD" },
              ].map(({ dot, label, value }) => (
                <div key={label} className="flex items-center justify-between rounded-[6px] bg-surface-alt px-2.5 py-1.5">
                  <div className="flex items-center gap-1.5">
                    <div className={`h-2 w-2 rounded-[2px] ${dot}`} />
                    <span className="font-inter text-[12px] font-medium text-label">{label}</span>
                  </div>
                  <span className="font-dm-sans text-[13px] font-semibold text-label">{value}</span>
                </div>
              ))}
            </div>

            <div className="h-px bg-border-light" />

            <div className="flex items-center justify-between">
              <span className="font-inter text-[13px] font-semibold text-label">Coût total</span>
              <span className="font-dm-sans text-base font-bold text-label">207 150 MAD</span>
            </div>

            <div className="mt-auto flex items-center justify-center">
              <ViewLink href="/performance/export" label="Voir les fiches de rentabilité" />
            </div>
          </div>

          {/* Alerts Card */}
          <div className="flex w-[380px] shrink-0 flex-col gap-2 rounded-[12px] border border-border-light bg-card p-5">
            {/* Header */}
            <div className="flex items-center justify-between">
              <span className="font-dm-sans text-[15px] font-semibold text-label">Alertes actives</span>
              <span className="rounded-[10px] bg-danger/10 px-2 py-0.5 font-inter text-[11px] font-semibold text-danger">6 alertes</span>
            </div>

            {/* Alert items */}
            <AlertItem icon="package" iconColor="text-danger" title="Stock faible: Orge" titleColor="text-danger" sub="Reste 45 kg · Seuil: 100 kg" bg="bg-danger/5" />
            <AlertItem icon="clock" iconColor="text-warning" title="Traitement J-1: BR-0023" titleColor="text-accent-warm" sub="Vaccin BVDV · Demain 09:00" bg="bg-warning/5" />
            <AlertItem icon="trending-down" iconColor="text-warning" title="Retard croissance: BR-0056" titleColor="text-accent-warm" sub="GMQ 0.78 kg/j · Seuil: 1.1 kg/j" bg="bg-warning/5" />
            <AlertItem icon="shield-alert" iconColor="text-danger" title="Délai retrait actif: BR-0089" titleColor="text-danger" sub="Antibiotique · Fin: 28 Mars" bg="bg-danger/5" />
            <AlertItem icon="check-circle" iconColor="text-success" title="Animal prêt: BR-0042" titleColor="text-primary" sub="485 kg · Poids cible atteint" bg="bg-success/5" />

            {/* View all */}
            <div className="flex items-center justify-center gap-1 pt-1">
              <ViewLink href="/performance" label="Voir toutes les alertes" />
            </div>
          </div>
        </div>

        {/* ── Bottom Row ───────────────────────────────────────────────────── */}
        <div className="flex gap-4 flex-1">
          {/* Stock Card */}
          <div className="flex flex-1 flex-col gap-3.5 rounded-[12px] border border-border-light bg-card p-5">
            <div className="flex items-center gap-2">
              <Icon name="warehouse" size={18} className="text-primary" />
              <span className="font-dm-sans text-[15px] font-semibold text-label">Niveaux de stock</span>
            </div>
            <div className="flex flex-1 flex-col gap-2.5">
              <StockRow nom="Orge" qte="45 kg" qteColor="text-danger" fillPct={15} fillColor="bg-danger" statut="Stock critique" statutColor="text-danger" />
              <StockRow nom="Maïs concassé" qte="320 kg" qteColor="text-success" fillPct={78} fillColor="bg-success" statut="Stock suffisant" statutColor="text-success" />
              <StockRow nom="Foin de luzerne" qte="890 kg" qteColor="text-success" fillPct={95} fillColor="bg-success" statut="Stock optimal" statutColor="text-success" />
              <StockRow nom="Ivermectine" qte="12 doses" qteColor="text-warning" fillPct={43} fillColor="bg-warning" statut="Stock modéré" statutColor="text-warning" />
            </div>
            <ViewLink href="/stocks/mouvement" label="Réapprovisionner" />
          </div>

          {/* Treatments Card */}
          <div className="flex flex-1 flex-col gap-3.5 rounded-[12px] border border-border-light bg-card p-5">
            <div className="flex items-center gap-2">
              <Icon name="calendar" size={18} className="text-primary" />
              <span className="font-dm-sans text-[15px] font-semibold text-label">Traitements à venir</span>
            </div>
            <div className="flex flex-1 flex-col gap-3">
              <TreatRow dotColor="bg-danger" animal="BR-0023 · Holstein" badge="Urgent" traitement="Vaccin BVDV" date="23 juin 2026" />
              <div className="h-px bg-border-light" />
              <TreatRow dotColor="bg-warning" animal="BR-0056 · Angus" badge="Planifié" traitement="Déparasitage" date="25 juin 2026" />
              <div className="h-px bg-border-light" />
              <TreatRow dotColor="bg-info" animal="BR-0089 · Limousin" badge="Rappel" traitement="Rappel IBR" date="29 juin 2026" />
            </div>
            <ViewLink href="/sante/calendrier" label="Voir le calendrier" />
          </div>

          {/* Ready to Sell Card */}
          <div className="flex flex-1 flex-col gap-2.5 rounded-[12px] border border-border-light bg-card p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon name="shopping-cart" size={16} className="text-primary" />
                <span className="font-dm-sans text-[15px] font-semibold text-label">Prêts à vendre</span>
              </div>
              <span className="rounded-[10px] bg-success/10 px-2 py-0.5 font-inter text-[11px] font-semibold text-success">8</span>
            </div>
            <div className="flex flex-col">
              <SellRow id="BR-0042" race="Charolaise" poids="485 kg" gmq="1.52" cost="3.1 MAD/kg" />
              <SellRow id="BR-0078" race="Limousine" poids="510 kg" gmq="1.38" cost="2.9 MAD/kg" />
              <SellRow id="BR-0115" race="Holstein" poids="470 kg" gmq="1.45" cost="3.4 MAD/kg" />
              <SellRow id="BR-0091" race="Salers" poids="495 kg" gmq="1.41" cost="3.0 MAD/kg" last />
            </div>
            <div className="flex items-center justify-center gap-1 pt-1">
              <ViewLink href="/animaux" label="Voir tous les animaux" />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
