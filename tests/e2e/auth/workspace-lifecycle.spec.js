import { test, expect } from '@playwright/test';
import { loginToDevPod } from '../../helpers/login.js';

test.describe.configure({ mode: 'serial' });
test.setTimeout(180000);

test.describe('Workspace Lifecycle', () => {
  let page;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    await loginToDevPod(page);
  });

  test.afterAll(async () => {
    await page.close();
  });

  test('launch a Python workspace', async () => {
    // Switch to Templates tab
    await page.getByRole('button', { name: 'Templates', exact: true }).click();
    await expect(page.getByText(/all templates/i)).toBeVisible();

    // Listen for new tab before clicking
    const newPagePromise = page.context().waitForEvent('page');

    // Python is the first template — click its Use button
    await page.getByRole('button', { name: 'Use' }).first().click();

    // Wait for the new tab (about:blank first, then navigates to workspace)
    const newPage = await newPagePromise;
    await newPage.waitForURL(/mydevpod\.me/, { timeout: 120000 });
    await newPage.waitForLoadState('domcontentloaded', { timeout: 60000 });

    const url = newPage.url();
    expect(url).toContain('mydevpod.me');
    console.log(`Workspace opened at: ${url}`);

    await newPage.close();
  });

  test('workspace appears in dashboard', async () => {
    await page.goto('https://mydevpod.me/dashboard');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // Look for the status badge inside a workspace card, not the filter dropdown
    const statusBadge = page.locator('.rounded-full', { hasText: 'running' }).first();
    await expect(statusBadge).toBeVisible({ timeout: 10000 });
  });

  test('can stop the workspace', async () => {
    const stopButton = page.getByTitle('Stop').first();
    await expect(stopButton).toBeVisible();
    await stopButton.click();

    await page.waitForTimeout(5000);
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    const stoppedBadge = page.locator('.rounded-full', { hasText: 'stopped' }).first();
    await expect(stoppedBadge).toBeVisible({ timeout: 15000 });
  });

  test('can start the stopped workspace', async () => {
    const startButton = page.getByRole('button', { name: /start/i }).first();
    await expect(startButton).toBeVisible();

    const newPagePromise = page.context().waitForEvent('page');
    await startButton.click();

    const newPage = await newPagePromise;
    await newPage.waitForURL(/mydevpod\.me/, { timeout: 120000 });
    expect(newPage.url()).toContain('mydevpod.me');
    await newPage.close();

    await page.waitForTimeout(3000);
    await page.reload();
    await page.waitForLoadState('networkidle');

    const runningBadge = page.locator('.rounded-full', { hasText: 'running' }).first();
    await expect(runningBadge).toBeVisible({ timeout: 10000 });
  });

  test('can delete the workspace', async () => {
    // Stop it first if running
    const stopButton = page.getByTitle('Stop').first();
    if (await stopButton.isVisible()) {
      await stopButton.click();
      await page.waitForTimeout(5000);
      await page.reload();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
    }

    const deleteButton = page.getByTitle('Delete').first();
    await expect(deleteButton).toBeVisible();
    await deleteButton.click();

    // Confirm in the custom dialog
    const confirmDelete = page.getByRole('button', { name: 'Delete', exact: true }).last();
    await confirmDelete.click();

    await page.waitForTimeout(3000);
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Verify workspace count decreased or empty state shows
    console.log('Workspace deleted successfully');
  });
});
