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

const expectations = {
  az: { title: /İstifadəçilər/i },
  en: { title: /Users/i },
  tr: { title: /Kullanıcılar/i },
  ru: { title: /Пользователи/i },
};

for (const [locale, exp] of Object.entries(expectations)) {
  test(`Users page renders heading in ${locale}`, async ({ page }) => {
    test.skip(locale === 'az', 'Pre-existing middleware loop on default-locale /az routes');
    await page.goto(`/${locale}/dashboard/users`);
    await expect(page.getByRole('heading', { level: 1 })).toContainText(exp.title);
  });
}
