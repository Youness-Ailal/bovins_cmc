const mongoose = require('mongoose');
const toJSON = require('./plugins/toJSON');

const traitementSchema = new mongoose.Schema(
  {
    animal: { type: mongoose.Schema.Types.ObjectId, ref: 'Animal', required: true },
    type: {
      type: String,
      enum: ['Antibiotique', 'Antiparasitaire', 'Anti-inflammatoire', 'Vaccin', 'Autre'],
      required: true,
    },
    produit: { type: String, required: [true, 'Le produit est requis'] },
    article: { type: mongoose.Schema.Types.ObjectId, ref: 'StockArticle', default: null },
    dose: { type: Number, default: 0 },
    doseUnite: { type: String, default: 'ml' },
    voie: { type: String, default: '' },
    dateDebut: { type: Date, default: Date.now },
    dateFin: { type: Date, default: null },
    veterinaire: { type: String, default: '' },
    delaiRetrait: { type: Number, default: 0 }, // days
    statut: { type: String, enum: ['En cours', 'Terminé', 'Planifié'], default: 'En cours' },
    observations: { type: String, default: '' },
  },
  { timestamps: true }
);

traitementSchema.plugin(toJSON);
traitementSchema.index({ animal: 1, dateDebut: -1 });

module.exports = mongoose.model('Traitement', traitementSchema);
