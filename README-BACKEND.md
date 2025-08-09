# CodeCrack Backend System

A comprehensive backend system for online coding platform with secure code execution, user management, and contest features.

## 🚀 Features

### ✅ Implemented Core Features

#### 🔐 Authentication & Authorization
- **JWT-based Authentication** with bcrypt password hashing
- **Google OAuth 2.0** integration for social login
- **Role-based Access Control** (User/Admin)
- **Profile Management** with user statistics

#### 👥 User Management
- User registration and login
- Profile tracking (score, solved problems)
- User statistics and progress tracking
- Admin user management capabilities

#### 📝 Problem Management
- **CRUD Operations** for problems
- Test case management (public/private)
- Difficulty levels (Easy/Medium/Hard)
- Tag-based categorization
- Rich problem descriptions with Markdown support

#### 🔧 Code Execution Engine
- **Secure Docker-based execution** for multiple languages:
  - Python 3.11
  - C++ (GCC 9, C++17)
  - JavaScript (Node.js 18)
  - Java 17
- **Security Features**:
  - Non-root user execution
  - Memory and time limits
  - Network isolation
  - Read-only filesystem
- **Result Processing**:
  - Test case validation
  - Execution time and memory tracking
  - Detailed error reporting

#### 📊 Submission System
- **Queue-based Processing** with BullMQ and Redis
- **Real-time Status Updates** for submissions
- **Comprehensive Result Tracking**:
  - ACCEPTED, WRONG_ANSWER, TIME_LIMIT_EXCEEDED
  - MEMORY_LIMIT_EXCEEDED, RUNTIME_ERROR, COMPILATION_ERROR
- **Submission History** with filtering and pagination

#### 🏆 Leaderboard & Scoring
- Dynamic scoring based on problem difficulty
- User ranking system
- Statistics and analytics

#### 🛡️ Security & Performance
- **Rate Limiting** for API endpoints
- **Input Validation** and sanitization
- **Error Handling** middleware
- **Request Logging** for monitoring
- **CORS Configuration** for frontend integration

#### 👨‍💼 Admin Dashboard
- User management (view, edit roles, delete)
- Submission monitoring
- System statistics and analytics
- Queue status monitoring

## 🛠️ Tech Stack

- **Backend**: Express.js + TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Queue System**: BullMQ with Redis
- **Code Execution**: Docker containers
- **Authentication**: JWT + Google OAuth 2.0
- **Security**: bcrypt, rate limiting, input validation

## 📋 Prerequisites

- Node.js 18+ 
- Docker and Docker Compose
- MongoDB (or use Docker Compose)
- Redis (or use Docker Compose)

## 🚀 Quick Start

### 1. Clone and Install

\`\`\`bash
# Clone the repository
git clone <repository-url>
cd CodeCrack

# Install dependencies
npm install
\`\`\`

### 2. Environment Setup

\`\`\`bash
# Copy environment template
cp .env.example .env

# Edit .env with your configurations
# At minimum, set:
# - JWT_SECRET
# - MONGODB_URI
# - GOOGLE_CLIENT_ID/SECRET (for OAuth)
\`\`\`

### 3. Database Setup

\`\`\`bash
# Start MongoDB and Redis using Docker Compose
cd docker
docker-compose up -d mongodb redis

# Initialize database with admin user and sample problems
npm run init-db
\`\`\`

### 4. Build Docker Images

\`\`\`bash
# Build execution environment images
cd docker
docker-compose build python-executor cpp-executor javascript-executor java-executor
\`\`\`

### 5. Start the Server

\`\`\`bash
# Development mode with hot reload
npm run dev

# Production mode
npm run build
npm start
\`\`\`

The server will start on `http://localhost:8080`

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `GET /api/auth/google` - Google OAuth login
- `GET /api/auth/google/callback` - Google OAuth callback

### Problems
- `GET /api/problems` - Get all problems
- `GET /api/problems/:id` - Get problem by ID
- `POST /api/problems` - Create problem (Admin)
- `PUT /api/problems/:id` - Update problem (Admin)
- `DELETE /api/problems/:id` - Delete problem (Admin)

