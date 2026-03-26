# Complete Team Setup Guide - DevPod Project

This guide walks through setting up the entire DevPod project on a new machine from scratch, including Docker image building and fixing the "please login in a codeserver" error.

---

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Step 1: Clone Repository](#step-1-clone-repository)
3. [Step 2: Environment Configuration](#step-2-environment-configuration)
4. [Step 3: Install Dependencies](#step-3-install-dependencies)
5. [Step 4: Build Docker Images](#step-4-build-docker-images)
6. [Step 5: Start Services](#step-5-start-services)
7. [Step 6: Verify Setup](#step-6-verify-setup)
8. [Troubleshooting](#troubleshooting)
9. [Common Issues & Fixes](#common-issues--fixes)

---

## Prerequisites

Before starting, ensure your machine has:

### Required Software
- **Git** - Version control
  - Download: https://git-scm.com/download/win (Windows)
  - Verify: `git --version`

- **Node.js & npm** - JavaScript runtime and package manager
  - Download: https://nodejs.org/ (LTS version recommended)
  - Verify: `node --version` and `npm --version`

- **Docker Desktop** - Container platform
  - Download: https://www.docker.com/products/docker-desktop
  - Verify: `docker --version` and `docker run hello-world`
  - **Important**: Docker daemon must be running before proceeding

- **MongoDB Atlas Account** - Cloud database
  - Sign up: https://www.mongodb.com/cloud/atlas
  - Create a free cluster
  - Get connection string (will be used in .env)

- **GitHub OAuth App** - For authentication
  - Go to: https://github.com/settings/developers
  - Create new OAuth App
  - Get Client ID and Client Secret

### System Requirements
- **RAM**: Minimum 8GB (16GB recommended for running multiple containers)
- **Disk Space**: At least 20GB free
- **OS**: Windows 10/11, macOS, or Linux

---

## Step 1: Clone Repository

```bash
# Navigate to your desired directory
cd C:\Users\YourUsername\Projects  # Windows
# or
cd ~/Projects  # macOS/Linux

# Clone the repository
git clone https://github.com/YOUR_USERNAME/devpod.git
cd devpod

# Verify structure
dir  # Windows
# or
ls -la  # macOS/Linux
```

Expected structure:
```
devpod/
├── frontend/
├── backend/
├── docker/
├── docker-compose.yml
├── build-images.bat (Windows)
├── build-images.sh (macOS/Linux)
└── README.md
```

---

## Step 2: Environment Configuration

### 2.1 Backend Environment (.env)

Create `backend/.env` file:

```bash
# Navigate to backend directory
cd backend

# Create .env file (Windows)
type nul > .env

# or macOS/Linux
touch .env
```

Add the following content to `backend/.env`:

```env
# MongoDB Configuration
MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@cluster0.jkaz2i5.mongodb.net/devpod?retryWrites=true&w=majority

# GitHub OAuth Configuration
GITHUB_CLIENT_ID=YOUR_GITHUB_CLIENT_ID
GITHUB_CLIENT_SECRET=YOUR_GITHUB_CLIENT_SECRET

# Session Configuration
SESSION_SECRET=your-super-secret-random-string-change-this-in-production-12345

# Server Configuration
PORT=4000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Docker Configuration (for Windows)
DOCKER_HOST=tcp://host.docker.internal:2375
```

**How to get these values:**

1. **MONGODB_URI**:
   - Go to MongoDB Atlas: https://cloud.mongodb.com
   - Click "Connect" on your cluster
   - Choose "Drivers" → "Node.js"
   - Copy connection string
   - Replace `<username>` and `<password>` with your credentials

2. **GITHUB_CLIENT_ID & GITHUB_CLIENT_SECRET**:
   - Go to: https://github.com/settings/developers
   - Click "New OAuth App"
   - Fill in:
     - Application name: "DevPod"
     - Homepage URL: `http://localhost:3000`
     - Authorization callback URL: `http://localhost:3000/auth/callback`
   - Copy Client ID and Client Secret

### 2.2 Frontend Environment (.env)

Create `frontend/.env` file:

```bash
# Navigate to frontend directory
cd ../frontend

# Create .env file (Windows)
type nul > .env

# or macOS/Linux
touch .env
```

Add the following content to `frontend/.env`:

```env
VITE_API_URL=http://localhost:4000
VITE_GITHUB_CLIENT_ID=YOUR_GITHUB_CLIENT_ID
VITE_GITHUB_CALLBACK_URL=http://localhost:3000/auth/callback
```

---

## Step 3: Install Dependencies

### 3.1 Backend Dependencies

```bash
# From project root
cd backend
npm install
```

Expected output: `added XXX packages`

### 3.2 Frontend Dependencies

```bash
# From project root
cd ../frontend
npm install
```

Expected output: `added XXX packages`

### 3.3 Verify Installation

```bash
# Check backend
cd ../backend
npm list express mongoose dockerode

# Check frontend
cd ../frontend
npm list react react-router-dom
```

---

## Step 4: Build Docker Images

This step creates the Docker images for Python, Node.js, MERN, and Java templates.

### 4.1 Ensure Docker is Running

```bash
# Verify Docker daemon is running
docker ps

# If error, start Docker Desktop and wait 30 seconds, then retry
```

### 4.2 Build Images

**For Windows:**

```bash
# From project root
build-images.bat
```

**For macOS/Linux:**

```bash
# From project root
chmod +x build-images.sh
./build-images.sh
```

**What this does:**
- Builds `devpod-python:latest` from `docker/python/Dockerfile`
- Builds `devpod-nodejs:latest` from `docker/nodejs/Dockerfile`
- Builds `devpod-mern:latest` from `docker/mern-template/Dockerfile`
- Builds `devpod-java:latest` from `docker/java/Dockerfile`

**Expected output:**
```
Building devpod-python:latest...
[+] Building 45.2s (XX/XX)
...
Successfully tagged devpod-python:latest

Building devpod-nodejs:latest...
...
Successfully tagged devpod-nodejs:latest

Building devpod-mern:latest...
...
Successfully tagged devpod-mern:latest

Building devpod-java:latest...
...
Successfully tagged devpod-java:latest
```

### 4.3 Verify Images

```bash
docker images | grep devpod
```

Expected output:
```
devpod-python      latest    XXXXXXXXX   XX seconds ago   XXX MB
devpod-nodejs      latest    XXXXXXXXX   XX seconds ago   XXX MB
devpod-mern        latest    XXXXXXXXX   XX seconds ago   XXX MB
devpod-java        latest    XXXXXXXXX   XX seconds ago   XXX MB
```

---

## Step 5: Start Services

### 5.1 Start Backend

```bash
# From project root
cd backend
npm run server
```

Expected output:
```
🚀 Server running on port 4000
✅ Connected to MongoDB
🐳 Docker connection established
```

**Keep this terminal open!**

### 5.2 Start Frontend (New Terminal)

```bash
# From project root (new terminal/command prompt)
cd frontend
npm run dev
```

Expected output:
```
  VITE v7.1.2  ready in XXX ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

**Keep this terminal open!**

### 5.3 Access the Application

Open your browser and go to:
```
http://localhost:5173
```

You should see the DevPod landing page with "Login with GitHub" button.

---

## Step 6: Verify Setup

### 6.1 Test Authentication

1. Click "Login with GitHub" button
2. Authorize the application
3. You should be redirected to Dashboard
4. Verify you see your username in the top-right corner

### 6.2 Test Template Launch

1. On Dashboard, click "Use" on any template (e.g., Python Development)
2. A new tab should open with "Loading IDE..."
3. After 5-10 seconds, code-server should load
4. You should see the code-server interface with a file explorer

### 6.3 Check Logs

**Backend logs should show:**
```
🚀 Launch request from user [userId]: { template: 'python', name: 'My Python Workspace' }
🐳 Checking if image devpod-python:latest exists...
✅ Image found
📦 Creating volume: devpod-[workspaceId]
🚀 Creating container...
✅ Container started: [containerId]
🌐 IDE available at: http://localhost:[randomPort]
```

**Frontend console should show:**
```
✅ Workspace launched successfully
🔗 Opening IDE at: http://localhost:[randomPort]
```

---

## Troubleshooting

### Issue: "Please login in a codeserver" Error

This error occurs when the session is lost or not properly established. Follow these steps:

#### Fix 1: Clear Session and Re-login

1. Open browser DevTools (F12)
2. Go to Application → Cookies
3. Delete all cookies for `localhost`
4. Go to http://localhost:5173
5. Click "Login with GitHub" again
6. Try launching template again

#### Fix 2: Verify Backend Session Configuration

Check `backend/.env`:
```env
SESSION_SECRET=your-super-secret-random-string-change-this-in-production-12345
MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@cluster0.jkaz2i5.mongodb.net/devpod?retryWrites=true&w=majority
```

Restart backend:
```bash
# Stop backend (Ctrl+C)
# Then restart
npm run server
```

#### Fix 3: Check MongoDB Connection

```bash
# Test MongoDB connection
# In backend directory, create test.js:
const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB error:', err.message));
```

Run it:
```bash
node test.js
```

#### Fix 4: Verify CORS Configuration

Check `backend/src/app.js` has:
```javascript
app.use(cors({ 
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true
}));
```

#### Fix 5: Check Session Cookie

1. Open browser DevTools (F12)
2. Go to Application → Cookies → http://localhost:5173
3. Look for `connect.sid` cookie
4. If missing, session is not being created
5. Check backend logs for authentication errors

---

## Common Issues & Fixes

### Issue: Docker Images Not Found

**Error:** `Error: No such image: devpod-python:latest`

**Solution:**
```bash
# Rebuild images
# Windows
build-images.bat

# macOS/Linux
./build-images.sh

# Verify
docker images | grep devpod
```

### Issue: Port Already in Use

**Error:** `Error: listen EADDRINUSE: address already in use :::4000`

**Solution:**
```bash
# Find process using port 4000
# Windows
netstat -ano | findstr :4000

# macOS/Linux
lsof -i :4000

# Kill process (Windows - replace PID)
taskkill /PID [PID] /F

# macOS/Linux
kill -9 [PID]
```

### Issue: MongoDB Connection Failed

**Error:** `MongooseError: connect ECONNREFUSED`

**Solution:**
1. Verify MongoDB Atlas cluster is running
2. Check MONGODB_URI in `backend/.env`
3. Verify IP whitelist in MongoDB Atlas (add 0.0.0.0/0 for development)
4. Test connection:
   ```bash
   # Windows
   ping cluster0.jkaz2i5.mongodb.net
   ```

### Issue: GitHub OAuth Error

**Error:** `GitHub OAuth error: invalid_request`

**Solution:**
1. Verify GitHub OAuth App settings:
   - Homepage URL: `http://localhost:3000`
   - Callback URL: `http://localhost:3000/auth/callback`
2. Verify `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` in `backend/.env`
3. Restart backend after changing .env

### Issue: Docker Daemon Not Running

**Error:** `Cannot connect to Docker daemon`

**Solution:**
1. Open Docker Desktop application
2. Wait for Docker to fully start (check system tray)
3. Verify: `docker ps`
4. Retry your command

### Issue: Frontend Can't Connect to Backend

**Error:** `Failed to fetch` or `CORS error`

**Solution:**
1. Verify backend is running: `http://localhost:4000`
2. Check `VITE_API_URL` in `frontend/.env`: should be `http://localhost:4000`
3. Restart frontend: Stop (Ctrl+C) and run `npm run dev` again

### Issue: Code-Server Won't Load

**Error:** `ERR_CONNECTION_REFUSED` or blank page

**Solution:**
1. Check backend logs for container creation errors
2. Verify Docker container is running:
   ```bash
   docker ps | grep devpod
   ```
3. Check container logs:
   ```bash
   docker logs [CONTAINER_ID]
   ```
4. Verify port is accessible:
   ```bash
   # Windows
   netstat -ano | findstr :[PORT]
   ```

---

## Quick Reference Commands

### Start Development Environment

```bash
# Terminal 1: Backend
cd backend
npm run server

# Terminal 2: Frontend
cd frontend
npm run dev

# Open browser
http://localhost:5173
```

### Build Docker Images

```bash
# Windows
build-images.bat

# macOS/Linux
./build-images.sh
```

### Check Services Status

```bash
# Docker images
docker images | grep devpod

# Running containers
docker ps

# Backend logs
# (check terminal where backend is running)

# Frontend logs
# (check terminal where frontend is running)
```

### Clean Up

```bash
# Stop all containers
docker stop $(docker ps -q)

# Remove all devpod containers
docker ps -a | grep devpod | awk '{print $1}' | xargs docker rm

# Remove all devpod images
docker images | grep devpod | awk '{print $3}' | xargs docker rmi

# Remove all devpod volumes
docker volume ls | grep devpod | awk '{print $2}' | xargs docker volume rm
```

---

## Next Steps

Once setup is complete:

1. **Create a Workspace**: Click "Create Workspace" on Dashboard
2. **Use a Template**: Click "Use" on any template to launch code-server
3. **Explore Features**: Try creating files, installing packages, etc.
4. **Share Workspace**: Use the share feature to collaborate with team members

---

## Support

If you encounter issues not covered here:

1. Check backend logs for error messages
2. Check browser console (F12) for frontend errors
3. Check Docker logs: `docker logs [CONTAINER_ID]`
4. Verify all environment variables are set correctly
5. Ensure all prerequisites are installed and running

---

## Team Collaboration Tips

### For Team Members Setting Up

1. Each team member should follow this guide completely
2. Use the same GitHub OAuth App credentials (provided by team lead)
3. Each team member needs their own MongoDB Atlas account OR use shared cluster
4. Share the `.env` template (without secrets) for consistency

### Sharing Environment Variables Securely

Create a `backend/.env.example`:
```env
MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@cluster0.jkaz2i5.mongodb.net/devpod?retryWrites=true&w=majority
GITHUB_CLIENT_ID=YOUR_GITHUB_CLIENT_ID
GITHUB_CLIENT_SECRET=YOUR_GITHUB_CLIENT_SECRET
SESSION_SECRET=your-super-secret-random-string-change-this-in-production-12345
PORT=4000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
DOCKER_HOST=tcp://host.docker.internal:2375
```

Commit `.env.example` to git, but add `.env` to `.gitignore`.

---

**Last Updated:** March 2026
**Version:** 1.0.0
