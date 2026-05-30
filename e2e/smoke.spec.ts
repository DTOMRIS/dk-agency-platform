import { test, expect } from '@playwright/test';

/**
 * @smoke Core smoke tests — always run by dk-validate check 8.
 * Keep these fast (<10s total) and infrastructure-only.
 * Do NOT add business-logic tests here; use feature-specific specs instead.
 */
test.describe('@smoke Core smoke', () => {
  test('GET / returns 200 or redirect', async ({ request }) => {
    const res = await request.get('/');
    expect([200, 301, 302, 307, 308]).toContain(res.status());
  });

  test('GET /auth/login returns 200', async ({ request }) => {
    const res = await request.get('/auth/login');
    expect(res.status()).toBe(200);
  });

  test('GET /ilanlar returns 200', async ({ request }) => {
    const res = await request.get('/ilanlar');
    expect(res.status()).toBe(200);
  });

  test('POST /api/member/auth without body returns 400 or 401', async ({ request }) => {
    const res = await request.post('/api/member/auth', {
      data: {},
      headers: { 'Content-Type': 'application/json' },
    });
    expect([400, 401, 405]).toContain(res.status());
  });
});
