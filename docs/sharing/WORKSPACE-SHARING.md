# Workspace Sharing Feature - Python, Node.js, and Java Templates

## Overview

This feature allows users to share their Python, Node.js, and Java workspaces with others through a unique URL. Recipients can clone the workspace to create their own independent copy with all files and dependencies included.

## How It Works

### 1. Creating a Share Link (Owner)

**Prerequisites:**
- Workspace must be running
- Supported templates: Python, Node.js, Java
- MERN workspaces are excluded currently

**Steps:**
1. Open your workspace in the dashboard
2. Click the "Share" button
3. Configure sharing options:
   - **Expires In**: How many hours until the link expires (1-168 hours)
   - **Max Clones**: Maximum number of times the workspace can be cloned (optional)
4. Click "Generate Share Link"
5. Copy the generated URL and share it

**What Gets Captured:**
- All files in `/workspace` directory (excluding hidden files, `__pycache__`, `node_modules`)
- Files must be smaller than 500KB each
- Total workspace size must be under 10MB
- Python packages from `requirements.txt`
- Node.js dependencies from `package.json`
- Java dependencies from `pom.xml` or Gradle build files

### 2. Accessing a Shared Workspace (Recipient)

**Steps:**
1. Click the share link (e.g., `http://localhost:5173/share/abc123xyz`)
2. View the workspace preview:
   - Owner information
   - File list
   - Detected dependencies
   - Clone statistics
3. Optionally customize the workspace name
4. Click "Clone Workspace"
5. Wait for the cloning process to complete
6. Access your new workspace from the dashboard

**What Happens During Cloning:**
1. New Docker container is created
2. New Docker volume is created
3. All files are copied to the new container
4. Dependencies are restored based on template:
   - Python: `pip install -r requirements.txt`
   - Node.js: `npm`, `yarn`, or `pnpm` install based on project files
   - Java: Maven or Gradle dependency restore
5. Container is started and ready to use

### 3. Managing Share Links

**Revoke a Share Link:**
1. Go to your workspace
2. Click "Share" button
3. Click "Revoke Link"
4. The share link will be deactivated immediately

**Share Link Expiration:**
- Links automatically expire after the specified time
- Expired links cannot be used to clone workspaces
- Original workspace is not affected by expiration

## API Endpoints

### Create Share Link
```
POST /api/workspace/:workspaceId/share
```

**Request Body:**
```json
{
  "expiresIn": 24,
  "maxClones": 10
}
```

**Response:**
```json
{
  "success": true,
  "shareUrl": "http://localhost:5173/share/abc123xyz",
  "shareToken": "abc123xyz",
  "expiresAt": "2026-02-20T10:00:00Z",
  "maxClones": 10,
  "fileCount": 5,
  "totalSize": 12345
}
```

### Get Share Preview
```
GET /api/share/:shareToken
```

**Response:**
```json
{
  "name": "My Shared Project",
  "description": "A sample shared workspace",
  "template": "nodejs",
  "owner": {
    "name": "John Doe",
    "avatar": "https://..."
  },
  "fileCount": 5,
  "files": [
    { "path": "/app.py", "size": 1234 }
  ],
  "packages": ["express@^4.21.0", "vite@^7.1.0"],
  "cloneCount": 3,
  "maxClones": 10,
  "expiresAt": "2026-02-20T10:00:00Z"
}
```

### Clone Workspace
```
POST /api/share/:shareToken/clone
```

**Request Body:**
```json
{
  "customName": "My Cloned Workspace"
}
```

**Response:**
```json
{
  "success": true,
  "workspace": {
    "workspaceId": "user-123-nodejs-1234567890",
    "name": "My Cloned Workspace",
    "template": "nodejs",
    "ideUrl": "http://localhost:8081",
    "status": "running"
  },
  "message": "Workspace cloned successfully!"
}
```

### Revoke Share Link
```
DELETE /api/workspace/:workspaceId/share
```

**Response:**
```json
{
  "success": true,
  "message": "Share link revoked successfully"
}
```

## Database Schema

### ShareSnapshot Model
```javascript
{
  shareToken: String,        // Unique share token
  workspaceId: String,       // Original workspace ID
  userId: ObjectId,          // Owner user ID
  template: String,          // "python", "nodejs", etc.
  name: String,              // Workspace name
  description: String,       // Workspace description
  snapshot: {
    files: [{
      path: String,          // Relative file path
      content: String,       // File content
      size: Number           // File size in bytes
    }],
    packages: [String],      // Python packages
    totalSize: Number        // Total snapshot size
  },
  expiresAt: Date,          // Expiration date
  maxClones: Number,        // Max clone limit
  cloneCount: Number,       // Current clone count
  isActive: Boolean,        // Is share active
  createdAt: Date
}
```

### Workspace Model Updates
```javascript
{
  // ... existing fields ...
  isShared: Boolean,        // Is workspace shared
  shareToken: String,       // Share token if shared
  clonedFrom: String        // Share token of original (if cloned)
}
```

## Limitations

- Supported templates: Python, Node.js, Java
- MERN workspaces are excluded
- Maximum file size: 500KB per file
- Maximum workspace size: 10MB total
- Dependency caches, build output, and obvious secret files are excluded
- Workspace must be running to create share link

## Security Considerations

- Share tokens are cryptographically random (32 characters)
- Links can expire after a specified time
- Clone limits can be set to prevent abuse
- Users must be authenticated to clone workspaces
- Share links can be revoked at any time
- File contents are sanitized before storage

## Future Enhancements

- Support for other templates (Node.js, MERN, Java)
- Larger file size limits with streaming
- Real-time collaboration mode
- Share link analytics
- Password-protected shares
- Team workspace sharing
