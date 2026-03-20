const express = require('express');
const router = express.Router();
const shareController = require('../controllers/shareController');

// Create share link (requires authentication)
router.post('/workspace/:workspaceId/share', shareController.createShareLink);

// Get share preview (public)
router.get('/share/:shareToken', shareController.getSharePreview);

// Clone workspace from share (requires authentication)
router.post('/share/:shareToken/clone', shareController.cloneWorkspace);

// Revoke share link (requires authentication)
router.delete('/workspace/:workspaceId/share', shareController.revokeShareLink);

module.exports = router;
