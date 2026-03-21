jest.mock('../../models/Workspace', () => ({
  findOne: jest.fn(),
  create: jest.fn(),
}));

jest.mock('../../models/ShareSnapshot', () => ({
  findOne: jest.fn(),
  create: jest.fn(),
  updateOne: jest.fn(),
}));

jest.mock('../../models/Activity', () => ({
  create: jest.fn(),
}));

jest.mock('../../services/shareService', () => ({
  createWorkspaceSnapshot: jest.fn(),
  generateShareToken: jest.fn(),
  restoreWorkspaceSnapshot: jest.fn(),
}));

jest.mock('../../services/dockerService', () => ({
  launchWorkspace: jest.fn(),
}));

const Workspace = require('../../models/Workspace');
const ShareSnapshot = require('../../models/ShareSnapshot');
const Activity = require('../../models/Activity');
const shareService = require('../../services/shareService');
const dockerService = require('../../services/dockerService');
const shareController = require('../shareController');

function createRes() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
}

describe('shareController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  describe('createShareLink', () => {
    test('rejects non-Python workspaces before snapshotting', async () => {
      Workspace.findOne.mockResolvedValue({
        workspaceId: 'ws-1',
        template: 'mern',
        status: 'running',
      });

      const req = {
        session: { userId: 'user-1' },
        params: { workspaceId: 'ws-1' },
        body: { expiresIn: 24, maxClones: 3 },
      };
      const res = createRes();

      await shareController.createShareLink(req, res);

      expect(Workspace.findOne).toHaveBeenCalledWith({
        workspaceId: 'ws-1',
        userId: 'user-1',
      });
      expect(shareService.createWorkspaceSnapshot).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Only Python workspaces can be shared currently',
      });
    });
  });

  describe('cloneWorkspace', () => {
    test('stores the cloned workspace idePort from dockerService', async () => {
      const setTimeoutSpy = jest.spyOn(global, 'setTimeout').mockImplementation((fn) => {
        fn();
        return 0;
      });

      const shareSnapshot = {
        template: 'python',
        snapshot: { files: [], packages: [] },
        description: 'Shared project',
        name: 'Demo Workspace',
        isValid: jest.fn().mockReturnValue(true),
        incrementCloneCount: jest.fn().mockResolvedValue(undefined),
      };
      const createdWorkspace = {
        _id: 'workspace-db-id',
        workspaceId: 'user-1-python-123',
        name: 'Demo Workspace (Copy)',
        template: 'python',
        status: 'running',
      };

      ShareSnapshot.findOne.mockResolvedValue(shareSnapshot);
      dockerService.launchWorkspace.mockResolvedValue({
        containerId: 'container-123',
        idePort: 4321,
        ideUrl: 'http://localhost:4321',
      });
      shareService.restoreWorkspaceSnapshot.mockResolvedValue(undefined);
      Workspace.create.mockResolvedValue(createdWorkspace);
      Activity.create.mockResolvedValue(undefined);

      const req = {
        session: { userId: 'user-1' },
        params: { shareToken: 'share-token' },
        body: { customName: 'Demo Workspace (Copy)' },
      };
      const res = createRes();

      await shareController.cloneWorkspace(req, res);

      expect(Workspace.create).toHaveBeenCalledWith(
        expect.objectContaining({
          containerId: 'container-123',
          idePort: 4321,
          template: 'python',
          userId: 'user-1',
        })
      );
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          workspace: expect.objectContaining({
            ideUrl: 'http://localhost:4321',
          }),
        })
      );
      expect(shareSnapshot.incrementCloneCount).toHaveBeenCalled();
      setTimeoutSpy.mockRestore();
    });
  });
});
