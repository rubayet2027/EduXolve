# 🎓 EduXolve

> AI-Powered Academic Learning Platform

EduXolve is an intelligent educational platform that leverages AI to help students learn more effectively. Built with modern web technologies and powered by Google's Gemini AI.

![EduXolve](https://img.shields.io/badge/EduXolve-AI%20Learning-4ECDC4?style=for-the-badge)
![React](https://img.shields.io/badge/React-19.2.0-61DAFB?style=flat-square&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-8.0-47A248?style=flat-square&logo=mongodb)
![Firebase](https://img.shields.io/badge/Firebase-Auth-FFCA28?style=flat-square&logo=firebase)

## 🌐 Live Demo

- **Frontend**: [https://eduxolve.web.app](https://eduxolve.web.app)
- **Backend API**: [https://backend-phi-tan.vercel.app](https://backend-phi-tan.vercel.app)

### Demo Credentials

#### 👨‍💼 Admin Access
```
Email: admin@eduxolve.com
Password: Admin@123
```

#### 👨‍🎓 Student Access
- Sign up with any email/password
- Or use Google Sign-In

---

## ✨ Features

### 🔍 Semantic Search
- Search through uploaded academic content
- AI-powered relevance ranking
- Vector embeddings for accurate results

### 💬 AI Chat Assistant (Xolve)
- Context-aware conversations
- Answers based on uploaded materials
- Markdown rendering with code highlighting

### 📝 Content Generation
- Generate summaries, notes, and study guides
- Multiple output formats
- AI-powered content creation

### 📚 Content Management (Admin)
- Upload PDFs, DOCX, and TXT files
- Automatic text extraction
- Vector embedding generation
- Content organization with metadata

### 🔐 Authentication
- Firebase Authentication (Google + Email/Password)
- Role-based access control (Admin/Student)
- Secure JWT tokens for admin

---

## 🏗️ Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  React Client   │────▶│  Express API    │────▶│   MongoDB       │
│  (Firebase      │     │  (Vercel)       │     │   (Atlas)       │
│   Hosting)      │     │                 │     │                 │
└─────────────────┘     └────────┬────────┘     └─────────────────┘
                                 │
                                 ▼
                        ┌─────────────────┐
                        │   Gemini AI     │
                        │   (Google)      │
                        └─────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- Firebase Project
- Google AI API Key (Gemini)

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/EduXolve.git
cd EduXolve
```

### 2. Backend Setup

```bash
cd Eduxolve-Server/backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Configure environment variables
# Edit .env with your credentials
```

**Required Environment Variables:**
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/eduxolve
GEMINI_API_KEY=your_gemini_api_key
FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json
ADMIN_JWT_SECRET=your_secret_key
```

```bash
# Start development server
npm run dev
```

### 3. Frontend Setup

```bash
cd Eduxolve-CLient

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Configure environment variables
```

**Required Environment Variables:**
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

```bash
# Start development server
npm run dev
```

---

## 📁 Project Structure

```
EduXolve/
├── Eduxolve-CLient/          # React Frontend
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   │   ├── admin/        # Admin-specific components
│   │   │   ├── chat/         # Chat interface components
│   │   │   ├── common/       # Shared components (Navbar, Footer)
│   │   │   ├── dashboard/    # Dashboard components
│   │   │   ├── generate/     # Content generation components
│   │   │   ├── search/       # Search components
│   │   │   └── ui/           # Base UI components (Brutal design)
│   │   ├── pages/            # Page components
│   │   ├── services/         # API & auth services
│   │   ├── store/            # Zustand state management
│   │   └── styles/           # Global styles
│   └── public/
│
├── Eduxolve-Server/          # Node.js Backend
│   └── backend/
│       ├── src/
│       │   ├── config/       # DB, Firebase, Gemini config
│       │   ├── controllers/  # Route handlers
│       │   ├── middlewares/  # Auth & role middlewares
│       │   ├── models/       # MongoDB schemas
│       │   ├── routes/       # API routes
│       │   ├── services/     # Business logic
│       │   └── utils/        # Helper functions
│       └── uploads/          # Uploaded files
│
└── README.md
```

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| React 19 | UI Framework |
| Vite | Build Tool |
| TailwindCSS | Styling |
| Framer Motion | Animations |
| Zustand | State Management |
| React Router | Navigation |
| Firebase Auth | Authentication |

### Backend
| Technology | Purpose |
|------------|---------|
| Node.js | Runtime |
| Express | Web Framework |
| MongoDB | Database |
| Mongoose | ODM |
| Firebase Admin | Auth Verification |
| Gemini AI | AI Features |
| JWT | Admin Auth |

---

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/admin/login` | Admin login |
| POST | `/api/auth/verify` | Verify token |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/me` | Get current user |

### Search
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/search` | Semantic search |

### Chat
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/chat` | Send message to AI |

### Content (Admin)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/content` | List all content |
| POST | `/api/content/upload` | Upload content |
| DELETE | `/api/content/:id` | Delete content |

### Generate
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ai/generate` | Generate content |

---

## 🎨 Design System

EduXolve uses a **Soft Neubrutalism** design system:

- **Primary**: `#4ECDC4` (Teal)
- **Secondary**: `#FF6B6B` (Coral)
- **Accent**: `#FFE66D` (Yellow)
- **Background**: `#FFFDF8` (Cream)
- **Text**: `#111111` (Near Black)

Features:
- Bold borders (2-3px)
- Offset shadows
- Rounded corners (xl)
- High contrast

---

## 🚢 Deployment

### Frontend (Firebase Hosting)
```bash
cd Eduxolve-CLient
npm run build
firebase deploy --only hosting
```

### Backend (Vercel)
```bash
cd Eduxolve-Server/backend
vercel --prod
```

---

## 👥 Team

Built for **Hackathon 2026** 🏆

---

## 📄 License

MIT License - See [LICENSE](LICENSE) for details.

---

## 🙏 Acknowledgments

- [Google Gemini AI](https://ai.google.dev/)
- [Firebase](https://firebase.google.com/)
- [MongoDB Atlas](https://www.mongodb.com/atlas)
- [Vercel](https://vercel.com/)

---

<p align="center">
  Made with ❤️ by the EduXolve Team
</p>
