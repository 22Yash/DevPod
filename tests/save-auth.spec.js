/**
 * Run once to save your authenticated session:
 *   npx playwright test save-auth --project=e2e-public --headed
 *
 * Browser opens → you log in via GitHub → once you land on the dashboard
 * the test detects it and saves your cookies automatically.
 */
import { test } from '@playwright/test';

test('save auth session', async ({ page }) => {
  await page.goto('https://mydevpod.me');

  console.log('\n=== Log in via GitHub now. Waiting for dashboard... ===\n');

  // Wait up to 2 minutes for you to complete GitHub login and reach dashboard
  await page.waitForURL('**/dashboard', { timeout: 120000 });
  await page.waitForTimeout(3000);

  await page.context().storageState({ path: 'tests/.auth/session.json' });
  console.log('\nSession saved to tests/.auth/session.json');
});
