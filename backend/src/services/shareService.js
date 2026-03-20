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

    // Get list of all files in workspace (excluding hidden and cache files)
    const findCommand = [
      'find', '/workspace',
      '-type', 'f',
      '!', '-path', '*/.*',
      '!', '-path', '*/__pycache__/*',
      '!', '-path', '*/node_modules/*',
      '-size', '-1M' // Only files smaller than 1MB
    ];
    
    const filesOutput = await dockerService.execInContainer(workspaceId, findCommand);
    const filePaths = filesOutput.trim().split('\n').filter(f => f);
    
    console.log(`📁 Found ${filePaths.length} files to snapshot`);

    // Read each file content
    for (const filePath of filePaths) {
      try {
        const content = await dockerService.execInContainer(workspaceId, ['cat', filePath]);
        const size = Buffer.byteLength(content, 'utf8');
        
        // Skip files larger than 500KB
        if (size > 500 * 1024) {
          console.log(`⚠️  Skipping large file: ${filePath} (${size} bytes)`);
          continue;
        }
        
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
      try {
        const fullPath = `/workspace${file.path}`;
        const dirPath = fullPath.substring(0, fullPath.lastIndexOf('/'));
        
        // Create directory if needed
        if (dirPath !== '/workspace') {
          await dockerService.execInContainer(workspaceId, [
            'mkdir', '-p', dirPath
          ]);
        }
        
        // Write file content (escape single quotes in content)
        const escapedContent = file.content.replace(/'/g, "'\\''");
        await dockerService.execInContainer(workspaceId, [
          'bash', '-c',
          `cat > '${fullPath}' << 'EOF'\n${file.content}\nEOF`
        ]);
        
        console.log(`✅ Restored: ${file.path}`);
        
      } catch (error) {
        console.warn(`⚠️  Could not restore file ${file.path}:`, error.message);
      }
    }

    // Install Python packages if requirements.txt exists
    if (snapshot.packages && snapshot.packages.length > 0) {
      console.log(`📦 Installing ${snapshot.packages.length} Python packages...`);
      
      try {
        // Create requirements.txt
        const requirementsContent = snapshot.packages.join('\n');
        await dockerService.execInContainer(workspaceId, [
          'bash', '-c',
          `echo '${requirementsContent}' > /workspace/requirements.txt`
        ]);
        
        // Install packages
        await dockerService.execInContainer(workspaceId, [
          'pip', 'install', '-r', '/workspace/requirements.txt'
        ]);
        
        console.log('✅ Python packages installed');
      } catch (error) {
        console.warn('⚠️  Could not install packages:', error.message);
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
