const asyncHandler = require('../utils/asyncHandler');
const Parametres = require('../models/Parametres');

// GET /api/parametres — returns singleton (creates default if absent)
exports.get = asyncHandler(async (req, res) => {
  let params = await Parametres.findOne();
  if (!params) params = await Parametres.create({});
  res.json({ success: true, data: params });
});

// PUT /api/parametres — merges provided fields into the singleton.
// findOneAndUpdate + $set reliably persists Mixed/Array fields (alertesConfig).
exports.update = asyncHandler(async (req, res) => {
  const params = await Parametres.findOneAndUpdate(
    {},
    { $set: req.body },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
  );
  res.json({ success: true, data: params });
});
