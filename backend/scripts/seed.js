const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('../models/User');
const Profile = require('../models/Profile');
const TechUpdate = require('../models/TechUpdate');
const PsychotestResult = require('../models/PsychotestResult');
const Project = require('../models/Project');

// Connect to MongoDB
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/careercompass';
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('🍃 MongoDB Connected for seeding');
  } catch (error) {
    console.error('Database connection failed:', error.message);
    process.exit(1);
  }
};

// Sample users data
const sampleUsers = [
  {
    firstName: 'Alex',
    lastName: 'Johnson',
    email: 'alex.johnson@example.com',
    password: 'password123',
  },
  {
    firstName: 'Sarah',
    lastName: 'Chen',
    email: 'sarah.chen@example.com',
    password: 'password123',
  },
  {
    firstName: 'Michael',
    lastName: 'Rodriguez',
    email: 'michael.rodriguez@example.com',
    password: 'password123',
  },
];

// Sample profiles data
const createSampleProfiles = (users) => [
  {
    user: users[0]._id,
    phone: '+1-555-0101',
    location: {
      city: 'San Francisco',
      state: 'California',
      country: 'United States',
      timezone: 'America/Los_Angeles',
    },
    currentRole: {
      title: 'Frontend Developer',
      company: 'TechStart Inc.',
      startDate: new Date('2022-03-01'),
      isCurrentRole: true,
    },
    education: [
      {
        institution: 'University of California, Berkeley',
        degree: 'Bachelor of Science',
        field: 'Computer Science',
        startDate: new Date('2018-09-01'),
        endDate: new Date('2022-05-15'),
        gpa: 3.7,
      },
    ],
    skills: [
      { name: 'JavaScript', level: 'advanced', category: 'technical', yearsOfExperience: 3 },
      { name: 'React', level: 'advanced', category: 'framework', yearsOfExperience: 2 },
      { name: 'Node.js', level: 'intermediate', category: 'technical', yearsOfExperience: 2 },
      { name: 'Python', level: 'intermediate', category: 'technical', yearsOfExperience: 1 },
      { name: 'Communication', level: 'advanced', category: 'soft', yearsOfExperience: 5 },
    ],
    interests: [
      { name: 'Machine Learning', category: 'technology', level: 'interested' },
      { name: 'Web Development', category: 'technology', level: 'passionate' },
      { name: 'Startup Culture', category: 'industry', level: 'interested' },
    ],
    experience: [
      {
        title: 'Frontend Developer',
        company: 'TechStart Inc.',
        location: 'San Francisco, CA',
        startDate: new Date('2022-03-01'),
        isCurrentRole: true,
        description: 'Developing responsive web applications using React and modern JavaScript.',
        achievements: [
          'Improved application performance by 40%',
          'Led frontend architecture redesign',
          'Mentored 2 junior developers',
        ],
        technologies: ['React', 'JavaScript', 'CSS', 'Node.js'],
      },
      {
        title: 'Software Engineering Intern',
        company: 'BigTech Corp',
        location: 'Mountain View, CA',
        startDate: new Date('2021-06-01'),
        endDate: new Date('2021-08-31'),
        description: 'Worked on internal tools and automation scripts.',
        achievements: [
          'Automated deployment process',
          'Reduced manual testing time by 60%',
        ],
        technologies: ['Python', 'Docker', 'AWS'],
      },
    ],
    careerGoals: {
      shortTerm: ['Become a senior frontend developer', 'Learn TypeScript'],
      mediumTerm: ['Lead a development team', 'Master full-stack development'],
      longTerm: ['Start own tech company', 'Become a technical architect'],
      preferredIndustries: ['Technology', 'Fintech', 'Healthcare'],
      preferredRoles: ['Senior Developer', 'Tech Lead', 'Engineering Manager'],
      workPreferences: {
        remote: true,
        hybrid: true,
        onsite: false,
        fullTime: true,
        partTime: false,
      },
    },
    isPublic: true,
  },
  {
    user: users[1]._id,
    phone: '+1-555-0102',
    location: {
      city: 'Seattle',
      state: 'Washington',
      country: 'United States',
      timezone: 'America/Los_Angeles',
    },
    currentRole: {
      title: 'Data Scientist',
      company: 'DataCorp Analytics',
      startDate: new Date('2021-08-15'),
      isCurrentRole: true,
    },
    education: [
      {
        institution: 'Stanford University',
        degree: 'Master of Science',
        field: 'Data Science',
        startDate: new Date('2019-09-01'),
        endDate: new Date('2021-06-15'),
        gpa: 3.9,
      },
      {
        institution: 'University of Washington',
        degree: 'Bachelor of Science',
        field: 'Mathematics',
        startDate: new Date('2015-09-01'),
        endDate: new Date('2019-06-15'),
        gpa: 3.8,
      },
    ],
    skills: [
      { name: 'Python', level: 'expert', category: 'technical', yearsOfExperience: 4 },
      { name: 'Machine Learning', level: 'advanced', category: 'technical', yearsOfExperience: 3 },
      { name: 'SQL', level: 'advanced', category: 'technical', yearsOfExperience: 4 },
      { name: 'TensorFlow', level: 'intermediate', category: 'framework', yearsOfExperience: 2 },
      { name: 'Data Visualization', level: 'advanced', category: 'technical', yearsOfExperience: 3 },
    ],
    interests: [
      { name: 'Artificial Intelligence', category: 'technology', level: 'passionate' },
      { name: 'Healthcare Technology', category: 'industry', level: 'interested' },
      { name: 'Research', category: 'role', level: 'passionate' },
    ],
    experience: [
      {
        title: 'Data Scientist',
        company: 'DataCorp Analytics',
        location: 'Seattle, WA',
        startDate: new Date('2021-08-15'),
        isCurrentRole: true,
        description: 'Building predictive models and analyzing large datasets for business insights.',
        achievements: [
          'Developed ML model with 95% accuracy',
          'Reduced data processing time by 50%',
          'Published 3 research papers',
        ],
        technologies: ['Python', 'TensorFlow', 'SQL', 'AWS', 'Docker'],
      },
    ],
    careerGoals: {
      shortTerm: ['Master deep learning', 'Get AWS certification'],
      mediumTerm: ['Lead ML engineering team', 'Publish more research'],
      longTerm: ['Become Chief Data Officer', 'Start AI research lab'],
      preferredIndustries: ['Technology', 'Healthcare', 'Finance'],
      preferredRoles: ['Senior Data Scientist', 'ML Engineer', 'Research Scientist'],
      workPreferences: {
        remote: true,
        hybrid: true,
        onsite: true,
        fullTime: true,
        partTime: false,
      },
    },
    isPublic: true,
  },
  {
    user: users[2]._id,
    phone: '+1-555-0103',
    location: {
      city: 'Austin',
      state: 'Texas',
      country: 'United States',
      timezone: 'America/Chicago',
    },
    currentRole: {
      title: 'Product Manager',
      company: 'InnovateTech Solutions',
      startDate: new Date('2020-01-15'),
      isCurrentRole: true,
    },
    education: [
      {
        institution: 'University of Texas at Austin',
        degree: 'Master of Business Administration',
        field: 'Technology Management',
        startDate: new Date('2017-09-01'),
        endDate: new Date('2019-05-15'),
        gpa: 3.6,
      },
      {
        institution: 'Texas A&M University',
        degree: 'Bachelor of Science',
        field: 'Industrial Engineering',
        startDate: new Date('2013-09-01'),
        endDate: new Date('2017-05-15'),
        gpa: 3.5,
      },
    ],
    skills: [
      { name: 'Product Management', level: 'advanced', category: 'soft', yearsOfExperience: 4 },
      { name: 'Agile Methodology', level: 'advanced', category: 'soft', yearsOfExperience: 5 },
      { name: 'Data Analysis', level: 'intermediate', category: 'technical', yearsOfExperience: 3 },
      { name: 'Leadership', level: 'advanced', category: 'soft', yearsOfExperience: 4 },
      { name: 'SQL', level: 'intermediate', category: 'technical', yearsOfExperience: 2 },
    ],
    interests: [
      { name: 'Product Strategy', category: 'role', level: 'passionate' },
      { name: 'SaaS Products', category: 'industry', level: 'interested' },
      { name: 'User Experience', category: 'technology', level: 'interested' },
    ],
    experience: [
      {
        title: 'Product Manager',
        company: 'InnovateTech Solutions',
        location: 'Austin, TX',
        startDate: new Date('2020-01-15'),
        isCurrentRole: true,
        description: 'Managing product lifecycle from conception to launch for B2B SaaS products.',
        achievements: [
          'Launched 3 successful products',
          'Increased user engagement by 60%',
          'Managed $2M product budget',
        ],
        technologies: ['Jira', 'Confluence', 'Analytics', 'SQL'],
      },
      {
        title: 'Associate Product Manager',
        company: 'StartupXYZ',
        location: 'Austin, TX',
        startDate: new Date('2019-06-01'),
        endDate: new Date('2019-12-31'),
        description: 'Assisted in product development and market research.',
        achievements: [
          'Conducted user research for 5 features',
          'Improved onboarding flow',
        ],
        technologies: ['Google Analytics', 'Figma', 'Slack'],
      },
    ],
    careerGoals: {
      shortTerm: ['Get PMP certification', 'Learn advanced analytics'],
      mediumTerm: ['Become Senior Product Manager', 'Lead product team'],
      longTerm: ['Become VP of Product', 'Join startup as CPO'],
      preferredIndustries: ['SaaS', 'Fintech', 'E-commerce'],
      preferredRoles: ['Senior Product Manager', 'Director of Product', 'VP Product'],
      workPreferences: {
        remote: false,
        hybrid: true,
        onsite: true,
        fullTime: true,
        partTime: false,
      },
    },
    isPublic: false,
  },
];

