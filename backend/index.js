const express = require('express');
const cors = require('cors');
require('dotenv').config();
const axios = require('axios');
const mongoose = require('mongoose');
const ChatMessage = require('./schema/chatMessage.ts'); // Use .js, not .ts
const { clerkMiddleware } = require('@clerk/express'); // Use require, not import

const app = express(); // Create app first

app.use(cors());
app.use(express.json());


// Alle-AI API configuration
const ALLEAI_API_URL = 'https://api.alle-ai.com/api/v1/chat/completions';
const ALLEAI_API_KEY = process.env.ALLEAI_API_KEY;

require('dotenv').config();

// Make sure these env variables exist
if (!process.env.CLERK_SECRET_KEY || !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
  throw new Error("Missing Clerk environment variables");
}

app.use(
  clerkMiddleware({
    secretKey: process.env.CLERK_SECRET_KEY,
    publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  })
);

app.post('/api/chat', async (req, res) => {
  try {
    const userId = req.auth && req.auth.userId ? req.auth.userId : 'anonymous';
    const { message, conversationId } = req.body;
    console.log('req.body:', req.body);

    if (!message) {
      return res.status(400).json({ error: 'Message is required.' });
    }

    if (!ALLEAI_API_KEY) {
      return res.status(500).json({ error: 'API key not configured.' });
    }

    const finalConversationId = conversationId || `conv_${userId}_${Date.now()}`;

    // Check if this is a new conversation that needs moderator assignment
    const existingMessages = await ChatMessage.countDocuments({ 
      conversationId: finalConversationId 
    });

    // Save user message to database
    const userMessage = new ChatMessage({
      userId,
      role: 'user',
      message: message,
      conversationId: finalConversationId
    });
    await userMessage.save();

    // Auto-assign to moderator if it's a new conversation or no moderator assigned
    if (existingMessages === 0) {
      // Auto-assign using round robin
      try {
        await axios.post(`http://localhost:${PORT}/api/moderator/auto-assign/${finalConversationId}`);
      } catch (assignError) {
        console.error('Error auto-assigning moderator:', assignError.message);
      }
    }

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

    // Extract the AI's reply with better fallback handling
    let aiReply = response?.data?.responses?.responses?.['gpt-4o']?.message?.content;
    
    // Check if aiReply is empty, null, undefined, or just whitespace
    if (!aiReply || aiReply.trim().length === 0) {
      console.log('No valid AI response received, using fallback message');
      console.log('Full response:', JSON.stringify(response.data, null, 2));
      aiReply = "Let me connect you with someone";
    }

    // Save AI response to database (use fallback message if needed)
    const aiMessage = new ChatMessage({
      userId,
      role: 'ai',
      message: aiReply,
      conversationId: finalConversationId
    });
    await aiMessage.save();

    res.json({ 
      reply: aiReply,
      conversationId: finalConversationId
    });
  } catch (error) {
    console.error('Error from AlleAI:', error.response?.data || error.message);
    
    // If there's an error, also save a fallback message and return it
    try {
      const fallbackMessage = new ChatMessage({
        userId: req.auth && req.auth.userId ? req.auth.userId : 'anonymous',
        role: 'ai',
        message: "Let me connect you with someone",
        conversationId: req.body.conversationId || `conv_${req.auth?.userId || 'anonymous'}_${Date.now()}`
      });
      await fallbackMessage.save();
    } catch (saveError) {
      console.error('Error saving fallback message:', saveError);
    }
    
    // Return fallback message instead of error to user
    res.json({ 
      reply: "Let me connect you with someone",
      conversationId: req.body.conversationId || `conv_${req.auth?.userId || 'anonymous'}_${Date.now()}`
    });
  }
});


// Add these routes to your existing Express server

