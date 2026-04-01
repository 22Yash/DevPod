    // backend/src/services/dockerService.js

    const Docker = require('dockerode');
    const { PassThrough } = require('stream');

    let docker;

    const TEMPLATE_IMAGES = {
        'python': 'devpod-python:latest',
        'nodejs': 'devpod-nodejs:latest',
        'mern': 'devpod-mern:latest',
        'java': 'devpod-java:latest',
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
        // MERN exposes code-server + frontend dev server + backend API
        'mern': {
            ExposedPorts: { '8080/tcp': {}, '3000/tcp': {}, '5000/tcp': {} },
            hostConfig: {
                PortBindings: {
                    '8080/tcp': [{ HostPort: '0' }],
                    '3000/tcp': [{ HostPort: '0' }],
                    '5000/tcp': [{ HostPort: '0' }],
                },
                Memory: 1024 * 1024 * 1024,
                NanoCpus: 2 * 1e9,
            },
            env: ['SHELL=/bin/bash', 'DEBIAN_FRONTEND=noninteractive'],
            cmd: ['code-server', '--bind-addr', '0.0.0.0:8080', '--auth', 'none', '--disable-telemetry', '/workspace']
        },
        'java': {
            ExposedPorts: { '8080/tcp': {} },
            hostConfig: {
                PortBindings: { '8080/tcp': [{ HostPort: '0' }] },
                Memory: 1024 * 1024 * 1024,
                NanoCpus: 2 * 1e9,
            },
            env: ['SHELL=/bin/bash', 'DEBIAN_FRONTEND=noninteractive']
        },
    };

    function isDockerNotFoundError(error) {
        return error?.statusCode === 404 || /no such (container|volume)|not found/i.test(error?.message || '');
    }

    async function ensureDockerClient() {
        if (!docker) {
            await initializeDocker();
        }

        return docker;
    }

    async function removeContainerByName(containerName) {
        const client = await ensureDockerClient();
        const container = client.getContainer(containerName);

        try {
            await container.inspect();
        } catch (error) {
            if (isDockerNotFoundError(error)) {
                console.log(`ℹ️  Container already absent: ${containerName}`);
                return;
            }

            throw error;
        }

        try {
            await container.stop();
            console.log(`🛑 Container stopped: ${containerName}`);
        } catch (error) {
            if (isDockerNotFoundError(error)) {
                console.log(`ℹ️  Container already absent while stopping: ${containerName}`);
                return;
            }

            console.log(`⚠️  Container stop skipped for ${containerName}: ${error.message}`);
        }

        try {
            await container.remove({ force: true });
            console.log(`🗑️  Container removed: ${containerName}`);
        } catch (error) {
            if (!isDockerNotFoundError(error)) {
                throw error;
            }

            console.log(`ℹ️  Container already removed: ${containerName}`);
        }
    }

    async function removeVolumeByName(volumeName) {
        const client = await ensureDockerClient();
        const volume = client.getVolume(volumeName);

        try {
            await volume.inspect();
        } catch (error) {
            if (isDockerNotFoundError(error)) {
                console.log(`ℹ️  Volume already absent: ${volumeName}`);
                return;
            }

            throw error;
        }

        try {
            await volume.remove();
            console.log(`🗑️  Volume removed: ${volumeName}`);
        } catch (error) {
            if (!isDockerNotFoundError(error)) {
                throw error;
            }

            console.log(`ℹ️  Volume already removed: ${volumeName}`);
        }
    }

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

                let timeoutId;
                const pingPromise = testDocker.ping();
                const timeoutPromise = new Promise((_, reject) => {
                    timeoutId = setTimeout(() => reject(new Error('Connection timeout')), 5000);
                });

                try {
                    await Promise.race([pingPromise, timeoutPromise]);
                } finally {
                    clearTimeout(timeoutId);
                }
                
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
                else if (imageName.includes('mern')) dockerfilePath = './docker/mern-template';
                else if (imageName.includes('java')) dockerfilePath = './docker/java';
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
        let volumeCreated = false;

        try {
            const client = await ensureDockerClient();

            await client.ping();
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
                await client.createVolume({ Name: volumeName });
                console.log(`✅ Volume created: ${volumeName}`);
                volumeCreated = true;
            } catch (e) {
                if (!e.message.includes("already exists")) throw e;
                console.log(`⚠️  Volume already exists: ${volumeName}`);
                volumeCreated = true;
            }

            console.log('🔧 Creating container with config:', {
                Image: imageName,
                ExposedPorts: config.ExposedPorts,
                PortBindings: config.hostConfig.PortBindings,
            });

            // Create container - same structure for ALL templates
            const container = await client.createContainer({
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

            const result = {
                containerId: container.id,
                idePort: idePort,
                ideUrl: `http://localhost:${idePort}`,
            };

            // Return extra ports for MERN workspaces
            const frontendMapping = info.NetworkSettings.Ports['3000/tcp'];
            const backendMapping = info.NetworkSettings.Ports['5000/tcp'];
            if (frontendMapping && frontendMapping[0]) {
                result.frontendPort = frontendMapping[0].HostPort;
                result.frontendUrl = `http://localhost:${result.frontendPort}`;
            }
            if (backendMapping && backendMapping[0]) {
                result.backendPort = backendMapping[0].HostPort;
                result.backendUrl = `http://localhost:${result.backendPort}`;
            }

            return result;

        } catch (error) {
            if (volumeCreated) {
                try {
                    await deleteWorkspace(workspaceId);
                } catch (cleanupError) {
                    console.warn(`⚠️  Failed to clean up partially launched workspace ${workspaceId}: ${cleanupError.message}`);
                }
            }

            console.error(`❌ Failed to launch workspace ${workspaceId}:`, error.message);
            throw error;
        }
    }

    /**
     * Stops a running container.
     */
    async function stopWorkspace(workspaceId) {
        try {
            const client = await ensureDockerClient();
            const container = client.getContainer(`devpod-${workspaceId}`);
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
            const client = await ensureDockerClient();
            const container = client.getContainer(`devpod-${workspaceId}`);
            await container.start();
            console.log(`▶️  Workspace resumed: ${workspaceId}`);
            
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            const info = await container.inspect();
            const idePort = info.NetworkSettings.Ports['8080/tcp'][0].HostPort;

            const result = {
                idePort: idePort,
                ideUrl: `http://localhost:${idePort}`,
            };

            const frontendMapping = info.NetworkSettings.Ports['3000/tcp'];
            const backendMapping = info.NetworkSettings.Ports['5000/tcp'];
            if (frontendMapping && frontendMapping[0]) {
                result.frontendPort = frontendMapping[0].HostPort;
                result.frontendUrl = `http://localhost:${result.frontendPort}`;
            }
            if (backendMapping && backendMapping[0]) {
                result.backendPort = backendMapping[0].HostPort;
                result.backendUrl = `http://localhost:${result.backendPort}`;
            }

            return result;
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
            const resourceName = `devpod-${workspaceId}`;
            await removeContainerByName(resourceName);
            await removeVolumeByName(resourceName);
        } catch (error) {
            console.error(`❌ Failed to delete workspace ${workspaceId}:`, error.message);
            throw error;
        }
    }

    async function resetDemoResources(prefix = 'devpod-') {
        try {
            const client = await ensureDockerClient();
            const containers = await client.listContainers({ all: true });
            const containerNames = new Set(
                containers
                    .flatMap((container) => container.Names || [])
                    .map((name) => name.replace(/^\//, ''))
                    .filter((name) => name.startsWith(prefix))
            );
            let volumesRemoved = 0;

            for (const containerName of containerNames) {
                await removeContainerByName(containerName);
            }

            const { Volumes = [] } = await client.listVolumes();
            for (const volume of Volumes) {
                if (volume.Name?.startsWith(prefix)) {
                    await removeVolumeByName(volume.Name);
                    volumesRemoved += 1;
                }
            }

            return {
                containersRemoved: containerNames.size,
                volumesRemoved,
                prefix,
            };
        } catch (error) {
            console.error(`❌ Failed to reset Docker demo resources for prefix ${prefix}:`, error.message);
            throw error;
        }
    }

    /**
     * Executes a command inside a running container.
     */
    async function execInContainer(workspaceId, cmd) {
        try {
            const client = await ensureDockerClient();
            const container = client.getContainer(`devpod-${workspaceId}`);
            const exec = await container.exec({
                Cmd: cmd,
                AttachStdout: true,
                AttachStderr: true,
                // Callers parse stdout as raw data (paths, file contents), so avoid PTY formatting.
                Tty: false,
            });

            const stream = await exec.start({ hijack: true, stdin: false });

            return new Promise((resolve, reject) => {
                let stdout = '';
                let stderr = '';
                const stdoutStream = new PassThrough();
                const stderrStream = new PassThrough();
                let settled = false;

                const rejectOnce = (error) => {
                    if (settled) return;
                    settled = true;
                    reject(error);
                };

                const finalize = async () => {
                    if (settled) return;

                    try {
                        const { ExitCode } = await exec.inspect();
                        if (ExitCode !== 0) {
                            const message = stderr.trim() || stdout.trim() || `Command exited with code ${ExitCode}`;
                            return rejectOnce(new Error(message));
                        }

                        settled = true;
                        resolve(stdout);
                    } catch (error) {
                        rejectOnce(error);
                    }
                };

                // Strip the 8-byte multiplex headers so we get clean output
                client.modem.demuxStream(stream, stdoutStream, stderrStream);

                stdoutStream.on('data', (chunk) => { stdout += chunk.toString(); });
                stderrStream.on('data', (chunk) => { stderr += chunk.toString(); });
                stdoutStream.on('error', rejectOnce);
                stderrStream.on('error', rejectOnce);
                stream.on('end', () => { void finalize(); });
                stream.on('close', () => { void finalize(); });
                stream.on('error', rejectOnce);
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
        resetDemoResources,
    };
