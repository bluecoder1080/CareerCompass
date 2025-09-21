const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  
  title: {
    type: String,
    required: [true, 'Project title is required'],
    maxlength: [100, 'Title cannot exceed 100 characters'],
  },
  
  description: {
    type: String,
    required: [true, 'Project description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters'],
  },
  
  shortDescription: {
    type: String,
    maxlength: [200, 'Short description cannot exceed 200 characters'],
  },
  
  // Project URLs
  urls: {
    live: String,
    github: String,
    demo: String,
    documentation: String,
  },
  
  // Project timeline
  timeline: {
    startDate: {
      type: Date,
      required: true,
    },
    endDate: Date,
    isOngoing: {
      type: Boolean,
      default: false,
    },
    estimatedCompletion: Date,
  },
  
  // Technologies and skills
  technologies: [{
    name: { type: String, required: true },
    category: {
      type: String,
      enum: ['frontend', 'backend', 'database', 'cloud', 'mobile', 'ai_ml', 'devops', 'testing', 'other'],
    },
    proficiencyGained: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
    },
  }],
  
  // Project category and type
  category: {
    type: String,
    enum: [
      'web_application',
      'mobile_app',
      'desktop_app',
      'api_service',
      'data_analysis',
      'machine_learning',
      'game_development',
      'blockchain',
      'iot',
      'automation',
      'open_source',
      'research',
      'other'
    ],
    required: true,
  },
  
  projectType: {
    type: String,
    enum: ['personal', 'professional', 'academic', 'freelance', 'open_source', 'hackathon'],
    required: true,
  },
  
  // Project status
  status: {
    type: String,
    enum: ['planning', 'in_progress', 'completed', 'on_hold', 'cancelled'],
    default: 'planning',
  },
  
  // Team and collaboration
  team: [{
    name: String,
    role: String,
    email: String,
    linkedinUrl: String,
    contribution: String,
  }],
  
  isTeamProject: {
    type: Boolean,
    default: false,
  },
  
  myRole: {
    type: String,
    maxlength: [100, 'Role cannot exceed 100 characters'],
  },
  
  // Project features and achievements
  features: [String],
  
  achievements: [String],
  
  challenges: [String],
  
  lessonsLearned: [String],
  
  // Metrics and impact
  metrics: {
    linesOfCode: Number,
    commits: Number,
    contributors: Number,
    stars: Number, // GitHub stars
    forks: Number, // GitHub forks
    downloads: Number,
    users: Number,
    performance: {
      loadTime: Number, // in milliseconds
      uptime: Number, // percentage
      responseTime: Number, // in milliseconds
    },
  },
  
  // Media and documentation
  media: {
    screenshots: [String],
    videos: [String],
    diagrams: [String],
    presentations: [String],
  },
  
  documentation: {
    readme: String,
    apiDocs: String,
    userGuide: String,
    technicalSpecs: String,
  },
  
  // AI-generated insights
  aiInsights: {
    skillsGained: [String],
    careerRelevance: String,
    improvementSuggestions: [String],
    marketValue: {
      type: String,
      enum: ['low', 'medium', 'high', 'very_high'],
    },
    lastAnalyzed: Date,
  },
  
  // Project visibility and sharing
  visibility: {
    type: String,
    enum: ['private', 'public', 'portfolio_only'],
    default: 'private',
  },
  
  isPortfolioProject: {
    type: Boolean,
    default: false,
  },
  
  portfolioOrder: {
    type: Number,
    default: 0,
  },
  
  // Tags for organization
  tags: [String],
  
  // External integrations
  integrations: {
    github: {
      repoUrl: String,
      lastSync: Date,
      stars: Number,
      forks: Number,
      issues: Number,
      pullRequests: Number,
    },
    deployment: {
      platform: String, // netlify, vercel, heroku, aws, etc.
      url: String,
      status: String,
      lastDeployed: Date,
    },
  },
  
  // Project feedback and reviews
  feedback: [{
    reviewer: String,
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    comment: String,
    date: {
      type: Date,
      default: Date.now,
    },
  }],
  
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Indexes for better query performance
projectSchema.index({ user: 1, status: 1 });
projectSchema.index({ user: 1, isPortfolioProject: 1, portfolioOrder: 1 });
projectSchema.index({ category: 1, projectType: 1 });
projectSchema.index({ technologies: 1 });
projectSchema.index({ tags: 1 });
projectSchema.index({ visibility: 1 });
projectSchema.index({ 'timeline.startDate': -1 });

