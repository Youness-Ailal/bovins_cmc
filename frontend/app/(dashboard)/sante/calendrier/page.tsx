"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Icon from "@/components/ui/Icon";
import SanteTabs from "@/components/dashboard/SanteTabs";
import { useApi } from "@/lib/useApi";

interface PlanTraitement {
  id: string;
  animal: { id: string; identifiant: string };
  type: string;
  produit: string;
  datePrevue: string;
  statut: "À faire" | "Rappel J-3" | "En retard" | "Fait";
}

const JOURS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const MONTHS = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

const STATUT: Record<string, { chip: string; dot: string; label: string }> = {
  "À faire":    { chip: "bg-info/10 text-info",       dot: "bg-info",    label: "À faire" },
  "Rappel J-3": { chip: "bg-warning/10 text-warning", dot: "bg-warning", label: "Rappel J-3" },
  "En retard":  { chip: "bg-danger/10 text-danger",   dot: "bg-danger",  label: "En retard" },
  "Fait":       { chip: "bg-success/10 text-success", dot: "bg-success", label: "Fait" },
};

export default function CalendrierPage() {
  const canManage = true;
  const now = new Date();

  const [month, setMonth]           = useState(now.getMonth());
  const [year, setYear]             = useState(now.getFullYear());
  const [selectedDay, setSelectedDay] = useState<number | null>(now.getDate());

  const { data: plans } = useApi<PlanTraitement[]>("/sante/plans");

  const eventsByDay = useMemo(() => {
    const map: Record<number, PlanTraitement[]> = {};
    for (const plan of plans ?? []) {
      const d = new Date(plan.datePrevue);
      if (d.getMonth() === month && d.getFullYear() === year) {
        const day = d.getDate();
        if (!map[day]) map[day] = [];
        map[day].push(plan);
      }
    }
    return map;
  }, [plans, month, year]);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDow    = (new Date(year, month, 1).getDay() + 6) % 7;
  const todayDay    = now.getMonth() === month && now.getFullYear() === year ? now.getDate() : -1;
  const totalCells  = Math.ceil((firstDow + daysInMonth) / 7) * 7;

  const totalEvents = Object.values(eventsByDay).reduce((s, e) => s + e.length, 0);
  const selectedEvents = selectedDay ? (eventsByDay[selectedDay] ?? []) : [];

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear((y) => y - 1); }
    else setMonth((m) => m - 1);
    setSelectedDay(null);
  }
  function nextMonth() {
    if (month === 11) { setMonth(0); setYear((y) => y + 1); }
    else setMonth((m) => m + 1);
    setSelectedDay(null);
  }
  function goToday() {
    setMonth(now.getMonth());
    setYear(now.getFullYear());
    setSelectedDay(now.getDate());
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-surface">
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-border-light bg-card px-7">
        <div className="flex items-center gap-3">
          <span className="font-dm-sans text-xl font-semibold text-label">Calendrier</span>
          {totalEvents > 0 && (
            <span className="rounded-full border border-border-light bg-surface px-2.5 py-0.5 font-inter text-[12px] font-semibold text-subtle">
              {totalEvents} ce mois
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={prevMonth}
            className="flex h-9 w-9 items-center justify-center rounded-[6px] border border-border-light bg-surface hover:bg-border-light transition-colors"
          >
            <Icon name="chevron-left" size={15} className="text-subtle" />
          </button>
          <span className="min-w-[150px] text-center font-dm-sans text-[14px] font-semibold text-label">
            {MONTHS[month]} {year}
          </span>
          <button
            onClick={nextMonth}
            className="flex h-9 w-9 items-center justify-center rounded-[6px] border border-border-light bg-surface hover:bg-border-light transition-colors"
          >
            <Icon name="chevron-right" size={15} className="text-subtle" />
          </button>
          <button
            onClick={goToday}
            className="ml-1 rounded-[6px] border border-border-light bg-surface px-3 py-1.5 font-inter text-[12px] font-semibold text-subtle hover:bg-border-light transition-colors"
          >
            Aujourd&apos;hui
          </button>
          {canManage && (
            <Link
              href="/sante/traitement/nouveau"
              className="flex items-center gap-1.5 rounded-[6px] bg-primary px-3.5 py-2 font-dm-sans text-[13px] font-semibold text-white hover:bg-primary/90 transition-colors"
            >
              <Icon name="plus" size={14} />
              Ajouter
            </Link>
          )}
        </div>
      </header>

      <SanteTabs />

      <div className="flex flex-1 overflow-hidden">
        {/* Calendar grid */}
        <div className="flex flex-1 flex-col overflow-auto p-6 pr-3">
          <div className="overflow-hidden rounded-[12px] border border-border-light bg-card">
            {/* Day headers */}
            <div className="grid border-b border-border-light" style={{ gridTemplateColumns: "repeat(7, 1fr)" }}>
              {JOURS.map((j, i) => (
                <div
                  key={j}
                  className={`flex items-center justify-center py-3 font-inter text-[11px] font-bold uppercase tracking-wide ${
                    i >= 5 ? "text-subtle" : "text-placeholder"
                  }`}
                >
                  {j}
                </div>
              ))}
            </div>

            {/* Grid */}
            <div className="grid" style={{ gridTemplateColumns: "repeat(7, 1fr)" }}>
              {Array.from({ length: totalCells }, (_, i) => {
                const day     = i - firstDow + 1;
                const isValid = day >= 1 && day <= daysInMonth;
                const events  = isValid ? (eventsByDay[day] ?? []) : [];
                const isToday = day === todayDay;
                const isSelected = day === selectedDay && isValid;
                const isWeekend  = i % 7 >= 5;
                const hasAlert   = events.some((e) => e.statut === "En retard");

                return (
                  <div
                    key={i}
                    onClick={() => isValid && setSelectedDay(day === selectedDay ? null : day)}
                    className={`relative min-h-[88px] border-b border-r border-border-light p-2 transition-colors ${
                      !isValid ? "bg-surface/40" : isWeekend ? "bg-surface/20" : ""
                    } ${(i + 1) % 7 === 0 ? "border-r-0" : ""} ${
                      isValid ? "cursor-pointer hover:bg-primary/5" : ""
                    } ${isSelected ? "bg-primary/5 ring-1 ring-inset ring-primary/20" : ""}`}
                  >
                    {isValid && (
                      <>
                        <div className="flex items-center justify-between">
                          <span
                            className={`inline-flex h-6 w-6 items-center justify-center rounded-full font-inter text-[12px] font-semibold ${
                              isToday
                                ? "bg-primary text-white"
                                : isSelected
                                ? "bg-primary/20 text-primary"
                                : "text-subtle"
                            }`}
                          >
                            {day}
                          </span>
                          {hasAlert && (
                            <span className="h-1.5 w-1.5 rounded-full bg-danger" />
                          )}
                        </div>
                        <div className="mt-1 flex flex-col gap-0.5">
                          {events.slice(0, 2).map((plan) => {
                            const s = STATUT[plan.statut] ?? STATUT["À faire"];
                            return (
                              <div
                                key={plan.id}
                                className={`flex items-center gap-1 rounded-[3px] px-1.5 py-0.5 ${s.chip}`}
                                title={`${plan.animal?.identifiant} — ${plan.type}`}
                              >
                                <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${s.dot}`} />
                                <span className="truncate font-inter text-[10px] font-semibold">
                                  {plan.animal?.identifiant}
                                </span>
                              </div>
                            );
                          })}
                          {events.length > 2 && (
                            <span className="pl-1 font-inter text-[10px] text-placeholder">+{events.length - 2}</span>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Legend */}
          <div className="mt-3 flex items-center gap-3">
            <span className="font-inter text-[11px] text-placeholder">Légende :</span>
            {Object.entries(STATUT).map(([key, v]) => (
              <div key={key} className="flex items-center gap-1.5">
                <span className={`h-2 w-2 rounded-full ${v.dot}`} />
                <span className="font-inter text-[11px] text-subtle">{v.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: day detail panel */}
        <div className="w-[280px] shrink-0 border-l border-border-light bg-card flex flex-col overflow-hidden">
          <div className="flex h-12 shrink-0 items-center border-b border-border-light px-4">
            {selectedDay ? (
              <span className="font-dm-sans text-[13px] font-semibold text-label">
                {selectedDay} {MONTHS[month]}
              </span>
            ) : (
              <span className="font-inter text-[13px] text-placeholder">Cliquez sur un jour</span>
            )}
            {selectedDay && selectedEvents.length > 0 && (
              <span className="ml-auto rounded-full bg-primary/10 px-2 py-0.5 font-inter text-[11px] font-semibold text-primary">
                {selectedEvents.length}
              </span>
            )}
          </div>

          <div className="flex-1 overflow-auto p-4">
            {!selectedDay ? (
              <div className="flex flex-col items-center gap-2 pt-8 text-center">
                <Icon name="calendar" size={28} className="text-placeholder" />
                <p className="font-inter text-[12px] text-placeholder">Sélectionnez un jour pour voir les traitements planifiés.</p>
              </div>
            ) : selectedEvents.length === 0 ? (
              <div className="flex flex-col items-center gap-2 pt-8 text-center">
                <Icon name="check-circle" size={28} className="text-success" />
                <p className="font-dm-sans text-[13px] font-semibold text-label">Aucun traitement</p>
                <p className="font-inter text-[12px] text-placeholder">Journée libre pour ce jour.</p>
                {canManage && (
                  <Link
                    href="/sante/traitement/nouveau"
                    className="mt-2 flex items-center gap-1.5 rounded-[6px] bg-primary px-3 py-1.5 font-inter text-[12px] font-semibold text-white hover:bg-primary/90 transition-colors"
                  >
                    <Icon name="plus" size={12} />
                    Planifier
                  </Link>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {selectedEvents.map((plan) => {
                  const s = STATUT[plan.statut] ?? STATUT["À faire"];
                  return (
                    <div key={plan.id} className="rounded-[10px] border border-border-light bg-surface p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10">
                            <Icon name="beef" size={13} className="text-primary" />
                          </div>
                          <span className="font-inter text-[13px] font-semibold text-primary">
                            {plan.animal?.identifiant}
                          </span>
                        </div>
                        <span className={`rounded-full px-2 py-0.5 font-inter text-[10px] font-semibold ${s.chip}`}>
                          {plan.statut}
                        </span>
                      </div>
                      <div className="mt-2 flex flex-col gap-0.5 pl-9">
                        <p className="font-inter text-[12px] font-medium text-label">{plan.type}</p>
                        {plan.produit && (
                          <p className="font-inter text-[11px] text-subtle">{plan.produit}</p>
                        )}
                      </div>
                      <div className="mt-2 pl-9">
                        <Link
                          href={`/animaux/${plan.animal?.id}`}
                          className="inline-flex items-center gap-1 font-inter text-[11px] font-semibold text-primary hover:underline"
                        >
                          Fiche animal
                          <Icon name="arrow-right" size={10} />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
