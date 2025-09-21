const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'assistant', 'system'],
    required: true,
  },
  content: {
    type: String,
    required: true,
    maxlength: [10000, 'Message content cannot exceed 10000 characters'],
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  metadata: {
    model: String, // Which AI model was used
    tokens: Number, // Token count for the response
    processingTime: Number, // Time taken to generate response (ms)
    confidence: Number, // Confidence score if available
  },
});

const chatSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  
  title: {
    type: String,
    default: 'New Chat',
    maxlength: [100, 'Chat title cannot exceed 100 characters'],
  },
  
  messages: [messageSchema],
  
  // Chat categorization
  category: {
    type: String,
    enum: ['career_guidance', 'skill_development', 'job_search', 'interview_prep', 'general'],
    default: 'general',
  },
  
  // Chat status
  status: {
    type: String,
    enum: ['active', 'archived', 'deleted'],
    default: 'active',
  },
  
  // AI Context and Settings
  context: {
    userProfile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Profile',
    },
    psychotestResults: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PsychotestResult',
    },
    relevantSkills: [String],
    careerStage: {
      type: String,
      enum: ['student', 'entry_level', 'mid_level', 'senior_level', 'executive', 'career_change'],
    },
  },
  
  // Chat settings
  settings: {
    model: {
      type: String,
      default: 'gemma-2b',
    },
    temperature: {
      type: Number,
      min: 0,
      max: 2,
      default: 0.7,
    },
    maxTokens: {
      type: Number,
      min: 1,
      max: 4000,
      default: 1000,
    },
  },
  
  // Analytics
  analytics: {
    messageCount: {
      type: Number,
      default: 0,
    },
    totalTokens: {
      type: Number,
      default: 0,
    },
    averageResponseTime: {
      type: Number,
      default: 0,
    },
    lastActivity: {
      type: Date,
      default: Date.now,
    },
  },
  
  // Tags for organization
  tags: [String],
  
  // Sharing and collaboration
  isShared: {
    type: Boolean,
    default: false,
  },
  sharedWith: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    permission: {
      type: String,
      enum: ['read', 'comment'],
      default: 'read',
    },
    sharedAt: {
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
chatSchema.index({ user: 1, createdAt: -1 });
chatSchema.index({ user: 1, status: 1 });
chatSchema.index({ category: 1 });
chatSchema.index({ 'analytics.lastActivity': -1 });
chatSchema.index({ tags: 1 });

// Virtual for message count
chatSchema.virtual('messageCount').get(function() {
  return this.messages ? this.messages.length : 0;
});

// Virtual for last message
chatSchema.virtual('lastMessage').get(function() {
  if (!this.messages || this.messages.length === 0) return null;
  return this.messages[this.messages.length - 1];
});

// Virtual for chat duration
chatSchema.virtual('duration').get(function() {
  if (!this.messages || this.messages.length < 2) return 0;
  const firstMessage = this.messages[0];
  const lastMessage = this.messages[this.messages.length - 1];
  return lastMessage.timestamp - firstMessage.timestamp;
});

// Method to add a message
chatSchema.methods.addMessage = function(role, content, metadata = {}) {
  const message = {
    role,
    content,
    timestamp: new Date(),
    metadata,
  };
  
  this.messages.push(message);
  this.analytics.messageCount = this.messages.length;
  this.analytics.lastActivity = new Date();
  
  // Update total tokens if provided
  if (metadata.tokens) {
    this.analytics.totalTokens += metadata.tokens;
  }
  
  // Update average response time for assistant messages
  if (role === 'assistant' && metadata.processingTime) {
    const assistantMessages = this.messages.filter(m => m.role === 'assistant');
    const totalResponseTime = assistantMessages.reduce((sum, m) => {
      return sum + (m.metadata.processingTime || 0);
    }, 0);
    this.analytics.averageResponseTime = totalResponseTime / assistantMessages.length;
  }
  
  // Auto-generate title from first user message if still default
  if (this.title === 'New Chat' && role === 'user' && this.messages.length <= 2) {
    this.title = content.substring(0, 50) + (content.length > 50 ? '...' : '');
  }
  
  return this.save();
};

// Method to get conversation history for AI context
chatSchema.methods.getConversationHistory = function(limit = 10) {
  const recentMessages = this.messages
    .slice(-limit)
    .map(msg => ({
      role: msg.role,
      content: msg.content,
    }));
  
  return recentMessages;
};

// Method to archive chat
chatSchema.methods.archive = function() {
  this.status = 'archived';
  return this.save();
};

// Method to delete chat (soft delete)
chatSchema.methods.softDelete = function() {
  this.status = 'deleted';
  return this.save();
};

// Static method to get user's active chats
chatSchema.statics.getActiveChats = function(userId, limit = 20) {
  return this.find({
    user: userId,
    status: 'active',
  })
  .sort({ 'analytics.lastActivity': -1 })
  .limit(limit)
  .populate('user', 'firstName lastName avatar');
};

// Static method to get chat statistics for user
chatSchema.statics.getUserChatStats = function(userId) {
  return this.aggregate([
    { $match: { user: mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        totalMessages: { $sum: '$analytics.messageCount' },
        totalTokens: { $sum: '$analytics.totalTokens' },
        avgResponseTime: { $avg: '$analytics.averageResponseTime' },
      },
    },
  ]);
};

module.exports = mongoose.model('Chat', chatSchema);