// Sample tech updates
const sampleTechUpdates = [
  {
    title: 'React 18 Features Every Developer Should Know',
    content: `React 18 introduces several groundbreaking features that will change how we build React applications. The most significant addition is Concurrent Features, which allows React to interrupt rendering work to handle high-priority updates.

Key features include:
1. Automatic Batching - React now batches all state updates by default
2. Transitions - Mark updates as non-urgent to keep the UI responsive  
3. Suspense Improvements - Better support for code splitting and data fetching
4. New Hooks - useId, useDeferredValue, useTransition, and more

These features focus on improving user experience by making applications more responsive and reducing loading states.`,
    summary: 'Explore the latest React 18 features including Concurrent Features, automatic batching, and new hooks that improve application performance.',
    category: 'web_development',
    tags: ['React', 'JavaScript', 'Frontend', 'Performance'],
    source: {
      name: 'React Blog',
      url: 'https://reactjs.org/blog',
      author: 'React Team',
      publishedAt: new Date('2024-01-15'),
    },
    relevanceScore: 85,
    metrics: {
      views: 1250,
      likes: 89,
      shares: 23,
      bookmarks: 45,
    },
    metadata: {
      readingTime: 8,
      difficulty: 'intermediate',
      contentType: 'article',
    },
    aiInsights: {
      keyPoints: [
        'Concurrent Features improve app responsiveness',
        'Automatic batching reduces unnecessary re-renders',
        'New hooks provide better state management options'
      ],
      skillsRequired: ['React', 'JavaScript', 'Frontend Development'],
      careerImpact: 'Essential knowledge for modern React developers',
      actionableItems: [
        'Upgrade existing projects to React 18',
        'Practice using new hooks in side projects',
        'Learn about Concurrent Features'
      ],
    },
    targetAudience: {
      experienceLevel: ['mid_level', 'senior_level'],
      roles: ['Frontend Developer', 'Full Stack Developer'],
      skills: ['React', 'JavaScript'],
    },
    status: 'published',
    publishedAt: new Date('2024-01-15'),
    isFeatured: true,
  },
  {
    title: 'Machine Learning Career Paths in 2024',
    content: `The machine learning field continues to evolve rapidly, creating new career opportunities and specializations. Here's a comprehensive guide to ML career paths in 2024.

Popular ML Career Paths:
1. ML Engineer - Focus on productionizing ML models
2. Data Scientist - Extract insights from data using ML
3. Research Scientist - Develop new ML algorithms and techniques
4. ML Platform Engineer - Build infrastructure for ML workflows
5. Applied ML Scientist - Apply ML to solve specific business problems

Skills in High Demand:
- Python and R programming
- Deep learning frameworks (TensorFlow, PyTorch)
- Cloud platforms (AWS, GCP, Azure)
- MLOps and model deployment
- Statistics and mathematics

The field is becoming more specialized, with companies seeking experts in specific domains like computer vision, NLP, or recommendation systems.`,
    summary: 'Comprehensive guide to machine learning career paths, required skills, and market trends for 2024.',
    category: 'career_advice',
    tags: ['Machine Learning', 'Career', 'Data Science', 'AI'],
    source: {
      name: 'ML Career Guide',
      url: 'https://mlcareer.com',
      author: 'Dr. Jane Smith',
      publishedAt: new Date('2024-01-10'),
    },
    relevanceScore: 90,
    metrics: {
      views: 2100,
      likes: 156,
      shares: 67,
      bookmarks: 89,
    },
    metadata: {
      readingTime: 12,
      difficulty: 'beginner',
      contentType: 'guide',
    },
    aiInsights: {
      keyPoints: [
        'ML field is becoming more specialized',
        'MLOps skills are increasingly important',
        'Domain expertise is valuable'
      ],
      skillsRequired: ['Python', 'Statistics', 'Machine Learning'],
      careerImpact: 'High - ML is a rapidly growing field with excellent prospects',
      actionableItems: [
        'Choose a specialization area',
        'Build a portfolio of ML projects',
        'Learn cloud ML services'
      ],
    },
    targetAudience: {
      experienceLevel: ['entry_level', 'mid_level'],
      roles: ['Data Scientist', 'ML Engineer'],
      skills: ['Python', 'Statistics'],
    },
    status: 'published',
    publishedAt: new Date('2024-01-10'),
    isFeatured: false,
  },
  {
    title: 'Cloud Computing Trends: Serverless and Edge Computing',
    content: `Cloud computing continues to evolve with serverless architectures and edge computing leading the transformation. These technologies are reshaping how we build and deploy applications.

Serverless Computing Trends:
- Function-as-a-Service (FaaS) adoption growing
- Container-based serverless solutions
- Better cold start performance
- Integration with AI/ML services

Edge Computing Growth:
- Processing data closer to users
- Reduced latency for real-time applications  
- IoT device integration
- 5G network enablement

Key Benefits:
- Cost optimization through pay-per-use models
- Automatic scaling and high availability
- Reduced operational overhead
- Improved user experience

Companies are increasingly adopting hybrid approaches, combining serverless functions with edge computing for optimal performance and cost efficiency.`,
    summary: 'Explore the latest trends in serverless computing and edge computing, and their impact on modern application development.',
    category: 'cloud_computing',
    tags: ['Cloud', 'Serverless', 'Edge Computing', 'AWS', 'Azure'],
    source: {
      name: 'Cloud Tech Today',
      url: 'https://cloudtechtoday.com',
      author: 'Mike Johnson',
      publishedAt: new Date('2024-01-08'),
    },
    relevanceScore: 75,
    metrics: {
      views: 890,
      likes: 67,
      shares: 34,
      bookmarks: 28,
    },
    metadata: {
      readingTime: 10,
      difficulty: 'intermediate',
      contentType: 'article',
    },
    aiInsights: {
      keyPoints: [
        'Serverless adoption is accelerating',
        'Edge computing reduces latency',
        'Hybrid approaches are becoming common'
      ],
      skillsRequired: ['Cloud Platforms', 'DevOps', 'System Architecture'],
      careerImpact: 'Important for cloud architects and DevOps engineers',
      actionableItems: [
        'Learn serverless frameworks',
        'Experiment with edge computing platforms',
        'Understand cost optimization strategies'
      ],
    },
    targetAudience: {
      experienceLevel: ['mid_level', 'senior_level'],
      roles: ['Cloud Architect', 'DevOps Engineer', 'Backend Developer'],
      skills: ['AWS', 'Azure', 'DevOps'],
    },
    status: 'published',
    publishedAt: new Date('2024-01-08'),
    isFeatured: false,
  },
];

