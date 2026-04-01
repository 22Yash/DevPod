# Exhibition Hosted Deployment Blueprint

This document is the source of truth for the hosted exhibition deployment.

We will not try to improvise architecture while deploying. We will execute this plan in small verified phases.

## Goal

Deploy DevPod as a publicly accessible, professional-looking exhibition app that supports the real end-to-end story:

1. open landing page
2. log in with GitHub
3. create a workspace
4. open the IDE
5. share a workspace
6. open the share page from another browser or machine
7. clone the workspace
8. open the cloned IDE

## Non-Goals

- enterprise-grade security
- auto-scaling
- multi-region deployment
- zero-downtime rollouts
- public self-service usage after the exhibition

This deployment is for a real hosted demo, not a production SaaS launch.

## Chosen Path

We will use a single VPS with Docker on the host and Traefik as the public reverse proxy.

### Why this path

- the backend already controls Docker directly to create workspaces
- a VPS gives us full control over Docker, ports, volumes, and networking
- Traefik can watch Docker and dynamically route traffic to workspace containers using labels
- Traefik can also manage HTTPS certificates
- this keeps the entire demo on one machine, which is easier to reason about than a split multi-service cloud deployment

## Final Target Architecture

### Public URLs

- main app: `https://app.<ROOT_DOMAIN>`
- workspace IDEs: `https://<workspace-slug>.ws.<ROOT_DOMAIN>`
- share preview pages: `https://app.<ROOT_DOMAIN>/share/<token>`

### Infrastructure

- 1 Ubuntu VPS
- Docker Engine on the VPS
- Traefik container on the VPS
- backend container on the VPS
- frontend static container on the VPS
- MongoDB Atlas as the database
- GitHub OAuth App configured for the public frontend URL
- DNS for:
  - `app.<ROOT_DOMAIN>`
  - `*.ws.<ROOT_DOMAIN>`

### Container model

- Traefik is the single public entry point on ports 80 and 443
- frontend is served as a production build behind Traefik
- backend API is routed behind Traefik
- every workspace container joins the Traefik Docker network and gets its own Traefik labels
- Traefik routes the workspace hostname to the correct container on port 8080

## Why We Are Not Using the Current Local Model

The current code is local-first:

- workspace URLs are returned as `http://localhost:<port>`
- code-server is launched with `--auth none`
- the current frontend Dockerfile runs Vite dev mode
- the current docker-compose file is a development file, not a production deployment file

That is acceptable locally, but not for a hosted exhibition deployment.

## High-Level Technical Decisions

### 1. Single VPS, not Vercel/Heroku-style deployment

Reason:
- the backend must talk to a real Docker daemon and create containers dynamically
- the app is a control plane plus a runtime host, not just a web API

### 2. Traefik, not hand-written Nginx config

Reason:
- workspace containers are created dynamically
- Traefik can discover Docker containers automatically via labels
- Traefik is a much better fit than static reverse-proxy config for runtime-created containers

### 3. One app domain plus one workspace wildcard domain

Reason:
- keeps the main app simple
- avoids path-prefix complexity for code-server
- gives every workspace a clean hostname

### 4. DNS challenge for wildcard certificates

We will prefer a wildcard certificate for `*.ws.<ROOT_DOMAIN>` instead of issuing a new certificate for every workspace subdomain.

Reason:
- avoids Let's Encrypt rate-limit problems during repeated demo use
- makes workspace creation more predictable during the exhibition

### 5. Demo reset remains an operator command

`npm run demo:reset` will stay SSH-only.

Reason:
- it needs Docker and database access
- it is an operator maintenance action, not a user-facing feature

## Expected Final UX

### Main app

- user opens `https://app.<ROOT_DOMAIN>`
- landing page loads over HTTPS
- GitHub login works
- dashboard works after login

### Workspace launch

- user clicks `Use`
- backend creates a workspace container
- backend returns `https://<workspace-slug>.ws.<ROOT_DOMAIN>`
- a new browser tab opens to that URL
- the IDE loads over HTTPS

### Share flow

- user creates a share link from the dashboard
- share preview opens on the main app domain
- second user can clone from the share page
- cloned workspace opens at its own workspace hostname

### Reset flow

- operator SSHs into the VPS
- operator runs `npm run demo:reset`
- demo workspaces, shares, and Docker demo resources are cleaned up
- public app stays up

## Required Environment Variables

### Backend runtime

- `MONGODB_URI`
- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`
- `SESSION_SECRET`
- `PORT`
- `NODE_ENV=production`
- `FRONTEND_URL=https://app.<ROOT_DOMAIN>`
- `ROOT_DOMAIN=<ROOT_DOMAIN>`
- `APP_SUBDOMAIN=app`
- `WORKSPACE_BASE_DOMAIN=ws.<ROOT_DOMAIN>`
- `WORKSPACE_PROTOCOL=https`
- `TRAEFIK_NETWORK=traefik`

### Frontend build-time

