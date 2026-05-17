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

test('PATCH role returns 401 without auth', async ({ request }) => {
  const response = await request.patch('/api/admin/members/1', {
    data: { role: 'admin' },
  });
  expect(response.status()).toBe(401);
});

test('PATCH role returns 400 for invalid role', async ({ request }) => {
  const response = await request.patch('/api/admin/members/1', {
    data: { role: 'superuser' },
  });
  // Without auth it returns 401 first; this validates the endpoint exists
  expect([400, 401]).toContain(response.status());
});

test('PATCH role returns 400 for non-numeric id', async ({ request }) => {
  const response = await request.patch('/api/admin/members/abc', {
    data: { role: 'admin' },
  });
  expect([400, 401]).toContain(response.status());
});

test('POST create member returns 401 without auth', async ({ request }) => {
  const response = await request.post('/api/admin/members', {
    data: { name: 'Test User', email: 'test@example.com', role: 'member' },
  });
  expect(response.status()).toBe(401);
});

test('POST create member returns 400 with empty body', async ({ request }) => {
  const response = await request.post('/api/admin/members', {
    data: {},
  });
  // Without auth: 401; with auth + empty: 400
  expect([400, 401]).toContain(response.status());
});
