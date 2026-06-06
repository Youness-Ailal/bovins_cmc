const mongoose = require('mongoose');
const toJSON = require('./plugins/toJSON');

const lotSchema = new mongoose.Schema(
  {
    nom: { type: String, required: [true, 'Le nom du lot est requis'], unique: true, trim: true },
    phase: {
      type: String,
      enum: ['Croissance', 'Engraissement', 'Finition', ''],
      default: '',
    },
    dateCreation: { type: Date, default: Date.now },
    description: { type: String, default: '' },
  },
  { timestamps: true }
);

lotSchema.plugin(toJSON);

module.exports = mongoose.model('Lot', lotSchema);
