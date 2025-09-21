# CareerCompass 🧭

> AI-powered career guidance platform with personalized recommendations, psychometric assessments, and intelligent resume building.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6+-green.svg)](https://www.mongodb.com/)

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
- **Redis** (optional, for background jobs)
- **Git**

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/careercompass.git
cd careercompass
```

### 2. Environment Setup

```bash
# Copy environment variables
cp .env.example .env

# Install root dependencies
npm install

# Install all dependencies (frontend + backend)
npm run install:all
```

### 3. Configure Environment Variables

Edit `.env` file with your configuration:

```env
# Database
MONGO_URI=mongodb://localhost:27017/careercompass

# JWT
JWT_SECRET=your-super-secret-jwt-key-here

# AI/ML Services (choose one or more)
GEMMA_API_KEY=your-gemma-api-key
GEMMA_API_URL=https://api.gemma.com/v1
HF_TOKEN=your-huggingface-token
VERTEX_PROJECT_ID=your-vertex-project-id

# Optional: Redis for background jobs
REDIS_URL=redis://localhost:6379

# Server
PORT=5000
FRONTEND_URL=http://localhost:5173
```

### 4. Database Setup

```bash
# Start MongoDB (if running locally)
mongod

# Seed the database with sample data
npm run seed
```

### 5. Start Development Servers

```bash
# Start both frontend and backend
npm run dev

# Or start individually:
npm run dev:backend  # Backend on http://localhost:5000
npm run dev:frontend # Frontend on http://localhost:5173
```

### 6. Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **API Documentation**: http://localhost:5000/api-docs (if implemented)

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
careercompass/
├── 📁 backend/                 # Node.js/Express API
│   ├── 📁 config/             # Database and app configuration
│   ├── 📁 middleware/         # Express middleware
│   ├── 📁 models/             # MongoDB/Mongoose models
│   ├── 📁 routes/             # API route handlers
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
│   │   ├── 📁 pages/          # Page components
│   │   ├── 📁 stores/         # Zustand state management
│   │   ├── 📁 lib/            # Utilities and API client
│   │   └── 📄 main.jsx        # React entry point
│   ├── 🐳 Dockerfile          # Frontend container config
│   └── ⚙️ vite.config.js      # Vite configuration
├── 🐳 docker-compose.yml      # Development containers
├── 📄 package.json            # Root package configuration
└── 📖 README.md               # This file
```

## 🎯 Usage Guide

### Demo Accounts

Use these pre-seeded accounts to explore the platform:

| Email | Password | Profile Type |
|-------|----------|--------------|
| alex.johnson@example.com | password123 | Frontend Developer |
| sarah.chen@example.com | password123 | Data Scientist |
| michael.rodriguez@example.com | password123 | Product Manager |

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

### Authentication Endpoints

```http
POST /api/auth/register     # User registration
POST /api/auth/login        # User login
GET  /api/auth/me          # Get current user
PUT  /api/auth/updatedetails # Update user details
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

### Render.com Deployment

1. **Backend Deployment**:
   - Connect your GitHub repository
   - Set build command: `cd backend && npm install`
   - Set start command: `cd backend && npm start`
   - Add environment variables from `.env.example`

2. **Frontend Deployment**:
   - Set build command: `cd frontend && npm install && npm run build`
   - Set publish directory: `frontend/dist`
   - Add environment variable: `VITE_API_URL=https://your-backend-url.onrender.com/api`

### Google Cloud Run

```bash
# Build and push backend
gcloud builds submit --tag gcr.io/PROJECT-ID/careercompass-backend ./backend
gcloud run deploy --image gcr.io/PROJECT-ID/careercompass-backend --platform managed

# Build and push frontend
gcloud builds submit --tag gcr.io/PROJECT-ID/careercompass-frontend ./frontend
gcloud run deploy --image gcr.io/PROJECT-ID/careercompass-frontend --platform managed
```

### AWS ECS/Fargate

Use the provided `docker-compose.yml` as a reference for ECS task definitions.

## 🛠️ Development

### Code Style

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

### Environment Variables

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

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Gemma AI** for providing the language model capabilities
- **MongoDB** for the flexible document database
- **React** and **Vite** for the modern frontend framework
- **TailwindCSS** for the utility-first styling approach
- **Framer Motion** for smooth animations and transitions

## 📞 Support

- **Documentation**: Check this README and inline code comments
- **Issues**: Report bugs and request features via GitHub Issues
- **Discussions**: Join community discussions in GitHub Discussions
- **Email**: Contact the team at support@careercompass.app

## 🗺️ Roadmap

### Phase 1 (Current)
- ✅ Core MERN stack implementation
- ✅ AI chat integration with multiple providers
- ✅ Psychometric assessment with AI analysis
- ✅ Resume builder with ATS optimization
- ✅ Comprehensive user profiles

### Phase 2 (Next)
- 🔄 Advanced analytics and reporting
- 🔄 Integration with job boards (LinkedIn, Indeed)
- 🔄 Video interview practice with AI feedback
- 🔄 Skill assessment quizzes
- 🔄 Mentorship matching system

### Phase 3 (Future)
- 📋 Mobile app (React Native)
- 📋 Advanced ML models for better predictions
- 📋 Company culture matching
- 📋 Salary negotiation guidance
- 📋 Career transition planning tools

---

**Built with ❤️ by the CareerCompass Team**

*Empowering professionals to navigate their career journey with AI-powered insights and personalized guidance.*
#   C a r e e r C o m p a s s  
 