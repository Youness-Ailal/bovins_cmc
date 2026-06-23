const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const StockArticle = require('../models/StockArticle');
const StockMouvement = require('../models/StockMouvement');
const Alerte = require('../models/Alerte');
const Parametres = require('../models/Parametres');
const { streamRapportStock } = require('../utils/pdfGenerator');

async function checkLowStock(article) {
  if (article.seuil > 0 && article.quantite <= article.seuil) {
    const niveau = article.quantite <= article.seuil * 0.5 ? 'Critique' : 'Avertissement';
    await Alerte.create({
      niveau,
      categorie: 'stock_faible',
      message: `Stock ${niveau === 'Critique' ? 'critique' : 'faible'}: ${article.designation} (${article.quantite} ${article.unite})`,
      concerne: article.designation,
    });
  }
}

// ─── Articles ─────────────────────────────────────────────────────────────────
exports.listArticles = asyncHandler(async (req, res) => {
  const articles = await StockArticle.find()
    .populate('fournisseur', 'nom region type')
    .sort('designation');
  res.json({ success: true, data: articles, meta: { total: articles.length } });
});

// GET /api/stocks/rapport — état des stocks (PDF)
exports.rapportStock = asyncHandler(async (req, res) => {
  const [articles, params] = await Promise.all([
    StockArticle.find().sort('designation'),
    Parametres.findOne(),
  ]);

  const rows = articles.map((a) => ({
    designation: a.designation,
    categorie: a.categorie,
    unite: a.unite,
    quantite: a.quantite,
    seuil: a.seuil,
    prixUnitaire: a.prixUnitaire,
    valeur: Math.round(a.quantite * a.prixUnitaire),
    statut: a.statut, // virtual: OK | Faible | Critique
  }));

  const valeurTotale = rows.reduce((s, r) => s + r.valeur, 0);
  const sousSeuilCount = rows.filter((r) => r.statut !== 'OK').length;

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="etat-stocks.pdf"');

  streamRapportStock(res, {
    ferme: params?.nomFerme || 'BOVITRACK',
    total: rows.length,
    valeurTotale,
    sousSeuilCount,
    articles: rows,
  });
});

exports.getArticle = asyncHandler(async (req, res) => {
  const article = await StockArticle.findById(req.params.id)
    .populate('fournisseur', 'nom region type');
  if (!article) throw ApiError.notFound();
  res.json({ success: true, data: article });
});

exports.createArticle = asyncHandler(async (req, res) => {
  const article = await StockArticle.create(req.body);
  res.status(201).json({ success: true, data: article });
});

exports.updateArticle = asyncHandler(async (req, res) => {
  const body = { ...req.body };
  if ('fournisseur' in body && !body.fournisseur) body.fournisseur = null;
  const article = await StockArticle.findByIdAndUpdate(req.params.id, body, { new: true, runValidators: true })
    .populate('fournisseur', 'nom region type');
  if (!article) throw ApiError.notFound();
  res.json({ success: true, data: article });
});

exports.removeArticle = asyncHandler(async (req, res) => {
  const article = await StockArticle.findByIdAndDelete(req.params.id);
  if (!article) throw ApiError.notFound();
  await StockMouvement.deleteMany({ article: req.params.id });
  res.json({ success: true, data: { id: req.params.id } });
});

// ─── Mouvements (UC-08) ───────────────────────────────────────────────────────
exports.listMouvements = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.article) filter.article = req.query.article;
  const mouvements = await StockMouvement.find(filter)
    .populate('article', 'designation unite')
    .populate('utilisateur', 'prenom nom')
    .populate('commandeSource', 'fournisseur date montantTotal')
    .sort('-date');
  res.json({ success: true, data: mouvements, meta: { total: mouvements.length } });
});

exports.createMouvement = asyncHandler(async (req, res) => {
  const { article: articleId, type, quantite, date, prixUnitaire, motif, notes } = req.body;
  const article = await StockArticle.findById(articleId);
  if (!article) throw ApiError.notFound('Article introuvable');
  const qty = Number(quantite);
  if (!type || isNaN(qty)) throw ApiError.badRequest('Type et quantité requis');

  let nouvelleQuantite;
  if (type === 'entree') nouvelleQuantite = article.quantite + qty;
  else if (type === 'sortie') nouvelleQuantite = article.quantite - qty;
  else nouvelleQuantite = qty; // ajustement = set absolute

  if (nouvelleQuantite < 0) throw ApiError.badRequest('Stock insuffisant pour cette sortie');

  article.quantite = nouvelleQuantite;
  if (type === 'entree' && prixUnitaire) article.prixUnitaire = prixUnitaire;
  if (!article.fournisseur) article.fournisseur = null; // coerce legacy "" values
  await article.save();

  const mouvement = await StockMouvement.create({
    article: article._id,
    type,
    quantite: qty,
    quantiteApres: nouvelleQuantite,
    date: date ? new Date(date) : new Date(),
    prixUnitaire: prixUnitaire || 0,
    motif,
    notes,
    utilisateur: req.user ? req.user._id : null,
  });

  await checkLowStock(article);

  res.status(201).json({ success: true, data: mouvement });
});

module.exports.checkLowStock = checkLowStock;
