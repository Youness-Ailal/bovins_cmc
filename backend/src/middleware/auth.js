const jwt = require('jsonwebtoken');
const ApiError = require('../utils/ApiError');
const User = require('../models/User');
const config = require('../config/env');

const VALID_ROLES = ['Admin', 'Responsable', 'Vétérinaire'];

async function protect(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) throw ApiError.unauthorized('Token manquant');

    const decoded = jwt.verify(token, config.jwt.secret);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) throw ApiError.unauthorized('Utilisateur introuvable');
    if (user.statut === 'Inactif') throw ApiError.forbidden('Compte désactivé');

    if (!VALID_ROLES.includes(user.role)) {
      user.role = 'Responsable';
      await user.save();
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return next(ApiError.unauthorized('Session invalide ou expirée'));
    }
    next(err);
  }
}

module.exports = { protect };
