import fs from 'fs';
import path from 'path';

const configPath = path.resolve('tests/auth.config.json');

let credentials = null;
try {
  credentials = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
} catch {
  // No config file — will fall back to manual login
}

/**
 * Logs into DevPod via GitHub OAuth.
 * Auto-fills username/password, then pauses for 2FA.
 * After 2FA, waits for redirect to dashboard.
 */
export async function loginToDevPod(page) {
  await page.goto('https://mydevpod.me');

  if (!credentials) {
    console.log('\n=== No auth config found. Log in manually. Waiting for dashboard... ===\n');
    await page.waitForURL('**/dashboard', { timeout: 120000 });
    return;
  }

  // Click Login with GitHub
  const loginButton = page.getByRole('button', { name: /login with github/i });
  await loginButton.click();

  // Wait for GitHub login page
  await page.waitForURL(/github\.com\/login/, { timeout: 15000 });

  // Fill credentials
  await page.fill('#login_field', credentials.githubUsername);
  await page.fill('#password', credentials.githubPassword);
  await page.getByRole('button', { name: /sign in/i }).click();

  // Check if 2FA is required
  try {
    await page.waitForURL(/github\.com\/sessions\/two-factor/, { timeout: 5000 });
    console.log('\n=== Enter your 2FA code and click Verify. Waiting... ===\n');
    // Wait for redirect back to DevPod after 2FA
    await page.waitForURL('**/dashboard', { timeout: 120000 });
  } catch {
    // No 2FA — might redirect to OAuth authorize page or directly to DevPod
    try {
      // Check if GitHub asks to authorize the app
      const authorizeButton = page.getByRole('button', { name: /authorize/i });
      if (await authorizeButton.isVisible({ timeout: 3000 })) {
        await authorizeButton.click();
      }
    } catch {
      // Already authorized — should redirect directly
    }
    await page.waitForURL('**/dashboard', { timeout: 30000 });
  }

  await page.waitForTimeout(2000);
  console.log('=== Logged in successfully ===\n');
}