// Sample projects
const createSampleProjects = (users) => [
  {
    user: users[0]._id,
    title: 'E-commerce Dashboard',
    description: 'A comprehensive admin dashboard for e-commerce businesses built with React and Node.js. Features include real-time analytics, inventory management, order processing, and customer insights.',
    shortDescription: 'React-based e-commerce admin dashboard with real-time analytics and inventory management.',
    urls: {
      live: 'https://ecommerce-dashboard-demo.netlify.app',
      github: 'https://github.com/alexjohnson/ecommerce-dashboard',
      demo: 'https://youtu.be/demo123',
    },
    timeline: {
      startDate: new Date('2023-06-01'),
      endDate: new Date('2023-09-15'),
      isOngoing: false,
    },
    technologies: [
      { name: 'React', category: 'frontend', proficiencyGained: 'advanced' },
      { name: 'Node.js', category: 'backend', proficiencyGained: 'intermediate' },
      { name: 'MongoDB', category: 'database', proficiencyGained: 'intermediate' },
      { name: 'Chart.js', category: 'frontend', proficiencyGained: 'intermediate' },
    ],
    category: 'web_application',
    projectType: 'personal',
    status: 'completed',
    features: [
      'Real-time sales analytics',
      'Inventory management system',
      'Order tracking and processing',
      'Customer management',
      'Revenue reporting',
    ],
    achievements: [
      'Implemented real-time data updates using WebSockets',
      'Optimized database queries for 50% faster load times',
      'Created responsive design supporting all device sizes',
    ],
    challenges: [
      'Handling large datasets efficiently',
      'Implementing real-time updates',
      'Creating intuitive user interface',
    ],
    lessonsLearned: [
      'Importance of database optimization',
      'WebSocket implementation best practices',
      'User experience design principles',
    ],
    metrics: {
      linesOfCode: 15000,
      commits: 127,
      stars: 23,
      forks: 8,
    },
    visibility: 'public',
    isPortfolioProject: true,
    portfolioOrder: 1,
    tags: ['React', 'Dashboard', 'E-commerce', 'Analytics'],
  },
  {
    user: users[1]._id,
    title: 'COVID-19 Prediction Model',
    description: 'Machine learning model to predict COVID-19 case trends using epidemiological data. Built with Python, TensorFlow, and deployed on AWS. Achieved 92% accuracy in 7-day forecasting.',
    shortDescription: 'ML model for COVID-19 case prediction with 92% accuracy using TensorFlow.',
    urls: {
      github: 'https://github.com/sarahchen/covid-prediction',
      documentation: 'https://covid-ml-docs.readthedocs.io',
    },
    timeline: {
      startDate: new Date('2023-03-01'),
      endDate: new Date('2023-07-30'),
      isOngoing: false,
    },
    technologies: [
      { name: 'Python', category: 'backend', proficiencyGained: 'expert' },
      { name: 'TensorFlow', category: 'ai_ml', proficiencyGained: 'advanced' },
      { name: 'Pandas', category: 'ai_ml', proficiencyGained: 'advanced' },
      { name: 'AWS', category: 'cloud', proficiencyGained: 'intermediate' },
    ],
    category: 'machine_learning',
    projectType: 'academic',
    status: 'completed',
    features: [
      '7-day case prediction',
      'Multiple data source integration',
      'Interactive visualization dashboard',
      'API for real-time predictions',
    ],
    achievements: [
      'Achieved 92% prediction accuracy',
      'Published research paper',
      'Presented at ML conference',
      'Used by local health department',
    ],
    challenges: [
      'Data quality and consistency issues',
      'Model overfitting prevention',
      'Real-time data processing',
    ],
    lessonsLearned: [
      'Importance of data preprocessing',
      'Cross-validation techniques',
      'Model deployment best practices',
    ],
    metrics: {
      linesOfCode: 8500,
      commits: 89,
      stars: 45,
      forks: 12,
    },
    visibility: 'public',
    isPortfolioProject: true,
    portfolioOrder: 1,
    tags: ['Machine Learning', 'Python', 'Healthcare', 'Research'],
  },
];

