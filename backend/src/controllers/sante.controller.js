const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const Traitement = require('../models/Traitement');
const EtatSante = require('../models/EtatSante');
const PlanTraitement = require('../models/PlanTraitement');
const Animal = require('../models/Animal');
const StockArticle = require('../models/StockArticle');
const Alerte = require('../models/Alerte');
const Parametres = require('../models/Parametres');
const { checkLowStock } = require('./stock.controller');
const { streamCarnet, streamRegistreTraitements } = require('../utils/pdfGenerator');

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

// ─── Carnet de santé PDF (Plan 05) ────────────────────────────────────────────
// GET /api/sante/animal/:id/carnet
exports.carnet = asyncHandler(async (req, res) => {
  const animal = await Animal.findById(req.params.id)
    .populate('race', 'nom')
    .populate('parcelle', 'nom');
  if (!animal) throw ApiError.notFound('Animal introuvable');

  const [etats, traitements, plans] = await Promise.all([
    EtatSante.find({ animal: animal._id }).sort('-date'),
    Traitement.find({ animal: animal._id }).sort('-dateDebut'),
    PlanTraitement.find({ animal: animal._id }).sort('datePrevue'),
  ]);

  const now = new Date();
  const delaiActif = animal.delaiRetraitFin && animal.delaiRetraitFin > now ? animal.delaiRetraitFin : null;

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="carnet-sante-${animal.identifiant}.pdf"`);

  streamCarnet(res, {
    identite: {
      identifiant: animal.identifiant,
      nni: animal.nni || '—',
      race: animal.race?.nom || '—',
      sexe: animal.sexe,
      phase: animal.phase,
      parcelle: animal.parcelle?.nom || '—',
      etatSante: animal.etatSante,
    },
    delaiRetrait: delaiActif,
    etats: etats.map((e) => ({
      date: e.date,
      etat: e.etat,
      temperature: e.temperature,
      observation: e.symptomes || e.action || '—',
    })),
    traitements: traitements.map((t) => ({
      produit: t.produit,
      type: t.type,
      dose: `${t.dose || 0} ${t.doseUnite || ''}`.trim(),
      periode: t.dateFin
        ? `${new Date(t.dateDebut).toLocaleDateString('fr-FR')} → ${new Date(t.dateFin).toLocaleDateString('fr-FR')}`
        : `${new Date(t.dateDebut).toLocaleDateString('fr-FR')} (en cours)`,
      veterinaire: t.veterinaire || '—',
    })),
    plans: plans.map((p) => ({
      type: p.type,
      produit: p.produit || '—',
      datePrevue: p.datePrevue,
      frequence: p.frequence,
      statut: p.statut,
    })),
  });
});

// GET /api/sante/traitements/registre — registre vétérinaire (PDF, tous les traitements)
exports.registreTraitements = asyncHandler(async (req, res) => {
  const [traitements, params] = await Promise.all([
    Traitement.find().populate('animal', 'identifiant').sort('-dateDebut'),
    Parametres.findOne(),
  ]);

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="registre-traitements.pdf"');

  streamRegistreTraitements(res, {
    ferme: params?.nomFerme || 'BOVITRACK',
    total: traitements.length,
    traitements: traitements.map((t) => ({
      animal: t.animal?.identifiant || '—',
      dateDebut: t.dateDebut,
      produit: t.produit,
      type: t.type,
      dose: `${t.dose || 0} ${t.doseUnite || ''}`.trim(),
      voie: t.voie || '—',
      veterinaire: t.veterinaire || '—',
      delaiRetrait: t.delaiRetrait || 0,
      statut: t.statut,
    })),
  });
});
