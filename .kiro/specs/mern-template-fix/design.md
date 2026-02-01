# Design Document: MERN Template Fix

## Overview

This design addresses two critical issues in the DevPod MERN template:
1. **Incorrect Docker build path**: The `dockerService.js` points to `./docker/mern` instead of `./docker/mern-template`
2. **Volume mount overwrites template files**: When DevPod mounts an empty volume on `/workspace`, it overwrites the template files copied during Docker build

The solution implements a two-stage approach: copy template files to a safe location (`/template`) during build, then copy them to `/workspace` at runtime only if the workspace is empty.

## Architecture

### Current Architecture Issues

```mermaid
graph TD
    A[dockerService.js] -->|Wrong Path| B[./docker/mern]
    C[Docker Build] -->|COPY files| D[/workspace]
    E[Container Start] -->|Volume Mount| F[Empty Volume → /workspace]
    F -->|Overwrites| D
    
    style B fill:#ffcccc
    style F fill:#ffcccc
```

### Fixed Architecture

```mermaid
graph TD
    A[dockerService.js] -->|Correct Path| B[./docker/mern-template]
    C[Docker Build] -->|COPY files| D[/template]
    E[Container Start] -->|Volume Mount| F[Empty Volume → /workspace]
    G[startup.sh] -->|Check if empty| F
    G -->|Copy if empty| H[/template → /workspace]
    
    style B fill:#ccffcc
    style D fill:#ccffcc
    style H fill:#ccffcc
```

## Components and Interfaces

### 1. Docker Service Path Resolution

**File**: `backend/src/services/dockerService.js`

**Current Implementation**:
```javascript
if (imageName.includes('mern')) dockerfilePath = './docker/mern';
```

**Fixed Implementation**:
```javascript
if (imageName.includes('mern')) dockerfilePath = './docker/mern-template';
```

**Interface**: No changes to external API, internal path resolution only.

### 2. Dockerfile Template Preservation

**File**: `docker/mern-template/Dockerfile`

**Strategy**: Two-stage file management
- **Build Stage**: Copy template files to `/template` (safe from volume mounts)
- **Runtime Stage**: Copy from `/template` to `/workspace` if workspace is empty

**Key Changes**:
```dockerfile
# Copy template files to safe location
COPY . /template

# Copy to workspace for initial build
COPY . /workspace

# Make startup script executable
RUN chmod +x /template/startup.sh
```

### 3. Runtime File Management

**File**: `docker/mern-template/startup.sh`

**Responsibilities**:
- Check if `/workspace` is empty (volume mount scenario)
- Copy template files from `/template` to `/workspace` if needed
- Preserve file permissions and structure
- Start code-server

**Interface**:
```bash
#!/bin/bash
# Input: /template directory (source)
# Output: /workspace directory (populated if empty)
# Side effects: File copying, permission setting
```

## Data Models

### File Structure Preservation

```
/template/                    # Safe storage (build-time)
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
├── backend/
│   ├── routes/
│   ├── models/
│   ├── server.js
│   └── package.json
├── package.json             # Root package.json
├── README.md
└── startup.sh

/workspace/                   # User workspace (runtime)
├── frontend/                 # Copied from /template if empty
├── backend/                  # Copied from /template if empty
├── package.json             # Copied from /template if empty
└── README.md                # Copied from /template if empty
```

### Docker Service Path Mapping

```javascript
const TEMPLATE_PATHS = {
    'python': './docker/python',
    'nodejs': './docker/nodejs', 
    'mern': './docker/mern-template',  // Fixed path
    'java': './docker/java'
};
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Docker Path Resolution Correctness
*For any* template type, the Docker service should resolve to the correct build path, with MERN templates resolving to `./docker/mern-template` and existing templates maintaining their current paths.
**Validates: Requirements 1.1, 1.2, 4.1, 4.2**

### Property 2: Template File Preservation During Volume Mounting
*For any* MERN container startup with volume mounting, template files should be present and accessible in the `/workspace` directory after the container is fully started.
**Validates: Requirements 2.1, 2.2, 2.3**

### Property 3: Safe Template Storage During Build
*For any* MERN Docker image build, template files should be copied to both `/template` (for preservation) and `/workspace` (for initial setup), ensuring files exist in the safe location.
**Validates: Requirements 3.1**

### Property 4: Conditional Workspace Population
*For any* container startup scenario, if `/workspace` is empty, the startup script should copy all files from `/template` to `/workspace` while preserving file structure and permissions.
**Validates: Requirements 3.2, 3.3, 3.4**

### Property 5: MERN Development Environment Completeness
*For any* MERN workspace after startup, the workspace should contain both frontend and backend project directories with all necessary files to support running `npm start` in each directory.
**Validates: Requirements 5.1, 5.2, 5.3, 5.4**

### Property 6: Backward Compatibility Preservation
*For any* existing template type (Python, Node.js), the build and launch process should continue to work exactly as before, with template files available in the workspace.
**Validates: Requirements 4.3**

## Error Handling

### Docker Build Failures
- **Path Not Found**: If `./docker/mern-template` doesn't exist, fail fast with clear error message
- **Missing Dockerfile**: If Dockerfile is missing from the template directory, provide specific error
- **Build Context Issues**: If template files are missing during build, fail with file-specific errors

### Runtime File Management Failures
- **Permission Errors**: If startup script cannot copy files due to permissions, log error and continue with existing files
- **Disk Space**: If insufficient space for file copying, fail gracefully with clear error message
- **Corrupted Template**: If `/template` directory is missing or corrupted, log warning and attempt to continue

### Backward Compatibility Safeguards
- **Existing Template Validation**: Before applying changes, verify existing templates still build correctly
- **Rollback Strategy**: If MERN fixes break existing functionality, provide clear rollback instructions
- **Graceful Degradation**: If new startup script fails, fall back to basic code-server startup

## Testing Strategy

### Dual Testing Approach

This feature requires both **unit tests** and **property-based tests** for comprehensive coverage:

**Unit Tests** focus on:
- Specific path resolution examples for each template type
- Edge cases like missing directories or corrupted files
- Integration points between Docker service and container startup
- Error conditions and failure scenarios

**Property-Based Tests** focus on:
- Universal properties that hold across all template types and scenarios
- Comprehensive input coverage through randomization of container states
- File system operations under various conditions
- Cross-platform compatibility testing

### Property-Based Testing Configuration

Using **Jest** with **fast-check** library for property-based testing:
- Minimum **100 iterations** per property test
- Each property test references its design document property
- Tag format: **Feature: mern-template-fix, Property {number}: {property_text}**

### Test Categories

1. **Docker Service Tests**
   - Unit: Test specific template path mappings
   - Property: Test path resolution for all template types

2. **Container Build Tests**
   - Unit: Test MERN template build with known file structure
   - Property: Test builds with various template file configurations

3. **Runtime File Management Tests**
   - Unit: Test startup script with empty and populated workspaces
   - Property: Test file copying under various workspace states

4. **Integration Tests**
   - Unit: Test complete MERN workspace launch workflow
   - Property: Test end-to-end functionality across different scenarios

5. **Backward Compatibility Tests**
   - Unit: Test specific existing templates (Python, Node.js)
   - Property: Test all existing templates continue working

Each correctness property will be implemented as a single property-based test, ensuring comprehensive validation of the system's behavior across all possible inputs and states.