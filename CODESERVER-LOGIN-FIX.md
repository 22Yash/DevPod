# Fix: "Please Login in a CodeServer" Error

This document specifically addresses the error your team member encountered when clicking "Use Template".

---

## Root Cause

The error "please login in a codeserver" appears when:
1. **Session is lost** - User's authentication session expired or wasn't properly saved
2. **Session cookie not sent** - Browser not sending session cookie to backend
3. **MongoDB session store unreachable** - Backend can't verify session in database
4. **CORS credentials not configured** - Session cookie blocked by CORS policy

---

## Quick Fix (Try This First)

### Step 1: Clear Browser Cache & Cookies

1. Open browser DevTools: **F12**
2. Go to **Application** tab
3. Click **Cookies** → **http://localhost:5173**
4. Delete all cookies (especially `connect.sid`)
5. Close DevTools

### Step 2: Re-login

1. Go to http://localhost:5173
2. Click **"Login with GitHub"**
3. Complete GitHub authorization
4. Wait for redirect to Dashboard
5. Try clicking "Use Template" again

**If this works:** Issue was session cookie. No further action needed.

**If still failing:** Continue to Step 3.

---

## Detailed Diagnostic Steps

### Step 3: Verify Backend is Running

```bash
# Check if backend is running
curl http://localhost:4000

# Expected response: Cannot GET / (this is OK, means backend is running)
# If error: Connection refused - backend is NOT running
```

**If backend not running:**
```bash
cd backend
npm run server
```

### Step 4: Check MongoDB Connection

```bash
# In backend directory, create test-mongo.js
const mongoose = require('mongoose');
require('dotenv').config();

console.log('Testing MongoDB connection...');
console.log('URI:', process.env.MONGODB_URI.substring(0, 50) + '...');

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connected successfully');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });
```

Run it:
```bash
node test-mongo.js
```

**Expected output:**
```
Testing MongoDB connection...
URI: mongodb+srv://username:password@cluster0...
✅ MongoDB connected successfully
```

**If fails:**
- Check `MONGODB_URI` in `backend/.env`
- Verify MongoDB Atlas cluster is running
- Check IP whitelist in MongoDB Atlas (should include your IP or 0.0.0.0/0)
- Verify username/password are correct

### Step 5: Check Session Configuration

Open `backend/src/app.js` and verify:

```javascript
// Should have CORS with credentials: true
app.use(cors({ 
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true  // ← This is critical
}));

// Should have session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    collectionName: 'sessions',
    ttl: 24 * 60 * 60
  }),
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  }
}));
```

### Step 6: Check Frontend Session Handling

Open `frontend/src/pages/AuthCallback/AuthCallback.jsx` and verify:

```javascript
// Should send credentials: 'include'
const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/github`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include',  // ← This is critical
  body: JSON.stringify({ code })
});
```

### Step 7: Monitor Session Creation

Add logging to backend. Edit `backend/src/controllers/authController.js`:

```javascript
const githubAuth = async (req, res) => {
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({ 
      error: "Authorization code is missing",
      details: "No authorization code received from GitHub"
    });
  }

  try {
    console.log('🔐 Processing GitHub OAuth with code:', code.substring(0, 10) + '...');
    
    const user = await githubService.getGitHubUser(code);
    
    if (!user || !user._id) {
      throw new Error('Invalid user data received from GitHub service');
    }
    
    // Store user in session
    req.session.userId = user._id;
    req.session.user = user;
    
    // ← ADD THIS LOGGING
    console.log('✅ Session created for user:', user.login);
    console.log('   Session ID:', req.sessionID);
    console.log('   Session data:', req.session);
    
    res.json({ 
      success: true, 
      user,
      message: 'Authentication successful'
    });
  } catch (error) {
    console.error("❌ GitHub OAuth Error:", error.message);
    
    if (req.session) {
      req.session.userId = null;
      req.session.user = null;
    }
    
    let errorMessage = "Authentication failed";
    let statusCode = 500;
    
    if (error.message.includes('GitHub OAuth error')) {
      errorMessage = error.message;
      statusCode = 400;
    } else if (error.message.includes('not configured')) {
      errorMessage = 'GitHub OAuth not configured. Check GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET.';
      statusCode = 500;
    }
    
    res.status(statusCode).json({ error: errorMessage });
  }
};

module.exports = { githubAuth };
```

Restart backend and check logs when logging in.

### Step 8: Test Launch Endpoint Directly

After logging in, open browser DevTools and run:

```javascript
// In browser console (F12)
fetch('http://localhost:4000/api/v1/workspaces/launch', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include',
  body: JSON.stringify({
    template: 'python',
    name: 'Test Workspace',
    description: 'Testing'
  })
})
.then(r => r.json())
.then(data => console.log('Response:', data))
.catch(err => console.error('Error:', err));
```

**Expected response:**
```javascript
{
  success: true,
  workspaceId: "...",
  ideUrl: "http://localhost:12345"
}
```

**If you get 401 error:**
```javascript
{
  error: "Unauthorized. Please login."
}
```

This means session is not being sent. Check:
1. `connect.sid` cookie exists in DevTools
2. Backend CORS has `credentials: true`
3. Frontend requests have `credentials: 'include'`

---

## Environment Variable Checklist

### backend/.env

```env
# ✅ Must be set
MONGODB_URI=mongodb+srv://...
GITHUB_CLIENT_ID=Ov23lia...
GITHUB_CLIENT_SECRET=fc02de...
SESSION_SECRET=my-super-secret-random-string-12345

