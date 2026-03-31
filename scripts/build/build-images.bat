@echo off
setlocal enabledelayedexpansion
pushd "%~dp0\..\.."
echo 🔨 Building DevPod Docker Images...
echo.

REM Check Docker is running
docker ps >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker daemon not running. Please start Docker Desktop.
    pause
    exit /b 1
)
echo ✅ Docker daemon is running
echo.

REM Build Python image with retry
echo 📦 Building Python image...
set "RETRY=0"
:python_retry
docker build -t devpod-python:latest ./docker/python/
if errorlevel 1 (
    set /a RETRY=!RETRY!+1
    if !RETRY! leq 2 (
        echo ⚠️  Build failed, retrying... (Attempt !RETRY!/2)
        timeout /t 5 /nobreak
        goto python_retry
    ) else (
        echo ❌ Failed to build Python image
        echo See docs\build\DOCKER-BUILD-TROUBLESHOOTING.md for help
        popd
        pause
        exit /b 1
    )
)
echo ✅ Python image built successfully
echo.

REM Build Node.js image with retry
echo 📦 Building Node.js image...
set "RETRY=0"
:nodejs_retry
docker build -t devpod-nodejs:latest ./docker/nodejs/
if errorlevel 1 (
    set /a RETRY=!RETRY!+1
    if !RETRY! leq 2 (
        echo ⚠️  Build failed, retrying... (Attempt !RETRY!/2)
        timeout /t 5 /nobreak
        goto nodejs_retry
    ) else (
        echo ❌ Failed to build Node.js image
        echo See docs\build\DOCKER-BUILD-TROUBLESHOOTING.md for help
        popd
        pause
        exit /b 1
    )
)
echo ✅ Node.js image built successfully
echo.

REM Build MERN image with retry
echo 📦 Building MERN image...
set "RETRY=0"
:mern_retry
docker build -t devpod-mern:latest ./docker/mern-template/
if errorlevel 1 (
    set /a RETRY=!RETRY!+1
    if !RETRY! leq 2 (
        echo ⚠️  Build failed, retrying... (Attempt !RETRY!/2)
        timeout /t 5 /nobreak
        goto mern_retry
    ) else (
        echo ❌ Failed to build MERN image
        echo See docs\build\DOCKER-BUILD-TROUBLESHOOTING.md for help
        popd
        pause
        exit /b 1
    )
)
echo ✅ MERN image built successfully
echo.

REM Build Java image with retry
echo 📦 Building Java image...
set "RETRY=0"
:java_retry
docker build -t devpod-java:latest ./docker/java/
if errorlevel 1 (
    set /a RETRY=!RETRY!+1
    if !RETRY! leq 2 (
        echo ⚠️  Build failed, retrying... (Attempt !RETRY!/2)
        timeout /t 5 /nobreak
        goto java_retry
    ) else (
        echo ❌ Failed to build Java image
        echo See docs\build\DOCKER-BUILD-TROUBLESHOOTING.md for help
        popd
        pause
        exit /b 1
    )
)
echo ✅ Java image built successfully
echo.

echo 🎉 All images built successfully!
echo.
echo 📋 Available images:
docker images | findstr devpod
echo.
echo 🧪 Test your Python workspace:
echo 1. Launch Python template from dashboard
echo 2. Open terminal in code-server (Ctrl+`)
echo 3. Run: python welcome.py
echo.
popd
pause
