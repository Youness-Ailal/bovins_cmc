"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { usePathname } from "next/navigation";
import { getSocket } from "@/lib/socket";
import { api, getToken } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";
import type { Alerte } from "@/lib/types";

interface AlertsContextValue {
  unread: number;
  recent: Alerte[];
  markRead: () => void;
}

const AlertsContext = createContext<AlertsContextValue>({
  unread: 0,
  recent: [],
  markRead: () => {},
});

/**
 * Connects the realtime socket once for the dashboard, listens for `alerte:new`
 * events, raises a toast and keeps an unread counter (cleared when the user
 * visits the alerts page). Lives in the dashboard layout so the Sidebar badge
 * and every page share the same state.
 */
export function AlertsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { toast } = useToast();
  const [unread, setUnread] = useState(0);
  const [recent, setRecent] = useState<Alerte[]>([]);

  // Seed the badge with the count of currently-untreated alerts.
  useEffect(() => {
    let active = true;
    api
      .get<Alerte[]>("/alertes")
      .then((list) => {
        if (active) setUnread(list.filter((a) => !a.traitee).length);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  // Connect + listen for live alerts.
  useEffect(() => {
    const token = getToken();
    if (!token) return;
    const socket = getSocket(token);

    const onAlerte = (a: Alerte) => {
      setRecent((prev) => [a, ...prev].slice(0, 30));
      setUnread((n) => n + 1);
      toast(a.message, a.niveau === "Critique" ? "error" : "info");
    };

    socket.on("alerte:new", onAlerte);
    return () => {
      socket.off("alerte:new", onAlerte);
    };
  }, [toast]);

  // Visiting the alerts page clears the unread badge.
  useEffect(() => {
    if (pathname.startsWith("/performance")) setUnread(0);
  }, [pathname]);

  const markRead = useCallback(() => setUnread(0), []);

  return (
    <AlertsContext.Provider value={{ unread, recent, markRead }}>
      {children}
    </AlertsContext.Provider>
  );
}

export function useAlerts(): AlertsContextValue {
  return useContext(AlertsContext);
}
