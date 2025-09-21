const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const authMockRoutes = require('./routes/auth-mock');
const userRoutes = require('./routes/users');
const profileRoutes = require('./routes/profiles');
const chatRoutes = require('./routes/chat');
const psychotestRoutes = require('./routes/psychotest');
const resumeRoutes = require('./routes/resumes');
const projectRoutes = require('./routes/projects');
const mlRoutes = require('./routes/ml');
const techUpdateRoutes = require('./routes/techUpdates');

// Import middleware
const errorHandler = require('./middleware/errorHandler');
const { connectDB } = require('./config/database');

const app = express();

// Connect to MongoDB
connectDB();

// Security middleware
app.use(helmet());
app.use(mongoSanitize());

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', limiter);

// CORS configuration - Allow multiple origins for development
const corsOptions = {
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5176',
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));

// Handle preflight requests explicitly
app.options('*', cors(corsOptions));

// Body parsing middleware
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Static files
app.use('/uploads', express.static('uploads'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'CareerCompass API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    cors_origins: corsOptions.origin
  });
});

// API routes - Always use real database authentication
console.log('🔐 Using database authentication');
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/psychotest', psychotestRoutes);
app.use('/api/resumes', resumeRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/ml', mlRoutes);
app.use('/api/tech-updates', techUpdateRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// Global error handler
app.use(errorHandler);

const PORT = 5000;

const server = app.listen(PORT, () => {
  console.log(`🚀 CareerCompass server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL || 'Not set'}`);
  console.log(`🌐 CORS Origins: ${corsOptions.origin.join(', ')}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.log(`Error: ${err.message}`);
  process.exit(1);
});

module.exports = app;
