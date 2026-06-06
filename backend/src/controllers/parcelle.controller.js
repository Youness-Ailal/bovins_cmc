const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const Parcelle = require('../models/Parcelle');
const Animal = require('../models/Animal');

async function withOccupation(parcelles) {
  const counts = await Animal.aggregate([
    { $match: { statut: 'Actif', parcelle: { $ne: null } } },
    { $group: { _id: '$parcelle', n: { $sum: 1 } } },
  ]);
  const map = new Map(counts.map((c) => [String(c._id), c.n]));
  return parcelles.map((p) => {
    const nbActuels = map.get(String(p._id)) || 0;
    const occupation = p.capaciteMax > 0 ? Math.round((nbActuels / p.capaciteMax) * 100) : 0;
    return { ...p.toJSON(), nbActuels, occupation };
  });
}

exports.list = asyncHandler(async (req, res) => {
  const parcelles = await Parcelle.find().populate('ration', 'nom').sort('nom');
  const data = await withOccupation(parcelles);
  res.json({ success: true, data, meta: { total: data.length } });
});

exports.getOne = asyncHandler(async (req, res) => {
  const parcelle = await Parcelle.findById(req.params.id).populate('ration', 'nom');
  if (!parcelle) throw ApiError.notFound();
  const nbActuels = await Animal.countDocuments({ parcelle: parcelle._id, statut: 'Actif' });
  const occupation = parcelle.capaciteMax > 0 ? Math.round((nbActuels / parcelle.capaciteMax) * 100) : 0;
  const animaux = await Animal.find({ parcelle: parcelle._id, statut: 'Actif' })
    .populate('race', 'nom')
    .select('identifiant phase etatSante gmqActuel');
  res.json({ success: true, data: { ...parcelle.toJSON(), nbActuels, occupation, animaux } });
});

exports.create = asyncHandler(async (req, res) => {
  const parcelle = await Parcelle.create(req.body);
  res.status(201).json({ success: true, data: parcelle });
});

exports.update = asyncHandler(async (req, res) => {
  const parcelle = await Parcelle.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!parcelle) throw ApiError.notFound();
  res.json({ success: true, data: parcelle });
});

exports.remove = asyncHandler(async (req, res) => {
  const count = await Animal.countDocuments({ parcelle: req.params.id, statut: 'Actif' });
  if (count > 0) throw ApiError.conflict(`${count} animaux occupent cette parcelle`);
  const parcelle = await Parcelle.findByIdAndDelete(req.params.id);
  if (!parcelle) throw ApiError.notFound();
  res.json({ success: true, data: { id: req.params.id } });
});

// POST /api/parcelles/transfert
exports.transfert = asyncHandler(async (req, res) => {
  const { animalId, parcelleDestId } = req.body;
  if (!animalId || !parcelleDestId) throw ApiError.badRequest('Animal et parcelle de destination requis');

  const dest = await Parcelle.findById(parcelleDestId);
  if (!dest) throw ApiError.notFound('Parcelle de destination introuvable');

  const occupants = await Animal.countDocuments({ parcelle: dest._id, statut: 'Actif' });
  if (occupants >= dest.capaciteMax) {
    throw ApiError.conflict('Capacité maximale de la parcelle atteinte');
  }

  const animal = await Animal.findById(animalId);
  if (!animal) throw ApiError.notFound('Animal introuvable');
  animal.parcelle = dest._id;
  await animal.save();

  res.json({ success: true, data: animal });
});
