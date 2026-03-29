@echo off
setlocal enabledelayedexpansion
pushd "%~dp0\..\.."
echo.
echo ========================================
echo   Manual Docker Image Build - Windows
echo ========================================
echo.

REM Check Docker is running
echo Checking Docker daemon...
docker ps >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker daemon not running. Please start Docker Desktop.
    pause
    exit /b 1
)
echo ✅ Docker daemon is running
echo.

REM Build Node.js image
echo [1/3] Building Node.js image...
echo Command: docker build -t devpod-nodejs:latest ./docker/nodejs/
docker build -t devpod-nodejs:latest ./docker/nodejs/
if errorlevel 1 (
    echo ❌ Failed to build Node.js image
    echo Try again or check docs\build\DOCKER-BUILD-TROUBLESHOOTING.md
    popd
    pause
    exit /b 1
)
echo ✅ Node.js image built successfully
echo.

REM Build MERN image
echo [2/3] Building MERN image...
echo Command: docker build -t devpod-mern:latest ./docker/mern-template/
docker build -t devpod-mern:latest ./docker/mern-template/
if errorlevel 1 (
    echo ❌ Failed to build MERN image
    echo Try again or check docs\build\DOCKER-BUILD-TROUBLESHOOTING.md
    popd
    pause
    exit /b 1
)
echo ✅ MERN image built successfully
echo.

REM Build Java image
echo [3/3] Building Java image...
echo Command: docker build -t devpod-java:latest ./docker/java/
docker build -t devpod-java:latest ./docker/java/
if errorlevel 1 (
    echo ❌ Failed to build Java image
    echo Try again or check docs\build\DOCKER-BUILD-TROUBLESHOOTING.md
    popd
    pause
    exit /b 1
)
echo ✅ Java image built successfully
echo.

echo ========================================
echo   ✅ All remaining images built!
echo ========================================
echo.
echo Verify all images:
docker images | findstr devpod
echo.
echo Expected output should show:
echo   devpod-python
echo   devpod-nodejs
echo   devpod-mern
echo   devpod-java
echo.
popd
pause
