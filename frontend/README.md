# HireZen HRMS - Frontend

Complete HRMS platform built with React, TypeScript, and modern web technologies.

## 🚀 Features

- **Complete Recruitment Workflow**: From job posting to offer letters
- **AI-Powered Interviews**: Video recording and automated evaluation
- **Real-time Pipeline Tracking**: Live candidate progress monitoring
- **Advanced Analytics**: Comprehensive reporting and insights
- **Professional UI**: Modern, responsive design with dark mode support

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI Framework**: Tailwind CSS, Shadcn/ui
- **State Management**: TanStack Query, Zustand
- **Backend Integration**: RESTful APIs, MongoDB
- **Deployment**: Vercel (serverless)

## 📋 Prerequisites

- Node.js 18+
- npm or yarn or bun

## 🏃‍♂️ Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 🔧 Environment Variables

Create a `.env.local` file in the frontend directory:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_BASE_URL=http://localhost:3002
```

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ui/             # Shadcn/ui components
│   │   ├── layout/         # Layout components
│   │   ├── dashboard/      # Dashboard widgets
│   │   ├── jobs/           # Job-related components
│   │   └── pipeline/       # Pipeline visualization
│   ├── pages/              # Page components
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utilities and configurations
│   └── integrations/       # External service integrations
├── public/                 # Static assets
└── package.json
```

## 🎯 Key Components

### Pages
- **Dashboard**: Analytics and metrics overview
- **Jobs**: Job posting and management
- **Pipeline**: Candidate tracking and stages
- **Activity Log**: Real-time activity monitoring
- **Written Test**: Interview result management

### Features
- **AI Interviews**: Automated question generation and evaluation
- **Video Recording**: WebRTC-based interview recording
- **PDF Export**: Professional report generation
- **Email Integration**: Automated notifications
- **Real-time Updates**: Live data synchronization

## 🚀 Deployment

This frontend is optimized for Vercel deployment with automatic builds and serverless functions.

### Vercel Configuration

The project includes `vercel.json` for:
- Static site generation
- API route handling
- Environment variable management
- Build optimizations

## 📊 Database Integration

- **Primary**: MongoDB for interview data and activity logs
- **Secondary**: Supabase for user management and file storage
- **Real-time**: WebSocket connections for live updates

## 🎨 UI/UX Features

- **Responsive Design**: Mobile-first approach
- **Dark Mode**: System preference detection
- **Accessibility**: WCAG compliant components
- **Performance**: Optimized loading and caching
- **Professional**: Enterprise-grade design system

## 🔒 Security

- Environment variable management
- Secure API communication
- Input validation and sanitization
- CORS configuration
- Authentication integration

## 📈 Performance

- Code splitting and lazy loading
- Image optimization
- Caching strategies
- Bundle analysis
- CDN integration

## 🧪 Testing

```bash
# Run tests
npm run test

# Run tests with coverage
npm run test:coverage

# E2E testing
npm run test:e2e
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Contact the development team
- Check the documentation

---

**Built with ❤️ for modern HR management**
