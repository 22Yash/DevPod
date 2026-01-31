@echo off
echo ⚙️ Building Node.js DevPod Image...

docker build -t devpod-nodejs:latest ./docker/nodejs/ --no-cache
if %errorlevel% neq 0 (
    echo ❌ Failed to build Node.js image
    exit /b 1
)

echo ✅ Node.js image built successfully!
echo.
echo 📋 Node.js image info:
docker images | findstr devpod-nodejs

echo.
echo 🧪 Test your Node.js workspace:
echo 1. Launch Node.js template from dashboard
echo 2. Open terminal in code-server (Ctrl+`)
echo 3. Run: node welcome.js