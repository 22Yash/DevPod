# Windows - Build Remaining Docker Images (Step-by-Step)

Your Python image is built! ✅ Now build the remaining 3 images.

---

## Option 1: Automatic Build (Easiest)

### Step 1: Open Command Prompt

1. Press `Win + R`
2. Type: `cmd`
3. Press Enter

### Step 2: Navigate to Project

```bash
cd "C:\Users\Sangini\OneDrive\Desktop\devpod new\DevPod"
```

### Step 3: Run Build Script

```bash
scripts/build/build-images-manual.bat
```

**Wait for it to complete** (15-30 minutes)

### Step 4: Verify

When done, you should see:
```
✅ All remaining images built!
```

---

## Option 2: PowerShell Build (Alternative)

### Step 1: Open PowerShell

1. Press `Win + X`
2. Click "Windows PowerShell (Admin)"

### Step 2: Navigate to Project

```powershell
cd "C:\Users\Sangini\OneDrive\Desktop\devpod new\DevPod"
```

### Step 3: Run Build Script

```powershell
.\scripts/build/build-images-manual.ps1
```

**Wait for it to complete** (15-30 minutes)

### Step 4: Verify

When done, you should see:
```
✅ All remaining images built!
```

---

## Option 3: Manual Build (If Scripts Fail)

### Step 1: Open Command Prompt

1. Press `Win + R`
2. Type: `cmd`
3. Press Enter

### Step 2: Navigate to Project

```bash
cd "C:\Users\Sangini\OneDrive\Desktop\devpod new\DevPod"
```

### Step 3: Build Node.js Image

Copy and paste this command:

```bash
docker build -t devpod-nodejs:latest ./docker/nodejs/
```

Press Enter and wait (3-8 minutes)

**Expected:** `Successfully tagged devpod-nodejs:latest`

### Step 4: Build MERN Image

Copy and paste this command:

```bash
docker build -t devpod-mern:latest ./docker/mern-template/
```

Press Enter and wait (5-15 minutes)

**Expected:** `Successfully tagged devpod-mern:latest`

### Step 5: Build Java Image

Copy and paste this command:

```bash
docker build -t devpod-java:latest ./docker/java/
```

Press Enter and wait (5-10 minutes)

**Expected:** `Successfully tagged devpod-java:latest`

---

## Verify All Images Built

After building, run this command:

```bash
docker images | findstr devpod
```

**You should see 4 images:**

```
devpod-python      latest    f1b91121a09e   2 minutes ago   1.17GB
devpod-nodejs      latest    XXXXXXXXX      XX minutes ago  XXX MB
devpod-mern        latest    XXXXXXXXX      XX minutes ago  XXX MB
devpod-java        latest    XXXXXXXXX      XX minutes ago  XXX MB
```

If you see all 4: ✅ **Success!**

---

## If Build Fails

### Error: "Cannot find path"

**Solution:** Check your current directory

```bash
# Show current directory
cd

# Should show: C:\Users\Sangini\OneDrive\Desktop\devpod new\DevPod
```

If different, navigate to correct directory:

```bash
cd "C:\Users\Sangini\OneDrive\Desktop\devpod new\DevPod"
```

Then retry build command.

### Error: "Docker daemon not running"

**Solution:** Start Docker Desktop

1. Click Windows Start button
2. Search for "Docker Desktop"
3. Click to open
4. Wait 30 seconds for it to fully start
5. Check system tray (bottom right) - Docker icon should be visible
6. Retry build command

### Error: Build hangs or takes too long

**Solution:** Wait longer or restart

- MERN image can take 10-15 minutes
- Java image can take 5-10 minutes
- If it hangs for 30+ minutes, restart Docker and retry

### Error: "Out of disk space"

**Solution:** Free up space

1. Check disk space: `dir C:\`
2. Delete unnecessary files
3. Empty Recycle Bin
4. Retry build

---

## Build Times

Approximate times on Windows:

| Image | Time |
|-------|------|
| Node.js | 3-8 minutes |
| MERN | 5-15 minutes |
| Java | 5-10 minutes |
| **Total** | **15-30 minutes** |

---

## Next Steps After Successful Build

### Step 1: Verify All Images

```bash
docker images | findstr devpod
```

Should show 4 images.

### Step 2: Start Backend

Open a new Command Prompt:

```bash
cd "C:\Users\Sangini\OneDrive\Desktop\devpod new\DevPod"
cd backend
npm run server
```

**Wait for:** `Server running on port 4000`

### Step 3: Start Frontend

Open another new Command Prompt:

```bash
cd "C:\Users\Sangini\OneDrive\Desktop\devpod new\DevPod"
cd frontend
npm run dev
```

**Wait for:** `Local: http://localhost:5173`

### Step 4: Open Browser

1. Open your browser
2. Go to: `http://localhost:5173`
3. Click "Login with GitHub"
4. Complete authorization
5. Try "Use Template" - should work now!

---

## Troubleshooting Quick Reference

| Problem | Solution |
|---------|----------|
| "Cannot find path" | Check directory: `cd` |
| "Docker not running" | Start Docker Desktop |
| Build hangs | Wait longer or restart Docker |
| "Out of disk space" | Free up space on C:\ |
| Build fails | Try again or read DOCKER-BUILD-TROUBLESHOOTING.md |

---

## Success Checklist

- [ ] Opened Command Prompt
- [ ] Navigated to project directory
- [ ] Ran build script or manual commands
- [ ] All 4 images built successfully
- [ ] Verified with `docker images | findstr devpod`
- [ ] Started backend (`npm run server`)
- [ ] Started frontend (`npm run dev`)
- [ ] Opened http://localhost:5173
- [ ] Logged in with GitHub
- [ ] Tried "Use Template" - works!

---

## Quick Copy-Paste Commands

**Navigate to project:**
```bash
cd "C:\Users\Sangini\OneDrive\Desktop\devpod new\DevPod"
```

**Build Node.js:**
```bash
docker build -t devpod-nodejs:latest ./docker/nodejs/
```

**Build MERN:**
```bash
docker build -t devpod-mern:latest ./docker/mern-template/
```

**Build Java:**
```bash
docker build -t devpod-java:latest ./docker/java/
```

**Verify all images:**
```bash
docker images | findstr devpod
```

**Start backend:**
```bash
cd backend && npm run server
```

**Start frontend:**
```bash
cd frontend && npm run dev
```

---

## Support

If you're stuck:

1. **Read:** DOCKER-BUILD-TROUBLESHOOTING.md
2. **Check:** BUILD-REMAINING-IMAGES.md
3. **Ask:** Team lead with error message

---

**Last Updated:** March 2026
**Version:** 1.0.0
