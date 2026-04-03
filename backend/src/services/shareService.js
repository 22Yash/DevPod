const crypto = require('crypto');
const dockerService = require('./dockerService');

const SHAREABLE_TEMPLATES = new Set(['python', 'nodejs', 'java']);
const SNAPSHOT_EXCLUDE_PATTERNS = [
  '*/.git/*',
  '*/node_modules/*',
  '*/__pycache__/*',
  '*/.venv/*',
  '*/venv/*',
  '*/.pytest_cache/*',
  '*/.mypy_cache/*',
  '*/.ruff_cache/*',
  '*/.next/*',
  '*/dist/*',
  '*/build/*',
  '*/coverage/*',
  '*/target/*',
  '*/.gradle/*',
  '*/.m2/*',
];
const SNAPSHOT_EXCLUDE_NAMES = ['.DS_Store', '.env', '.env.*', '.npmrc', '.devpod-ports'];

function normalizeTemplate(template) {
  return `${template || 'python'}`.toLowerCase();
}

function isShareableTemplate(template) {
  return SHAREABLE_TEMPLATES.has(normalizeTemplate(template));
}

function getSnapshotFile(snapshot, relativePaths) {
  const paths = Array.isArray(relativePaths) ? relativePaths : [relativePaths];
  return snapshot.files.find((file) => paths.includes(file.path)) || null;
}

function decodeSnapshotFile(file) {
  if (!file) {
    return null;
  }

  if (file.encoding === 'base64') {
    return Buffer.from(file.content || '', 'base64');
  }

  return Buffer.from(file.content || '', 'utf8');
}

function readSnapshotTextFile(snapshot, relativePaths) {
  const file = getSnapshotFile(snapshot, relativePaths);
  if (!file) {
    return null;
  }

  return decodeSnapshotFile(file).toString('utf8');
}

function parsePythonPackages(snapshot) {
  const requirementsContent = readSnapshotTextFile(snapshot, '/requirements.txt');
  if (!requirementsContent) {
    return [];
  }

  return requirementsContent
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'));
}

function parseNodePackages(snapshot) {
  const packageJson = readSnapshotTextFile(snapshot, '/package.json');
  if (!packageJson) {
    return [];
  }

  try {
    const parsed = JSON.parse(packageJson);
    const dependencies = Object.entries(parsed.dependencies || {});
    const devDependencies = Object.entries(parsed.devDependencies || {});

    return [...dependencies, ...devDependencies].map(([name, version]) => `${name}@${version}`);
  } catch (error) {
    console.warn('⚠️  Could not parse package.json for share preview:', error.message);
    return [];
  }
}

function parsePomDependencies(pomContent) {
  const packages = [];
  const dependencyRegex = /<dependency\b[^>]*>([\s\S]*?)<\/dependency>/g;
  let match;

  while ((match = dependencyRegex.exec(pomContent)) !== null) {
    const block = match[1];
    const groupId = block.match(/<groupId>\s*([^<\s]+)\s*<\/groupId>/)?.[1];
    const artifactId = block.match(/<artifactId>\s*([^<\s]+)\s*<\/artifactId>/)?.[1];
    const version = block.match(/<version>\s*([^<\s]+)\s*<\/version>/)?.[1];

    if (!groupId || !artifactId) {
      continue;
    }

    packages.push(version ? `${groupId}:${artifactId}:${version}` : `${groupId}:${artifactId}`);
  }

  return packages;
}

