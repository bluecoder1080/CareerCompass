const express = require('express');
const { body, validationResult } = require('express-validator');
const Chat = require('../models/Chat');
const Profile = require('../models/Profile');
const { protect } = require('../middleware/auth');
const mlService = require('../services/mlService');

const router = express.Router();

// @desc    Get user's chats
// @route   GET /api/chat
// @access  Private
router.get('/', protect, async (req, res, next) => {
  try {
    const { page = 1, limit = 20, category, status = 'active' } = req.query;

    const query = {
      user: req.user.id,
      status,
    };

    if (category) {
      query.category = category;
    }

    const chats = await Chat.find(query)
      .sort({ 'analytics.lastActivity': -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('title category status analytics createdAt updatedAt');

    const total = await Chat.countDocuments(query);

    res.status(200).json({
      success: true,
      count: chats.length,
      total,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
      data: chats,
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get specific chat
// @route   GET /api/chat/:id
// @access  Private
router.get('/:id', protect, async (req, res, next) => {
  try {
    const chat = await Chat.findOne({
      _id: req.params.id,
      user: req.user.id,
    }).populate('context.userProfile', 'skills interests careerGoals');

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found',
      });
    }

    res.status(200).json({
      success: true,
      data: chat,
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Create new chat
// @route   POST /api/chat
// @access  Private
router.post('/', protect, [
  body('title').optional().trim().isLength({ max: 100 }).withMessage('Title cannot exceed 100 characters'),
  body('category').optional().isIn(['career_guidance', 'skill_development', 'job_search', 'interview_prep', 'general']),
  body('initialMessage').optional().trim().isLength({ max: 10000 }).withMessage('Message cannot exceed 10000 characters'),
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { title, category = 'general', initialMessage } = req.body;

    // Get user profile for context
    const userProfile = await Profile.findOne({ user: req.user.id });

    const chat = await Chat.create({
      user: req.user.id,
      title: title || 'New Chat',
      category,
      context: {
        userProfile: userProfile?._id,
        careerStage: userProfile ? 
          (userProfile.totalExperience < 1 ? 'entry_level' : 
           userProfile.totalExperience < 3 ? 'mid_level' : 'senior_level') : 
          'entry_level',
      },
    });

    // Add initial message if provided
    if (initialMessage) {
      await chat.addMessage('user', initialMessage);
      
      // Generate AI response
      try {
        const conversationHistory = chat.getConversationHistory();
        const context = {
          userProfile: userProfile?.toObject(),
          category,
        };

        const aiResponse = await mlService.generateChatResponse(conversationHistory, {
          context,
          temperature: 0.7,
          maxTokens: 1000,
        });

        await chat.addMessage('assistant', aiResponse.content, {
          model: aiResponse.model,
          tokens: aiResponse.tokens,
          processingTime: Date.now() - new Date(chat.updatedAt).getTime(),
        });
      } catch (aiError) {
        console.error('AI response generation failed:', aiError);
        // Add fallback message
        await chat.addMessage('assistant', 
          "I'm here to help with your career questions! How can I assist you today?",
          { model: 'fallback' }
        );
      }
    }

    const populatedChat = await Chat.findById(chat._id)
      .populate('context.userProfile', 'skills interests careerGoals');

    res.status(201).json({
      success: true,
      data: populatedChat,
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Send message to chat
// @route   POST /api/chat/:id/message
// @access  Private
router.post('/:id/message', protect, [
  body('content').trim().notEmpty().withMessage('Message content is required')
    .isLength({ max: 10000 }).withMessage('Message cannot exceed 10000 characters'),
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const chat = await Chat.findOne({
      _id: req.params.id,
      user: req.user.id,
      status: 'active',
    }).populate('context.userProfile');

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found or not accessible',
      });
    }

    const { content } = req.body;
    const startTime = Date.now();

    // Add user message
    await chat.addMessage('user', content);

    // Generate AI response
    try {
      const conversationHistory = chat.getConversationHistory(10); // Last 10 messages for context
      const context = {
        userProfile: chat.context.userProfile?.toObject(),
        category: chat.category,
        careerStage: chat.context.careerStage,
      };

      const aiResponse = await mlService.generateChatResponse(conversationHistory, {
        context,
        temperature: chat.settings.temperature,
        maxTokens: chat.settings.maxTokens,
      });

      const processingTime = Date.now() - startTime;

      await chat.addMessage('assistant', aiResponse.content, {
        model: aiResponse.model,
        tokens: aiResponse.tokens,
        processingTime,
        provider: aiResponse.provider,
      });

      // Get updated chat with new messages
      const updatedChat = await Chat.findById(chat._id)
        .populate('context.userProfile', 'skills interests careerGoals');

      res.status(200).json({
        success: true,
        data: {
          chat: updatedChat,
          lastMessage: updatedChat.messages[updatedChat.messages.length - 1],
        },
      });

    } catch (aiError) {
      console.error('AI response generation failed:', aiError);
      
      // Add fallback message
      const fallbackMessage = "I apologize, but I'm having trouble generating a response right now. Please try again in a moment.";
      await chat.addMessage('assistant', fallbackMessage, {
        model: 'fallback',
        error: true,
      });

      const updatedChat = await Chat.findById(chat._id);
      
      res.status(200).json({
        success: true,
        data: {
          chat: updatedChat,
          lastMessage: updatedChat.messages[updatedChat.messages.length - 1],
          warning: 'AI service temporarily unavailable',
        },
      });
    }
  } catch (error) {
    next(error);
  }
});

// @desc    Update chat settings
// @route   PUT /api/chat/:id/settings
// @access  Private
router.put('/:id/settings', protect, [
  body('title').optional().trim().isLength({ max: 100 }).withMessage('Title cannot exceed 100 characters'),
  body('category').optional().isIn(['career_guidance', 'skill_development', 'job_search', 'interview_prep', 'general']),
  body('settings.temperature').optional().isFloat({ min: 0, max: 2 }).withMessage('Temperature must be between 0 and 2'),
  body('settings.maxTokens').optional().isInt({ min: 1, max: 4000 }).withMessage('Max tokens must be between 1 and 4000'),
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { title, category, settings, tags } = req.body;

    const updateData = {};
    if (title) updateData.title = title;
    if (category) updateData.category = category;
    if (tags) updateData.tags = tags;
    if (settings) {
      if (settings.temperature !== undefined) updateData['settings.temperature'] = settings.temperature;
      if (settings.maxTokens !== undefined) updateData['settings.maxTokens'] = settings.maxTokens;
    }

    const chat = await Chat.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      updateData,
      { new: true, runValidators: true }
    );

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found',
      });
    }

    res.status(200).json({
      success: true,
      data: chat,
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Archive chat
// @route   PUT /api/chat/:id/archive
// @access  Private
router.put('/:id/archive', protect, async (req, res, next) => {
  try {
    const chat = await Chat.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found',
      });
    }

    await chat.archive();

    res.status(200).json({
      success: true,
      message: 'Chat archived successfully',
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Delete chat
// @route   DELETE /api/chat/:id
// @access  Private
router.delete('/:id', protect, async (req, res, next) => {
  try {
    const chat = await Chat.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found',
      });
    }

    await chat.softDelete();

    res.status(200).json({
      success: true,
      message: 'Chat deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get chat statistics
// @route   GET /api/chat/stats
// @access  Private
router.get('/stats/overview', protect, async (req, res, next) => {
  try {
    const stats = await Chat.getUserChatStats(req.user.id);
    
    const totalChats = await Chat.countDocuments({ 
      user: req.user.id, 
      status: { $ne: 'deleted' } 
    });

    const activeChats = await Chat.countDocuments({ 
      user: req.user.id, 
      status: 'active' 
    });

    res.status(200).json({
      success: true,
      data: {
        totalChats,
        activeChats,
        categoryBreakdown: stats,
      },
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Search chats
// @route   GET /api/chat/search
// @access  Private
router.get('/search/query', protect, async (req, res, next) => {
  try {
    const { q, category, limit = 10 } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required',
      });
    }

    const searchQuery = {
      user: req.user.id,
      status: { $ne: 'deleted' },
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { 'messages.content': { $regex: q, $options: 'i' } },
        { tags: { $regex: q, $options: 'i' } },
      ],
    };

    if (category) {
      searchQuery.category = category;
    }

    const chats = await Chat.find(searchQuery)
      .sort({ 'analytics.lastActivity': -1 })
      .limit(parseInt(limit))
      .select('title category status analytics createdAt updatedAt messages');

    // Highlight matching messages
    const results = chats.map(chat => {
      const matchingMessages = chat.messages.filter(msg => 
        msg.content.toLowerCase().includes(q.toLowerCase())
      ).slice(0, 3); // Show up to 3 matching messages

      return {
        ...chat.toObject(),
        matchingMessages,
        messages: undefined, // Remove full messages array
      };
    });

    res.status(200).json({
      success: true,
      count: results.length,
      data: results,
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Export chat
// @route   GET /api/chat/:id/export
// @access  Private
router.get('/:id/export', protect, async (req, res, next) => {
  try {
    const { format = 'json' } = req.query;

    const chat = await Chat.findOne({
      _id: req.params.id,
      user: req.user.id,
    }).populate('user', 'firstName lastName email');

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found',
      });
    }

    if (format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="chat-${chat._id}.json"`);
      
      return res.status(200).json({
        title: chat.title,
        category: chat.category,
        createdAt: chat.createdAt,
        messages: chat.messages,
        analytics: chat.analytics,
      });
    }

    if (format === 'txt') {
      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Content-Disposition', `attachment; filename="chat-${chat._id}.txt"`);
      
      let content = `Chat: ${chat.title}\n`;
      content += `Category: ${chat.category}\n`;
      content += `Created: ${chat.createdAt}\n`;
      content += `Messages: ${chat.messages.length}\n\n`;
      content += '--- CONVERSATION ---\n\n';
      
      chat.messages.forEach(msg => {
        content += `[${msg.timestamp.toISOString()}] ${msg.role.toUpperCase()}:\n`;
        content += `${msg.content}\n\n`;
      });
      
      return res.status(200).send(content);
    }

    res.status(400).json({
      success: false,
      message: 'Unsupported export format. Use json or txt.',
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
