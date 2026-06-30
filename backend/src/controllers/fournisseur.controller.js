const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const Fournisseur = require('../models/Fournisseur');
const CommandeAchat = require('../models/CommandeAchat');
const StockArticle = require('../models/StockArticle');
const StockMouvement = require('../models/StockMouvement');

// ─── Fournisseurs ─────────────────────────────────────────────────────────────

exports.listFournisseurs = asyncHandler(async (req, res) => {
  const fournisseurs = await Fournisseur.find()
    .populate('articlesHabituels.article', 'designation unite')
    .sort('nom');

  const counts = await CommandeAchat.aggregate([
    { $group: { _id: '$fournisseur', total: { $sum: 1 } } },
  ]);
  const countMap = Object.fromEntries(counts.map((c) => [String(c._id), c.total]));

  const data = fournisseurs.map((f) => ({
    ...f.toJSON(),
    nbCommandes: countMap[String(f._id)] ?? 0,
  }));

  res.json({ success: true, data, meta: { total: data.length } });
});

exports.getFournisseur = asyncHandler(async (req, res) => {
  const fournisseur = await Fournisseur.findById(req.params.id).populate(
    'articlesHabituels.article',
    'designation unite prixUnitaire'
  );
  if (!fournisseur) throw ApiError.notFound('Fournisseur introuvable');

  const commandes = await CommandeAchat.find({ fournisseur: req.params.id })
    .populate('lignes.article', 'designation unite')
    .sort('-date')
    .limit(10);

  res.json({ success: true, data: { ...fournisseur.toJSON(), commandes } });
});

exports.createFournisseur = asyncHandler(async (req, res) => {
  const fournisseur = await Fournisseur.create(req.body);
  res.status(201).json({ success: true, data: fournisseur });
});

exports.updateFournisseur = asyncHandler(async (req, res) => {
  const fournisseur = await Fournisseur.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!fournisseur) throw ApiError.notFound('Fournisseur introuvable');
  res.json({ success: true, data: fournisseur });
});

exports.deleteFournisseur = asyncHandler(async (req, res) => {
  const fournisseur = await Fournisseur.findByIdAndDelete(req.params.id);
  if (!fournisseur) throw ApiError.notFound('Fournisseur introuvable');
  res.json({ success: true, data: { id: req.params.id } });
});

// ─── Commandes ────────────────────────────────────────────────────────────────

exports.listCommandes = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.fournisseur) filter.fournisseur = req.query.fournisseur;

  const commandes = await CommandeAchat.find(filter)
    .populate('fournisseur', 'nom region type')
    .populate('lignes.article', 'designation unite')
    .sort('-date');

  const now = new Date();
  const d30 = new Date(now - 30 * 24 * 3600 * 1000);
  const d90 = new Date(now - 90 * 24 * 3600 * 1000);
  const total30 = commandes.filter((c) => c.date >= d30).reduce((s, c) => s + c.montantTotal, 0);
  const total90 = commandes.filter((c) => c.date >= d90).reduce((s, c) => s + c.montantTotal, 0);

  res.json({
    success: true,
    data: commandes,
    meta: { total: commandes.length, total30, total90 },
  });
});

exports.getCommande = asyncHandler(async (req, res) => {
  const commande = await CommandeAchat.findById(req.params.id)
    .populate('fournisseur', 'nom region type')
    .populate('lignes.article', 'designation unite');
  if (!commande) throw ApiError.notFound('Commande introuvable');
  res.json({ success: true, data: commande });
});

// Creating a commande immediately restocks — no status workflow needed.
exports.createCommande = asyncHandler(async (req, res) => {
  const { fournisseur, date, lignes, notes } = req.body;
  if (!fournisseur || !lignes?.length) {
    throw ApiError.badRequest('Fournisseur et lignes requis');
  }

  const commande = await CommandeAchat.create({ fournisseur, date, lignes, notes });

  // Immediately apply stock entries for every ligne
  for (const ligne of commande.lignes) {
    const article = await StockArticle.findById(ligne.article);
    if (!article) continue;
    if (!article.fournisseur) article.fournisseur = null;
    const nouvelleQuantite = article.quantite + ligne.quantite;
    article.quantite = nouvelleQuantite;
    if (ligne.prixUnitaire) article.prixUnitaire = ligne.prixUnitaire;
    await article.save();

    await StockMouvement.create({
      article: article._id,
      type: 'entree',
      quantite: ligne.quantite,
      quantiteApres: nouvelleQuantite,
      prixUnitaire: ligne.prixUnitaire || article.prixUnitaire,
      date: commande.date,
      motif: 'Réapprovisionnement',
      utilisateur: req.user?._id ?? null,
      commandeSource: commande._id,
    });
  }

  res.status(201).json({ success: true, data: commande });
});

exports.updateCommande = asyncHandler(async (req, res) => {
  const { date, notes } = req.body;
  const commande = await CommandeAchat.findByIdAndUpdate(
    req.params.id,
    { date, notes },
    { new: true, runValidators: true }
  );
  if (!commande) throw ApiError.notFound('Commande introuvable');
  res.json({ success: true, data: commande });
});

exports.deleteCommande = asyncHandler(async (req, res) => {
  const commande = await CommandeAchat.findByIdAndDelete(req.params.id);
  if (!commande) throw ApiError.notFound('Commande introuvable');
  res.json({ success: true, data: { id: req.params.id } });
});
