import { test, expect } from '@playwright/test';

const API = 'https://mydevpod.me';

test.describe('Share API', () => {
  test('GET /api/share/invalid-token returns 404', async ({ request }) => {
    const response = await request.get(`${API}/api/share/invalid-token-12345`);
    expect(response.status()).toBe(404);
    const body = await response.json();
    expect(body.error).toContain('not found');
  });

  test('POST /api/share/invalid-token/clone returns 401 without auth', async ({ request }) => {
    const response = await request.post(`${API}/api/share/invalid-token/clone`, {
      data: { customName: 'test' },
    });
    expect(response.status()).toBe(401);
  });

  test('POST /api/workspace/fake-id/share returns 401 without auth', async ({ request }) => {
    const response = await request.post(`${API}/api/workspace/fake-id/share`, {
      data: { expiresIn: 24 },
    });
    expect(response.status()).toBe(401);
  });

  test('DELETE /api/workspace/fake-id/share returns 401 without auth', async ({ request }) => {
    const response = await request.delete(`${API}/api/workspace/fake-id/share`);
    expect(response.status()).toBe(401);
  });
});
