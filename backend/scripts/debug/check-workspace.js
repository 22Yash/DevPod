// Check workspace via DevPod API
const axios = require('axios');
const API_URL = process.env.API_URL || 'http://localhost:4000';
const SESSION_COOKIE = process.env.SESSION_COOKIE;

async function checkWorkspaces() {
    try {
        console.log('🔍 Checking DevPod API for workspaces...');

        const headers = SESSION_COOKIE ? { Cookie: SESSION_COOKIE } : {};
        const response = await axios.get(`${API_URL}/api/v1/workspaces/list`, { headers });
        
        console.log('📊 Workspaces found:', response.data.length);
        
        response.data.forEach((workspace, index) => {
            console.log(`\n${index + 1}. Workspace: ${workspace.name}`);
            console.log(`   ID: ${workspace.workspaceId}`);
            console.log(`   Template: ${workspace.template}`);
            console.log(`   Status: ${workspace.status}`);
            console.log(`   Created: ${workspace.createdAt}`);

            if (workspace.containerId) console.log(`   Container ID: ${workspace.containerId}`);
            if (workspace.idePort) console.log(`   IDE URL: http://localhost:${workspace.idePort}`);
            if (workspace.frontendPort) console.log(`   Frontend URL: http://localhost:${workspace.frontendPort}`);
            if (workspace.backendPort) console.log(`   Backend URL: http://localhost:${workspace.backendPort}`);
        });
        
        // Check for MERN workspaces specifically
        const mernWorkspaces = response.data.filter(w => w.template === 'mern');
        
        if (mernWorkspaces.length > 0) {
            console.log('\n🎯 MERN workspaces found:');
            mernWorkspaces.forEach(workspace => {
                console.log(`\n📦 MERN Workspace: ${workspace.name}`);
                console.log(`   Status: ${workspace.status}`);
                if (workspace.idePort) console.log(`   IDE URL: http://localhost:${workspace.idePort}`);
                if (workspace.frontendPort) console.log(`   Frontend URL: http://localhost:${workspace.frontendPort}`);
                if (workspace.backendPort) console.log(`   Backend URL: http://localhost:${workspace.backendPort}`);
            });
        }
        
    } catch (error) {
        if (error.response?.status === 401) {
            console.error('❌ API Error: 401 Unauthorized');
            console.error('   Set SESSION_COOKIE from a logged-in browser session to use this script.');
        } else if (error.response) {
            console.error('❌ API Error:', error.response.status, error.response.data);
        } else {
            console.error('❌ Error:', error.message);
        }
    }
}

checkWorkspaces();
