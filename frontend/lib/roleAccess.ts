import type { User } from "@/lib/types";

export type Role = User["role"];

const ACCESS: Record<Role, string[]> = {
  Admin: ["/"],
  Responsable: [
    "/dashboard",
    "/animaux",
    "/parcelles",
    "/stocks",
    "/rations",
    "/finances",
    "/fournisseurs",
    "/performance",
  ],
  "Vétérinaire": [
    "/dashboard",
    "/animaux",
    "/sante",
    "/performance",
    "/boviai",
  ],
};

export function canAccessPath(role: Role | undefined | null, pathname: string): boolean {
  if (!role) return false;
  if (role === "Admin") return true;
  const allowedPaths = ACCESS[role];
  if (!allowedPaths) return false;
  return allowedPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

export function filterByRole<T extends { href: string }>(role: Role | undefined | null, items: T[]): T[] {
  return items.filter((item) => canAccessPath(role, item.href));
}

export const roleAccessRows = [
  {
    role: "Admin",
    pages: "Toutes les pages",
    description: "Administration, utilisateurs, races, paramètres, données métier et modules de suivi.",
  },
  {
    role: "Responsable",
    pages: "Dashboard, Animaux, Parcelles, Stocks, Rations, Finances, Fournisseurs, Alertes",
    description: "Gestion opérationnelle et économique de la ferme, sans accès à l'administration.",
  },
  {
    role: "Vétérinaire",
    pages: "Dashboard, Animaux, Santé, Alertes, BoviAI",
    description: "Suivi sanitaire, traitements, alertes et consultation du contexte animal.",
  },
] as const;
