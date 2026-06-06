const mongoose = require('mongoose');
const toJSON = require('./plugins/toJSON');

const stockMouvementSchema = new mongoose.Schema(
  {
    article: { type: mongoose.Schema.Types.ObjectId, ref: 'StockArticle', required: true },
    type: { type: String, enum: ['entree', 'sortie', 'ajustement'], required: true },
    quantite: { type: Number, required: true },
    quantiteApres: { type: Number, default: 0 },
    date: { type: Date, default: Date.now },
    prixUnitaire: { type: Number, default: 0 },
    motif: { type: String, default: '' },
    notes: { type: String, default: '' },
    utilisateur: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

stockMouvementSchema.plugin(toJSON);
stockMouvementSchema.index({ date: -1 });

module.exports = mongoose.model('StockMouvement', stockMouvementSchema);
