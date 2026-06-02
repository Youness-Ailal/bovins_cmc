"use client";

import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/Toast";

/**
 * Returns a helper to call after a (mock) save succeeds: shows a success toast
 * and optionally redirects after a short delay so the toast is visible.
 *
 * Usage:
 *   const notifySaved = useSaveToast();
 *   function handleSubmit(e) {
 *     e.preventDefault();
 *     // TODO: await api.save(...)
 *     notifySaved("Animal enregistré avec succès", "/animaux");
 *   }
 */
export function useSaveToast() {
  const router = useRouter();
  const { success } = useToast();

  return (message: string, redirectTo?: string) => {
    success(message);
    if (redirectTo) {
      setTimeout(() => router.push(redirectTo), 700);
    }
  };
}
