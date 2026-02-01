# Requirements Document

## Introduction

Fix critical issues in the DevPod MERN template that prevent proper container builds and template file preservation. The MERN template currently fails due to incorrect Docker build paths and volume mounting that overwrites template files.

## Glossary

- **DevPod**: A project that launches Docker containers for user workspaces
- **MERN_Template**: A development template containing React frontend and Express backend
- **Docker_Service**: Backend service responsible for building and managing Docker containers
- **Template_Files**: Pre-configured project files (React app, Express server, package.json files)
- **Volume_Mount**: Docker mechanism that maps host directories to container directories
- **Workspace_Directory**: The `/workspace` directory inside containers where user code is stored

## Requirements

### Requirement 1: Fix Docker Build Path

**User Story:** As a DevPod user, I want the MERN template to build successfully, so that I can create MERN workspaces.

#### Acceptance Criteria

1. WHEN the Docker service builds a MERN image, THE Docker_Service SHALL use the correct path `./docker/mern-template`
2. WHEN the ensureDockerImage function processes a MERN template, THE Docker_Service SHALL locate the Dockerfile in the mern-template directory
3. WHEN the build process starts, THE Docker_Service SHALL successfully find all required template files

### Requirement 2: Preserve Template Files During Volume Mounting

**User Story:** As a DevPod user, I want template files to be available in my workspace, so that I can start developing immediately without setting up the project structure.

#### Acceptance Criteria

1. WHEN a MERN container starts, THE Template_Files SHALL be preserved and accessible in the workspace
2. WHEN the volume mount occurs, THE Template_Files SHALL NOT be overwritten by empty volume content
3. WHEN a user accesses their workspace, THE Template_Files SHALL be present in the `/workspace` directory

### Requirement 3: Implement Template File Preservation Strategy

**User Story:** As a system administrator, I want template files copied to a safe location during build, so that they survive volume mounting operations.

#### Acceptance Criteria

1. WHEN building the Docker image, THE Dockerfile SHALL copy template files to `/template` directory
2. WHEN the container starts, THE startup script SHALL check if `/workspace` is empty
3. IF `/workspace` is empty, THEN THE startup script SHALL copy files from `/template` to `/workspace`
4. WHEN files are copied at runtime, THE Template_Files SHALL maintain their original structure and permissions

### Requirement 4: Maintain Backward Compatibility

**User Story:** As a DevPod administrator, I want existing functionality to remain intact, so that Python and Node.js templates continue working.

#### Acceptance Criteria

1. WHEN Python templates are built, THE Docker_Service SHALL continue using the existing path logic
2. WHEN Node.js templates are built, THE Docker_Service SHALL continue using the existing path logic
3. WHEN any existing template is launched, THE Template_Files SHALL be available as before

### Requirement 5: Enable MERN Development Workflow

**User Story:** As a developer, I want to run both frontend and backend servers from the IDE terminal, so that I can develop full-stack applications.

#### Acceptance Criteria

1. WHEN a user opens a terminal in the MERN workspace, THE Template_Files SHALL include both frontend and backend projects
2. WHEN a user runs `cd frontend && npm start`, THE React development server SHALL start successfully
3. WHEN a user runs `cd backend && npm start`, THE Express server SHALL start successfully
4. WHEN both servers are running, THE Template_Files SHALL support the complete MERN development workflow