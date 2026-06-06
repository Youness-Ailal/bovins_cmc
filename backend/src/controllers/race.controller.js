const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const Race = require('../models/Race');
const Animal = require('../models/Animal');

async function withCounts(races) {
  const counts = await Animal.aggregate([
    { $match: { statut: 'Actif' } },
    { $group: { _id: '$race', n: { $sum: 1 } } },
  ]);
  const map = new Map(counts.map((c) => [String(c._id), c.n]));
  return races.map((r) => ({ ...r.toJSON(), nbAnimaux: map.get(String(r._id)) || 0 }));
}

exports.list = asyncHandler(async (req, res) => {
  const races = await Race.find().sort('nom');
  const data = await withCounts(races);
  res.json({ success: true, data, meta: { total: data.length } });
});

exports.getOne = asyncHandler(async (req, res) => {
  const race = await Race.findById(req.params.id);
  if (!race) throw ApiError.notFound();
  const nbAnimaux = await Animal.countDocuments({ race: race._id, statut: 'Actif' });
  res.json({ success: true, data: { ...race.toJSON(), nbAnimaux } });
});

exports.create = asyncHandler(async (req, res) => {
  const race = await Race.create(req.body);
  res.status(201).json({ success: true, data: race });
});

exports.update = asyncHandler(async (req, res) => {
  const race = await Race.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!race) throw ApiError.notFound();
  res.json({ success: true, data: race });
});

exports.remove = asyncHandler(async (req, res) => {
  const count = await Animal.countDocuments({ race: req.params.id, statut: 'Actif' });
  if (count > 0) throw ApiError.conflict(`${count} animaux sont liés à cette race`);
  const race = await Race.findByIdAndDelete(req.params.id);
  if (!race) throw ApiError.notFound();
  res.json({ success: true, data: { id: req.params.id } });
});
