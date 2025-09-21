const express = require('express');
const { body, validationResult } = require('express-validator');
const TechUpdate = require('../models/TechUpdate');
const Profile = require('../models/Profile');
const { protect, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// @desc    Get tech updates feed
// @route   GET /api/tech-updates
// @access  Public (personalized if authenticated)
router.get('/', optionalAuth, async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      category, 
      difficulty,
      featured = false 
    } = req.query;

    let updates;
    let total;

    if (req.user) {
      // Get personalized feed for authenticated users
      const userProfile = await Profile.findOne({ user: req.user.id });
      
      const options = {
        limit: parseInt(limit),
        skip: (parseInt(page) - 1) * parseInt(limit),
        category,
        minRelevanceScore: 30,
      };

      updates = await TechUpdate.getPersonalizedFeed(userProfile, options);
      total = updates.length; // Approximation for personalized feed
    } else {
      // Public feed
      const query = {
        status: 'published',
        publishedAt: { $lte: new Date() },
        $or: [
          { expiresAt: { $exists: false } },
          { expiresAt: { $gte: new Date() } },
        ],
      };

      if (category) query.category = category;
      if (difficulty) query['metadata.difficulty'] = difficulty;
      if (featured === 'true') query.isFeatured = true;

      updates = await TechUpdate.find(query)
        .sort({ isFeatured: -1, publishedAt: -1 })
        .limit(parseInt(limit))
        .skip((parseInt(page) - 1) * parseInt(limit))
        .populate('relatedUpdates', 'title category publishedAt')
        .select('-userInteractions'); // Don't expose user interactions in public feed

      total = await TechUpdate.countDocuments(query);
    }

    res.status(200).json({
      success: true,
      count: updates.length,
      total,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
      data: updates,
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get specific tech update
// @route   GET /api/tech-updates/:id
// @access  Public
router.get('/:id', optionalAuth, async (req, res, next) => {
  try {
    const update = await TechUpdate.findOne({
      _id: req.params.id,
      status: 'published',
    }).populate('relatedUpdates', 'title category publishedAt summary');

    if (!update) {
      return res.status(404).json({
        success: false,
        message: 'Tech update not found',
      });
    }

    // Increment view count
    if (req.user) {
      await update.incrementViews(req.user.id);
    } else {
      await update.incrementViews();
    }

    res.status(200).json({
      success: true,
      data: update,
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get trending tech updates
// @route   GET /api/tech-updates/trending/list
// @access  Public
router.get('/trending/list', async (req, res, next) => {
  try {
    const { timeframe = '7d', limit = 10 } = req.query;

    const trendingUpdates = await TechUpdate.getTrending(timeframe, parseInt(limit));

    res.status(200).json({
      success: true,
      count: trendingUpdates.length,
      data: trendingUpdates,
      metadata: {
        timeframe,
        generatedAt: new Date(),
      },
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Search tech updates
// @route   GET /api/tech-updates/search/query
// @access  Public
router.get('/search/query', async (req, res, next) => {
  try {
    const { 
      q, 
      category, 
      difficulty,
      tags,
      page = 1, 
      limit = 20 
    } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required',
      });
    }

    const query = {
      status: 'published',
      $text: { $search: q },
    };

    if (category) query.category = category;
    if (difficulty) query['metadata.difficulty'] = difficulty;
    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim());
      query.tags = { $in: tagArray };
    }

    const updates = await TechUpdate.find(query, { score: { $meta: 'textScore' } })
      .sort({ score: { $meta: 'textScore' }, publishedAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .select('-userInteractions');

    const total = await TechUpdate.countDocuments(query);

    res.status(200).json({
      success: true,
      count: updates.length,
      total,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
      data: updates,
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get tech updates by category
// @route   GET /api/tech-updates/category/:category
// @access  Public
router.get('/category/:category', async (req, res, next) => {
  try {
    const { category } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const validCategories = [
      'artificial_intelligence', 'web_development', 'mobile_development',
      'cloud_computing', 'cybersecurity', 'data_science', 'blockchain',
      'devops', 'programming_languages', 'frameworks', 'tools',
      'industry_news', 'career_advice', 'emerging_tech'
    ];

    if (!validCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category',
      });
    }

    const updates = await TechUpdate.find({
      category,
      status: 'published',
      publishedAt: { $lte: new Date() },
    })
      .sort({ publishedAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .select('-userInteractions');

    const total = await TechUpdate.countDocuments({
      category,
      status: 'published',
    });

    res.status(200).json({
      success: true,
      count: updates.length,
      total,
      category,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
      data: updates,
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Interact with tech update (like, bookmark, etc.)
// @route   POST /api/tech-updates/:id/interact
// @access  Private
router.post('/:id/interact', protect, [
  body('action').isIn(['like', 'share', 'bookmark', 'comment']).withMessage('Invalid interaction action'),
  body('metadata').optional().isObject().withMessage('Metadata must be an object'),
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

    const { action, metadata = {} } = req.body;

    const update = await TechUpdate.findOne({
      _id: req.params.id,
      status: 'published',
    });

    if (!update) {
      return res.status(404).json({
        success: false,
        message: 'Tech update not found',
      });
    }

    await update.addInteraction(req.user.id, action, metadata);

    res.status(200).json({
      success: true,
      data: {
        action,
        metrics: update.metrics,
        userInteracted: true,
      },
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get user's bookmarked updates
// @route   GET /api/tech-updates/bookmarks/list
// @access  Private
router.get('/bookmarks/list', protect, async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const updates = await TechUpdate.find({
      'userInteractions': {
        $elemMatch: {
          user: req.user.id,
          action: 'bookmark',
        },
      },
      status: 'published',
    })
      .sort({ 'userInteractions.timestamp': -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .select('-userInteractions');

    const total = await TechUpdate.countDocuments({
      'userInteractions': {
        $elemMatch: {
          user: req.user.id,
          action: 'bookmark',
        },
      },
      status: 'published',
    });

    res.status(200).json({
      success: true,
      count: updates.length,
      total,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
      data: updates,
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get user's reading history
// @route   GET /api/tech-updates/history/list
// @access  Private
router.get('/history/list', protect, async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const updates = await TechUpdate.find({
      'userInteractions': {
        $elemMatch: {
          user: req.user.id,
          action: 'view',
        },
      },
      status: 'published',
    })
      .sort({ 'userInteractions.timestamp': -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .select('-userInteractions');

    const total = await TechUpdate.countDocuments({
      'userInteractions': {
        $elemMatch: {
          user: req.user.id,
          action: 'view',
        },
      },
      status: 'published',
    });

    res.status(200).json({
      success: true,
      count: updates.length,
      total,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
      data: updates,
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get tech update categories
// @route   GET /api/tech-updates/categories/list
// @access  Public
router.get('/categories/list', async (req, res, next) => {
  try {
    const categories = await TechUpdate.aggregate([
      {
        $match: {
          status: 'published',
        },
      },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          latestUpdate: { $max: '$publishedAt' },
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);

    const formattedCategories = categories.map(cat => ({
      category: cat._id,
      displayName: cat._id.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      count: cat.count,
      latestUpdate: cat.latestUpdate,
    }));

    res.status(200).json({
      success: true,
      count: formattedCategories.length,
      data: formattedCategories,
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get personalized recommendations
// @route   GET /api/tech-updates/recommendations/list
// @access  Private
router.get('/recommendations/list', protect, async (req, res, next) => {
  try {
    const { limit = 10 } = req.query;

    const userProfile = await Profile.findOne({ user: req.user.id });

    if (!userProfile) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found. Please complete your profile for personalized recommendations.',
      });
    }

    const recommendations = await TechUpdate.getPersonalizedFeed(userProfile, {
      limit: parseInt(limit),
      minRelevanceScore: 50, // Higher threshold for recommendations
    });

    res.status(200).json({
      success: true,
      count: recommendations.length,
      data: recommendations,
      metadata: {
        basedOn: {
          skills: userProfile.skills?.length || 0,
          interests: userProfile.interests?.length || 0,
          experienceLevel: userProfile.totalExperience,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
