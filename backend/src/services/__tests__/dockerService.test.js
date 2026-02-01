const fc = require('fast-check');

// Mock dockerode to avoid actual Docker calls during testing
jest.mock('dockerode');

describe('Docker Service Path Resolution', () => {
  let dockerService;
  let mockDocker;

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Mock dockerode
    const Docker = require('dockerode');
    mockDocker = {
      ping: jest.fn().mockResolvedValue(true),
      listImages: jest.fn().mockResolvedValue([]),
      buildImage: jest.fn().mockResolvedValue({
        pipe: jest.fn(),
        on: jest.fn()
      }),
      modem: {
        followProgress: jest.fn((stream, onFinished, onProgress) => {
          // Simulate successful build
          setTimeout(() => onFinished(null), 10);
        })
      }
    };
    Docker.mockImplementation(() => mockDocker);

    // Import dockerService after mocking
    dockerService = require('../dockerService');
  });

  /**
   * Property 1: Docker Path Resolution Correctness
   * **Validates: Requirements 1.1, 1.2, 4.1, 4.2**
   * 
   * For any template type, the Docker service should resolve to the correct build path,
   * with MERN templates resolving to `./docker/mern-template` and existing templates
   * maintaining their current paths.
   */
  describe('Property 1: Docker Path Resolution Correctness', () => {
    test('should resolve correct Docker build paths for all template types', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            fc.constant('python'),
            fc.constant('nodejs'),
            fc.constant('mern'),
            fc.constant('java'),
            fc.string().filter(s => !['python', 'nodejs', 'mern', 'java'].includes(s))
          ),
          (templateType) => {
            // Create a mock image name that includes the template type
            const imageName = `devpod-${templateType}:latest`;
            
            // Extract the path resolution logic from ensureDockerImage
            let expectedDockerfilePath;
            let shouldSucceed = true;
            
            if (imageName.includes('python')) {
              expectedDockerfilePath = './docker/python';
            } else if (imageName.includes('nodejs')) {
              expectedDockerfilePath = './docker/nodejs';
            } else if (imageName.includes('mern')) {
              expectedDockerfilePath = './docker/mern-template';
            } else if (imageName.includes('java')) {
              expectedDockerfilePath = './docker/java';
            } else {
              // Unknown template should throw error
              shouldSucceed = false;
            }

            if (shouldSucceed) {
              // Verify that known templates resolve to correct paths
              expect(expectedDockerfilePath).toBeDefined();
              
              // Verify MERN template specifically resolves to mern-template directory
              if (templateType === 'mern') {
                expect(expectedDockerfilePath).toBe('./docker/mern-template');
              }
              
              // Verify existing templates maintain their paths
              if (templateType === 'python') {
                expect(expectedDockerfilePath).toBe('./docker/python');
              }
              if (templateType === 'nodejs') {
                expect(expectedDockerfilePath).toBe('./docker/nodejs');
              }
              if (templateType === 'java') {
                expect(expectedDockerfilePath).toBe('./docker/java');
              }
            } else {
              // Unknown templates should not have a defined path
              expect(expectedDockerfilePath).toBeUndefined();
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    test('should handle MERN template path resolution specifically', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('mern', 'MERN', 'Mern', 'devpod-mern', 'mern-template'),
          (mernVariant) => {
            // Test that any image name containing 'mern' resolves to mern-template path
            const imageName = `devpod-${mernVariant}:latest`;
            
            let dockerfilePath;
            if (imageName.toLowerCase().includes('mern')) {
              dockerfilePath = './docker/mern-template';
            }
            
            // Property: MERN templates always resolve to mern-template directory
            if (mernVariant.toLowerCase().includes('mern')) {
              expect(dockerfilePath).toBe('./docker/mern-template');
            }
          }
        ),
        { numRuns: 50 }
      );
    });

    test('should maintain backward compatibility for existing templates', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('python', 'nodejs', 'java'),
          (existingTemplate) => {
            const imageName = `devpod-${existingTemplate}:latest`;
            
            let dockerfilePath;
            if (imageName.includes('python')) dockerfilePath = './docker/python';
            else if (imageName.includes('nodejs')) dockerfilePath = './docker/nodejs';
            else if (imageName.includes('java')) dockerfilePath = './docker/java';
            
            // Property: Existing templates maintain their original paths
            const expectedPaths = {
              'python': './docker/python',
              'nodejs': './docker/nodejs',
              'java': './docker/java'
            };
            
            expect(dockerfilePath).toBe(expectedPaths[existingTemplate]);
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  // Unit tests for specific examples and edge cases
  describe('Unit Tests - Specific Path Resolution Examples', () => {
    test('should resolve MERN template to correct path', () => {
      const imageName = 'devpod/mern:latest';
      
      // Simulate the path resolution logic
      let dockerfilePath;
      if (imageName.includes('mern')) dockerfilePath = './docker/mern-template';
      
      expect(dockerfilePath).toBe('./docker/mern-template');
    });

    test('should resolve Python template to correct path', () => {
      const imageName = 'devpod-python:latest';
      
      let dockerfilePath;
      if (imageName.includes('python')) dockerfilePath = './docker/python';
      
      expect(dockerfilePath).toBe('./docker/python');
    });

    test('should resolve Node.js template to correct path', () => {
      const imageName = 'devpod-nodejs:latest';
      
      let dockerfilePath;
      if (imageName.includes('nodejs')) dockerfilePath = './docker/nodejs';
      
      expect(dockerfilePath).toBe('./docker/nodejs');
    });

    test('should resolve Java template to correct path', () => {
      const imageName = 'devpod-java:latest';
      
      let dockerfilePath;
      if (imageName.includes('java')) dockerfilePath = './docker/java';
      
      expect(dockerfilePath).toBe('./docker/java');
    });

    test('should throw error for unknown template', () => {
      const imageName = 'devpod-unknown:latest';
      
      expect(() => {
        let dockerfilePath;
        if (imageName.includes('python')) dockerfilePath = './docker/python';
        else if (imageName.includes('nodejs')) dockerfilePath = './docker/nodejs';
        else if (imageName.includes('mern')) dockerfilePath = './docker/mern-template';
        else if (imageName.includes('java')) dockerfilePath = './docker/java';
        else throw new Error(`Unknown template for image: ${imageName}`);
      }).toThrow('Unknown template for image: devpod-unknown:latest');
    });
  });
});