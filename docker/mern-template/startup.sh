#!/bin/bash

set -e

echo "=================================="
echo "Starting MERN Template Environment"
echo "=================================="

# Print environment info
echo "Node version: $(node --version)"
echo "NPM version: $(npm --version)"
echo "Code-server version: $(code-server --version)"
echo "Working directory: $(pwd)"

# Function to log messages with timestamp
log_message() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# Function to check available disk space
check_disk_space() {
    local required_space_mb=100  # Minimum 100MB required
    local available_space_kb=$(df /workspace | awk 'NR==2 {print $4}')
    local available_space_mb=$((available_space_kb / 1024))
    
    if [ "$available_space_mb" -lt "$required_space_mb" ]; then
        log_message "WARNING: Low disk space. Available: ${available_space_mb}MB, Required: ${required_space_mb}MB"
        return 1
    fi
    return 0
}

# Function to copy files with error handling
copy_template_files() {
    local source_dir="/template"
    local dest_dir="/workspace"
    
    # Check if template directory exists
    if [ ! -d "$source_dir" ]; then
        log_message "ERROR: Template directory $source_dir not found. Cannot copy template files."
        log_message "WARNING: Continuing with empty workspace. Manual setup may be required."
        return 1
    fi
    
    # Check if template directory has content
    if [ -z "$(ls -A $source_dir 2>/dev/null)" ]; then
        log_message "WARNING: Template directory $source_dir is empty. Nothing to copy."
        return 1
    fi
    
    # Check disk space before copying
    if ! check_disk_space; then
        log_message "ERROR: Insufficient disk space for copying template files."
        return 1
    fi
    
    log_message "Copying template files from $source_dir to $dest_dir..."
    
    # Copy regular files and directories
    if ! cp -r "$source_dir"/* "$dest_dir/" 2>/dev/null; then
        log_message "WARNING: Some regular files failed to copy. Continuing..."
    fi
    
    # Copy hidden files and directories (excluding . and ..)
    if ! cp -r "$source_dir"/.[^.]* "$dest_dir/" 2>/dev/null; then
        log_message "INFO: No hidden files to copy or some hidden files failed to copy."
    fi
    
    # Verify copy was successful by checking if key files exist
    local key_files=("package.json" "frontend" "backend")
    local copy_success=true
    
    for file in "${key_files[@]}"; do
        if [ ! -e "$dest_dir/$file" ]; then
            log_message "WARNING: Key file/directory $file not found after copy."
            copy_success=false
        fi
    done
    
    if [ "$copy_success" = true ]; then
        log_message "Template files copied successfully!"
        
        # Set proper permissions for copied files
        log_message "Setting proper permissions..."
        find "$dest_dir" -type f -name "*.sh" -exec chmod +x {} \; 2>/dev/null || true
        find "$dest_dir" -type f -name "*.js" -exec chmod 644 {} \; 2>/dev/null || true
        find "$dest_dir" -type f -name "*.json" -exec chmod 644 {} \; 2>/dev/null || true
        
        log_message "Permissions set successfully!"
        return 0
    else
        log_message "ERROR: Template file copy verification failed."
        return 1
    fi
}

# Check if workspace is empty (volume mount scenario)
log_message "Checking workspace status..."

if [ -z "$(ls -A /workspace 2>/dev/null)" ]; then
    log_message "Workspace is empty - attempting to copy template files..."
    
    if copy_template_files; then
        log_message "Template setup completed successfully!"
    else
        log_message "Template setup failed. Continuing with empty workspace."
        log_message "You may need to manually set up your MERN project structure."
    fi
else
    log_message "Workspace contains existing files - preserving current content"
    
    # List workspace contents for debugging
    log_message "Current workspace contents:"
    ls -la /workspace | head -10
fi

# Ensure we're in the correct directory
cd /workspace

log_message "Preparing to start code-server..."

# Verify workspace has basic structure for MERN development
if [ -f "/workspace/package.json" ]; then
    log_message "Root package.json found - MERN project structure detected"
    
    if [ -d "/workspace/frontend" ] && [ -f "/workspace/frontend/package.json" ]; then
        log_message "Frontend directory with package.json found"
    else
        log_message "WARNING: Frontend directory or package.json missing"
    fi
    
    if [ -d "/workspace/backend" ] && [ -f "/workspace/backend/package.json" ]; then
        log_message "Backend directory with package.json found"
    else
        log_message "WARNING: Backend directory or package.json missing"
    fi
else
    log_message "WARNING: No root package.json found. Manual MERN setup may be required."
fi

echo ""
echo "Starting code-server on port 8080..."
echo "Access the IDE at: http://localhost:8080"
echo ""
echo "Available commands:"
echo "  - Frontend dev server: cd frontend && npm run dev (port 3000)"
echo "  - Backend server: cd backend && npm run dev (port 5000)"
echo "  - Both servers: npm run dev (runs both concurrently)"
echo ""

log_message "Launching code-server..."

# Start code-server with error handling
exec code-server \
    --bind-addr 0.0.0.0:8080 \
    --auth none \
    --disable-telemetry \
    --disable-update-check \
    /workspace