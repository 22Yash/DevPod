<div align="center">

# DevPod

**Cloud development environments in one click.**

Launch browser-based IDEs from templates, share workspaces via link, and push to GitHub — without installing anything locally.

[Live Demo](https://mydevpod.me) · [Report Bug](https://github.com/22Yash/DevPod/issues) · [Request Feature](https://github.com/22Yash/DevPod/issues)

---

</div>

## About

DevPod is a cloud IDE platform that spins up isolated, pre-configured development environments using Docker. Users authenticate with GitHub, pick a template, and get a full VS Code editor running in their browser within seconds.

### Key Features

- **One-click workspace launch** — Python, Node.js, MERN Stack, and Java templates ready to go
- **Browser-based VS Code** — Full IDE with terminal, extensions, and file management powered by code-server
- **Workspace sharing** — Generate a shareable link. Anyone can clone your workspace with one click
- **Git integration** — Push, pull, and clone repos inside workspaces using your GitHub credentials
- **MERN dev servers** — Frontend and backend dev servers accessible via HTTPS subdomains
- **Persistent storage** — Docker volumes preserve your files between sessions

### Built With

- **Frontend** — React 19, Vite, Tailwind CSS, Framer Motion
- **Backend** — Express 5, MongoDB, express-session
- **Workspaces** — Docker, code-server
- **Auth** — GitHub OAuth 2.0
- **Infra** — DigitalOcean, Nginx, Let's Encrypt SSL

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│  Browser                                                │
│  ┌──────────┐  ┌──────────────┐  ┌───────────────────┐  │
│  │ Landing  │  │  Dashboard   │  │  Share Preview    │  │
│  │  Page    │  │  + Templates │  │  + Clone Flow     │  │
│  └────┬─────┘  └──────┬───────┘  └────────┬──────────┘  │
│       │               │                   │              │
└───────┼───────────────┼───────────────────┼──────────────┘
        │               │                   │
        ▼               ▼                   ▼
┌─────────────────────────────────────────────────────────┐
│  Nginx (SSL + Reverse Proxy)                            │
│  mydevpod.me → Frontend (static)                        │
│  mydevpod.me/api → Express Backend (:4000)              │
│  ws-{port}.mydevpod.me → Workspace containers           │
└───────────────────────┬─────────────────────────────────┘
                        │
        ┌───────────────┼───────────────┐
        ▼               ▼               ▼
┌──────────────┐ ┌─────────────┐ ┌─────────────┐
│ Express API  │ │  MongoDB    │ │   Docker    │
│  - Auth      │ │  Atlas      │ │  Containers │
│  - Workspaces│ │  - Users    │ │  - Python   │
│  - Sharing   │ │  - Sessions │ │  - Node.js  │
│  - Git creds │ │  - Shares   │ │  - MERN     │
└──────────────┘ └─────────────┘ │  - Java     │
                                 └─────────────┘
```

## Getting Started

### Prerequisites

- Node.js 20+
- Docker Desktop
- MongoDB Atlas account (or local MongoDB)
- GitHub OAuth App

### Installation

1. **Clone the repo**
   ```bash
   git clone https://github.com/22Yash/DevPod.git
   cd DevPod
   ```

2. **Set up the backend**
   ```bash
   cd backend
   npm install
   ```

   Create `backend/.env`:
   ```
   MONGODB_URI=mongodb+srv://...
   GITHUB_CLIENT_ID=your_client_id
   GITHUB_CLIENT_SECRET=your_client_secret
   SESSION_SECRET=any_random_string
   FRONTEND_URL=http://localhost:5173
   PORT=4000
   ```

3. **Set up the frontend**
   ```bash
   cd frontend
   npm install
   ```

   Create `frontend/.env`:
   ```
   VITE_API_URL=http://localhost:4000
   VITE_GITHUB_CLIENT_ID=your_client_id
   VITE_GITHUB_CALLBACK_URL=http://localhost:5173/auth/callback
   ```

4. **Build Docker images**
   ```bash
   ./scripts/build/build-images.sh
   ```

5. **Start the app**
   ```bash
   # Terminal 1 — Backend
   cd backend && npm run server

   # Terminal 2 — Frontend
   cd frontend && npm run dev
   ```

6. **Open** [http://localhost:5173](http://localhost:5173)

## Project Structure

```
DevPod/
├── backend/
│   ├── server.js                 # Entry point
│   └── src/
│       ├── app.js                # Express setup, middleware, routes
│       ├── config/database.js    # MongoDB connection
│       ├── controllers/          # Auth, workspace, share handlers
│       ├── models/               # User, Workspace, Activity, ShareSnapshot
│       ├── routes/               # API route definitions
│       └── services/             # Docker orchestration, GitHub, sharing
├── frontend/
│   └── src/
│       ├── App.jsx               # Router setup
│       ├── components/           # Toast, ConfirmDialog, ShareModal, ProtectedRoute
│       └── pages/                # Landing, Dashboard, AuthCallback, SharePreview
├── docker/
│   ├── python/                   # Python workspace image
│   ├── nodejs/                   # Node.js workspace image
│   ├── mern-template/            # MERN stack workspace image
│   └── java/                     # Java workspace image
└── scripts/build/                # Docker image build scripts
```

## How Sharing Works

1. User clicks **Share** on a running workspace
2. Backend snapshots all files from the Docker container
3. A unique share token is generated and stored with the snapshot
4. Anyone with the link sees a preview of the workspace contents
5. Clicking **Clone** launches a new container, restores the files, and installs dependencies
6. The cloner gets their own independent copy with their own Git credentials

## Deployment

The app is deployed on a single DigitalOcean droplet:

- **Frontend** — Built with Vite, served as static files by Nginx
- **Backend** — Runs via PM2 with auto-restart
- **SSL** — Let's Encrypt wildcard certificate for `*.mydevpod.me`
- **Workspaces** — Each workspace gets an HTTPS subdomain: `ws-{port}.mydevpod.me`

## License

Distributed under the MIT License.
