const cron = require('node-cron');
const mongoose = require('mongoose');
const TechUpdate = require('../models/TechUpdate');
require('dotenv').config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    const mongoURI = process.env.NODE_ENV === 'production' 
      ? process.env.MONGO_URI_PROD 
      : process.env.MONGO_URI || 'mongodb://localhost:27017/careercompass';

    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('🍃 Worker MongoDB Connected');
  } catch (error) {
    console.error('Worker database connection failed:', error.message);
    process.exit(1);
  }
};

// Sample tech updates to add periodically
const sampleUpdates = [
  {
    title: 'JavaScript ES2024 Features Released',
    content: `JavaScript ES2024 (ES15) has been officially released with several exciting new features that will enhance developer productivity and code quality.

Key Features:
1. Array.prototype.with() - Create a new array with a single element changed
2. Array.prototype.toReversed() - Non-mutating reverse method
3. Array.prototype.toSorted() - Non-mutating sort method
4. Object.groupBy() - Group array elements by a key function
5. Promise.withResolvers() - Create promise with external resolve/reject

These features focus on immutability and functional programming patterns, making JavaScript code more predictable and easier to debug.

Example usage:
const arr = [1, 2, 3, 4, 5];
const newArr = arr.with(2, 'three'); // [1, 2, 'three', 4, 5]

The update is already supported in major browsers and Node.js 20+.`,
    summary: 'JavaScript ES2024 introduces new array methods and utility functions focusing on immutability and functional programming.',
    category: 'programming_languages',
    tags: ['JavaScript', 'ES2024', 'Frontend', 'Programming'],
    source: {
      name: 'ECMAScript Specification',
      url: 'https://tc39.es/ecma262/',
      author: 'TC39 Committee',
      publishedAt: new Date(),
    },
    relevanceScore: 90,
    metadata: {
      readingTime: 5,
      difficulty: 'intermediate',
      contentType: 'announcement',
    },
    aiInsights: {
      keyPoints: [
        'New immutable array methods reduce bugs',
        'Better functional programming support',
        'Improved developer experience'
      ],
      skillsRequired: ['JavaScript', 'Frontend Development'],
      careerImpact: 'Important for modern JavaScript developers',
      actionableItems: [
        'Update to Node.js 20+ or latest browsers',
        'Practice using new array methods',
        'Refactor existing code to use immutable patterns'
      ],
    },
    targetAudience: {
      experienceLevel: ['mid_level', 'senior_level'],
      roles: ['Frontend Developer', 'Full Stack Developer'],
      skills: ['JavaScript'],
    },
    status: 'published',
    publishedAt: new Date(),
  },
  {
    title: 'AI-Powered Code Review Tools Gaining Traction',
    content: `AI-powered code review tools are becoming increasingly popular among development teams, with adoption rates growing by 300% in the past year.

Popular Tools:
- GitHub Copilot for Pull Requests
- CodeRabbit AI Code Reviews
- Amazon CodeGuru Reviewer
- DeepCode (now part of Snyk)
- Codacy Quality

Benefits:
1. Faster review cycles (40% reduction in review time)
2. Consistent code quality standards
3. Detection of security vulnerabilities
4. Learning opportunities for junior developers
5. Reduced cognitive load on senior developers

Challenges:
- False positives requiring human oversight
- Integration complexity with existing workflows
- Cost considerations for smaller teams
- Privacy concerns with proprietary code

Best Practices:
- Use AI as a first-pass filter, not replacement for human review
- Customize rules for your team's coding standards
- Train team members on interpreting AI suggestions
- Regularly evaluate tool effectiveness

The trend shows AI tools are becoming essential for maintaining code quality at scale.`,
    summary: 'AI-powered code review tools are transforming how development teams maintain code quality and accelerate review processes.',
    category: 'tools',
    tags: ['AI', 'Code Review', 'DevOps', 'Productivity'],
    source: {
      name: 'Developer Survey 2024',
      url: 'https://survey.stackoverflow.co/2024',
      author: 'Stack Overflow',
      publishedAt: new Date(),
    },
    relevanceScore: 85,
    metadata: {
      readingTime: 7,
      difficulty: 'intermediate',
      contentType: 'article',
    },
    aiInsights: {
      keyPoints: [
        'AI tools reduce review time significantly',
        'Human oversight still essential',
        'Growing adoption across teams'
      ],
      skillsRequired: ['Code Review', 'DevOps', 'Team Leadership'],
      careerImpact: 'Important for engineering managers and senior developers',
      actionableItems: [
        'Evaluate AI code review tools for your team',
        'Establish guidelines for AI-assisted reviews',
        'Train team on best practices'
      ],
    },
    targetAudience: {
      experienceLevel: ['mid_level', 'senior_level'],
      roles: ['Engineering Manager', 'Senior Developer', 'Tech Lead'],
      skills: ['Leadership', 'Code Review'],
    },
    status: 'published',
    publishedAt: new Date(),
  }
];

