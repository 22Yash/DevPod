// Check workspace via DevPod API
const axios = require('axios');

async function checkWorkspaces() {
    try {
        console.log('🔍 Checking DevPod API for workspaces...');
        
        // Try to get workspaces from the API
        const response = await axios.get('http://localhost:4000/api/workspaces');
        
        console.log('📊 Workspaces found:', response.data.length);
        
        response.data.forEach((workspace, index) => {
            console.log(`\n${index + 1}. Workspace: ${workspace.name}`);
            console.log(`   ID: ${workspace._id}`);
            console.log(`   Template: ${workspace.template}`);
            console.log(`   Status: ${workspace.status}`);
            console.log(`   Created: ${workspace.createdAt}`);
            
            if (workspace.containerInfo) {
                console.log(`   Container ID: ${workspace.containerInfo.containerId}`);
                console.log(`   Port: ${workspace.containerInfo.port}`);
                console.log(`   IDE URL: ${workspace.containerInfo.ideUrl}`);
            }
        });
        
        // Check for MERN workspaces specifically
        const mernWorkspaces = response.data.filter(w => w.template === 'mern');
        
        if (mernWorkspaces.length > 0) {
            console.log('\n🎯 MERN workspaces found:');
            mernWorkspaces.forEach(workspace => {
                console.log(`\n📦 MERN Workspace: ${workspace.name}`);
                console.log(`   Status: ${workspace.status}`);
                if (workspace.containerInfo) {
                    console.log(`   Access URL: ${workspace.containerInfo.ideUrl}`);
                    console.log(`   Port: ${workspace.containerInfo.port}`);
                }
            });
        }
        
    } catch (error) {
        if (error.response) {
            console.error('❌ API Error:', error.response.status, error.response.data);
        } else {
            console.error('❌ Error:', error.message);
        }
    }
}

checkWorkspaces();