// Route to get all conversations for moderation (with pagination)
app.get('/api/moderator/conversations', async (req, res) => {
  try {
    const { page = 1, limit = 20, priority, search } = req.query;
    const skip = (page - 1) * limit;

    let matchCondition = {};
    if (priority) {
      matchCondition.priority = priority;
    }

    const pipeline = [
      { $match: matchCondition },
      {
        $group: {
          _id: '$conversationId',
          userId: { $first: '$userId' },
          lastMessage: { $last: '$message' },
          lastTimestamp: { $last: '$timestamp' },
          messageCount: { $sum: 1 },
          unreadCount: { 
            $sum: { 
              $cond: [
                { $and: [{ $eq: ['$role', 'moderator'] }, { $eq: ['$isRead', false] }] },
                1, 0
              ]
            }
          },
          priority: { $first: '$priority' },
          hasModeratorMessages: {
            $sum: {
              $cond: [{ $eq: ['$role', 'moderator'] }, 1, 0]
            }
          }
        }
      },
      { $sort: { lastTimestamp: -1 } },
      { $skip: skip },
      { $limit: parseInt(limit) }
    ];

    if (search) {
      pipeline.unshift({
        $match: {
          $or: [
            { message: { $regex: search, $options: 'i' } },
            { conversationId: { $regex: search, $options: 'i' } }
          ]
        }
      });
    }

    const conversations = await ChatMessage.aggregate(pipeline);
    
    // Get total count for pagination
    const totalCount = await ChatMessage.distinct('conversationId').then(ids => ids.length);

    res.json({ 
      conversations,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching conversations for moderation:', error);
    res.status(500).json({ 
      error: 'Failed to fetch conversations.',
      details: error.message
    });
  }
});

// Route to send moderator message
app.post('/api/moderator/message', async (req, res) => {
  try {
    const { message, conversationId, moderatorId } = req.body;
    
    if (!message || !conversationId) {
      return res.status(400).json({ error: 'Message and conversationId are required.' });
    }

    // Get the userId from the conversation
    const existingMessage = await ChatMessage.findOne({ conversationId });
    if (!existingMessage) {
      return res.status(404).json({ error: 'Conversation not found.' });
    }

    const moderatorMessage = new ChatMessage({
      userId: existingMessage.userId,
      role: 'moderator',
      message: message,
      conversationId: conversationId,
      moderatorId: moderatorId || 'anonymous-moderator',
      isRead: false
    });

    await moderatorMessage.save();
    
    res.json({ 
      message: 'Moderator message sent successfully',
      data: moderatorMessage
    });
  } catch (error) {
    console.error('Error sending moderator message:', error);
    res.status(500).json({ 
      error: 'Failed to send moderator message.',
      details: error.message
    });
  }
});

// Route to mark moderator messages as read
app.put('/api/moderator/mark-read/:conversationId', async (req, res) => {
  try {
    const { conversationId } = req.params;
    
    await ChatMessage.updateMany(
      { conversationId, role: 'moderator', isRead: false },
      { $set: { isRead: true } }
    );

    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({ 
      error: 'Failed to mark messages as read.',
      details: error.message
    });
  }
});

// Route to update conversation priority
app.put('/api/moderator/priority/:conversationId', async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { priority } = req.body;
    
    if (!['low', 'medium', 'high'].includes(priority)) {
      return res.status(400).json({ error: 'Invalid priority level.' });
    }

    await ChatMessage.updateMany(
      { conversationId },
      { $set: { priority } }
    );

    res.json({ message: 'Priority updated successfully' });
  } catch (error) {
    console.error('Error updating priority:', error);
    res.status(500).json({ 
      error: 'Failed to update priority.',
      details: error.message
    });
  }
});

