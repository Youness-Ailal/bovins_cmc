const mongoose = require('mongoose');
const toJSON = require('./plugins/toJSON');

const commandeAchatSchema = new mongoose.Schema(
  {
    fournisseur: { type: mongoose.Schema.Types.ObjectId, ref: 'Fournisseur', required: true },
    date: { type: Date, default: Date.now },
    lignes: [
      {
        article: { type: mongoose.Schema.Types.ObjectId, ref: 'StockArticle' },
        quantite: { type: Number, required: true, min: 0 },
        prixUnitaire: { type: Number, default: 0, min: 0 },
      },
    ],
    montantTotal: { type: Number, default: 0 },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

commandeAchatSchema.pre('save', async function () {
  this.montantTotal = this.lignes.reduce(
    (sum, l) => sum + l.quantite * l.prixUnitaire,
    0
  );
});

commandeAchatSchema.plugin(toJSON);

module.exports = mongoose.model('CommandeAchat', commandeAchatSchema);
