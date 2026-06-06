const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const Ration = require('../models/Ration');
const Distribution = require('../models/Distribution');
const StockArticle = require('../models/StockArticle');
const { checkLowStock } = require('./stock.controller');

// ─── Rations (UC-09) ──────────────────────────────────────────────────────────
exports.list = asyncHandler(async (req, res) => {
  const rations = await Ration.find().sort('-createdAt');
  res.json({ success: true, data: rations, meta: { total: rations.length } });
});

exports.getOne = asyncHandler(async (req, res) => {
  const ration = await Ration.findById(req.params.id);
  if (!ration) throw ApiError.notFound();
  res.json({ success: true, data: ration });
});

exports.create = asyncHandler(async (req, res) => {
  const ration = await Ration.create(req.body);
  res.status(201).json({ success: true, data: ration });
});

exports.update = asyncHandler(async (req, res) => {
  const ration = await Ration.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!ration) throw ApiError.notFound();
  res.json({ success: true, data: ration });
});

exports.remove = asyncHandler(async (req, res) => {
  const ration = await Ration.findByIdAndDelete(req.params.id);
  if (!ration) throw ApiError.notFound();
  res.json({ success: true, data: { id: req.params.id } });
});

// ─── Distributions ────────────────────────────────────────────────────────────
exports.listDistributions = asyncHandler(async (req, res) => {
  const distributions = await Distribution.find()
    .populate('ration', 'nom')
    .sort('-date');
  res.json({ success: true, data: distributions, meta: { total: distributions.length } });
});

exports.createDistribution = asyncHandler(async (req, res) => {
  const { ration: rationId, cible, date, quantite, nbAnimaux, notes } = req.body;
  const ration = await Ration.findById(rationId);
  if (!ration) throw ApiError.notFound('Ration introuvable');

  const heads = Number(nbAnimaux) || 0;
  const coutEstime = Number((ration.coutJour * heads).toFixed(2));

  // Deduct each linked ingredient's stock by (qty per head * heads)
  for (const ing of ration.ingredients) {
    if (ing.article) {
      const article = await StockArticle.findById(ing.article);
      if (article) {
        article.quantite = Math.max(0, article.quantite - (Number(ing.quantite) || 0) * heads);
        await article.save();
        await checkLowStock(article);
      }
    }
  }

  const distribution = await Distribution.create({
    ration: ration._id,
    cible,
    date: date ? new Date(date) : new Date(),
    quantite: Number(quantite) || 0,
    nbAnimaux: heads,
    coutEstime,
    notes,
  });

  res.status(201).json({ success: true, data: distribution });
});
