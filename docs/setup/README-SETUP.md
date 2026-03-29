# DevPod Project - Complete Setup Documentation

Welcome! This is your complete guide to setting up the DevPod project on your machine.

---

## 🎯 Quick Start (Choose Your Path)

### Path 1: Automated Setup (Fastest - 15 minutes)

**Windows:**
```bash
scripts/setup/QUICK-SETUP.bat
```

**macOS/Linux:**
```bash
chmod +x scripts/setup/QUICK-SETUP.sh
./scripts/setup/QUICK-SETUP.sh
```

Then follow: **ENV-SETUP-TEMPLATE.md** to configure environment variables.

### Path 2: Manual Setup (Detailed - 30-45 minutes)

Follow: **TEAM-SETUP-GUIDE.md** step-by-step.

### Path 3: Troubleshooting (If you have errors)

Follow: **CODESERVER-LOGIN-FIX.md** for the "please login in a codeserver" error.

---

## 📚 Documentation Guide

### For First-Time Setup

Start with one of these:

1. **TEAM-SETUP-GUIDE.md** ⭐ RECOMMENDED
   - Complete step-by-step guide
   - Covers everything from prerequisites to verification
   - Includes troubleshooting
   - Time: 30-45 minutes

2. **scripts/setup/QUICK-SETUP.bat** (Windows) or **scripts/setup/QUICK-SETUP.sh** (macOS/Linux)
   - Automated setup script
   - Installs dependencies and builds Docker images
   - Time: 10-15 minutes

### For Configuration

3. **ENV-SETUP-TEMPLATE.md**
   - How to set up environment variables
   - How to get MongoDB URI
   - How to get GitHub OAuth credentials
   - Time: 10-15 minutes

### For Troubleshooting

4. **CODESERVER-LOGIN-FIX.md**
   - Specific fix for "please login in a codeserver" error
   - Diagnostic steps
   - Advanced debugging
   - Time: 5-25 minutes

### For Quick Reference

5. **QUICK-REFERENCE.md**
   - Commands cheat sheet
   - Common issues and fixes
   - URLs and ports
   - Time: 1-5 minutes per lookup

### For Navigation

6. **SETUP-DOCUMENTS-SUMMARY.md**
   - Overview of all documents
   - Decision tree for which document to read
   - Reading order by scenario
   - Time: 2-3 minutes

### For Team Leads

7. **TEAM-LEAD-CHECKLIST.md**
   - Checklist for distributing setup to team
   - Credentials management
   - Verification procedures
   - Time: Varies

---

## 🚀 5-Minute Quick Start

### Prerequisites Check

```bash
# Check Node.js
node --version

# Check Docker
docker --version
docker ps

# Check Git
git --version
```

### Clone Repository

```bash
git clone https://github.com/YOUR_USERNAME/devpod.git
cd devpod
```

### Run Setup Script

**Windows:**
```bash
scripts/setup/QUICK-SETUP.bat
```

**macOS/Linux:**
```bash
chmod +x scripts/setup/QUICK-SETUP.sh
./scripts/setup/QUICK-SETUP.sh
```

### Configure Environment

1. Get credentials from team lead
2. Create `backend/.env` with MongoDB URI and GitHub OAuth
3. Create `frontend/.env` with API URL

### Start Services

**Terminal 1:**
```bash
cd backend
npm run server
```

**Terminal 2:**
```bash
cd frontend
npm run dev
```

### Access Application

Open browser: http://localhost:5173

---

## ❓ Common Questions

### Q: I'm getting "please login in a codeserver" error

**A:** Read **CODESERVER-LOGIN-FIX.md**
- Try quick fix first (clear cookies, re-login)
- If that doesn't work, follow diagnostic steps

### Q: How do I get MongoDB URI?

**A:** Read **ENV-SETUP-TEMPLATE.md** → Backend Environment Setup → Step 2

### Q: How do I get GitHub OAuth credentials?

**A:** Read **ENV-SETUP-TEMPLATE.md** → Backend Environment Setup → Step 3

### Q: What ports does the application use?

