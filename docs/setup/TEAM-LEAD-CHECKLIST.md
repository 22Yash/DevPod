# Team Lead Checklist - DevPod Setup Distribution

Use this checklist to ensure your team members have everything they need for successful setup.

---

## 📋 Pre-Distribution Checklist

### Prepare Repository

- [ ] Code is pushed to GitHub
- [ ] `.gitignore` includes `.env` files
- [ ] `.env.example` files created (without secrets)
- [ ] All dependencies are in `package.json`
- [ ] Docker build scripts are executable
- [ ] README.md is up to date

### Prepare Documentation

- [ ] TEAM-SETUP-GUIDE.md is in docs/setup
- [ ] CODESERVER-LOGIN-FIX.md is in docs/setup
- [ ] ENV-SETUP-TEMPLATE.md is in docs/setup
- [ ] QUICK-REFERENCE.md is in docs/setup
- [ ] SETUP-DOCUMENTS-SUMMARY.md is in docs/setup
- [ ] scripts/setup/QUICK-SETUP.bat is available (Windows)
- [ ] scripts/setup/QUICK-SETUP.sh is available (macOS/Linux)

### Prepare Credentials

- [ ] GitHub OAuth App created
  - [ ] Client ID noted
  - [ ] Client Secret noted
  - [ ] Callback URL set to `http://localhost:5173/auth/callback`
- [ ] MongoDB Atlas cluster created
  - [ ] Connection string obtained
  - [ ] IP whitelist configured (0.0.0.0/0 for dev)
  - [ ] Database user created
- [ ] Session secret generated (random 32-char string)

### Prepare Environment Templates

- [ ] `backend/.env.example` created with placeholders
- [ ] `frontend/.env.example` created with placeholders
- [ ] Both files committed to git
- [ ] Actual `.env` files in `.gitignore`

---

## 📧 Communication Template

Send this to your team members:

---

### Subject: DevPod Setup Instructions - Please Follow These Steps

Hi Team,

We're setting up the DevPod project on your machines. Please follow these steps carefully.

#### Step 1: Clone Repository

```bash
git clone https://github.com/YOUR_ORG/devpod.git
cd devpod
```

#### Step 2: Choose Your Setup Method

**Option A: Automated Setup (Recommended)**

Windows:
```bash
scripts/setup/QUICK-SETUP.bat
```

macOS/Linux:
```bash
chmod +x scripts/setup/QUICK-SETUP.sh
./scripts/setup/QUICK-SETUP.sh
```

**Option B: Manual Setup**

Follow: `TEAM-SETUP-GUIDE.md`

#### Step 3: Configure Environment Variables

1. Get credentials from me (team lead)
2. Follow: `ENV-SETUP-TEMPLATE.md`
3. Create `backend/.env` with provided credentials
4. Create `frontend/.env` with provided credentials

#### Step 4: Start Services

Terminal 1 (Backend):
```bash
cd backend
npm run server
```

Terminal 2 (Frontend):
```bash
cd frontend
npm run dev
```

#### Step 5: Verify Setup

1. Open http://localhost:5173
2. Click "Login with GitHub"
3. Click "Use Template" on any template
4. Code-server should load

#### Step 6: Troubleshooting

If you get "please login in a codeserver" error:
- Read: `CODESERVER-LOGIN-FIX.md`
- Try: Quick fix section first

For other issues:
- Check: `QUICK-REFERENCE.md`
- Read: `TEAM-SETUP-GUIDE.md` troubleshooting section

#### Questions?

1. Check the documentation first
2. Ask in team chat
3. Schedule a call if needed

---

---

## 🔐 Credentials Distribution Checklist

### For Each Team Member

- [ ] GitHub OAuth App credentials
  - [ ] Client ID: `Ov23lia1ACkI4M6uTO34`
  - [ ] Client Secret: `[REDACTED]`
- [ ] MongoDB Connection String
  - [ ] `mongodb+srv://[user]:[pass]@cluster0.jkaz2i5.mongodb.net/devpod`
- [ ] Session Secret
  - [ ] `[REDACTED]`

### Distribution Method

- [ ] Use secure password manager (1Password, LastPass, etc.)
- [ ] Or: Send via encrypted email
- [ ] Or: Share in private team channel
- [ ] **Never:** Commit to git or share in public channels

### Verification

- [ ] Each team member confirms receipt
- [ ] Each team member confirms setup works
- [ ] Each team member can login with GitHub
- [ ] Each team member can launch templates

---

## 🎯 Setup Verification Calls

### Schedule with Each Team Member

- [ ] 30-minute setup call
- [ ] Screen share to verify setup
- [ ] Test login with GitHub
- [ ] Test launching a template
- [ ] Troubleshoot any issues

### During Call

1. **Verify Prerequisites**
   - Node.js installed: `node --version`
   - Docker installed: `docker --version`
   - Docker running: `docker ps`

2. **Verify Setup**
   - Backend running: `curl http://localhost:4000`
   - Frontend running: `curl http://localhost:5173`
   - Can access http://localhost:5173

3. **Verify Functionality**
   - Can login with GitHub
   - Dashboard loads
   - Can click "Use Template"
   - Code-server loads

4. **Troubleshoot Issues**
   - Check logs together
   - Verify environment variables
   - Test MongoDB connection
   - Test GitHub OAuth

---

## 📊 Team Setup Status Tracker

| Team Member | Status | Date | Notes |
|-------------|--------|------|-------|
| [Name] | ⏳ In Progress | | |
| [Name] | ✅ Complete | | |
| [Name] | ❌ Blocked | | |

---

