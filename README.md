# HireZen HRMS - Complete Platform

> A comprehensive Human Resource Management System with AI-powered interviews, real-time pipeline tracking, and modern recruitment workflows.

## 🏗️ Architecture Overview

This project is organized into separate frontend and backend directories for better maintainability and deployment flexibility.

```
hirezen-hrms/
├── frontend/           # React + TypeScript frontend
├── backend/            # Node.js + Express backend
├── api/               # Vercel serverless functions
├── .gitignore         # Git ignore rules
├── vercel.json        # Vercel deployment config
└── README.md          # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB Atlas account
- Vercel account (for deployment)
- Resend account (for emails)

### Local Development Setup

1. **Clone and setup:**
   ```bash
   git clone <your-repo-url>
   cd hirezen-hrms
   ```

2. **Frontend:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. **Backend:**
   ```bash
   cd ../backend
   npm install
   npm run dev
   ```

4. **Environment Variables:**
   - Copy `.env.example` to `.env` in both directories
   - Fill in your MongoDB URI, Resend API key, etc.

## 🎯 Features

### Core HRMS Features
- ✅ **Complete Recruitment Pipeline**: Job posting → Screening → Interviews → Offers
- ✅ **AI-Powered Interviews**: Automated question generation and evaluation
- ✅ **Video Recording**: WebRTC-based interview recording with storage
- ✅ **Real-time Tracking**: Live candidate progress monitoring
- ✅ **Activity Logging**: Complete audit trail of all actions
- ✅ **PDF Reports**: Professional interview result exports
- ✅ **Email Integration**: Automated notifications via Resend

### Technical Features
- ✅ **Modern Frontend**: React 18, TypeScript, Tailwind CSS, Shadcn/ui
- ✅ **Scalable Backend**: Node.js, Express, MongoDB
- ✅ **Real-time Updates**: Supabase realtime channels
- ✅ **File Storage**: MongoDB GridFS for videos and documents
- ✅ **Authentication**: JWT-based auth with Supabase
- ✅ **Deployment**: Vercel serverless with automatic scaling

## 📁 Directory Structure

### Frontend (`/frontend`)
```
frontend/
├── src/
│   ├── components/      # Reusable UI components
│   ├── pages/          # Route components
│   ├── hooks/          # Custom React hooks
│   ├── lib/            # Utilities
│   └── integrations/   # Supabase, MongoDB clients
├── public/             # Static assets
├── package.json        # Dependencies
└── README.md          # Frontend docs
```

### Backend (`/backend`)
```
backend/
├── email-server.js     # Main server file
├── routes/            # API route handlers
├── supabase/          # Supabase config and functions
├── package.json       # Dependencies
└── README.md         # Backend docs
```

### Vercel Functions (`/api`)
```
api/
└── email-server.js    # Serverless API functions
```

## 🔧 Environment Configuration

### Frontend (.env)
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_BASE_URL=http://localhost:3002
```

### Backend (.env)
```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/hirezen
DB_NAME=hirezen
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SUPABASE_SERVICE_ROLE_KEY=your-service-key
PORT=3002
```

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect Repository:**
   - Import your GitHub repo to Vercel
   - Vercel will auto-detect the configuration

2. **Set Environment Variables:**
   - Go to Project Settings → Environment Variables
   - Add all required variables

3. **Deploy:**
   - Push to main branch for automatic deployment
   - Frontend: `https://your-app.vercel.app`
   - API: `https://your-app.vercel.app/api/*`

### Manual Deployment

```bash
# Frontend
cd frontend && npm run build

# Backend (alternative to Vercel)
cd ../backend && npm start
```

## 📊 Database Setup

### MongoDB Atlas
1. Create a free cluster
2. Get connection string
3. Create database: `hirezen`
4. Collections will be auto-created

### Supabase
1. Create project at supabase.com
2. Get URL and API keys
3. Run migrations for user tables

## 🎨 UI/UX

- **Responsive Design**: Mobile-first approach
- **Dark Mode**: Automatic theme switching
- **Accessibility**: WCAG compliant
- **Performance**: Optimized loading and caching
- **Professional**: Enterprise-grade design system

## 🔒 Security

- Environment variable management
- Input validation and sanitization
- CORS configuration
- Secure API communication
- JWT authentication

## 📈 API Endpoints

### Interview Management
- `POST /api/interview-results` - Save interview results
- `GET /api/interview-results` - Get all results
- `GET /api/interview-results/:id` - Get specific result

### Activity Logs
- `GET /api/activity-logs` - Get activity logs
- `POST /api/activity-logs` - Save activity log
- `GET /api/activity-logs/:id/video` - Stream video

### Email Service
- `POST /api/send-email` - Send notifications

## 🧪 Development

```bash
# Frontend development
cd frontend && npm run dev

# Backend development
cd backend && npm run dev

# Full stack (requires both running)
# Frontend: http://localhost:5173
# Backend: http://localhost:3002
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature-name`
3. Make changes and test locally
4. Commit: `git commit -m "Add feature"`
5. Push: `git push origin feature-name`
6. Create Pull Request

## 📄 License

MIT License - see individual README files for details.

## 📞 Support

- **Issues**: GitHub Issues
- **Documentation**: Check individual README files
- **Community**: Join our discussions

## 🏆 Achievements

- ✅ Complete HRMS implementation
- ✅ AI interview integration
- ✅ Real-time pipeline tracking
- ✅ Production deployment ready
- ✅ Modern tech stack
- ✅ Scalable architecture
- ✅ Professional documentation

---

**Built with ❤️ for modern HR management**

🌟 **Ready to revolutionize recruitment workflows!**
