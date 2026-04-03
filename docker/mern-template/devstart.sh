#!/bin/bash
# DevPod MERN dev launcher

if [ -f /workspace/.devpod-ports ]; then
  . /workspace/.devpod-ports
  echo ""
  echo "============================================"
  echo "  DevPod MERN Stack"
  echo "============================================"
  if [ -n "$FRONTEND_PORT" ]; then
    if [ -n "$WORKSPACE_DOMAIN" ]; then
      echo "  Frontend:  https://ws-$FRONTEND_PORT.$WORKSPACE_DOMAIN"
    else
      echo "  Frontend:  http://localhost:$FRONTEND_PORT"
    fi
  fi
  if [ -n "$BACKEND_PORT" ]; then
    if [ -n "$WORKSPACE_DOMAIN" ]; then
      echo "  Backend:   https://ws-$BACKEND_PORT.$WORKSPACE_DOMAIN"
    else
      echo "  Backend:   http://localhost:$BACKEND_PORT"
    fi
  fi
  echo "============================================"
  echo ""
fi

echo "  Starting servers... (Ctrl+C to stop)"
echo ""

cd /workspace
exec npx concurrently "npm run dev:backend" "npm run dev:frontend"
