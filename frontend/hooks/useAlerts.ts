"use client";

import { useEffect, useRef, useState } from "react";
import { getSocket } from "@/lib/socket";
import { getToken } from "@/lib/api";

export interface AlertePayload {
  type: "alerte:stock" | "alerte:sante" | "alerte:retrait";
  message: string;
  receivedAt: number;
}

export function useAlerts(onAlert?: (payload: AlertePayload) => void) {
  const [unreadCount, setUnreadCount] = useState(0);
  const onAlertRef = useRef(onAlert);
  onAlertRef.current = onAlert;

  useEffect(() => {
    const token = getToken();
    if (!token) return;

    const socket = getSocket(token);

    function handleStock(data: { designation: string; quantite: number; seuil: number; niveau: string }) {
      const payload: AlertePayload = {
        type: "alerte:stock",
        message: `Stock ${data.niveau === "Critique" ? "critique" : "faible"} : ${data.designation} (${data.quantite}/${data.seuil})`,
        receivedAt: Date.now(),
      };
      setUnreadCount((n) => n + 1);
      onAlertRef.current?.(payload);
    }

    function handleSante(data: { identifiant: string; message: string }) {
      const payload: AlertePayload = {
        type: "alerte:sante",
        message: data.message,
        receivedAt: Date.now(),
      };
      setUnreadCount((n) => n + 1);
      onAlertRef.current?.(payload);
    }

    function handleRetrait(data: { identifiant: string; dateFinRetrait: string }) {
      const payload: AlertePayload = {
        type: "alerte:retrait",
        message: `Délai de retrait terminé pour ${data.identifiant}`,
        receivedAt: Date.now(),
      };
      setUnreadCount((n) => n + 1);
      onAlertRef.current?.(payload);
    }

    socket.on("alerte:stock", handleStock);
    socket.on("alerte:sante", handleSante);
    socket.on("alerte:retrait", handleRetrait);

    return () => {
      socket.off("alerte:stock", handleStock);
      socket.off("alerte:sante", handleSante);
      socket.off("alerte:retrait", handleRetrait);
    };
  }, []);

  function resetUnread() {
    setUnreadCount(0);
  }

  return { unreadCount, resetUnread };
}
