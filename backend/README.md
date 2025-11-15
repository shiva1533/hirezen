# HireZen HRMS - Backend

Node.js backend server for the HireZen HRMS platform with MongoDB integration and RESTful APIs.

## 🚀 Features

- **RESTful API**: Complete CRUD operations for HR data
- **MongoDB Integration**: Document storage for interview results and activity logs
- **Email Service**: Professional email notifications via Resend
- **Video Storage**: GridFS integration for interview recordings
- **Real-time Updates**: WebSocket support for live data
- **Authentication**: JWT-based auth with Supabase integration

## 🛠️ Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose/GridFS
- **Email**: Resend API
- **Deployment**: Vercel serverless functions
- **Security**: Helmet, CORS, rate limiting

## 📋 Prerequisites

- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- Resend account for emails
- Vercel account (for deployment)

## 🏃‍♂️ Local Development

```bash
# Install dependencies
npm install

# Set environment variables
cp .env.example .env
# Edit .env with your credentials

# Start development server
npm run dev

# For production build
npm run build
npm start
```

## 🔧 Environment Variables

Create a `.env` file in the backend directory:

```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/hirezen
DB_NAME=hirezen

# Email Service
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Supabase (for auth/file storage)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Server
PORT=3002
NODE_ENV=development
```

## 📁 Project Structure

```
backend/
├── email-server.js           # Main server file
├── routes/
│   └── videoUpload.js       # Video upload routes
├── supabase/
│   ├── config.toml          # Supabase configuration
│   ├── functions/          # Edge functions
│   └── migrations/         # Database migrations
├── package.json            # Dependencies and scripts
└── README.md              # This file
```

## 🎯 API Endpoints

### Interview Results
```
POST   /interview-results          # Save interview results
GET    /interview-results          # Get all results
GET    /interview-results/:id      # Get specific result
```

### Activity Logs
```
GET    /activity-logs              # Get activity logs
POST   /activity-logs              # Save activity log
GET    /activity-logs/:id/video    # Stream video file
```

### Email Service
```
POST   /send-email                 # Send emails
```

### Health Check
```
GET    /health                     # Server health status
```

## 🔄 Data Flow

1. **Interview Completion** → Frontend posts to `/interview-results`
2. **Results Storage** → MongoDB `interview_results` collection
3. **Activity Logging** → MongoDB `activity_logs` collection
4. **Video Storage** → MongoDB GridFS or server logs
5. **Email Notifications** → Resend API integration
6. **Real-time Updates** → Supabase realtime channels

## 📊 Database Schema

### Collections

#### `interview_results`
```javascript
{
  _id: ObjectId,
  id: "custom_id",
  candidate_name: "John Doe",
  candidate_email: "john@example.com",
  job_position: "Software Engineer",
  score: 85,
  interview_type: "video_interview",
  questions: [...],
  answers: [...],
  evaluation: {...},
  video_recorded: true,
  created_at: Date,
  status: "completed"
}
```

#### `activity_logs`
```javascript
{
  _id: ObjectId,
  id: "custom_id",
  candidate_name: "John Doe",
  candidate_email: "john@example.com",
  job_position: "Software Engineer",
  old_stage: "hr",
  new_stage: "written_test",
  old_stage_label: "Screening Test",
  new_stage_label: "Demo Round",
  changed_by_name: "HR Manager",
  interview_score: 85,
  video_data: Binary, // GridFS
  has_video: true,
  created_at: Date
}
```

## 🚀 Deployment

### Vercel Deployment (Recommended)

1. **Connect GitHub Repository**
2. **Set Environment Variables** in Vercel Dashboard
3. **Deploy**: Automatic deployment on push

### Manual Deployment

```bash
# Build the application
npm run build

# Start production server
npm start
```

## 🔒 Security Features

- **CORS Configuration**: Domain whitelisting
- **Rate Limiting**: API request throttling
- **Input Validation**: Data sanitization
- **Authentication**: JWT token validation
- **HTTPS**: SSL certificate management

## 📈 Performance Optimizations

- **Connection Pooling**: MongoDB connection reuse
- **Caching**: Redis integration ready
- **Compression**: Response gzip compression
- **Error Handling**: Graceful error responses
- **Logging**: Structured logging with Winston

## 🧪 Testing

```bash
# Unit tests
npm run test

# Integration tests
npm run test:integration

# Load testing
npm run test:load
```

## 🔍 Monitoring

- **Health Checks**: `/health` endpoint
- **Metrics**: Response times and error rates
- **Logging**: Structured logs for debugging
- **Alerts**: Error notification system

## 🤝 API Documentation

### Swagger/OpenAPI
Access API documentation at `/api-docs` when running locally.

### Postman Collection
Import the provided Postman collection for testing all endpoints.

## 📞 Support

- **Issues**: GitHub Issues
- **Documentation**: In-line code comments
- **Logs**: Check server logs for debugging

## 🔄 CI/CD

### GitHub Actions
Automated testing and deployment pipelines included.

### Deployment Scripts
```bash
npm run deploy     # Deploy to staging
npm run deploy:prod # Deploy to production
```

## 📄 License

MIT License - see LICENSE file for details.

---

**Backend service for the complete HireZen HRMS ecosystem** 🚀