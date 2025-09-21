const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - require authentication
const protect = async (req, res, next) => {
  let token;

  // Check for token in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  // Check for token in cookies (if using cookie-based auth)
  else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  // Make sure token exists
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route',
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from token
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'No user found with this token',
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'User account is deactivated',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route',
    });
  }
};

// Optional authentication - doesn't fail if no token
const optionalAuth = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      
      if (user && user.isActive) {
        req.user = user;
      }
    } catch (error) {
      // Silently fail for optional auth
      console.log('Optional auth failed:', error.message);
    }
  }

  next();
};

// Grant access to specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`,
      });
    }

    next();
  };
};

// Check if user owns the resource
const checkOwnership = (Model, paramName = 'id', populatePath = null) => {
  return async (req, res, next) => {
    try {
      const resourceId = req.params[paramName];
      let query = Model.findById(resourceId);
      
      if (populatePath) {
        query = query.populate(populatePath);
      }
      
      const resource = await query;

      if (!resource) {
        return res.status(404).json({
          success: false,
          message: 'Resource not found',
        });
      }

      // Check if user owns the resource
      const resourceUserId = resource.user ? resource.user._id || resource.user : resource._id;
      
      if (resourceUserId.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to access this resource',
        });
      }

      req.resource = resource;
      next();
    } catch (error) {
      console.error('Ownership check error:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error during authorization check',
      });
    }
  };
};

// Rate limiting per user
const userRateLimit = (windowMs = 15 * 60 * 1000, max = 100) => {
  const requests = new Map();

  return (req, res, next) => {
    if (!req.user) {
      return next();
    }

    const userId = req.user._id.toString();
    const now = Date.now();
    const windowStart = now - windowMs;

    // Clean up old entries
    if (requests.has(userId)) {
      const userRequests = requests.get(userId);
      const validRequests = userRequests.filter(timestamp => timestamp > windowStart);
      requests.set(userId, validRequests);
    }

    // Check current request count
    const currentRequests = requests.get(userId) || [];
    
    if (currentRequests.length >= max) {
      return res.status(429).json({
        success: false,
        message: 'Too many requests, please try again later',
        retryAfter: Math.ceil(windowMs / 1000),
      });
    }

    // Add current request
    currentRequests.push(now);
    requests.set(userId, currentRequests);

    next();
  };
};

// Validate API key for external integrations
const validateApiKey = async (req, res, next) => {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey) {
    return res.status(401).json({
      success: false,
      message: 'API key required',
    });
  }

  // In a real application, you'd validate against stored API keys
  // For now, we'll use a simple environment variable check
  if (apiKey !== process.env.API_KEY) {
    return res.status(401).json({
      success: false,
      message: 'Invalid API key',
    });
  }

  next();
};

module.exports = {
  protect,
  optionalAuth,
  authorize,
  checkOwnership,
  userRateLimit,
  validateApiKey,
};
