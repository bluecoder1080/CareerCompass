const mongoose = require('mongoose');

const techUpdateSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    maxlength: [200, 'Title cannot exceed 200 characters'],
  },
  
  content: {
    type: String,
    required: true,
    maxlength: [5000, 'Content cannot exceed 5000 characters'],
  },
  
  summary: {
    type: String,
    maxlength: [500, 'Summary cannot exceed 500 characters'],
  },
  
  category: {
    type: String,
    enum: [
      'artificial_intelligence',
      'web_development',
      'mobile_development',
      'cloud_computing',
      'cybersecurity',
      'data_science',
      'blockchain',
      'devops',
      'programming_languages',
      'frameworks',
      'tools',
      'industry_news',
      'career_advice',
      'emerging_tech'
    ],
    required: true,
  },
  
  tags: [String],
  
  // Source information
  source: {
    name: String,
    url: String,
    author: String,
    publishedAt: Date,
  },
  
  // Relevance scoring
  relevanceScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 50,
  },
  
  // Engagement metrics
  metrics: {
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },
    comments: { type: Number, default: 0 },
    bookmarks: { type: Number, default: 0 },
  },
  
  // Content metadata
  metadata: {
    readingTime: Number, // in minutes
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'expert'],
      default: 'intermediate',
    },
    contentType: {
      type: String,
      enum: ['article', 'tutorial', 'news', 'announcement', 'guide', 'review'],
      default: 'article',
    },
    language: {
      type: String,
      default: 'en',
    },
  },
  
  // AI-generated insights
  aiInsights: {
    keyPoints: [String],
    skillsRequired: [String],
    careerImpact: String,
    actionableItems: [String],
    relatedTopics: [String],
  },
  
  // User interactions
  userInteractions: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    action: {
      type: String,
      enum: ['view', 'like', 'share', 'bookmark', 'comment'],
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    metadata: mongoose.Schema.Types.Mixed,
  }],
  
  // Personalization
  targetAudience: {
    experienceLevel: [{
      type: String,
      enum: ['student', 'entry_level', 'mid_level', 'senior_level', 'executive'],
    }],
    roles: [String],
    skills: [String],
    industries: [String],
  },
  
  // Content status
  status: {
    type: String,
    enum: ['draft', 'published', 'archived', 'featured'],
    default: 'published',
  },
  
  // Scheduling
  publishedAt: {
    type: Date,
    default: Date.now,
  },
  
  scheduledFor: Date,
  
  expiresAt: Date,
  
  // Featured content
  isFeatured: {
    type: Boolean,
    default: false,
  },
  
  featuredUntil: Date,
  
  // Content relationships
  relatedUpdates: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TechUpdate',
  }],
  
  // External links and resources
  resources: [{
    title: String,
    url: String,
    type: {
      type: String,
      enum: ['documentation', 'tutorial', 'course', 'tool', 'library', 'framework'],
    },
  }],
  
  // SEO and searchability
  seo: {
    metaDescription: String,
    keywords: [String],
    slug: String,
  },
  
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Indexes for better query performance
techUpdateSchema.index({ category: 1, publishedAt: -1 });
techUpdateSchema.index({ tags: 1 });
techUpdateSchema.index({ status: 1, publishedAt: -1 });
techUpdateSchema.index({ relevanceScore: -1 });
techUpdateSchema.index({ isFeatured: 1, featuredUntil: 1 });
techUpdateSchema.index({ 'targetAudience.experienceLevel': 1 });
techUpdateSchema.index({ 'targetAudience.skills': 1 });
techUpdateSchema.index({ 'seo.keywords': 1 });

// Text search index
techUpdateSchema.index({
  title: 'text',
  content: 'text',
  summary: 'text',
  tags: 'text',
});

// Virtual for engagement rate
techUpdateSchema.virtual('engagementRate').get(function() {
  if (this.metrics.views === 0) return 0;
  const totalEngagements = this.metrics.likes + this.metrics.shares + this.metrics.comments + this.metrics.bookmarks;
  return Math.round((totalEngagements / this.metrics.views) * 100 * 100) / 100; // Round to 2 decimal places
});

// Virtual for reading time calculation
techUpdateSchema.virtual('estimatedReadingTime').get(function() {
  if (this.metadata.readingTime) return this.metadata.readingTime;
  
  // Estimate reading time based on content length (average 200 words per minute)
  const wordCount = this.content.split(/\s+/).length;
  return Math.ceil(wordCount / 200);
});

// Method to increment view count
techUpdateSchema.methods.incrementViews = function(userId = null) {
  this.metrics.views += 1;
  
  if (userId) {
    this.userInteractions.push({
      user: userId,
      action: 'view',
      timestamp: new Date(),
    });
  }
  
  return this.save();
};

