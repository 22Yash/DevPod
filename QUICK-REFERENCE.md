# Quick Reference Card

Quick commands and troubleshooting for DevPod setup.

---

## 🚀 Quick Start (5 minutes)

### First Time Setup

```bash
# 1. Clone and navigate
git clone https://github.com/YOUR_USERNAME/devpod.git
cd devpod

# 2. Run quick setup (Windows)
QUICK-SETUP.bat

# Or macOS/Linux
chmod +x QUICK-SETUP.sh
./QUICK-SETUP.sh

# 3. Configure environment
# Edit backend/.env with MongoDB URI and GitHub OAuth credentials
# Edit frontend/.env with API URL and GitHub Client ID

# 4. Start backend (Terminal 1)
cd backend
npm run server

# 5. Start frontend (Terminal 2)
cd frontend
npm run dev

# 6. Open browser
# http://localhost:5173
```

---

## 📋 Setup Checklist

- [ ] Node.js installed (`node --version`)
- [ ] Docker installed and running (`docker ps`)
- [ ] Git repository cloned
- [ ] `backend/.env` created with MongoDB URI and GitHub OAuth
- [ ] `frontend/.env` created with API URL
- [ ] Backend dependencies installed (`cd backend && npm install`)
- [ ] Frontend dependencies installed (`cd frontend && npm install`)
- [ ] Docker images built (`build-images.bat` or `./build-images.sh`)
- [ ] Backend running on port 4000
- [ ] Frontend running on port 5173
- [ ] Can login with GitHub
- [ ] Can launch templates

---

## 🔧 Common Commands

### Start Services

```bash
# Backend (Terminal 1)
cd backend
npm run server

# Frontend (Terminal 2)
cd frontend
npm run dev

# Access application
http://localhost:5173
```

### Build Docker Images

```bash
# Windows
build-images.bat

# macOS/Linux
./build-images.sh
```

### Check Status

```bash
# Docker images
docker images | grep devpod

# Running containers
docker ps

# Docker logs
docker logs [CONTAINER_ID]

# Backend running?
curl http://localhost:4000

# Frontend running?
curl http://localhost:5173
```

### Stop Services

```bash
# Stop backend: Ctrl+C in backend terminal
# Stop frontend: Ctrl+C in frontend terminal

# Stop all Docker containers
docker stop $(docker ps -q)

# Windows
docker ps -q | xargs docker stop
```

### Clean Up

```bash
# Remove all devpod containers
docker ps -a | grep devpod | awk '{print $1}' | xargs docker rm

# Remove all devpod images
docker images | grep devpod | awk '{print $3}' | xargs docker rmi

# Remove all devpod volumes
docker volume ls | grep devpod | awk '{print $2}' | xargs docker volume rm
```

---

## 🐛 Troubleshooting

### "Please login in a codeserver" Error

**Quick Fix:**
1. Open DevTools (F12)
2. Application → Cookies → Delete all
3. Refresh page
4. Login with GitHub again
5. Try launching template

**If still failing:**
- Check backend is running: `curl http://localhost:4000`
- Check MongoDB connection: `node backend/test-mongo.js`
- Check session cookie exists in DevTools
- Restart backend: Stop (Ctrl+C) and run `npm run server` again

### Port Already in Use

```bash
# Find process using port
# Windows
netstat -ano | findstr :4000

# macOS/Linux
lsof -i :4000

# Kill process (Windows - replace PID)
taskkill /PID [PID] /F

# macOS/Linux
kill -9 [PID]
```

### Docker Images Not Found

```bash
# Rebuild images
# Windows
build-images.bat

# macOS/Linux
./build-images.sh

# Verify
docker images | grep devpod
```

### MongoDB Connection Failed

```bash
# Test connection
cd backend
node -e "require('dotenv').config(); const m = require('mongoose'); m.connect(process.env.MONGODB_URI).then(() => console.log('✅ Connected')).catch(e => console.error('❌', e.message))"
```

**Check:**
- MONGODB_URI in backend/.env is correct
- MongoDB cluster is running
- IP whitelist includes your IP (or 0.0.0.0/0)
- Username/password are correct

### GitHub OAuth Error

**Check:**
- GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET in backend/.env
- GitHub OAuth App settings:
  - Homepage URL: `http://localhost:3000`
  - Callback URL: `http://localhost:3000/auth/callback`
- Restart backend after changing .env

### CORS Error / Cannot Connect to Backend

**Check:**
- VITE_API_URL in frontend/.env is `http://localhost:4000`
- Backend is running on port 4000
- FRONTEND_URL in backend/.env is `http://localhost:3000`
- Restart frontend after changing .env

### Docker Daemon Not Running

```bash
# Windows/macOS
# Open Docker Desktop application
# Wait for Docker to fully start

# Verify
docker ps
```

---

