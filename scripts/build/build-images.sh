#!/bin/bash

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
cd "${REPO_ROOT}"

echo "🔨 Building DevPod Docker Images..."

# Build Python image
echo "📦 Building Python image..."
docker build -t devpod-python:latest ./docker/python/ --no-cache
if [ $? -eq 0 ]; then
    echo "✅ Python image built successfully"
else
    echo "❌ Failed to build Python image"
    exit 1
fi

# Build Node.js image
echo "📦 Building Node.js image..."
docker build -t devpod-nodejs:latest ./docker/nodejs/ --no-cache
if [ $? -eq 0 ]; then
    echo "✅ Node.js image built successfully"
else
    echo "❌ Failed to build Node.js image"
    exit 1
fi

# Build MERN image
echo "📦 Building MERN image..."
docker build -t devpod-mern:latest ./docker/mern-template/ --no-cache
if [ $? -eq 0 ]; then
    echo "✅ MERN image built successfully"
else
    echo "❌ Failed to build MERN image"
    exit 1
fi

echo "🎉 All images built successfully!"
echo ""
echo "📋 Available images:"
docker images | grep devpod

echo ""
echo "🧪 Test your Python workspace:"
echo "1. Launch Python template from dashboard"
echo "2. Open terminal in code-server (Ctrl+\`)"
echo "3. Run: python welcome.py"
