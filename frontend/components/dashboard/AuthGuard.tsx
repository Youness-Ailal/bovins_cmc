"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { canAccessPath } from "@/lib/roleAccess";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const authorized = !!user && canAccessPath(user.role, pathname);

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
    else if (!loading && user && !authorized) router.replace("/dashboard");
  }, [authorized, loading, router, user]);

  if (loading || !user || !authorized) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-surface">
        <span className="font-inter text-sm text-placeholder">Chargement...</span>
      </div>
    );
  }

  return <>{children}</>;
}
