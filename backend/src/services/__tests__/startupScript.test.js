const fs = require('fs');
const path = require('path');

describe('MERN Template Startup Script', () => {
  const startupScriptPath = path.join(__dirname, '../../../../docker/mern-template/startup.sh');
  let startupScriptContent;

  beforeAll(() => {
    // Read the startup script content
    startupScriptContent = fs.readFileSync(startupScriptPath, 'utf8');
  });

  describe('Script Structure', () => {
    test('should have proper shebang', () => {
      expect(startupScriptContent).toMatch(/^#!/);
      expect(startupScriptContent).toMatch(/bash/);
    });

    test('should set error handling with set -e', () => {
      expect(startupScriptContent).toMatch(/set -e/);
    });

    test('should have log_message function', () => {
      expect(startupScriptContent).toMatch(/log_message\(\)/);
      expect(startupScriptContent).toMatch(/echo "\[.*\].*"/);
    });

    test('should have check_disk_space function', () => {
      expect(startupScriptContent).toMatch(/check_disk_space\(\)/);
      expect(startupScriptContent).toMatch(/df \/workspace/);
    });

    test('should have copy_template_files function', () => {
      expect(startupScriptContent).toMatch(/copy_template_files\(\)/);
      expect(startupScriptContent).toMatch(/source_dir="\/template"/);
      expect(startupScriptContent).toMatch(/dest_dir="\/workspace"/);
    });
  });

  describe('Error Handling', () => {
    test('should check if template directory exists', () => {
      expect(startupScriptContent).toMatch(/if \[ ! -d "\$source_dir" \]/);
      expect(startupScriptContent).toMatch(/Template directory.*not found/);
    });

    test('should check if template directory has content', () => {
      expect(startupScriptContent).toMatch(/if \[ -z "\$\(ls -A \$source_dir/);
      expect(startupScriptContent).toMatch(/Template directory.*is empty/);
    });

    test('should check disk space before copying', () => {
      expect(startupScriptContent).toMatch(/if ! check_disk_space/);
      expect(startupScriptContent).toMatch(/Insufficient disk space/);
    });

    test('should verify copy success by checking key files', () => {
      expect(startupScriptContent).toMatch(/key_files=\("package\.json" "frontend" "backend"\)/);
      expect(startupScriptContent).toMatch(/Key file\/directory.*not found after copy/);
    });
  });

  describe('File Operations', () => {
    test('should copy regular files and directories', () => {
      expect(startupScriptContent).toMatch(/cp -r "\$source_dir"\/\* "\$dest_dir\/"/);
    });

    test('should copy hidden files', () => {
      expect(startupScriptContent).toMatch(/cp -r "\$source_dir"\/\.\[\^\.\]\* "\$dest_dir\/"/);
    });

    test('should set proper permissions for copied files', () => {
      expect(startupScriptContent).toMatch(/find "\$dest_dir" -type f -name "\*\.sh" -exec chmod \+x/);
      expect(startupScriptContent).toMatch(/find "\$dest_dir" -type f -name "\*\.js" -exec chmod 644/);
      expect(startupScriptContent).toMatch(/find "\$dest_dir" -type f -name "\*\.json" -exec chmod 644/);
    });
  });

  describe('Workspace Detection', () => {
    test('should check if workspace is empty', () => {
      expect(startupScriptContent).toMatch(/if \[ -z "\$\(ls -A \/workspace/);
      expect(startupScriptContent).toMatch(/Workspace is empty/);
    });

    test('should preserve existing workspace content', () => {
      expect(startupScriptContent).toMatch(/Workspace contains existing files/);
      expect(startupScriptContent).toMatch(/preserving current content/);
    });
  });

  describe('MERN Development Environment', () => {
    test('should verify MERN project structure', () => {
      expect(startupScriptContent).toMatch(/if \[ -f "\/workspace\/package\.json" \]/);
      expect(startupScriptContent).toMatch(/MERN project structure detected/);
    });

    test('should check for frontend directory', () => {
      expect(startupScriptContent).toMatch(/if \[ -d "\/workspace\/frontend" \]/);
      expect(startupScriptContent).toMatch(/Frontend directory.*found/);
    });

    test('should check for backend directory', () => {
      expect(startupScriptContent).toMatch(/if \[ -d "\/workspace\/backend" \]/);
      expect(startupScriptContent).toMatch(/Backend directory.*found/);
    });
  });

  describe('Code Server Startup', () => {
    test('should start code-server with correct configuration', () => {
      expect(startupScriptContent).toMatch(/exec code-server/);
      expect(startupScriptContent).toMatch(/--bind-addr 0\.0\.0\.0:8080/);
      expect(startupScriptContent).toMatch(/--auth none/);
      expect(startupScriptContent).toMatch(/--disable-telemetry/);
      expect(startupScriptContent).toMatch(/--disable-update-check/);
      expect(startupScriptContent).toMatch(/\/workspace/);
    });

    test('should provide development server instructions', () => {
      expect(startupScriptContent).toMatch(/Frontend dev server.*cd frontend && npm run dev/);
      expect(startupScriptContent).toMatch(/Backend server.*cd backend && npm run dev/);
      expect(startupScriptContent).toMatch(/Both servers.*npm run dev/);
    });
  });

  describe('Logging and Debugging', () => {
    test('should include timestamped logging', () => {
      expect(startupScriptContent).toMatch(/date '\+%Y-%m-%d %H:%M:%S'/);
    });

    test('should log workspace status checking', () => {
      expect(startupScriptContent).toMatch(/Checking workspace status/);
    });

    test('should log template setup completion', () => {
      expect(startupScriptContent).toMatch(/Template setup completed successfully/);
    });

    test('should log code-server preparation', () => {
      expect(startupScriptContent).toMatch(/Preparing to start code-server/);
      expect(startupScriptContent).toMatch(/Launching code-server/);
    });
  });
});