// backend/src/services/dockerService.js

const Docker = require('dockerode');

let docker;

const TEMPLATE_IMAGES = {
    'python': 'devpod-python:latest',
    'nodejs': 'devpod-nodejs:latest', 
    'mern': 'devpod/mern:latest',
};

// All templates use the SAME config - only port 8080
// This is what works for Python and Node already
const TEMPLATE_CONFIG = {
    'python': {
        ExposedPorts: { '8080/tcp': {} },
        hostConfig: {
            PortBindings: { '8080/tcp': [{ HostPort: '0' }] },
            Memory: 512 * 1024 * 1024,
            NanoCpus: 1 * 1e9,
        },
        env: ['SHELL=/bin/bash', 'DEBIAN_FRONTEND=noninteractive'],
        cmd: ['code-server', '--bind-addr', '0.0.0.0:8080', '--auth', 'none', '--disable-telemetry', '/workspace']
    },
    'nodejs': {
        ExposedPorts: { '8080/tcp': {} },
        hostConfig: {
            PortBindings: { '8080/tcp': [{ HostPort: '0' }] },
            Memory: 512 * 1024 * 1024,
            NanoCpus: 1 * 1e9,
        },
        env: ['SHELL=/bin/bash', 'DEBIAN_FRONTEND=noninteractive'],
        cmd: ['code-server', '--bind-addr', '0.0.0.0:8080', '--auth', 'none', '--disable-telemetry', '/workspace']
    },
    // MERN uses EXACTLY the same port config as Python/Node
    // Only difference is more memory and CPUs
    'mern': {
        ExposedPorts: { '8080/tcp': {} },
        hostConfig: {
            PortBindings: { '8080/tcp': [{ HostPort: '0' }] },
            Memory: 1024 * 1024 * 1024,
            NanoCpus: 2 * 1e9,
        },
        env: ['SHELL=/bin/bash', 'DEBIAN_FRONTEND=noninteractive'],
        cmd: ['code-server', '--bind-addr', '0.0.0.0:8080', '--auth', 'none', '--disable-telemetry', '/workspace']
    },
};

/**
 * Initialize Docker connection with multiple fallback options for Windows
 */
