const mongoose = require('mongoose');
const toJSON = require('./plugins/toJSON');

const fournisseurSchema = new mongoose.Schema(
  {
    nom: { type: String, required: [true, 'Le nom est requis'], trim: true },
    contact: { type: String, default: '' },
    region: { type: String, default: '' },
    type: {
      type: String,
      enum: ['Aliments', 'Médicaments', 'Équipements', 'Autre'],
      default: 'Autre',
    },
    articlesHabituels: [
      {
        article: { type: mongoose.Schema.Types.ObjectId, ref: 'StockArticle' },
        prixHabituel: { type: Number, default: 0 },
      },
    ],
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

fournisseurSchema.plugin(toJSON);

module.exports = mongoose.model('Fournisseur', fournisseurSchema);
