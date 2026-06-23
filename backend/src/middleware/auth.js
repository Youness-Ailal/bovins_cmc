const jwt = require('jsonwebtoken');
const ApiError = require('../utils/ApiError');
const User = require('../models/User');

/**
 * Verifies the Bearer token and attaches the user to req.user.
 */
async function protect(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) throw ApiError.unauthorized('Token manquant');

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) throw ApiError.unauthorized('Utilisateur introuvable');
    if (user.statut === 'Inactif') throw ApiError.forbidden('Compte désactivé');

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return next(ApiError.unauthorized('Session invalide ou expirée'));
    }
    next(err);
  }
}

/**
 * Restricts a route to specific roles. Usage: restrictTo('Admin')
 */
function restrictTo(...roles) {
  return (req, res, next) => {
    if (!req.user) return next(ApiError.forbidden("Vous n'avez pas la permission requise"));
    if (req.user.role === 'Admin') return next(); // Admin bypasses all role checks
    if (!roles.includes(req.user.role)) return next(ApiError.forbidden("Vous n'avez pas la permission requise"));
    next();
  };
}

module.exports = { protect, restrictTo };
