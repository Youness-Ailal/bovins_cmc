const mongoose = require('mongoose');
const toJSON = require('./plugins/toJSON');

const alerteSchema = new mongoose.Schema(
  {
    niveau: { type: String, enum: ['Critique', 'Avertissement', 'Info'], required: true },
    categorie: { type: String, default: '' }, // stock_faible, traitement_a_venir, etc.
    message: { type: String, required: true },
    concerne: { type: String, default: '' }, // animal id / article / lot label
    date: { type: Date, default: Date.now },
    traitee: { type: Boolean, default: false },
  },
  { timestamps: true }
);

alerteSchema.plugin(toJSON);
alerteSchema.index({ traitee: 1, date: -1 });

module.exports = mongoose.model('Alerte', alerteSchema);
