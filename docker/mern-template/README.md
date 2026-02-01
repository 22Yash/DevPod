# 🚀 DevPod MERN Workspace

## ⚡ Quick Start Guide

### 🎯 How Port Forwarding Works
This workspace uses **code-server port forwarding** - just like VS Code! When you start a dev server inside the IDE, code-server automatically detects it and lets you access it through the browser.

---

## 🔧 Running Your Applications

### 📱 Frontend (React + Vite)
1. **Open Terminal**: Click `Terminal → New Terminal` in code-server
2. **Navigate**: `cd frontend`
3. **Install**: `npm install`
4. **Start Dev Server**: `npm run dev`
5. **Access App**: 
   - Look for a **pop-up notification** in code-server saying "Open in Browser"
   - OR check the **PORTS tab** at the bottom of code-server
   - OR look for the forwarded URL in the terminal output

```bash
cd frontend
npm install
npm run dev
# ✅ Code-server will auto-forward port 3000!
```

### 🔧 Backend (Express API)
1. **Open New Terminal**: `Terminal → New Terminal`
2. **Navigate**: `cd backend`
3. **Install**: `npm install`
4. **Start Server**: `npm run dev`
5. **Access API**: Check the PORTS tab for the forwarded backend URL

```bash
cd backend
npm install
npm run dev
# ✅ Code-server will auto-forward port 5000!
```

### 🚀 Run Both Together
```bash
# Install all dependencies first
npm run install-all

# Then start both servers
npm run dev
# This runs both frontend and backend concurrently
```

---

## 🌐 Accessing Your Applications

### ✅ CORRECT Way (Port Forwarding):
1. Start your dev servers inside code-server terminals
2. Look for **port forwarding notifications** 
3. Click "Open in Browser" or check the **PORTS tab**
4. Use the forwarded URLs (e.g., `https://abc123-3000.app.github.dev`)

### ❌ WRONG Way (Won't Work):
- ❌ `http://localhost:3000` - This is inside the container
- ❌ `http://localhost:5000` - This is inside the container  
- ❌ Direct port access from your host machine

---

## 📁 Project Structure

```
/workspace/
├── frontend/          # React + Vite app
│   ├── src/
│   ├── package.json
│   └── vite.config.js
├── backend/           # Express API
│   ├── db/
│   ├── middleware/
│   ├── routes/
│   ├── server.js
│   └── package.json
├── package.json       # Root scripts
└── README.md         # This file
```

---

## 🛠️ Available Commands

### Root Level:
- `npm run install-all` - Install all dependencies
- `npm run dev` - Start both frontend and backend
- `npm run dev:frontend` - Start only frontend
- `npm run dev:backend` - Start only backend

### Frontend (`cd frontend`):
- `npm run dev` - Start Vite dev server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Backend (`cd backend`):
- `npm run dev` - Start with nodemon (auto-reload)
- `npm start` - Start production server

---

## 🔍 Troubleshooting

### Port Forwarding Not Working?
1. Make sure you started the server inside code-server terminal
2. Check the PORTS tab at the bottom of code-server
3. Look for notifications in the bottom-right corner
4. Try refreshing the code-server page

### Can't Access Frontend/Backend?
- ✅ Use the forwarded URLs from the PORTS tab
- ❌ Don't use localhost URLs directly

### Need to Install Dependencies?
```bash
# Install everything at once
npm run install-all

# Or install individually
cd frontend && npm install
cd ../backend && npm install
```

---

## 🎉 Happy Coding!

Your MERN stack is ready to go! Remember:
- All development happens inside this code-server IDE
- Port forwarding is automatic - just start your servers
- Check the PORTS tab for forwarded URLs
- Use the integrated terminal for all commands