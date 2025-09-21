const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  
  // Personal Information
  dateOfBirth: {
    type: Date,
    validate: {
      validator: function(v) {
        return v < new Date();
      },
      message: 'Date of birth must be in the past',
    },
  },
  phone: {
    type: String,
    match: [/^\+?[\d\s\-\(\)]+$/, 'Please enter a valid phone number'],
  },
  location: {
    city: String,
    state: String,
    country: String,
    timezone: String,
  },
  
  // Professional Information
  currentRole: {
    title: String,
    company: String,
    startDate: Date,
    isCurrentRole: { type: Boolean, default: true },
  },
  
  // Education
  education: [{
    institution: { type: String, required: true },
    degree: { type: String, required: true },
    field: { type: String, required: true },
    startDate: Date,
    endDate: Date,
    gpa: {
      type: Number,
      min: 0,
      max: 4.0,
    },
    isCurrentlyEnrolled: { type: Boolean, default: false },
  }],
  
  // Skills and Interests
  skills: [{
    name: { type: String, required: true },
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'expert'],
      required: true,
    },
    category: {
      type: String,
      enum: ['technical', 'soft', 'language', 'tool', 'framework'],
      required: true,
    },
    yearsOfExperience: {
      type: Number,
      min: 0,
      max: 50,
    },
  }],
  
  interests: [{
    name: { type: String, required: true },
    category: {
      type: String,
      enum: ['technology', 'industry', 'role', 'hobby'],
      required: true,
    },
    level: {
      type: String,
      enum: ['curious', 'interested', 'passionate'],
      default: 'interested',
    },
  }],
  
  // Career Goals
  careerGoals: {
    shortTerm: [String], // 6 months to 1 year
    mediumTerm: [String], // 1-3 years
    longTerm: [String], // 3+ years
    preferredIndustries: [String],
    preferredRoles: [String],
    workPreferences: {
      remote: { type: Boolean, default: false },
      hybrid: { type: Boolean, default: false },
      onsite: { type: Boolean, default: false },
      freelance: { type: Boolean, default: false },
      fullTime: { type: Boolean, default: true },
      partTime: { type: Boolean, default: false },
    },
  },
  
  // Experience
  experience: [{
    title: { type: String, required: true },
    company: { type: String, required: true },
    location: String,
    startDate: { type: Date, required: true },
    endDate: Date,
    isCurrentRole: { type: Boolean, default: false },
    description: String,
    achievements: [String],
    technologies: [String],
  }],
  
  // Resume Information
  resumeUrl: String,
  resumeText: String, // Extracted text from uploaded resume
  resumeLastUpdated: Date,
  
  // AI-Generated Insights
  aiInsights: {
    careerPath: String,
    strengthsAnalysis: String,
    skillGaps: [String],
    recommendations: [String],
    lastAnalyzed: Date,
  },
  
  // Profile Completion
  completionScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0,
  },
  
  // Privacy Settings
  isPublic: {
    type: Boolean,
    default: false,
  },
  
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Indexes for better query performance (user index is created automatically by unique: true)
profileSchema.index({ 'skills.name': 1 });
profileSchema.index({ 'interests.name': 1 });
profileSchema.index({ completionScore: -1 });

// Virtual for years of experience
profileSchema.virtual('totalExperience').get(function() {
  if (!this.experience || this.experience.length === 0) return 0;
  
  const totalMonths = this.experience.reduce((total, exp) => {
    const start = new Date(exp.startDate);
    const end = exp.endDate ? new Date(exp.endDate) : new Date();
    const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    return total + Math.max(0, months);
  }, 0);
  
  return Math.round(totalMonths / 12 * 10) / 10; // Round to 1 decimal place
});

// Method to calculate profile completion score
profileSchema.methods.calculateCompletionScore = function() {
  let score = 0;
  const weights = {
    basicInfo: 20, // firstName, lastName, email (from User model)
    contact: 10, // phone, location
    education: 15,
    skills: 20,
    experience: 20,
    careerGoals: 10,
    resume: 5,
  };
  
  // Basic info is always complete (required in User model)
  score += weights.basicInfo;
  
  // Contact information
  if (this.phone && this.location && this.location.city) {
    score += weights.contact;
  }
  
  // Education
  if (this.education && this.education.length > 0) {
    score += weights.education;
  }
  
  // Skills
  if (this.skills && this.skills.length >= 3) {
    score += weights.skills;
  }
  
  // Experience
  if (this.experience && this.experience.length > 0) {
    score += weights.experience;
  }
  
  // Career goals
  if (this.careerGoals && (
    this.careerGoals.shortTerm?.length > 0 ||
    this.careerGoals.preferredRoles?.length > 0
  )) {
    score += weights.careerGoals;
  }
  
  // Resume
  if (this.resumeUrl || this.resumeText) {
    score += weights.resume;
  }
  
  this.completionScore = score;
  return score;
};

// Pre-save middleware to calculate completion score
profileSchema.pre('save', function(next) {
  this.calculateCompletionScore();
  next();
});

module.exports = mongoose.model('Profile', profileSchema);
