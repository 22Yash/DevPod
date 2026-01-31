@echo off
echo 🔨 Building DevPod Docker Images...

REM Build Python image
echo 📦 Building Python image...
docker build -t devpod-python:latest ./docker/python/ --no-cache
if %errorlevel% neq 0 (
    echo ❌ Failed to build Python image
    exit /b 1
)
echo ✅ Python image built successfully

REM Build Node.js image
echo 📦 Building Node.js image...
docker build -t devpod-nodejs:latest ./docker/nodejs/ --no-cache
if %errorlevel% neq 0 (
    echo ❌ Failed to build Node.js image
    exit /b 1
)
echo ✅ Node.js image built successfully

REM Build MERN image
echo 📦 Building MERN image...
docker build -t devpod-mern:latest ./docker/mern/ --no-cache
if %errorlevel% neq 0 (
    echo ❌ Failed to build MERN image
    exit /b 1
)
echo ✅ MERN image built successfully

echo 🎉 All images built successfully!
echo.
echo 📋 Available images:
docker images | findstr devpod

echo.
echo 🧪 Test your Python workspace:
echo 1. Launch Python template from dashboard
echo 2. Open terminal in code-server (Ctrl+`)
echo 3. Run: python welcome.py