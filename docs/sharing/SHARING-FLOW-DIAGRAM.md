# 🔄 Workspace Sharing Flow - Visual Diagram

## Complete User Journey

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER A (OWNER)                          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  Create Python   │
                    │    Workspace     │
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  Add Files:      │
                    │  - app.py        │
                    │  - requirements  │
                    │  - README.md     │
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  Click Share 🔗  │
                    │  Button          │
                    └──────────────────┘
                              │
                              ▼
        ┌─────────────────────────────────────────┐
        │     Share Workspace Modal Opens         │
        ├─────────────────────────────────────────┤
        │  Expires In: [24] hours                 │
        │  Max Clones: [  ] (optional)            │
        │                                         │
        │  [Generate Share Link]                  │
        └─────────────────────────────────────────┘
                              │
                              ▼
        ┌─────────────────────────────────────────┐
        │     Backend Creates Snapshot            │
        ├─────────────────────────────────────────┤
        │  1. Extract files from container        │
        │  2. Read file contents                  │
        │  3. Parse requirements.txt              │
        │  4. Generate share token                │
        │  5. Save to MongoDB                     │
        └─────────────────────────────────────────┘
                              │
                              ▼
        ┌─────────────────────────────────────────┐
        │     Share Link Generated! ✓             │
        ├─────────────────────────────────────────┤
        │  Files: 5                               │
        │  Size: 12.5 KB                          │
        │  Expires: Feb 20, 2026                  │
        │                                         │
        │  http://localhost:5173/share/abc123xyz  │
        │  [Copy]                                 │
        └─────────────────────────────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  Copy & Share    │
                    │  URL with User B │
                    └──────────────────┘
                              │
                              │
════════════════════════════════════════════════════════════════════
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       USER B (RECIPIENT)                        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  Click Share URL │
                    └──────────────────┘
                              │
                              ▼
        ┌─────────────────────────────────────────┐
        │     Share Preview Page Loads            │
        ├─────────────────────────────────────────┤
        │  Shared by: User A                      │
        │  Template: Python                       │
        │                                         │
        │  📁 Files: 5                            │
        │  📦 Packages: 3                         │
        │  👥 Clones: 0                           │
        │                                         │
        │  Files Included:                        │
        │  - /app.py (2.5 KB)                     │
        │  - /requirements.txt (0.1 KB)           │
        │  - /README.md (1.2 KB)                  │
        │                                         │
        │  Python Packages:                       │
        │  flask==2.0.1  requests==2.26.0         │
        │                                         │
        │  Workspace Name: [My Copy]              │
        │  [🚀 Clone Workspace]                   │
        └─────────────────────────────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  Click Clone     │
                    │  Button          │
                    └──────────────────┘
                              │
                              ▼
        ┌─────────────────────────────────────────┐
        │     Backend Cloning Process             │
        ├─────────────────────────────────────────┤
        │  1. Create new Docker container         │
        │  2. Create new Docker volume            │
        │  3. Start container                     │
        │  4. Copy files from snapshot            │
        │  5. Create requirements.txt             │
        │  6. Run: pip install -r requirements    │
        │  7. Save workspace to database          │
        │  8. Increment clone count               │
        └─────────────────────────────────────────┘
                              │
                              ▼
        ┌─────────────────────────────────────────┐
        │     Cloning Complete! ✓                 │
        ├─────────────────────────────────────────┤
        │  Workspace cloned successfully!         │
        │  Redirecting to dashboard...            │
        └─────────────────────────────────────────┘
                              │
                              ▼
        ┌─────────────────────────────────────────┐
        │     Dashboard - My Workspaces           │
        ├─────────────────────────────────────────┤
        │  ┌─────────────────────────────────┐   │
        │  │  My Copy          [running]     │   │
        │  │  Python workspace               │   │
        │  │  [Open]  [🔗]  [⚙️]             │   │
        │  └─────────────────────────────────┘   │
        └─────────────────────────────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  Click Open      │
                    └──────────────────┘
                              │
                              ▼
        ┌─────────────────────────────────────────┐
        │     Code-Server IDE Opens               │
        ├─────────────────────────────────────────┤
        │  Files:                                 │
        │  ├── app.py                             │
        │  ├── requirements.txt                   │
        │  └── README.md                          │
        │                                         │
        │  Terminal:                              │
        │  $ pip list                             │
        │  flask        2.0.1                     │
        │  requests     2.26.0                    │
        │                                         │
        │  ✓ All files copied                     │
        │  ✓ All packages installed               │
        │  ✓ Ready to code!                       │
        └─────────────────────────────────────────┘
