/**
 * Domain calculations shared across controllers.
 */

/** Days between two dates (absolute, whole days). */
function daysBetween(a, b) {
  const ms = Math.abs(new Date(a).getTime() - new Date(b).getTime());
  return Math.max(1, Math.round(ms / 86400000));
}

/**
 * GMQ (Gain Moyen Quotidien) in kg/day between two weighings.
 * Returns null if it cannot be computed.
 */
function computeGMQ(poidsActuel, poidsPrecedent, dateActuelle, datePrecedente) {
  if (poidsPrecedent == null || poidsActuel == null) return null;
  const jours = daysBetween(dateActuelle, datePrecedente);
  const gain = poidsActuel - poidsPrecedent;
  if (jours <= 0) return null;
  return Number((gain / jours).toFixed(3));
}

/**
 * IC (Indice de Consommation) = kg aliment consommé / kg gagné.
 * feedKg and gainKg over the same period.
 */
function computeIC(feedKg, gainKg) {
  if (!gainKg || gainKg <= 0) return null;
  return Number((feedKg / gainKg).toFixed(2));
}

/** Total daily cost of a ration from its ingredients. */
function rationDailyCost(ingredients = []) {
  return Number(
    ingredients
      .reduce((sum, ing) => sum + (Number(ing.quantite) || 0) * (Number(ing.prixUnitaire) || 0), 0)
      .toFixed(2)
  );
}

module.exports = { daysBetween, computeGMQ, computeIC, rationDailyCost };
