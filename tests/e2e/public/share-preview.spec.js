import { test, expect } from '@playwright/test';

test.describe('Share Preview Page', () => {
  test('invalid share token shows error page', async ({ page }) => {
    await page.goto('/share/invalid-token-12345');
    await expect(page.getByText(/unable to load|not found|error|failed/i).first()).toBeVisible({ timeout: 10000 });
  });

  test('invalid share token shows Go to Home button', async ({ page }) => {
    await page.goto('/share/invalid-token-12345');
    await expect(page.getByRole('button', { name: /go to home/i })).toBeVisible({ timeout: 10000 });
  });

  test('Go to Home button navigates to landing page', async ({ page }) => {
    await page.goto('/share/invalid-token-12345');
    const homeButton = page.getByRole('button', { name: /go to home/i });
    await homeButton.waitFor({ timeout: 10000 });
    await homeButton.click();
    await expect(page).toHaveURL('/');
  });
});
