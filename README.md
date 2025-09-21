# CareerCompass 🧭

> AI-powered career guidance platform with personalized recommendations, psychometric assessments, and intelligent resume building.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6+-green.svg)](https://www.mongodb.com/)
[![Deployed](https://img.shields.io/badge/Status-Live-brightgreen.svg)](https://careercompass-fy7q.onrender.com)

## 📋 Table of Contents

- [🌟 Features](#-features)
- [🚀 Quick Start](#-quick-start)
- [🌐 Live Demo](#-live-demo)
- [🐳 Docker Deployment](#-docker-deployment)
- [🔧 Configuration](#-configuration)
- [📁 Project Structure](#-project-structure)
- [🎯 Usage Guide](#-usage-guide)
- [🔌 API Documentation](#-api-documentation)
- [🧪 Testing](#-testing)
- [🚀 Deployment](#-deployment)
- [🛠️ Development](#-development)
- [🤝 Contributing](#-contributing)
- [📝 License](#-license)
- [🙏 Acknowledgments](#-acknowledgments)
- [📞 Support](#-support)
- [🗺️ Roadmap](#-roadmap)

## 🌟 Features

### 🤖 AI-Powered Career Guidance
- **Intelligent Chat Assistant**: Get personalized career advice using Gemma 2B or other LLM providers
- **Psychometric Assessment**: 10-question personality test with AI-generated insights
- **Career Path Recommendations**: Discover 3-5 career paths based on your profile and assessment
- **Skill Gap Analysis**: Identify missing skills and get learning recommendations

### 📊 Comprehensive Dashboard
- **Personalized Insights**: Real-time career recommendations and progress tracking
- **6-Month Roadmap**: AI-generated development plan with actionable milestones
- **Tech Updates Feed**: Curated industry news and trends relevant to your interests
- **Progress Tracking**: Monitor your professional development journey

### 📄 Smart Resume Builder
- **AI-Powered Analysis**: Get ATS compatibility scores and improvement suggestions
- **Multiple Templates**: Choose from modern, classic, creative, and minimal designs
- **One-Click Export**: Generate PDF, DOCX, or HTML versions instantly
- **Resume Upload**: Extract and analyze existing resumes automatically

### 👤 Rich User Profiles
- **Comprehensive Profiles**: Education, experience, skills, and career goals
- **Portfolio Integration**: Showcase projects with GitHub sync capabilities
- **Profile Completion Tracking**: Gamified profile building experience
- **Privacy Controls**: Manage profile visibility and sharing settings

### 🔧 Technical Excellence
- **Modern Tech Stack**: MERN (MongoDB, Express, React, Node.js) with TypeScript support
- **Responsive Design**: Mobile-first UI with dark theme and accessibility features
- **Real-time Features**: Live chat, streaming responses, and instant updates
- **Scalable Architecture**: Docker containerization and cloud-ready deployment

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and npm
- **MongoDB** 6+ (local or cloud)
- **Git**

### 1. Clone the Repository

```bash
git clone https://github.com/bluecoder1080/CareerCompass.git
cd CareerCompass
```

### 2. Install Dependencies

```bash
# Install all dependencies (frontend + backend)
npm run install:all

# Or install individually
cd backend && npm install
cd ../frontend && npm install
```

### 3. Environment Setup

Create a `.env` file in the backend directory:

```env
# Database
MONGO_URI=mongodb://localhost:27017/careercompass
# Or use MongoDB Atlas:
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/careercompass

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random
JWT_EXPIRE=30d

# AI/ML Services (choose one or more)
GEMMA_API_KEY=your-gemma-api-key
GEMMA_API_URL=https://api.gemma.com/v1
# HF_TOKEN=your-huggingface-token
# VERTEX_PROJECT_ID=your-vertex-project-id

# Server Configuration
PORT=5000
FRONTEND_URL=http://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 4. Database Setup

```bash
# Start MongoDB (if running locally)
mongod

# Seed the database with sample data (optional)
cd backend && npm run seed
```

### 5. Start Development Servers

```bash
# Start both frontend and backend concurrently
npm run dev

# Or start individually:
npm run dev:backend  # Backend on http://localhost:5000
npm run dev:frontend # Frontend on http://localhost:5173
```

### 6. Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/health

## 🌐 Live Demo

🚀 **[Try CareerCompass Live](https://careercompass-fy7q.onrender.com)**

**Demo Accounts:**
- Email: `alex.johnson@example.com` | Password: `password123`
- Email: `sarah.chen@example.com` | Password: `password123`
- Email: `michael.rodriguez@example.com` | Password: `password123`

## 🐳 Docker Deployment

### Development with Docker Compose

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Production Deployment

```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Deploy to production
docker-compose -f docker-compose.prod.yml up -d
```

## 🔧 Configuration

### AI/ML Provider Setup

CareerCompass supports multiple AI providers with automatic fallback:

#### 1. Gemma API (Recommended)
```env
GEMMA_API_KEY=your-api-key
GEMMA_API_URL=https://api.gemma.com/v1
```

#### 2. Hugging Face Inference
```env
HF_TOKEN=your-huggingface-token
HF_MODEL_URL=https://api-inference.huggingface.co/models/google/gemma-2b-it
```

#### 3. Google Vertex AI
```env
VERTEX_PROJECT_ID=your-project-id
VERTEX_LOCATION=us-central1
```

#### 4. Mock Provider (Development)
No configuration needed - automatically used when no other providers are available.

### Database Configuration

#### Local MongoDB
```env
MONGO_URI=mongodb://localhost:27017/careercompass
```

#### MongoDB Atlas (Cloud)
```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/careercompass
```

#### Docker MongoDB
```env
MONGO_URI=mongodb://admin:password@mongodb:27017/careercompass?authSource=admin
```

## 📁 Project Structure

```
CareerCompass/
├── 📁 backend/                 # Node.js/Express API
│   ├── 📁 config/             # Database and app configuration
│   ├── 📁 middleware/         # Express middleware (auth, error handling)
│   ├── 📁 models/             # MongoDB/Mongoose models (8 models)
│   ├── 📁 routes/             # API route handlers (auth, chat, profiles, etc.)
│   ├── 📁 services/           # Business logic and ML integration
│   ├── 📁 scripts/            # Database seeding and utilities
│   ├── 📁 workers/            # Background job processors
│   ├── 📁 uploads/            # File upload storage
│   ├── 🐳 Dockerfile          # Backend container config
│   └── 📄 server.js           # Express server entry point
├── 📁 frontend/               # React/Vite frontend
│   ├── 📁 public/             # Static assets
│   ├── 📁 src/                # React source code
│   │   ├── 📁 components/     # Reusable UI components
│   │   ├── 📁 pages/          # Page components (auth, dashboard, etc.)
│   │   ├── 📁 stores/         # Zustand state management
│   │   ├── 📁 lib/            # Utilities and API client
│   │   └── 📄 main.jsx        # React entry point
│   ├── 🐳 Dockerfile          # Frontend container config
│   └── ⚙️ vite.config.js      # Vite configuration
├── 🐳 docker-compose.yml      # Development containers
├── 🐳 docker-compose.prod.yml # Production containers
├── 📄 package.json            # Root package configuration
└── 📖 README.md               # This file
```

## 🎯 Usage Guide

### Key Features Walkthrough

#### 1. **AI Chat Assistant**
- Navigate to `/app/chat`
- Ask career-related questions
- Get personalized advice based on your profile
- Save and organize conversation history

#### 2. **Psychometric Assessment**
- Go to `/app/psychotest`
- Complete the 10-question personality assessment
- Receive AI-generated career recommendations
- Get a personalized 6-month development roadmap

#### 3. **Profile Management**
- Visit `/app/profile`
- Complete your professional information
- Add skills, experience, and education
- Set career goals and preferences

#### 4. **Resume Builder**
- Access `/app/resume`
- Upload existing resume for analysis
- Use the visual builder to create new resumes
- Export in multiple formats (PDF, DOCX, HTML)

#### 5. **Dashboard Overview**
- View `/app/dashboard`
- See personalized career recommendations
- Track your development progress
- Stay updated with relevant tech news

## 🔌 API Documentation

### Base URLs
- **Development**: `http://localhost:5000/api`
- **Production**: `https://careercompass-backend-mssq.onrender.com/api`

### Authentication Endpoints

```http
POST /api/auth/register     # User registration
POST /api/auth/login        # User login
GET  /api/auth/me          # Get current user
PUT  /api/auth/updatedetails # Update user details
POST /api/auth/refresh     # Refresh JWT token
```

### Core Features

```http
# Profiles
GET  /api/profiles/me       # Get user profile
PUT  /api/profiles/me       # Update profile
POST /api/profiles/me/skills # Add skill

# Chat
GET  /api/chat             # Get user chats
POST /api/chat             # Create new chat
POST /api/chat/:id/message # Send message

# Psychometric Test
GET  /api/psychotest/questions # Get test questions
POST /api/psychotest/submit    # Submit test answers
GET  /api/psychotest/latest    # Get latest results

# Resumes
GET  /api/resumes          # Get user resumes
POST /api/resumes          # Create resume
POST /api/resumes/:id/upload # Upload resume file
POST /api/resumes/:id/generate # Generate PDF/DOCX

# ML/AI
POST /api/ml/analyze       # Analyze text with AI
POST /api/ml/chat          # Chat with AI assistant
```

## 🧪 Testing

### Run Tests

```bash
# Backend tests
cd backend && npm test

# Frontend tests (if implemented)
cd frontend && npm test

# Run all tests
npm test
```

### Test Data

The seed script creates comprehensive test data:
- 3 sample users with complete profiles
- Sample chat conversations
- Tech update articles
- Project portfolios
- Psychometric test results

## 🚀 Deployment

### Render.com Deployment (Recommended)

#### Backend Deployment
1. **Service Name**: `careercompass-backend-mssq`
2. **Language**: `Node.js`
3. **Build Command**: `cd backend && npm install`
4. **Start Command**: `cd backend && npm start`
5. **Root Directory**: `backend`

**Environment Variables**:
```env
NODE_ENV=production
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
FRONTEND_URL=https://careercompass-fy7q.onrender.com
```

#### Frontend Deployment
1. **Service Name**: `careercompass-fy7q`
2. **Type**: `Static Site`
3. **Build Command**: `cd frontend && npm install && npm run build`
4. **Publish Directory**: `dist`
5. **Root Directory**: `frontend`

### Alternative Deployment Options

#### Google Cloud Run
```bash
# Backend
gcloud builds submit --tag gcr.io/PROJECT-ID/careercompass-backend ./backend
gcloud run deploy --image gcr.io/PROJECT-ID/careercompass-backend --platform managed

# Frontend
gcloud builds submit --tag gcr.io/PROJECT-ID/careercompass-frontend ./frontend
gcloud run deploy --image gcr.io/PROJECT-ID/careercompass-frontend --platform managed
```

#### AWS ECS/Fargate
Use the provided `docker-compose.yml` as a reference for ECS task definitions.

## 🛠️ Development

### Code Quality

```bash
# Lint code
npm run lint

# Format code
npm run format

# Type checking (if using TypeScript)
npm run type-check
```

### Adding New Features

1. **Backend API**: Add routes in `backend/routes/`, models in `backend/models/`
2. **Frontend Pages**: Add components in `frontend/src/pages/`
3. **UI Components**: Create reusable components in `frontend/src/components/`
4. **State Management**: Use Zustand stores in `frontend/src/stores/`

### Environment Variables Reference

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `MONGO_URI` | MongoDB connection string | Yes | - |
| `JWT_SECRET` | JWT signing secret | Yes | - |
| `GEMMA_API_KEY` | Gemma API key | No | - |
| `HF_TOKEN` | Hugging Face token | No | - |
| `REDIS_URL` | Redis connection string | No | - |
| `PORT` | Backend server port | No | 5000 |
| `NODE_ENV` | Environment mode | No | development |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines

- Follow existing code style and patterns
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting PR

## 🔧 Troubleshooting

### Common Issues

#### CORS Errors
- Ensure your frontend URL is added to backend CORS configuration
- Check that the backend is deployed and accessible
- Verify API base URL in frontend configuration

#### Authentication Issues
- Check JWT_SECRET is set and consistent across deployments
- Verify MongoDB connection string
- Ensure user registration/login endpoints are working

#### AI/ML Service Issues
- Verify API keys are correctly configured
- Check that at least one AI provider is properly set up
- Review service logs for specific error messages

#### Database Connection Issues
- Confirm MongoDB is running and accessible
- Check connection string format
- Verify database credentials and permissions

### Getting Help

1. **Check the logs**: Review backend and frontend console logs
2. **Test endpoints**: Use tools like Postman to test API endpoints directly
3. **Check environment variables**: Ensure all required variables are set
4. **Review deployment settings**: Verify Render or other deployment configurations

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Gemma AI** for providing the language model capabilities
- **MongoDB** for the flexible document database
- **React** and **Vite** for the modern frontend framework
- **TailwindCSS** for the utility-first styling approach
- **Framer Motion** for smooth animations and transitions
- **Render** for hosting and deployment services

## 📞 Support

- **Documentation**: Check this README and inline code comments
- **Issues**: Report bugs and request features via [GitHub Issues](https://github.com/bluecoder1080/CareerCompass/issues)
- **Discussions**: Join community discussions in [GitHub Discussions](https://github.com/bluecoder1080/CareerCompass/discussions)
- **Email**: Contact the team at adityasingh1080z@gmail.com

## 🗺️ Roadmap

### Phase 1 (Current) ✅
- ✅ Core MERN stack implementation
- ✅ AI chat integration with multiple providers
- ✅ Psychometric assessment with AI analysis
- ✅ Resume builder with ATS optimization
- ✅ Comprehensive user profiles
- ✅ Deployment to Render

### Phase 2 (Next) 🔄
- 🔄 Advanced analytics and reporting
- 🔄 Integration with job boards (LinkedIn, Indeed)
- 🔄 Video interview practice with AI feedback
- 🔄 Skill assessment quizzes
- 🔄 Mentorship matching system

### Phase 3 (Future) 📋
- 📋 Mobile app (React Native)
- 📋 Advanced ML models for better predictions
- 📋 Company culture matching
- 📋 Salary negotiation guidance
- 📋 Career transition planning tools

---

**Built with ❤️ by Aditya Singh**

*Empowering professionals to navigate their career journey with AI-powered insights and personalized guidance.*  
 