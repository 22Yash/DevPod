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

    const MERN_FRONTEND_CONTAINER_PORT = '3000/tcp';
    const MERN_BACKEND_CONTAINER_PORT = '5000/tcp';
    const IDE_CONTAINER_PORT = '8080/tcp';

    function getHostPort(info, containerPort) {
        const binding = info?.NetworkSettings?.Ports?.[containerPort]?.[0]?.HostPort;
        return binding ? Number(binding) : null;
    }

    // In production, set WORKSPACE_DOMAIN to enable subdomain-based workspace URLs
    // (e.g. WORKSPACE_DOMAIN=mydevpod.me → https://ws-32768.mydevpod.me).
    // When unset, falls back to localhost:PORT for local development.
    const WORKSPACE_DOMAIN = process.env.WORKSPACE_DOMAIN || '';

    function buildWorkspaceUrl(port) {
        if (WORKSPACE_DOMAIN) {
            return `https://ws-${port}.${WORKSPACE_DOMAIN}`;
        }
        return `http://localhost:${port}`;
    }

    function buildWorkspaceAccessResult(containerId, info) {
        const idePort = getHostPort(info, IDE_CONTAINER_PORT);
        const frontendPort = getHostPort(info, MERN_FRONTEND_CONTAINER_PORT);
        const backendPort = getHostPort(info, MERN_BACKEND_CONTAINER_PORT);

        const result = {
            containerId,
            idePort,
            ideUrl: buildWorkspaceUrl(idePort),
        };

        if (frontendPort) {
            result.frontendPort = frontendPort;
            result.frontendUrl = buildWorkspaceUrl(frontendPort);
        }

        if (backendPort) {
            result.backendPort = backendPort;
            result.backendUrl = buildWorkspaceUrl(backendPort);
        }

        return result;
    }

    async function writeWorkspacePortsFile(workspaceId, portInfo) {
        const lines = [`IDE_PORT=${portInfo.idePort}`];

        if (portInfo.frontendPort) {
            lines.push(`FRONTEND_PORT=${portInfo.frontendPort}`);
        }

        if (portInfo.backendPort) {
            lines.push(`BACKEND_PORT=${portInfo.backendPort}`);
        }

        const command = [
            'sh',
            '-lc',
            `cat <<'EOF' > /workspace/.devpod-ports
${lines.join('\n')}
EOF`
        ];

        await execInContainer(workspaceId, command);
    }

    // Python/Node only need the IDE port. MERN also needs app ports published to the host.
    const TEMPLATE_CONFIG = {
        'python': {
            ExposedPorts: { [IDE_CONTAINER_PORT]: {} },
            hostConfig: {
                PortBindings: { [IDE_CONTAINER_PORT]: [{ HostPort: '0' }] },
                Memory: 512 * 1024 * 1024,
                NanoCpus: 1 * 1e9,
            },
            env: ['SHELL=/bin/bash', 'DEBIAN_FRONTEND=noninteractive'],
            cmd: ['code-server', '--bind-addr', '0.0.0.0:8080', '--auth', 'none', '--disable-telemetry', '/workspace']
        },
        'nodejs': {
            ExposedPorts: { [IDE_CONTAINER_PORT]: {} },
            hostConfig: {
                PortBindings: { [IDE_CONTAINER_PORT]: [{ HostPort: '0' }] },
                Memory: 512 * 1024 * 1024,
                NanoCpus: 1 * 1e9,
            },
            env: ['SHELL=/bin/bash', 'DEBIAN_FRONTEND=noninteractive'],
            cmd: ['code-server', '--bind-addr', '0.0.0.0:8080', '--auth', 'none', '--disable-telemetry', '/workspace']
        },
        // MERN publishes the IDE plus the nested frontend/backend dev servers.
        'mern': {
            ExposedPorts: {
                [IDE_CONTAINER_PORT]: {},
                [MERN_FRONTEND_CONTAINER_PORT]: {},
                [MERN_BACKEND_CONTAINER_PORT]: {},
            },
            hostConfig: {
                PortBindings: {
                    [IDE_CONTAINER_PORT]: [{ HostPort: '0' }],
                    [MERN_FRONTEND_CONTAINER_PORT]: [{ HostPort: '0' }],
                    [MERN_BACKEND_CONTAINER_PORT]: [{ HostPort: '0' }],
                },
                Memory: 1024 * 1024 * 1024,
                NanoCpus: 2 * 1e9,
            },
            env: ['SHELL=/bin/bash', 'DEBIAN_FRONTEND=noninteractive'],
            cmd: ['code-server', '--bind-addr', '0.0.0.0:8080', '--auth', 'none', '--disable-telemetry', '/workspace']
        },
        'java': {
            ExposedPorts: { [IDE_CONTAINER_PORT]: {} },
            hostConfig: {
                PortBindings: { [IDE_CONTAINER_PORT]: [{ HostPort: '0' }] },
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
                
                const path = require('path');
                const repoRoot = path.resolve(__dirname, '..', '..', '..');
                let dockerfilePath;
                if (imageName.includes('python')) dockerfilePath = path.join(repoRoot, 'docker', 'python');
                else if (imageName.includes('nodejs')) dockerfilePath = path.join(repoRoot, 'docker', 'nodejs');
                else if (imageName.includes('mern')) dockerfilePath = path.join(repoRoot, 'docker', 'mern-template');
                else if (imageName.includes('java')) dockerfilePath = path.join(repoRoot, 'docker', 'java');
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
    async function launchWorkspace(userId, template, workspaceId, options = {}) {
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

            // Build env vars, injecting Git credentials if provided
            const envVars = [...(config.env || [])];
            if (options.githubToken) {
                envVars.push(`GITHUB_TOKEN=${options.githubToken}`);
            }
            if (options.gitUser) {
                envVars.push(`GIT_USER_NAME=${options.gitUser.name || options.gitUser.login}`);
                envVars.push(`GIT_USER_EMAIL=${options.gitUser.email || `${options.gitUser.login}@users.noreply.github.com`}`);
            }

            // Create container - same structure for ALL templates
            const container = await client.createContainer({
                Image: imageName,
                name: `devpod-${workspaceId}`,
                Tty: true,
                ExposedPorts: config.ExposedPorts,
                Env: envVars,
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

            const result = buildWorkspaceAccessResult(container.id, info);

            console.log(`✅ Workspace launched - IDE: ${result.ideUrl}`);
            if (result.frontendUrl) {
                console.log(`✅ MERN frontend published at: ${result.frontendUrl}`);
            }
            if (result.backendUrl) {
                console.log(`✅ MERN backend published at: ${result.backendUrl}`);
            }

            // Configure Git credentials inside the container
            if (options.githubToken) {
                try {
                    await execInContainer(workspaceId, [
                        'sh', '-c',
                        'git config --global credential.helper "!f() { echo username=x-access-token; echo password=$GITHUB_TOKEN; }; f"'
                    ]);
                    if (options.gitUser) {
                        const name = options.gitUser.name || options.gitUser.login;
                        const email = options.gitUser.email || `${options.gitUser.login}@users.noreply.github.com`;
                        await execInContainer(workspaceId, ['git', 'config', '--global', 'user.name', name]);
                        await execInContainer(workspaceId, ['git', 'config', '--global', 'user.email', email]);
                    }
                    console.log('✅ Git credentials configured in workspace');
                } catch (err) {
                    console.warn(`⚠️  Could not configure Git credentials: ${err.message}`);
                }
            }

            if (result.frontendPort || result.backendPort) {
                await writeWorkspacePortsFile(workspaceId, result);
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
            const result = buildWorkspaceAccessResult(null, info);

            if (result.frontendPort || result.backendPort) {
                await writeWorkspacePortsFile(workspaceId, result);
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
