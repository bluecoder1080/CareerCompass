const express = require('express');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @desc    Get current user
// @route   GET /api/users/me
// @access  Private
router.get('/me', protect, async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      data: {
        id: req.user._id,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        email: req.user.email,
        avatar: req.user.avatar,
        preferences: req.user.preferences,
        lastLogin: req.user.lastLogin,
        createdAt: req.user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
