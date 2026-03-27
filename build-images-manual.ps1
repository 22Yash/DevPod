# Manual Docker Image Build - Windows PowerShell
# Run: .\build-images-manual.ps1

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Manual Docker Image Build - Windows" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check Docker is running
Write-Host "Checking Docker daemon..." -ForegroundColor Yellow
try {
    docker ps | Out-Null
    Write-Host "✅ Docker daemon is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker daemon not running. Please start Docker Desktop." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}
Write-Host ""

# Build Node.js image
Write-Host "[1/3] Building Node.js image..." -ForegroundColor Cyan
Write-Host "Command: docker build -t devpod-nodejs:latest ./docker/nodejs/" -ForegroundColor Gray
docker build -t devpod-nodejs:latest ./docker/nodejs/
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to build Node.js image" -ForegroundColor Red
    Write-Host "Try again or check DOCKER-BUILD-TROUBLESHOOTING.md" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}
Write-Host "✅ Node.js image built successfully" -ForegroundColor Green
Write-Host ""

# Build MERN image
Write-Host "[2/3] Building MERN image..." -ForegroundColor Cyan
Write-Host "Command: docker build -t devpod-mern:latest ./docker/mern-template/" -ForegroundColor Gray
docker build -t devpod-mern:latest ./docker/mern-template/
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to build MERN image" -ForegroundColor Red
    Write-Host "Try again or check DOCKER-BUILD-TROUBLESHOOTING.md" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}
Write-Host "✅ MERN image built successfully" -ForegroundColor Green
Write-Host ""

# Build Java image
Write-Host "[3/3] Building Java image..." -ForegroundColor Cyan
Write-Host "Command: docker build -t devpod-java:latest ./docker/java/" -ForegroundColor Gray
docker build -t devpod-java:latest ./docker/java/
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to build Java image" -ForegroundColor Red
    Write-Host "Try again or check DOCKER-BUILD-TROUBLESHOOTING.md" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}
Write-Host "✅ Java image built successfully" -ForegroundColor Green
Write-Host ""

Write-Host "========================================" -ForegroundColor Green
Write-Host "  ✅ All remaining images built!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Verify all images:" -ForegroundColor Cyan
docker images | Select-String "devpod"
Write-Host ""
Write-Host "Expected output should show:" -ForegroundColor Yellow
Write-Host "  devpod-python" -ForegroundColor Gray
Write-Host "  devpod-nodejs" -ForegroundColor Gray
Write-Host "  devpod-mern" -ForegroundColor Gray
Write-Host "  devpod-java" -ForegroundColor Gray
Write-Host ""
Read-Host "Press Enter to exit"
