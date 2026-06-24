const asyncHandler = require('../utils/asyncHandler');
const Animal = require('../models/Animal');
const StockArticle = require('../models/StockArticle');
const Traitement = require('../models/Traitement');
const Alerte = require('../models/Alerte');
const Distribution = require('../models/Distribution');

function getDateRange(query) {
  const { dateFrom, dateTo } = query;
  if (!dateFrom && !dateTo) return null;

  const from = dateFrom ? new Date(`${dateFrom}T00:00:00.000Z`) : null;
  const to = dateTo ? new Date(`${dateTo}T00:00:00.000Z`) : null;

  if ((from && Number.isNaN(from.getTime())) || (to && Number.isNaN(to.getTime()))) {
    return { error: 'Période invalide. Utilisez le format AAAA-MM-JJ.' };
  }
  if (from && to && from > to) {
    return { error: 'La date de début doit précéder la date de fin.' };
  }

  return {
    from,
    toExclusive: to ? new Date(to.getTime() + 24 * 60 * 60 * 1000) : null,
  };
}

function dateFilter(field, range) {
  if (!range) return {};
  const condition = {};
  if (range.from) condition.$gte = range.from;
  if (range.toExclusive) condition.$lt = range.toExclusive;
  return Object.keys(condition).length ? { [field]: condition } : {};
}

// GET /api/dashboard  (UC-18)
exports.summary = asyncHandler(async (req, res) => {
  const range = getDateRange(req.query);
  if (range?.error) return res.status(400).json({ success: false, message: range.error });

  const actifs = await Animal.find({ statut: 'Actif' }).populate('race', 'poidsAbattage');

  const troupeauTotal = actifs.length;
  const gmqMoyen = troupeauTotal
    ? Number((actifs.reduce((s, a) => s + a.gmqActuel, 0) / troupeauTotal).toFixed(2))
    : 0;
  // Coût/kg = coût total cumulé / poids vif total (MAD par kg de poids vif)
  const poidsTotal = actifs.reduce((s, a) => s + (a.poidsActuel || 0), 0);
  const coutTotalCumule = actifs.reduce((s, a) => s + a.coutCumule, 0);
  const coutKgMoyen = poidsTotal > 0 ? Number((coutTotalCumule / poidsTotal).toFixed(2)) : 0;

  // Répartition par phase
  const repartition = { Veau: 0, Croissance: 0, Engraissement: 0, Finition: 0 };
  for (const a of actifs) repartition[a.phase] = (repartition[a.phase] || 0) + 1;

  // Coût breakdown (mock split based on cumulative cost; backend-true once distributions/treatments accrue)
  const coutTotal = Math.round(actifs.reduce((s, a) => s + a.coutCumule, 0));

  // Stock levels
  const articles = await StockArticle.find().sort('quantite').limit(6);
  const stock = articles.map((a) => ({
    id: a.id,
    nom: a.designation,
    quantite: a.quantite,
    unite: a.unite,
    seuil: a.seuil,
    statut: a.statut,
  }));

  // Upcoming treatments
  const traitementFilter = { statut: { $in: ['En cours', 'Planifié'] } };
  if (range?.from || range?.toExclusive) {
    traitementFilter.$and = [];
    if (range.toExclusive) traitementFilter.$and.push({ dateDebut: { $lt: range.toExclusive } });
    if (range.from) {
      traitementFilter.$and.push({
        $or: [{ dateFin: null }, { dateFin: { $gte: range.from } }],
      });
    }
  }
  const traitements = await Traitement.find(traitementFilter)
    .populate('animal', 'identifiant')
    .sort('-dateDebut')
    .limit(5);

  // Active alerts
  const alerteFilter = { traitee: false, ...dateFilter('date', range) };
  const alertes = await Alerte.find(alerteFilter).sort('-date').limit(5);
  const alertesActives = await Alerte.countDocuments(alerteFilter);

  // Ready to sell count
  const now = new Date();
  const pretsAVendre = actifs.filter((a) => {
    const cible = a.race?.poidsAbattage || 0;
    const retraitOk = !a.delaiRetraitFin || a.delaiRetraitFin <= now;
    return cible > 0 && a.poidsActuel >= cible && retraitOk;
  }).length;

  res.json({
    success: true,
    data: {
      kpis: { gmqMoyen, troupeauTotal, coutKgMoyen, alertesActives, pretsAVendre },
      repartition,
      coutTotal,
      stock,
      traitements,
      alertes,
    },
  });
});

// GET /api/dashboard/rentabilite — herd profitability summary (UC-17 aggregate)
exports.rentabilite = asyncHandler(async (req, res) => {
  const range = getDateRange(req.query);
  if (range?.error) return res.status(400).json({ success: false, message: range.error });

  const distributions = await Distribution.find(dateFilter('date', range));
  const alimentation = Math.round(distributions.reduce((s, d) => s + d.coutEstime, 0));

  const animaux = await Animal.find(dateFilter('dateEntree', range));
  const achat = Math.round(animaux.reduce((s, a) => s + (a.poidsEntree || 0) * 30, 0));
  const veterinaire = Math.round(animaux.length * 56); // placeholder per-head vet cost

  res.json({
    success: true,
    data: {
      alimentation,
      veterinaire,
      achat,
      total: alimentation + veterinaire + achat,
    },
  });
});
