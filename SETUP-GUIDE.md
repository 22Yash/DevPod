# 🚀 DevPod Setup Guide

## Issues Fixed

### ✅ Issue 1: Authentication Failed but Still Logs In
- **Fixed**: Added proper session cleanup on authentication failure
- **Fixed**: Added user data validation before creating session
- **Fixed**: Added `success: false` flag in error responses

### ✅ Issue 2: Templates Not Working - Workspace Shows "Started" but Doesn't Open  
- **Fixed**: Changed from `codercom/code-server:latest` to custom Docker images
- **Fixed**: Updated image names to `devpod-python:latest`, `devpod-nodejs:latest`, `devpod-mern:latest`
- **Fixed**: Modified `ensureDockerImage()` to build custom images instead of pulling

### ✅ Issue 3: Using Wrong Docker Images
- **Fixed**: Docker service now uses your custom Dockerfiles from `docker/` folder
- **Fixed**: Each template uses its specific image with proper tooling

### ✅ Issue 4: MERN Localhost Not Working
- **Fixed**: Improved CORS configuration in backend
- **Fixed**: Added multiple backend URL fallbacks in frontend
- **Fixed**: Enhanced port binding wait time (5 seconds)
- **Fixed**: Better error handling and connection testing

---

## 🔧 Setup Instructions

### Step 1: Build Docker Images

**Windows:**
```cmd
build-images.bat
```

**Linux/Mac:**
```bash
chmod +x build-images.sh
./build-images.sh
```

**Manual Build (if scripts fail):**
```bash
# Build Python image
docker build -t devpod-python:latest ./docker/python/

# Build Node.js image  
docker build -t devpod-nodejs:latest ./docker/nodejs/

# Build MERN image
docker build -t devpod-mern:latest ./docker/mern/
```

### Step 2: Verify Images Built
```bash
docker images | grep devpod
```

You should see:
```
devpod-python    latest    [IMAGE_ID]    [TIME]    [SIZE]
devpod-nodejs    latest    [IMAGE_ID]    [TIME]    [SIZE]  
devpod-mern      latest    [IMAGE_ID]    [TIME]    [SIZE]
```

### Step 3: Start the Application

**Using Docker Compose:**
```bash
docker-compose up --build
```

**Or manually:**
```bash
# Backend
cd backend
npm install
npm start

# Frontend (new terminal)
cd frontend  
npm install
npm run dev
```

### Step 4: Test Authentication

1. Visit `http://localhost:3000`
2. Click "Sign in with GitHub"
3. Complete OAuth flow
4. Should redirect to dashboard with your user info

**If authentication fails:**
- Check browser console for errors
- Check backend logs for OAuth errors
- Verify GitHub OAuth credentials in `.env`

### Step 5: Test Templates

**Python Template:**
1. Click "Python Development" template
2. Should show "Launching..." then success message
3. New tab should open with code-server IDE
4. Terminal should have Python available

**Node.js Template:**
1. Click "Node.js Backend" template  
2. Should show "Launching..." then success message
3. New tab should open with code-server IDE
4. Terminal should have Node.js and npm available

**MERN Template:**
1. Click "MERN Stack" template
2. Should show "Launching..." then success message  
3. New tab should open with code-server IDE
4. Project structure should be auto-created
5. Three URLs should be available:
   - IDE: `http://localhost:[random_port]`
   - Frontend: `http://localhost:[random_port]` 
   - Backend: `http://localhost:[random_port]`

### Step 6: Test MERN Localhost

**In the MERN workspace IDE:**

1. Open terminal in code-server
2. Install dependencies:
   ```bash
   npm run install-all
   ```

3. Start both servers:
   ```bash
   npm run dev
   ```

4. Check the URLs:
   - Frontend should show React app with backend connection status
   - Backend should respond to API calls
   - IDE should remain accessible

---

## 🐛 Troubleshooting

### Authentication Issues

