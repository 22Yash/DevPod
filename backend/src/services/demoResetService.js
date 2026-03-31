const Activity = require('../models/Activity');
const ShareSnapshot = require('../models/ShareSnapshot');
const Workspace = require('../models/Workspace');
const dockerService = require('./dockerService');

async function resetDemoEnvironment(prefix = 'devpod-') {
  const workspaceResult = await Workspace.updateMany(
    { status: { $ne: 'deleted' } },
    {
      $set: {
        status: 'deleted',
        containerId: null,
        idePort: null,
        frontendPort: null,
        backendPort: null,
        isShared: false,
        shareToken: null,
      },
    }
  );

  const shareResult = await ShareSnapshot.updateMany(
    { isActive: true },
    { $set: { isActive: false } }
  );

  const activityResult = await Activity.deleteMany({});
  const dockerResult = await dockerService.resetDemoResources(prefix);

  return {
    workspacesReset: workspaceResult.modifiedCount || 0,
    shareLinksDeactivated: shareResult.modifiedCount || 0,
    activitiesCleared: activityResult.deletedCount || 0,
    containersRemoved: dockerResult.containersRemoved || 0,
    volumesRemoved: dockerResult.volumesRemoved || 0,
    prefix,
  };
}

module.exports = {
  resetDemoEnvironment,
};
