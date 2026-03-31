# Docker Build Troubleshooting Guide

This guide helps fix Docker image build failures.

---

## Common Docker Build Errors

### Error 1: DNS Resolution Failed

**Error Message:**
```
WARNING: fetching https://dl-cdn.alpinelinux.org/alpine/v3.23/main/x86_64/APKINDEX.tar.gz: DNS: transient error
ERROR: unable to select packages
```

**Cause:** Network connectivity issue or DNS resolution problem

**Solutions:**

#### Solution 1: Retry the Build (Often Works)
```bash
# Windows
scripts/build/build-images.bat

# macOS/Linux
./scripts/build/build-images.sh
```

#### Solution 2: Check Internet Connection
```bash
# Test connectivity
ping google.com

# If no response, check your network connection
```

#### Solution 3: Restart Docker
```bash
# Windows/macOS: Restart Docker Desktop
# Linux: Restart Docker daemon
sudo systemctl restart docker
```

#### Solution 4: Clear Docker Cache
```bash
# Remove all dangling images
docker image prune -a

# Then retry build
scripts/build/build-images.bat  # Windows
./scripts/build/build-images.sh # macOS/Linux
```

#### Solution 5: Use Different DNS
```bash
# Edit Docker daemon config
# Windows: Docker Desktop → Settings → Docker Engine
# Add:
{
  "dns": ["8.8.8.8", "8.8.4.4"]
}

# Then restart Docker and retry build
```

---

### Error 2: Out of Disk Space

**Error Message:**
```
no space left on device
```

**Solution:**
```bash
# Check disk space
df -h  # macOS/Linux
dir C:\  # Windows

# Clean up Docker
docker system prune -a

# Free up space and retry
```

---

### Error 3: Docker Daemon Not Running

**Error Message:**
```
Cannot connect to Docker daemon
```

**Solution:**
```bash
# Windows/macOS: Start Docker Desktop
# Linux: Start Docker daemon
sudo systemctl start docker

# Verify
docker ps
```

---

### Error 4: Permission Denied

**Error Message:**
```
permission denied while trying to connect to Docker daemon
```

**Solution (Linux):**
```bash
# Add user to docker group
sudo usermod -aG docker $USER

# Apply group changes
newgrp docker

# Retry build
./scripts/build/build-images.sh
```

---

## Step-by-Step Build Troubleshooting

### Step 1: Verify Prerequisites

```bash
# Check Docker
docker --version
docker ps

# Check internet
ping google.com

# Check disk space
df -h  # macOS/Linux
dir C:\  # Windows
```

### Step 2: Clean Docker Environment

```bash
# Stop all containers
docker stop $(docker ps -q)

# Remove dangling images
docker image prune -a -f

# Remove dangling volumes
docker volume prune -f

# Remove build cache
docker builder prune -a -f
```

### Step 3: Retry Build with Verbose Output

**Windows:**
```bash
# Edit scripts/build/build-images.bat to add --progress=plain
docker build --progress=plain -t devpod-python:latest ./docker/python
```

**macOS/Linux:**
```bash
# Edit scripts/build/build-images.sh to add --progress=plain
docker build --progress=plain -t devpod-python:latest ./docker/python
```

### Step 4: Build One Image at a Time

```bash
# Try building Python first
docker build -t devpod-python:latest ./docker/python

# If successful, try Node.js
docker build -t devpod-nodejs:latest ./docker/nodejs

# Then MERN
docker build -t devpod-mern:latest ./docker/mern-template

# Finally Java
docker build -t devpod-java:latest ./docker/java
```

### Step 5: Check Build Logs

```bash
# View detailed build output
docker build --progress=plain -t devpod-python:latest ./docker/python 2>&1 | tee build.log

# Review build.log for errors
cat build.log
```

---

## Network Issues

### Issue: Slow or Failing Package Downloads

**Cause:** Network congestion or slow mirrors

**Solutions:**

#### Use Different Package Mirrors

**For Python (Debian):**
Edit `docker/python/Dockerfile`:
```dockerfile
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    # ... packages ...
    && rm -rf /var/lib/apt/lists/*
```

#### Increase Timeout

