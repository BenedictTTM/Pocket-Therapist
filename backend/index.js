const express = require('express');
const cors = require('cors');
require('dotenv').config();
const axios = require('axios');
const mongoose = require('mongoose');
const ChatMessage = require('./schema/chatMessage.ts')

const app = express();
app.use(cors());
app.use(express.json());

// Alle-AI API configuration
const ALLEAI_API_URL = 'https://api.alle-ai.com/api/v1/chat/completions';
const ALLEAI_API_KEY = process.env.ALLEAI_API_KEY;

app.post('/api/chat', async (req, res) => {
  try {
    const { message, userId, conversationId } = req.body;
    console.log('req.body:', req.body);
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required.' });
    }

    if (!ALLEAI_API_KEY) {
      return res.status(500).json({ error: 'API key not configured.' });
    }

    // Save user message to database
    const userMessage = new ChatMessage({
      userId: userId || 'anonymous',
      role: 'user',
      message: message,
      conversationId: conversationId || 'default'
    });
    await userMessage.save();

    const requestData = {
      models: ['gpt-4o'],
      messages: [
        {
          user: [
            {
              type: 'text',
              text: message
            }
          ]
        }
      ],
      response_format: { type: 'text' },
      temperature: 0.7,
      max_tokens: 1000,
      stream: false
    };

    const response = await axios.post(ALLEAI_API_URL, requestData, {
      headers: {
        'X-API-KEY': ALLEAI_API_KEY,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    // Extract the AI's reply
    const aiReply = response?.data?.responses?.responses?.['gpt-4o']?.message?.content;
    if (!aiReply) {
      console.log('Full response:', JSON.stringify(response.data, null, 2));
      return res.status(500).json({ error: 'No response from AI.' });
    }

    // Save AI response to database
    const aiMessage = new ChatMessage({
      userId: userId || 'anonymous',
      role: 'ai',
      message: aiReply,
      conversationId: conversationId || 'default'
    });
    await aiMessage.save();

    res.json({ reply: aiReply });
  } catch (error) {
    console.error('Error from AlleAI:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Failed to get response from AI.',
      details: error.response?.data?.error || error.message
    });
  }
});

// Route to get messages for a specific conversation
app.get('/api/messages/:conversationId', async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { userId } = req.query;

    const filter = { conversationId };
    if (userId) {
      filter.userId = userId;
    }

    const messages = await ChatMessage.find(filter)
      .sort({ timestamp: 1 }) // Sort by timestamp ascending
      .exec();

    res.json({ messages });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ 
      error: 'Failed to fetch messages.',
      details: error.message
    });
  }
});

// Route to get all conversations for a user
app.get('/api/conversations/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const conversations = await ChatMessage.aggregate([
      { $match: { userId } },
      { 
        $group: {
          _id: '$conversationId',
          lastMessage: { $last: '$message' },
          lastTimestamp: { $last: '$timestamp' },
          messageCount: { $sum: 1 }
        }
      },
      { $sort: { lastTimestamp: -1 } }
    ]);

    res.json({ conversations });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ 
      error: 'Failed to fetch conversations.',
      details: error.message
    });
  }
});

// Route to delete a conversation
app.delete('/api/conversations/:conversationId', async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { userId } = req.query;

    const filter = { conversationId };
    if (userId) {
      filter.userId = userId;
    }

    const result = await ChatMessage.deleteMany(filter);

    res.json({ 
      message: 'Conversation deleted successfully',
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Error deleting conversation:', error);
    res.status(500).json({ 
      error: 'Failed to delete conversation.',
      details: error.message
    });
  }
});

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/t', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB');
}).catch(err => {
  console.error('MongoDB connection error:', err);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`AlleAI chat backend running on port ${PORT}`);
});