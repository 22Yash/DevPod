const mongoose = require('mongoose');

const workspaceSchema = new mongoose.Schema({
  workspaceId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['running', 'stopped', 'deleted'],
    default: 'stopped'
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  template: {
    type: String,
    required: true
  },
  containerId: String,
  
  // Port information
  idePort: Number,
  frontendPort: Number,
  backendPort: Number,
  
  // Repository info (if applicable)
  repositoryUrl: String,
  repositoryName: String,
  branches: {
    type: Number,
    default: 1
  },
  
  // Collaboration
  collaborators: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  lastAccessed: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for faster queries
workspaceSchema.index({ userId: 1, status: 1 });
workspaceSchema.index({ userId: 1, lastAccessed: -1 });

// Method to update last accessed time
workspaceSchema.methods.updateLastAccessed = function() {
  this.lastAccessed = new Date();
  return this.save();
};

module.exports = mongoose.model('Workspace', workspaceSchema);