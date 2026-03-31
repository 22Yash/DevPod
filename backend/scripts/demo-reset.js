const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../.env'), quiet: true });
dotenv.config({ quiet: true });

const connectDB = require('../src/config/database');
const demoResetService = require('../src/services/demoResetService');

async function run() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not set. Load the backend environment before running demo reset.');
    }

    await connectDB();
    const summary = await demoResetService.resetDemoEnvironment();

    console.log('✅ Demo environment reset complete');
    console.log(JSON.stringify(summary, null, 2));
  } catch (error) {
    console.error('❌ Demo reset failed:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

void run();
