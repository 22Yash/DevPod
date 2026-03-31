@echo off
REM Quick Setup Script for DevPod Project
REM This script automates the initial setup process

setlocal enabledelayedexpansion
pushd "%~dp0\..\.."

echo.
echo ========================================
echo   DevPod Project - Quick Setup
echo ========================================
echo.

REM Check if Node.js is installed
echo [1/6] Checking Node.js installation...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js not found. Please install from https://nodejs.org/
    pause
    exit /b 1
)
echo ✅ Node.js found: 
node --version

REM Check if Docker is installed
echo.
echo [2/6] Checking Docker installation...
docker --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker not found. Please install from https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)
echo ✅ Docker found:
docker --version

REM Check if Docker daemon is running
echo.
echo [3/6] Checking Docker daemon...
docker ps >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker daemon not running. Please start Docker Desktop.
    pause
    exit /b 1
)
echo ✅ Docker daemon is running

REM Install backend dependencies
echo.
echo [4/6] Installing backend dependencies...
cd backend
if exist node_modules (
    echo ℹ️  Backend dependencies already installed
) else (
    echo Installing npm packages...
    call npm install
    if errorlevel 1 (
        echo ❌ Failed to install backend dependencies
        pause
        exit /b 1
    )
)
echo ✅ Backend dependencies ready
cd ..

REM Install frontend dependencies
echo.
echo [5/6] Installing frontend dependencies...
cd frontend
if exist node_modules (
    echo ℹ️  Frontend dependencies already installed
) else (
    echo Installing npm packages...
    call npm install
    if errorlevel 1 (
        echo ❌ Failed to install frontend dependencies
        pause
        exit /b 1
    )
)
echo ✅ Frontend dependencies ready
cd ..

REM Build Docker images
echo.
echo [6/6] Building Docker images...
echo This may take 5-10 minutes on first run...
call scripts\build\build-images.bat
if errorlevel 1 (
    echo ❌ Failed to build Docker images
    popd
    pause
    exit /b 1
)
echo ✅ Docker images built successfully

echo.
echo ========================================
echo   Setup Complete!
echo ========================================
echo.
echo Next steps:
echo.
echo 1. Configure environment variables:
echo    - Edit backend\.env with your MongoDB URI and GitHub OAuth credentials
echo    - Edit frontend\.env with your API URL and GitHub Client ID
echo.
echo 2. Start the backend (Terminal 1):
echo    cd backend
echo    npm run server
echo.
echo 3. Start the frontend (Terminal 2):
echo    cd frontend
echo    npm run dev
echo.
echo 4. Open browser:
echo    http://localhost:5173
echo.
echo For detailed setup instructions, see docs\setup\TEAM-SETUP-GUIDE.md
echo For troubleshooting, see docs\setup\CODESERVER-LOGIN-FIX.md
echo.
popd
pause
