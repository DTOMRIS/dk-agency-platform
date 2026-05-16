import { expect, test } from '@playwright/test';

test('Admin members API returns 401 without auth', async ({ request }) => {
  const response = await request.get('/api/admin/members');
  expect(response.status()).toBe(401);
});

test('Admin members API returns 401 with body', async ({ request }) => {
  const response = await request.get('/api/admin/members');
  const body = await response.json();
  expect(body.error).toBe('not-authenticated');
});

test('Users page uses prefix-free dashboard route and redirects unauthenticated visitors', async ({ request }) => {
  const response = await request.get('/dashboard/users', { maxRedirects: 0 });
  expect(response.status()).toBe(307);
});
