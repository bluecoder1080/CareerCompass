# CareerCompass Production Deployment Guide

## 🚀 Pre-Deployment Checklist

### Backend Environment Variables (Required for Production)
Set these environment variables on your production server (Render, Heroku, etc.):

```env
# Database
MONGO_URI=mongodb+srv://aditya:Ijyzuc03OB07buXR@cluster0.bnowp2w.mongodb.net/CareerCompassDB?retryWrites=true&w=majority

# JWT
JWT_SECRET=careercompass-super-secret-jwt-key-2024-production
JWT_EXPIRES_IN=7d

# Google Gemini AI (CRITICAL - Required for real-time chat)
GEMINI_API_KEY=AIzaSyBo7yVMbiRO-o2H45dFy1gzB0kOYOROSxA
GEMINI_API_URL=https://generativelanguage.googleapis.com/v1beta

# Server Configuration
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://your-frontend-domain.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
```

### Frontend Environment Variables (Optional)
If you want to override the default API URL:

```env
VITE_API_URL=https://careercompass-backend-mssq.onrender.com/api
```

## 🔧 Key Features Ready for Production

✅ **Real-time Chat with Google Gemini AI**
- Streaming responses with Server-Sent Events
- Context-aware career guidance
- Error handling and fallbacks

✅ **Authentication & Security**
- JWT-based authentication
- CORS properly configured
- Rate limiting enabled
- Input sanitization

✅ **Database Integration**
- MongoDB Atlas connection
- User profiles and chat history
- Persistent conversations

## 🚀 Deployment Steps

### 1. Backend Deployment (Render/Heroku)
1. Push your code to GitHub
2. Connect your repository to your hosting service
3. Set all required environment variables
4. Deploy the backend service

### 2. Frontend Deployment (Netlify/Vercel)
1. Build the frontend: `npm run build`
2. Deploy the `dist` folder
3. Set environment variables if needed

### 3. Post-Deployment Testing
1. Test user registration/login
2. Test real-time chat functionality
3. Verify Gemini AI responses
4. Check error handling

## 🔍 Production Monitoring

### Health Check Endpoint
Your backend includes a health check at: `GET /health`

### Expected Response:
```json
{
  "success": true,
  "message": "CareerCompass API is running",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": "production",
  "cors_origins": ["https://your-frontend-domain.com"]
}
```

## 🚨 Important Notes

1. **Gemini API Key**: Ensure the API key is valid and has sufficient quota
2. **CORS Origins**: Update CORS configuration with your production frontend URL
3. **Database**: MongoDB Atlas connection string is already configured
4. **SSL**: Ensure both frontend and backend use HTTPS in production
5. **Error Monitoring**: Consider adding error tracking (Sentry, LogRocket, etc.)

## 🧪 Testing in Production

1. **Real-time Chat**: Send messages and verify streaming responses
2. **Authentication**: Test login/logout flows
3. **Error Handling**: Test with invalid inputs
4. **Performance**: Monitor response times and memory usage

## 📞 Support

If you encounter issues during deployment:
1. Check the health endpoint
2. Verify all environment variables are set
3. Check server logs for errors
4. Test API endpoints individually
