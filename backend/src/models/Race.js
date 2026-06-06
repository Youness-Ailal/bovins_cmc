const mongoose = require('mongoose');
const toJSON = require('./plugins/toJSON');

const raceSchema = new mongoose.Schema(
  {
    nom: { type: String, required: [true, 'Le nom de la race est requis'], unique: true, trim: true },
    origine: { type: String, trim: true, default: '' },
    poidsAdulte: { type: Number, default: 0 },
    gmqCible: { type: Number, default: 0 },
    icCible: { type: Number, default: 0 },
    poidsAbattage: { type: Number, default: 0 },
    dureeEngraissement: { type: Number, default: 0 },
    description: { type: String, default: '' },
  },
  { timestamps: true }
);

raceSchema.plugin(toJSON);

module.exports = mongoose.model('Race', raceSchema);