async function initializeDocker() {
    const configs = [
        { host: 'localhost', port: 2375, protocol: 'http' },
        { socketPath: '\\\\.\\pipe\\docker_engine' },
        { socketPath: '/var/run/docker.sock' },
        {}
    ];

    for (let i = 0; i < configs.length; i++) {
        const config = configs[i];
        try {
            console.log(`🔄 Trying Docker config ${i + 1}/${configs.length}:`, config);
            const testDocker = new Docker(config);
            
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
    
    throw new Error('Docker daemon not accessible. Please ensure Docker Desktop is running.');
}

/**
 * Check if Docker image exists, build if not
 */
async function ensureDockerImage(imageName) {
    try {
        console.log(`🔍 Checking if image exists: ${imageName}`);
        
        const images = await docker.listImages();
        const imageExists = images.some(img => 
            img.RepoTags && img.RepoTags.some(tag => tag === imageName)
        );
        
        if (!imageExists) {
            console.log(`🔨 Building custom image: ${imageName}`);
            
            let dockerfilePath;
            if (imageName.includes('python')) dockerfilePath = './docker/python';
            else if (imageName.includes('nodejs')) dockerfilePath = './docker/nodejs';
            else if (imageName.includes('mern')) dockerfilePath = './docker/mern';
            else throw new Error(`Unknown template for image: ${imageName}`);
            
            console.log(`🔨 Building from: ${dockerfilePath}`);
            
            const buildStream = await docker.buildImage({
                context: dockerfilePath,
                src: ['.']
            }, {
                t: imageName,
                dockerfile: 'Dockerfile'
            });
            
            await new Promise((resolve, reject) => {
                docker.modem.followProgress(buildStream, (err) => {
                    if (err) return reject(err);
                    console.log(`✅ Image built successfully: ${imageName}`);
                    resolve();
                }, (event) => {
                    if (event.stream) console.log(`📦 Build: ${event.stream.trim()}`);
                });
            });
        } else {
            console.log(`✅ Image already exists: ${imageName}`);
        }
    } catch (error) {
        console.error(`❌ Failed to ensure image ${imageName}:`, error.message);
        throw error;
    }
}

/**
 * Launches a new code-server container for a user workspace.
 */
async function launchWorkspace(userId, template, workspaceId) {
    console.log(`🚀 Launching workspace: ${workspaceId}, template: ${template}`);
    
    try {
        if (!docker) await initializeDocker();

        await docker.ping();
        console.log('✅ Docker daemon is accessible');

        const imageName = TEMPLATE_IMAGES[template];
        if (!imageName) {
            throw new Error(`Template '${template}' not supported.`);
        }

        const config = TEMPLATE_CONFIG[template];
        if (!config) {
            throw new Error(`Config missing for template '${template}'.`);
        }

        await ensureDockerImage(imageName);

        // Create volume
        const volumeName = `devpod-${workspaceId}`;
        try {
            await docker.createVolume({ Name: volumeName });
            console.log(`✅ Volume created: ${volumeName}`);
        } catch (e) {
            if (!e.message.includes("already exists")) throw e;
            console.log(`⚠️  Volume already exists: ${volumeName}`);
        }

        console.log('🔧 Creating container with config:', {
            Image: imageName,
            ExposedPorts: config.ExposedPorts,
            PortBindings: config.hostConfig.PortBindings,
        });

        // Create container - same structure for ALL templates
        const container = await docker.createContainer({
            Image: imageName,
            name: `devpod-${workspaceId}`,
            Tty: true,
            ExposedPorts: config.ExposedPorts,
            Env: config.env,
            Cmd: config.cmd,
            HostConfig: {
                Binds: [`${volumeName}:/workspace`],
                Memory: config.hostConfig.Memory,
                NanoCpus: config.hostConfig.NanoCpus,
                AutoRemove: false,
                PortBindings: config.hostConfig.PortBindings,
            },
        });

        console.log(`📦 Container created: ${container.id}`);
        await container.start();
        console.log(`✅ Container started`);

        // Wait for ports to bind
        await new Promise(resolve => setTimeout(resolve, 2000));

        const info = await container.inspect();
        console.log('📊 Port mappings:', JSON.stringify(info.NetworkSettings.Ports, null, 2));

        const idePort = info.NetworkSettings.Ports['8080/tcp'][0].HostPort;

        console.log(`✅ Workspace launched - IDE: http://localhost:${idePort}`);

        // Return same structure for ALL templates
        return {
            containerId: container.id,
            port: idePort,
            ideUrl: `http://localhost:${idePort}`,
        };

    } catch (error) {
        console.error(`❌ Failed to launch workspace ${workspaceId}:`, error.message);
        throw error;
    }
}

/**
 * Stops a running container.
 */
async function stopWorkspace(workspaceId) {
    try {
        if (!docker) await initializeDocker();
        const container = docker.getContainer(`devpod-${workspaceId}`);
        await container.stop();
        console.log(`🛑 Workspace stopped: ${workspaceId}`);
    } catch (error) {
        console.error(`❌ Failed to stop workspace ${workspaceId}:`, error.message);
        throw error;
    }
}

/**
 * Resumes a stopped container.
 */
async function resumeWorkspace(workspaceId) {
    try {
        if (!docker) await initializeDocker();
        const container = docker.getContainer(`devpod-${workspaceId}`);
        await container.start();
        console.log(`▶️  Workspace resumed: ${workspaceId}`);
        
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const info = await container.inspect();
        const idePort = info.NetworkSettings.Ports['8080/tcp'][0].HostPort;

        return { 
            port: idePort,
            ideUrl: `http://localhost:${idePort}`,
        };
    } catch (error) {
        console.error(`❌ Failed to resume workspace ${workspaceId}:`, error.message);
        throw error;
    }
}

/**
 * Deletes a container and its associated volume.
 */
async function deleteWorkspace(workspaceId) {
    try {
        if (!docker) await initializeDocker();
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
        throw error;
    }
}

/**
 * Executes a command inside a running container.
 */
async function execInContainer(workspaceId, cmd) {
    try {
        if (!docker) await initializeDocker();
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
        throw error;
    }
}

// Initialize Docker on module load
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