// Function to add sample tech updates
const addSampleUpdates = async () => {
  try {
    console.log('🔄 Adding sample tech updates...');
    
    for (const updateData of sampleUpdates) {
      // Check if similar update already exists
      const existing = await TechUpdate.findOne({
        title: updateData.title
      });
      
      if (!existing) {
        await TechUpdate.create(updateData);
        console.log(`✅ Added: ${updateData.title}`);
      } else {
        console.log(`⏭️  Skipped: ${updateData.title} (already exists)`);
      }
    }
    
    console.log('✅ Sample tech updates processing completed');
  } catch (error) {
    console.error('❌ Error adding sample updates:', error);
  }
};

// Function to cleanup old updates
const cleanupOldUpdates = async () => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const result = await TechUpdate.deleteMany({
      status: 'published',
      publishedAt: { $lt: thirtyDaysAgo },
      metrics: { views: { $lt: 10 } } // Only delete unpopular old content
    });
    
    console.log(`🗑️  Cleaned up ${result.deletedCount} old tech updates`);
  } catch (error) {
    console.error('❌ Error cleaning up old updates:', error);
  }
};

// Function to update trending scores
const updateTrendingScores = async () => {
  try {
    console.log('📊 Updating trending scores...');
    
    const updates = await TechUpdate.find({
      status: 'published',
      publishedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Last 7 days
    });
    
    for (const update of updates) {
      // Simple trending score calculation
      const ageInDays = (Date.now() - update.publishedAt.getTime()) / (1000 * 60 * 60 * 24);
      const ageFactor = Math.max(0, 1 - (ageInDays / 7)); // Decay over 7 days
      
      const engagementScore = (
        (update.metrics.views || 0) * 1 +
        (update.metrics.likes || 0) * 3 +
        (update.metrics.shares || 0) * 5 +
        (update.metrics.comments || 0) * 4 +
        (update.metrics.bookmarks || 0) * 2
      );
      
      const trendingScore = engagementScore * ageFactor;
      
      // Update the relevance score based on trending
      await TechUpdate.findByIdAndUpdate(update._id, {
        relevanceScore: Math.min(100, Math.max(50, update.relevanceScore + (trendingScore / 10)))
      });
    }
    
    console.log(`📈 Updated trending scores for ${updates.length} updates`);
  } catch (error) {
    console.error('❌ Error updating trending scores:', error);
  }
};

// Main worker function
const runWorker = async () => {
  console.log('🚀 Tech Update Worker started');
  
  await connectDB();
  
  // Add initial sample data
  await addSampleUpdates();
  
  // Schedule tasks
  
  // Add new sample updates every 6 hours (for demo purposes)
  cron.schedule('0 */6 * * *', async () => {
    console.log('⏰ Running scheduled task: Add sample updates');
    await addSampleUpdates();
  });
  
  // Update trending scores every hour
  cron.schedule('0 * * * *', async () => {
    console.log('⏰ Running scheduled task: Update trending scores');
    await updateTrendingScores();
  });
  
  // Cleanup old updates daily at 2 AM
  cron.schedule('0 2 * * *', async () => {
    console.log('⏰ Running scheduled task: Cleanup old updates');
    await cleanupOldUpdates();
  });
  
  console.log('📅 Scheduled tasks configured:');
  console.log('  - Add sample updates: Every 6 hours');
  console.log('  - Update trending scores: Every hour');
  console.log('  - Cleanup old updates: Daily at 2 AM');
};

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('📴 Worker received SIGTERM, shutting down gracefully');
  mongoose.connection.close(() => {
    console.log('🔌 MongoDB connection closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('📴 Worker received SIGINT, shutting down gracefully');
  mongoose.connection.close(() => {
    console.log('🔌 MongoDB connection closed');
    process.exit(0);
  });
});

// Start the worker
runWorker().catch((error) => {
  console.error('❌ Worker failed to start:', error);
  process.exit(1);
});
