# Implementation Plan: MERN Template Fix

## Overview

This implementation plan fixes two critical issues in the DevPod MERN template: incorrect Docker build path and volume mount overwriting template files. The solution uses a two-stage approach with safe template storage and runtime copying.

## Tasks

- [ ] 1. Fix Docker Service Path Resolution
  - [x] 1.1 Update dockerService.js path mapping for MERN template
    - Change `./docker/mern` to `./docker/mern-template` in ensureDockerImage function
    - _Requirements: 1.1, 1.2_
  
  - [x] 1.2 Write property test for Docker path resolution

    - **Property 1: Docker Path Resolution Correctness**
    - **Validates: Requirements 1.1, 1.2, 4.1, 4.2**

- [ ] 2. Implement Template File Preservation Strategy
  - [x] 2.1 Update MERN template Dockerfile for dual-location copying
    - Copy template files to `/template` directory (safe storage)
    - Copy template files to `/workspace` directory (initial setup)
    - Set proper permissions for startup script
    - _Requirements: 3.1_
  
  - [x] 2.2 Create enhanced startup script with conditional copying
    - Check if `/workspace` is empty on container start
    - Copy files from `/template` to `/workspace` if workspace is empty
    - Preserve file structure and permissions during copy
    - Start code-server after file management
    - _Requirements: 3.2, 3.3, 3.4_
  
  - [ ]* 2.3 Write property test for template file preservation
    - **Property 2: Template File Preservation During Volume Mounting**
    - **Validates: Requirements 2.1, 2.2, 2.3**
  
  - [ ]* 2.4 Write property test for safe template storage
    - **Property 3: Safe Template Storage During Build**
    - **Validates: Requirements 3.1**

- [x] 3. Checkpoint - Verify MERN template builds and starts
  - Ensure Docker image builds successfully from correct path
  - Ensure container starts and template files are present
  - Ask the user if questions arise

- [ ] 4. Implement Runtime File Management Logic
  - [ ] 4.1 Enhance startup script with robust file copying
    - Add error handling for permission issues and disk space
    - Add logging for debugging file copy operations
    - Ensure graceful fallback if template directory is missing
    - _Requirements: 3.2, 3.3, 3.4_
  
  - [ ]* 4.2 Write property test for conditional workspace population
    - **Property 4: Conditional Workspace Population**
    - **Validates: Requirements 3.2, 3.3, 3.4**

- [ ] 5. Validate MERN Development Environment
  - [ ] 5.1 Test complete MERN project structure
    - Verify frontend directory with React app and package.json
    - Verify backend directory with Express server and package.json
    - Verify root package.json with development scripts
    - _Requirements: 5.1_
  
  - [ ] 5.2 Test development server startup capability
    - Verify `cd frontend && npm start` works without errors
    - Verify `cd backend && npm start` works without errors
    - Verify both can run simultaneously
    - _Requirements: 5.2, 5.3, 5.4_
  
  - [ ]* 5.3 Write property test for MERN development environment
    - **Property 5: MERN Development Environment Completeness**
    - **Validates: Requirements 5.1, 5.2, 5.3, 5.4**

- [ ] 6. Ensure Backward Compatibility
  - [ ] 6.1 Verify existing templates still work
    - Test Python template build and launch
    - Test Node.js template build and launch
    - Verify no regression in existing functionality
    - _Requirements: 4.1, 4.2, 4.3_
  
  - [ ]* 6.2 Write property test for backward compatibility
    - **Property 6: Backward Compatibility Preservation**
    - **Validates: Requirements 4.3**

- [ ] 7. Final Integration Testing
  - [ ] 7.1 Test complete MERN workflow end-to-end
    - Launch MERN workspace from DevPod interface
    - Verify template files are present in workspace
    - Test frontend and backend development servers
    - Verify code-server IDE functionality
    - _Requirements: 2.1, 2.2, 2.3, 5.1, 5.2, 5.3, 5.4_
  
  - [ ]* 7.2 Write integration tests for complete workflow
    - Test full DevPod launch → workspace access → development workflow
    - _Requirements: All requirements_

- [ ] 8. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation of fixes
- Property tests validate universal correctness properties across all scenarios
- Unit tests validate specific examples and edge cases
- Focus on maintaining backward compatibility while fixing MERN template issues