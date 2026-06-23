const mongoose = require('mongoose');
const toJSON = require('./plugins/toJSON');

const animalSchema = new mongoose.Schema(
  {
    identifiant: { type: String, required: [true, "L'identifiant est requis"], unique: true, trim: true },
    nni: { type: String, trim: true, default: '' },
    race: { type: mongoose.Schema.Types.ObjectId, ref: 'Race', required: [true, 'La race est requise'] },
    sexe: { type: String, enum: ['Mâle', 'Femelle'], required: true },
    pere: { type: String, default: '' },
    mere: { type: String, default: '' },
    origine: { type: String, enum: ['ferme', 'achat', 'transfert'], default: 'ferme' },
    phase: {
      type: String,
      enum: ['Veau', 'Croissance', 'Engraissement', 'Finition'],
      default: 'Croissance',
    },
    poidsEntree: { type: Number, default: 0 },
    poidsActuel: { type: Number, default: 0 },
    dateEntree: { type: Date, default: Date.now },
    parcelle: { type: mongoose.Schema.Types.ObjectId, ref: 'Parcelle', default: null },
    etatSante: {
      type: String,
      enum: ['Sain', 'En traitement', 'Malade'],
      default: 'Sain',
    },
    gmqActuel: { type: Number, default: 0 },
    coutCumule: { type: Number, default: 0 },
    delaiRetraitFin: { type: Date, default: null }, // when set & in future, blocks sale
    statut: { type: String, enum: ['Actif', 'Sorti'], default: 'Actif' },
    sortie: {
      motif: { type: String, enum: ['vente', 'abattage', 'mort'] },
      date: Date,
      poids: Number,
      prix: Number,
      notes: String,
    },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

animalSchema.plugin(toJSON);

module.exports = mongoose.model('Animal', animalSchema);
