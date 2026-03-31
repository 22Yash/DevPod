jest.mock('../dockerService', () => ({
  execInContainer: jest.fn(),
}));

const dockerService = require('../dockerService');
const shareService = require('../shareService');

describe('shareService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createWorkspaceSnapshot', () => {
    test('uses BusyBox-compatible file discovery and size checks', async () => {
      dockerService.execInContainer.mockImplementation(async (_workspaceId, cmd) => {
        if (cmd[0] === 'find') {
          return '/workspace/app.py\n';
        }

        if (cmd[0] === 'sh') {
          return '18\n';
        }

        if (cmd[0] === 'cat' && cmd[1] === '/workspace/app.py') {
          return 'print("hello")\n';
        }

        if (cmd[0] === 'cat' && cmd[1] === '/workspace/requirements.txt') {
          throw new Error('No requirements file');
        }

        throw new Error(`Unexpected command: ${cmd.join(' ')}`);
      });

      const snapshot = await shareService.createWorkspaceSnapshot('ws-1');

      expect(dockerService.execInContainer).toHaveBeenCalledWith('ws-1', [
        'find', '/workspace',
        '-type', 'f',
        '!', '-path', '*/.*',
        '!', '-path', '*/__pycache__/*',
        '!', '-path', '*/node_modules/*'
      ]);
      expect(dockerService.execInContainer).toHaveBeenCalledWith('ws-1', [
        'sh', '-c', 'wc -c < "$1"', 'sh', '/workspace/app.py'
      ]);
      expect(snapshot.files).toEqual([
        {
          path: '/app.py',
          content: 'print("hello")\n',
          size: 18,
        },
      ]);
    });
  });

  describe('restoreWorkspaceSnapshot', () => {
    test('fails the restore when a file cannot be written', async () => {
      dockerService.execInContainer
        .mockResolvedValueOnce(undefined)
        .mockRejectedValueOnce(new Error('write failed'));

      await expect(
        shareService.restoreWorkspaceSnapshot('ws-1', {
          files: [{ path: '/src/app.py', content: 'print("hello")\n', size: 18 }],
          packages: [],
        })
      ).rejects.toThrow(
        'Failed to restore workspace snapshot: Failed to restore file /src/app.py: write failed'
      );
    });

    test('fails the restore when package installation fails', async () => {
      dockerService.execInContainer
        .mockResolvedValueOnce(undefined)
        .mockRejectedValueOnce(new Error('pip failed'));

      await expect(
        shareService.restoreWorkspaceSnapshot('ws-1', {
          files: [],
          packages: ['flask'],
        })
      ).rejects.toThrow(
        'Failed to restore workspace snapshot: Failed to install workspace packages: pip failed'
      );
    });
  });
});