// Route to get moderator statistics
app.get('/api/moderator/stats', async (req, res) => {
  try {
    const totalConversations = await ChatMessage.distinct('conversationId').then(ids => ids.length);
    const activeToday = await ChatMessage.distinct('conversationId', {
      timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    }).then(ids => ids.length);
    
    const priorityStats = await ChatMessage.aggregate([
      {
        $group: {
          _id: '$conversationId',
          priority: { $first: '$priority' }
        }
      },
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      totalConversations,
      activeToday,
      priorityStats
    });
  } catch (error) {
    console.error('Error fetching moderator stats:', error);
    res.status(500).json({ 
      error: 'Failed to fetch stats.',
      details: error.message
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


// Add this route to your main server to handle user message retrieval with moderator messages

// Updated route to get messages for a specific conversation (including moderator messages)
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

    // Mark moderator messages as read by user when they fetch messages
    await ChatMessage.updateMany(
      { conversationId, role: 'moderator', isRead: false },
      { $set: { isRead: true } }
    );

    res.json({ messages });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ 
      error: 'Failed to fetch messages.',
      details: error.message
    });
  }
});

// Route to check if user has unread moderator messages
app.get('/api/unread-moderator-messages/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const unreadCount = await ChatMessage.countDocuments({
      userId,
      role: 'moderator',
      isRead: false
    });

    // Get conversations with unread moderator messages
    const unreadConversations = await ChatMessage.aggregate([
      {
        $match: {
          userId,
          role: 'moderator',
          isRead: false
        }
      },
      {
        $group: {
          _id: '$conversationId',
          count: { $sum: 1 },
          lastMessage: { $last: '$message' },
          lastTimestamp: { $last: '$timestamp' }
        }
      }
    ]);

    res.json({ 
      unreadCount,
      unreadConversations 
    });
  } catch (error) {
    console.error('Error checking unread messages:', error);
    res.status(500).json({ 
      error: 'Failed to check unread messages.',
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

// Add this after your existing routes

// Route to assign conversation to a specific moderator
app.post('/api/moderator/assign', async (req, res) => {
  try {
    const { conversationId, moderatorId, assignedBy } = req.body;
    
    if (!conversationId || !moderatorId) {
      return res.status(400).json({ error: 'ConversationId and moderatorId are required.' });
    }

    // Update all messages in the conversation with the assigned moderator
    await ChatMessage.updateMany(
      { conversationId },
      { 
        $set: { 
          assignedModerator: moderatorId,
          assignedAt: new Date(),
          assignedBy: assignedBy || 'system'
        }
      }
    );

    // Create a system message to log the assignment
    const assignmentMessage = new ChatMessage({
      userId: 'system',
      role: 'system',
      message: `Conversation assigned to moderator: ${moderatorId}`,
      conversationId: conversationId,
      assignedModerator: moderatorId,
      isRead: true
    });
    await assignmentMessage.save();

    res.json({ 
      message: 'Conversation assigned successfully',
      assignedTo: moderatorId
    });
  } catch (error) {
    console.error('Error assigning conversation:', error);
    res.status(500).json({ 
      error: 'Failed to assign conversation.',
      details: error.message
    });
  }
});

// Route to get conversations assigned to a specific moderator
app.get('/api/moderator/:moderatorId/conversations', async (req, res) => {
  try {
    const { moderatorId } = req.params;
    const { page = 1, limit = 20, priority, search } = req.query;
    const skip = (page - 1) * limit;

    let matchCondition = { assignedModerator: moderatorId };
    if (priority) {
      matchCondition.priority = priority;
    }

    const pipeline = [
      { $match: matchCondition },
      {
        $group: {
          _id: '$conversationId',
          userId: { $first: '$userId' },
          lastMessage: { $last: '$message' },
          lastTimestamp: { $last: '$timestamp' },
          messageCount: { $sum: 1 },
          priority: { $first: '$priority' },
          assignedModerator: { $first: '$assignedModerator' },
          assignedAt: { $first: '$assignedAt' },
          hasModeratorMessages: {
            $sum: {
              $cond: [{ $eq: ['$role', 'moderator'] }, 1, 0]
            }
          },
          unreadCount: { 
            $sum: { 
              $cond: [
                { $and: [{ $eq: ['$role', 'user'] }, { $eq: ['$isRead', false] }] },
                1, 0
              ]
            }
          }
        }
      },
      { $sort: { lastTimestamp: -1 } },
      { $skip: skip },
      { $limit: parseInt(limit) }
    ];

    if (search) {
      pipeline.unshift({
        $match: {
          $or: [
            { message: { $regex: search, $options: 'i' } },
            { conversationId: { $regex: search, $options: 'i' } }
          ]
        }
      });
    }

    const conversations = await ChatMessage.aggregate(pipeline);
    
    res.json({ 
      conversations,
      moderatorId,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: conversations.length
      }
    });
  } catch (error) {
    console.error('Error fetching moderator conversations:', error);
    res.status(500).json({ 
      error: 'Failed to fetch conversations.',
      details: error.message
    });
  }
});

// Auto-assign new conversations to moderators (Round Robin)
app.post('/api/moderator/auto-assign/:conversationId', async (req, res) => {
  try {
    const { conversationId } = req.params;
    
    // Define your moderator list
    const moderators = [
      'moderator_001',
      'moderator_002', 
      'moderator_003',
      'moderator_004'
    ];

    // Get the last assigned moderator to implement round robin
    const lastAssignment = await ChatMessage.findOne({ 
      assignedModerator: { $exists: true } 
    }).sort({ assignedAt: -1 });

    let nextModeratorIndex = 0;
    if (lastAssignment && lastAssignment.assignedModerator) {
      const lastIndex = moderators.indexOf(lastAssignment.assignedModerator);
      nextModeratorIndex = (lastIndex + 1) % moderators.length;
    }

    const assignedModerator = moderators[nextModeratorIndex];

    // Assign the conversation
    await ChatMessage.updateMany(
      { conversationId },
      { 
        $set: { 
          assignedModerator: assignedModerator,
          assignedAt: new Date(),
          assignedBy: 'auto-system'
        }
      }
    );

    res.json({ 
      message: 'Conversation auto-assigned successfully',
      assignedTo: assignedModerator,
      conversationId
    });
  } catch (error) {
    console.error('Error auto-assigning conversation:', error);
    res.status(500).json({ 
      error: 'Failed to auto-assign conversation.',
      details: error.message
    });
  }
});

// Modified moderator message route to include moderator assignment
app.post('/api/moderator/message', async (req, res) => {
  try {
    const { message, conversationId, moderatorId } = req.body;
    
    if (!message || !conversationId || !moderatorId) {
      return res.status(400).json({ error: 'Message, conversationId, and moderatorId are required.' });
    }

    // Get the userId from the conversation
    const existingMessage = await ChatMessage.findOne({ conversationId });
    if (!existingMessage) {
      return res.status(404).json({ error: 'Conversation not found.' });
    }

    // Check if this moderator is assigned to this conversation
    const assignedConversation = await ChatMessage.findOne({ 
      conversationId, 
      assignedModerator: moderatorId 
    });

    if (!assignedConversation) {
      // Auto-assign if not already assigned
      await ChatMessage.updateMany(
        { conversationId },
        { 
          $set: { 
            assignedModerator: moderatorId,
            assignedAt: new Date(),
            assignedBy: 'moderator-takeover'
          }
        }
      );
    }

    const moderatorMessage = new ChatMessage({
      userId: existingMessage.userId,
      role: 'moderator',
      message: message,
      conversationId: conversationId,
      moderatorId: moderatorId,
      assignedModerator: moderatorId,
      isRead: false
    });

    await moderatorMessage.save();
    
    res.json({ 
      message: 'Moderator message sent successfully',
      data: moderatorMessage,
      assignedModerator: moderatorId
    });
  } catch (error) {
    console.error('Error sending moderator message:', error);
    res.status(500).json({ 
      error: 'Failed to send moderator message.',
      details: error.message
    });
  }
});

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tsy', {
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