const express = require('express');
const { body, validationResult } = require('express-validator');
const PsychotestResult = require('../models/PsychotestResult');
const Profile = require('../models/Profile');
const { protect } = require('../middleware/auth');
const mlService = require('../services/mlService');

const router = express.Router();

// Psychometric test questions
const PSYCHOTEST_QUESTIONS = [
  {
    id: 1,
    question: "When faced with a complex problem, I prefer to:",
    options: {
      A: "Break it down into smaller, logical steps",
      B: "Look for creative, unconventional solutions", 
      C: "Discuss it with others to get different perspectives",
      D: "Find practical, proven methods that work"
    },
    scoring: {
      A: { category: 'analytical', score: 4 },
      B: { category: 'creative', score: 4 },
      C: { category: 'social', score: 4 },
      D: { category: 'practical', score: 4 }
    }
  },
  {
    id: 2,
    question: "In a team project, I naturally tend to:",
    options: {
      A: "Analyze data and provide insights",
      B: "Generate new ideas and possibilities",
      C: "Facilitate communication and collaboration",
      D: "Focus on implementation and execution"
    },
    scoring: {
      A: { category: 'analytical', score: 4 },
      B: { category: 'creative', score: 4 },
      C: { category: 'social', score: 4 },
      D: { category: 'practical', score: 4 }
    }
  },
  {
    id: 3,
    question: "When making important decisions, I rely most on:",
    options: {
      A: "Careful analysis of facts and data",
      B: "Intuition and innovative thinking",
      C: "Input from trusted colleagues and mentors",
      D: "Past experience and proven strategies"
    },
    scoring: {
      A: { category: 'analytical', score: 4 },
      B: { category: 'creative', score: 4 },
      C: { category: 'social', score: 4 },
      D: { category: 'practical', score: 4 }
    }
  },
  {
    id: 4,
    question: "My ideal work environment would be:",
    options: {
      A: "A quiet space where I can focus on research and analysis",
      B: "A dynamic, flexible space that encourages innovation",
      C: "An open, collaborative space with lots of interaction",
      D: "An organized, efficient space with clear processes"
    },
    scoring: {
      A: { category: 'analytical', score: 4 },
      B: { category: 'creative', score: 4 },
      C: { category: 'social', score: 4 },
      D: { category: 'practical', score: 4 }
    }
  },
  {
    id: 5,
    question: "When learning something new, I prefer to:",
    options: {
      A: "Study the theory and underlying principles first",
      B: "Experiment and discover through trial and error",
      C: "Learn from others through discussion and collaboration",
      D: "Follow step-by-step instructions and best practices"
    },
    scoring: {
      A: { category: 'analytical', score: 4 },
      B: { category: 'creative', score: 4 },
      C: { category: 'social', score: 4 },
      D: { category: 'practical', score: 4 }
    }
  },
  {
    id: 6,
    question: "In a leadership role, I would focus on:",
    options: {
      A: "Setting clear goals based on data-driven insights",
      B: "Inspiring innovation and creative problem-solving",
      C: "Building strong relationships and team cohesion",
      D: "Ensuring efficient processes and reliable execution"
    },
    scoring: {
      A: { category: 'leadership', score: 3, secondary: 'analytical', secondaryScore: 1 },
      B: { category: 'leadership', score: 3, secondary: 'creative', secondaryScore: 1 },
      C: { category: 'leadership', score: 3, secondary: 'social', secondaryScore: 1 },
      D: { category: 'leadership', score: 3, secondary: 'practical', secondaryScore: 1 }
    }
  },
  {
    id: 7,
    question: "When presenting ideas, I tend to:",
    options: {
      A: "Use charts, graphs, and detailed analysis",
      B: "Focus on vision, possibilities, and big picture thinking",
      C: "Emphasize benefits to people and relationships",
      D: "Highlight practical applications and concrete results"
    },
    scoring: {
      A: { category: 'analytical', score: 4 },
      B: { category: 'creative', score: 4 },
      C: { category: 'social', score: 4 },
      D: { category: 'practical', score: 4 }
    }
  },
  {
    id: 8,
    question: "My greatest strength in problem-solving is:",
    options: {
      A: "Logical reasoning and systematic analysis",
      B: "Thinking outside the box and finding novel solutions",
      C: "Understanding different perspectives and building consensus",
      D: "Finding efficient, workable solutions quickly"
    },
    scoring: {
      A: { category: 'analytical', score: 4 },
      B: { category: 'creative', score: 4 },
      C: { category: 'social', score: 4 },
      D: { category: 'practical', score: 4 }
    }
  },
  {
    id: 9,
    question: "When working under pressure, I:",
    options: {
      A: "Focus on gathering and analyzing relevant information",
      B: "Look for innovative approaches that others might miss",
      C: "Seek support and collaborate with team members",
      D: "Rely on proven methods and systematic execution"
    },
    scoring: {
      A: { category: 'analytical', score: 4 },
      B: { category: 'creative', score: 4 },
      C: { category: 'social', score: 4 },
      D: { category: 'practical', score: 4 }
    }
  },
  {
    id: 10,
    question: "What motivates me most in my career is:",
    options: {
      A: "Solving complex problems and understanding how things work",
      B: "Creating something new and making a unique contribution",
      C: "Helping others and making a positive impact on people",
      D: "Achieving concrete results and building something lasting"
    },
    scoring: {
      A: { category: 'analytical', score: 4 },
      B: { category: 'creative', score: 4 },
      C: { category: 'social', score: 4 },
      D: { category: 'practical', score: 4 }
    }
  }
];