// Text search index
projectSchema.index({
  title: 'text',
  description: 'text',
  technologies: 'text',
  tags: 'text',
});

// Virtual for project duration
projectSchema.virtual('duration').get(function() {
  if (!this.timeline.startDate) return null;
  
  const start = new Date(this.timeline.startDate);
  const end = this.timeline.endDate ? new Date(this.timeline.endDate) : new Date();
  
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 30) {
    return `${diffDays} days`;
  } else if (diffDays < 365) {
    const months = Math.round(diffDays / 30);
    return `${months} month${months > 1 ? 's' : ''}`;
  } else {
    const years = Math.round(diffDays / 365);
    return `${years} year${years > 1 ? 's' : ''}`;
  }
});

// Virtual for completion percentage
projectSchema.virtual('completionPercentage').get(function() {
  if (this.status === 'completed') return 100;
  if (this.status === 'cancelled') return 0;
  
  // Calculate based on features completed vs planned
  if (this.features && this.features.length > 0) {
    // This is a simplified calculation - in a real app, you'd track feature completion
    const statusMap = {
      'planning': 10,
      'in_progress': 50,
      'on_hold': 30,
    };
    return statusMap[this.status] || 0;
  }
  
  return 0;
});

// Method to update GitHub integration data
projectSchema.methods.syncGitHubData = async function() {
  if (!this.urls.github) return this;
  
  try {
    // Extract repo info from GitHub URL
    const repoMatch = this.urls.github.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!repoMatch) return this;
    
    const [, owner, repo] = repoMatch;
    
    // In a real implementation, you'd call GitHub API here
    // For now, we'll just update the integration object
    this.integrations.github = {
      repoUrl: this.urls.github,
      lastSync: new Date(),
      // These would come from GitHub API
      stars: this.metrics.stars || 0,
      forks: this.metrics.forks || 0,
      issues: 0,
      pullRequests: 0,
    };
    
    return this.save();
  } catch (error) {
    console.error('Error syncing GitHub data:', error);
    return this;
  }
};

// Method to calculate project score for portfolio
projectSchema.methods.calculatePortfolioScore = function() {
  let score = 0;
  
  // Base score for completion
  if (this.status === 'completed') score += 30;
  else if (this.status === 'in_progress') score += 15;
  
  // Technology diversity
  if (this.technologies) {
    score += Math.min(20, this.technologies.length * 2);
  }
  
  // Features and achievements
  if (this.features) score += Math.min(15, this.features.length * 1.5);
  if (this.achievements) score += Math.min(10, this.achievements.length * 2);
  
  // External validation
  if (this.urls.live) score += 10;
  if (this.urls.github) score += 5;
  if (this.metrics.stars > 0) score += Math.min(10, this.metrics.stars);
  
  // Documentation quality
  if (this.documentation.readme) score += 5;
  if (this.media.screenshots && this.media.screenshots.length > 0) score += 5;
  
  return Math.min(100, score);
};

// Method to add feedback
projectSchema.methods.addFeedback = function(reviewer, rating, comment) {
  this.feedback.push({
    reviewer,
    rating,
    comment,
    date: new Date(),
  });
  
  return this.save();
};

// Static method to get user's portfolio projects
projectSchema.statics.getPortfolioProjects = function(userId, limit = 10) {
  return this.find({
    user: userId,
    isPortfolioProject: true,
    visibility: { $in: ['public', 'portfolio_only'] },
  })
  .sort({ portfolioOrder: 1, updatedAt: -1 })
  .limit(limit)
  .populate('user', 'firstName lastName avatar');
};

// Static method to get projects by technology
projectSchema.statics.getProjectsByTechnology = function(technology, limit = 20) {
  return this.find({
    'technologies.name': { $regex: technology, $options: 'i' },
    visibility: 'public',
  })
  .sort({ updatedAt: -1 })
  .limit(limit)
  .populate('user', 'firstName lastName avatar');
};

// Pre-save middleware
projectSchema.pre('save', function(next) {
  // Generate short description if not provided
  if (!this.shortDescription && this.description) {
    this.shortDescription = this.description.substring(0, 150) + 
      (this.description.length > 150 ? '...' : '');
  }
  
  // Update team project flag
  this.isTeamProject = this.team && this.team.length > 0;
  
  // Set end date if status changed to completed
  if (this.isModified('status') && this.status === 'completed' && !this.timeline.endDate) {
    this.timeline.endDate = new Date();
    this.timeline.isOngoing = false;
  }
  
  next();
});

module.exports = mongoose.model('Project', projectSchema);
