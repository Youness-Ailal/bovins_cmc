const mongoose = require('mongoose');
const toJSON = require('./plugins/toJSON');

const etatSanteSchema = new mongoose.Schema(
  {
    animal: { type: mongoose.Schema.Types.ObjectId, ref: 'Animal', required: true },
    date: { type: Date, default: Date.now },
    etat: {
      type: String,
      enum: ['Sain', 'En observation', 'En traitement', 'Malade'],
      required: true,
    },
    temperature: { type: Number, default: null },
    poids: { type: Number, default: null },
    symptomes: { type: String, default: '' },
    action: { type: String, default: '' },
  },
  { timestamps: true }
);

etatSanteSchema.plugin(toJSON);
etatSanteSchema.index({ animal: 1, date: -1 });

module.exports = mongoose.model('EtatSante', etatSanteSchema);
