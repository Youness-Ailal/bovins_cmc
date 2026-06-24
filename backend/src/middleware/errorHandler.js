/* eslint-disable no-unused-vars */
const mongoose = require('mongoose');

function notFound(req, res, next) {
  // Socket.io handles its own routes — Express must not send a response for them
  if (req.originalUrl.startsWith('/socket.io')) return next();
  res.status(404).json({ success: false, error: `Route introuvable: ${req.originalUrl}` });
}

function errorHandler(err, req, res, next) {
  let status = err.statusCode || 500;
  let message = err.message || 'Erreur serveur';

  // Mongoose validation
  if (err instanceof mongoose.Error.ValidationError) {
    status = 400;
    message = Object.values(err.errors).map((e) => e.message).join(', ');
  }
  // Invalid ObjectId
  else if (err instanceof mongoose.Error.CastError) {
    status = 400;
    message = `Identifiant invalide: ${err.value}`;
  }
  // Duplicate key
  else if (err.code === 11000) {
    status = 409;
    const field = Object.keys(err.keyValue || {})[0] || 'champ';
    message = `Valeur déjà utilisée pour le champ « ${field} »`;
  }

  if (status >= 500) {
    console.error('[ERROR]', err);
  }

  res.status(status).json({ success: false, error: message });
}

module.exports = { notFound, errorHandler };
