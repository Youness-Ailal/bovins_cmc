const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const Animal = require('../models/Animal');
const Parametres = require('../models/Parametres');

async function getPrix() {
  const p = await Parametres.findOne();
  return {
    prixVente: p?.prixVenteKgMoyen ?? 35,
    prixAchat: p?.prixAchatKgMoyen ?? 30,
  };
}

function calcAnimal(animal, prixVente, prixAchat) {
  const coutAchat = Math.round((animal.poidsEntree || 0) * prixAchat);
  const coutRestant = Math.max(0, animal.coutCumule - coutAchat);
  const coutAlimentation = Math.round(coutRestant * 0.7);
  const coutSante = Math.round(coutRestant * 0.3);
  const revenu = Math.round((animal.poidsActuel || 0) * prixVente);
  const benefice = revenu - animal.coutCumule;
  const marge = animal.coutCumule > 0
    ? Math.round((benefice / animal.coutCumule) * 100)
    : 0;

  return {
    id: animal.id,
    identifiant: animal.identifiant,
    race: animal.race?.nom ?? '',
    phase: animal.phase,
    poidsEntree: animal.poidsEntree,
    poidsActuel: animal.poidsActuel,
    gmqActuel: animal.gmqActuel,
    coutAchat,
    coutAlimentation,
    coutSante,
    coutTotal: Math.round(animal.coutCumule),
    revenu,
    benefice,
    marge,
    jours: animal.dateEntree
      ? Math.max(1, Math.round((Date.now() - new Date(animal.dateEntree).getTime()) / 86400000))
      : 1,
  };
}

// GET /api/finances/troupeau — bilan global du troupeau
exports.bilanTroupeau = asyncHandler(async (req, res) => {
  const { prixVente, prixAchat } = await getPrix();
  const actifs = await Animal.find({ statut: 'Actif' }).populate('race', 'nom poidsAbattage');

  const animaux = actifs.map((a) => calcAnimal(a, prixVente, prixAchat));

  const coutTotal = animaux.reduce((s, a) => s + a.coutTotal, 0);
  const revenuTotal = animaux.reduce((s, a) => s + a.revenu, 0);
  const beneficeTotal = revenuTotal - coutTotal;
  const margeGlobale = coutTotal > 0 ? Math.round((beneficeTotal / coutTotal) * 100) : 0;
  const nbRentables = animaux.filter((a) => a.marge > 0).length;

  const sortedByMarge = [...animaux].sort((a, b) => b.marge - a.marge);
  const top5 = sortedByMarge.slice(0, 5);
  const bottom5 = sortedByMarge.slice(-5).reverse();

  res.json({
    success: true,
    data: {
      kpis: { coutTotal, revenuTotal, beneficeTotal, margeGlobale, nbRentables, total: animaux.length },
      top5,
      bottom5,
      animaux,
      prixVente,
      prixAchat,
    },
  });
});

// GET /api/finances/animal/:id — détail financier d'un animal
exports.bilanAnimal = asyncHandler(async (req, res) => {
  const { prixVente, prixAchat } = await getPrix();
  const animal = await Animal.findById(req.params.id).populate('race', 'nom poidsAbattage');
  if (!animal) throw ApiError.notFound('Animal introuvable');

  const detail = calcAnimal(animal, prixVente, prixAchat);
  const coutJour = detail.jours > 0 ? Math.round(detail.coutTotal / detail.jours) : 0;

  res.json({
    success: true,
    data: { ...detail, coutJour, prixVente, prixAchat },
  });
});

// GET /api/finances/projection?ids=id1,id2 — revenu projeté pour une sélection
exports.projection = asyncHandler(async (req, res) => {
  const { prixVente } = await getPrix();
  const ids = req.query.ids ? String(req.query.ids).split(',') : [];
  if (ids.length === 0) return res.json({ success: true, data: { revenu: 0, count: 0 } });

  const animaux = await Animal.find({ _id: { $in: ids }, statut: 'Actif' });
  const revenu = animaux.reduce((s, a) => s + (a.poidsActuel || 0) * prixVente, 0);
  const coutTotal = animaux.reduce((s, a) => s + a.coutCumule, 0);

  res.json({
    success: true,
    data: {
      revenu: Math.round(revenu),
      coutTotal: Math.round(coutTotal),
      benefice: Math.round(revenu - coutTotal),
      count: animaux.length,
    },
  });
});
