// Central role groups used by restrictTo() across routes.
// Keeping the matrix here (instead of scattered string literals) makes the
// access model auditable in one place.

const ADMIN = 'Admin';
const RESPONSABLE = 'Responsable';
const VETERINAIRE = 'Vétérinaire';
const OPERATEUR = 'Opérateur';

module.exports = {
  ADMIN,
  RESPONSABLE,
  VETERINAIRE,
  OPERATEUR,

  // Farm management: animal records, races, parcelles, stock catalogue, rations.
  GESTION_FERME: [ADMIN, RESPONSABLE],
  // Veterinary/medical record-keeping.
  GESTION_SANTE: [ADMIN, VETERINAIRE],
  // Day-to-day field entries any active role can log (pesée, mouvement, distribution).
  SAISIE_TERRAIN: [ADMIN, RESPONSABLE, VETERINAIRE, OPERATEUR],
  // Sortie/mortalité: farm managers + vet (medical judgment call), not field hands.
  SAISIE_SORTIE: [ADMIN, RESPONSABLE, VETERINAIRE],
  // Stock/ration logging an operator can do without managing the catalogue.
  SAISIE_STOCK_RATION: [ADMIN, RESPONSABLE, OPERATEUR],
  // Acknowledge/dismiss alerts: anyone operationally responsible, not field-only.
  GESTION_ALERTES: [ADMIN, RESPONSABLE, VETERINAIRE],
};
