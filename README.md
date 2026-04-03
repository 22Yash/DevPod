# DevPod

Cloud development environment platform. Launch browser-based IDEs from templates, share workspaces, and push to GitHub — all from the browser.

**Live:** [https://mydevpod.me](https://mydevpod.me)

## Tech Stack

- **Frontend:** React 19, Vite, Tailwind CSS, Framer Motion
- **Backend:** Express 5, MongoDB (Mongoose), express-session
- **Workspaces:** Docker containers running code-server (browser-based VS Code)
- **Auth:** GitHub OAuth 2.0
- **Deployment:** DigitalOcean, Nginx, Let's Encrypt SSL

## Features

- One-click workspace launch (Python, Node.js, MERN Stack, Java)
- Browser-based VS Code IDE with full terminal
- Workspace sharing via link — clone any shared workspace
- Git integration — push, pull, clone using your GitHub account inside workspaces
- MERN workspaces with working frontend/backend dev servers
- Persistent storage via Docker volumes

## Repo Layout

```
backend/          Express API, MongoDB models, Docker orchestration
frontend/         React/Vite app
docker/
  python/         Python workspace Dockerfile
  nodejs/         Node.js workspace Dockerfile
  mern-template/  MERN stack workspace (frontend + backend + code-server)
  java/           Java workspace Dockerfile
docs/             Setup, build, and sharing documentation
scripts/build/    Docker image build scripts
```

## Local Development

```bash
# Backend
cd backend && npm install
cp .env.example .env  # configure env vars
npm run server

# Frontend
cd frontend && npm install
npm run dev

# Build Docker images
./scripts/build/build-images.sh
```

## Environment Variables

### Backend (.env)
```
MONGODB_URI=mongodb+srv://...
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
SESSION_SECRET=...
FRONTEND_URL=http://localhost:5173
PORT=4000
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:4000
VITE_GITHUB_CLIENT_ID=...
VITE_GITHUB_CALLBACK_URL=http://localhost:5173/auth/callback
```
