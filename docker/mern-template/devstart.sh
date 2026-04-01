#!/bin/bash
# DevPod MERN dev launcher

echo ""
echo "============================================"
echo "  DevPod MERN Stack"
echo "============================================"
echo "  Frontend:  /absproxy/3000/"
echo "  Backend:   /absproxy/5000/"
echo ""
echo "  Open these paths in your code-server URL."
echo "  e.g. if IDE is at localhost:32800,"
echo "  frontend is at localhost:32800/absproxy/3000/"
echo "============================================"
echo ""
echo "  Starting servers... (Ctrl+C to stop)"
echo ""

cd /workspace
exec npx concurrently "npm run dev:backend" "npm run dev:frontend"
