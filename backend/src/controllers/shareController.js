const Workspace = require('../models/Workspace');
const ShareSnapshot = require('../models/ShareSnapshot');
const Activity = require('../models/Activity');
const shareService = require('../services/shareService');
const dockerService = require('../services/dockerService');

const shareController = {
  /**
   * Create a shareable snapshot of a workspace
   * POST /api/workspace/:workspaceId/share
   */
  createShareLink: async (req, res) => {
    let createdShareSnapshot = null;
    let workspace = null;
    let previousShareState = null;

    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { workspaceId } = req.params;
      const { expiresIn, maxClones } = req.body;

      // Find workspace
      workspace = await Workspace.findOne({
        workspaceId,
        userId: req.session.userId
      });

      if (!workspace) {
        return res.status(404).json({ error: 'Workspace not found' });
      }

      if (!shareService.isShareableTemplate(workspace.template)) {
        return res.status(400).json({
          error: 'Sharing is supported for Python, Node.js, and Java workspaces only'
        });
      }

      // Check if workspace is running
      if (workspace.status !== 'running') {
        return res.status(400).json({ 
          error: 'Workspace must be running to create a share link' 
        });
      }

      // Create snapshot
      console.log(`Creating snapshot for workspace: ${workspaceId}`);
      const snapshot = await shareService.createWorkspaceSnapshot(workspaceId, workspace.template);

      // Check snapshot size (limit to 10MB)
      if (snapshot.totalSize > 10 * 1024 * 1024) {
        return res.status(400).json({ 
          error: 'Workspace is too large to share (max 10MB)' 
        });
      }

      // Generate share token
      const shareToken = shareService.generateShareToken();

      // Calculate expiry
      let expiresAt = null;
      if (expiresIn) {
        expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + parseInt(expiresIn));
      }

      // Create share snapshot record
      createdShareSnapshot = await ShareSnapshot.create({
        shareToken,
        workspaceId,
        userId: req.session.userId,
        template: workspace.template,
        name: workspace.name,
        description: workspace.description,
        snapshot,
        expiresAt,
        maxClones: maxClones || null
      });

      previousShareState = {
        isShared: workspace.isShared,
        shareToken: workspace.shareToken,
      };

      // Update workspace
      workspace.isShared = true;
      workspace.shareToken = shareToken;
      await workspace.save();

      // Log activity
      await Activity.create({
        userId: req.session.userId,
        workspaceId: workspace._id,
        action: 'workspace_shared',
        details: `Shared workspace: ${workspace.name}`,
        timestamp: new Date()
      });

      await ShareSnapshot.updateMany(
        {
          workspaceId,
          isActive: true,
          _id: { $ne: createdShareSnapshot._id },
        },
        { isActive: false }
      );

      const shareUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/share/${shareToken}`;

      res.json({
        success: true,
        shareUrl,
        shareToken,
        expiresAt,
        maxClones,
        fileCount: snapshot.files.length,
        totalSize: snapshot.totalSize
      });

    } catch (error) {
      if (createdShareSnapshot?._id) {
        try {
          await ShareSnapshot.updateOne(
            { _id: createdShareSnapshot._id },
            { isActive: false }
          );
        } catch (cleanupError) {
          console.warn('Failed to deactivate incomplete share snapshot:', cleanupError.message);
        }
      }

      if (workspace && previousShareState) {
        try {
          workspace.isShared = previousShareState.isShared;
          workspace.shareToken = previousShareState.shareToken;
          await workspace.save();
        } catch (cleanupError) {
          console.warn('Failed to restore previous workspace share state:', cleanupError.message);
        }
      }

      console.error('Error creating share link:', error);
      res.status(500).json({ error: error.message });
    }
  },

  /**
   * Get share preview (public)
   * GET /api/share/:shareToken
   */
  getSharePreview: async (req, res) => {
    try {
      const { shareToken } = req.params;

      const shareSnapshot = await ShareSnapshot.findOne({ shareToken })
        .populate('userId', 'login avatar_url name');

      if (!shareSnapshot) {
        return res.status(404).json({ error: 'Share link not found' });
      }

      // Check if share is valid
      if (!shareSnapshot.isValid()) {
        return res.status(403).json({ 
          error: 'This share link has expired or reached its clone limit' 
        });
      }

      // Return preview info (without full file contents)
      res.json({
        name: shareSnapshot.name,
        description: shareSnapshot.description,
        template: shareSnapshot.template,
        owner: {
          name: shareSnapshot.userId.name || shareSnapshot.userId.login,
          avatar: shareSnapshot.userId.avatar_url
        },
        fileCount: shareSnapshot.snapshot.files.length,
        files: shareSnapshot.snapshot.files.map(f => ({
          path: f.path,
          size: f.size
        })),
        packages: shareSnapshot.snapshot.packages,
        cloneCount: shareSnapshot.cloneCount,
        maxClones: shareSnapshot.maxClones,
        expiresAt: shareSnapshot.expiresAt,
        createdAt: shareSnapshot.createdAt
      });

    } catch (error) {
      console.error('Error getting share preview:', error);
      res.status(500).json({ error: error.message });
    }
  },

  /**
   * Clone a shared workspace
   * POST /api/share/:shareToken/clone
   */
  cloneWorkspace: async (req, res) => {
    let newWorkspaceId = null;
    let createdWorkspace = false;

    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: 'You must be logged in to clone a workspace' });
      }

      const { shareToken } = req.params;
      const { customName } = req.body;

      // Find share snapshot
      const shareSnapshot = await ShareSnapshot.findOne({ shareToken });

      if (!shareSnapshot) {
        return res.status(404).json({ error: 'Share link not found' });
      }

      // Check if share is valid
      if (!shareSnapshot.isValid()) {
        return res.status(403).json({ 
          error: 'This share link has expired or reached its clone limit' 
        });
      }

      if (!shareService.isShareableTemplate(shareSnapshot.template)) {
        return res.status(400).json({
          error: 'Sharing is supported for Python, Node.js, and Java workspaces only'
        });
      }

      // Generate new workspace ID
      newWorkspaceId = `${req.session.userId}-${shareSnapshot.template}-${Date.now()}`;

      console.log(`Cloning workspace from share: ${shareToken}`);
      console.log(`New workspace ID: ${newWorkspaceId}`);

      // Launch new container
      const containerInfo = await dockerService.launchWorkspace(
        req.session.userId,
        shareSnapshot.template,
        newWorkspaceId,
        {
          githubToken: req.session.githubToken,
          gitUser: req.session.user
        }
      );

      // Wait for container to be ready
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Restore snapshot to new container
      await shareService.restoreWorkspaceSnapshot(
        newWorkspaceId,
        shareSnapshot.snapshot,
        shareSnapshot.template
      );

      // Create workspace record
      const newWorkspace = await Workspace.create({
        workspaceId: newWorkspaceId,
        name: customName || `${shareSnapshot.name} (Copy)`,
        description: shareSnapshot.description,
        status: 'running',
        userId: req.session.userId,
        template: shareSnapshot.template,
        containerId: containerInfo.containerId,
        idePort: containerInfo.idePort,
        frontendPort: containerInfo.frontendPort || null,
        backendPort: containerInfo.backendPort || null,
        clonedFrom: shareToken
      });
      createdWorkspace = true;

      // Increment clone count
      await shareSnapshot.incrementCloneCount();

      // Add cloner as collaborator on the original workspace
      await Workspace.updateOne(
        { workspaceId: shareSnapshot.workspaceId },
        { $addToSet: { collaborators: req.session.userId } }
      );

      // Log activity
      await Activity.create({
        userId: req.session.userId,
        workspaceId: newWorkspace._id,
        action: 'workspace_cloned',
        details: `Cloned workspace: ${shareSnapshot.name}`,
        timestamp: new Date()
      });

      res.json({
        success: true,
        workspace: {
          workspaceId: newWorkspace.workspaceId,
          name: newWorkspace.name,
          template: newWorkspace.template,
          ideUrl: containerInfo.ideUrl,
          status: newWorkspace.status
        },
        message: 'Workspace cloned successfully!'
      });

    } catch (error) {
      if (newWorkspaceId) {
        if (createdWorkspace) {
          try {
            await Workspace.deleteOne({ workspaceId: newWorkspaceId });
          } catch (cleanupError) {
            console.warn(`Failed to remove incomplete cloned workspace record ${newWorkspaceId}:`, cleanupError.message);
          }
        }

        try {
          await dockerService.deleteWorkspace(newWorkspaceId);
        } catch (cleanupError) {
          console.warn(`Failed to clean up incomplete cloned workspace ${newWorkspaceId}:`, cleanupError.message);
        }
      }

      console.error('Error cloning workspace:', error);
      res.status(500).json({ error: error.message });
    }
  },

  /**
   * Revoke share link
   * DELETE /api/workspace/:workspaceId/share
   */
  revokeShareLink: async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { workspaceId } = req.params;

      const workspace = await Workspace.findOne({
        workspaceId,
        userId: req.session.userId
      });

      if (!workspace) {
        return res.status(404).json({ error: 'Workspace not found' });
      }

      if (!workspace.shareToken) {
        return res.status(400).json({ error: 'Workspace is not shared' });
      }

      // Deactivate share snapshot
      await ShareSnapshot.updateMany(
        { workspaceId, isActive: true },
        { isActive: false }
      );

      // Update workspace
      workspace.isShared = false;
      workspace.shareToken = null;
      await workspace.save();

      // Log activity
      await Activity.create({
        userId: req.session.userId,
        workspaceId: workspace._id,
        action: 'share_revoked',
        details: `Revoked share link for: ${workspace.name}`,
        timestamp: new Date()
      });

      res.json({ 
        success: true,
        message: 'Share link revoked successfully' 
      });

    } catch (error) {
      console.error('Error revoking share link:', error);
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = shareController;
