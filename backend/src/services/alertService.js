const Alerte = require('../models/Alerte');
const { emitAlerte } = require('../socket');

/**
 * Single entry point for raising an alert: persists it to MongoDB (as before)
 * AND pushes it to all connected clients in real time. Replaces direct
 * Alerte.create() calls so every alert is both stored and broadcast.
 */
async function notifyAlerte(data) {
  const alerte = await Alerte.create(data);
  emitAlerte(alerte.toJSON());
  return alerte;
}

module.exports = { notifyAlerte };
