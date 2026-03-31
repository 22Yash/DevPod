const crypto = require('crypto');
const dockerService = require('./dockerService');

/**
 * Generate unique share token
 */
function generateShareToken() {
  return crypto.randomBytes(16).toString('hex');
}

/**
 * Extract files from a running Python workspace container
 */
async function createWorkspaceSnapshot(workspaceId) {
  try {
    console.log(`📸 Creating snapshot for workspace: ${workspaceId}`);
    
    const snapshot = {
      files: [],
      packages: [],
      totalSize: 0
    };

    // Get list of all files in workspace (excluding hidden and cache files).
    // Avoid GNU-specific `find -size` syntax so this also works in Alpine/BusyBox.
    const findCommand = [
      'find', '/workspace',
      '-type', 'f',
      '!', '-path', '*/.*',
      '!', '-path', '*/__pycache__/*',
      '!', '-path', '*/node_modules/*'
    ];
    
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

        const content = await dockerService.execInContainer(workspaceId, ['cat', filePath]);
        
        snapshot.files.push({
          path: filePath.replace('/workspace', ''), // Store relative path
          content: content,
          size: size
        });
        
        snapshot.totalSize += size;
        
      } catch (error) {
        console.warn(`⚠️  Could not read file ${filePath}:`, error.message);
      }
    }

    // Extract Python packages from requirements.txt if exists
    try {
      const requirementsContent = await dockerService.execInContainer(
        workspaceId, 
        ['cat', '/workspace/requirements.txt']
      );
      
      snapshot.packages = requirementsContent
        .split('\n')
        .filter(line => line.trim() && !line.startsWith('#'))
        .map(line => line.trim());
        
      console.log(`📦 Found ${snapshot.packages.length} Python packages`);
    } catch (error) {
      console.log('ℹ️  No requirements.txt found');
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
async function restoreWorkspaceSnapshot(workspaceId, snapshot) {
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

        // Write file content safely using base64 encoding
        const b64 = Buffer.from(file.content).toString('base64');
        await dockerService.execInContainer(workspaceId, [
          'bash', '-c',
          `echo '${b64}' | base64 -d > '${fullPath}'`
        ]);
      } catch (error) {
        throw new Error(`Failed to restore file ${file.path}: ${error.message}`);
      }

      console.log(`✅ Restored: ${file.path}`);
    }

    // Install Python packages if requirements.txt exists
    if (snapshot.packages && snapshot.packages.length > 0) {
      console.log(`📦 Installing ${snapshot.packages.length} Python packages...`);
      
      try {
        // Create requirements.txt safely using base64
        const reqB64 = Buffer.from(snapshot.packages.join('\n')).toString('base64');
        await dockerService.execInContainer(workspaceId, [
          'bash', '-c',
          `echo '${reqB64}' | base64 -d > /workspace/requirements.txt`
        ]);
        
        // Install packages
        await dockerService.execInContainer(workspaceId, [
          'pip', 'install', '-r', '/workspace/requirements.txt'
        ]);
        
        console.log('✅ Python packages installed');
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
  createWorkspaceSnapshot,
  restoreWorkspaceSnapshot
};
