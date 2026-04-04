import { test, expect } from '@playwright/test';

const API = 'https://mydevpod.me';

test.describe('Workspace API', () => {
  test('GET /api/v1/workspaces/list returns 401 without auth', async ({ request }) => {
    const response = await request.get(`${API}/api/v1/workspaces/list`);
    expect(response.status()).toBe(401);
  });

  test('GET /api/v1/workspaces/dashboard/stats returns 401 without auth', async ({ request }) => {
    const response = await request.get(`${API}/api/v1/workspaces/dashboard/stats`);
    expect(response.status()).toBe(401);
  });

  test('GET /api/v1/workspaces/activity/recent returns 401 without auth', async ({ request }) => {
    const response = await request.get(`${API}/api/v1/workspaces/activity/recent`);
    expect(response.status()).toBe(401);
  });

  test('POST /api/v1/workspaces/launch returns 401 without auth', async ({ request }) => {
    const response = await request.post(`${API}/api/v1/workspaces/launch`, {
      data: { template: 'python' },
    });
    expect(response.status()).toBe(401);
  });

  test('POST /api/v1/workspaces/fake-id/stop returns 401 without auth', async ({ request }) => {
    const response = await request.post(`${API}/api/v1/workspaces/fake-id/stop`);
    expect(response.status()).toBe(401);
  });

  test('DELETE /api/v1/workspaces/fake-id returns 401 without auth', async ({ request }) => {
    const response = await request.delete(`${API}/api/v1/workspaces/fake-id`);
    expect(response.status()).toBe(401);
  });
});
