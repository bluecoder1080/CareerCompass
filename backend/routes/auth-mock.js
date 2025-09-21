const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// Mock user storage (in-memory for development)
const mockUsers = new Map();

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback-secret', {
    expiresIn: '7d',
  });
};

// Send token response
const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user.id);

  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      avatar: user.avatar || null,
      preferences: user.preferences || { theme: 'dark' },
    },
  });
};

// @desc    Register user (Mock)
// @route   POST /api/auth/register
// @access  Public
router.post('/register', [
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Please include a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
], async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { firstName, lastName, email, password } = req.body;

    // Check if user already exists
    if (mockUsers.has(email)) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email',
      });
    }

    // Create mock user
    const user = {
      id: Date.now().toString(), // Simple ID generation
      firstName,
      lastName,
      email,
      password, // In real app, this would be hashed
      avatar: null,
      preferences: { theme: 'dark' },
      createdAt: new Date(),
      lastLogin: new Date(),
    };

    // Store in mock database
    mockUsers.set(email, user);

    console.log(`✅ Mock user registered: ${email}`);
    sendTokenResponse(user, 201, res);
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration',
    });
  }
});

// @desc    Login user (Mock)
// @route   POST /api/auth/login
// @access  Public
router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Please include a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
], async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { email, password } = req.body;

    // Find user in mock database
    const user = mockUsers.get(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Check password (in real app, this would be hashed comparison)
    if (user.password !== password) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Update last login
    user.lastLogin = new Date();

    console.log(`✅ Mock user logged in: ${email}`);
    sendTokenResponse(user, 200, res);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login',
    });
  }
});

// @desc    Get current user (Mock)
// @route   GET /api/auth/me
// @access  Private
router.get('/me', async (req, res) => {
  try {
    // Simple token verification for mock
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided',
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
      
      // Find user by ID in mock database
      const user = Array.from(mockUsers.values()).find(u => u.id === decoded.id);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User not found',
        });
      }

      res.status(200).json({
        success: true,
        data: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          avatar: user.avatar,
          preferences: user.preferences,
        },
      });
    } catch (jwtError) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token',
      });
    }
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

module.exports = router;
