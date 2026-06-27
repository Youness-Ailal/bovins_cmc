const jwt = require('jsonwebtoken');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const User = require('../models/User');
const config = require('../config/env');

const VALID_ROLES = ['Admin', 'Responsable', 'Vétérinaire'];

function signToken(user) {
  return jwt.sign({ id: user._id, role: user.role }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });
}

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw ApiError.badRequest('Email et mot de passe requis');

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw ApiError.unauthorized('Email ou mot de passe incorrect');
  }
  if (user.statut === 'Inactif') throw ApiError.forbidden('Compte désactivé');

  if (!VALID_ROLES.includes(user.role)) user.role = 'Responsable';
  user.derniereConnexion = new Date();
  await user.save();

  const token = signToken(user);
  res.json({ success: true, data: { token, user: user.toJSON() } });
});

exports.me = asyncHandler(async (req, res) => {
  res.json({ success: true, data: req.user });
});
