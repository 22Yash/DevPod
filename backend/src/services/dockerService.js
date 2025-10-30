// backend/src/services/dockerService.js

const Docker = require('dockerode');
const docker = new Docker({ socketPath: '/var/run/docker.sock' }); 

/**
 * Maps template keys to the corresponding Docker image names.
 */
const TEMPLATE_IMAGES = {
    'python': 'devpod/python:latest',
    'nodejs': 'devpod/nodejs:latest',
    'mern': 'devpod/mern:latest',
};

/**
 * Configuration for each template (ports, resources, etc.)
 */
const TEMPLATE_CONFIG = {
    'python': {
        exposedPorts: { '8080/tcp': {} },
        hostConfig: {
            PortBindings: { '8080/tcp': [{ HostPort: '0' }] },
            Memory: 512 * 1024 * 1024,
            NanoCpus: 1 * 1e9,
        }
    },
    'nodejs': {
        exposedPorts: { '8080/tcp': {} },
        hostConfig: {
            PortBindings: { '8080/tcp': [{ HostPort: '0' }] },
            Memory: 512 * 1024 * 1024,
            NanoCpus: 1 * 1e9,
        }
    },
    'mern': {
        exposedPorts: { 
            '8080/tcp': {},
            '3000/tcp': {},
            '5000/tcp': {},
        },
        hostConfig: {
            PortBindings: { 
                '8080/tcp': [{ HostPort: '0' }],
                '3000/tcp': [{ HostPort: '0' }],
                '5000/tcp': [{ HostPort: '0' }],
            },
            Memory: 1024 * 1024 * 1024,
            NanoCpus: 2 * 1e9,
        }
    },
};

/**
 * Helper function to safely extract port from container info
 */
function getPortMapping(info, portKey) {
    try {
        const ports = info.NetworkSettings?.Ports;
        if (!ports) {
            throw new Error(`No ports found in NetworkSettings`);
        }
        
        const portMapping = ports[portKey];
        if (!portMapping || !Array.isArray(portMapping) || portMapping.length === 0) {
            throw new Error(`No port mapping found for ${portKey}`);
        }
        
        const hostPort = portMapping[0]?.HostPort;
        if (!hostPort) {
            throw new Error(`HostPort not found for ${portKey}`);
        }
        
        return hostPort;
    } catch (error) {
        console.error(`❌ Error getting port mapping for ${portKey}:`, error.message);
        console.error('Available ports:', JSON.stringify(info.NetworkSettings?.Ports, null, 2));
        throw error;
    }
}

/**
 * Launches a new code-server container for a user workspace.
 */
async function launchWorkspace(userId, template, workspaceId) {
    console.log(`🚀 Launching workspace: ${workspaceId}, template: ${template}`);
    
    const imageName = TEMPLATE_IMAGES[template];
    
    if (!imageName) {
        throw new Error(`Template key '${template}' not supported by the backend.`);
    }

    const config = TEMPLATE_CONFIG[template];
    if (!config) {
        throw new Error(`Configuration missing for template '${template}'.`);
    }

    // Create unique volume for persistence
    const volumeName = `devpod-${workspaceId}`;
    try {
        await docker.createVolume({ Name: volumeName });
        console.log(`✅ Volume created: ${volumeName}`);
    } catch (e) {
        if (!e.message.includes("already exists")) {
            console.error(`❌ Volume creation failed:`, e);
            throw e;
        }
        console.log(`⚠️  Volume already exists, reusing: ${volumeName}`);
    }

    // Log container configuration for debugging
    console.log('🔧 Creating container with config:', {
        Image: imageName,
        ExposedPorts: config.exposedPorts,
        PortBindings: config.hostConfig.PortBindings
    });

    // Define the container configuration
    const container = await docker.createContainer({
        Image: imageName,
        name: `devpod-${workspaceId}`,
        ExposedPorts: config.exposedPorts,
        HostConfig: {
            ...config.hostConfig,
            Binds: [`${volumeName}:/workspace`],
            AutoRemove: false,
            NetworkMode: 'bridge',
        },
    });

    console.log(`📦 Container created: ${container.id}`);
    await container.start();
    console.log(`✅ Container started`);

    // Wait a moment for port bindings to be established
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Inspect the container to get the randomly assigned host ports
    const info = await container.inspect();
    
    // Debug: Log the full port mapping
    console.log('📊 Port mappings:', JSON.stringify(info.NetworkSettings.Ports, null, 2));
    
    // Use helper function to safely get ports
    const idePort = getPortMapping(info, '8080/tcp');

    const result = {
        containerId: container.id,
        idePort: idePort,
        ideUrl: `http://localhost:${idePort}`,
    };

    // For MERN template, also return frontend and backend ports
    if (template === 'mern') {
        const frontendPort = getPortMapping(info, '3000/tcp');
        const backendPort = getPortMapping(info, '5000/tcp');
        
        result.frontendPort = frontendPort;
        result.backendPort = backendPort;
        result.frontendUrl = `http://localhost:${frontendPort}`;
        result.backendUrl = `http://localhost:${backendPort}`;
        
        console.log(`✅ MERN workspace launched:
  - IDE: http://localhost:${idePort}
  - Frontend: http://localhost:${frontendPort}
  - Backend: http://localhost:${backendPort}`);
    } else {
        console.log(`✅ Workspace launched - IDE: http://localhost:${idePort}`);
    }

    return result;
}

