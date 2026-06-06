const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const Lot = require('../models/Lot');
const Animal = require('../models/Animal');

async function withStats(lots) {
  const stats = await Animal.aggregate([
    { $match: { statut: 'Actif', lot: { $ne: null } } },
    {
      $group: {
        _id: '$lot',
        nbAnimaux: { $sum: 1 },
        gmqMoyen: { $avg: '$gmqActuel' },
        coutTotal: { $sum: '$coutCumule' },
      },
    },
  ]);
  const map = new Map(stats.map((s) => [String(s._id), s]));
  return lots.map((l) => {
    const s = map.get(String(l._id));
    return {
      ...l.toJSON(),
      nbAnimaux: s ? s.nbAnimaux : 0,
      gmqMoyen: s ? Number(s.gmqMoyen.toFixed(2)) : 0,
      coutTotal: s ? Math.round(s.coutTotal) : 0,
    };
  });
}

exports.list = asyncHandler(async (req, res) => {
  const lots = await Lot.find().sort('-createdAt');
  const data = await withStats(lots);
  res.json({ success: true, data, meta: { total: data.length } });
});

exports.getOne = asyncHandler(async (req, res) => {
  const lot = await Lot.findById(req.params.id);
  if (!lot) throw ApiError.notFound();
  const animaux = await Animal.find({ lot: lot._id, statut: 'Actif' })
    .populate('race', 'nom')
    .select('identifiant phase etatSante gmqActuel');
  const nbAnimaux = animaux.length;
  const gmqMoyen = nbAnimaux ? Number((animaux.reduce((s, a) => s + a.gmqActuel, 0) / nbAnimaux).toFixed(2)) : 0;
  const coutTotal = Math.round(animaux.reduce((s, a) => s + a.coutCumule, 0));
  res.json({ success: true, data: { ...lot.toJSON(), nbAnimaux, gmqMoyen, coutTotal, animaux } });
});

exports.create = asyncHandler(async (req, res) => {
  const lot = await Lot.create(req.body);
  res.status(201).json({ success: true, data: lot });
});

exports.update = asyncHandler(async (req, res) => {
  const lot = await Lot.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!lot) throw ApiError.notFound();
  res.json({ success: true, data: lot });
});

exports.remove = asyncHandler(async (req, res) => {
  await Animal.updateMany({ lot: req.params.id }, { $set: { lot: null } });
  const lot = await Lot.findByIdAndDelete(req.params.id);
  if (!lot) throw ApiError.notFound();
  res.json({ success: true, data: { id: req.params.id } });
});
