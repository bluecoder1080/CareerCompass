# CareerCompass Deployment Guide 🚀

This guide covers various deployment options for CareerCompass, from local development to production cloud deployments.

## 📋 Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local development)
- MongoDB instance (local or cloud)
- Domain name (for production)
- SSL certificates (for HTTPS)

## 🏠 Local Development

### Quick Start
```bash
# Clone and setup
git clone <repository-url>
cd careercompass
cp .env.example .env

# Install dependencies
npm run install:all

# Start with Docker
docker-compose up -d

# Or start manually
npm run dev
```

### Environment Variables
```env
MONGO_URI=mongodb://localhost:27017/careercompass
JWT_SECRET=your-development-secret
GEMMA_API_KEY=your-api-key
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

## ☁️ Cloud Deployments

### 1. Render.com (Recommended for MVP)

#### Backend Deployment
1. Connect GitHub repository to Render
2. Create new Web Service
3. Configure:
   ```
   Build Command: cd backend && npm install
   Start Command: cd backend && npm start
   ```
4. Add environment variables:
   ```
   NODE_ENV=production
   MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/careercompass
   JWT_SECRET=your-production-secret
   GEMMA_API_KEY=your-api-key
   FRONTEND_URL=https://your-frontend.onrender.com
   ```

#### Frontend Deployment
1. Create new Static Site
2. Configure:
   ```
   Build Command: cd frontend && npm install && npm run build
   Publish Directory: frontend/dist
   ```
3. Add environment variables:
   ```
   VITE_API_URL=https://your-backend.onrender.com/api
   ```

### 2. Google Cloud Platform

#### Cloud Run Deployment
```bash
# Set project
gcloud config set project YOUR_PROJECT_ID

# Build and deploy backend
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/careercompass-backend ./backend
gcloud run deploy careercompass-backend \
  --image gcr.io/YOUR_PROJECT_ID/careercompass-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars NODE_ENV=production,MONGO_URI=your-mongo-uri

# Build and deploy frontend
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/careercompass-frontend ./frontend
gcloud run deploy careercompass-frontend \
  --image gcr.io/YOUR_PROJECT_ID/careercompass-frontend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

#### Cloud Run with Cloud SQL
```yaml
# cloudbuild.yaml
steps:
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'gcr.io/$PROJECT_ID/careercompass-backend', './backend']
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'gcr.io/$PROJECT_ID/careercompass-backend']
  - name: 'gcr.io/cloud-builders/gcloud'
    args:
      - 'run'
      - 'deploy'
      - 'careercompass-backend'
      - '--image=gcr.io/$PROJECT_ID/careercompass-backend'
      - '--region=us-central1'
      - '--platform=managed'
      - '--allow-unauthenticated'
```

### 3. AWS Deployment

#### ECS Fargate
```json
{
  "family": "careercompass-backend",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "executionRoleArn": "arn:aws:iam::ACCOUNT:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "careercompass-backend",
      "image": "your-account.dkr.ecr.region.amazonaws.com/careercompass-backend:latest",
      "portMappings": [
        {
          "containerPort": 5000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        },
        {
          "name": "MONGO_URI",
          "value": "your-mongo-uri"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/careercompass-backend",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

#### Elastic Beanstalk
```bash
# Install EB CLI
pip install awsebcli

# Initialize and deploy
eb init careercompass-backend
eb create production
eb deploy
```

### 4. DigitalOcean App Platform

#### app.yaml
```yaml
name: careercompass
services:
- name: backend
  source_dir: backend
  github:
    repo: your-username/careercompass
    branch: main
  run_command: npm start
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs
  env:
  - key: NODE_ENV
    value: production
  - key: MONGO_URI
    value: ${MONGO_URI}
    type: SECRET
  - key: JWT_SECRET
    value: ${JWT_SECRET}
    type: SECRET

- name: frontend
  source_dir: frontend
  github:
    repo: your-username/careercompass
    branch: main
  build_command: npm run build
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs
  env:
  - key: VITE_API_URL
    value: ${backend.PUBLIC_URL}/api

databases:
- name: careercompass-db
  engine: MONGODB
  version: "5"
```

## 🐳 Docker Production Setup

### Production Docker Compose
```bash
# Create production environment file
cp .env.example .env.prod

# Edit with production values
nano .env.prod

# Deploy with production compose
docker-compose -f docker-compose.prod.yml up -d
```

### Environment Variables for Production
```env
# .env.prod
NODE_ENV=production
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=secure-password
REDIS_PASSWORD=redis-password
JWT_SECRET=super-secure-jwt-secret
GEMMA_API_KEY=your-production-api-key
FRONTEND_URL=https://your-domain.com
VITE_API_URL=https://api.your-domain.com/api
```

### SSL Configuration with Let's Encrypt
```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com -d api.your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## 🔧 Database Setup

