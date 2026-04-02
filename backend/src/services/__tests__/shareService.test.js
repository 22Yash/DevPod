jest.mock('../dockerService', () => ({
  execInContainer: jest.fn(),
}));

const dockerService = require('../dockerService');
const shareService = require('../shareService');

function mockSizeAndContent(fileMap) {
  dockerService.execInContainer.mockImplementation(async (_workspaceId, cmd) => {
    if (cmd[0] === 'find') {
      return `${Object.keys(fileMap).join('\n')}\n`;
    }

    if (cmd[0] === 'sh' && cmd[2] === 'wc -c < "$1"') {
      const content = fileMap[cmd[4]];
      if (content === undefined) {
        throw new Error(`Unexpected size check for ${cmd[4]}`);
      }

      return `${Buffer.byteLength(content)}\n`;
    }

    if (cmd[0] === 'sh' && cmd[2] === 'base64 "$1"') {
      const content = fileMap[cmd[4]];
      if (content === undefined) {
        throw new Error(`Unexpected base64 read for ${cmd[4]}`);
      }

      return Buffer.from(content).toString('base64');
    }

    throw new Error(`Unexpected command: ${cmd.join(' ')}`);
  });
}

describe('shareService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('isShareableTemplate', () => {
    test('supports python, nodejs, and java but excludes mern', () => {
      expect(shareService.isShareableTemplate('python')).toBe(true);
      expect(shareService.isShareableTemplate('nodejs')).toBe(true);
      expect(shareService.isShareableTemplate('java')).toBe(true);
      expect(shareService.isShareableTemplate('mern')).toBe(false);
    });
  });

  describe('createWorkspaceSnapshot', () => {
    test('captures Node.js package metadata and keeps files base64 encoded', async () => {
      mockSizeAndContent({
        '/workspace/package.json': JSON.stringify({
          name: 'demo-node',
          dependencies: { express: '^4.0.0' },
          devDependencies: { jest: '^30.0.0' },
        }),
        '/workspace/package-lock.json': '{"lockfileVersion": 3}',
        '/workspace/index.js': 'console.log("hello");\n',
      });

      const snapshot = await shareService.createWorkspaceSnapshot('ws-node', 'nodejs');

      expect(dockerService.execInContainer).toHaveBeenCalledWith(
        'ws-node',
        expect.arrayContaining(['find', '/workspace', '-type', 'f'])
      );
      expect(snapshot.packages).toEqual(['express@^4.0.0', 'jest@^30.0.0']);
      expect(snapshot.files).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: '/package.json',
            encoding: 'base64',
          }),
          expect.objectContaining({
            path: '/index.js',
            encoding: 'base64',
          }),
        ])
      );
    });

    test('extracts Java dependencies from pom.xml', async () => {
      mockSizeAndContent({
        '/workspace/pom.xml': `
          <project>
            <dependencies>
              <dependency>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-starter-web</artifactId>
                <version>3.3.0</version>
              </dependency>
            </dependencies>
          </project>
        `,
        '/workspace/src/main/java/App.java': 'class App {}\n',
      });

      const snapshot = await shareService.createWorkspaceSnapshot('ws-java', 'java');

      expect(snapshot.packages).toEqual([
        'org.springframework.boot:spring-boot-starter-web:3.3.0',
      ]);
    });
  });

  describe('restoreWorkspaceSnapshot', () => {
    test('fails the restore when a file cannot be written', async () => {
      dockerService.execInContainer
        .mockResolvedValueOnce(undefined)
        .mockRejectedValueOnce(new Error('write failed'));

      await expect(
        shareService.restoreWorkspaceSnapshot(
          'ws-1',
          {
            files: [
              {
                path: '/src/app.py',
                content: Buffer.from('print("hello")\n').toString('base64'),
                size: 15,
                encoding: 'base64',
              },
            ],
            packages: [],
          },
          'python'
        )
      ).rejects.toThrow(
        'Failed to restore workspace snapshot: Failed to restore file /src/app.py: write failed'
      );
    });

    test('runs npm ci for lockfile-based Node.js snapshots', async () => {
      dockerService.execInContainer.mockResolvedValue(undefined);

      await shareService.restoreWorkspaceSnapshot(
        'ws-node',
        {
          files: [
            {
              path: '/package.json',
              content: Buffer.from(JSON.stringify({ name: 'demo-node' })).toString('base64'),
              size: 18,
              encoding: 'base64',
            },
            {
              path: '/package-lock.json',
              content: Buffer.from('{"lockfileVersion":3}').toString('base64'),
              size: 20,
              encoding: 'base64',
            },
          ],
          packages: ['express@^4.0.0'],
        },
        'nodejs'
      );

      expect(dockerService.execInContainer).toHaveBeenCalledWith(
        'ws-node',
        ['sh', '-lc', 'cd /workspace && npm ci']
      );
    });

    test('uses Maven dependency warmup for Java snapshots', async () => {
      dockerService.execInContainer.mockResolvedValue(undefined);

      await shareService.restoreWorkspaceSnapshot(
        'ws-java',
        {
          files: [
            {
              path: '/pom.xml',
              content: Buffer.from('<project />').toString('base64'),
              size: 11,
              encoding: 'base64',
            },
          ],
          packages: ['org.example:demo:1.0.0'],
        },
        'java'
      );

      expect(dockerService.execInContainer).toHaveBeenCalledWith(
        'ws-java',
        ['sh', '-lc', 'cd /workspace && mvn -q -DskipTests dependency:go-offline']
      );
    });

    test('fails the restore when dependency installation fails', async () => {
      dockerService.execInContainer
        .mockResolvedValueOnce(undefined)
        .mockRejectedValueOnce(new Error('pip failed'));

      await expect(
        shareService.restoreWorkspaceSnapshot(
          'ws-1',
          {
            files: [
              {
                path: '/requirements.txt',
                content: Buffer.from('flask').toString('base64'),
                size: 5,
                encoding: 'base64',
              },
            ],
            packages: ['flask'],
          },
          'python'
        )
      ).rejects.toThrow(
        'Failed to restore workspace snapshot: Failed to install workspace packages: pip failed'
      );
    });
  });
});
