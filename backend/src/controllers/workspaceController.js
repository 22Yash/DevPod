const Workspace = require('../models/Workspace');
const Activity = require('../models/Activity');
const dockerService = require('../services/dockerService');

const workspaceController = {
  // Get dashboard statistics
  getDashboardStats: async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const userId = req.session.userId;
      
      // Get active workspaces count
      const activeWorkspaces = await Workspace.countDocuments({
        userId,
        status: 'running'
      });
      
      // Get total projects
      const totalProjects = await Workspace.countDocuments({ 
        userId,
        status: { $ne: 'deleted' }
      });
      
      // Get unique collaborators across all workspaces
      const workspaces = await Workspace.find({ userId });
      const collaboratorsSet = new Set();
      workspaces.forEach(ws => {
        ws.collaborators.forEach(collab => 
          collaboratorsSet.add(collab.toString())
        );
      });
      
      // Calculate total hours saved (sum from all workspaces)
      const hoursSaved = workspaces.reduce((total, ws) => {
        const daysSinceCreation = Math.floor(
          (Date.now() - ws.createdAt) / (1000 * 60 * 60 * 24)
        );
        return total + Math.floor(daysSinceCreation * 0.5);
      }, 0);
      
      res.json({
        activeWorkspaces,
        totalProjects,
        collaborators: collaboratorsSet.size,
        hoursSaved
      });
    } catch (error) {
      console.error('Error getting dashboard stats:', error);
      res.status(500).json({ error: error.message });
    }
  },
  
  // Get all workspaces for current user
  getWorkspaces: async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { status } = req.query;
      const userId = req.session.userId;
      
      const query = { 
        userId,
        status: { $ne: 'deleted' }
      };
      
      if (status) {
        query.status = status;
      }
      
      const workspaces = await Workspace.find(query)
        .sort({ lastAccessed: -1 })
        .populate('collaborators', 'login avatar_url name');
      
      res.json(workspaces);
    } catch (error) {
      console.error('Error getting workspaces:', error);
      res.status(500).json({ error: error.message });
    }
  },
  
  // Get single workspace
  getWorkspace: async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const workspace = await Workspace.findOne({
        workspaceId: req.params.workspaceId,
        userId: req.session.userId
      }).populate('collaborators', 'login avatar_url name');
      
      if (!workspace) {
        return res.status(404).json({ error: 'Workspace not found' });
      }
      
      // Update last accessed
      await workspace.updateLastAccessed();
      
      res.json(workspace);
    } catch (error) {
      console.error('Error getting workspace:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Get recent activity
  getActivity: async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const limit = parseInt(req.query.limit) || 20;
      
      const activities = await Activity.find({ userId: req.session.userId })
        .sort({ timestamp: -1 })
        .limit(limit)
        .populate('workspaceId', 'name workspaceId');
      
      res.json(activities);
    } catch (error) {
      console.error('Error getting activity:', error);
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = workspaceController;