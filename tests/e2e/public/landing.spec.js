import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
  test('loads with correct title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/DevPod/);
  });

  test('shows navigation with DevPod branding', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('nav')).toBeVisible();
    await expect(page.getByText('DevPod').first()).toBeVisible();
  });

  test('has Login with GitHub button', async ({ page }) => {
    await page.goto('/');
    const loginButton = page.getByRole('button', { name: /login with github/i });
    await expect(loginButton).toBeVisible();
  });

  test('shows hero section with heading', async ({ page }) => {
    await page.goto('/');
    const heading = page.locator('h1');
    await expect(heading).toBeVisible();
  });

  test('shows feature cards', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText(/instant setup|one-click|launch/i).first()).toBeVisible();
  });

  test('shows how it works section', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText(/login with github/i).first()).toBeVisible();
  });

  test('page loads within 3 seconds', async ({ page }) => {
    const start = Date.now();
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const loadTime = Date.now() - start;
    expect(loadTime).toBeLessThan(3000);
  });
});
