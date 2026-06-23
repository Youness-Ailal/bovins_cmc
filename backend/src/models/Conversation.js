const mongoose = require('mongoose');
const toJSON = require('./plugins/toJSON');

// One BoviAI conversation thread, owned by a user. Messages are embedded
// (a conversation is always read/written as a whole, never queried per-message).
const messageSchema = new mongoose.Schema(
  {
    role: { type: String, enum: ['user', 'assistant'], required: true },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const conversationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, default: 'Nouvelle conversation', trim: true },
    messages: { type: [messageSchema], default: [] },
  },
  { timestamps: true }
);

conversationSchema.plugin(toJSON);
conversationSchema.index({ user: 1, updatedAt: -1 });

module.exports = mongoose.model('Conversation', conversationSchema);
