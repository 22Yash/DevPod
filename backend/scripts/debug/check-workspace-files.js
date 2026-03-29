// Check workspace files in running MERN container
const Docker = require('dockerode');

async function checkWorkspaceFiles() {
    try {
        console.log('🔍 Checking workspace files in MERN containers...');
        
        const docker = new Docker({ host: 'localhost', port: 2375, protocol: 'http' });
        
        // Target the container on port 32773 (the one the user is having issues with)
        const containerName = 'devpod-69035a668d009489db6e1159-1769969485960';
        
        console.log(`📦 Inspecting container: ${containerName}`);
        
        const container = docker.getContainer(containerName);
        
        // Check if container is running
        const info = await container.inspect();
        console.log(`Container state: ${info.State.Status}`);
        
        if (info.State.Status !== 'running') {
            console.log('❌ Container is not running');
            return;
        }
        
        // List workspace contents
        console.log('\n📁 Checking /workspace contents:');
        const exec1 = await container.exec({
            Cmd: ['ls', '-la', '/workspace'],
            AttachStdout: true,
            AttachStderr: true,
        });
        
        const stream1 = await exec1.start({ hijack: true, stdin: false });
        let output1 = '';
        
        await new Promise((resolve) => {
            stream1.on('data', (chunk) => { output1 += chunk.toString(); });
            stream1.on('end', resolve);
        });
        
        console.log(output1);
        
        // Check if key MERN files exist
        console.log('\n🔍 Checking for key MERN files:');
        const filesToCheck = [
            '/workspace/package.json',
            '/workspace/frontend/package.json', 
            '/workspace/backend/package.json',
            '/workspace/frontend/src',
            '/workspace/backend/server.js'
        ];
        
        for (const file of filesToCheck) {
            try {
                const exec = await container.exec({
                    Cmd: ['test', '-e', file],
                    AttachStdout: true,
                    AttachStderr: true,
                });
                
                const stream = await exec.start({ hijack: true, stdin: false });
                const inspect = await exec.inspect();
                
                await new Promise((resolve) => {
                    stream.on('end', resolve);
                });
                
                const finalInspect = await exec.inspect();
                const exists = finalInspect.ExitCode === 0;
                
                console.log(`   ${exists ? '✅' : '❌'} ${file}`);
                
            } catch (error) {
                console.log(`   ❌ ${file} (error: ${error.message})`);
            }
        }
        
        // Check if we can access the frontend directory structure
        console.log('\n📁 Frontend directory structure:');
        try {
            const exec2 = await container.exec({
                Cmd: ['find', '/workspace/frontend', '-maxdepth', '2', '-type', 'f'],
                AttachStdout: true,
                AttachStderr: true,
            });
            
            const stream2 = await exec2.start({ hijack: true, stdin: false });
            let output2 = '';
            
            await new Promise((resolve) => {
                stream2.on('data', (chunk) => { output2 += chunk.toString(); });
                stream2.on('end', resolve);
            });
            
            console.log(output2);
        } catch (error) {
            console.log(`   Error checking frontend: ${error.message}`);
        }
        
        // Check if we can access the backend directory structure
        console.log('\n📁 Backend directory structure:');
        try {
            const exec3 = await container.exec({
                Cmd: ['find', '/workspace/backend', '-maxdepth', '2', '-type', 'f'],
                AttachStdout: true,
                AttachStderr: true,
            });
            
            const stream3 = await exec3.start({ hijack: true, stdin: false });
            let output3 = '';
            
            await new Promise((resolve) => {
                stream3.on('data', (chunk) => { output3 += chunk.toString(); });
                stream3.on('end', resolve);
            });
            
            console.log(output3);
        } catch (error) {
            console.log(`   Error checking backend: ${error.message}`);
        }
        
        // Try to test if we can run npm commands
        console.log('\n🧪 Testing npm availability:');
        try {
            const exec4 = await container.exec({
                Cmd: ['npm', '--version'],
                AttachStdout: true,
                AttachStderr: true,
            });
            
            const stream4 = await exec4.start({ hijack: true, stdin: false });
            let output4 = '';
            
            await new Promise((resolve) => {
                stream4.on('data', (chunk) => { output4 += chunk.toString(); });
                stream4.on('end', resolve);
            });
            
            console.log(`   npm version: ${output4.trim()}`);
        } catch (error) {
            console.log(`   ❌ npm not available: ${error.message}`);
        }
        
        // Check if frontend dev server can be started (just test the command)
        console.log('\n🧪 Testing frontend setup:');
        try {
            const exec5 = await container.exec({
                Cmd: ['bash', '-c', 'cd /workspace/frontend && npm list --depth=0'],
                AttachStdout: true,
                AttachStderr: true,
            });
            
            const stream5 = await exec5.start({ hijack: true, stdin: false });
            let output5 = '';
            
            await new Promise((resolve) => {
                stream5.on('data', (chunk) => { output5 += chunk.toString(); });
                stream5.on('end', resolve);
            });
            
            console.log('   Frontend dependencies:');
            console.log(output5);
        } catch (error) {
            console.log(`   ❌ Frontend check failed: ${error.message}`);
        }
        
    } catch (error) {
        console.error('❌ Error checking workspace files:', error.message);
    }
}

checkWorkspaceFiles();