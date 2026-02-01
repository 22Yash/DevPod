// Test script to check Docker container status
const Docker = require('dockerode');

async function checkContainers() {
    try {
        const docker = new Docker({ host: 'localhost', port: 2375, protocol: 'http' });
        
        console.log('🔍 Checking Docker containers...');
        
        // List all containers (running and stopped)
        const containers = await docker.listContainers({ all: true });
        
        console.log(`Found ${containers.length} containers:`);
        
        containers.forEach((container, index) => {
            console.log(`\n${index + 1}. Container: ${container.Id.substring(0, 12)}`);
            console.log(`   Names: ${container.Names.join(', ')}`);
            console.log(`   Image: ${container.Image}`);
            console.log(`   Status: ${container.Status}`);
            console.log(`   State: ${container.State}`);
            console.log(`   Ports: ${JSON.stringify(container.Ports, null, 2)}`);
        });
        
        // Check for MERN containers specifically
        const mernContainers = containers.filter(c => 
            c.Names.some(name => name.includes('devpod')) || 
            c.Image.includes('mern')
        );
        
        if (mernContainers.length > 0) {
            console.log('\n🎯 Found DevPod/MERN containers:');
            for (const container of mernContainers) {
                console.log(`\n📦 Container: ${container.Names[0]}`);
                console.log(`   Image: ${container.Image}`);
                console.log(`   Status: ${container.Status}`);
                console.log(`   State: ${container.State}`);
                
                if (container.State === 'running') {
                    // Get detailed info for running containers
                    const containerObj = docker.getContainer(container.Id);
                    const info = await containerObj.inspect();
                    
                    console.log(`   Port mappings:`);
                    Object.entries(info.NetworkSettings.Ports || {}).forEach(([containerPort, hostPorts]) => {
                        if (hostPorts) {
                            hostPorts.forEach(hostPort => {
                                console.log(`     ${containerPort} -> localhost:${hostPort.HostPort}`);
                            });
                        }
                    });
                    
                    // Try to get logs
                    console.log(`\n📋 Recent logs:`);
                    try {
                        const logs = await containerObj.logs({
                            stdout: true,
                            stderr: true,
                            tail: 10
                        });
                        console.log(logs.toString());
                    } catch (logError) {
                        console.log(`   Could not retrieve logs: ${logError.message}`);
                    }
                }
            }
        } else {
            console.log('\n❌ No DevPod/MERN containers found');
        }
        
    } catch (error) {
        console.error('❌ Error checking containers:', error.message);
    }
}

checkContainers();