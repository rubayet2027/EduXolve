# EduXolve Backend

AI-powered academic learning platform backend built with Node.js, Express, MongoDB, and Firebase Auth.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- Firebase project with Authentication enabled

### Installation

```bash
cd backend
npm install
```

### Configuration

1. **Environment Variables**
   
   Copy `.env` and configure:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/ai_learning_platform
   FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json
   ```

2. **Firebase Service Account**
   
   - Go to [Firebase Console](https://console.firebase.google.com)
   - Project Settings → Service Accounts
   - Generate New Private Key
   - Save as `firebase-service-account.json` in backend root
   - ⚠️ **NEVER commit this file to git**

### Running the Server

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

Server runs at: `http://localhost:5000`

## 📚 API Endpoints

### Public

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api` | API info |

### Protected (Requires Firebase Token)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/me` | Get current user info |
| GET | `/api/me/full` | Get full user profile |

### Admin Only

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/users` | List all users |

## 🔐 Authentication

All protected routes require a Firebase ID token in the Authorization header:

```
Authorization: Bearer <firebase_id_token>
```

### How it works:

1. Client authenticates with Firebase Auth
2. Client gets ID token from Firebase
3. Client sends token in Authorization header
4. Server verifies token with Firebase Admin SDK
5. Server finds/creates user in MongoDB
6. Server attaches user info to request

## 📁 Project Structure

```
backend/
├── src/
│   ├── app.js              # Express app config
│   ├── server.js           # Server startup
│   ├── config/
│   │   ├── db.js           # MongoDB connection
│   │   └── firebase.js     # Firebase Admin setup
│   ├── middlewares/
│   │   ├── auth.middleware.js   # Token verification
│   │   ├── role.middleware.js   # Role-based access
│   │   └── index.js
│   ├── models/
│   │   ├── User.js         # User schema
│   │   └── index.js
│   └── routes/
│       ├── health.routes.js
│       ├── user.routes.js
│       └── index.js
├── .env
├── .gitignore
├── firebase-service-account.json  (not in git)
└── package.json
```

## 🧪 Testing

### Test Health Check
```bash
curl http://localhost:5000/api/health
```

### Test Protected Route (with token)
```bash
curl -H "Authorization: Bearer YOUR_FIREBASE_TOKEN" http://localhost:5000/api/me
```

## 📝 User Roles

- **student** (default): Basic access
- **admin**: Full access to admin routes

Users are auto-created on first login with `student` role.

## 🛡️ Security Features

- Firebase token verification
- Auto user provisioning
- Role-based access control
- CORS protection
- Error handling without leaking stack traces in production
