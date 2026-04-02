#!/bin/bash
# DevPod MERN dev launcher

echo ""
echo "============================================"
echo "  DevPod MERN Stack"
echo "============================================"
echo ""
echo "  Starting frontend + backend servers..."
echo "  Click 'Open in Browser' when code-server"
echo "  detects the ports, or check the PORTS tab."
echo ""
echo "============================================"
echo ""

cd /workspace
exec npx concurrently "npm run dev:backend" "npm run dev:frontend"
