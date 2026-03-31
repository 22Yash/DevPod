# Immediate Fix - Docker Build Failed

Your team member encountered a Docker build error. Here's how to fix it immediately.

---

## The Error

```
ERROR: unable to select packages:
  bash (no such package)
  build-base (no such package)
  ...
ERROR: failed to build: failed to solve: process "/bin/sh -c apk add..." did not complete successfully
```

**Cause:** DNS resolution issue with Alpine Linux package repository

---

## Quick Fix (Try This First)

### Step 1: Restart Docker

**Windows/macOS:**
1. Close Docker Desktop completely
2. Wait 10 seconds
3. Reopen Docker Desktop
4. Wait for it to fully start (check system tray)

**Linux:**
```bash
sudo systemctl restart docker
```

### Step 2: Retry Build

**Windows:**
```bash
build-images.bat
```

**macOS/Linux:**
```bash
./build-images.sh
```

**Success?** ✅ You're done! Skip to "Verify Build" below.

**Still failing?** → Continue to Step 3.

---

## If Quick Fix Doesn't Work

### Step 3: Clean Docker and Retry

```bash
# Stop all containers
docker stop $(docker ps -q)

# Remove dangling images
docker image prune -a -f

# Remove build cache
docker builder prune -a -f

# Retry build
# Windows
build-images.bat

# macOS/Linux
./build-images.sh
```

**Success?** ✅ You're done! Skip to "Verify Build" below.

**Still failing?** → Continue to Step 4.

---

### Step 4: Check Internet Connection

```bash
# Test connectivity
ping google.com

# If no response:
# - Check your WiFi/Ethernet connection
# - Try wired connection if possible
# - Restart your router
# - Try again
```

---

### Step 5: Use Updated Dockerfile

The Python Dockerfile has been fixed to use a more reliable base image.

**Verify the fix:**
```bash
# Check if docker/python/Dockerfile uses Debian
cat docker/python/Dockerfile | head -5

# Should show:
# FROM python:3.10-slim-bullseye
```

If it still shows Alpine, update it:

```bash
# Windows
type docker\python\Dockerfile | findstr FROM

# macOS/Linux
head -1 docker/python/Dockerfile
```

If it shows `python:3.10-alpine`, the file needs updating. Let me know and I'll fix it.

---

## Verify Build Success

After build completes, verify all images were created:

```bash
docker images | grep devpod
```

**Expected output:**
```
devpod-python      latest    XXXXXXXXX   XX seconds ago   XXX MB
devpod-nodejs      latest    XXXXXXXXX   XX seconds ago   XXX MB
devpod-mern        latest    XXXXXXXXX   XX seconds ago   XXX MB
devpod-java        latest    XXXXXXXXX   XX seconds ago   XXX MB
```

If you see all 4 images: ✅ **Build successful!**

---

## Next Steps After Successful Build

1. **Start Backend:**
   ```bash
   cd backend
   npm run server
   ```

2. **Start Frontend (new terminal):**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Open Browser:**
   ```
   http://localhost:5173
   ```

4. **Login with GitHub**

5. **Try "Use Template"** - should work now!

---

## If Still Failing

### Troubleshooting Checklist

- [ ] Docker Desktop is running (check system tray)
- [ ] Internet connection is working (`ping google.com`)
- [ ] At least 20GB free disk space (`df -h` or `dir C:\`)
- [ ] Docker daemon is responsive (`docker ps`)
- [ ] No other Docker builds running

### Get Detailed Error

```bash
# Build with verbose output
docker build --progress=plain -t devpod-python:latest ./docker/python 2>&1 | tee build.log

# Review the log
cat build.log  # macOS/Linux
type build.log # Windows
```

### Advanced Options

**Option 1: Build One Image at a Time**
```bash
# Try just Python first
docker build -t devpod-python:latest ./docker/python

# If that works, try Node.js
docker build -t devpod-nodejs:latest ./docker/nodejs

# Then MERN
docker build -t devpod-mern:latest ./docker/mern-template

# Finally Java
docker build -t devpod-java:latest ./docker/java
```

**Option 2: Use Different DNS**

Windows/macOS:
1. Docker Desktop → Settings → Docker Engine
2. Add:
   ```json
   {
     "dns": ["8.8.8.8", "8.8.4.4"]
   }
   ```
3. Restart Docker
4. Retry build

**Option 3: Build Without Cache**
```bash
docker build --no-cache -t devpod-python:latest ./docker/python
```

---

## Support

If you're still stuck:

1. **Read:** DOCKER-BUILD-TROUBLESHOOTING.md (comprehensive guide)
2. **Check:** QUICK-REFERENCE.md (quick lookup)
3. **Share:** Error logs and Docker version with team lead

---

## Summary

**Most Common Fix:**
1. Restart Docker Desktop
2. Run `build-images.bat` (Windows) or `./build-images.sh` (macOS/Linux)
3. Wait 5-10 minutes for build to complete
4. Verify: `docker images | grep devpod`

**If that doesn't work:**
1. Clean Docker: `docker system prune -a`
2. Retry build
3. Check internet connection
4. Read DOCKER-BUILD-TROUBLESHOOTING.md

---

**Last Updated:** March 2026
**Version:** 1.0.0
