const mongoose = require('mongoose');
const toJSON = require('./plugins/toJSON');

const ingredientSchema = new mongoose.Schema(
  {
    nom: { type: String, required: true },
    article: { type: mongoose.Schema.Types.ObjectId, ref: 'StockArticle', default: null },
    quantite: { type: Number, default: 0 },
    unite: { type: String, default: 'kg' },
    prixUnitaire: { type: Number, default: 0 },
  },
  { _id: false }
);

const rationSchema = new mongoose.Schema(
  {
    nom: { type: String, required: [true, 'Le nom de la ration est requis'], trim: true },
    phase: {
      type: String,
      enum: ['Veau', 'Croissance', 'Engraissement', 'Finition', ''],
      default: '',
    },
    cible: { type: String, default: '' }, // parcelle/lot label or id reference (free-form for MVP)
    ingredients: { type: [ingredientSchema], default: [] },
  },
  { timestamps: true }
);

rationSchema.plugin(toJSON);

// Daily cost per head, computed from ingredients
rationSchema.virtual('coutJour').get(function () {
  return Number(
    (this.ingredients || [])
      .reduce((s, i) => s + (Number(i.quantite) || 0) * (Number(i.prixUnitaire) || 0), 0)
      .toFixed(2)
  );
});

rationSchema.virtual('nbIngredients').get(function () {
  return (this.ingredients || []).length;
});

module.exports = mongoose.model('Ration', rationSchema);