### MongoDB Atlas (Recommended)
1. Create cluster at mongodb.com/cloud/atlas
2. Create database user
3. Whitelist IP addresses
4. Get connection string:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/careercompass?retryWrites=true&w=majority
   ```

### Self-hosted MongoDB
```bash
# Install MongoDB
curl -fsSL https://pgp.mongodb.com/server-6.0.asc | sudo gpg -o /usr/share/keyrings/mongodb-server-6.0.gpg --dearmor
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-6.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Create database and user
mongosh
use careercompass
db.createUser({
  user: "careercompass",
  pwd: "secure-password",
  roles: [{ role: "readWrite", db: "careercompass" }]
})
```

## 🔐 Security Considerations

### Environment Variables
- Never commit `.env` files
- Use different secrets for each environment
- Rotate secrets regularly
- Use cloud secret management services

### Database Security
- Enable authentication
- Use SSL/TLS connections
- Regular backups
- Network restrictions

### Application Security
- Keep dependencies updated
- Use HTTPS everywhere
- Implement rate limiting
- Regular security audits

## 📊 Monitoring and Logging

### Application Monitoring
```javascript
// Add to backend/server.js
const prometheus = require('prom-client');

// Create metrics
const httpRequestDuration = new prometheus.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code']
});

// Metrics endpoint
app.get('/metrics', (req, res) => {
  res.set('Content-Type', prometheus.register.contentType);
  res.end(prometheus.register.metrics());
});
```

### Log Management
```javascript
// Use structured logging
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

## 🚀 CI/CD Pipeline

### GitHub Actions
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Render
        run: |
          curl -X POST ${{ secrets.RENDER_DEPLOY_HOOK }}
```

### GitLab CI
```yaml
# .gitlab-ci.yml
stages:
  - test
  - build
  - deploy

test:
  stage: test
  script:
    - npm ci
    - npm test

build:
  stage: build
  script:
    - docker build -t $CI_REGISTRY_IMAGE/backend ./backend
    - docker push $CI_REGISTRY_IMAGE/backend

deploy:
  stage: deploy
  script:
    - kubectl apply -f k8s/
  only:
    - main
```

## 📈 Scaling Considerations

### Horizontal Scaling
- Use load balancers
- Implement session storage (Redis)
- Database read replicas
- CDN for static assets

### Performance Optimization
- Enable gzip compression
- Implement caching strategies
- Optimize database queries
- Use connection pooling

### Cost Optimization
- Right-size instances
- Use spot instances where appropriate
- Implement auto-scaling
- Monitor and optimize resource usage

## 🔄 Backup and Recovery

### Database Backups
```bash
# MongoDB backup
mongodump --uri="mongodb+srv://user:pass@cluster.mongodb.net/careercompass" --out=/backup/$(date +%Y%m%d)

# Automated backup script
#!/bin/bash
BACKUP_DIR="/backup/$(date +%Y%m%d)"
mkdir -p $BACKUP_DIR
mongodump --uri="$MONGO_URI" --out=$BACKUP_DIR
tar -czf "$BACKUP_DIR.tar.gz" -C /backup $(date +%Y%m%d)
rm -rf $BACKUP_DIR

# Upload to cloud storage
aws s3 cp "$BACKUP_DIR.tar.gz" s3://your-backup-bucket/
```

### Disaster Recovery
- Regular backup testing
- Multi-region deployments
- Infrastructure as Code
- Documented recovery procedures

## 🎯 Health Checks and Monitoring

### Application Health Checks
```javascript
// backend/routes/health.js
app.get('/health', async (req, res) => {
  const health = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version,
    checks: {
      database: 'OK',
      redis: 'OK',
      external_apis: 'OK'
    }
  };

  try {
    // Check database connection
    await mongoose.connection.db.admin().ping();
  } catch (error) {
    health.checks.database = 'ERROR';
    health.status = 'ERROR';
  }

  res.status(health.status === 'OK' ? 200 : 503).json(health);
});
```

### Monitoring Setup
```yaml
# docker-compose.monitoring.yml
version: '3.8'
services:
  prometheus:
    image: prom/prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml

  grafana:
    image: grafana/grafana
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana-storage:/var/lib/grafana

volumes:
  grafana-storage:
```

This deployment guide covers all major deployment scenarios and best practices for running CareerCompass in production. Choose the deployment method that best fits your requirements and scale as needed.
