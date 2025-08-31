# Development Setup SOP

## 📋 Overview

This SOP outlines the complete process for setting up the InterviewsFirst development environment on a local machine.

## 🎯 Purpose

To ensure all developers can quickly and consistently set up the development environment with all necessary dependencies and configurations.

## 📋 Prerequisites

### **System Requirements**
- **Operating System**: macOS, Windows, or Linux
- **Node.js**: Version 18+ 
- **npm**: Version 10+
- **Docker**: Version 20+ with Docker Compose
- **Git**: Latest version
- **Code Editor**: VS Code (recommended) or similar

### **Required Accounts**
- **GitHub**: For repository access
- **Docker Hub**: For container images (optional)

## 🔧 Step-by-Step Setup

### **Step 1: Clone Repository**
```bash
# Clone the repository
git clone https://github.com/eneh4kene/interview-me.git
cd interview-me

# Verify you're on the correct branch
git branch
```

### **Step 2: Install Dependencies**
```bash
# Install root dependencies
npm install

# Install workspace dependencies
npm run install:all

# Verify installation
npm run type-check
```

### **Step 3: Environment Configuration**
```bash
# Copy environment files
cp env.example .env
cp apps/web/env.example apps/web/.env.local
cp apps/api/env.example apps/api/.env

# Edit environment files with your configuration
# See Environment Variables section below
```

### **Step 4: Database Setup**
```bash
# Start database services
docker-compose -f docker-compose.dev.yml up -d

# Wait for services to be healthy
docker-compose -f docker-compose.dev.yml ps

# Verify database connection
docker exec -it interviewsfirst-postgres psql -U postgres -d interviewsfirst -c "\dt"
```

### **Step 5: Database Initialization**
```bash
# Run database initialization script
docker exec -i interviewsfirst-postgres psql -U postgres -d interviewsfirst < scripts/init-db.sql

# Verify tables are created
docker exec -it interviewsfirst-postgres psql -U postgres -d interviewsfirst -c "\dt"
```

### **Step 6: Start Development Servers**
```bash
# Start all services in development mode
npm run dev

# Or start individual services
npm run dev --workspace=@interview-me/web    # Frontend only
npm run dev --workspace=@interview-me/api    # Backend only
```

### **Step 7: Verify Setup**
```bash
# Check all services are running
curl http://localhost:3000    # Frontend
curl http://localhost:3001    # Backend API
curl http://localhost:5432    # PostgreSQL
curl http://localhost:6379    # Redis
curl http://localhost:5678    # n8n (if started)
```

## 🔧 Environment Variables

### **Root (.env)**
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/interviewsfirst
REDIS_URL=redis://localhost:6379
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
JWT_PRIVATE_KEY=your_jwt_private_key
JWT_PUBLIC_KEY=your_jwt_public_key
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
```

### **Web App (.env.local)**
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
```

### **API (.env)**
```env
PORT=3001
NODE_ENV=development
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/interviewsfirst
REDIS_URL=redis://localhost:6379

# Job Aggregators
ADZUNA_APP_ID=your_adzuna_app_id
ADZUNA_APP_KEY=your_adzuna_app_key
JOOBLE_API_KEY=your_jooble_api_key

# n8n Automation
N8N_AI_APPLY_WEBHOOK_URL=http://localhost:5678/webhook/ai-apply
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=admin

# Rate Limits
ADZUNA_RATE_LIMIT_PER_MINUTE=25
JOOBLE_RATE_LIMIT_PER_MINUTE=60

# Cache Settings
JOB_CACHE_TTL_SECONDS=1800
JOB_STORAGE_TTL_DAYS=30
```

## 🧪 Testing the Setup

### **Frontend Testing**
1. Open http://localhost:3000
2. Navigate to login page
3. Test admin login: admin/admin
4. Verify dashboard loads correctly

### **Backend Testing**
```bash
# Test API health
curl http://localhost:3001/api/health

# Test authentication
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin"}'
```

### **Database Testing**
```bash
# Test database connection
docker exec -it interviewsfirst-postgres psql -U postgres -d interviewsfirst -c "SELECT version();"

# Test Redis connection
docker exec -it interviewsfirst-redis redis-cli ping
```

## 🚨 Troubleshooting

### **Common Issues**

#### **Port Conflicts**
```bash
# Check what's using the ports
lsof -i :3000
lsof -i :3001
lsof -i :5432
lsof -i :6379

# Kill processes if needed
kill -9 <PID>
```

#### **Docker Issues**
```bash
# Restart Docker services
docker-compose -f docker-compose.dev.yml down
docker-compose -f docker-compose.dev.yml up -d

# Clear Docker cache if needed
docker system prune -a
```

#### **Node Modules Issues**
```bash
# Clear node modules and reinstall
rm -rf node_modules
rm -rf apps/*/node_modules
rm -rf packages/*/node_modules
npm install
```

#### **Database Connection Issues**
```bash
# Check database status
docker-compose -f docker-compose.dev.yml ps

# Restart database
docker-compose -f docker-compose.dev.yml restart postgres

# Check logs
docker-compose -f docker-compose.dev.yml logs postgres
```

### **Build Errors**
```bash
# Clear build cache
npm run clean
rm -rf .turbo
npm run build
```

## 📋 Verification Checklist

- [ ] Repository cloned successfully
- [ ] All dependencies installed
- [ ] Environment files configured
- [ ] Database services running
- [ ] Database initialized with schema
- [ ] Frontend accessible at http://localhost:3000
- [ ] Backend API accessible at http://localhost:3001
- [ ] Login functionality working
- [ ] Dashboard loads correctly
- [ ] No console errors in browser
- [ ] No build errors in terminal

## 🔄 Maintenance

### **Regular Updates**
```bash
# Update dependencies
npm update

# Update Docker images
docker-compose -f docker-compose.dev.yml pull

# Rebuild containers
docker-compose -f docker-compose.dev.yml up -d --build
```

### **Cleanup**
```bash
# Clean up Docker resources
docker system prune -f

# Clean up node modules
npm run clean
```

## 📞 Support

### **Escalation Contacts**
- **Technical Lead**: [Contact Info]
- **DevOps Team**: [Contact Info]
- **Database Administrator**: [Contact Info]

### **Useful Commands**
```bash
# View all running services
docker-compose -f docker-compose.dev.yml ps

# View logs for all services
docker-compose -f docker-compose.dev.yml logs -f

# View logs for specific service
docker-compose -f docker-compose.dev.yml logs -f api

# Access database shell
docker exec -it interviewsfirst-postgres psql -U postgres -d interviewsfirst

# Access Redis shell
docker exec -it interviewsfirst-redis redis-cli
```

---

**Document Version**: 1.0  
**Last Updated**: [Date]  
**Next Review**: [Date]  
**Author**: [Name]
