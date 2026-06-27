"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Icon from "@/components/ui/Icon";
import { useAlertsContext } from "@/contexts/AlertsContext";
import type { Notification, NotificationType, NotificationNiveau } from "@/hooks/useAlerts";

const TYPE_ICON: Record<NotificationType, string> = {
  stock: "warehouse",
  sante: "heart-pulse",
  retrait: "scissors",
  systeme: "info",
};

// Icon tile colors keyed by severity, drawn from the design tokens.
const NIVEAU_STYLE: Record<NotificationNiveau, { tile: string; icon: string }> = {
  Critique: { tile: "bg-danger/10", icon: "text-danger" },
  Avertissement: { tile: "bg-warning/15", icon: "text-accent-warm" },
  Info: { tile: "bg-info/10", icon: "text-info" },
};

function relativeTime(ts: number): string {
  const diff = Date.now() - ts;
  const min = Math.round(diff / 60000);
  if (min < 1) return "à l'instant";
  if (min < 60) return `il y a ${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `il y a ${h} h`;
  const d = Math.round(h / 24);
  if (d === 1) return "hier";
  if (d < 7) return `il y a ${d} j`;
  return new Date(ts).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

export default function NotificationBell() {
  const router = useRouter();
  const { notifications, unreadCount, markRead, markAllRead, remove, clearAll } = useAlertsContext();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, []);

  function handleItemClick(n: Notification) {
    markRead(n.id);
    if (n.href) {
      setOpen(false);
      router.push(n.href);
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} non lues)` : ""}`}
        aria-haspopup="true"
        aria-expanded={open}
        className={`relative flex h-[38px] w-[38px] items-center justify-center rounded-[6px] border transition-colors ${
          open ? "border-primary bg-primary-light" : "border-border bg-card hover:bg-surface"
        }`}
      >
        <Icon name="bell" size={18} className={open ? "text-primary" : "text-subtle"} />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-danger px-1 font-inter text-[10px] font-bold leading-none text-white ring-2 ring-card">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-[360px] overflow-hidden rounded-[12px] border border-border-light bg-card shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border-light px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="font-dm-sans text-[15px] font-semibold text-label">Notifications</span>
              {unreadCount > 0 && (
                <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary/10 px-1.5 font-inter text-[11px] font-semibold text-primary">
                  {unreadCount}
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="font-inter text-[12px] font-medium text-primary transition-colors hover:text-primary-hover"
              >
                Tout marquer comme lu
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-[380px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center gap-2 px-6 py-12 text-center">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-surface">
                  <Icon name="bell" size={20} className="text-placeholder" />
                </div>
                <p className="font-inter text-[13px] font-medium text-label">Aucune notification</p>
                <p className="font-inter text-[12px] text-subtle">
                  Les alertes santé, stock et retrait apparaîtront ici.
                </p>
              </div>
            ) : (
              notifications.map((n) => {
                const style = NIVEAU_STYLE[n.niveau];
                return (
                  <div
                    key={n.id}
                    onClick={() => handleItemClick(n)}
                    className={`group relative flex cursor-pointer items-start gap-3 px-4 py-3 transition-colors hover:bg-surface ${
                      n.read ? "" : "bg-primary-light/40"
                    }`}
                  >
                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px] ${style.tile}`}>
                      <Icon name={TYPE_ICON[n.type]} size={17} className={style.icon} />
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-inter text-[13px] font-semibold text-label">{n.title}</span>
                        {!n.read && <span className="h-[7px] w-[7px] shrink-0 rounded-full bg-primary" />}
                      </div>
                      <span className="font-inter text-[12px] leading-snug text-subtle">{n.message}</span>
                      <span className="mt-0.5 font-inter text-[11px] text-placeholder">{relativeTime(n.receivedAt)}</span>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); remove(n.id); }}
                      aria-label="Supprimer la notification"
                      className="shrink-0 rounded-[5px] p-1 text-placeholder opacity-0 transition-all hover:bg-border-light hover:text-label group-hover:opacity-100"
                    >
                      <Icon name="x" size={14} />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="flex items-center justify-between border-t border-border-light px-4 py-2.5">
              <button
                onClick={clearAll}
                className="font-inter text-[12px] font-medium text-subtle transition-colors hover:text-danger"
              >
                Tout effacer
              </button>
              <button
                onClick={() => { setOpen(false); router.push("/administration/alertes"); }}
                className="flex items-center gap-1 font-inter text-[12px] font-medium text-primary transition-colors hover:text-primary-hover"
              >
                Configurer les alertes
                <Icon name="arrow-right" size={12} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
