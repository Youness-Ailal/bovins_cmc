"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import type { Role } from "@/lib/permissions";

/**
 * Blocks rendering and redirects to /dashboard when the current user's role
 * is not in `allow`. Must sit inside AuthGuard (assumes `user` is resolved).
 */
export default function RoleGuard({ allow, children }: { allow: Role[]; children: React.ReactNode }) {
  const { user } = useAuth();
  const router = useRouter();
  const authorized = !!user && allow.includes(user.role);

  useEffect(() => {
    if (user && !authorized) router.replace("/dashboard");
  }, [user, authorized, router]);

  if (!authorized) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-surface">
        <span className="font-inter text-sm text-placeholder">Chargement…</span>
      </div>
    );
  }

  return <>{children}</>;
}
