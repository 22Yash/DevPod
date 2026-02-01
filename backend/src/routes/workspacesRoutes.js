const express = require('express');
const router = express.Router();
const dockerService = require('../services/dockerService');
const Workspace = require('../models/Workspace');
const Activity = require('../models/Activity');
const workspaceController = require('../controllers/workspaceController');

// Middleware to check authentication
const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.userId) {
    return next();
  }
  res.status(401).json({ error: 'Unauthorized. Please login.' });
};

// Dashboard and listing routes
router.get('/dashboard/stats', isAuthenticated, workspaceController.getDashboardStats);
router.get('/list', isAuthenticated, workspaceController.getWorkspaces);
router.get('/activity/recent', isAuthenticated, workspaceController.getActivity);
router.get('/:workspaceId/details', isAuthenticated, workspaceController.getWorkspace);

// --------------------------------------------------------------------------
// 1. POST /api/v1/workspaces/launch
// --------------------------------------------------------------------------
router.post('/launch', isAuthenticated, async (req, res) => {
  const { template, name, description, repositoryUrl } = req.body;
  const userId = req.session.userId;
  
  console.log(`🚀 Launch request from user ${userId}:`, { template, name });
  
  // Validate required fields
  if (!template) {
    return res.status(400).json({ 
      success: false,
      error: 'Template is required',
      details: 'Please specify a template (python, nodejs, mern, java)'
    });
  }
  
  const workspaceId = `${userId}-${Date.now()}`; 
  
  try {
    console.log(`🔄 Launching Docker container for workspace: ${workspaceId}`);
    
    // Launch Docker container
    const result = await dockerService.launchWorkspace(userId, template, workspaceId);
    
    console.log(`✅ Container launched successfully:`, result);
    
    // Save workspace to database
    const workspace = await Workspace.create({
      workspaceId,
      name: name || `${template}-workspace`,
      description: description || '',
      userId,
      template,
      status: 'running',
      containerId: result.containerId,
      idePort: result.idePort,
      frontendPort: result.frontendPort,
      backendPort: result.backendPort,
      repositoryUrl: repositoryUrl || '',
      repositoryName: repositoryUrl ? repositoryUrl.split('/').pop().replace('.git', '') : ''
    });

    console.log(`💾 Workspace saved to database:`, workspace._id);

    // Log activity
    await Activity.create({
      userId,
      workspaceId: workspace._id,
      action: 'workspace_launched',
      details: { 
        template, 
        containerId: result.containerId,
        workspaceId 
      }
    });
    
    const response = { 
      success: true,
      workspaceId, 
      containerId: result.containerId,
      ideUrl: result.ideUrl,
      idePort: result.idePort,
      message: `${template} workspace launched successfully`
    };

    // Add MERN-specific URLs if applicable
    if (result.frontendUrl) response.frontendUrl = result.frontendUrl;
    if (result.backendUrl) response.backendUrl = result.backendUrl;
    if (result.frontendPort) response.frontendPort = result.frontendPort;
    if (result.backendPort) response.backendPort = result.backendPort;
    
    console.log(`🎉 Launch successful, responding with:`, response);
    res.status(200).json(response);
    
  } catch (error) {
    console.error(`❌ Launch failed for workspace ${workspaceId}:`, error.message);
    console.error('Full error:', error);
    
    // Provide specific error messages based on error type
    let statusCode = 500;
    let errorMessage = 'Failed to launch workspace';
    let userMessage = 'Something went wrong. Please try again.';
    
    if (error.message.includes('Docker is not running')) {
      statusCode = 503;
      errorMessage = 'Docker service unavailable';
      userMessage = 'Docker is not running. Please start Docker Desktop and try again.';
    } else if (error.message.includes('Template') && error.message.includes('not supported')) {
      statusCode = 400;
      errorMessage = 'Invalid template';
      userMessage = error.message;
    } else if (error.message.includes('Failed to download')) {
      statusCode = 502;
      errorMessage = 'Image download failed';
      userMessage = 'Failed to download required files. Please check your internet connection.';
    } else if (error.message.includes('port')) {
      statusCode = 503;
      errorMessage = 'Port allocation failed';
      userMessage = 'No available ports. Please try again in a moment.';
    } else if (error.message.includes('Unauthorized')) {
      statusCode = 401;
      errorMessage = 'Authentication required';
      userMessage = 'Please log in again.';
    }
    
    res.status(statusCode).json({ 
      success: false,
      error: errorMessage,
      message: userMessage,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      workspaceId: workspaceId
    });
  }
});

