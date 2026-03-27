@echo off
setlocal enabledelayedexpansion
echo.
echo ========================================
echo   Docker Image Build - With Retry
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

REM Set retry count
set "MAX_RETRIES=5"

REM Build Node.js image with aggressive retry
echo [1/3] Building Node.js image...
set "RETRY=0"
:nodejs_retry
echo Attempt !RETRY! of !MAX_RETRIES!...
docker build --progress=plain -t devpod-nodejs:latest ./docker/nodejs/ 2>&1
if errorlevel 1 (
    set /a RETRY=!RETRY!+1
    if !RETRY! leq !MAX_RETRIES! (
        echo.
        echo ⚠️  Build failed, waiting 10 seconds before retry...
        timeout /t 10 /nobreak
        goto nodejs_retry
    ) else (
        echo.
        echo ❌ Failed to build Node.js image after !MAX_RETRIES! attempts
        echo.
        echo SOLUTIONS:
        echo 1. Check your internet connection: ping google.com
        echo 2. Restart Docker Desktop
        echo 3. Try: docker system prune -a
        echo 4. Wait a few minutes and try again
        echo.
        pause
        exit /b 1
    )
)
echo ✅ Node.js image built successfully
echo.

REM Build MERN image with aggressive retry
echo [2/3] Building MERN image...
set "RETRY=0"
:mern_retry
echo Attempt !RETRY! of !MAX_RETRIES!...
docker build --progress=plain -t devpod-mern:latest ./docker/mern-template/ 2>&1
if errorlevel 1 (
    set /a RETRY=!RETRY!+1
    if !RETRY! leq !MAX_RETRIES! (
        echo.
        echo ⚠️  Build failed, waiting 10 seconds before retry...
        timeout /t 10 /nobreak
        goto mern_retry
    ) else (
        echo.
        echo ❌ Failed to build MERN image after !MAX_RETRIES! attempts
        echo.
        echo SOLUTIONS:
        echo 1. Check your internet connection: ping google.com
        echo 2. Restart Docker Desktop
        echo 3. Try: docker system prune -a
        echo 4. Wait a few minutes and try again
        echo.
        pause
        exit /b 1
    )
)
echo ✅ MERN image built successfully
echo.

REM Build Java image with aggressive retry
echo [3/3] Building Java image...
set "RETRY=0"
:java_retry
echo Attempt !RETRY! of !MAX_RETRIES!...
docker build --progress=plain -t devpod-java:latest ./docker/java/ 2>&1
if errorlevel 1 (
    set /a RETRY=!RETRY!+1
    if !RETRY! leq !MAX_RETRIES! (
        echo.
        echo ⚠️  Build failed, waiting 10 seconds before retry...
        timeout /t 10 /nobreak
        goto java_retry
    ) else (
        echo.
        echo ❌ Failed to build Java image after !MAX_RETRIES! attempts
        echo.
        echo SOLUTIONS:
        echo 1. Check your internet connection: ping google.com
        echo 2. Restart Docker Desktop
        echo 3. Try: docker system prune -a
        echo 4. Wait a few minutes and try again
        echo.
        pause
        exit /b 1
    )
)
echo ✅ Java image built successfully
echo.

echo ========================================
echo   ✅ All images built successfully!
echo ========================================
echo.
echo Verify all images:
docker images | findstr devpod
echo.
pause
