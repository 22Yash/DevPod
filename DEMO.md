# DevPod Demo Runbook

This is the operator guide for the exhibition setup.

## Demo Scope

- Use one machine only.
- Use two browsers or two browser profiles on that same machine.
- Use Python for the share/clone flow.
- The second browser must already be logged in before cloning.
- Do not demo cross-device IDE access. The IDE still opens on `localhost`.

## Before the Event

1. Start Docker Desktop and wait until it is fully ready.
2. Load the backend environment so `MONGODB_URI`, session config, and GitHub auth values are available.
3. Install dependencies if this machine is fresh:
   - `npm install --prefix backend`
   - `npm install --prefix frontend`
4. If Docker images are not already built, build them once before the event:
   - `./scripts/build/build-images.sh`
   - or use the Windows scripts on Windows
5. Reset the local demo state:
   - `npm run demo:reset`
6. Start the app:
   - backend: `npm run server --prefix backend`
   - frontend: `npm run dev --prefix frontend`
7. Open the main browser and the clone browser/profile.
8. Log into both browsers.

## Recommended Demo Story

1. Log into DevPod.
2. Create a new Python workspace.
3. Let the IDE open automatically.
4. Make a small code change in the workspace.
5. Go back to the dashboard.
6. Stop the workspace.
7. Start it again and show that the IDE reopens.
8. Generate a share link.
9. Open the share link in the second browser/profile.
10. Clone the workspace there.
11. Let the cloned IDE open automatically.
12. Make a small code change in the clone.
13. Show the Activity tab.
14. Delete the clone when the demo is done.
15. Revoke the share link if you are done with that workspace.

## Between Repeated Demos

Use this light reset if the app still looks healthy:

1. Delete the clone workspace from the dashboard.
2. Revoke the current share link.
3. Refresh the dashboard.
4. Start the next demo with a fresh Python workspace or reuse the main workspace only if it is still clean.

Use the full reset if anything feels messy:

1. Stop both frontend and backend dev servers.
2. Run `npm run demo:reset`
3. Start backend and frontend again.
4. Log into both browsers again if needed.

## Recommended Reset Rhythm

- Run `npm run demo:reset` before the event starts.
- Run it again during breaks or every 10-20 demos.
- Run it immediately if a clone or launch fails in a weird way.

## Fast Recovery

### If the IDE tab does not open

- Check whether Docker is still running.
- Check whether the workspace actually launched on the dashboard.
- Try the `Open` button manually from the dashboard.

### If sharing fails

- Make sure the workspace is Python.
- Make sure the workspace status is `running`.
- Refresh the dashboard and try again once.
- If it still feels off, run the full reset.

### If cloning fails

- Make sure the second browser is logged in.
- Refresh the share preview page and try again once.
- If it still fails, run the full reset and start from a fresh workspace.

### If the dashboard starts looking messy

- Do not manually chase old state for long.
- Use `npm run demo:reset` and restart clean.

## Hard Rules for the Event

- Do not improvise unsupported flows.
- Do not demo non-Python sharing.
- Do not demo cross-laptop sharing.
- Do not rebuild Docker images in the middle of the exhibition unless absolutely necessary.
- If one run feels off, reset early instead of trying to rescue a dirty state for several more demos.
