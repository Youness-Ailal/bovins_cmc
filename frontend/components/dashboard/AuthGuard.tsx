"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

/**
 * Blocks dashboard rendering until auth is resolved; redirects to /login
 * when there is no authenticated user.
 */
export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-surface">
        <span className="font-inter text-sm text-placeholder">Chargement…</span>
      </div>
    );
  }

  return <>{children}</>;
}