## 📁 Important Files

```
devpod/
├── backend/
│   ├── .env                          ← Create this (MongoDB, GitHub OAuth)
│   ├── package.json
│   ├── server.js
│   └── src/
│       ├── app.js                    ← Session configuration
│       ├── controllers/
│       │   └── authController.js     ← GitHub OAuth logic
│       ├── routes/
│       │   ├── authRoutes.js
│       │   └── workspacesRoutes.js   ← Launch endpoint
│       └── services/
│           └── dockerService.js      ← Container management
├── frontend/
│   ├── .env                          ← Create this (API URL, GitHub Client ID)
│   ├── package.json
│   └── src/
│       ├── pages/
│       │   ├── Dashboard/            ← Launch templates here
│       │   └── AuthCallback/         ← OAuth callback
│       └── components/
│           └── ProtectedRoute.jsx    ← Route protection
├── docker/
│   ├── python/Dockerfile
│   ├── nodejs/Dockerfile
│   ├── mern-template/Dockerfile
│   └── java/Dockerfile
├── docker-compose.yml
├── build-images.bat                  ← Build Docker images (Windows)
├── build-images.sh                   ← Build Docker images (macOS/Linux)
├── TEAM-SETUP-GUIDE.md               ← Full setup guide
├── CODESERVER-LOGIN-FIX.md           ← Troubleshooting guide
├── ENV-SETUP-TEMPLATE.md             ← Environment setup
└── QUICK-REFERENCE.md                ← This file
```

---

## 🔐 Environment Variables

### backend/.env

```env
MONGODB_URI=mongodb+srv://username:password@cluster0.jkaz2i5.mongodb.net/devpod
GITHUB_CLIENT_ID=Ov23lia1ACkI4M6uTO34
GITHUB_CLIENT_SECRET=fc02de7369ae3242306459856a3c72b40e196f2a
SESSION_SECRET=random-string-32-chars-long
PORT=4000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
DOCKER_HOST=tcp://host.docker.internal:2375  # Windows only
```

### frontend/.env

```env
VITE_API_URL=http://localhost:4000
VITE_GITHUB_CLIENT_ID=Ov23lia1ACkI4M6uTO34
VITE_GITHUB_CALLBACK_URL=http://localhost:3000/auth/callback
```

---

## 🌐 URLs

| Service | URL | Purpose |
|---------|-----|---------|
| Frontend | http://localhost:5173 | React app (dev) |
| Frontend | http://localhost:3000 | React app (docker) |
| Backend | http://localhost:4000 | Express API |
| Code-Server | http://localhost:[random] | IDE in container |
| MongoDB Atlas | https://cloud.mongodb.com | Database |
| GitHub OAuth | https://github.com/settings/developers | Authentication |

---

## 📊 Ports

| Port | Service | Status |
|------|---------|--------|
| 3000 | Frontend (Docker) | Used by docker-compose |
| 4000 | Backend | Must be running |
| 5173 | Frontend (Vite dev) | Must be running |
| 8080 | Code-Server (container) | Internal only |
| Random | Code-Server (host) | Mapped from 8080 |

---

## ✅ Success Indicators

When everything is working:

- ✅ Backend logs show: "Server running on port 4000"
- ✅ Frontend logs show: "Local: http://localhost:5173"
- ✅ Can login with GitHub
- ✅ Dashboard shows templates
- ✅ Clicking "Use Template" opens code-server
- ✅ Code-server loads without login prompt
- ✅ Can create files in code-server
- ✅ Docker containers are running: `docker ps`

---

## 🆘 Getting Help

1. **Check logs:**
   - Backend console
   - Frontend console (F12)
   - Docker logs: `docker logs [CONTAINER_ID]`

2. **Read guides:**
   - TEAM-SETUP-GUIDE.md - Full setup
   - CODESERVER-LOGIN-FIX.md - Troubleshooting
   - ENV-SETUP-TEMPLATE.md - Environment setup

3. **Verify prerequisites:**
   - Node.js: `node --version`
   - Docker: `docker ps`
   - MongoDB: Test connection
   - GitHub OAuth: Check credentials

4. **Try complete restart:**
   - Stop all services (Ctrl+C)
   - Stop Docker containers: `docker stop $(docker ps -q)`
   - Clear browser cookies (F12)
   - Restart backend and frontend
   - Try again

---

## 📞 Support Resources

- **Node.js:** https://nodejs.org/
- **Docker:** https://www.docker.com/
- **MongoDB Atlas:** https://www.mongodb.com/cloud/atlas
- **GitHub OAuth:** https://docs.github.com/en/developers/apps/building-oauth-apps
- **Express.js:** https://expressjs.com/
- **React:** https://react.dev/
- **Vite:** https://vitejs.dev/

---

**Last Updated:** March 2026
**Version:** 1.0.0