// Method to add user interaction
techUpdateSchema.methods.addInteraction = function(userId, action, metadata = {}) {
  // Remove existing interaction of same type from same user
  this.userInteractions = this.userInteractions.filter(
    interaction => !(interaction.user.toString() === userId.toString() && interaction.action === action)
  );
  
  // Add new interaction
  this.userInteractions.push({
    user: userId,
    action,
    timestamp: new Date(),
    metadata,
  });
  
  // Update metrics
  if (this.metrics[action] !== undefined) {
    // Recalculate metric based on unique users
    const uniqueUsers = new Set(
      this.userInteractions
        .filter(i => i.action === action)
        .map(i => i.user.toString())
    );
    this.metrics[action] = uniqueUsers.size;
  }
  
  return this.save();
};

// Method to calculate relevance score for a user
techUpdateSchema.methods.calculateRelevanceForUser = function(userProfile) {
  let score = this.relevanceScore || 50;
  
  if (!userProfile) return score;
  
  // Boost score based on user's skills
  if (userProfile.skills && this.aiInsights.skillsRequired) {
    const userSkills = userProfile.skills.map(s => s.name.toLowerCase());
    const requiredSkills = this.aiInsights.skillsRequired.map(s => s.toLowerCase());
    const matchingSkills = userSkills.filter(skill => 
      requiredSkills.some(required => required.includes(skill) || skill.includes(required))
    );
    score += matchingSkills.length * 5;
  }
  
  // Boost score based on user's interests
  if (userProfile.interests && this.tags) {
    const userInterests = userProfile.interests.map(i => i.name.toLowerCase());
    const contentTags = this.tags.map(t => t.toLowerCase());
    const matchingInterests = userInterests.filter(interest =>
      contentTags.some(tag => tag.includes(interest) || interest.includes(tag))
    );
    score += matchingInterests.length * 3;
  }
  
  // Adjust based on experience level
  if (userProfile.totalExperience !== undefined && this.targetAudience.experienceLevel) {
    const userLevel = userProfile.totalExperience < 1 ? 'entry_level' :
                     userProfile.totalExperience < 3 ? 'mid_level' : 'senior_level';
    
    if (this.targetAudience.experienceLevel.includes(userLevel)) {
      score += 10;
    }
  }
  
  return Math.min(100, Math.max(0, score));
};

// Static method to get personalized feed
techUpdateSchema.statics.getPersonalizedFeed = function(userProfile, options = {}) {
  const {
    limit = 20,
    skip = 0,
    category = null,
    minRelevanceScore = 30,
  } = options;
  
  const query = {
    status: 'published',
    publishedAt: { $lte: new Date() },
    $or: [
      { expiresAt: { $exists: false } },
      { expiresAt: { $gte: new Date() } },
    ],
  };
  
  if (category) {
    query.category = category;
  }
  
  return this.find(query)
    .sort({ isFeatured: -1, publishedAt: -1 })
    .limit(limit + skip) // Get more to filter by relevance
    .skip(skip)
    .populate('relatedUpdates', 'title category publishedAt')
    .then(updates => {
      // Calculate relevance scores and filter
      const relevantUpdates = updates
        .map(update => ({
          ...update.toObject(),
          personalizedRelevanceScore: update.calculateRelevanceForUser(userProfile),
        }))
        .filter(update => update.personalizedRelevanceScore >= minRelevanceScore)
        .sort((a, b) => b.personalizedRelevanceScore - a.personalizedRelevanceScore)
        .slice(0, limit);
      
      return relevantUpdates;
    });
};

// Static method to get trending updates
techUpdateSchema.statics.getTrending = function(timeframe = '7d', limit = 10) {
  const timeframeMap = {
    '1d': 1,
    '7d': 7,
    '30d': 30,
  };
  
  const days = timeframeMap[timeframe] || 7;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return this.aggregate([
    {
      $match: {
        status: 'published',
        publishedAt: { $gte: startDate },
      },
    },
    {
      $addFields: {
        trendingScore: {
          $add: [
            { $multiply: ['$metrics.views', 1] },
            { $multiply: ['$metrics.likes', 3] },
            { $multiply: ['$metrics.shares', 5] },
            { $multiply: ['$metrics.comments', 4] },
            { $multiply: ['$metrics.bookmarks', 2] },
          ],
        },
      },
    },
    { $sort: { trendingScore: -1 } },
    { $limit: limit },
  ]);
};

// Pre-save middleware
techUpdateSchema.pre('save', function(next) {
  // Generate slug from title if not provided
  if (!this.seo.slug && this.title) {
    this.seo.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 100);
  }
  
  // Calculate reading time if not provided
  if (!this.metadata.readingTime) {
    const wordCount = this.content.split(/\s+/).length;
    this.metadata.readingTime = Math.ceil(wordCount / 200);
  }
  
  // Set published date if status changed to published
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  
  next();
});

module.exports = mongoose.model('TechUpdate', techUpdateSchema);
