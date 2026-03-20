// Check Docker containers using dockerode (already available in backend)
const Docker = require('dockerode');

async function checkDockerContainers() {
    try {
        console.log('🔍 Initializing Docker connection...');
        
        // Use the same config as the dockerService
        const docker = new Docker({ host: 'localhost', port: 2375, protocol: 'http' });
        
        await docker.ping();
        console.log('✅ Docker connection successful');
        
        console.log('\n🔍 Listing all containers...');
        const containers = await docker.listContainers({ all: true });
        
        console.log(`Found ${containers.length} total containers`);
        
        // Look for DevPod or MERN related containers
        const relevantContainers = containers.filter(container => {
            const names = container.Names.join(' ').toLowerCase();
            const image = container.Image.toLowerCase();
            return names.includes('devpod') || 
                   names.includes('mern') || 
                   image.includes('mern') ||
                   image.includes('devpod');
        });
        
        if (relevantContainers.length === 0) {
            console.log('\n❌ No DevPod/MERN containers found');
            
            // Show all containers for debugging
            console.log('\n📋 All containers:');
            containers.forEach((container, index) => {
                console.log(`${index + 1}. ${container.Names[0]} (${container.Image}) - ${container.State}`);
            });
            return;
        }
        
        console.log(`\n🎯 Found ${relevantContainers.length} relevant containers:`);
        
        for (const container of relevantContainers) {
            console.log(`\n📦 Container: ${container.Names[0]}`);
            console.log(`   Image: ${container.Image}`);
            console.log(`   Status: ${container.Status}`);
            console.log(`   State: ${container.State}`);
            console.log(`   Created: ${new Date(container.Created * 1000).toLocaleString()}`);
            
            // Show port mappings
            if (container.Ports && container.Ports.length > 0) {
                console.log(`   Port mappings:`);
                container.Ports.forEach(port => {
                    if (port.PublicPort) {
                        console.log(`     ${port.PrivatePort}/${port.Type} -> localhost:${port.PublicPort}`);
                    } else {
                        console.log(`     ${port.PrivatePort}/${port.Type} (not exposed)`);
                    }
                });
            }
            
            // If container is running, get more details and logs
            if (container.State === 'running') {
                try {
                    const containerObj = docker.getContainer(container.Id);
                    const info = await containerObj.inspect();
                    
                    console.log(`   Detailed port info:`);
                    Object.entries(info.NetworkSettings.Ports || {}).forEach(([containerPort, hostPorts]) => {
                        if (hostPorts && hostPorts.length > 0) {
                            hostPorts.forEach(hostPort => {
                                console.log(`     ${containerPort} -> localhost:${hostPort.HostPort}`);
                                
                                // If this is port 8080 (code-server), show access URL
                                if (containerPort === '8080/tcp') {
                                    console.log(`     🌐 IDE Access: http://localhost:${hostPort.HostPort}`);
                                }
                            });
                        }
                    });
                    
                    // Get recent logs
                    console.log(`\n📋 Recent logs (last 15 lines):`);
                    const logs = await containerObj.logs({
                        stdout: true,
                        stderr: true,
                        tail: 15,
                        timestamps: true
                    });
                    
                    const logLines = logs.toString().split('\n').filter(line => line.trim());
                    logLines.forEach(line => {
                        // Clean up Docker log format
                        const cleanLine = line.replace(/^\x01\x00\x00\x00.{4}/, '').replace(/^\x02\x00\x00\x00.{4}/, '');
                        if (cleanLine.trim()) {
                            console.log(`     ${cleanLine}`);
                        }
                    });
                    
                } catch (detailError) {
                    console.log(`   ⚠️ Could not get detailed info: ${detailError.message}`);
                }
            }
        }
        
    } catch (error) {
        console.error('❌ Error checking Docker containers:', error.message);
        console.error('Stack:', error.stack);
    }
}

// Run the check
checkDockerContainers();