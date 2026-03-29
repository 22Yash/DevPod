jest.mock('../../models/Workspace', () => ({
  updateMany: jest.fn(),
}));

jest.mock('../../models/ShareSnapshot', () => ({
  updateMany: jest.fn(),
}));

jest.mock('../../models/Activity', () => ({
  deleteMany: jest.fn(),
}));

jest.mock('../dockerService', () => ({
  resetDemoResources: jest.fn(),
}));

const Workspace = require('../../models/Workspace');
const ShareSnapshot = require('../../models/ShareSnapshot');
const Activity = require('../../models/Activity');
const dockerService = require('../dockerService');
const demoResetService = require('../demoResetService');

describe('demoResetService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('resets workspaces, share links, activities, and Docker resources', async () => {
    Workspace.updateMany.mockResolvedValue({ modifiedCount: 3 });
    ShareSnapshot.updateMany.mockResolvedValue({ modifiedCount: 4 });
    Activity.deleteMany.mockResolvedValue({ deletedCount: 12 });
    dockerService.resetDemoResources.mockResolvedValue({
      containersRemoved: 5,
      volumesRemoved: 5,
    });

    const result = await demoResetService.resetDemoEnvironment();

    expect(Workspace.updateMany).toHaveBeenCalledWith(
      { status: { $ne: 'deleted' } },
      expect.objectContaining({
        $set: expect.objectContaining({
          status: 'deleted',
          containerId: null,
          idePort: null,
          isShared: false,
          shareToken: null,
        }),
      })
    );
    expect(ShareSnapshot.updateMany).toHaveBeenCalledWith(
      { isActive: true },
      { $set: { isActive: false } }
    );
    expect(Activity.deleteMany).toHaveBeenCalledWith({});
    expect(dockerService.resetDemoResources).toHaveBeenCalledWith('devpod-');
    expect(result).toEqual({
      workspacesReset: 3,
      shareLinksDeactivated: 4,
      activitiesCleared: 12,
      containersRemoved: 5,
      volumesRemoved: 5,
      prefix: 'devpod-',
    });
  });
});
