const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  questionId: {
    type: Number,
    required: true,
    min: 1,
    max: 10,
  },
  question: {
    type: String,
    required: true,
  },
  selectedOption: {
    type: String,
    required: true,
    enum: ['A', 'B', 'C', 'D'],
  },
  optionText: {
    type: String,
    required: true,
  },
  score: {
    type: Number,
    required: true,
    min: 1,
    max: 4,
  },
  category: {
    type: String,
    required: true,
    enum: ['analytical', 'creative', 'social', 'practical', 'leadership'],
  },
});

const personalityScoreSchema = new mongoose.Schema({
  analytical: {
    type: Number,
    required: true,
    min: 0,
    max: 40,
  },
  creative: {
    type: Number,
    required: true,
    min: 0,
    max: 40,
  },
  social: {
    type: Number,
    required: true,
    min: 0,
    max: 40,
  },
  practical: {
    type: Number,
    required: true,
    min: 0,
    max: 40,
  },
  leadership: {
    type: Number,
    required: true,
    min: 0,
    max: 40,
  },
});

const careerRecommendationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  matchPercentage: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  requiredSkills: [String],
  averageSalary: {
    min: Number,
    max: Number,
    currency: {
      type: String,
      default: 'USD',
    },
  },
  growthOutlook: {
    type: String,
    enum: ['declining', 'stable', 'growing', 'rapidly_growing'],
    required: true,
  },
  workEnvironment: {
    type: String,
    enum: ['office', 'remote', 'hybrid', 'field', 'laboratory', 'creative_space'],
  },
  educationLevel: {
    type: String,
    enum: ['high_school', 'associate', 'bachelor', 'master', 'doctorate', 'certification'],
  },
});

const skillGapSchema = new mongoose.Schema({
  skill: {
    type: String,
    required: true,
  },
  currentLevel: {
    type: String,
    enum: ['none', 'beginner', 'intermediate', 'advanced'],
    required: true,
  },
  targetLevel: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced', 'expert'],
    required: true,
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    required: true,
  },
  estimatedTimeToAcquire: {
    value: Number,
    unit: {
      type: String,
      enum: ['weeks', 'months', 'years'],
    },
  },
  recommendedResources: [{
    type: {
      type: String,
      enum: ['course', 'book', 'certification', 'project', 'mentorship'],
    },
    title: String,
    url: String,
    provider: String,
    cost: {
      amount: Number,
      currency: String,
    },
  }],
});

const roadmapMilestoneSchema = new mongoose.Schema({
  month: {
    type: Number,
    required: true,
    min: 1,
    max: 6,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  goals: [String],
  skills: [String],
  resources: [String],
  estimatedHours: {
    type: Number,
    min: 0,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  completedAt: Date,
});

const psychotestResultSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  
  // Test metadata
  testVersion: {
    type: String,
    default: '1.0',
  },
  completedAt: {
    type: Date,
    default: Date.now,
  },
  timeSpent: {
    type: Number, // in seconds
    min: 0,
  },
  
  // User's answers
  answers: [answerSchema],
  
  // Calculated scores
  personalityScores: personalityScoreSchema,
  
  // Dominant personality traits (top 2)
  dominantTraits: [{
    trait: {
      type: String,
      enum: ['analytical', 'creative', 'social', 'practical', 'leadership'],
    },
    score: Number,
    percentage: Number,
  }],
  
  // AI-generated analysis
  personalityAnalysis: {
    summary: String,
    strengths: [String],
    challenges: [String],
    workStyle: String,
    communicationStyle: String,
    motivators: [String],
  },
  
  // Career recommendations
  careerRecommendations: [careerRecommendationSchema],
  
  // Skill gap analysis
  skillGaps: [skillGapSchema],
  
  // 6-month roadmap
  sixMonthRoadmap: {
    overview: String,
    totalEstimatedHours: Number,
    milestones: [roadmapMilestoneSchema],
    keySkillsToAcquire: [String],
    recommendedCertifications: [String],
  },
  
  // AI processing metadata
  aiAnalysis: {
    model: String,
    processingTime: Number, // in milliseconds
    confidence: Number, // 0-1
    prompt: String,
    rawResponse: String,
  },
  
  // Sharing and privacy
  isShared: {
    type: Boolean,
    default: false,
  },
  shareableLink: String,
  
  // Follow-up tracking
  followUpScheduled: Date,
  retakeRecommendedAt: Date,
  
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Indexes for better query performance
psychotestResultSchema.index({ user: 1, createdAt: -1 });
psychotestResultSchema.index({ completedAt: -1 });
psychotestResultSchema.index({ 'dominantTraits.trait': 1 });

// Virtual for overall personality type
psychotestResultSchema.virtual('personalityType').get(function() {
  if (!this.dominantTraits || this.dominantTraits.length === 0) return 'Unknown';
  
  const primary = this.dominantTraits[0].trait;
  const secondary = this.dominantTraits.length > 1 ? this.dominantTraits[1].trait : null;
  
  // Create personality type combinations
  const typeMap = {
    'analytical-creative': 'Innovative Analyst',
    'analytical-practical': 'Strategic Implementer',
    'analytical-leadership': 'Visionary Leader',
    'analytical-social': 'Collaborative Problem Solver',
    'creative-social': 'Inspiring Communicator',
    'creative-practical': 'Creative Implementer',
    'creative-leadership': 'Innovative Leader',
    'social-leadership': 'People Leader',
    'social-practical': 'Team Builder',
    'practical-leadership': 'Operational Leader',
  };
  
  const key = secondary ? `${primary}-${secondary}` : primary;
  return typeMap[key] || `${primary.charAt(0).toUpperCase() + primary.slice(1)} Type`;
});

// Method to calculate personality scores
psychotestResultSchema.methods.calculateScores = function() {
  const scores = {
    analytical: 0,
    creative: 0,
    social: 0,
    practical: 0,
    leadership: 0,
  };
  
  // Sum up scores by category
  this.answers.forEach(answer => {
    scores[answer.category] += answer.score;
  });
  
  this.personalityScores = scores;
  
  // Calculate dominant traits
  const sortedTraits = Object.entries(scores)
    .map(([trait, score]) => ({
      trait,
      score,
      percentage: Math.round((score / 40) * 100), // Max score per category is 40
    }))
    .sort((a, b) => b.score - a.score);
  
  this.dominantTraits = sortedTraits.slice(0, 2);
  
  return scores;
};

// Method to generate shareable link
psychotestResultSchema.methods.generateShareableLink = function() {
  const crypto = require('crypto');
  const shareId = crypto.randomBytes(16).toString('hex');
  this.shareableLink = shareId;
  this.isShared = true;
  return this.save();
};

// Static method to get user's latest result
psychotestResultSchema.statics.getLatestResult = function(userId) {
  return this.findOne({ user: userId })
    .sort({ completedAt: -1 })
    .populate('user', 'firstName lastName email');
};

// Static method to get personality distribution stats
psychotestResultSchema.statics.getPersonalityStats = function() {
  return this.aggregate([
    {
      $group: {
        _id: '$dominantTraits.0.trait',
        count: { $sum: 1 },
        avgScore: { $avg: '$dominantTraits.0.score' },
      },
    },
    { $sort: { count: -1 } },
  ]);
};

// Method to check if retake is recommended
psychotestResultSchema.methods.shouldRetake = function() {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  return this.completedAt < sixMonthsAgo;
};

module.exports = mongoose.model('PsychotestResult', psychotestResultSchema);
