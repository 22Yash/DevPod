jest.mock('../../models/Workspace', () => ({
  findOne: jest.fn(),
  create: jest.fn(),
  deleteOne: jest.fn(),
}));

jest.mock('../../models/ShareSnapshot', () => ({
  findOne: jest.fn(),
  create: jest.fn(),
  updateOne: jest.fn(),
  updateMany: jest.fn(),
}));

jest.mock('../../models/Activity', () => ({
  create: jest.fn(),
}));

jest.mock('../../services/shareService', () => ({
  isShareableTemplate: jest.fn(),
  createWorkspaceSnapshot: jest.fn(),
  generateShareToken: jest.fn(),
  restoreWorkspaceSnapshot: jest.fn(),
}));

jest.mock('../../services/dockerService', () => ({
  launchWorkspace: jest.fn(),
  deleteWorkspace: jest.fn(),
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
    Workspace.deleteOne.mockResolvedValue({ deletedCount: 1 });
    ShareSnapshot.updateOne.mockResolvedValue({ modifiedCount: 1 });
    ShareSnapshot.updateMany.mockResolvedValue({ modifiedCount: 1 });
    dockerService.deleteWorkspace.mockResolvedValue(undefined);
    shareService.isShareableTemplate.mockImplementation((template) =>
      ['python', 'nodejs', 'java'].includes(template)
    );
  });

  describe('createShareLink', () => {
    test('rejects unsupported templates before snapshotting', async () => {
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
        error: 'Sharing is supported for Python, Node.js, and Java workspaces only',
      });
    });

    test('deactivates older active share links after creating a new one for nodejs', async () => {
      const workspace = {
        _id: 'workspace-db-id',
        workspaceId: 'ws-1',
        template: 'nodejs',
        name: 'Demo Workspace',
        description: 'Shared project',
        status: 'running',
        isShared: true,
        shareToken: 'old-token',
        save: jest.fn().mockResolvedValue(undefined),
      };

      Workspace.findOne.mockResolvedValue(workspace);
      shareService.createWorkspaceSnapshot.mockResolvedValue({
        files: [{ path: '/app.py', size: 12 }],
        packages: [],
        totalSize: 12,
      });
      shareService.generateShareToken.mockReturnValue('new-token');
      ShareSnapshot.create.mockResolvedValue({ _id: 'share-snapshot-id' });
      Activity.create.mockResolvedValue(undefined);

      const req = {
        session: { userId: 'user-1' },
        params: { workspaceId: 'ws-1' },
        body: { expiresIn: 24, maxClones: 2 },
      };
      const res = createRes();

      await shareController.createShareLink(req, res);

      expect(ShareSnapshot.updateMany).toHaveBeenCalledWith(
        {
          workspaceId: 'ws-1',
          isActive: true,
          _id: { $ne: 'share-snapshot-id' },
        },
        { isActive: false }
      );
      expect(workspace.save).toHaveBeenCalled();
      expect(shareService.createWorkspaceSnapshot).toHaveBeenCalledWith('ws-1', 'nodejs');
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          shareToken: 'new-token',
        })
      );
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
          frontendPort: null,
          backendPort: null,
          template: 'python',
          userId: 'user-1',
        })
      );
      expect(shareService.restoreWorkspaceSnapshot).toHaveBeenCalledWith(
        expect.stringMatching(/^user-1-python-/),
        shareSnapshot.snapshot,
        'python'
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

    test('cleans up the new workspace when snapshot restore fails', async () => {
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

      ShareSnapshot.findOne.mockResolvedValue(shareSnapshot);
      dockerService.launchWorkspace.mockResolvedValue({
        containerId: 'container-123',
        idePort: 4321,
        ideUrl: 'http://localhost:4321',
      });
      shareService.restoreWorkspaceSnapshot.mockRejectedValue(new Error('restore failed'));

      const req = {
        session: { userId: 'user-1' },
        params: { shareToken: 'share-token' },
        body: { customName: 'Demo Workspace (Copy)' },
      };
      const res = createRes();

      await shareController.cloneWorkspace(req, res);

      expect(Workspace.create).not.toHaveBeenCalled();
      expect(shareSnapshot.incrementCloneCount).not.toHaveBeenCalled();
      expect(dockerService.deleteWorkspace).toHaveBeenCalledWith(
        expect.stringMatching(/^user-1-python-/)
      );
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'restore failed' });
      setTimeoutSpy.mockRestore();
    });

    test('cleans up the new workspace when package installation fails', async () => {
      const setTimeoutSpy = jest.spyOn(global, 'setTimeout').mockImplementation((fn) => {
        fn();
        return 0;
      });

      const shareSnapshot = {
        template: 'python',
        snapshot: { files: [], packages: ['flask'] },
        description: 'Shared project',
        name: 'Demo Workspace',
        isValid: jest.fn().mockReturnValue(true),
        incrementCloneCount: jest.fn().mockResolvedValue(undefined),
      };

      ShareSnapshot.findOne.mockResolvedValue(shareSnapshot);
      dockerService.launchWorkspace.mockResolvedValue({
        containerId: 'container-123',
        idePort: 4321,
        ideUrl: 'http://localhost:4321',
      });
      shareService.restoreWorkspaceSnapshot.mockRejectedValue(
        new Error('Failed to install workspace packages: pip failed')
      );

      const req = {
        session: { userId: 'user-1' },
        params: { shareToken: 'share-token' },
        body: { customName: 'Demo Workspace (Copy)' },
      };
      const res = createRes();

      await shareController.cloneWorkspace(req, res);

      expect(Workspace.create).not.toHaveBeenCalled();
      expect(shareSnapshot.incrementCloneCount).not.toHaveBeenCalled();
      expect(dockerService.deleteWorkspace).toHaveBeenCalledWith(
        expect.stringMatching(/^user-1-python-/)
      );
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Failed to install workspace packages: pip failed',
      });
      setTimeoutSpy.mockRestore();
    });

    test('rejects cloning unsupported shared templates', async () => {
      const shareSnapshot = {
        template: 'mern',
        isValid: jest.fn().mockReturnValue(true),
      };

      ShareSnapshot.findOne.mockResolvedValue(shareSnapshot);

      const req = {
        session: { userId: 'user-1' },
        params: { shareToken: 'share-token' },
        body: { customName: 'Demo Workspace (Copy)' },
      };
      const res = createRes();

      await shareController.cloneWorkspace(req, res);

      expect(dockerService.launchWorkspace).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Sharing is supported for Python, Node.js, and Java workspaces only',
      });
    });
  });

  describe('revokeShareLink', () => {
    test('deactivates all active share links for the workspace', async () => {
      const workspace = {
        _id: 'workspace-db-id',
        workspaceId: 'ws-1',
        name: 'Demo Workspace',
        isShared: true,
        shareToken: 'token-1',
        save: jest.fn().mockResolvedValue(undefined),
      };

      Workspace.findOne.mockResolvedValue(workspace);
      Activity.create.mockResolvedValue(undefined);

      const req = {
        session: { userId: 'user-1' },
        params: { workspaceId: 'ws-1' },
      };
      const res = createRes();

      await shareController.revokeShareLink(req, res);

      expect(ShareSnapshot.updateMany).toHaveBeenCalledWith(
        { workspaceId: 'ws-1', isActive: true },
        { isActive: false }
      );
      expect(workspace.save).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Share link revoked successfully',
      });
    });
  });
});
