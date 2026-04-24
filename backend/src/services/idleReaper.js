const Workspace = require('../models/Workspace');
const Activity = require('../models/Activity');
const dockerService = require('./dockerService');

const CHECK_INTERVAL_MS = 5 * 60 * 1000;
const IDLE_THRESHOLD_MS = 30 * 60 * 1000;
// 5 min of wall time = 3e11 ns. A truly idle code-server tab uses <1% of one core
// (~3e9 ns per 5 min). 2% threshold gives headroom for background noise.
const CPU_DELTA_ACTIVE_NS = 6_000_000_000;

const cpuSnapshots = new Map();

async function checkWorkspace(workspace) {
  const { workspaceId, _id } = workspace;
  const currentCpu = await dockerService.getContainerCpuUsage(workspaceId);

  if (currentCpu === null) {
    cpuSnapshots.delete(workspaceId);
    return;
  }

  const previousCpu = cpuSnapshots.get(workspaceId);
  cpuSnapshots.set(workspaceId, currentCpu);

  if (previousCpu !== undefined && currentCpu - previousCpu > CPU_DELTA_ACTIVE_NS) {
    await Workspace.updateOne({ _id }, { lastAccessed: new Date() });
    return;
  }

  const idleMs = Date.now() - new Date(workspace.lastAccessed).getTime();
  if (idleMs < IDLE_THRESHOLD_MS) return;

  console.log(`[idleReaper] stopping idle workspace ${workspaceId} (idle ${Math.round(idleMs / 60000)}min)`);
  try {
    await dockerService.stopWorkspace(workspaceId);
    await Workspace.updateOne({ _id }, { status: 'stopped' });
    await Activity.create({
      userId: workspace.userId,
      workspaceId: _id,
      action: 'workspace_stopped',
      details: { workspaceId, reason: 'idle_auto_stop' },
    });
    cpuSnapshots.delete(workspaceId);
  } catch (err) {
    console.error(`[idleReaper] failed to stop ${workspaceId}:`, err.message);
  }
}

async function reapIdle() {
  try {
    const running = await Workspace.find({ status: 'running' });
    for (const ws of running) {
      await checkWorkspace(ws);
    }
  } catch (err) {
    console.error('[idleReaper] sweep failed:', err.message);
  }
}

function startReaper() {
  console.log(`[idleReaper] started — sweep every ${CHECK_INTERVAL_MS / 60000}min, idle threshold ${IDLE_THRESHOLD_MS / 60000}min`);
  setTimeout(reapIdle, 60 * 1000);
  setInterval(reapIdle, CHECK_INTERVAL_MS);
}

module.exports = { startReaper };