### Submissions
- `POST /api/submissions` - Submit code
- `GET /api/submissions` - Get user submissions
- `GET /api/submissions/:id` - Get submission details
- `GET /api/submissions/:id/status` - Check submission status
- `GET /api/submissions/stats` - Get submission statistics

### Leaderboard
- `GET /api/leaderboard` - Get leaderboard
- `GET /api/leaderboard/top` - Get top users
- `GET /api/leaderboard/stats` - Get leaderboard statistics

### Admin
- `GET /api/admin/dashboard` - Dashboard statistics
- `GET /api/admin/users` - Manage users
- `GET /api/admin/submissions` - View all submissions
- `GET /api/admin/queue` - Queue status
- `PUT /api/admin/users/:id/role` - Update user role
- `DELETE /api/admin/users/:id` - Delete user

## 🔧 Configuration

### Environment Variables

\`\`\`bash
# Server
NODE_ENV=development
PORT=8080
CLIENT_URL=http://localhost:8080

# Database
MONGODB_URI=mongodb://localhost:27017/codecrack

# Redis (for queue)
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your_super_secure_secret

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Security
BCRYPT_ROUNDS=12
API_RATE_LIMIT=100
AUTH_RATE_LIMIT=5
SUBMISSION_RATE_LIMIT=10

# Code Execution
CODE_EXECUTION_TIMEOUT=5000
CODE_EXECUTION_MEMORY_LIMIT=128
\`\`\`

### Database Initialization

The `init-db` script creates:
- Admin user (email: admin@codecrack.com, password: admin123)
- Sample problems for testing

### Docker Images

Custom Docker images are built for secure code execution:
- `codecrack/python-executor`
- `codecrack/cpp-executor` 
- `codecrack/javascript-executor`
- `codecrack/java-executor`

## 🛡️ Security Features

1. **Container Security**:
   - Non-root user execution
   - Read-only filesystem
   - No network access
   - Memory and CPU limits

2. **API Security**:
   - JWT token authentication
   - Rate limiting per endpoint
   - Input validation and sanitization
   - CORS configuration

3. **Code Execution**:
   - Timeout protection
   - Memory limits
   - Process isolation
   - Secure temp file handling

## 🧪 Testing

\`\`\`bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Test specific language execution
npm run test:python
npm run test:cpp
npm run test:javascript
npm run test:java
\`\`\`

## 📊 Monitoring

### Queue Monitoring
- Access queue statistics via `/api/admin/queue`
- Monitor processing times and failures
- View active, waiting, and completed jobs

### System Statistics
- User registration trends
- Submission patterns
- Performance metrics
- Error rates

## 🚀 Production Deployment

### Environment Setup
1. Use production MongoDB (MongoDB Atlas)
2. Use managed Redis (Redis Cloud)
3. Set secure JWT secrets
4. Configure proper CORS origins
5. Set up monitoring and logging

### Docker Deployment
\`\`\`bash
# Build production image
docker build -t codecrack-backend .

# Run with Docker Compose
docker-compose -f docker-compose.prod.yml up -d
\`\`\`

### Scaling Considerations
- Use Redis cluster for queue scaling
- Implement horizontal scaling for submission workers
- Use MongoDB replica sets for high availability
- Implement proper logging and monitoring

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🐛 Known Issues & Limitations

1. File I/O in code execution is limited for security
2. Network access is disabled in execution containers
3. Memory usage tracking could be more accurate
4. WebSocket support for real-time updates not implemented

## 🗺️ Roadmap

- [ ] WebSocket integration for real-time updates
- [ ] Contest system with time-based challenges
- [ ] Code plagiarism detection
- [ ] Multi-language support for UI
- [ ] Advanced analytics and insights
- [ ] Email notifications
- [ ] Password reset functionality
- [ ] Two-factor authentication
- [ ] API rate limiting per user
- [ ] Submission caching and optimization
