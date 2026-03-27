# Network Timeout Fix - Docker Build

Your build is failing due to **network timeout** when downloading packages. This is a connectivity issue, not a code problem.

---

## Error Message

```
Connection timed out [IP: 151.101.66.132 80]
E: Failed to fetch http://deb.debian.org/debian-security/pool/updates/main/g/glibc/libc6-dev
E: Unable to fetch some archives
```

**Cause:** Network connection is too slow or unstable to download large packages

---

## Quick Fixes (Try These First)

### Fix 1: Restart Docker Desktop (Often Works!)

1. **Close Docker Desktop completely**
   - Right-click Docker icon in system tray
   - Click "Quit Docker Desktop"
   - Wait 10 seconds

2. **Reopen Docker Desktop**
   - Click Windows Start
   - Search "Docker Desktop"
   - Click to open
   - Wait 30 seconds for it to fully start

3. **Retry build**
   ```bash
   build-images-with-retry.bat
   ```

**Success Rate:** 60-70%

---

### Fix 2: Check Internet Connection

```bash
# Test connectivity
ping google.com

# If no response:
# - Check WiFi/Ethernet connection
# - Try wired connection if possible
# - Restart your router
# - Wait 1 minute
# - Retry build
```

---

### Fix 3: Clean Docker and Retry

```bash
# Stop all containers
docker stop $(docker ps -q)

# Remove dangling images
docker image prune -a -f

# Remove build cache
docker builder prune -a -f

# Retry build
build-images-with-retry.bat
```

---

### Fix 4: Use New Build Script with Retry Logic

```bash
# This script retries up to 5 times automatically
build-images-with-retry.bat
```

**What it does:**
- Retries each image build up to 5 times
- Waits 10 seconds between retries
- Better error messages

---

## Advanced Fixes

### Fix 5: Increase Docker Build Timeout

**Windows/macOS:**
1. Docker Desktop → Settings → Docker Engine
2. Add:
   ```json
   {
     "builder": {
       "gc": {
         "enabled": true,
         "defaultKeepStorage": "100gb"
       }
     }
   }
   ```
3. Restart Docker
4. Retry build

### Fix 6: Use Different DNS

**Windows/macOS:**
1. Docker Desktop → Settings → Docker Engine
2. Add:
   ```json
   {
     "dns": ["8.8.8.8", "8.8.4.4", "1.1.1.1"]
   }
   ```
3. Restart Docker
4. Retry build

### Fix 7: Build with Network Retry

```bash
# Build Node.js with retry
docker build --progress=plain -t devpod-nodejs:latest ./docker/nodejs/

# If fails, wait 30 seconds and retry
timeout /t 30
docker build --progress=plain -t devpod-nodejs:latest ./docker/nodejs/
```

---

## Step-by-Step Recovery

### Step 1: Verify Internet Connection

```bash
# Test connectivity
ping google.com

# Should show responses like:
# Reply from 142.250.185.46: bytes=32 time=XX ms TTL=XX
```

If no response:
- Check WiFi/Ethernet
- Restart router
- Wait 1 minute
- Try again

### Step 2: Restart Docker

1. Close Docker Desktop
2. Wait 10 seconds
3. Reopen Docker Desktop
4. Wait 30 seconds
5. Verify: `docker ps`

### Step 3: Clean Docker

```bash
docker system prune -a -f
```

### Step 4: Retry Build

```bash
build-images-with-retry.bat
```

### Step 5: If Still Failing

Wait 5 minutes and try again. Sometimes the package repository is temporarily slow.

---

## Manual Build Commands (If Script Fails)

If the script keeps failing, try building one image at a time:

### Build Node.js

```bash
docker build -t devpod-nodejs:latest ./docker/nodejs/
```

If fails, wait 30 seconds and retry:

```bash
timeout /t 30
docker build -t devpod-nodejs:latest ./docker/nodejs/
```

### Build MERN

```bash
docker build -t devpod-mern:latest ./docker/mern-template/
```

If fails, wait 30 seconds and retry:

```bash
timeout /t 30
docker build -t devpod-mern:latest ./docker/mern-template/
```

### Build Java

```bash
docker build -t devpod-java:latest ./docker/java/
```

If fails, wait 30 seconds and retry:

```bash
timeout /t 30
docker build -t devpod-java:latest ./docker/java/
```

---

## Troubleshooting Checklist

- [ ] Internet connection is working (`ping google.com`)
- [ ] Docker Desktop is running (`docker ps`)
- [ ] At least 20GB free disk space (`dir C:\`)
- [ ] Restarted Docker Desktop
- [ ] Ran `docker system prune -a`
- [ ] Tried `build-images-with-retry.bat`
- [ ] Waited 5 minutes between retries
- [ ] Tried manual build commands

---

## If Still Failing After All Fixes

### Option 1: Wait and Retry Later

Sometimes the package repository is slow. Wait 1-2 hours and try again.

### Option 2: Use Offline Build

If you have another machine with the images built, you can:
1. Export images: `docker save devpod-nodejs:latest > nodejs.tar`
2. Transfer to your machine
3. Import: `docker load < nodejs.tar`

### Option 3: Build Without Build-Essential

Edit the Dockerfile to skip build-essential:

**File:** `docker/nodejs/Dockerfile`

Change:
```dockerfile
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    wget \
    git \
    build-essential \
    ...
```

To:
```dockerfile
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    wget \
    git \
    ...
```

Then retry build.

---

## Success Indicators

When build succeeds:

```
✅ Node.js image built successfully
✅ MERN image built successfully
✅ Java image built successfully
```

Verify:
```bash
docker images | findstr devpod
```

Should show 4 images.

---

## Prevention Tips

1. **Use Wired Connection** - More stable than WiFi
2. **Build During Off-Peak Hours** - Less network congestion
3. **Keep Docker Updated** - Better network handling
4. **Monitor Network** - Check if other apps are using bandwidth
5. **Increase Timeout** - Configure Docker for slower networks

---

## Quick Reference

| Problem | Solution |
|---------|----------|
| Connection timeout | Restart Docker Desktop |
| Slow download | Use wired connection |
| Repeated failures | Wait 5 minutes, retry |
| No internet | Check WiFi/Ethernet |
| Build hangs | Ctrl+C, wait 30s, retry |

---

## Support

If you're still stuck:

1. **Check:** DOCKER-BUILD-TROUBLESHOOTING.md
2. **Try:** All fixes above
3. **Wait:** 1-2 hours and retry
4. **Ask:** Team lead with error message

---

**Last Updated:** March 2026
**Version:** 1.0.0