// Seed function
const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Profile.deleteMany({});
    await TechUpdate.deleteMany({});
    await PsychotestResult.deleteMany({});
    await Project.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create users
    const users = [];
    for (const userData of sampleUsers) {
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(userData.password, salt);
      
      const user = await User.create({
        ...userData,
        password: hashedPassword,
      });
      users.push(user);
    }
    console.log(`👥 Created ${users.length} users`);

    // Create profiles
    const profilesData = createSampleProfiles(users);
    const profiles = await Profile.insertMany(profilesData);
    console.log(`📋 Created ${profiles.length} profiles`);

    // Create tech updates
    const techUpdates = await TechUpdate.insertMany(sampleTechUpdates);
    console.log(`📰 Created ${techUpdates.length} tech updates`);

    // Create projects
    const projectsData = createSampleProjects(users);
    const projects = await Project.insertMany(projectsData);
    console.log(`🚀 Created ${projects.length} projects`);

    console.log('✅ Database seeding completed successfully!');
    console.log('\n📊 Seeded data summary:');
    console.log(`   Users: ${users.length}`);
    console.log(`   Profiles: ${profiles.length}`);
    console.log(`   Tech Updates: ${techUpdates.length}`);
    console.log(`   Projects: ${projects.length}`);
    
    console.log('\n🔐 Sample login credentials:');
    sampleUsers.forEach(user => {
      console.log(`   Email: ${user.email} | Password: ${user.password}`);
    });

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

// Run seeding
const runSeed = async () => {
  await connectDB();
  await seedDatabase();
  await mongoose.connection.close();
  console.log('🔌 Database connection closed');
  process.exit(0);
};

// Execute if run directly
if (require.main === module) {
  runSeed();
}

module.exports = { seedDatabase, connectDB };
