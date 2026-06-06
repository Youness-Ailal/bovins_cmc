const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const Alerte = require('../models/Alerte');

// GET /api/alertes
exports.list = asyncHandler(async (req, res) => {
  const alertes = await Alerte.find().sort('-date').limit(100);
  res.json({ success: true, data: alertes, meta: { total: alertes.length } });
});

// PATCH /api/alertes/:id/traiter
exports.traiter = asyncHandler(async (req, res) => {
  const alerte = await Alerte.findByIdAndUpdate(req.params.id, { traitee: true }, { new: true });
  if (!alerte) throw ApiError.notFound();
  res.json({ success: true, data: alerte });
});

// DELETE /api/alertes/:id
exports.remove = asyncHandler(async (req, res) => {
  const alerte = await Alerte.findByIdAndDelete(req.params.id);
  if (!alerte) throw ApiError.notFound();
  res.json({ success: true, data: { id: req.params.id } });
});
