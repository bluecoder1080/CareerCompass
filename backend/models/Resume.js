const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  
  title: {
    type: String,
    required: true,
    default: 'My Resume',
    maxlength: [100, 'Resume title cannot exceed 100 characters'],
  },
  
  // Personal Information
  personalInfo: {
    firstName: String,
    lastName: String,
    email: String,
    phone: String,
    location: {
      city: String,
      state: String,
      country: String,
    },
    website: String,
    linkedin: String,
    github: String,
    portfolio: String,
  },
  
  // Professional Summary
  summary: {
    type: String,
    maxlength: [1000, 'Summary cannot exceed 1000 characters'],
  },
  
  // Work Experience
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
    order: { type: Number, default: 0 },
  }],
  
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
    honors: [String],
    relevantCoursework: [String],
    order: { type: Number, default: 0 },
  }],
  
  // Skills
  skills: [{
    category: {
      type: String,
      enum: ['technical', 'soft', 'language', 'tool', 'framework'],
      required: true,
    },
    items: [String],
    order: { type: Number, default: 0 },
  }],
  
  // Projects
  projects: [{
    name: { type: String, required: true },
    description: String,
    technologies: [String],
    startDate: Date,
    endDate: Date,
    url: String,
    githubUrl: String,
    achievements: [String],
    order: { type: Number, default: 0 },
  }],
  
  // Certifications
  certifications: [{
    name: { type: String, required: true },
    issuer: { type: String, required: true },
    issueDate: Date,
    expiryDate: Date,
    credentialId: String,
    url: String,
    order: { type: Number, default: 0 },
  }],
  
  // Awards and Achievements
  awards: [{
    title: { type: String, required: true },
    issuer: String,
    date: Date,
    description: String,
    order: { type: Number, default: 0 },
  }],
  
  // Publications
  publications: [{
    title: { type: String, required: true },
    authors: [String],
    publication: String,
    date: Date,
    url: String,
    description: String,
    order: { type: Number, default: 0 },
  }],
  
  // Volunteer Experience
  volunteer: [{
    organization: { type: String, required: true },
    role: { type: String, required: true },
    startDate: Date,
    endDate: Date,
    description: String,
    achievements: [String],
    order: { type: Number, default: 0 },
  }],
  
  // Languages
  languages: [{
    name: { type: String, required: true },
    proficiency: {
      type: String,
      enum: ['basic', 'conversational', 'fluent', 'native'],
      required: true,
    },
    order: { type: Number, default: 0 },
  }],
  
  // Resume Settings
  settings: {
    template: {
      type: String,
      enum: ['modern', 'classic', 'creative', 'minimal', 'professional'],
      default: 'modern',
    },
    colorScheme: {
      type: String,
      enum: ['blue', 'green', 'purple', 'red', 'orange', 'gray'],
      default: 'blue',
    },
    fontSize: {
      type: String,
      enum: ['small', 'medium', 'large'],
      default: 'medium',
    },
    sections: {
      summary: { type: Boolean, default: true },
      experience: { type: Boolean, default: true },
      education: { type: Boolean, default: true },
      skills: { type: Boolean, default: true },
      projects: { type: Boolean, default: true },
      certifications: { type: Boolean, default: false },
      awards: { type: Boolean, default: false },
      publications: { type: Boolean, default: false },
      volunteer: { type: Boolean, default: false },
      languages: { type: Boolean, default: false },
    },
  },
  
  // File Information
  fileInfo: {
    originalName: String,
    fileName: String,
    filePath: String,
    fileSize: Number,
    mimeType: String,
    uploadedAt: Date,
  },
  
  // Generated Files
  generatedFiles: [{
    format: {
      type: String,
      enum: ['pdf', 'docx', 'html'],
    },
    fileName: String,
    filePath: String,
    generatedAt: Date,
    fileSize: Number,
  }],
  
  // AI Analysis
  aiAnalysis: {
    atsScore: {
      type: Number,
      min: 0,
      max: 100,
    },
    suggestions: [String],
    missingKeywords: [String],
    strengthAreas: [String],
    improvementAreas: [String],
    lastAnalyzed: Date,
  },
  
  // Version Control
  version: {
    type: Number,
    default: 1,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  
  // Sharing
  isPublic: {
    type: Boolean,
    default: false,
  },
  shareableLink: String,
  
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Indexes for better query performance
resumeSchema.index({ user: 1, isActive: 1 });
resumeSchema.index({ user: 1, createdAt: -1 });
resumeSchema.index({ shareableLink: 1 });

// Virtual for full name
resumeSchema.virtual('fullName').get(function() {
  if (!this.personalInfo) return '';
  return `${this.personalInfo.firstName || ''} ${this.personalInfo.lastName || ''}`.trim();
});

// Virtual for total experience years
resumeSchema.virtual('totalExperience').get(function() {
  if (!this.experience || this.experience.length === 0) return 0;
  
  const totalMonths = this.experience.reduce((total, exp) => {
    const start = new Date(exp.startDate);
    const end = exp.endDate ? new Date(exp.endDate) : new Date();
    const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    return total + Math.max(0, months);
  }, 0);
  
  return Math.round(totalMonths / 12 * 10) / 10;
});

// Method to populate from user profile
resumeSchema.methods.populateFromProfile = async function(profile) {
  if (!profile) return this;
  
  // Populate personal info from user and profile
  if (profile.user) {
    this.personalInfo.firstName = profile.user.firstName;
    this.personalInfo.lastName = profile.user.lastName;
    this.personalInfo.email = profile.user.email;
  }
  
  if (profile.phone) this.personalInfo.phone = profile.phone;
  if (profile.location) this.personalInfo.location = profile.location;
  
  // Populate experience
  if (profile.experience && profile.experience.length > 0) {
    this.experience = profile.experience.map((exp, index) => ({
      ...exp.toObject(),
      order: index,
    }));
  }
  
  // Populate education
  if (profile.education && profile.education.length > 0) {
    this.education = profile.education.map((edu, index) => ({
      ...edu.toObject(),
      order: index,
    }));
  }
  
  // Populate skills
  if (profile.skills && profile.skills.length > 0) {
    const skillsByCategory = profile.skills.reduce((acc, skill) => {
      if (!acc[skill.category]) {
        acc[skill.category] = [];
      }
      acc[skill.category].push(skill.name);
      return acc;
    }, {});
    
    this.skills = Object.entries(skillsByCategory).map(([category, items], index) => ({
      category,
      items,
      order: index,
    }));
  }
  
  return this;
};

// Method to generate shareable link
resumeSchema.methods.generateShareableLink = function() {
  const crypto = require('crypto');
  const shareId = crypto.randomBytes(16).toString('hex');
  this.shareableLink = shareId;
  this.isPublic = true;
  return this.save();
};

// Method to calculate ATS score
resumeSchema.methods.calculateATSScore = function() {
  let score = 0;
  const maxScore = 100;
  
  // Basic information (20 points)
  if (this.personalInfo.firstName && this.personalInfo.lastName) score += 5;
  if (this.personalInfo.email) score += 5;
  if (this.personalInfo.phone) score += 5;
  if (this.personalInfo.location && this.personalInfo.location.city) score += 5;
  
  // Professional summary (15 points)
  if (this.summary && this.summary.length > 50) score += 15;
  
  // Experience (25 points)
  if (this.experience && this.experience.length > 0) {
    score += Math.min(25, this.experience.length * 8);
  }
  
  // Education (15 points)
  if (this.education && this.education.length > 0) score += 15;
  
  // Skills (15 points)
  if (this.skills && this.skills.length > 0) {
    const totalSkills = this.skills.reduce((sum, category) => sum + category.items.length, 0);
    score += Math.min(15, totalSkills * 2);
  }
  
  // Additional sections (10 points)
  let additionalScore = 0;
  if (this.projects && this.projects.length > 0) additionalScore += 3;
  if (this.certifications && this.certifications.length > 0) additionalScore += 3;
  if (this.awards && this.awards.length > 0) additionalScore += 2;
  if (this.volunteer && this.volunteer.length > 0) additionalScore += 2;
  
  score += Math.min(10, additionalScore);
  
  this.aiAnalysis.atsScore = Math.min(maxScore, score);
  return this.aiAnalysis.atsScore;
};

// Static method to get user's active resumes
resumeSchema.statics.getUserResumes = function(userId) {
  return this.find({
    user: userId,
    isActive: true,
  }).sort({ updatedAt: -1 });
};

// Pre-save middleware
resumeSchema.pre('save', function(next) {
  // Calculate ATS score if not set
  if (!this.aiAnalysis.atsScore) {
    this.calculateATSScore();
  }
  
  // Update version if content changed
  if (this.isModified() && !this.isNew) {
    this.version += 1;
  }
  
  next();
});

module.exports = mongoose.model('Resume', resumeSchema);
