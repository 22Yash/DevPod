import { test, expect } from '@playwright/test';

const API = 'https://mydevpod.me';

test.describe('Auth API', () => {
  test('GET /api/auth/user returns 401 when not authenticated', async ({ request }) => {
    const response = await request.get(`${API}/api/auth/user`);
    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body.authenticated).toBe(false);
  });

  test('POST /api/auth/github returns 400 without authorization code', async ({ request }) => {
    const response = await request.post(`${API}/api/auth/github`, {
      data: {},
    });
    expect(response.status()).toBe(400);
  });

  test('POST /api/auth/logout returns 200', async ({ request }) => {
    const response = await request.post(`${API}/api/auth/logout`);
    expect(response.status()).toBe(200);
  });

  test('GET /api/health returns 200 with status ok', async ({ request }) => {
    const response = await request.get(`${API}/api/health`);
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.status).toBe('ok');
    expect(body.database).toBe('connected');
  });
});