```

## Technical Flow

```
┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│   Frontend   │         │   Backend    │         │   Docker     │
└──────────────┘         └──────────────┘         └──────────────┘
       │                        │                        │
       │  POST /share           │                        │
       │───────────────────────>│                        │
       │                        │  docker exec           │
       │                        │───────────────────────>│
       │                        │  find /workspace       │
       │                        │<───────────────────────│
       │                        │  [file list]           │
       │                        │                        │
       │                        │  docker exec           │
       │                        │───────────────────────>│
       │                        │  cat /workspace/app.py │
       │                        │<───────────────────────│
       │                        │  [file content]        │
       │                        │                        │
       │                        │  Save to MongoDB       │
       │                        │  ─────────────>        │
       │  {shareUrl, token}     │                        │
       │<───────────────────────│                        │
       │                        │                        │
       │  GET /share/:token     │                        │
       │───────────────────────>│                        │
       │  {preview data}        │                        │
       │<───────────────────────│                        │
       │                        │                        │
       │  POST /share/:token/   │                        │
       │       clone            │                        │
       │───────────────────────>│                        │
       │                        │  docker create         │
       │                        │───────────────────────>│
       │                        │  [container ID]        │
       │                        │<───────────────────────│
       │                        │                        │
       │                        │  docker start          │
       │                        │───────────────────────>│
       │                        │  [started]             │
       │                        │<───────────────────────│
       │                        │                        │
       │                        │  docker exec           │
       │                        │───────────────────────>│
       │                        │  echo 'content' > file │
       │                        │<───────────────────────│
       │                        │  [file created]        │
       │                        │                        │
       │                        │  docker exec           │
       │                        │───────────────────────>│
       │                        │  pip install -r req.txt│
       │                        │<───────────────────────│
       │                        │  [packages installed]  │
       │                        │                        │
       │  {workspace, ideUrl}   │                        │
       │<───────────────────────│                        │
       │                        │                        │
```

## Database State Changes

### Before Sharing
```
workspaces collection:
{
  workspaceId: "user-a-python-123",
  name: "My Python Project",
  status: "running",
  isShared: false,
  shareToken: null
}

sharesnapshots collection:
(empty)
```

### After Creating Share Link
```
workspaces collection:
{
  workspaceId: "user-a-python-123",
  name: "My Python Project",
  status: "running",
  isShared: true,              ← Updated
  shareToken: "abc123xyz"      ← Updated
}

sharesnapshots collection:
{
  shareToken: "abc123xyz",     ← New
  workspaceId: "user-a-python-123",
  snapshot: {
    files: [...],
    packages: [...]
  },
  cloneCount: 0
}
```

### After Cloning
```
workspaces collection:
{
  workspaceId: "user-a-python-123",
  name: "My Python Project",
  isShared: true,
  shareToken: "abc123xyz"
},
{
  workspaceId: "user-b-python-456",  ← New
  name: "My Copy",
  status: "running",
  clonedFrom: "abc123xyz"            ← New
}

sharesnapshots collection:
{
  shareToken: "abc123xyz",
  cloneCount: 1                      ← Incremented
}
```

## File System Changes

### Original Workspace (User A)
```
Docker Volume: devpod-user-a-python-123
/workspace/
├── app.py
├── requirements.txt
└── README.md
```

### Cloned Workspace (User B)
```
Docker Volume: devpod-user-b-python-456
/workspace/
├── app.py              ← Copied
├── requirements.txt    ← Copied
└── README.md           ← Copied

Packages installed:
- flask==2.0.1
- requests==2.26.0
```

## Timeline

```
T+0s    User A clicks Share button
T+1s    Modal opens
T+2s    User A clicks Generate
T+3s    Backend extracts files
T+5s    Snapshot saved to DB
T+6s    Share URL displayed
T+7s    User A copies URL

─────────────────────────────────────

T+0s    User B opens share URL
T+1s    Preview page loads
T+2s    User B clicks Clone
T+3s    Backend creates container
T+10s   Container started
T+15s   Files copied
T+30s   Packages installing
T+45s   Installation complete
T+46s   Workspace saved to DB
T+47s   Redirect to dashboard
T+48s   User B sees new workspace
```

## Success Indicators

✅ Share button appears on Python workspaces
✅ Modal opens with configuration
✅ Share link generated in 2-5 seconds
✅ Preview page shows all details
✅ Clone completes in 30-60 seconds
✅ All files present in cloned workspace
✅ All packages installed correctly
✅ Both workspaces independent
