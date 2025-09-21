const express = require('express');
const { body, validationResult } = require('express-validator');
const Profile = require('../models/Profile');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @desc    Get user profile
// @route   GET /api/profiles/me
// @access  Private
router.get('/me', protect, async (req, res, next) => {
  try {
    let profile = await Profile.findOne({ user: req.user.id })
      .populate('user', 'firstName lastName email avatar');

    if (!profile) {
      // Create empty profile if doesn't exist
      profile = await Profile.create({
        user: req.user.id,
      });
      await profile.populate('user', 'firstName lastName email avatar');
    }

    res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update user profile
// @route   PUT /api/profiles/me
// @access  Private
router.put('/me', protect, [
  body('dateOfBirth').optional().isISO8601().withMessage('Invalid date format'),
  body('phone').optional().matches(/^\+?[\d\s\-\(\)]+$/).withMessage('Invalid phone number'),
  body('location.city').optional().trim().isLength({ max: 100 }).withMessage('City name too long'),
  body('location.state').optional().trim().isLength({ max: 100 }).withMessage('State name too long'),
  body('location.country').optional().trim().isLength({ max: 100 }).withMessage('Country name too long'),
  body('currentRole.title').optional().trim().isLength({ max: 100 }).withMessage('Role title too long'),
  body('currentRole.company').optional().trim().isLength({ max: 100 }).withMessage('Company name too long'),
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

    let profile = await Profile.findOne({ user: req.user.id });

    if (!profile) {
      profile = new Profile({ user: req.user.id });
    }

    // Update fields that are provided
    const allowedFields = [
      'dateOfBirth', 'phone', 'location', 'currentRole', 'careerGoals', 'isPublic'
    ];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        profile[field] = req.body[field];
      }
    });

    await profile.save();
    await profile.populate('user', 'firstName lastName email avatar');

    res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Add education
// @route   POST /api/profiles/me/education
// @access  Private
router.post('/me/education', protect, [
  body('institution').trim().notEmpty().withMessage('Institution is required'),
  body('degree').trim().notEmpty().withMessage('Degree is required'),
  body('field').trim().notEmpty().withMessage('Field of study is required'),
  body('startDate').optional().isISO8601().withMessage('Invalid start date'),
  body('endDate').optional().isISO8601().withMessage('Invalid end date'),
  body('gpa').optional().isFloat({ min: 0, max: 4.0 }).withMessage('GPA must be between 0 and 4.0'),
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

    let profile = await Profile.findOne({ user: req.user.id });
    if (!profile) {
      profile = new Profile({ user: req.user.id });
    }

    profile.education.push(req.body);
    await profile.save();

    res.status(201).json({
      success: true,
      data: profile.education[profile.education.length - 1],
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update education
// @route   PUT /api/profiles/me/education/:educationId
// @access  Private
router.put('/me/education/:educationId', protect, async (req, res, next) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found',
      });
    }

    const education = profile.education.id(req.params.educationId);
    if (!education) {
      return res.status(404).json({
        success: false,
        message: 'Education record not found',
      });
    }

    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) {
        education[key] = req.body[key];
      }
    });

    await profile.save();

    res.status(200).json({
      success: true,
      data: education,
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Delete education
// @route   DELETE /api/profiles/me/education/:educationId
// @access  Private
router.delete('/me/education/:educationId', protect, async (req, res, next) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found',
      });
    }

    const education = profile.education.id(req.params.educationId);
    if (!education) {
      return res.status(404).json({
        success: false,
        message: 'Education record not found',
      });
    }

    education.deleteOne();
    await profile.save();

    res.status(200).json({
      success: true,
      message: 'Education record deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Add skill
// @route   POST /api/profiles/me/skills
// @access  Private
router.post('/me/skills', protect, [
  body('name').trim().notEmpty().withMessage('Skill name is required'),
  body('level').isIn(['beginner', 'intermediate', 'advanced', 'expert']).withMessage('Invalid skill level'),
  body('category').isIn(['technical', 'soft', 'language', 'tool', 'framework']).withMessage('Invalid skill category'),
  body('yearsOfExperience').optional().isInt({ min: 0, max: 50 }).withMessage('Years of experience must be between 0 and 50'),
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

    let profile = await Profile.findOne({ user: req.user.id });
    if (!profile) {
      profile = new Profile({ user: req.user.id });
    }

    // Check if skill already exists
    const existingSkill = profile.skills.find(skill => 
      skill.name.toLowerCase() === req.body.name.toLowerCase()
    );

    if (existingSkill) {
      return res.status(400).json({
        success: false,
        message: 'Skill already exists',
      });
    }

    profile.skills.push(req.body);
    await profile.save();

    res.status(201).json({
      success: true,
      data: profile.skills[profile.skills.length - 1],
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update skill
// @route   PUT /api/profiles/me/skills/:skillId
// @access  Private
router.put('/me/skills/:skillId', protect, async (req, res, next) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found',
      });
    }

    const skill = profile.skills.id(req.params.skillId);
    if (!skill) {
      return res.status(404).json({
        success: false,
        message: 'Skill not found',
      });
    }

    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) {
        skill[key] = req.body[key];
      }
    });

    await profile.save();

    res.status(200).json({
      success: true,
      data: skill,
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Delete skill
// @route   DELETE /api/profiles/me/skills/:skillId
// @access  Private
router.delete('/me/skills/:skillId', protect, async (req, res, next) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found',
      });
    }

    const skill = profile.skills.id(req.params.skillId);
    if (!skill) {
      return res.status(404).json({
        success: false,
        message: 'Skill not found',
      });
    }

    skill.deleteOne();
    await profile.save();

    res.status(200).json({
      success: true,
      message: 'Skill deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Add experience
// @route   POST /api/profiles/me/experience
// @access  Private
router.post('/me/experience', protect, [
  body('title').trim().notEmpty().withMessage('Job title is required'),
  body('company').trim().notEmpty().withMessage('Company name is required'),
  body('startDate').isISO8601().withMessage('Valid start date is required'),
  body('endDate').optional().isISO8601().withMessage('Invalid end date'),
  body('description').optional().trim().isLength({ max: 2000 }).withMessage('Description too long'),
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

    let profile = await Profile.findOne({ user: req.user.id });
    if (!profile) {
      profile = new Profile({ user: req.user.id });
    }

    // If this is marked as current role, update others
    if (req.body.isCurrentRole) {
      profile.experience.forEach(exp => {
        exp.isCurrentRole = false;
      });
    }

    profile.experience.push(req.body);
    await profile.save();

    res.status(201).json({
      success: true,
      data: profile.experience[profile.experience.length - 1],
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update experience
// @route   PUT /api/profiles/me/experience/:experienceId
// @access  Private
router.put('/me/experience/:experienceId', protect, async (req, res, next) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found',
      });
    }

    const experience = profile.experience.id(req.params.experienceId);
    if (!experience) {
      return res.status(404).json({
        success: false,
        message: 'Experience record not found',
      });
    }

    // If this is being marked as current role, update others
    if (req.body.isCurrentRole) {
      profile.experience.forEach(exp => {
        if (exp._id.toString() !== req.params.experienceId) {
          exp.isCurrentRole = false;
        }
      });
    }

    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) {
        experience[key] = req.body[key];
      }
    });

    await profile.save();

    res.status(200).json({
      success: true,
      data: experience,
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Delete experience
// @route   DELETE /api/profiles/me/experience/:experienceId
// @access  Private
router.delete('/me/experience/:experienceId', protect, async (req, res, next) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found',
      });
    }

    const experience = profile.experience.id(req.params.experienceId);
    if (!experience) {
      return res.status(404).json({
        success: false,
        message: 'Experience record not found',
      });
    }

    experience.deleteOne();
    await profile.save();

    res.status(200).json({
      success: true,
      message: 'Experience record deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Add interest
// @route   POST /api/profiles/me/interests
// @access  Private
router.post('/me/interests', protect, [
  body('name').trim().notEmpty().withMessage('Interest name is required'),
  body('category').isIn(['technology', 'industry', 'role', 'hobby']).withMessage('Invalid interest category'),
  body('level').optional().isIn(['curious', 'interested', 'passionate']).withMessage('Invalid interest level'),
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

    let profile = await Profile.findOne({ user: req.user.id });
    if (!profile) {
      profile = new Profile({ user: req.user.id });
    }

    // Check if interest already exists
    const existingInterest = profile.interests.find(interest => 
      interest.name.toLowerCase() === req.body.name.toLowerCase()
    );

    if (existingInterest) {
      return res.status(400).json({
        success: false,
        message: 'Interest already exists',
      });
    }

    profile.interests.push(req.body);
    await profile.save();

    res.status(201).json({
      success: true,
      data: profile.interests[profile.interests.length - 1],
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Delete interest
// @route   DELETE /api/profiles/me/interests/:interestId
// @access  Private
router.delete('/me/interests/:interestId', protect, async (req, res, next) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found',
      });
    }

    const interest = profile.interests.id(req.params.interestId);
    if (!interest) {
      return res.status(404).json({
        success: false,
        message: 'Interest not found',
      });
    }

    interest.deleteOne();
    await profile.save();

    res.status(200).json({
      success: true,
      message: 'Interest deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get profile completion status
// @route   GET /api/profiles/me/completion
// @access  Private
router.get('/me/completion', protect, async (req, res, next) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    
    if (!profile) {
      return res.status(200).json({
        success: true,
        data: {
          completionScore: 20, // Basic info from user account
          missingFields: [
            'contact information',
            'education',
            'skills',
            'experience',
            'career goals'
          ],
          recommendations: [
            'Add your contact information',
            'Include your educational background',
            'List your key skills',
            'Add work experience',
            'Define your career goals'
          ]
        },
      });
    }

    const completionScore = profile.calculateCompletionScore();
    const missingFields = [];
    const recommendations = [];

    if (!profile.phone || !profile.location?.city) {
      missingFields.push('contact information');
      recommendations.push('Add your phone number and location');
    }

    if (!profile.education || profile.education.length === 0) {
      missingFields.push('education');
      recommendations.push('Include your educational background');
    }

    if (!profile.skills || profile.skills.length < 3) {
      missingFields.push('skills');
      recommendations.push('Add at least 3 key skills');
    }

    if (!profile.experience || profile.experience.length === 0) {
      missingFields.push('experience');
      recommendations.push('Add your work experience');
    }

    if (!profile.careerGoals || (!profile.careerGoals.shortTerm?.length && !profile.careerGoals.preferredRoles?.length)) {
      missingFields.push('career goals');
      recommendations.push('Define your career objectives');
    }

    if (!profile.resumeUrl && !profile.resumeText) {
      missingFields.push('resume');
      recommendations.push('Upload your resume');
    }

    res.status(200).json({
      success: true,
      data: {
        completionScore,
        missingFields,
        recommendations,
        totalFields: 6,
        completedFields: 6 - missingFields.length,
      },
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get public profile
// @route   GET /api/profiles/:userId
// @access  Public
router.get('/:userId', async (req, res, next) => {
  try {
    const profile = await Profile.findOne({ 
      user: req.params.userId,
      isPublic: true 
    }).populate('user', 'firstName lastName avatar');

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Public profile not found',
      });
    }

    // Return limited public information
    const publicProfile = {
      user: profile.user,
      currentRole: profile.currentRole,
      location: profile.location,
      skills: profile.skills,
      interests: profile.interests,
      experience: profile.experience.map(exp => ({
        title: exp.title,
        company: exp.company,
        startDate: exp.startDate,
        endDate: exp.endDate,
        isCurrentRole: exp.isCurrentRole,
      })),
      education: profile.education.map(edu => ({
        institution: edu.institution,
        degree: edu.degree,
        field: edu.field,
        startDate: edu.startDate,
        endDate: edu.endDate,
      })),
      completionScore: profile.completionScore,
      totalExperience: profile.totalExperience,
    };

    res.status(200).json({
      success: true,
      data: publicProfile,
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Search profiles
// @route   GET /api/profiles/search
// @access  Public
router.get('/search/query', async (req, res, next) => {
  try {
    const { 
      q, 
      skills, 
      location, 
      experience_min, 
      experience_max,
      page = 1, 
      limit = 20 
    } = req.query;

    const query = { isPublic: true };

    // Text search
    if (q) {
      query.$or = [
        { 'currentRole.title': { $regex: q, $options: 'i' } },
        { 'skills.name': { $regex: q, $options: 'i' } },
        { 'interests.name': { $regex: q, $options: 'i' } },
      ];
    }

    // Skills filter
    if (skills) {
      const skillsArray = skills.split(',').map(s => s.trim());
      query['skills.name'] = { $in: skillsArray.map(s => new RegExp(s, 'i')) };
    }

    // Location filter
    if (location) {
      query.$or = [
        { 'location.city': { $regex: location, $options: 'i' } },
        { 'location.state': { $regex: location, $options: 'i' } },
        { 'location.country': { $regex: location, $options: 'i' } },
      ];
    }

    const profiles = await Profile.find(query)
      .populate('user', 'firstName lastName avatar')
      .select('user currentRole location skills interests completionScore')
      .sort({ completionScore: -1, updatedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Filter by experience if specified
    let filteredProfiles = profiles;
    if (experience_min || experience_max) {
      filteredProfiles = profiles.filter(profile => {
        const exp = profile.totalExperience;
        if (experience_min && exp < parseInt(experience_min)) return false;
        if (experience_max && exp > parseInt(experience_max)) return false;
        return true;
      });
    }

    const total = await Profile.countDocuments(query);

    res.status(200).json({
      success: true,
      count: filteredProfiles.length,
      total,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
      data: filteredProfiles,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
