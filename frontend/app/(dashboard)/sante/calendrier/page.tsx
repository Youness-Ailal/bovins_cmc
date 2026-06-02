"use client";

import { useState } from "react";
import Link from "next/link";
import Icon from "@/components/ui/Icon";
import SanteTabs from "@/components/dashboard/SanteTabs";

const JOURS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

const MONTHS = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

// Static mock events keyed by [month][day]
const EVENTS: Record<number, Record<number, { label: string; style: string }[]>> = {
  5: { // Juin (index 5)
    2:  [{ label: "ANI-047 — Anti-inflam.", style: "bg-info/10 text-info" }],
    5:  [{ label: "ANI-012 — Antibiotique", style: "bg-danger/10 text-danger" }],
    7:  [{ label: "ANI-031 — Antipar. fin", style: "bg-success/10 text-success" }],
    10: [{ label: "PLN-002 — Ivermectine", style: "bg-warning/10 text-warning" }, { label: "PLN-001 — Vaccin", style: "bg-info/10 text-info" }],
    15: [{ label: "ANI-008 — FMD Vaccin", style: "bg-info/10 text-info" }],
  },
};

// Number of days per month (non-leap simplified)
const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

// Day-of-week for the 1st of each month of 2026 (0=Mon, 6=Sun)
const FIRST_DOW_2026 = [3, 6, 6, 2, 4, 0, 2, 5, 1, 3, 6, 1];

export default function CalendrierPage() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth()); // 0-indexed

  const daysInMonth = DAYS_IN_MONTH[month];
  const firstDow = FIRST_DOW_2026[month]; // 0=Mon
  const todayDay = now.getMonth() === month ? now.getDate() : -1;
  const monthEvents = EVENTS[month] ?? {};

  const cells = firstDow + daysInMonth; // total grid cells needed
  const totalCells = Math.ceil(cells / 7) * 7;

  function prevMonth() { setMonth((m) => (m === 0 ? 11 : m - 1)); }
  function nextMonth() { setMonth((m) => (m === 11 ? 0 : m + 1)); }

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-surface">
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-border-light bg-card px-7">
        <div className="flex items-center gap-1.5">
          <span className="font-dm-sans text-xl font-semibold text-label">Santé</span>
          <span className="font-inter text-sm text-placeholder">/ Calendrier</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={prevMonth} className="flex items-center justify-center h-9 w-9 rounded-[6px] border border-border-light bg-surface hover:bg-border-light transition-colors">
            <Icon name="chevron-left" size={16} />
          </button>
          <span className="min-w-[120px] text-center font-dm-sans text-sm font-semibold text-label">
            {MONTHS[month]} 2026
          </span>
          <button onClick={nextMonth} className="flex items-center justify-center h-9 w-9 rounded-[6px] border border-border-light bg-surface hover:bg-border-light transition-colors">
            <Icon name="chevron-right" size={16} />
          </button>
          <Link href="/sante/traitement/nouveau" className="ml-2 flex items-center gap-1.5 rounded-[6px] bg-primary px-3.5 py-2 font-dm-sans text-[13px] font-semibold text-white hover:bg-primary-hover transition-colors">
            <Icon name="plus" size={14} />
            Ajouter
          </Link>
        </div>
      </header>

      <SanteTabs />

      <div className="flex flex-1 flex-col overflow-auto p-6">
        <div className="overflow-hidden rounded-[10px] border border-border-light bg-card">
          {/* Day headers */}
          <div className="grid border-b border-border-light" style={{ gridTemplateColumns: "repeat(7, 1fr)" }}>
            {JOURS.map((j) => (
              <div key={j} className="flex items-center justify-center py-3 font-inter text-[11px] font-bold uppercase tracking-wide text-placeholder">
                {j}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid" style={{ gridTemplateColumns: "repeat(7, 1fr)" }}>
            {Array.from({ length: totalCells }, (_, i) => {
              const day = i - firstDow + 1;
              const isValid = day >= 1 && day <= daysInMonth;
              const events = isValid ? (monthEvents[day] ?? []) : [];
              const isToday = day === todayDay;

              return (
                <div
                  key={i}
                  className={`min-h-[100px] border-b border-r border-border-light p-2 ${!isValid ? "bg-surface/50" : ""} ${(i + 1) % 7 === 0 ? "border-r-0" : ""}`}
                >
                  {isValid && (
                    <>
                      <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full font-inter text-[13px] font-medium ${isToday ? "bg-primary text-white" : "text-subtle"}`}>
                        {day}
                      </span>
                      <div className="mt-1 flex flex-col gap-1">
                        {events.map((ev, ei) => (
                          <div key={ei} className={`rounded-[4px] px-1.5 py-0.5 font-inter text-[10px] font-semibold ${ev.style}`}>
                            {ev.label}
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
