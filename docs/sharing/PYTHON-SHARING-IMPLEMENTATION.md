# Python Workspace Sharing Implementation Guide

## Overview
This guide explains how to implement workspace sharing for Python templates in your DevPod project. The feature allows users to create shareable links to their Python workspaces, which others can clone.

---

## Architecture & How It Works

### 1. **Share Creation Flow**
```
User clicks "Share" on Python workspace
    ↓
Frontend opens ShareWorkspaceModal
    ↓
User sets expiry time (1-168 hours) & max clones (optional)
    ↓
POST /api/workspace/{workspaceId}/share
    ↓
Backend creates Docker volume snapshot
    ↓
Generates unique 32-char share token
    ↓
Stores ShareSnapshot in MongoDB with metadata
    ↓
Returns shareable URL: http://localhost:5173/share/{shareToken}
```

### 2. **Share Preview Flow (Public)**
```
Anyone accesses: http://localhost:5173/share/{shareToken}
    ↓
GET /api/share/{shareToken}
    ↓
Backend validates token (not expired, clone limit not reached)
    ↓
Returns workspace preview (files, packages, size, owner info)
    ↓
User sees preview without needing to login
```

### 3. **Clone Flow**
```
User clicks "Clone Workspace" on preview
    ↓
User must be logged in (redirects to login if not)
    ↓
POST /api/share/{shareToken}/clone
    ↓
Backend launches new Python container
    ↓
Restores snapshot data into new container volume
    ↓
Creates new Workspace record in database
    ↓
Increments clone counter
    ↓
Returns IDE URL to user
    ↓
Opens IDE in new tab
```

---

## Current Implementation Status

### ✅ Already Implemented
- **Backend Models**: Workspace, ShareSnapshot, User, Activity
- **Share Service**: Volume snapshot creation/restoration
- **Share Controller**: All endpoints (create, preview, clone, revoke)
- **Share Routes**: All routes defined
- **Frontend Modal**: ShareWorkspaceModal component
- **Frontend Preview**: SharePreview component
- **Docker Service**: Container launch/stop/delete

### ⚠️ Missing Pieces
1. Share routes NOT registered in `backend/src/app.js`
2. SharePreview route NOT registered in `frontend/src