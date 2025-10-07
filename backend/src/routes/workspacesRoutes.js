// backend/src/routes/workspacesRoutes.js

const express = require('express');
const router = express.Router();
const dockerService = require('../services/dockerService');

// --------------------------------------------------------------------------
// 1. POST /api/v1/workspaces/launch
// --------------------------------------------------------------------------
router.post('/launch', async (req, res) => {
  const { template } = req.body;
  const userId = 'placeholder-user-123';
  
  const workspaceId = `${userId}-${Date.now()}`; 
  
  try {
    // FIXED: Destructure the correct property names
    const result = await dockerService.launchWorkspace(userId, template, workspaceId);
    
    res.status(200).json({ 
      workspaceId, 
      containerId: result.containerId,
      ideUrl: result.ideUrl,
      idePort: result.idePort,
      // Include MERN-specific URLs if available
      ...(result.frontendUrl && { frontendUrl: result.frontendUrl }),
      ...(result.backendUrl && { backendUrl: result.backendUrl }),
      ...(result.frontendPort && { frontendPort: result.frontendPort }),
      ...(result.backendPort && { backendPort: result.backendPort }),
      message: `Workspace launched successfully`
    });
  } catch (error) {
    console.error('Launch failed:', error.message);
    console.error('Stack:', error.stack);
    res.status(500).json({ 
      error: 'Failed to launch container.',
      details: error.message
    });
  }
});

// --------------------------------------------------------------------------
// 2. POST /api/v1/workspaces/:workspaceId/stop
// --------------------------------------------------------------------------
router.post('/:workspaceId/stop', async (req, res) => {
  const { workspaceId } = req.params;
  
  try {
    await dockerService.stopWorkspace(workspaceId);
    
    res.json({ message: `Workspace ${workspaceId} stopped.`, workspaceId });
  } catch (error) {
    console.error(`Error stopping workspace ${workspaceId}:`, error.message);
    res.status(500).json({ error: 'Failed to stop workspace', details: error.message });
  }
});

// --------------------------------------------------------------------------
// 3. POST /api/v1/workspaces/:workspaceId/start (Resume)
// --------------------------------------------------------------------------
router.post('/:workspaceId/start', async (req, res) => {
  const { workspaceId } = req.params;
  
  try {
    // FIXED: Use correct property names
    const result = await dockerService.resumeWorkspace(workspaceId);
    
    res.json({ 
      message: `Workspace ${workspaceId} resumed.`, 
      workspaceId, 
      idePort: result.idePort,
      ideUrl: result.ideUrl,
      // Include MERN-specific URLs if available
      ...(result.frontendUrl && { frontendUrl: result.frontendUrl }),
      ...(result.backendUrl && { backendUrl: result.backendUrl }),
      ...(result.frontendPort && { frontendPort: result.frontendPort }),
      ...(result.backendPort && { backendPort: result.backendPort }),
    });
  } catch (error) {
    console.error(`Error resuming workspace ${workspaceId}:`, error.message);
    res.status(500).json({ error: 'Failed to resume workspace', details: error.message });
  }
});

// --------------------------------------------------------------------------
// 4. DELETE /api/v1/workspaces/:workspaceId
// --------------------------------------------------------------------------
router.delete('/:workspaceId', async (req, res) => {
  const { workspaceId } = req.params;
  
  try {
    await dockerService.deleteWorkspace(workspaceId);
    
    res.json({ message: `Workspace ${workspaceId} successfully deleted.`, workspaceId });
  } catch (error) {
    console.error(`Error deleting workspace ${workspaceId}:`, error.message);
    res.status(500).json({ error: 'Failed to delete workspace', details: error.message });
  }
});

// --------------------------------------------------------------------------
// 5. POST /api/v1/workspaces/:workspaceId/exec
// --------------------------------------------------------------------------
router.post('/:workspaceId/exec', async (req, res) => {
  const { workspaceId } = req.params;
  const { command } = req.body;
  
  if (!Array.isArray(command) || command.length === 0) {
     return res.status(400).json({ error: 'Command must be a non-empty array of strings.' });
  }
  
  try {
    const output = await dockerService.execInContainer(workspaceId, command);
    
    res.json({ 
      message: 'Command executed successfully.', 
      command: command.join(' '),
      output 
    });
  } catch (error) {
    console.error(`Error executing command in ${workspaceId}:`, error.message);
    res.status(500).json({ error: 'Failed to execute command', details: error.message });
  }
});

module.exports = router;