const mongoose = require('mongoose');
const toJSON = require('./plugins/toJSON');

const stockArticleSchema = new mongoose.Schema(
  {
    designation: { type: String, required: [true, 'La désignation est requise'], trim: true },
    reference: { type: String, trim: true, default: '' },
    categorie: {
      type: String,
      enum: ['Céréales', 'Fourrages', 'Concentrés', 'Compléments', 'Additifs', 'Médicaments'],
      required: [true, 'La catégorie est requise'],
    },
    unite: { type: String, enum: ['kg', 'L', 'unites', 'sacs', 'doses'], default: 'kg' },
    quantite: { type: Number, default: 0, min: 0 },
    seuil: { type: Number, default: 0, min: 0 },
    prixUnitaire: { type: Number, default: 0, min: 0 },
    datePeremption: { type: Date, default: null },
    fournisseur: { type: String, default: '' },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

stockArticleSchema.plugin(toJSON);

// Derived stock status
stockArticleSchema.virtual('statut').get(function () {
  if (this.seuil > 0 && this.quantite <= this.seuil * 0.5) return 'Critique';
  if (this.quantite <= this.seuil) return 'Faible';
  return 'OK';
});

module.exports = mongoose.model('StockArticle', stockArticleSchema);
