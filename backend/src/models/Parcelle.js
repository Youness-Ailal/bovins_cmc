const mongoose = require('mongoose');
const toJSON = require('./plugins/toJSON');

const parcelleSchema = new mongoose.Schema(
  {
    nom: { type: String, required: [true, 'Le nom de la parcelle est requis'], trim: true },
    reference: { type: String, trim: true, default: '' },
    capaciteMax: { type: Number, required: [true, 'La capacité maximale est requise'], min: 0 },
    superficie: { type: Number, default: 0 },
    type: {
      type: String,
      enum: ['paturage', 'engraissement', 'quarantaine', 'veaux', ''],
      default: '',
    },
    ration: { type: mongoose.Schema.Types.ObjectId, ref: 'Ration', default: null },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

parcelleSchema.plugin(toJSON);

module.exports = mongoose.model('Parcelle', parcelleSchema);