// @desc    Get psychometric test questions
// @route   GET /api/psychotest/questions
// @access  Public
router.get('/questions', (req, res) => {
  const questions = PSYCHOTEST_QUESTIONS.map(q => ({
    id: q.id,
    question: q.question,
    options: q.options
  }));

  res.status(200).json({
    success: true,
    data: {
      questions,
      totalQuestions: questions.length,
      estimatedTime: '10-15 minutes'
    }
  });
});

// @desc    Submit psychometric test answers
// @route   POST /api/psychotest/submit
// @access  Private
router.post('/submit', protect, [
  body('answers').isArray({ min: 10, max: 10 }).withMessage('Must provide exactly 10 answers'),
  body('answers.*.questionId').isInt({ min: 1, max: 10 }).withMessage('Invalid question ID'),
  body('answers.*.selectedOption').isIn(['A', 'B', 'C', 'D']).withMessage('Invalid option selected'),
  body('timeSpent').optional().isInt({ min: 0 }).withMessage('Time spent must be a positive number'),
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

    const { answers, timeSpent } = req.body;

    // Validate all questions are answered
    const answeredQuestions = answers.map(a => a.questionId).sort();
    const expectedQuestions = Array.from({ length: 10 }, (_, i) => i + 1);
    
    if (JSON.stringify(answeredQuestions) !== JSON.stringify(expectedQuestions)) {
      return res.status(400).json({
        success: false,
        message: 'All questions must be answered',
      });
    }

    // Process answers and calculate scores
    const processedAnswers = answers.map(answer => {
      const question = PSYCHOTEST_QUESTIONS.find(q => q.id === answer.questionId);
      const scoring = question.scoring[answer.selectedOption];
      
      return {
        questionId: answer.questionId,
        question: question.question,
        selectedOption: answer.selectedOption,
        optionText: question.options[answer.selectedOption],
        score: scoring.score,
        category: scoring.category,
      };
    });

    // Get user profile for context
    const userProfile = await Profile.findOne({ user: req.user.id })
      .populate('user', 'firstName lastName');

    // Create psychotest result
    const psychotestResult = new PsychotestResult({
      user: req.user.id,
      answers: processedAnswers,
      timeSpent,
    });

    // Calculate personality scores
    psychotestResult.calculateScores();

    // Generate AI analysis
    try {
      const aiAnalysis = await mlService.analyzePsychotest(processedAnswers, userProfile);
      
      if (aiAnalysis.personalityAnalysis) {
        psychotestResult.personalityAnalysis = aiAnalysis.personalityAnalysis;
      }
      
      if (aiAnalysis.careerRecommendations) {
        psychotestResult.careerRecommendations = aiAnalysis.careerRecommendations;
      }
      
      if (aiAnalysis.skillGaps) {
        psychotestResult.skillGaps = aiAnalysis.skillGaps;
      }
      
      if (aiAnalysis.sixMonthRoadmap) {
        psychotestResult.sixMonthRoadmap = aiAnalysis.sixMonthRoadmap;
      }

      psychotestResult.aiAnalysis = {
        model: 'gemma-2b',
        processingTime: Date.now() - new Date().getTime(),
        confidence: 0.85,
      };
    } catch (aiError) {
      console.error('AI analysis failed:', aiError);
      // Use fallback analysis
      const fallbackAnalysis = mlService.mockPsychotestAnalysis(processedAnswers);
      psychotestResult.personalityAnalysis = fallbackAnalysis.personalityAnalysis;
      psychotestResult.careerRecommendations = fallbackAnalysis.careerRecommendations;
      psychotestResult.skillGaps = fallbackAnalysis.skillGaps;
      psychotestResult.sixMonthRoadmap = fallbackAnalysis.sixMonthRoadmap;
    }

    await psychotestResult.save();

    // Update user profile with AI insights if available
    if (userProfile && psychotestResult.aiInsights) {
      userProfile.aiInsights = {
        careerPath: psychotestResult.personalityType,
        strengthsAnalysis: psychotestResult.personalityAnalysis.summary,
        skillGaps: psychotestResult.skillGaps.map(sg => sg.skill),
        recommendations: psychotestResult.careerRecommendations.map(cr => cr.title),
        lastAnalyzed: new Date(),
      };
      await userProfile.save();
    }

    res.status(201).json({
      success: true,
      data: psychotestResult,
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get user's psychotest results
// @route   GET /api/psychotest/results
// @access  Private
router.get('/results', protect, async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const results = await PsychotestResult.find({ user: req.user.id })
      .sort({ completedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('user', 'firstName lastName');

    const total = await PsychotestResult.countDocuments({ user: req.user.id });

    res.status(200).json({
      success: true,
      count: results.length,
      total,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
      data: results,
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get specific psychotest result
// @route   GET /api/psychotest/results/:id
// @access  Private
router.get('/results/:id', protect, async (req, res, next) => {
  try {
    const result = await PsychotestResult.findOne({
      _id: req.params.id,
      user: req.user.id,
    }).populate('user', 'firstName lastName email');

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Psychotest result not found',
      });
    }

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get latest psychotest result
// @route   GET /api/psychotest/latest
// @access  Private
router.get('/latest', protect, async (req, res, next) => {
  try {
    const result = await PsychotestResult.getLatestResult(req.user.id);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'No psychotest results found',
      });
    }

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update roadmap milestone completion
// @route   PUT /api/psychotest/results/:id/milestone/:milestoneIndex
// @access  Private
router.put('/results/:id/milestone/:milestoneIndex', protect, [
  body('completed').isBoolean().withMessage('Completed status must be boolean'),
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

    const { completed } = req.body;
    const milestoneIndex = parseInt(req.params.milestoneIndex);

    const result = await PsychotestResult.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Psychotest result not found',
      });
    }

    if (!result.sixMonthRoadmap.milestones[milestoneIndex]) {
      return res.status(404).json({
        success: false,
        message: 'Milestone not found',
      });
    }

    result.sixMonthRoadmap.milestones[milestoneIndex].completed = completed;
    if (completed) {
      result.sixMonthRoadmap.milestones[milestoneIndex].completedAt = new Date();
    } else {
      result.sixMonthRoadmap.milestones[milestoneIndex].completedAt = undefined;
    }

    await result.save();

    res.status(200).json({
      success: true,
      data: result.sixMonthRoadmap.milestones[milestoneIndex],
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Generate shareable link for result
// @route   POST /api/psychotest/results/:id/share
// @access  Private
router.post('/results/:id/share', protect, async (req, res, next) => {
  try {
    const result = await PsychotestResult.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Psychotest result not found',
      });
    }

    await result.generateShareableLink();

    res.status(200).json({
      success: true,
      data: {
        shareableLink: result.shareableLink,
        shareUrl: `${process.env.FRONTEND_URL}/psychotest/shared/${result.shareableLink}`,
      },
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get shared psychotest result (public)
// @route   GET /api/psychotest/shared/:shareId
// @access  Public
router.get('/shared/:shareId', async (req, res, next) => {
  try {
    const result = await PsychotestResult.findOne({
      shareableLink: req.params.shareId,
      isShared: true,
    }).populate('user', 'firstName lastName')
      .select('-answers -aiAnalysis'); // Don't expose detailed answers and AI prompts

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Shared result not found or no longer available',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        personalityType: result.personalityType,
        dominantTraits: result.dominantTraits,
        personalityAnalysis: result.personalityAnalysis,
        careerRecommendations: result.careerRecommendations.slice(0, 3), // Show top 3
        completedAt: result.completedAt,
        user: {
          firstName: result.user.firstName,
          lastName: result.user.lastName,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Delete psychotest result
// @route   DELETE /api/psychotest/results/:id
// @access  Private
router.delete('/results/:id', protect, async (req, res, next) => {
  try {
    const result = await PsychotestResult.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Psychotest result not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Psychotest result deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get personality statistics (admin/analytics)
// @route   GET /api/psychotest/stats
// @access  Private
router.get('/stats', protect, async (req, res, next) => {
  try {
    const userResults = await PsychotestResult.find({ user: req.user.id })
      .sort({ completedAt: -1 });

    if (userResults.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No psychotest results found',
      });
    }

    const latest = userResults[0];
    const retakeRecommended = latest.shouldRetake();

    const stats = {
      totalTests: userResults.length,
      latestResult: {
        completedAt: latest.completedAt,
        personalityType: latest.personalityType,
        dominantTraits: latest.dominantTraits,
      },
      retakeRecommended,
      progressTracking: {
        milestonesCompleted: latest.sixMonthRoadmap.milestones.filter(m => m.completed).length,
        totalMilestones: latest.sixMonthRoadmap.milestones.length,
        completionPercentage: Math.round(
          (latest.sixMonthRoadmap.milestones.filter(m => m.completed).length / 
           latest.sixMonthRoadmap.milestones.length) * 100
        ),
      },
    };

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
