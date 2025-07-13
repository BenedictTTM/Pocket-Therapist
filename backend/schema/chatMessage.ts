const mongoose = require('mongoose');

const ChatMessageSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  role: { type: String, enum: ['user', 'ai', 'moderator'], required: true },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  conversationId: { type: String, required: true },
  moderatorId: { type: String }, // Only for moderator messages
  isRead: { type: Boolean, default: false }, // For tracking read status
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' }
});

module.exports = mongoose.model('ChatMessage', ChatMessageSchema);