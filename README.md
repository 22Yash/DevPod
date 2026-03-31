# DevPod

Cloud workspace demo app with a React frontend, an Express/Mongo backend, and Docker-managed developer environments.

## Start Here

- Demo/operator flow: [DEMO.md](/Users/bharatmac/Folders/Code/DevPod/DEMO.md)
- Setup navigation: [START-HERE.md](/Users/bharatmac/Folders/Code/DevPod/docs/setup/START-HERE.md)
- Setup guide: [TEAM-SETUP-GUIDE.md](/Users/bharatmac/Folders/Code/DevPod/docs/setup/TEAM-SETUP-GUIDE.md)

## Repo Layout

- [backend](/Users/bharatmac/Folders/Code/DevPod/backend): Express API, Mongo models, Docker/workspace orchestration
- [backend/scripts](/Users/bharatmac/Folders/Code/DevPod/backend/scripts): demo reset and backend-only debug helpers
- [frontend](/Users/bharatmac/Folders/Code/DevPod/frontend): React/Vite app
- [docker](/Users/bharatmac/Folders/Code/DevPod/docker): workspace images and templates
- [docs](/Users/bharatmac/Folders/Code/DevPod/docs): setup, build, sharing, and archived project documentation
- [scripts](/Users/bharatmac/Folders/Code/DevPod/scripts): build and setup entrypoints

## Common Commands

- Start backend: `npm run server --prefix backend`
- Start frontend: `npm run dev --prefix frontend`
- Reset demo state: `npm run demo:reset`
- Build Docker images: `./scripts/build/build-images.sh`
- Build Docker images on Windows: `scripts\\build\\build-images.bat`
- Build frontend: `npm run build --prefix frontend`
- Run backend tests: `npm test -- --runInBand --prefix backend`
