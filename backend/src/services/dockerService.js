// backend/src/services/dockerService.js

const Docker = require('dockerode');

// Global docker instance
let docker;

/**
 * Maps template keys to the corresponding Docker image names.
 * Using custom Docker images from docker/ folder
 */
const TEMPLATE_IMAGES = {
    'python': 'devpod-python:latest',
    'nodejs': 'devpod-nodejs:latest', 
    'mern': 'devpod-mern:latest',
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
        },
        env: [
            'SHELL=/bin/bash',
            'DEBIAN_FRONTEND=noninteractive'
        ],
        cmd: [
            'code-server',
            '--bind-addr', '0.0.0.0:8080',
            '--auth', 'none',
            '--disable-telemetry',
            '/workspace'
        ]
    },
    'nodejs': {
        exposedPorts: { '8080/tcp': {} },
        hostConfig: {
            PortBindings: { '8080/tcp': [{ HostPort: '0' }] },
            Memory: 512 * 1024 * 1024,
            NanoCpus: 1 * 1e9,
        },
        env: [
            'SHELL=/bin/bash',
            'DEBIAN_FRONTEND=noninteractive'
        ],
        cmd: [
            'code-server',
            '--bind-addr', '0.0.0.0:8080',
            '--auth', 'none',
            '--disable-telemetry',
            '/workspace'
        ]
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
        },
        env: [
            'SHELL=/bin/bash',
            'DEBIAN_FRONTEND=noninteractive'
        ],
        cmd: [
            'code-server',
            '--bind-addr', '0.0.0.0:8080',
            '--auth', 'none',
            '--disable-telemetry',
            '/workspace'
        ]
    },
};

/**
 * Initialize Docker connection with multiple fallback options for Windows
 */
async function initializeDocker() {
    const configs = [
        // Windows Docker Desktop TCP API (most reliable)
        { host: 'localhost', port: 2375, protocol: 'http' },
        // Windows named pipe (alternative)
        { socketPath: '\\\\.\\pipe\\docker_engine' },
        // WSL2 socket (if using WSL2 backend)
        { socketPath: '/var/run/docker.sock' },
        // Default configuration
        {}
    ];

    for (let i = 0; i < configs.length; i++) {
        const config = configs[i];
        try {
            console.log(`🔄 Trying Docker config ${i + 1}/${configs.length}:`, config);
            const testDocker = new Docker(config);
            
            // Test with timeout
            const pingPromise = testDocker.ping();
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Connection timeout')), 5000)
            );
            
            await Promise.race([pingPromise, timeoutPromise]);
            
            docker = testDocker;
            console.log(`✅ Docker connected successfully with config ${i + 1}:`, config);
            return docker;
        } catch (error) {
            console.log(`❌ Config ${i + 1} failed:`, error.message);
        }
    }
    
    throw new Error('Docker daemon not accessible. Please ensure Docker Desktop is running and API is enabled in Settings → General → "Expose daemon on tcp://localhost:2375"');
}

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
 * Check if Docker is accessible and pull image if needed
 */
async function ensureDockerImage(imageName) {
    try {
        console.log(`🔍 Checking if image exists: ${imageName}`);
        
        // Check if image exists locally
        const images = await docker.listImages();
        const imageExists = images.some(img => 
            img.RepoTags && img.RepoTags.some(tag => tag === imageName)
        );
        
        if (!imageExists) {
            console.log(`🔨 Building custom image: ${imageName}`);
            
            // Build custom Docker image based on template
            let dockerfilePath;
            if (imageName.includes('python')) {
                dockerfilePath = './docker/python';
            } else if (imageName.includes('nodejs')) {
                dockerfilePath = './docker/nodejs';
            } else if (imageName.includes('mern')) {
                dockerfilePath = './docker/mern';
            } else {
                throw new Error(`Unknown template for image: ${imageName}`);
            }
            
            console.log(`🔨 Building from: ${dockerfilePath}`);
            
            // Build the image
            const buildStream = await docker.buildImage({
                context: dockerfilePath,
                src: ['.']
            }, {
                t: imageName,
                dockerfile: 'Dockerfile'
            });
            
            // Wait for build to complete
            await new Promise((resolve, reject) => {
                docker.modem.followProgress(buildStream, (err, output) => {
                    if (err) {
                        console.error(`❌ Build failed for ${imageName}:`, err);
                        return reject(err);
                    }
                    console.log(`✅ Image built successfully: ${imageName}`);
                    resolve();
                }, (event) => {
                    if (event.stream) {
                        console.log(`📦 Build: ${event.stream.trim()}`);
                    }
                });
            });
        } else {
            console.log(`✅ Image already exists: ${imageName}`);
        }
    } catch (error) {
        console.error(`❌ Failed to ensure image ${imageName}:`, error.message);
        throw new Error(`Failed to build Docker image: ${imageName}. Error: ${error.message}`);
    }
}

