jest.mock('../../services/dockerService', () => ({
  launchWorkspace: jest.fn(),
  deleteWorkspace: jest.fn(),
  stopWorkspace: jest.fn(),
  resumeWorkspace: jest.fn(),
  execInContainer: jest.fn(),
}));

jest.mock('../../models/Workspace', () => ({
  create: jest.fn(),
  deleteOne: jest.fn(),
  findOneAndUpdate: jest.fn(),
  findOne: jest.fn(),
}));

jest.mock('../../models/Activity', () => ({
  create: jest.fn(),
}));

jest.mock('../../controllers/workspaceController', () => ({
  getDashboardStats: jest.fn(),
  getWorkspaces: jest.fn(),
  getActivity: jest.fn(),
  getWorkspace: jest.fn(),
}));

const dockerService = require('../../services/dockerService');
const Workspace = require('../../models/Workspace');
const Activity = require('../../models/Activity');
const router = require('../workspacesRoutes');

function createRes() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
}

function getRouteHandler(path, method) {
  const layer = router.stack.find(
    (entry) => entry.route && entry.route.path === path && entry.route.methods[method]
  );

  return layer.route.stack[layer.route.stack.length - 1].handle;
}

describe('workspacesRoutes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Workspace.deleteOne.mockResolvedValue({ deletedCount: 1 });
    dockerService.deleteWorkspace.mockResolvedValue(undefined);
  });

  test('launch cleans up Docker resources when workspace persistence fails', async () => {
    const dateNowSpy = jest.spyOn(Date, 'now').mockReturnValue(1234567890);
    const launchHandler = getRouteHandler('/launch', 'post');

    dockerService.launchWorkspace.mockResolvedValue({
      containerId: 'container-123',
      idePort: 4321,
      ideUrl: 'http://localhost:4321',
    });
    Workspace.create.mockRejectedValue(new Error('database write failed'));

    const req = {
      session: { userId: 'user-1' },
      body: {
        template: 'python',
        name: 'Demo Workspace',
        description: 'Test workspace',
      },
    };
    const res = createRes();

    await launchHandler(req, res);

    expect(dockerService.deleteWorkspace).toHaveBeenCalledWith('user-1-1234567890');
    expect(Workspace.deleteOne).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        workspaceId: 'user-1-1234567890',
      })
    );
    dateNowSpy.mockRestore();
  });

  test('launch removes the saved workspace record if activity logging fails', async () => {
    const dateNowSpy = jest.spyOn(Date, 'now').mockReturnValue(1234567891);
    const launchHandler = getRouteHandler('/launch', 'post');

    dockerService.launchWorkspace.mockResolvedValue({
      containerId: 'container-123',
      idePort: 4321,
      ideUrl: 'http://localhost:4321',
    });
    Workspace.create.mockResolvedValue({ _id: 'workspace-db-id' });
    Activity.create.mockRejectedValue(new Error('activity insert failed'));

    const req = {
      session: { userId: 'user-1' },
      body: {
        template: 'python',
        name: 'Demo Workspace',
        description: 'Test workspace',
      },
    };
    const res = createRes();

    await launchHandler(req, res);

    expect(Workspace.deleteOne).toHaveBeenCalledWith({
      workspaceId: 'user-1-1234567891',
    });
    expect(dockerService.deleteWorkspace).toHaveBeenCalledWith('user-1-1234567891');
    expect(res.status).toHaveBeenCalledWith(500);
    dateNowSpy.mockRestore();
  });
});
