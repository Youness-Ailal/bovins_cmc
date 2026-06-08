const mongoose = require('mongoose');
const toJSON = require('./plugins/toJSON');

const distributionSchema = new mongoose.Schema(
  {
    ration: { type: mongoose.Schema.Types.ObjectId, ref: 'Ration', required: true },
    cible: { type: String, default: '' }, // parcelle label
    date: { type: Date, default: Date.now },
    quantite: { type: Number, required: true, min: 0 },
    nbAnimaux: { type: Number, default: 0 },
    coutEstime: { type: Number, default: 0 },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

distributionSchema.plugin(toJSON);
distributionSchema.index({ date: -1 });

module.exports = mongoose.model('Distribution', distributionSchema);