// --------------------------------------------------------------------------
// 2. POST /api/v1/workspaces/:workspaceId/stop
// --------------------------------------------------------------------------
router.post('/:workspaceId/stop', isAuthenticated, async (req, res) => {
  const { workspaceId } = req.params;
  
  try {
    // Stop Docker container
    await dockerService.stopWorkspace(workspaceId);
    
    // Update workspace status in database
    const workspace = await Workspace.findOneAndUpdate(
      { workspaceId, userId: req.session.userId },
      { status: 'stopped' },
      { new: true }
    );

    if (!workspace) {
      return res.status(404).json({ error: 'Workspace not found' });
    }

    // Log activity
    await Activity.create({
      userId: req.session.userId,
      workspaceId: workspace._id,
      action: 'workspace_stopped',
      details: { workspaceId }
    });
    
    res.json({ message: `Workspace ${workspaceId} stopped.`, workspaceId });
  } catch (error) {
    console.error(`Error stopping workspace ${workspaceId}:`, error.message);
    res.status(500).json({ error: 'Failed to stop workspace', details: error.message });
  }
});

// --------------------------------------------------------------------------
// 3. POST /api/v1/workspaces/:workspaceId/start (Resume)
// --------------------------------------------------------------------------
router.post('/:workspaceId/start', isAuthenticated, async (req, res) => {
  const { workspaceId } = req.params;
  
  try {
    // Resume Docker container
    const result = await dockerService.resumeWorkspace(workspaceId);
    
    // Update workspace status in database
    const workspace = await Workspace.findOneAndUpdate(
      { workspaceId, userId: req.session.userId },
      { 
        status: 'running',
        lastAccessed: new Date()
      },
      { new: true }
    );

    if (!workspace) {
      return res.status(404).json({ error: 'Workspace not found' });
    }

    // Log activity
    await Activity.create({
      userId: req.session.userId,
      workspaceId: workspace._id,
      action: 'workspace_resumed',
      details: { workspaceId }
    });
    
    res.json({ 
      message: `Workspace ${workspaceId} resumed.`, 
      workspaceId, 
      idePort: result.idePort,
      ideUrl: result.ideUrl,
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
router.delete('/:workspaceId', isAuthenticated, async (req, res) => {
  const { workspaceId } = req.params;
  
  try {
    // Delete Docker container
    await dockerService.deleteWorkspace(workspaceId);
    
    // Update workspace status (soft delete)
    const workspace = await Workspace.findOneAndUpdate(
      { workspaceId, userId: req.session.userId },
      { status: 'deleted' },
      { new: true }
    );

    if (!workspace) {
      return res.status(404).json({ error: 'Workspace not found' });
    }

    // Log activity
    await Activity.create({
      userId: req.session.userId,
      workspaceId: workspace._id,
      action: 'workspace_deleted',
      details: { workspaceId, name: workspace.name }
    });
    
    res.json({ message: `Workspace ${workspaceId} successfully deleted.`, workspaceId });
  } catch (error) {
    console.error(`Error deleting workspace ${workspaceId}:`, error.message);
    res.status(500).json({ error: 'Failed to delete workspace', details: error.message });
  }
});

// --------------------------------------------------------------------------
// 5. POST /api/v1/workspaces/:workspaceId/exec
// --------------------------------------------------------------------------
router.post('/:workspaceId/exec', isAuthenticated, async (req, res) => {
  const { workspaceId } = req.params;
  const { command } = req.body;
  
  if (!Array.isArray(command) || command.length === 0) {
     return res.status(400).json({ error: 'Command must be a non-empty array of strings.' });
  }
  
  try {
    const output = await dockerService.execInContainer(workspaceId, command);
    
    // Find workspace for activity logging
    const workspace = await Workspace.findOne({ 
      workspaceId, 
      userId: req.session.userId 
    });

    if (workspace) {
      // Log activity
      await Activity.create({
        userId: req.session.userId,
        workspaceId: workspace._id,
        action: 'command_executed',
        details: { 
          workspaceId,
          command: command.join(' ')
        }
      });
    }
    
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