```bash
# Set Docker build timeout
docker build --build-arg BUILDKIT_INLINE_CACHE=1 \
  --progress=plain \
  -t devpod-python:latest ./docker/python
```

#### Use Build Cache

```bash
# Don't use --no-cache flag
# This allows Docker to use cached layers
docker build -t devpod-python:latest ./docker/python
```

---

## Image-Specific Issues

### Python Image Issues

**Problem:** Alpine Linux DNS issues

**Solution:** Already fixed - using Debian-based image now

**File:** `docker/python/Dockerfile`

### Node.js Image Issues

**Problem:** Usually works fine with Debian base

**If failing:**
```bash
# Rebuild with verbose output
docker build --progress=plain -t devpod-nodejs:latest ./docker/nodejs

# Check Node.js version availability
docker run --rm node:20-bullseye-slim node --version
```

### MERN Image Issues

**Problem:** Complex build with multiple npm installs

**If failing:**
```bash
# Build step by step
docker build --target base -t devpod-mern:base ./docker/mern-template
docker build -t devpod-mern:latest ./docker/mern-template
```

### Java Image Issues

**Problem:** Large image size, multiple downloads

**If failing:**
```bash
# Check if Maven/Gradle downloads are timing out
# Increase timeout or retry

# Rebuild
docker build --progress=plain -t devpod-java:latest ./docker/java
```

---

## Quick Fix Checklist

- [ ] Restart Docker Desktop
- [ ] Check internet connection: `ping google.com`
- [ ] Check disk space: `df -h` or `dir C:\`
- [ ] Clean Docker: `docker system prune -a`
- [ ] Retry build: `scripts/build/build-images.bat` or `./scripts/build/build-images.sh`
- [ ] If still failing, build one image at a time
- [ ] Check build logs for specific errors
- [ ] Verify Docker daemon is running: `docker ps`

---

## Advanced Troubleshooting

### Enable Docker Debug Mode

**Windows/macOS:**
1. Docker Desktop → Settings → Docker Engine
2. Add: `"debug": true`
3. Restart Docker
4. Check logs in Docker Desktop

**Linux:**
```bash
# Edit Docker daemon config
sudo nano /etc/docker/daemon.json

# Add:
{
  "debug": true
}

# Restart
sudo systemctl restart docker

# Check logs
journalctl -u docker -f
```

### Build with BuildKit

```bash
# Enable BuildKit
export DOCKER_BUILDKIT=1

# Rebuild
docker build -t devpod-python:latest ./docker/python
```

### Check Image Layers

```bash
# View image history
docker history devpod-python:latest

# View image details
docker inspect devpod-python:latest
```

---

## Prevention Tips

1. **Keep Docker Updated**
   - Windows/macOS: Check Docker Desktop for updates
   - Linux: `sudo apt-get update && sudo apt-get upgrade docker.io`

2. **Maintain Disk Space**
   - Keep at least 20GB free
   - Regularly clean Docker: `docker system prune -a`

3. **Stable Internet**
   - Use wired connection if possible
   - Avoid building during peak hours

4. **Use Build Cache**
   - Don't use `--no-cache` unless necessary
   - Docker reuses layers from previous builds

5. **Monitor Resources**
   - Check CPU/Memory usage during build
   - Close unnecessary applications

---

## Getting Help

If you're still stuck:

1. **Collect Information:**
   - Docker version: `docker --version`
   - OS: Windows/macOS/Linux
   - Error message (full output)
   - Build logs

2. **Check Documentation:**
   - TEAM-SETUP-GUIDE.md
   - QUICK-REFERENCE.md
   - Docker official docs: https://docs.docker.com/

3. **Ask for Help:**
   - Share error logs
   - Share Docker version
   - Share OS information
   - Share what you've already tried

---

## Success Indicators

When build is successful:

```
✅ Successfully tagged devpod-python:latest
✅ Successfully tagged devpod-nodejs:latest
✅ Successfully tagged devpod-mern:latest
✅ Successfully tagged devpod-java:latest
```

Verify:
```bash
docker images | grep devpod
```

Should show all 4 images.

---

**Last Updated:** March 2026
**Version:** 1.0.0
