const express = require('express');
const { body, validationResult } = require('express-validator');
const Project = require('../models/Project');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @desc    Get user's projects
// @route   GET /api/projects
// @access  Private
router.get('/', protect, async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      category, 
      projectType,
      portfolio = false 
    } = req.query;

    const query = { user: req.user.id };

    if (status) query.status = status;
    if (category) query.category = category;
    if (projectType) query.projectType = projectType;
    if (portfolio === 'true') query.isPortfolioProject = true;

    const projects = await Project.find(query)
      .sort({ 'timeline.startDate': -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Project.countDocuments(query);

    res.status(200).json({
      success: true,
      count: projects.length,
      total,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
      data: projects,
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get specific project
// @route   GET /api/projects/:id
// @access  Private
router.get('/:id', protect, async (req, res, next) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    res.status(200).json({
      success: true,
      data: project,
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Create new project
// @route   POST /api/projects
// @access  Private
router.post('/', protect, [
  body('title').trim().notEmpty().withMessage('Project title is required')
    .isLength({ max: 100 }).withMessage('Title cannot exceed 100 characters'),
  body('description').trim().notEmpty().withMessage('Project description is required')
    .isLength({ max: 2000 }).withMessage('Description cannot exceed 2000 characters'),
  body('category').isIn([
    'web_application', 'mobile_app', 'desktop_app', 'api_service',
    'data_analysis', 'machine_learning', 'game_development', 'blockchain',
    'iot', 'automation', 'open_source', 'research', 'other'
  ]).withMessage('Invalid project category'),
  body('projectType').isIn([
    'personal', 'professional', 'academic', 'freelance', 'open_source', 'hackathon'
  ]).withMessage('Invalid project type'),
  body('timeline.startDate').isISO8601().withMessage('Valid start date is required'),
  body('timeline.endDate').optional().isISO8601().withMessage('Invalid end date'),
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

    const project = await Project.create({
      ...req.body,
      user: req.user.id,
    });

    res.status(201).json({
      success: true,
      data: project,
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private
router.put('/:id', protect, async (req, res, next) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    // Update allowed fields
    const allowedFields = [
      'title', 'description', 'shortDescription', 'urls', 'timeline',
      'technologies', 'category', 'projectType', 'status', 'team',
      'myRole', 'features', 'achievements', 'challenges', 'lessonsLearned',
      'metrics', 'media', 'documentation', 'visibility', 'isPortfolioProject',
      'portfolioOrder', 'tags'
    ];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        project[field] = req.body[field];
      }
    });

    await project.save();

    res.status(200).json({
      success: true,
      data: project,
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private
router.delete('/:id', protect, async (req, res, next) => {
  try {
    const project = await Project.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Project deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Add project feedback
// @route   POST /api/projects/:id/feedback
// @access  Private
router.post('/:id/feedback', protect, [
  body('reviewer').trim().notEmpty().withMessage('Reviewer name is required'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').optional().trim().isLength({ max: 1000 }).withMessage('Comment too long'),
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

    const project = await Project.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    const { reviewer, rating, comment } = req.body;
    await project.addFeedback(reviewer, rating, comment);

    res.status(201).json({
      success: true,
      data: project.feedback[project.feedback.length - 1],
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get portfolio projects
// @route   GET /api/projects/portfolio/:userId
// @access  Public
router.get('/portfolio/:userId', async (req, res, next) => {
  try {
    const { limit = 10 } = req.query;

    const projects = await Project.getPortfolioProjects(req.params.userId, limit);

    res.status(200).json({
      success: true,
      count: projects.length,
      data: projects,
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Search projects by technology
// @route   GET /api/projects/search/technology
// @access  Public
router.get('/search/technology', async (req, res, next) => {
  try {
    const { q, limit = 20 } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Technology search query is required',
      });
    }

    const projects = await Project.getProjectsByTechnology(q, limit);

    res.status(200).json({
      success: true,
      count: projects.length,
      data: projects,
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Sync GitHub data for project
// @route   POST /api/projects/:id/sync-github
// @access  Private
router.post('/:id/sync-github', protect, async (req, res, next) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    if (!project.urls.github) {
      return res.status(400).json({
        success: false,
        message: 'No GitHub URL found for this project',
      });
    }

    await project.syncGitHubData();

    res.status(200).json({
      success: true,
      data: project.integrations.github,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
