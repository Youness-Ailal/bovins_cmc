const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const Animal = require('../models/Animal');
const Pesee = require('../models/Pesee');
const Traitement = require('../models/Traitement');
const Parcelle = require('../models/Parcelle');
const Alerte = require('../models/Alerte');
const { computeGMQ } = require('../utils/calculations');

const PHASES = ['Veau', 'Croissance', 'Engraissement', 'Finition'];

// GET /api/animaux  (supports ?race=&phase=&parcelle=&etatSante=&statut=&search=)
exports.list = asyncHandler(async (req, res) => {
  const { race, phase, parcelle, etatSante, statut, search } = req.query;
  const filter = {};
  if (race) filter.race = race;
  if (phase) filter.phase = phase;
  if (parcelle) filter.parcelle = parcelle;
  if (etatSante) filter.etatSante = etatSante;
  // statut=all → no filter (include sorted animals); otherwise default to Actif
  if (statut !== 'all') filter.statut = statut || 'Actif';
  if (search) filter.identifiant = { $regex: search, $options: 'i' };

  const animaux = await Animal.find(filter)
    .populate('race', 'nom poidsAbattage gmqCible')
    .populate('parcelle', 'nom')
    .sort('-createdAt');
  res.json({ success: true, data: animaux, meta: { total: animaux.length } });
});

// GET /api/animaux/prets-a-vendre  (UC-19)
exports.pretsAVendre = asyncHandler(async (req, res) => {
  const now = new Date();
  const animaux = await Animal.find({ statut: 'Actif' })
    .populate('race', 'nom poidsAbattage')
    .populate('parcelle', 'nom');

  const prets = animaux
    .filter((a) => {
      const cible = a.race?.poidsAbattage || 0;
      const retraitOk = !a.delaiRetraitFin || a.delaiRetraitFin <= now;
      return cible > 0 && a.poidsActuel >= cible && retraitOk;
    })
    .map((a) => {
      const coutJour = a.gmqActuel > 0 ? Number((a.coutCumule / 365).toFixed(2)) : 0;
      return { ...a.toJSON(), coutJour };
    })
    .sort((x, y) => y.coutJour - x.coutJour);

  res.json({ success: true, data: prets, meta: { total: prets.length } });
});

// GET /api/animaux/:id
exports.getOne = asyncHandler(async (req, res) => {
  const animal = await Animal.findById(req.params.id)
    .populate('race')
    .populate('parcelle', 'nom');
  if (!animal) throw ApiError.notFound();

  const pesees = await Pesee.find({ animal: animal._id }).sort('-date');
  const traitements = await Traitement.find({ animal: animal._id }).sort('-dateDebut');
  res.json({ success: true, data: { ...animal.toJSON(), pesees, traitements } });
});

// POST /api/animaux  (UC-01, with capacity check UC-05)
exports.create = asyncHandler(async (req, res) => {
  const body = { ...req.body };
  if (body.parcelle) {
    const parcelle = await Parcelle.findById(body.parcelle);
    if (!parcelle) throw ApiError.notFound('Parcelle introuvable');
    const occupants = await Animal.countDocuments({ parcelle: parcelle._id, statut: 'Actif' });
    if (occupants >= parcelle.capaciteMax) throw ApiError.conflict('Capacité maximale de la parcelle atteinte');
  }
  body.poidsActuel = body.poidsEntree || 0;
  body.coutCumule = body.coutCumule || 0;
  const animal = await Animal.create(body);
  res.status(201).json({ success: true, data: animal });
});

// PUT /api/animaux/:id
exports.update = asyncHandler(async (req, res) => {
  const animal = await Animal.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!animal) throw ApiError.notFound();
  res.json({ success: true, data: animal });
});

// DELETE /api/animaux/:id
exports.remove = asyncHandler(async (req, res) => {
  const animal = await Animal.findByIdAndDelete(req.params.id);
  if (!animal) throw ApiError.notFound();
  await Pesee.deleteMany({ animal: req.params.id });
  res.json({ success: true, data: { id: req.params.id } });
});

// ─── Pesées (UC-02 «include» Calculer GMQ) ────────────────────────────────────
// GET /api/animaux/:id/pesees
exports.listPesees = asyncHandler(async (req, res) => {
  const pesees = await Pesee.find({ animal: req.params.id }).sort('-date');
  res.json({ success: true, data: pesees, meta: { total: pesees.length } });
});

