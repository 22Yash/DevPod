#!/bin/bash

# Quick Setup Script for DevPod Project
# This script automates the initial setup process

echo ""
echo "========================================"
echo "  DevPod Project - Quick Setup"
echo "========================================"
echo ""

# Check if Node.js is installed
echo "[1/6] Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install from https://nodejs.org/"
    exit 1
fi
echo "✅ Node.js found:"
node --version

# Check if Docker is installed
echo ""
echo "[2/6] Checking Docker installation..."
if ! command -v docker &> /dev/null; then
    echo "❌ Docker not found. Please install from https://www.docker.com/products/docker-desktop"
    exit 1
fi
echo "✅ Docker found:"
docker --version

# Check if Docker daemon is running
echo ""
echo "[3/6] Checking Docker daemon..."
if ! docker ps &> /dev/null; then
    echo "❌ Docker daemon not running. Please start Docker Desktop."
    exit 1
fi
echo "✅ Docker daemon is running"

# Install backend dependencies
echo ""
echo "[4/6] Installing backend dependencies..."
cd backend
if [ -d "node_modules" ]; then
    echo "ℹ️  Backend dependencies already installed"
else
    echo "Installing npm packages..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install backend dependencies"
        exit 1
    fi
fi
echo "✅ Backend dependencies ready"
cd ..

# Install frontend dependencies
echo ""
echo "[5/6] Installing frontend dependencies..."
cd frontend
if [ -d "node_modules" ]; then
    echo "ℹ️  Frontend dependencies already installed"
else
    echo "Installing npm packages..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install frontend dependencies"
        exit 1
    fi
fi
echo "✅ Frontend dependencies ready"
cd ..

# Build Docker images
echo ""
echo "[6/6] Building Docker images..."
echo "This may take 5-10 minutes on first run..."
chmod +x build-images.sh
./build-images.sh
if [ $? -ne 0 ]; then
    echo "❌ Failed to build Docker images"
    exit 1
fi
echo "✅ Docker images built successfully"

echo ""
echo "========================================"
echo "  Setup Complete!"
echo "========================================"
echo ""
echo "Next steps:"
echo ""
echo "1. Configure environment variables:"
echo "   - Edit backend/.env with your MongoDB URI and GitHub OAuth credentials"
echo "   - Edit frontend/.env with your API URL and GitHub Client ID"
echo ""
echo "2. Start the backend (Terminal 1):"
echo "   cd backend"
echo "   npm run server"
echo ""
echo "3. Start the frontend (Terminal 2):"
echo "   cd frontend"
echo "   npm run dev"
echo ""
echo "4. Open browser:"
echo "   http://localhost:5173"
echo ""
echo "For detailed setup instructions, see TEAM-SETUP-GUIDE.md"
echo "For troubleshooting, see CODESERVER-LOGIN-FIX.md"
echo ""
