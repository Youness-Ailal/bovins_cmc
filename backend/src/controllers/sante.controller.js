const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const Traitement = require('../models/Traitement');
const EtatSante = require('../models/EtatSante');
const PlanTraitement = require('../models/PlanTraitement');
const Animal = require('../models/Animal');
const StockArticle = require('../models/StockArticle');
const Alerte = require('../models/Alerte');
const { checkLowStock } = require('./stock.controller');

// ─── Traitements (UC-12) ──────────────────────────────────────────────────────
exports.listTraitements = asyncHandler(async (req, res) => {
  const traitements = await Traitement.find()
    .populate({ path: 'animal', select: 'identifiant', populate: { path: 'race', select: 'nom' } })
    .sort('-dateDebut');
  res.json({ success: true, data: traitements, meta: { total: traitements.length } });
});

exports.createTraitement = asyncHandler(async (req, res) => {
  const animal = await Animal.findById(req.body.animal);
  if (!animal) throw ApiError.notFound('Animal introuvable');

  const traitement = await Traitement.create(req.body);

  // «include» Déduire stock médicament
  if (req.body.article) {
    const article = await StockArticle.findById(req.body.article);
    if (article) {
      article.quantite = Math.max(0, article.quantite - (Number(req.body.dose) || 0));
      await article.save();
      await checkLowStock(article);
    }
  }

  // «include» Calculer délai de retrait — set on animal & mark "En traitement"
  const delai = Number(req.body.delaiRetrait) || 0;
  if (delai > 0) {
    const fin = new Date();
    fin.setDate(fin.getDate() + delai);
    animal.delaiRetraitFin = fin;
  }
  animal.etatSante = 'En traitement';
  await animal.save();

  res.status(201).json({ success: true, data: traitement });
});

exports.updateTraitement = asyncHandler(async (req, res) => {
  const traitement = await Traitement.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!traitement) throw ApiError.notFound();
  res.json({ success: true, data: traitement });
});

exports.removeTraitement = asyncHandler(async (req, res) => {
  const traitement = await Traitement.findByIdAndDelete(req.params.id);
  if (!traitement) throw ApiError.notFound();
  res.json({ success: true, data: { id: req.params.id } });
});

// ─── États de santé (UC-13) ───────────────────────────────────────────────────
exports.listEtats = asyncHandler(async (req, res) => {
  // latest state per active animal
  const animaux = await Animal.find({ statut: 'Actif' })
    .populate('race', 'nom')
    .select('identifiant race etatSante delaiRetraitFin');
  const now = new Date();
  const data = await Promise.all(
    animaux.map(async (a) => {
      const last = await EtatSante.findOne({ animal: a._id }).sort('-date');
      const delai = a.delaiRetraitFin && a.delaiRetraitFin > now
        ? `${Math.ceil((a.delaiRetraitFin - now) / 86400000)} j restants`
        : '—';
      return {
        id: a.id,
        identifiant: a.identifiant,
        race: a.race?.nom || '',
        etat: a.etatSante,
        temperature: last?.temperature != null ? `${last.temperature} °C` : '—',
        derniereObs: last ? last.date : null,
        delaiRetrait: delai,
      };
    })
  );
  res.json({ success: true, data, meta: { total: data.length } });
});

exports.createEtat = asyncHandler(async (req, res) => {
  const animal = await Animal.findById(req.body.animal);
  if (!animal) throw ApiError.notFound('Animal introuvable');

  const etat = await EtatSante.create(req.body);
  // Reflect on animal record
  if (req.body.etat) {
    animal.etatSante = req.body.etat;
    await animal.save();
  }
  if (req.body.etat === 'Malade') {
    await Alerte.create({
      niveau: 'Critique',
      categorie: 'sante',
      message: `Animal malade signalé: ${animal.identifiant}`,
      concerne: animal.identifiant,
    });
  }
  res.status(201).json({ success: true, data: etat });
});

// ─── Planification (UC-14) ────────────────────────────────────────────────────
exports.listPlans = asyncHandler(async (req, res) => {
  const plans = await PlanTraitement.find()
    .populate('animal', 'identifiant')
    .sort('datePrevue');
  res.json({ success: true, data: plans, meta: { total: plans.length } });
});

exports.createPlan = asyncHandler(async (req, res) => {
  const plan = await PlanTraitement.create(req.body);
  res.status(201).json({ success: true, data: plan });
});

exports.updatePlan = asyncHandler(async (req, res) => {
  const plan = await PlanTraitement.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!plan) throw ApiError.notFound();
  res.json({ success: true, data: plan });
});

exports.removePlan = asyncHandler(async (req, res) => {
  const plan = await PlanTraitement.findByIdAndDelete(req.params.id);
  if (!plan) throw ApiError.notFound();
  res.json({ success: true, data: { id: req.params.id } });
});