# ✅ Should be set for development
PORT=4000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# ✅ For Windows Docker
DOCKER_HOST=tcp://host.docker.internal:2375
```

### frontend/.env

```env
# ✅ Must match backend port
VITE_API_URL=http://localhost:4000

# ✅ Must match GitHub OAuth App
VITE_GITHUB_CLIENT_ID=Ov23lia...
VITE_GITHUB_CALLBACK_URL=http://localhost:3000/auth/callback
```

---

## Docker Images Verification

Before launching templates, verify Docker images exist:

```bash
# List all devpod images
docker images | grep devpod

# Expected output:
# devpod-python      latest    XXXXXXXXX   XX seconds ago   XXX MB
# devpod-nodejs      latest    XXXXXXXXX   XX seconds ago   XXX MB
# devpod-mern        latest    XXXXXXXXX   XX seconds ago   XXX MB
# devpod-java        latest    XXXXXXXXX   XX seconds ago   XXX MB
```

**If images missing:**
```bash
# Windows
build-images.bat

# macOS/Linux
./build-images.sh
```

---

## Complete Restart Procedure

If nothing above works, do a complete restart:

### 1. Stop Everything

```bash
# Stop frontend (Ctrl+C in frontend terminal)
# Stop backend (Ctrl+C in backend terminal)

# Stop all Docker containers
docker stop $(docker ps -q)
```

### 2. Clear Session Data

```bash
# Connect to MongoDB and clear sessions
# Or just wait 24 hours for sessions to expire
```

### 3. Restart Backend

```bash
cd backend
npm run server
```

Wait for:
```
🚀 Server running on port 4000
✅ Connected to MongoDB
🐳 Docker connection established
```

### 4. Restart Frontend

```bash
cd frontend
npm run dev
```

Wait for:
```
  ➜  Local:   http://localhost:5173/
```

### 5. Test Again

1. Go to http://localhost:5173
2. Click "Login with GitHub"
3. Complete authorization
4. Click "Use Template"
5. Wait 5-10 seconds for code-server to load

---

## Advanced Debugging

### Enable Verbose Logging

Edit `backend/src/routes/workspacesRoutes.js`:

```javascript
router.post('/launch', isAuthenticated, async (req, res) => {
  const { template, name, description, repositoryUrl } = req.body;
  const userId = req.session.userId;
  
  console.log('🚀 Launch request from user:', userId);
  console.log('   Template:', template);
  console.log('   Session ID:', req.sessionID);
  console.log('   Session data:', req.session);
  console.log('   Request headers:', req.headers);
  
  // ... rest of code
});
```

### Check Network Requests

1. Open browser DevTools: **F12**
2. Go to **Network** tab
3. Click "Use Template"
4. Look for POST request to `/api/v1/workspaces/launch`
5. Check:
   - **Status**: Should be 200 (not 401)
   - **Request Headers**: Should have `Cookie: connect.sid=...`
   - **Response**: Should have `ideUrl`

### Check Docker Container Logs

```bash
# Find container ID
docker ps | grep devpod

# View logs
docker logs [CONTAINER_ID]

# Follow logs in real-time
docker logs -f [CONTAINER_ID]
```

---

## Success Indicators

When everything is working correctly:

✅ **Browser Console**: No CORS errors
✅ **Backend Logs**: Shows "Session created for user: [username]"
✅ **Network Tab**: POST to `/api/v1/workspaces/launch` returns 200
✅ **DevTools Cookies**: `connect.sid` cookie exists
✅ **Docker**: New container created and running
✅ **Code-Server**: Loads in new tab without login prompt

---

## Still Not Working?

1. **Collect all logs:**
   - Backend console output
   - Frontend browser console (F12)
   - Docker container logs
   - Browser Network tab screenshot

2. **Verify all prerequisites:**
   - Docker running: `docker ps`
   - Backend running: `curl http://localhost:4000`
   - MongoDB accessible: `node test-mongo.js`
   - GitHub OAuth configured correctly

3. **Check GitHub OAuth App settings:**
   - Homepage URL: `http://localhost:3000`
   - Authorization callback URL: `http://localhost:3000/auth/callback`
   - Client ID and Secret match `.env`

4. **Restart everything:**
   - Stop Docker containers
   - Stop backend and frontend
   - Clear browser cookies
   - Restart all services
   - Try again

---

**If you've followed all steps and still have issues, please provide:**
- Backend console output (full error message)
- Browser console errors (F12)
- Docker logs: `docker logs [CONTAINER_ID]`
- Network tab screenshot showing failed request
- Your `.env` file (with secrets redacted)
