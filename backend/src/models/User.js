const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const toJSON = require('./plugins/toJSON');

const userSchema = new mongoose.Schema(
  {
    prenom: { type: String, required: [true, 'Le prénom est requis'], trim: true },
    nom: { type: String, required: [true, 'Le nom est requis'], trim: true },
    email: {
      type: String,
      required: [true, "L'email est requis"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Email invalide'],
    },
    password: { type: String, required: [true, 'Le mot de passe est requis'], minlength: 6, select: false },
    role: {
      type: String,
      enum: ['Admin', 'Responsable', 'Vétérinaire', 'Opérateur'],
      default: 'Opérateur',
    },
    statut: { type: String, enum: ['Actif', 'Inactif'], default: 'Actif' },
    derniereConnexion: { type: Date },
  },
  { timestamps: true }
);

userSchema.plugin(toJSON);

// Virtual full name
userSchema.virtual('fullName').get(function () {
  return `${this.prenom} ${this.nom}`;
});

// Hash password before save when modified (Mongoose 9: async hooks omit `next`)
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model('User', userSchema);
