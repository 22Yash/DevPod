const mongoose = require('mongoose');

const shareSnapshotSchema = new mongoose.Schema({
  shareToken: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  workspaceId: {
    type: String,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  template: {
    type: String,
    required: true,
    enum: ['python', 'nodejs', 'mern', 'java']
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  snapshot: {
    files: [{
      path: String,
      content: String,
      size: Number
    }],
    packages: [String],
    totalSize: Number
  },
  expiresAt: {
    type: Date,
    default: null
  },
  maxClones: {
    type: Number,
    default: null // null = unlimited
  },
  cloneCount: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for cleanup of expired shares
shareSnapshotSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Method to check if share is still valid
shareSnapshotSchema.methods.isValid = function() {
  if (!this.isActive) return false;
  if (this.expiresAt && new Date() > this.expiresAt) return false;
  if (this.maxClones && this.cloneCount >= this.maxClones) return false;
  return true;
};

// Method to increment clone count (atomic)
shareSnapshotSchema.methods.incrementCloneCount = async function() {
  return mongoose.model('ShareSnapshot').updateOne(
    { _id: this._id },
    { $inc: { cloneCount: 1 } }
  );
};

module.exports = mongoose.model('ShareSnapshot', shareSnapshotSchema);
