import { test, expect } from '@playwright/test';
import { loginToDevPod } from '../../helpers/login.js';

test.describe.configure({ mode: 'serial' });

test.describe('Dashboard (Authenticated)', () => {
  let page;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    await loginToDevPod(page);
  });

  test.afterAll(async () => {
    await page.close();
  });

  test('loads dashboard with welcome message', async () => {
    await expect(page.getByText(/welcome back/i)).toBeVisible({ timeout: 10000 });
  });

  test('shows stats cards', async () => {
    await expect(page.getByText(/active workspaces/i)).toBeVisible();
    await expect(page.getByText(/total projects/i)).toBeVisible();
    await expect(page.getByText(/collaborators/i)).toBeVisible();
  });

  test('shows My Workspaces tab as default', async () => {
    await expect(page.getByText(/my workspaces/i)).toBeVisible();
  });

  test('can switch to Templates tab', async () => {
    await page.getByRole('button', { name: 'Templates', exact: true }).click();
    await expect(page.getByText(/all templates/i)).toBeVisible();
  });

  test('Templates tab shows 4 templates', async () => {
    await expect(page.getByRole('heading', { name: 'Python' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Node.js' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'MERN Stack' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Java' })).toBeVisible();
  });

  test('can switch to Activity tab', async () => {
    await page.getByRole('button', { name: 'Activity', exact: true }).click();
    await expect(page.getByRole('heading', { name: /recent activity/i })).toBeVisible();
  });

  test('can switch back to Workspaces tab', async () => {
    await page.getByRole('button', { name: 'My Workspaces', exact: true }).click();
    await expect(page.getByRole('button', { name: 'My Workspaces', exact: true })).toBeVisible();
  });

  test('New Workspace button switches to templates', async () => {
    await page.getByRole('button', { name: 'New Workspace', exact: true }).click();
    await expect(page.getByText(/all templates/i)).toBeVisible();
  });
});
