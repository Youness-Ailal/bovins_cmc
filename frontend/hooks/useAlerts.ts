"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getSocket } from "@/lib/socket";
import { getToken } from "@/lib/api";

export type NotificationType = "stock" | "sante" | "retrait" | "systeme";
export type NotificationNiveau = "Critique" | "Avertissement" | "Info";

export interface Notification {
  id: string;
  type: NotificationType;
  niveau: NotificationNiveau;
  title: string;
  message: string;
  href?: string;
  receivedAt: number;
  read: boolean;
}

// Kept for callers that only want a transient toast on each incoming alert.
export interface AlertePayload {
  type: "alerte:stock" | "alerte:sante" | "alerte:retrait";
  message: string;
  receivedAt: number;
}

const STORAGE_KEY = "bovitrack:notifications";
const MAX_STORED = 50;

// Seed data so the feed is demonstrable before any live socket event arrives.
// Only used the very first time (when storage has never been written).
function seed(): Notification[] {
  const now = Date.now();
  return [
    {
      id: "seed-1",
      type: "sante",
      niveau: "Critique",
      title: "Alerte santé",
      message: "FR-2847 présente des signes de boiterie — examen recommandé.",
      href: "/sante",
      receivedAt: now - 8 * 60 * 1000,
      read: false,
    },
    {
      id: "seed-2",
      type: "stock",
      niveau: "Avertissement",
      title: "Stock faible",
      message: "Aliment concentré sous le seuil d'alerte (180/200 kg).",
      href: "/stocks",
      receivedAt: now - 52 * 60 * 1000,
      read: false,
    },
    {
      id: "seed-3",
      type: "retrait",
      niveau: "Info",
      title: "Délai de retrait terminé",
      message: "FR-2611 peut être commercialisé : délai de retrait écoulé.",
      href: "/animaux",
      receivedAt: now - 5 * 60 * 60 * 1000,
      read: true,
    },
  ];
}

function load(): Notification[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === null) {
      const seeded = seed();
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
      return seeded;
    }
    return JSON.parse(raw) as Notification[];
  } catch {
    return [];
  }
}

function persist(items: Notification[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, MAX_STORED)));
  } catch {
    // ignore quota / serialization errors — notifications are best-effort
  }
}

function makeId() {
  return `n-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function useAlerts(onAlert?: (payload: AlertePayload) => void) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const onAlertRef = useRef(onAlert);
  onAlertRef.current = onAlert;

  // Hydrate from storage on mount (client only, avoids SSR mismatch).
  useEffect(() => {
    setNotifications(load());
  }, []);

  const add = useCallback((n: Notification) => {
    setNotifications((prev) => {
      const next = [n, ...prev].slice(0, MAX_STORED);
      persist(next);
      return next;
    });
  }, []);

  useEffect(() => {
    const token = getToken();
    if (!token) return;

    const socket = getSocket(token);

    function handleStock(data: { designation: string; quantite: number; seuil: number; niveau: string }) {
      const critique = data.niveau === "Critique";
      add({
        id: makeId(),
        type: "stock",
        niveau: critique ? "Critique" : "Avertissement",
        title: critique ? "Stock critique" : "Stock faible",
        message: `${data.designation} — ${data.quantite}/${data.seuil} en stock.`,
        href: "/stocks",
        receivedAt: Date.now(),
        read: false,
      });
      onAlertRef.current?.({
        type: "alerte:stock",
        message: `Stock ${critique ? "critique" : "faible"} : ${data.designation} (${data.quantite}/${data.seuil})`,
        receivedAt: Date.now(),
      });
    }

    function handleSante(data: { identifiant: string; message: string }) {
      add({
        id: makeId(),
        type: "sante",
        niveau: "Critique",
        title: "Alerte santé",
        message: data.message,
        href: "/sante",
        receivedAt: Date.now(),
        read: false,
      });
      onAlertRef.current?.({ type: "alerte:sante", message: data.message, receivedAt: Date.now() });
    }

    function handleRetrait(data: { identifiant: string; dateFinRetrait: string }) {
      const message = `Délai de retrait terminé pour ${data.identifiant}.`;
      add({
        id: makeId(),
        type: "retrait",
        niveau: "Info",
        title: "Délai de retrait terminé",
        message,
        href: "/animaux",
        receivedAt: Date.now(),
        read: false,
      });
      onAlertRef.current?.({ type: "alerte:retrait", message, receivedAt: Date.now() });
    }

    socket.on("alerte:stock", handleStock);
    socket.on("alerte:sante", handleSante);
    socket.on("alerte:retrait", handleRetrait);

    return () => {
      socket.off("alerte:stock", handleStock);
      socket.off("alerte:sante", handleSante);
      socket.off("alerte:retrait", handleRetrait);
    };
  }, [add]);

  const unreadCount = notifications.reduce((n, item) => (item.read ? n : n + 1), 0);

  const markRead = useCallback((id: string) => {
    setNotifications((prev) => {
      const next = prev.map((n) => (n.id === id ? { ...n, read: true } : n));
      persist(next);
      return next;
    });
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications((prev) => {
      const next = prev.map((n) => ({ ...n, read: true }));
      persist(next);
      return next;
    });
  }, []);

  const remove = useCallback((id: string) => {
    setNotifications((prev) => {
      const next = prev.filter((n) => n.id !== id);
      persist(next);
      return next;
    });
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
    persist([]);
  }, []);

  return { notifications, unreadCount, markRead, markAllRead, remove, clearAll };
}
