@echo off
pushd "%~dp0\..\.."
echo 🐍 Building Python DevPod Image...

docker build -t devpod-python:latest ./docker/python/ --no-cache
if %errorlevel% neq 0 (
    echo ❌ Failed to build Python image
    exit /b 1
)

echo ✅ Python image built successfully!
echo.
echo 📋 Python image info:
docker images | findstr devpod-python

echo.
echo 🧪 Test your Python workspace:
echo 1. Launch Python template from dashboard
echo 2. Open terminal in code-server (Ctrl+`)
echo 3. Run: python welcome.py
popd