// POST /api/animaux/:id/pesees
exports.addPesee = asyncHandler(async (req, res) => {
  const animal = await Animal.findById(req.params.id);
  if (!animal) throw ApiError.notFound('Animal introuvable');

  const { poids, date, observateur, notes } = req.body;
  if (poids == null) throw ApiError.badRequest('Le poids est requis');

  const last = await Pesee.findOne({ animal: animal._id }).sort('-date');
  const peseeDate = date ? new Date(date) : new Date();
  const gmq = last ? computeGMQ(poids, last.poids, peseeDate, last.date) : null;

  const pesee = await Pesee.create({ animal: animal._id, poids, date: peseeDate, gmq, observateur, notes });

  // Update animal current weight & GMQ
  animal.poidsActuel = poids;
  if (gmq != null) animal.gmqActuel = gmq;
  await animal.save();

  // UC-20.5 — growth-delay alert vs race target
  const popRace = await animal.populate('race', 'gmqCible nom');
  const cible = popRace.race?.gmqCible || 0;
  if (gmq != null && cible > 0 && gmq < cible * 0.8) {
    await Alerte.create({
      niveau: 'Avertissement',
      categorie: 'retard_croissance',
      message: `Retard de croissance: ${animal.identifiant} (GMQ ${gmq} < cible ${cible})`,
      concerne: animal.identifiant,
    });
  }

  res.status(201).json({ success: true, data: pesee });
});

// ─── Phase transition (UC-03) ─────────────────────────────────────────────────
// PATCH /api/animaux/:id/phase  { phase? }  — if no phase, advance to next
exports.changePhase = asyncHandler(async (req, res) => {
  const animal = await Animal.findById(req.params.id);
  if (!animal) throw ApiError.notFound();

  let next = req.body.phase;
  if (!next) {
    const idx = PHASES.indexOf(animal.phase);
    if (idx < 0 || idx >= PHASES.length - 1) throw ApiError.badRequest('Phase finale déjà atteinte');
    next = PHASES[idx + 1];
  }
  if (!PHASES.includes(next)) throw ApiError.badRequest('Phase invalide');

  animal.phase = next;
  if (!['Sain', 'En traitement', 'Malade'].includes(animal.etatSante)) animal.etatSante = 'Sain';
  await animal.save();

  await Alerte.create({
    niveau: 'Info',
    categorie: 'transition_phase',
    message: `Transition de phase: ${animal.identifiant} → ${next}`,
    concerne: animal.identifiant,
  });

  res.json({ success: true, data: animal });
});

// ─── Changer l'état de santé ─────────────────────────────────────────────────
// PATCH /api/animaux/:id/sante  { etatSante }
const ETATS_SANTE = ['Sain', 'En traitement', 'Malade'];
exports.changeEtatSante = asyncHandler(async (req, res) => {
  const { etatSante } = req.body;
  if (!ETATS_SANTE.includes(etatSante)) throw ApiError.badRequest('État de santé invalide');
  const animal = await Animal.findById(req.params.id);
  if (!animal) throw ApiError.notFound();
  animal.etatSante = etatSante;
  await animal.save();
  res.json({ success: true, data: animal });
});

// ─── Sortie / mortalité (UC-06) ───────────────────────────────────────────────
// POST /api/animaux/:id/sortie  { motif, date, poids, prix, notes }
exports.sortie = asyncHandler(async (req, res) => {
  const animal = await Animal.findById(req.params.id);
  if (!animal) throw ApiError.notFound();
  if (animal.statut === 'Sorti') throw ApiError.conflict('Animal déjà sorti');

  const { motif, date, poids, prix, notes } = req.body;
  if (!motif) throw ApiError.badRequest('Le motif de sortie est requis');

  // Block sale/slaughter if withdrawal period still active
  if ((motif === 'vente' || motif === 'abattage') && animal.delaiRetraitFin && animal.delaiRetraitFin > new Date()) {
    throw ApiError.conflict('Délai de retrait non écoulé — sortie bloquée');
  }

  animal.statut = 'Sorti';
  animal.parcelle = null;
  animal.sortie = { motif, date: date ? new Date(date) : new Date(), poids, prix, notes };
  // Sanitize legacy value removed from enum
  if (!['Sain', 'En traitement', 'Malade'].includes(animal.etatSante)) animal.etatSante = 'Sain';
  await animal.save();

  if (motif === 'mort') {
    await Alerte.create({
      niveau: 'Critique',
      categorie: 'mortalite',
      message: `Mortalité enregistrée: ${animal.identifiant}`,
      concerne: animal.identifiant,
    });
  }

  res.json({ success: true, data: animal });
});
