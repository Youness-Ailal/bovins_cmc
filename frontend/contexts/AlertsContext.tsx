"use client";

import { createContext, useContext, useCallback } from "react";
import { useAlerts } from "@/hooks/useAlerts";
import { useToast } from "@/components/ui/Toast";
import { usePathname } from "next/navigation";

interface AlertsContextValue {
  unreadCount: number;
  resetUnread: () => void;
}

const AlertsContext = createContext<AlertsContextValue>({ unreadCount: 0, resetUnread: () => {} });

export function AlertsProvider({ children }: { children: React.ReactNode }) {
  const { info } = useToast();
  const pathname = usePathname();

  const handleAlert = useCallback(
    (payload: { message: string }) => {
      info(payload.message);
    },
    [info]
  );

  const { unreadCount, resetUnread } = useAlerts(handleAlert);

  // Auto-reset badge when the user is on the Alertes page
  const effectiveCount = pathname.startsWith("/performance") ? 0 : unreadCount;

  return (
    <AlertsContext.Provider value={{ unreadCount: effectiveCount, resetUnread }}>
      {children}
    </AlertsContext.Provider>
  );
}

export function useAlertsContext() {
  return useContext(AlertsContext);
}
