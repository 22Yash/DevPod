// Script to clear any stuck sessions
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

async function clearSessions() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear all sessions
    const sessionsCollection = mongoose.connection.db.collection('sessions');
    const result = await sessionsCollection.deleteMany({});
    console.log(`🗑️  Cleared ${result.deletedCount} sessions`);

    console.log('✅ All sessions cleared. Try logging in again.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error clearing sessions:', error.message);
    process.exit(1);
  }
}

clearSessions();
