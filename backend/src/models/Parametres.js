const mongoose = require('mongoose');
const toJSON = require('./plugins/toJSON');

// Singleton document holding farm-wide settings.
const parametresSchema = new mongoose.Schema(
  {
    nomFerme: { type: String, default: 'Ferme Ailal' },
    siret: { type: String, default: '' },
    adresse: { type: String, default: '' },
    responsable: { type: String, default: '' },
    devise: { type: String, default: 'MAD' },
    unitePoids: { type: String, default: 'kg' },
    frequencePesee: { type: Number, default: 14 },
    seuilIC: { type: Number, default: 7.5 },
    poidsMinVente: { type: Number, default: 400 },
    notifs: {
      email: { type: Boolean, default: true },
      rapport: { type: Boolean, default: false },
      pesee: { type: Boolean, default: true },
      stock: { type: Boolean, default: true },
    },
    // UC-24 — alert thresholds configuration (free-form rows persisted as-is)
    alertesConfig: { type: [mongoose.Schema.Types.Mixed], default: [] },
  },
  { timestamps: true }
);

parametresSchema.plugin(toJSON);

module.exports = mongoose.model('Parametres', parametresSchema);
