const mongoose = require('mongoose');

const ChatMessageSchema = new mongoose.Schema({
  userId: { type: String, required: true }, // or ObjectId if you have user accounts
  role: { type: String, enum: ['user', 'ai'], required: true }, // who sent the message
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  conversationId: { type: String, required: true } // to group messages in a conversation
});

module.exports = mongoose.model('ChatMessage', ChatMessageSchema);