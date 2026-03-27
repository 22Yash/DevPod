# Build Remaining Docker Images - Windows

Your Python image built successfully! Now build the remaining 3 images (Node.js, MERN, Java).

---

## Quick Build (Recommended)

Run this script to build all remaining images:

```bash
build-images-manual.bat
```

This will build:
- ✅ Node.js image
- ✅ MERN image
- ✅ Java image

---

## Manual Build Commands (If Script Fails)

Run these commands one at a time in Command Prompt or PowerShell:

### Build Node.js Image

```bash
docker build -t devpod-nodejs:latest ./docker/nodejs/
```

**Expected output:**
```
[+] Building XX.Xs (XX/XX)
...
Successfully tagged devpod-nodejs:latest
```

### Build MERN Image

```bash
docker build -t devpod-mern:latest ./docker/mern-template/
```

**Expected output:**
```
[+] Building XX.Xs (XX/XX)
...
Successfully tagged devpod-mern:latest
```

### Build Java Image

```bash
docker build -t devpod-java:latest ./docker/java/
```

**Expected output:**
```
[+] Building XX.Xs (XX/XX)
...
Successfully tagged devpod-java:latest
```

---

## Verify All Images Built

After building, verify all 4 images exist:

```bash
docker images | findstr devpod
```

**Expected output:**
```
devpod-python      latest    f1b91121a09e   2 minutes ago   1.17GB
devpod-nodejs      latest    XXXXXXXXX      XX minutes ago  XXX MB
devpod-mern        latest    XXXXXXXXX      XX minutes ago  XXX MB
devpod-java        latest    XXXXXXXXX      XX minutes ago  XXX MB
```

If you see all 4 images: ✅ **Success!**

---

## If Build Fails

### For Node.js Build Failure

```bash
# Try with verbose output
docker build --progress=plain -t devpod-nodejs:latest ./docker/nodejs/

# If still fails, try:
docker system prune -a
docker build -t devpod-nodejs:latest ./docker/nodejs/
```

### For MERN Build Failure

```bash
# MERN is complex, may take longer
# Try with verbose output
docker build --progress=plain -t devpod-mern:latest ./docker/mern-template/

# If npm install fails, try:
docker system prune -a
docker build -t devpod-mern:latest ./docker/mern-template/
```

### For Java Build Failure

```bash
# Java image is large, may take longer
# Try with verbose output
docker build --progress=plain -t devpod-java:latest ./docker/java/

# If download fails, try:
docker system prune -a
docker build -t devpod-java:latest ./docker/java/
```

---

## Build Times

Approximate build times on Windows:

| Image | Time | Size |
|-------|------|------|
| Python | 2-5 min | 1.17 GB |
| Node.js | 3-8 min | 800 MB |
| MERN | 5-15 min | 1.5 GB |
| Java | 5-10 min | 1.2 GB |

**Total:** 15-38 minutes for all 4 images

---

## Troubleshooting

### Issue: "Cannot find path"

**Solution:** Make sure you're in the project root directory

```bash
# Check current directory
cd

# Should show: C:\Users\...\DevPod

# If not, navigate to project:
cd "C:\Users\Sangini\OneDrive\Desktop\devpod new\DevPod"

# Then retry build
docker build -t devpod-nodejs:latest ./docker/nodejs/
```

### Issue: "Docker daemon not running"

**Solution:** Start Docker Desktop

1. Open Docker Desktop application
2. Wait for it to fully start (check system tray)
3. Verify: `docker ps`
4. Retry build

### Issue: "Out of disk space"

**Solution:** Free up space

```bash
# Check disk space
dir C:\

# Clean Docker
docker system prune -a

# Free up space and retry
```

### Issue: Build hangs or times out

**Solution:** Restart Docker and retry

```bash
# Stop Docker Desktop
# Wait 10 seconds
# Restart Docker Desktop
# Retry build
```

---

## Next Steps After Successful Build

1. **Verify all images:**
   ```bash
   docker images | findstr devpod
   ```

2. **Start backend:**
   ```bash
   cd backend
   npm run server
   ```

3. **Start frontend (new terminal):**
   ```bash
   cd frontend
   npm run dev
   ```

4. **Open browser:**
   ```
   http://localhost:5173
   ```

5. **Login with GitHub**

6. **Try "Use Template"** - should work now!

---

## Quick Reference

| Task | Command |
|------|---------|
| Build Node.js | `docker build -t devpod-nodejs:latest ./docker/nodejs/` |
| Build MERN | `docker build -t devpod-mern:latest ./docker/mern-template/` |
| Build Java | `docker build -t devpod-java:latest ./docker/java/` |
| List images | `docker images \| findstr devpod` |
| Remove image | `docker rmi devpod-nodejs:latest` |
| Clean Docker | `docker system prune -a` |

---

## Success Indicators

✅ All 4 images appear in `docker images | findstr devpod`
✅ Each image has a size (not "none")
✅ Each image has a recent timestamp
✅ No errors in build output

---

## Support

If you're still stuck:

1. **Check:** DOCKER-BUILD-TROUBLESHOOTING.md
2. **Try:** Manual build commands above
3. **Ask:** Team lead with error logs

---

**Last Updated:** March 2026
**Version:** 1.0.0
