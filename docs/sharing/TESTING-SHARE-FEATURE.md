# Testing Workspace Sharing Feature

## Prerequisites
1. Backend server running: `cd backend && npm start`
2. Frontend server running: `cd frontend && npm run dev`
3. Docker Desktop running
4. Logged in to the application

## Test Steps

### Step 1: Create a Python Workspace
1. Go to Dashboard
2. Click "New Workspace" or go to "Templates" tab
3. Click "Use" on "Python Development" template
4. Wait for workspace to launch (status should be "running")
5. You should see the workspace in "My Workspaces" tab

### Step 2: Add Some Files to the Workspace
1. Click "Open" on your Python workspace
2. In the code-server IDE, create some files:
   - `app.py` with some Python code
   - `requirements.txt` with packages like `flask==2.0.1`
   - `README.md` with some documentation
3. Save all files

### Step 3: Create Share Link
1. Go back to Dashboard
2. Find your Python workspace (must be "running")
3. You should see a Share icon (🔗) next to the "Open" button
4. Click the Share icon
5. Configure sharing options:
   - Expires In: 24 hours (default)
   - Max Clones: Leave empty for unlimited
6. Click "Generate Share Link"
7. Wait for snapshot creation (may take a few seconds)
8. Copy the share URL

### Step 4: Test Share Preview
1. Open the share URL in a new browser tab (or incognito window)
2. You should see:
   - Workspace name and description
   - Owner information
   - File list
   - Python packages
   - Clone statistics
3. Verify all files are listed

### Step 5: Clone the Workspace
1. On the share preview page, optionally change the workspace name
2. Click "Clone Workspace"
3. Wait for cloning process (may take 30-60 seconds)
4. You should be redirected to Dashboard
5. Find the new cloned workspace in "My Workspaces"
6. Click "Open" to verify files were copied

### Step 6: Verify Cloned Workspace
1. Open the cloned workspace
2. Check that all files exist:
   - `app.py`
   - `requirements.txt`
   - `README.md`
3. Verify Python packages are installed:
   - Open terminal in code-server
   - Run: `pip list`
   - Check if Flask is installed

### Step 7: Test Share Link Revocation
1. Go back to original workspace
2. Click Share icon again
3. Click "Revoke Link"
4. Try to access the share URL again
5. Should show "Share link not found" error

## Expected Results

✅ Share button appears only for Python workspaces that are running
✅ Share modal opens with configuration options
✅ Share link is generated successfully
✅ Share preview page shows all workspace details
✅ Cloning creates a new independent workspace
✅ All files are copied to the new workspace
✅ Python packages are installed in the new workspace
✅ Revoked links cannot be accessed

## Troubleshooting

### Share button not visible
- Check workspace is "running" status
- Check workspace template is "python"
- Refresh the page

### "Workspace is too large to share" error
- Workspace exceeds 10MB limit
- Remove large files or add them to .gitignore
- Only files under 1MB are included

### Cloning fails
- Check Docker is running
- Check backend logs for errors
- Verify workspace is still running
- Check network connectivity

### Files not copied
- Check files were saved in original workspace
- Check file paths are under `/workspace`
- Check files are not in excluded directories

### Packages not installed
- Check `requirements.txt` exists
- Check package names are valid
- Check internet connectivity during clone
- Check backend logs for pip errors

## API Testing with curl

### Create Share Link
```bash
curl -X POST http://localhost:4000/api/workspace/YOUR_WORKSPACE_ID/share \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"expiresIn": 24, "maxClones": 10}'
```

### Get Share Preview
```bash
curl http://localhost:4000/api/share/YOUR_SHARE_TOKEN
```

### Clone Workspace
```bash
curl -X POST http://localhost:4000/api/share/YOUR_SHARE_TOKEN/clone \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"customName": "My Cloned Workspace"}'
```

### Revoke Share Link
```bash
curl -X DELETE http://localhost:4000/api/workspace/YOUR_WORKSPACE_ID/share \
  -b cookies.txt
```

## Database Verification

### Check ShareSnapshot Collection
```javascript
// In MongoDB shell or Compass
db.sharesnapshots.find().pretty()
```

### Check Workspace Updates
```javascript
// Check if workspace has shareToken
db.workspaces.find({ isShared: true }).pretty()
```

### Check Clone Count
```javascript
// Verify clone count increments
db.sharesnapshots.find({ shareToken: "YOUR_TOKEN" }, { cloneCount: 1 })
```

## Performance Notes

- Snapshot creation: 2-5 seconds for small workspaces
- Cloning process: 30-60 seconds depending on file count and packages
- Share preview loads instantly (no container needed)
- File size limit: 1MB per file, 10MB total workspace

## Security Checks

✅ Share tokens are cryptographically random (32 chars)
✅ Expired links return 403 error
✅ Clone limit is enforced
✅ Authentication required for cloning
✅ Original workspace is not affected by clones
✅ Each clone is completely isolated
