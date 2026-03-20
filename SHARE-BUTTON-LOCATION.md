# Share Button Location Guide

## Where to Find the Share Button

### Dashboard View

```
┌─────────────────────────────────────────────────────────────┐
│  My Workspaces Tab                                          │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  Workspace Card: "my-python-project"                        │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  🐍 my-python-project              [running]         │   │
│  │  Python development workspace                        │   │
│  │                                                       │   │
│  │  📝 python  🌿 1  👥 0                               │   │
│  │                                                       │   │
│  │  Last accessed: Feb 19, 2026                         │   │
│  │                                                       │   │
│  │  ┌────────┐  ┌──┐  ┌──┐                             │   │
│  │  │  Open  │  │🔗│  │⚙️│  ← Share button here!      │   │
│  │  └────────┘  └──┘  └──┘                             │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Button Visibility Rules

### ✅ Share Button WILL Appear When:
- Workspace template is "python"
- Workspace status is "running"
- You are the owner of the workspace

### ❌ Share Button WILL NOT Appear When:
- Workspace template is NOT "python" (nodejs, mern, java)
- Workspace status is "stopped" or "starting"
- Workspace belongs to someone else

## Visual Examples

### Example 1: Python Workspace (Running) ✅
```
┌────────────────────────────────────────────┐
│  my-python-app          [running]         │
│  Python development workspace             │
│                                            │
│  Last accessed: Today                     │
│  ┌────────┐  ┌──────┐  ┌──┐              │
│  │  Open  │  │ 🔗   │  │⚙️│              │
│  └────────┘  └──────┘  └──┘              │
│              Share button visible!        │
└────────────────────────────────────────────┘
```

### Example 2: Python Workspace (Stopped) ❌
```
┌────────────────────────────────────────────┐
│  my-python-app          [stopped]         │
│  Python development workspace             │
│                                            │
│  Last accessed: Yesterday                 │
│  ┌────────┐  ┌──┐                         │
│  │  Start │  │⚙️│                         │
│  └────────┘  └──┘                         │
│              No share button              │
└────────────────────────────────────────────┘
```

### Example 3: Node.js Workspace (Running) ❌
```
┌────────────────────────────────────────────┐
│  my-nodejs-app          [running]         │
│  Node.js development workspace            │
│                                            │
│  Last accessed: Today                     │
│  ┌────────┐  ┌──┐                         │
│  │  Open  │  │⚙️│                         │
│  └────────┘  └──┘                         │
│              No share button (not Python) │
└────────────────────────────────────────────┘
```

## Share Modal Flow

### Step 1: Click Share Button
```
Click the 🔗 icon → Modal opens
```

### Step 2: Configure Options
```
┌─────────────────────────────────────────┐
│  Share Workspace                        │
├─────────────────────────────────────────┤
│                                         │
│  my-python-project                      │
│  [python]                               │
│                                         │
│  Expires In (hours): [24]               │
│  Max Clones: [    ] (optional)          │
│                                         │
│  [Generate Share Link]                  │
│                                         │
└─────────────────────────────────────────┘
```

### Step 3: Share Link Generated
```
┌─────────────────────────────────────────┐
│  Share Workspace                        │
├─────────────────────────────────────────┤
│                                         │
│  ✓ Share link created successfully!    │
│                                         │
│  Files: 5                               │
│  Size: 12.5 KB                          │
│  Expires: Feb 20, 2026 10:00 AM        │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ http://localhost:5173/share/... │   │
│  └─────────────────────────────────┘   │
│  [Copy]                                 │
│                                         │
│  [Revoke Link]  [Done]                  │
│                                         │
└─────────────────────────────────────────┘
```

## Troubleshooting

### "I don't see the Share button"

**Check 1: Is it a Python workspace?**
- Look at the workspace card
- Should show "python" in the template info
- Other templates (nodejs, mern, java) don't support sharing yet

**Check 2: Is the workspace running?**
- Status badge should show [running] in green
- If it shows [stopped], click "Start" first
- Wait for status to change to [running]

**Check 3: Did you refresh the page?**
- Press F5 or Ctrl+R to refresh
- Sometimes the UI needs to update

**Check 4: Check browser console**
- Press F12 to open DevTools
- Look for any JavaScript errors
- Check if ShareWorkspaceModal.jsx is loaded

### "Share button is there but nothing happens"

**Check 1: Browser console errors**
- Open DevTools (F12)
- Click the Share button
- Look for errors in Console tab

**Check 2: Backend is running**
- Check if backend server is running on port 3000
- Visit http://localhost:3000/api/health
- Should return {"status": "ok"}

**Check 3: Authentication**
- Make sure you're logged in
- Check if session is valid
- Try logging out and back in

## Quick Test Checklist

- [ ] Backend server running
- [ ] Frontend server running
- [ ] Docker Desktop running
- [ ] Logged in to application
- [ ] Python workspace created
- [ ] Workspace status is "running"
- [ ] Share button (🔗) visible next to Open button
- [ ] Clicking Share button opens modal
- [ ] Can generate share link
- [ ] Can copy share URL
- [ ] Share URL works in new tab
- [ ] Can clone workspace
- [ ] Cloned workspace appears in dashboard
