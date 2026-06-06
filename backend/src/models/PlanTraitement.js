const mongoose = require('mongoose');
const toJSON = require('./plugins/toJSON');

const planTraitementSchema = new mongoose.Schema(
  {
    animal: { type: mongoose.Schema.Types.ObjectId, ref: 'Animal', required: true },
    type: { type: String, required: true },
    produit: { type: String, default: '' },
    datePrevue: { type: Date, required: true },
    frequence: { type: String, default: 'Ponctuel' },
    statut: { type: String, enum: ['À faire', 'Rappel J-3', 'En retard', 'Fait'], default: 'À faire' },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

planTraitementSchema.plugin(toJSON);
planTraitementSchema.index({ datePrevue: 1 });

module.exports = mongoose.model('PlanTraitement', planTraitementSchema);