/**
 * Stops a running container.
 */
async function stopWorkspace(workspaceId) {
    const container = docker.getContainer(`devpod-${workspaceId}`);
    await container.stop();
    console.log(`🛑 Workspace stopped: ${workspaceId}`);
}

/**
 * Resumes a stopped container.
 */
async function resumeWorkspace(workspaceId) {
    const container = docker.getContainer(`devpod-${workspaceId}`);
    await container.start();
    console.log(`▶️  Workspace resumed: ${workspaceId}`);
    
    // Wait for port bindings
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const info = await container.inspect();
    const idePort = getPortMapping(info, '8080/tcp');
    
    const result = { 
        idePort,
        ideUrl: `http://localhost:${idePort}`,
    };

    // Check if this is a MERN container (has multiple ports)
    const ports = info.NetworkSettings?.Ports || {};
    if (ports['3000/tcp'] && ports['5000/tcp']) {
        const frontendPort = getPortMapping(info, '3000/tcp');
        const backendPort = getPortMapping(info, '5000/tcp');
        
        result.frontendPort = frontendPort;
        result.backendPort = backendPort;
        result.frontendUrl = `http://localhost:${frontendPort}`;
        result.backendUrl = `http://localhost:${backendPort}`;
    }
    
    return result;
}

/**
 * Deletes a container and its associated volume.
 */
async function deleteWorkspace(workspaceId) {
    const container = docker.getContainer(`devpod-${workspaceId}`);
    const volumeName = `devpod-${workspaceId}`;
    
    try { 
        await container.stop(); 
        console.log(`🛑 Container stopped: ${workspaceId}`);
    } catch (err) { 
        console.log(`⚠️  Container already stopped: ${workspaceId}`);
    }
    
    try {
        await container.remove();
        console.log(`🗑️  Container removed: ${workspaceId}`);
        
        const volume = docker.getVolume(volumeName);
        await volume.remove();
        console.log(`🗑️  Volume removed: ${volumeName}`);
    } catch (err) {
        console.warn(`⚠️  Could not fully delete workspace ${workspaceId}: ${err.message}`);
    }
}

/**
 * Executes a command (like git) inside a running container.
 */
async function execInContainer(workspaceId, cmd) {
    const container = docker.getContainer(`devpod-${workspaceId}`);
    const exec = await container.exec({
        Cmd: cmd,
        AttachStdout: true,
        AttachStderr: true,
    });
    
    const stream = await exec.start({ hijack: true, stdin: false });
    
    return new Promise((resolve, reject) => {
        let output = '';
        stream.on('data', (chunk) => { output += chunk.toString(); });
        stream.on('end', () => { resolve(output); });
        stream.on('error', reject);
    });
}

module.exports = {
    launchWorkspace,
    stopWorkspace,
    resumeWorkspace,
    deleteWorkspace,
    execInContainer,
};