function parseGradleDependencies(gradleContent) {
  const packages = [];
  const dependencyRegex =
    /(?:implementation|api|compileOnly|runtimeOnly|testImplementation|testRuntimeOnly)\s*\(?\s*['"]([^'"]+)['"]/g;
  let match;

  while ((match = dependencyRegex.exec(gradleContent)) !== null) {
    packages.push(match[1]);
  }

  return packages;
}

function parseJavaPackages(snapshot) {
  const pomContent = readSnapshotTextFile(snapshot, '/pom.xml');
  if (pomContent) {
    return parsePomDependencies(pomContent);
  }

  const gradleContent = readSnapshotTextFile(snapshot, ['/build.gradle', '/build.gradle.kts']);
  if (gradleContent) {
    return parseGradleDependencies(gradleContent);
  }

  return [];
}

function extractPackages(snapshot, template) {
  switch (normalizeTemplate(template)) {
    case 'python':
      return parsePythonPackages(snapshot);
    case 'nodejs':
      return parseNodePackages(snapshot);
    case 'java':
      return parseJavaPackages(snapshot);
    default:
      return [];
  }
}

function detectNodePackageManager(snapshot) {
  const packageJson = readSnapshotTextFile(snapshot, '/package.json');
  if (!packageJson) {
    return null;
  }

  try {
    const parsed = JSON.parse(packageJson);
    const declaredPackageManager = parsed.packageManager || '';

    if (declaredPackageManager.startsWith('pnpm')) {
      return 'pnpm';
    }

    if (declaredPackageManager.startsWith('yarn')) {
      return 'yarn';
    }
  } catch {
    // Fall back to lockfile detection below.
  }

  if (getSnapshotFile(snapshot, '/pnpm-lock.yaml')) {
    return 'pnpm';
  }

  if (getSnapshotFile(snapshot, '/yarn.lock')) {
    return 'yarn';
  }

  return 'npm';
}

function buildNodeRestoreCommand(snapshot) {
  if (!getSnapshotFile(snapshot, '/package.json')) {
    return null;
  }

  const packageManager = detectNodePackageManager(snapshot);

  if (packageManager === 'pnpm') {
    const frozenLockfile = getSnapshotFile(snapshot, '/pnpm-lock.yaml') ? ' --frozen-lockfile' : '';
    return [
      'sh',
      '-lc',
      `cd /workspace && if command -v corepack >/dev/null 2>&1; then corepack enable >/dev/null 2>&1 || true; fi && pnpm install${frozenLockfile}`
    ];
  }

  if (packageManager === 'yarn') {
    const frozenLockfile = getSnapshotFile(snapshot, '/yarn.lock') ? ' --frozen-lockfile' : '';
    return [
      'sh',
      '-lc',
      `cd /workspace && if command -v corepack >/dev/null 2>&1; then corepack enable >/dev/null 2>&1 || true; fi && yarn install${frozenLockfile}`
    ];
  }

  if (getSnapshotFile(snapshot, ['/package-lock.json', '/npm-shrinkwrap.json'])) {
    return ['sh', '-lc', 'cd /workspace && npm ci'];
  }

  return ['sh', '-lc', 'cd /workspace && npm install'];
}

function buildJavaRestoreCommand(snapshot) {
  if (getSnapshotFile(snapshot, '/pom.xml')) {
    if (getSnapshotFile(snapshot, '/mvnw')) {
      return ['sh', '-lc', 'cd /workspace && sh ./mvnw -q -DskipTests dependency:go-offline'];
    }

    return ['sh', '-lc', 'cd /workspace && mvn -q -DskipTests dependency:go-offline'];
  }

  if (getSnapshotFile(snapshot, ['/build.gradle', '/build.gradle.kts'])) {
    if (getSnapshotFile(snapshot, '/gradlew')) {
      return ['sh', '-lc', 'cd /workspace && sh ./gradlew --no-daemon dependencies'];
    }

    return ['sh', '-lc', 'cd /workspace && gradle --no-daemon dependencies'];
  }

  return null;
}

function buildDependencyRestoreCommand(snapshot, template) {
  switch (normalizeTemplate(template)) {
    case 'python':
      if (!getSnapshotFile(snapshot, '/requirements.txt')) {
        return null;
      }

      return ['sh', '-lc', 'cd /workspace && pip install -r requirements.txt'];
    case 'nodejs':
      return buildNodeRestoreCommand(snapshot);
    case 'java':
      return buildJavaRestoreCommand(snapshot);
    default:
      return null;
  }
}

function shouldMarkFileExecutable(relativePath) {
  return /(?:^|\/)(?:gradlew|mvnw)$/.test(relativePath) || relativePath.endsWith('.sh');
}

/**
 * Generate unique share token
 */
function generateShareToken() {
  return crypto.randomBytes(16).toString('hex');
}

/**
 * Extract files from a running workspace container
 */
async function createWorkspaceSnapshot(workspaceId, template = 'python') {
  try {
    console.log(`📸 Creating snapshot for workspace: ${workspaceId}`);
    
    const snapshot = {
      files: [],
      packages: [],
      totalSize: 0
    };

    // Get list of all files in workspace while excluding dependency caches,
    // build output, and obvious secrets. Keep dotfiles that are part of the
    // project itself, such as Gradle or Yarn config, so Java and Node shares restore cleanly.
    const findCommand = ['find', '/workspace', '-type', 'f'];

    for (const pattern of SNAPSHOT_EXCLUDE_PATTERNS) {
      findCommand.push('!', '-path', pattern);
    }

    for (const name of SNAPSHOT_EXCLUDE_NAMES) {
      findCommand.push('!', '-name', name);
    }
    
    const filesOutput = await dockerService.execInContainer(workspaceId, findCommand);
    const filePaths = filesOutput.trim().split('\n').filter(f => f);
    
    console.log(`📁 Found ${filePaths.length} files to snapshot`);

    // Read each file content
    for (const filePath of filePaths) {
      try {
        const sizeOutput = await dockerService.execInContainer(workspaceId, [
          'sh', '-c', 'wc -c < "$1"', 'sh', filePath
        ]);
        const size = parseInt(sizeOutput.trim(), 10);

        if (!Number.isFinite(size)) {
          throw new Error(`Could not determine file size for ${filePath}`);
        }

        // Skip files larger than 500KB before reading them into memory
        if (size > 500 * 1024) {
          console.log(`⚠️  Skipping large file: ${filePath} (${size} bytes)`);
          continue;
        }

        const content = await dockerService.execInContainer(workspaceId, [
          'sh', '-c', 'base64 "$1"', 'sh', filePath
        ]);
        
        snapshot.files.push({
          path: filePath.replace('/workspace', ''), // Store relative path
          content: content.trim(),
          size: size,
          encoding: 'base64'
        });
        
        snapshot.totalSize += size;
        
      } catch (error) {
        console.warn(`⚠️  Could not read file ${filePath}:`, error.message);
      }
    }

    snapshot.packages = extractPackages(snapshot, template);

    if (snapshot.packages.length > 0) {
      console.log(`📦 Found ${snapshot.packages.length} ${normalizeTemplate(template)} dependencies`);
    } else {
      console.log(`ℹ️  No additional ${normalizeTemplate(template)} dependencies detected`);
    }

    console.log(`✅ Snapshot created: ${snapshot.files.length} files, ${snapshot.totalSize} bytes`);
    
    return snapshot;
    
  } catch (error) {
    console.error('❌ Failed to create snapshot:', error);
    throw new Error(`Failed to create workspace snapshot: ${error.message}`);
  }
}

/**
 * Restore files to a new workspace container
 */
async function restoreWorkspaceSnapshot(workspaceId, snapshot, template = 'python') {
  try {
    console.log(`📥 Restoring snapshot to workspace: ${workspaceId}`);
    console.log(`📁 Restoring ${snapshot.files.length} files`);

    // Create directories and restore files
    for (const file of snapshot.files) {
      const fullPath = `/workspace${file.path}`;
      const dirPath = fullPath.substring(0, fullPath.lastIndexOf('/'));

      try {
        // Create directory if needed
        if (dirPath !== '/workspace') {
          await dockerService.execInContainer(workspaceId, [
            'mkdir', '-p', dirPath
          ]);
        }

        // Always restore through base64 so both legacy text snapshots and new
        // binary-safe snapshots follow the same path.
        const b64 =
          file.encoding === 'base64'
            ? (file.content || '')
            : Buffer.from(file.content || '', 'utf8').toString('base64');

        await dockerService.execInContainer(workspaceId, [
          'sh', '-c',
          'printf %s "$1" | base64 -d > "$2"',
          'sh',
          b64,
          fullPath
        ]);

        if (shouldMarkFileExecutable(file.path)) {
          await dockerService.execInContainer(workspaceId, [
            'chmod', '+x', fullPath
          ]);
        }
      } catch (error) {
        throw new Error(`Failed to restore file ${file.path}: ${error.message}`);
      }

      console.log(`✅ Restored: ${file.path}`);
    }

    const dependencyRestoreCommand = buildDependencyRestoreCommand(snapshot, template);

    if (dependencyRestoreCommand) {
      console.log(`📦 Restoring ${normalizeTemplate(template)} dependencies...`);
      
      try {
        await dockerService.execInContainer(workspaceId, dependencyRestoreCommand);
        
        console.log(`✅ ${normalizeTemplate(template)} dependencies restored`);
      } catch (error) {
        throw new Error(`Failed to install workspace packages: ${error.message}`);
      }
    }

    console.log(`✅ Snapshot restored successfully`);
    
  } catch (error) {
    console.error('❌ Failed to restore snapshot:', error);
    throw new Error(`Failed to restore workspace snapshot: ${error.message}`);
  }
}

module.exports = {
  generateShareToken,
  isShareableTemplate,
  createWorkspaceSnapshot,
  restoreWorkspaceSnapshot
};
