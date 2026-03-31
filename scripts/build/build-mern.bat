@echo off
pushd "%~dp0\..\.."
echo 🍃 Building MERN DevPod Image...

docker build -t devpod-mern:latest ./docker/mern-template/ --no-cache
if %errorlevel% neq 0 (
    echo ❌ Failed to build MERN image
    exit /b 1
)

echo ✅ MERN image built successfully!
echo.
echo 📋 MERN image info:
docker images | findstr devpod-mern

echo.
echo 🧪 Test your MERN workspace:
echo 1. Launch MERN template from dashboard
echo 2. Open terminal in code-server (Ctrl+`)
echo 3. Run: npm run install-all
echo 4. Run: npm run dev
popd
