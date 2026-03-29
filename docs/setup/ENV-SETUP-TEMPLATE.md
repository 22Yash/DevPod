# Environment Setup Template

This document provides step-by-step instructions for setting up environment variables for the DevPod project.

---

## Overview

The project requires environment variables in two locations:
1. `backend/.env` - Backend server configuration
2. `frontend/.env` - Frontend application configuration

These files are **NOT** committed to git (they're in `.gitignore`) for security reasons.

---

## Backend Environment Setup

### File Location
```
devpod/
└── backend/
    └── .env  ← Create this file
```

### Step 1: Create the File

**Windows (Command Prompt):**
```cmd
cd backend
type nul > .env
```

**macOS/Linux:**
```bash
cd backend
touch .env
```

### Step 2: Get MongoDB URI

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign in or create account
3. Create a new project (or use existing)
4. Create a new cluster (free tier is fine)
5. Click "Connect" button
6. Choose "Drivers" → "Node.js"
7. Copy the connection string

**Example:**
```
mongodb+srv://username:password@cluster0.jkaz2i5.mongodb.net/devpod?retryWrites=true&w=majority
```

**Important:** Replace `username` and `password` with your MongoDB credentials

### Step 3: Get GitHub OAuth Credentials

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "OAuth Apps" → "New OAuth App"
3. Fill in the form:
   - **Application name:** DevPod
   - **Homepage URL:** `http://localhost:5173`
   - **Authorization callback URL:** `http://localhost:5173/auth/callback`
4. Click "Register application"
5. Copy **Client ID** and **Client Secret**

**Important:** Keep Client Secret private! Never commit it to git.

### Step 4: Generate Session Secret

Generate a random string for session security:

**Windows (PowerShell):**
```powershell
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | % {[char]$_})
```

**macOS/Linux:**
```bash
openssl rand -base64 32
```

**Example output:**
```
aB3cD4eF5gH6iJ7kL8mN9oP0qR1sT2uV3wX4yZ5
```

### Step 5: Create backend/.env

Open `backend/.env` in your text editor and add:

```env
# MongoDB Configuration
# Get this from MongoDB Atlas connection string
MONGODB_URI=mongodb+srv://username:password@cluster0.jkaz2i5.mongodb.net/devpod?retryWrites=true&w=majority

# GitHub OAuth Configuration
# Get these from https://github.com/settings/developers
GITHUB_CLIENT_ID=Ov23lia1ACkI4M6uTO34
GITHUB_CLIENT_SECRET=fc02de7369ae3242306459856a3c72b40e196f2a

# Session Configuration
# Generate a random string using the command above
SESSION_SECRET=aB3cD4eF5gH6iJ7kL8mN9oP0qR1sT2uV3wX4yZ5

# Server Configuration
PORT=4000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Docker Configuration (Windows only)
DOCKER_HOST=tcp://host.docker.internal:2375
```

### Step 6: Verify backend/.env

```bash
# Check file was created
cat backend/.env  # macOS/Linux
type backend\.env  # Windows

# Should show all variables above
```

---

## Frontend Environment Setup

### File Location
```
devpod/
└── frontend/
    └── .env  ← Create this file
```

### Step 1: Create the File

**Windows (Command Prompt):**
```cmd
cd frontend
type nul > .env
```

**macOS/Linux:**
```bash
cd frontend
touch .env
```

### Step 2: Create frontend/.env

Open `frontend/.env` in your text editor and add:

```env
# Backend API URL
# Must match the backend PORT from backend/.env
VITE_API_URL=http://localhost:4000

# GitHub OAuth Configuration
# Must match the GitHub OAuth App you created
VITE_GITHUB_CLIENT_ID=Ov23lia1ACkI4M6uTO34

# GitHub OAuth Callback URL
# Must match the Authorization callback URL in GitHub OAuth App
VITE_GITHUB_CALLBACK_URL=http://localhost:5173/auth/callback
```

### Step 3: Verify frontend/.env

```bash
# Check file was created
cat frontend/.env  # macOS/Linux
type frontend\.env  # Windows

# Should show all variables above
```

---

## Verification Checklist

### Backend Environment

- [ ] `backend/.env` file exists
- [ ] `MONGODB_URI` is set and valid
- [ ] `GITHUB_CLIENT_ID` is set
- [ ] `GITHUB_CLIENT_SECRET` is set
- [ ] `SESSION_SECRET` is set to a random string
- [ ] `PORT=4000`
- [ ] `NODE_ENV=development`
- [ ] `FRONTEND_URL=http://localhost:5173`
- [ ] (Windows only) `DOCKER_HOST=tcp://host.docker.internal:2375`

### Frontend Environment

- [ ] `frontend/.env` file exists
- [ ] `VITE_API_URL=http://localhost:4000`
- [ ] `VITE_GITHUB_CLIENT_ID` matches GitHub OAuth App
- [ ] `VITE_GITHUB_CALLBACK_URL=http://localhost:5173/auth/callback`

### Test Configuration

```bash
# Test backend can read .env
cd backend
node -e "require('dotenv').config(); console.log('MONGODB_URI:', process.env.MONGODB_URI.substring(0, 50) + '...')"

# Should output something like:
# MONGODB_URI: mongodb+srv://username:password@cluster0...
```

---

## Common Issues

### Issue: "Cannot find module 'dotenv'"

**Solution:**
```bash
cd backend
npm install dotenv
```

### Issue: MongoDB Connection Failed

**Check:**
1. `MONGODB_URI` is correct (copy from MongoDB Atlas)
2. Username and password are correct
3. IP whitelist in MongoDB Atlas includes your IP (or 0.0.0.0/0 for development)
4. MongoDB cluster is running

### Issue: GitHub OAuth Error

**Check:**
1. `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` are correct
2. GitHub OAuth App settings:
   - Homepage URL: `http://localhost:5173`
   - Authorization callback URL: `http://localhost:5173/auth/callback`
3. Both backend and frontend have matching Client ID

### Issue: "CORS error" or "Cannot connect to backend"

**Check:**
1. `VITE_API_URL` in frontend/.env is `http://localhost:4000`
2. Backend is running on port 4000
3. `FRONTEND_URL` in backend/.env is `http://localhost:5173`

---

## Security Best Practices

### DO:
- ✅ Keep `.env` files in `.gitignore`
- ✅ Use strong random strings for `SESSION_SECRET`
- ✅ Rotate `GITHUB_CLIENT_SECRET` if compromised
- ✅ Use environment-specific values (dev, staging, production)
- ✅ Share `.env.example` template with team (without secrets)

### DON'T:
- ❌ Commit `.env` files to git
- ❌ Share `.env` files via email or chat
- ❌ Use same secrets across environments
- ❌ Use weak or predictable session secrets
- ❌ Hardcode secrets in code

---

## Team Collaboration

### For Team Lead:

1. Create `.env.example` files (without secrets):

**backend/.env.example:**
```env
MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@cluster0.jkaz2i5.mongodb.net/devpod?retryWrites=true&w=majority
GITHUB_CLIENT_ID=YOUR_GITHUB_CLIENT_ID
GITHUB_CLIENT_SECRET=YOUR_GITHUB_CLIENT_SECRET
SESSION_SECRET=your-super-secret-random-string-change-this-in-production-12345
PORT=4000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
DOCKER_HOST=tcp://host.docker.internal:2375
```

**frontend/.env.example:**
```env
VITE_API_URL=http://localhost:4000
VITE_GITHUB_CLIENT_ID=YOUR_GITHUB_CLIENT_ID
VITE_GITHUB_CALLBACK_URL=http://localhost:5173/auth/callback
```

2. Commit `.env.example` files to git
3. Share actual `.env` values securely (e.g., password manager, secure document)

### For Team Members:

1. Clone repository
2. Copy `.env.example` to `.env`:
   ```bash
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   ```
3. Fill in actual values from team lead
4. Never commit `.env` files

---

## Production Deployment

When deploying to production, update environment variables:

**Backend Production:**
```env
MONGODB_URI=mongodb+srv://prod-user:prod-pass@prod-cluster.mongodb.net/devpod
GITHUB_CLIENT_ID=prod-client-id
GITHUB_CLIENT_SECRET=prod-client-secret
SESSION_SECRET=prod-super-secret-random-string-change-this
PORT=4000
NODE_ENV=production
FRONTEND_URL=https://yourdomain.com
DOCKER_HOST=unix:///var/run/docker.sock
```

**Frontend Production:**
```env
VITE_API_URL=https://api.yourdomain.com
VITE_GITHUB_CLIENT_ID=prod-client-id
VITE_GITHUB_CALLBACK_URL=https://yourdomain.com/auth/callback
```

---

## Quick Reference

### Get MongoDB URI
1. MongoDB Atlas → Connect → Drivers → Node.js
2. Copy connection string
3. Replace `<username>` and `<password>`

### Get GitHub OAuth Credentials
1. GitHub Settings → Developer settings → OAuth Apps
2. Create new OAuth App
3. Copy Client ID and Client Secret

### Generate Session Secret
```bash
# macOS/Linux
openssl rand -base64 32

# Windows PowerShell
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | % {[char]$_})
```

### Verify Setup
```bash
# Backend
cd backend
npm run server

# Frontend (new terminal)
cd frontend
npm run dev

# Open browser
http://localhost:5173
```

---

**Last Updated:** March 2026
**Version:** 1.0.0