/**
 * Launches a new code-server container for a user workspace.
 */
async function launchWorkspace(userId, template, workspaceId) {
    console.log(`🚀 Launching workspace: ${workspaceId}, template: ${template}`);
    
    try {
        // Ensure Docker is connected
        if (!docker) {
            console.log('🔄 Initializing Docker connection...');
            await initializeDocker();
        }

        // Test Docker connection
        try {
            await docker.ping();
            console.log('✅ Docker daemon is accessible');
        } catch (error) {
            console.error('❌ Docker ping failed:', error.message);
            throw new Error('Docker daemon not accessible. Please ensure Docker Desktop is running and API is enabled.');
        }

        // Validate template
        const imageName = TEMPLATE_IMAGES[template];
        if (!imageName) {
            throw new Error(`Template '${template}' not supported. Available templates: ${Object.keys(TEMPLATE_IMAGES).join(', ')}`);
        }

        const config = TEMPLATE_CONFIG[template];
        if (!config) {
            throw new Error(`Configuration missing for template '${template}'.`);
        }

        // Ensure Docker image is available
        await ensureDockerImage(imageName);

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
            PortBindings: config.hostConfig.PortBindings,
            Env: config.env,
            Cmd: config.cmd
        });

        // Define the container configuration
        const container = await docker.createContainer({
            Image: imageName,
            name: `devpod-${workspaceId}`,
            ExposedPorts: config.exposedPorts,
            Env: config.env,
            Cmd: config.cmd,
            WorkingDir: '/workspace',
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
        await new Promise(resolve => setTimeout(resolve, 5000));

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

    } catch (error) {
        console.error(`❌ Failed to launch workspace ${workspaceId}:`, error.message);
        
        // Provide more specific error messages
        if (error.message.includes('Docker daemon not accessible')) {
            throw new Error('Docker is not running. Please start Docker Desktop and enable API access in Settings → General → "Expose daemon on tcp://localhost:2375"');
        } else if (error.message.includes('pull Docker image')) {
            throw new Error('Failed to download required Docker image. Please check your internet connection.');
        } else if (error.message.includes('Template')) {
            throw error; // Template validation errors are already user-friendly
        } else if (error.message.includes('port mapping')) {
            throw new Error('Failed to allocate ports for workspace. Please try again.');
        } else {
            throw new Error(`Workspace launch failed: ${error.message}`);
        }
    }
}

/**
 * Stops a running container.
 */
async function stopWorkspace(workspaceId) {
    try {
        if (!docker) {
            await initializeDocker();
        }
        const container = docker.getContainer(`devpod-${workspaceId}`);
        await container.stop();
        console.log(`🛑 Workspace stopped: ${workspaceId}`);
    } catch (error) {
        console.error(`❌ Failed to stop workspace ${workspaceId}:`, error.message);
        throw new Error(`Failed to stop workspace: ${error.message}`);
    }
}

/**
 * Resumes a stopped container.
 */
async function resumeWorkspace(workspaceId) {
    try {
        if (!docker) {
            await initializeDocker();
        }
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
    } catch (error) {
        console.error(`❌ Failed to resume workspace ${workspaceId}:`, error.message);
        throw new Error(`Failed to resume workspace: ${error.message}`);
    }
}

/**
 * Deletes a container and its associated volume.
 */
async function deleteWorkspace(workspaceId) {
    try {
        if (!docker) {
            await initializeDocker();
        }
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
    } catch (error) {
        console.error(`❌ Failed to delete workspace ${workspaceId}:`, error.message);
        throw new Error(`Failed to delete workspace: ${error.message}`);
    }
}

/**
 * Executes a command (like git) inside a running container.
 */
async function execInContainer(workspaceId, cmd) {
    try {
        if (!docker) {
            await initializeDocker();
        }
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
    } catch (error) {
        console.error(`❌ Failed to execute command in ${workspaceId}:`, error.message);
        throw new Error(`Failed to execute command: ${error.message}`);
    }
}

// Initialize Docker connection on module load
initializeDocker().catch(error => {
    console.error('❌ Docker initialization failed:', error.message);
});

module.exports = {
    launchWorkspace,
    stopWorkspace,
    resumeWorkspace,
    deleteWorkspace,
    execInContainer,
};