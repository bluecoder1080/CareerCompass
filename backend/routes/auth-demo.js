const express = require('express');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Dummy users for demo
const demoUsers = [
  {
    id: '1',
    email: 'demo@careercompass.com',
    password: 'demo123',
    firstName: 'Demo',
    lastName: 'User',
    role: 'user'
  },
  {
    id: '2',
    email: 'judge@demo.com',
    password: 'judge123',
    firstName: 'Judge',
    lastName: 'Demo',
    role: 'user'
  },
  {
    id: '3',
    email: 'test@test.com',
    password: 'test123',
    firstName: 'Test',
    lastName: 'User',
    role: 'user'
  }
];

// @desc    Register user (dummy)
// @route   POST /api/auth-demo/register
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    // Create dummy user
    const newUser = {
      id: Date.now().toString(),
      email,
      firstName,
      lastName,
      role: 'user',
      createdAt: new Date()
    };

    // Generate JWT token
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email },
      process.env.JWT_SECRET || 'demo-secret-key',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Demo account created successfully',
      token,
      user: newUser
    });
  } catch (error) {
    console.error('Demo register error:', error);
    res.status(500).json({
      success: false,
      message: 'Demo registration failed',
      error: error.message
    });
  }
});

// @desc    Login user (dummy)
// @route   POST /api/auth-demo/login
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find demo user or create one
    let user = demoUsers.find(u => u.email === email);
    
    if (!user) {
      // Create a new demo user on the fly
      user = {
        id: Date.now().toString(),
        email,
        firstName: 'Demo',
        lastName: 'User',
        role: 'user',
        createdAt: new Date()
      };
      demoUsers.push(user);
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || 'demo-secret-key',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(200).json({
      success: true,
      message: 'Demo login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Demo login error:', error);
    res.status(500).json({
      success: false,
      message: 'Demo login failed',
      error: error.message
    });
  }
});

// @desc    Get current user (dummy)
// @route   GET /api/auth-demo/me
// @access  Private
router.get('/me', (req, res) => {
  try {
    // Extract token from header
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'demo-secret-key');
    
    // Find user or create demo user
    let user = demoUsers.find(u => u.id === decoded.id);
    
    if (!user) {
      user = {
        id: decoded.id,
        email: decoded.email,
        firstName: 'Demo',
        lastName: 'User',
        role: 'user'
      };
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Demo me error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
});

// @desc    Logout user (dummy)
// @route   POST /api/auth-demo/logout
// @access  Private
router.post('/logout', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Demo logout successful'
  });
});

module.exports = router;