**A:** Read **QUICK-REFERENCE.md** → Ports section
- Frontend: 5173 (dev) or 3000 (docker)
- Backend: 4000
- Code-Server: 8080 (container) → random (host)

### Q: How do I troubleshoot Docker issues?

**A:** Read **QUICK-REFERENCE.md** → Troubleshooting section

### Q: Where are the important files?

**A:** Read **QUICK-REFERENCE.md** → Important Files section

### Q: How do I stop the services?

**A:** Press Ctrl+C in each terminal

### Q: How do I clean up Docker?

**A:** Read **QUICK-REFERENCE.md** → Clean Up section

---

## 📋 Setup Checklist

Before you start, ensure you have:

- [ ] Node.js installed (v14+)
- [ ] Docker installed and running
- [ ] Git installed
- [ ] GitHub account
- [ ] MongoDB Atlas account
- [ ] GitHub OAuth App created
- [ ] 20GB free disk space
- [ ] 8GB+ RAM

---

## 🔧 Troubleshooting Quick Links

| Issue | Solution |
|-------|----------|
| "Please login in a codeserver" | **CODESERVER-LOGIN-FIX.md** |
| Port already in use | **QUICK-REFERENCE.md** → Port Already in Use |
| Docker images not found | **QUICK-REFERENCE.md** → Docker Images Not Found |
| MongoDB connection failed | **QUICK-REFERENCE.md** → MongoDB Connection Failed |
| GitHub OAuth error | **QUICK-REFERENCE.md** → GitHub OAuth Error |
| CORS error | **QUICK-REFERENCE.md** → CORS Error |
| Docker daemon not running | **QUICK-REFERENCE.md** → Docker Daemon Not Running |

---

## 📖 Reading Order by Scenario

### Scenario 1: First Time Setup

```
1. This file (README-SETUP.md) - 2 min
2. TEAM-SETUP-GUIDE.md - 30-45 min
3. ENV-SETUP-TEMPLATE.md - 10-15 min
4. Bookmark QUICK-REFERENCE.md for later
```

### Scenario 2: Quick Automated Setup

```
1. This file (README-SETUP.md) - 2 min
2. scripts/setup/QUICK-SETUP.bat or scripts/setup/QUICK-SETUP.sh - 10-15 min
3. ENV-SETUP-TEMPLATE.md - 10-15 min
4. TEAM-SETUP-GUIDE.md Step 5 & 6 - 10 min
```

### Scenario 3: Troubleshooting

```
1. QUICK-REFERENCE.md - 1-5 min
2. CODESERVER-LOGIN-FIX.md (if login error) - 5-25 min
3. TEAM-SETUP-GUIDE.md troubleshooting - 10-20 min
```

### Scenario 4: Team Member Setup

```
1. This file (README-SETUP.md) - 2 min
2. TEAM-SETUP-GUIDE.md - 30-45 min
3. ENV-SETUP-TEMPLATE.md - 10-15 min
4. Bookmark QUICK-REFERENCE.md for later
```

---

## ✅ Success Indicators

When setup is complete, you should see:

- ✅ Backend running: "Server running on port 4000"
- ✅ Frontend running: "Local: http://localhost:5173"
- ✅ Can access http://localhost:5173 in browser
- ✅ Can login with GitHub
- ✅ Dashboard shows templates
- ✅ Can click "Use Template"
- ✅ Code-server loads in new tab
- ✅ Code-server doesn't show login prompt
- ✅ Can create files in code-server

---

## 🆘 Getting Help

### Step 1: Check Documentation

1. **QUICK-REFERENCE.md** - Quick lookup
2. **CODESERVER-LOGIN-FIX.md** - If login error
3. **TEAM-SETUP-GUIDE.md** - Full troubleshooting

### Step 2: Verify Setup

```bash
# Backend running?
curl http://localhost:4000

# Frontend running?
curl http://localhost:5173

# Docker running?
docker ps

# MongoDB connected?
node backend/test-mongo.js
```

### Step 3: Check Logs

- Backend console output
- Frontend console (F12)
- Docker logs: `docker logs [CONTAINER_ID]`
- Browser console (F12)

