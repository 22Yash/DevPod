#!/usr/bin/env node
/**
 * Welcome to your Node.js DevPod workspace! ⚙️
 * 
 * This is a sample Node.js file to get you started.
 * You can run this file by:
 * 1. Opening the terminal (Ctrl+`)
 * 2. Running: node welcome.js
 */

const os = require('os');
const path = require('path');
const readline = require('readline');

console.log('🎉 Welcome to your Node.js DevPod workspace!');
console.log(`⚙️  Node.js version: ${process.version}`);
console.log(`📁 Current directory: ${process.cwd()}`);
console.log(`💻 Platform: ${os.platform()} ${os.arch()}`);
console.log(`⏰ Current time: ${new Date().toLocaleString()}`);
console.log();
console.log('🚀 Quick start commands:');
console.log('  node --version       # Check Node.js version');
console.log('  npm --version        # Check npm version');
console.log('  npm init -y          # Initialize a new project');
console.log('  npm install <package>  # Install packages');
console.log();
console.log('📝 Try editing this file and running it again!');
console.log();

// Simple interactive example
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('👋 What\'s your name? ', (name) => {
  console.log(`Nice to meet you, ${name}! Happy coding! 🎯`);
  
  // Show some Node.js capabilities
  console.log('\n🔧 Node.js Environment Info:');
  console.log(`- Memory usage: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB`);
  console.log(`- Uptime: ${Math.round(process.uptime())} seconds`);
  console.log(`- Working directory: ${process.cwd()}`);
  
  rl.close();
});