**Problem**: "Authentication failed" but still logged in
**Solution**: Fixed in `authController.js` - session now properly cleared on errors

**Problem**: OAuth callback errors
**Solution**: Check GitHub OAuth app settings:
- Authorization callback URL: `http://localhost:3000/auth/callback`
- Homepage URL: `http://localhost:3000`

### Template Launch Issues

**Problem**: "Workspace started" but doesn't open
**Solution**: 
1. Check if Docker images are built: `docker images | grep devpod`
2. Check Docker daemon is running
3. Check browser popup blocker
4. Check backend logs for container errors

**Problem**: Container exits immediately
**Solution**: 
1. Check Dockerfile syntax
2. Test image manually: `docker run -it devpod-python:latest /bin/sh`
3. Check container logs: `docker logs [container_id]`

### MERN Localhost Issues

**Problem**: Frontend can't connect to backend
**Solution**: 
1. Check if both servers are running in container
2. Check port mappings: `docker port [container_id]`
3. Try different backend URLs (app now tries multiple)

**Problem**: Ports not accessible
**Solution**:
1. Check Docker port bindings
2. Check Windows firewall/antivirus
3. Try different ports if conflicts exist

### Docker Issues

**Problem**: "Docker daemon not accessible"
**Solution**:
1. Start Docker Desktop
2. Enable API access: Settings → General → "Expose daemon on tcp://localhost:2375"
3. Check Docker is running: `docker ps`

**Problem**: Image build fails
**Solution**:
1. Check Dockerfile syntax
2. Check internet connection for downloads
3. Check disk space
4. Try building manually with verbose output

---

## 📋 Testing Checklist

### ✅ Authentication
- [ ] GitHub OAuth login works
- [ ] User info displays in dashboard  
- [ ] Session persists on page refresh
- [ ] Logout works properly
- [ ] Failed auth doesn't create session

### ✅ Python Template
- [ ] Template launches successfully
- [ ] IDE opens in new tab
- [ ] Python interpreter available
- [ ] Can create and run Python files
- [ ] Container stops/starts properly

### ✅ Node.js Template  
- [ ] Template launches successfully
- [ ] IDE opens in new tab
- [ ] Node.js and npm available
- [ ] Can create and run Node.js apps
- [ ] Container stops/starts properly

### ✅ MERN Template
- [ ] Template launches successfully
- [ ] IDE opens in new tab
- [ ] Project structure auto-created
- [ ] All three ports accessible
- [ ] Frontend connects to backend
- [ ] Both servers can run simultaneously
- [ ] Container stops/starts properly

### ✅ Dashboard
- [ ] Workspace list shows created workspaces
- [ ] Workspace status updates correctly
- [ ] Can stop/start/delete workspaces
- [ ] Activity tracking works
- [ ] All three templates visible

---

## 🔍 Debug Commands

**Check running containers:**
```bash
docker ps
```

**Check container logs:**
```bash
docker logs [container_id]
```

**Check port mappings:**
```bash
docker port [container_id]
```

**Test backend API:**
```bash
curl http://localhost:4000/api/health
```

**Check Docker images:**
```bash
docker images | grep devpod
```

**Rebuild specific image:**
```bash
docker build -t devpod-mern:latest ./docker/mern/ --no-cache
```

---

## 🎯 Expected Behavior

### Successful Python Launch:
1. Click "Python Development"
2. Button shows "Launching..."
3. Success message: "🎉 Python workspace is ready! Opening in new tab..."
4. New tab opens with code-server
5. Terminal has Python 3.10 available
6. Dashboard shows workspace as "running"

### Successful MERN Launch:
1. Click "MERN Stack"  
2. Button shows "Launching..."
3. Success message shows all three URLs
4. New tab opens with code-server
5. Project structure is pre-created
6. Can run `npm run dev` to start both servers
7. Frontend at :3000 connects to backend at :5000
8. Dashboard shows workspace as "running"

All issues should now be resolved! 🎉