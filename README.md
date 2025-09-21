<div align="center">

# 🧭 CareerCompass

### *Navigate Your Career Journey with AI-Powered Intelligence*

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933.svg?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18+-61DAFB.svg?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6+-47A248.svg?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![AI Powered](https://img.shields.io/badge/AI-Powered-FF6B6B.svg?style=for-the-badge&logo=openai&logoColor=white)]()

<p align="center">
  <strong>🎯 AI-powered career guidance • 📊 Psychometric assessments • 📄 Smart resume building • 💬 Intelligent chat assistant</strong>
</p>

<p align="center">
  <a href="#-features">Features</a> •
  <a href="#-quick-start">Quick Start</a> •
  <a href="#-live-demo">Live Demo</a> •
  <a href="#-deployment">Deployment</a> •
  <a href="#-contributing">Contributing</a>
</p>

</div>

---

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

<table>
<tr>
<td width="50%">

### 🤖 AI-Powered Career Guidance
- **💬 Intelligent Chat Assistant**: Personalized career advice with advanced AI
- **🧠 Psychometric Assessment**: Comprehensive personality analysis
- **🎯 Career Path Recommendations**: Tailored career suggestions
- **📈 Skill Gap Analysis**: Identify and bridge skill gaps

</td>
<td width="50%">

### 📊 Smart Analytics
- **📋 Comprehensive Dashboard**: Real-time insights and progress tracking
- **🗓️ 6-Month Roadmap**: AI-generated development plans
- **📰 Tech Updates**: Curated industry news and trends
- **📊 Progress Tracking**: Monitor your professional journey

</td>
</tr>
<tr>
<td width="50%">

### 📄 Resume Intelligence
- **🔍 AI-Powered Analysis**: ATS compatibility and optimization
- **🎨 Multiple Templates**: Modern, professional designs
- **📤 One-Click Export**: PDF, DOCX, HTML formats
- **📁 Resume Upload**: Automatic parsing and analysis

</td>
<td width="50%">

### 👤 Profile Management
- **📝 Comprehensive Profiles**: Complete professional information
- **💼 Portfolio Integration**: Showcase projects and achievements
- **🎮 Gamified Experience**: Track profile completion progress
- **🔒 Privacy Controls**: Manage visibility and sharing

</td>
</tr>
</table>

### 🔧 Technical Excellence

<div align="center">

| Frontend | Backend | Database | AI/ML |
|----------|---------|----------|-------|
| ⚛️ React 18+ | 🟢 Node.js | 🍃 MongoDB | 🤖 Google Gemini |
| ⚡ Vite | 🚀 Express.js | 🔄 Mongoose ODM | 🤗 Hugging Face |
| 🎨 TailwindCSS | 🔐 JWT Auth | ☁️ MongoDB Atlas | 🧠 Custom ML Models |
| 🎭 Framer Motion | 📡 WebSocket | 📊 Aggregation Pipeline | 💭 Context-Aware AI |

</div>

**Key Technical Features:**
- 📱 **Responsive Design**: Mobile-first UI with dark theme
- ♿ **Accessibility**: WCAG compliant interface
- ⚡ **Real-time Features**: Live chat and streaming responses
- 🐳 **Containerized**: Docker-ready architecture
- 🔒 **Secure**: JWT authentication and data encryption
- 📈 **Scalable**: Cloud-native deployment ready

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

<div align="center">

🚀 **[Try CareerCompass Live](https://careercompass-fy7q.onrender.com)**

*Experience the full power of AI-driven career guidance*

</div>

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
- **Production**: Configured via environment variables

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

### Test Coverage

- Unit tests for API endpoints
- Integration tests for AI services
- Frontend component testing
- End-to-end user flow testing

## 🚀 Deployment

### Cloud Deployment

#### Backend Service
- **Platform**: Node.js service
- **Build**: `cd backend && npm install`
- **Start**: `cd backend && npm start`
- **Environment**: Production variables required

#### Frontend Service
- **Type**: Static site
- **Build**: `cd frontend && npm install && npm run build`
- **Output**: `dist` directory
- **Routing**: SPA configuration included

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

<div align="center">

---

### 🚀 Ready to Transform Your Career?

<p align="center">
  <a href="https://careercompass-fy7q.onrender.com" target="_blank">
    <img src="https://img.shields.io/badge/🌟_Try_CareerCompass-Live_Demo-FF6B6B?style=for-the-badge&logoColor=white" alt="Try CareerCompass">
  </a>
</p>

<br>

**Built with ❤️ for the developer community**

*Empowering professionals to navigate their career journey with AI-powered insights and personalized guidance.*

<p align="center">
  <img src="https://img.shields.io/github/stars/bluecoder1080/CareerCompass?style=social" alt="GitHub stars">
  <img src="https://img.shields.io/github/forks/bluecoder1080/CareerCompass?style=social" alt="GitHub forks">
  <img src="https://img.shields.io/github/watchers/bluecoder1080/CareerCompass?style=social" alt="GitHub watchers">
</p>

</div>  
 