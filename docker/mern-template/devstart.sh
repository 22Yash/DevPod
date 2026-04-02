#!/bin/bash
# DevPod MERN dev launcher

if [ -f /workspace/.devpod-ports ]; then
  . /workspace/.devpod-ports
  echo ""
  echo "============================================"
  echo "  DevPod MERN Stack"
  echo "============================================"
  if [ -n "$FRONTEND_PORT" ]; then
    echo "  Frontend:  http://localhost:$FRONTEND_PORT"
  fi
  if [ -n "$BACKEND_PORT" ]; then
    echo "  Backend:   http://localhost:$BACKEND_PORT"
  fi
  echo "============================================"
  echo ""
fi

echo "  Starting servers... (Ctrl+C to stop)"
echo ""

cd /workspace
exec npx concurrently "npm run dev:backend" "npm run dev:frontend"
