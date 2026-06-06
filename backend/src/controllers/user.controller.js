const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const User = require('../models/User');

// GET /api/users
exports.list = asyncHandler(async (req, res) => {
  const users = await User.find().sort('-createdAt');
  res.json({ success: true, data: users, meta: { total: users.length } });
});

// GET /api/users/:id
exports.getOne = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw ApiError.notFound();
  res.json({ success: true, data: user });
});

// POST /api/users
exports.create = asyncHandler(async (req, res) => {
  const { prenom, nom, email, password, role, statut } = req.body;
  const user = await User.create({ prenom, nom, email, password, role, statut });
  res.status(201).json({ success: true, data: user });
});

// PUT /api/users/:id
exports.update = asyncHandler(async (req, res) => {
  const payload = { ...req.body };
  // Only hash a new password through the document path; skip if empty
  if (!payload.password) delete payload.password;

  const user = await User.findById(req.params.id).select('+password');
  if (!user) throw ApiError.notFound();

  Object.assign(user, payload);
  await user.save();
  res.json({ success: true, data: user.toJSON() });
});

// DELETE /api/users/:id  (soft: deactivate)
exports.remove = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw ApiError.notFound();
  user.statut = 'Inactif';
  await user.save();
  res.json({ success: true, data: user.toJSON() });
});