## 🆘 Common Issues to Watch For

### Issue 1: "Please login in a codeserver"

**Solution:**
- Clear browser cookies
- Re-login with GitHub
- Restart backend
- Check MongoDB connection

**Prevention:**
- Ensure MongoDB URI is correct
- Ensure GitHub OAuth credentials are correct
- Ensure session secret is set

### Issue 2: Docker Images Not Found

**Solution:**
- Run build script: `scripts\build\build-images.bat` or `./scripts/build/build-images.sh`
- Verify images: `docker images | grep devpod`

**Prevention:**
- Run build script before first launch
- Verify images exist before troubleshooting

### Issue 3: Port Already in Use

**Solution:**
- Find process: `netstat -ano | findstr :4000`
- Kill process: `taskkill /PID [PID] /F`
- Restart service

**Prevention:**
- Ensure previous instances are stopped
- Use different ports if needed

### Issue 4: MongoDB Connection Failed

**Solution:**
- Verify connection string
- Check IP whitelist in MongoDB Atlas
- Test connection: `node backend/test-mongo.js`

**Prevention:**
- Provide correct connection string
- Add IP to whitelist before distribution
- Test connection string yourself first

### Issue 5: GitHub OAuth Error

**Solution:**
- Verify Client ID and Secret
- Check OAuth App settings
- Restart backend

**Prevention:**
- Test OAuth flow yourself first
- Provide correct credentials
- Document callback URL clearly

---

## 📚 Documentation Checklist

### For Team Members

- [ ] TEAM-SETUP-GUIDE.md - Full setup guide
- [ ] CODESERVER-LOGIN-FIX.md - Troubleshooting
- [ ] ENV-SETUP-TEMPLATE.md - Environment setup
- [ ] QUICK-REFERENCE.md - Quick lookup
- [ ] SETUP-DOCUMENTS-SUMMARY.md - Navigation guide

### For Team Lead

- [ ] TEAM-LEAD-CHECKLIST.md - This file
- [ ] Credentials securely stored
- [ ] Setup verification plan
- [ ] Troubleshooting guide prepared

---

## 🚀 Launch Day Checklist

### Before Sending to Team

- [ ] All documentation is complete
- [ ] All credentials are prepared
- [ ] All scripts are tested
- [ ] All Docker images build successfully
- [ ] Setup has been tested end-to-end
- [ ] Troubleshooting guide is comprehensive

### When Sending to Team

- [ ] Send setup instructions email
- [ ] Provide credentials securely
- [ ] Schedule setup calls
- [ ] Create team chat channel for questions
- [ ] Set expectations for timeline

### After Team Starts Setup

- [ ] Monitor for questions
- [ ] Help troubleshoot issues
- [ ] Verify each member's setup
- [ ] Document any new issues
- [ ] Update documentation as needed

---

## 📈 Success Metrics

### Individual Success

- ✅ Backend running on port 4000
- ✅ Frontend running on port 5173
- ✅ Can login with GitHub
- ✅ Can launch templates
- ✅ Code-server loads without login
- ✅ Can create files in code-server

### Team Success

- ✅ All team members have working setup
- ✅ All team members can login
- ✅ All team members can launch templates
- ✅ No critical blockers
- ✅ Team is productive

---

## 📝 Post-Setup Follow-up

### After 1 Week

- [ ] Check in with team members
- [ ] Ask about any issues
- [ ] Collect feedback on documentation
- [ ] Update documentation based on feedback

### After 1 Month

- [ ] Review setup process
- [ ] Identify improvements
- [ ] Update documentation
- [ ] Create video tutorial if needed

### Ongoing

- [ ] Keep documentation updated
- [ ] Document new issues and solutions
- [ ] Update scripts as needed
- [ ] Help new team members with setup

---

## 🎓 Knowledge Transfer

### Create Internal Wiki

- [ ] Copy all documentation to internal wiki
- [ ] Add team-specific notes
- [ ] Add troubleshooting solutions
- [ ] Add video tutorials

### Create Video Tutorials

- [ ] Setup walkthrough (10 min)
- [ ] Troubleshooting guide (5 min)
- [ ] Feature walkthrough (10 min)

### Create FAQ

- [ ] Common questions
- [ ] Common issues
- [ ] Quick solutions
- [ ] Links to detailed docs

---

## 🔄 Maintenance Schedule

### Weekly

- [ ] Monitor team for issues
- [ ] Update documentation as needed
- [ ] Help new team members

### Monthly

- [ ] Review setup process
- [ ] Update documentation
- [ ] Collect team feedback

### Quarterly

- [ ] Major documentation review
- [ ] Update scripts and tools
- [ ] Plan improvements

---

## 📞 Support Plan

### Tier 1: Self-Service

- Documentation
- Quick reference
- FAQ

### Tier 2: Team Chat

- Ask in team channel
- Get help from team members
- Share solutions

### Tier 3: Team Lead

- Schedule call
- Screen share
- Direct troubleshooting

### Tier 4: Escalation

- Document issue
- Research solution
- Update documentation

---

## ✅ Final Checklist

Before declaring setup complete:

- [ ] All team members have working setup
- [ ] All team members can login
- [ ] All team members can launch templates
- [ ] All team members have documentation
- [ ] All team members know how to get help
- [ ] All issues are documented
- [ ] All solutions are documented
- [ ] Team is ready to start development

---

## 📋 Sign-Off

**Team Lead:** _________________ **Date:** _________

**Notes:**
```
[Add any notes about setup process, issues encountered, solutions found, etc.]
```

---

**Last Updated:** March 2026
**Version:** 1.0.0
