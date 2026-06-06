const mongoose = require('mongoose');
const toJSON = require('./plugins/toJSON');

const peseeSchema = new mongoose.Schema(
  {
    animal: { type: mongoose.Schema.Types.ObjectId, ref: 'Animal', required: true },
    date: { type: Date, required: true, default: Date.now },
    poids: { type: Number, required: [true, 'Le poids est requis'], min: 0 },
    gmq: { type: Number, default: null }, // computed from previous weighing
    observateur: { type: String, default: '' },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

peseeSchema.plugin(toJSON);
peseeSchema.index({ animal: 1, date: -1 });

module.exports = mongoose.model('Pesee', peseeSchema);
