import { test, expect } from '@playwright/test';

test.describe('Auth Redirects', () => {
  test('dashboard redirects to landing page when not logged in', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForURL('/', { timeout: 10000 });
    await expect(page).toHaveURL('/');
  });

  test('auth callback without code redirects to landing page', async ({ page }) => {
    await page.goto('/auth/callback');
    await page.waitForURL('/', { timeout: 10000 });
    await expect(page).toHaveURL('/');
  });
});