### Step 4: Ask for Help

- Check team chat
- Ask team lead
- Share error logs and screenshots

---

## 📞 Support Resources

### Documentation
- **TEAM-SETUP-GUIDE.md** - Complete setup guide
- **CODESERVER-LOGIN-FIX.md** - Troubleshooting
- **ENV-SETUP-TEMPLATE.md** - Environment setup
- **QUICK-REFERENCE.md** - Quick lookup
- **SETUP-DOCUMENTS-SUMMARY.md** - Navigation guide

### External Resources
- **Node.js:** https://nodejs.org/
- **Docker:** https://www.docker.com/
- **MongoDB Atlas:** https://www.mongodb.com/cloud/atlas
- **GitHub OAuth:** https://docs.github.com/en/developers/apps
- **Express.js:** https://expressjs.com/
- **React:** https://react.dev/

### Team Support
- Ask in team chat
- Contact team lead
- Schedule setup call

---

## 🎯 Next Steps

1. **Choose your setup method:**
   - Automated: scripts/setup/QUICK-SETUP.bat (Windows) or scripts/setup/QUICK-SETUP.sh (macOS/Linux)
   - Manual: TEAM-SETUP-GUIDE.md

2. **Configure environment:**
   - Follow ENV-SETUP-TEMPLATE.md
   - Get credentials from team lead

3. **Start services:**
   - Backend: `cd backend && npm run server`
   - Frontend: `cd frontend && npm run dev`

4. **Verify setup:**
   - Open http://localhost:5173
   - Login with GitHub
   - Launch a template

5. **Bookmark for reference:**
   - QUICK-REFERENCE.md for commands
   - CODESERVER-LOGIN-FIX.md for troubleshooting

---

## 📊 Document Overview

| Document | Purpose | Time | Audience |
|----------|---------|------|----------|
| README-SETUP.md | Navigation & quick start | 2 min | Everyone |
| TEAM-SETUP-GUIDE.md | Complete setup guide | 30-45 min | Everyone |
| CODESERVER-LOGIN-FIX.md | Troubleshooting | 5-25 min | Debugging |
| ENV-SETUP-TEMPLATE.md | Environment setup | 10-15 min | Configuration |
| QUICK-REFERENCE.md | Quick lookup | 1-5 min | Everyone |
| SETUP-DOCUMENTS-SUMMARY.md | Navigation guide | 2-3 min | Navigation |
| scripts/setup/QUICK-SETUP.bat | Automation (Windows) | 10-15 min | Windows users |
| scripts/setup/QUICK-SETUP.sh | Automation (macOS/Linux) | 10-15 min | macOS/Linux users |
| TEAM-LEAD-CHECKLIST.md | Team distribution | Varies | Team leads |

---

## 🚀 Ready to Start?

### Choose Your Path:

**Path 1: Automated Setup (Fastest)**
```bash
# Windows
scripts/setup/QUICK-SETUP.bat

# macOS/Linux
chmod +x scripts/setup/QUICK-SETUP.sh
./scripts/setup/QUICK-SETUP.sh
```

**Path 2: Manual Setup (Detailed)**
→ Read **TEAM-SETUP-GUIDE.md**

**Path 3: Troubleshooting (If errors)**
→ Read **CODESERVER-LOGIN-FIX.md**

---

## 📝 Document Versions

- **README-SETUP.md** - v1.0.0 (March 2026)
- **TEAM-SETUP-GUIDE.md** - v1.0.0 (March 2026)
- **CODESERVER-LOGIN-FIX.md** - v1.0.0 (March 2026)
- **ENV-SETUP-TEMPLATE.md** - v1.0.0 (March 2026)
- **QUICK-REFERENCE.md** - v1.0.0 (March 2026)
- **SETUP-DOCUMENTS-SUMMARY.md** - v1.0.0 (March 2026)
- **TEAM-LEAD-CHECKLIST.md** - v1.0.0 (March 2026)

---

**Happy coding! 🎉**

For questions or issues, refer to the appropriate documentation above or contact your team lead.
