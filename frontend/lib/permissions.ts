// Frontend mirror of backend/src/config/roles.js — UI gating only.
// The backend restrictTo() middleware is the real security boundary; this
// just hides/disables actions a role can't perform so the UI doesn't lie.

import type { User } from "./types";

export type Role = User["role"];

const ADMIN: Role = "Admin";
const RESPONSABLE: Role = "Responsable";
const VETERINAIRE: Role = "Vétérinaire";
const OPERATEUR: Role = "Opérateur";

const GESTION_FERME: Role[] = [ADMIN, RESPONSABLE];
const GESTION_SANTE: Role[] = [ADMIN, VETERINAIRE];
const SAISIE_TERRAIN: Role[] = [ADMIN, RESPONSABLE, VETERINAIRE, OPERATEUR];
const SAISIE_SORTIE: Role[] = [ADMIN, RESPONSABLE, VETERINAIRE];
const SAISIE_STOCK_RATION: Role[] = [ADMIN, RESPONSABLE, OPERATEUR];
const GESTION_ALERTES: Role[] = [ADMIN, RESPONSABLE, VETERINAIRE];

/** Named permissions checked across the app; each maps to an allowed-role list. */
export const PERMISSIONS = {
  // Administration
  manageUsers: [ADMIN],
  manageParametres: [ADMIN],
  manageRaces: [ADMIN],
  // Animaux / Parcelles / Stock / Rations
  manageAnimaux: GESTION_FERME,
  managePhase: GESTION_FERME,
  saisieSortie: SAISIE_SORTIE,
  saisiePesee: SAISIE_TERRAIN,
  manageParcelles: GESTION_FERME,
  manageStockArticles: GESTION_FERME,
  saisieMouvementStock: SAISIE_STOCK_RATION,
  manageRations: GESTION_FERME,
  saisieDistribution: SAISIE_STOCK_RATION,
  // Santé
  manageSante: GESTION_SANTE,
  // Alertes
  manageAlertes: GESTION_ALERTES,
} as const;

export type Permission = keyof typeof PERMISSIONS;

/** Returns true if the given role is allowed to perform the named action. */
export function can(role: Role | undefined | null, permission: Permission): boolean {
  if (!role) return false;
  if (role === ADMIN) return true;
  return (PERMISSIONS[permission] as readonly Role[]).includes(role);
}

/** Only Admin can see/use the Administration area. */
export function isAdmin(role: Role | undefined | null): boolean {
  return role === ADMIN;
}
