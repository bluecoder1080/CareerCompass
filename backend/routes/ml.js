const express = require('express');
const { body, validationResult } = require('express-validator');
const { protect, optionalAuth } = require('../middleware/auth');
const mlService = require('../services/mlService');
const Profile = require('../models/Profile');

const router = express.Router();

// @desc    Get ML service status
// @route   GET /api/ml/status
// @access  Public
router.get('/status', (req, res) => {
  const status = mlService.getProviderStatus();
  
  res.status(200).json({
    success: true,
    data: {
      activeProvider: status.active,
      availableProviders: status.available,
      isOperational: status.available.length > 0,
    },
  });
});

// @desc    Analyze text with AI
// @route   POST /api/ml/analyze
// @access  Private
router.post('/analyze', protect, [
  body('text').trim().notEmpty().withMessage('Text is required for analysis')
    .isLength({ max: 10000 }).withMessage('Text cannot exceed 10000 characters'),
  body('analysisType').optional().isIn(['career', 'skills', 'resume', 'personality'])
    .withMessage('Invalid analysis type'),
  body('context').optional().isObject().withMessage('Context must be an object'),
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

    const { text, analysisType = 'general', context = {} } = req.body;

    // Get user profile for context
    const userProfile = await Profile.findOne({ user: req.user.id });

    const messages = [
      {
        role: 'system',
        content: getSystemPrompt(analysisType),
      },
      {
        role: 'user',
        content: text,
      },
    ];

    const aiContext = {
      userProfile: userProfile?.toObject(),
      analysisType,
      ...context,
    };

    const response = await mlService.generateChatResponse(messages, {
      context: aiContext,
      temperature: 0.3,
      maxTokens: 1500,
    });

    res.status(200).json({
      success: true,
      data: {
        analysis: response.content,
        metadata: {
          model: response.model,
          provider: response.provider,
          tokens: response.tokens,
          analysisType,
        },
      },
    });
  } catch (error) {
    console.error('ML analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Analysis service temporarily unavailable',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// @desc    Generate career suggestions
// @route   POST /api/ml/career-suggestions
// @access  Private
router.post('/career-suggestions', protect, [
  body('skills').optional().isArray().withMessage('Skills must be an array'),
  body('interests').optional().isArray().withMessage('Interests must be an array'),
  body('experience').optional().isInt({ min: 0 }).withMessage('Experience must be a positive number'),
  body('preferences').optional().isObject().withMessage('Preferences must be an object'),
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

    const { skills = [], interests = [], experience = 0, preferences = {} } = req.body;

    // Get user profile
    const userProfile = await Profile.findOne({ user: req.user.id })
      .populate('user', 'firstName lastName');

    const prompt = buildCareerSuggestionsPrompt({
      skills,
      interests,
      experience,
      preferences,
      userProfile,
    });

    const messages = [
      {
        role: 'system',
        content: 'You are a senior career counselor with expertise in technology careers and market trends.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ];

    const response = await mlService.generateChatResponse(messages, {
      temperature: 0.4,
      maxTokens: 2000,
    });

    // Try to parse structured response
    let suggestions;
    try {
      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        suggestions = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      // Fallback to plain text response
      suggestions = {
        careers: [
          {
            title: 'Software Developer',
            match: 85,
            description: 'Based on your skills and interests, software development could be a great fit.',
          },
        ],
        recommendations: response.content.split('\n').filter(line => line.trim()),
      };
    }

    res.status(200).json({
      success: true,
      data: suggestions,
    });
  } catch (error) {
    console.error('Career suggestions error:', error);
    res.status(500).json({
      success: false,
      message: 'Career suggestions service temporarily unavailable',
    });
  }
});

// @desc    Generate skill recommendations
// @route   POST /api/ml/skill-recommendations
// @access  Private
router.post('/skill-recommendations', protect, [
  body('targetRole').optional().trim().isLength({ max: 100 }).withMessage('Target role too long'),
  body('currentSkills').optional().isArray().withMessage('Current skills must be an array'),
  body('timeframe').optional().isIn(['3months', '6months', '1year', '2years'])
    .withMessage('Invalid timeframe'),
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

    const { targetRole, currentSkills = [], timeframe = '6months' } = req.body;

    // Get user profile
    const userProfile = await Profile.findOne({ user: req.user.id });

    const prompt = buildSkillRecommendationsPrompt({
      targetRole,
      currentSkills,
      timeframe,
      userProfile,
    });

    const messages = [
      {
        role: 'system',
        content: 'You are a technical skills advisor with expertise in career development and learning paths.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ];

    const response = await mlService.generateChatResponse(messages, {
      temperature: 0.3,
      maxTokens: 1500,
    });

    res.status(200).json({
      success: true,
      data: {
        recommendations: response.content,
        targetRole,
        timeframe,
        generatedAt: new Date(),
      },
    });
  } catch (error) {
    console.error('Skill recommendations error:', error);
    res.status(500).json({
      success: false,
      message: 'Skill recommendations service temporarily unavailable',
    });
  }
});

// @desc    Chat with AI assistant
// @route   POST /api/ml/chat
// @access  Private
router.post('/chat', protect, [
  body('message').trim().notEmpty().withMessage('Message is required')
    .isLength({ max: 5000 }).withMessage('Message cannot exceed 5000 characters'),
  body('context').optional().isObject().withMessage('Context must be an object'),
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

    const { message, context = {} } = req.body;

    // Get user profile for personalization
    const userProfile = await Profile.findOne({ user: req.user.id });

    const messages = [
      {
        role: 'system',
        content: 'You are CareerCompass AI, a helpful career guidance assistant. Provide personalized, actionable advice based on the user\'s profile and goals.',
      },
      {
        role: 'user',
        content: message,
      },
    ];

    const aiContext = {
      userProfile: userProfile?.toObject(),
      ...context,
    };

    const response = await mlService.generateChatResponse(messages, {
      context: aiContext,
      temperature: 0.7,
      maxTokens: 1000,
    });

    res.status(200).json({
      success: true,
      data: {
        response: response.content,
        metadata: {
          model: response.model,
          provider: response.provider,
          tokens: response.tokens,
        },
      },
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Chat service temporarily unavailable',
    });
  }
});

// @desc    Switch ML provider (admin/development)
// @route   POST /api/ml/switch-provider
// @access  Private
router.post('/switch-provider', protect, [
  body('provider').isIn(['gemma', 'vertex', 'huggingface', 'mock'])
    .withMessage('Invalid provider'),
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

    const { provider } = req.body;
    const success = mlService.switchProvider(provider);

    if (!success) {
      return res.status(400).json({
        success: false,
        message: 'Provider not available or invalid',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        activeProvider: provider,
        message: `Switched to ${provider} provider`,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Helper functions
function getSystemPrompt(analysisType) {
  const prompts = {
    career: 'You are a career counselor. Analyze the provided text for career insights, opportunities, and recommendations.',
    skills: 'You are a skills assessment expert. Analyze the text to identify skills, competencies, and areas for development.',
    resume: 'You are a resume expert. Analyze the resume content for strengths, weaknesses, and improvement suggestions.',
    personality: 'You are a personality assessment specialist. Analyze the text for personality traits and career fit.',
    general: 'You are a career guidance AI assistant. Provide helpful analysis and insights based on the provided text.',
  };

  return prompts[analysisType] || prompts.general;
}

function buildCareerSuggestionsPrompt({ skills, interests, experience, preferences, userProfile }) {
  let prompt = 'Based on the following information, provide career suggestions:\n\n';

  if (skills.length > 0) {
    prompt += `Skills: ${skills.join(', ')}\n`;
  }

  if (interests.length > 0) {
    prompt += `Interests: ${interests.join(', ')}\n`;
  }

  prompt += `Experience Level: ${experience} years\n`;

  if (preferences.workType) {
    prompt += `Work Preferences: ${preferences.workType}\n`;
  }

  if (userProfile) {
    prompt += `\nProfile Context:\n`;
    if (userProfile.currentRole?.title) {
      prompt += `Current Role: ${userProfile.currentRole.title}\n`;
    }
    if (userProfile.careerGoals?.shortTerm?.length > 0) {
      prompt += `Career Goals: ${userProfile.careerGoals.shortTerm.join(', ')}\n`;
    }
  }

  prompt += `\nPlease provide 3-5 career suggestions with match percentages, descriptions, and required skills.`;

  return prompt;
}

function buildSkillRecommendationsPrompt({ targetRole, currentSkills, timeframe, userProfile }) {
  let prompt = 'Provide skill development recommendations:\n\n';

  if (targetRole) {
    prompt += `Target Role: ${targetRole}\n`;
  }

  if (currentSkills.length > 0) {
    prompt += `Current Skills: ${currentSkills.join(', ')}\n`;
  }

  prompt += `Learning Timeframe: ${timeframe}\n`;

  if (userProfile?.skills?.length > 0) {
    const profileSkills = userProfile.skills.map(s => `${s.name} (${s.level})`);
    prompt += `Profile Skills: ${profileSkills.join(', ')}\n`;
  }

  prompt += `\nPlease recommend skills to learn, prioritized by importance, with learning resources and estimated time investment.`;

  return prompt;
}

module.exports = router;