- `VITE_API_URL=https://app.<ROOT_DOMAIN>`
- `VITE_GITHUB_CLIENT_ID=<same GitHub client id>`
- `VITE_GITHUB_CALLBACK_URL=https://app.<ROOT_DOMAIN>/auth/callback`

### Traefik / DNS challenge

- `DO_AUTH_TOKEN` if we use DigitalOcean DNS with Traefik ACME DNS challenge
- ACME email address

## Required Code Changes Before Deployment

### Backend

1. stop generating workspace URLs with `localhost`
2. generate a stable workspace hostname from `workspaceId`
3. attach Traefik labels to workspace containers at creation time
4. attach workspace containers to the Traefik Docker network
5. return public workspace HTTPS URLs from launch and resume endpoints
6. keep `demo:reset` working with the deployed naming scheme

### Frontend

1. create a production-ready frontend container
2. stop relying on Vite dev mode in hosted deployment
3. build with production `VITE_*` values

### Deployment config

1. create production compose files or equivalent container run config
2. add Traefik service
3. add persistent storage for Traefik ACME data
4. define Docker networks clearly:
   - public reverse-proxy network
   - optional internal app network if needed

## Deployment Phases

We will execute these phases one at a time.

### Phase 0: Lock Inputs

Goal:
- finalize provider
- finalize domain strategy
- finalize exact public URL shape

Exit criteria:
- provider chosen
- domain acquired or ready
- final hostname pattern agreed

### Phase 1: Prepare Hosting Accounts

Goal:
- VPS account ready
- MongoDB Atlas ready
- DNS management ready
- GitHub OAuth app ready for the future public callback URL

Exit criteria:
- VPS can be created
- Atlas cluster exists
- domain and DNS are under control
- OAuth credentials available

### Phase 2: Production Architecture Changes in Code

Goal:
- make the app produce public workspace URLs
- make workspace containers discoverable by Traefik
- add production frontend container support

Exit criteria:
- code can build for production
- workspace URL generation is env-driven
- Traefik labels/networking are implemented

### Phase 3: Production Container Stack

Goal:
- create the VPS runtime stack
- Traefik, frontend, and backend run together cleanly

Exit criteria:
- frontend reachable on the VPS
- backend API reachable on the VPS
- Traefik routes correctly

### Phase 4: DNS and HTTPS

Goal:
- public domains point at the VPS
- TLS works for app and workspace domains

Exit criteria:
- `https://app.<ROOT_DOMAIN>` loads cleanly
- a test workspace hostname resolves and serves HTTPS

### Phase 5: Workspace Runtime Verification

Goal:
- real workspace launch works in hosted mode
- real IDE URL opens remotely

Exit criteria:
- create workspace works
- IDE opens over public HTTPS
- stop/start still works

### Phase 6: Share and Clone Verification

Goal:
- hosted share flow works end to end

Exit criteria:
- share link generated
- share preview opens
- clone creates a new workspace
- clone IDE opens remotely

### Phase 7: Exhibition Hardening

Goal:
- reset flow verified
- rehearsal runs stable
- operator procedure finalized

Exit criteria:
- `demo:reset` verified on the VPS
- 5 to 10 rehearsal cycles succeed
- recovery procedure documented

## Known Gotchas We Must Design Around

### 1. `localhost` links

Current code returns `localhost` workspace URLs. This must change before hosted deployment.

### 2. Dynamic workspace routing

We cannot rely on random open host ports for a clean deployment. Traefik-based hostname routing is the clean path.

### 3. Certificate rate limits

If every workspace gets a fresh subdomain certificate through HTTP challenge, repeated demo use can become messy. Prefer wildcard certificate strategy for workspace domains.

### 4. GitHub OAuth exact callback URL

The callback URL configured in GitHub must exactly match the deployed frontend callback URL.

### 5. Frontend env vars are build-time values

If the frontend API URL or callback URL changes, the frontend must be rebuilt.

### 6. Session cookies in production

Production runs with secure cookies and cross-site behavior. HTTPS must be working correctly before login can be trusted.

### 7. DNS propagation

DNS changes may not be instant. We must not treat domain changes as a same-minute task on exhibition day.

## Final Deliverables

By the end of this deployment project we want:

1. a hosted DevPod app at `https://app.<ROOT_DOMAIN>`
2. hosted workspace IDEs at `https://<workspace-slug>.ws.<ROOT_DOMAIN>`
3. hosted share and clone flow working remotely
4. a repeatable operator reset flow
5. an exhibition-ready operating checklist

## Operating Rules During the Exhibition

1. keep the official demo story narrow
2. use the same tested templates during demos
3. use `demo:reset` during breaks if the state gets messy
4. do not make live infra changes during the event unless absolutely necessary

## Execution Rule

We will not attempt all phases at once.

For every phase we will do:

1. define the exact goal
2. do only the minimum steps for that goal
3. verify the result
4. only then move to the next phase

That execution style is part of the plan, not an optional preference.
