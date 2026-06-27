"use client";

import { createContext, useContext, useCallback } from "react";
import { useAlerts, type Notification } from "@/hooks/useAlerts";
import { useToast } from "@/components/ui/Toast";

interface AlertsContextValue {
  notifications: Notification[];
  unreadCount: number;
  markRead: (id: string) => void;
  markAllRead: () => void;
  remove: (id: string) => void;
  clearAll: () => void;
}

const AlertsContext = createContext<AlertsContextValue>({
  notifications: [],
  unreadCount: 0,
  markRead: () => {},
  markAllRead: () => {},
  remove: () => {},
  clearAll: () => {},
});

export function AlertsProvider({ children }: { children: React.ReactNode }) {
  const { info } = useToast();

  const handleAlert = useCallback(
    (payload: { message: string }) => {
      info(payload.message);
    },
    [info]
  );

  const { notifications, unreadCount, markRead, markAllRead, remove, clearAll } = useAlerts(handleAlert);

  return (
    <AlertsContext.Provider value={{ notifications, unreadCount, markRead, markAllRead, remove, clearAll }}>
      {children}
    </AlertsContext.Provider>
  );
}

export function useAlertsContext() {
  return useContext(AlertsContext);
}
