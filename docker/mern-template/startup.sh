#!/bin/bash

set -e

echo "=================================="
echo "Starting MERN Template Environment"
echo "=================================="

# Print environment info
echo "Node version: $(node --version)"
echo "NPM version: $(npm --version)"
echo "Code-server version: $(code-server --version)"
echo "Working directory: $(pwd)"

# Ensure we're in the correct directory
cd /workspace

echo ""
echo "Starting code-server on port 8080..."
echo "Access the IDE at: http://localhost:8080"
echo ""
echo "Available commands:"
echo "  - Frontend dev server: cd frontend && npm start (port 3000)"
echo "  - Backend server: cd backend && npm start (port 5000)"
echo ""

# Start code-server
exec code-server \
    --bind-addr 0.0.0.0:8080 \
    --auth none \
    --disable-telemetry \
    --disable-update-check \
    /workspace