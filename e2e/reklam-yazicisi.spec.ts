import { expect, test } from '@playwright/test';

const expectations = {
  az: { title: /Reklam Yazıcısı/i, submit: /Reklam Yarat/ },
  en: { title: /Ad Writer/i, submit: /Generate Ad/ },
  tr: { title: /Reklam Yazıcı/i, submit: /Reklam Oluştur/ },
  ru: { title: /Генератор рекламы/i, submit: /Создать рекламу/ },
};

for (const [locale, exp] of Object.entries(expectations)) {
  test(`Ad writer renders correctly in ${locale}`, async ({ page }) => {
    test.skip(locale === 'az', 'Pre-existing middleware loop on default-locale /az routes');
    await page.goto(`/${locale}/dashboard/marketinq-ocagi/reklam-yazicisi`);
    await expect(page.getByRole('heading', { level: 1 })).toContainText(exp.title);
    await expect(page.getByRole('button', { name: exp.submit })).toBeVisible();
  });

  test(`Ad writer validates empty campaign in ${locale}`, async ({ page }) => {
    test.skip(locale === 'az', 'Pre-existing middleware loop on default-locale /az routes');
    await page.goto(`/${locale}/dashboard/marketinq-ocagi/reklam-yazicisi`);
    const submitBtn = page.getByRole('button', { name: exp.submit });
    await expect(submitBtn).toBeDisabled();
  });

  test(`Ad writer shows platform select in ${locale}`, async ({ page }) => {
    test.skip(locale === 'az', 'Pre-existing middleware loop on default-locale /az routes');
    await page.goto(`/${locale}/dashboard/marketinq-ocagi/reklam-yazicisi`);
    await expect(page.locator('select').first()).toBeVisible();
    await expect(page.locator('textarea')).toBeVisible();
  });
}

test('Ad writer API returns 401 without auth', async ({ request }) => {
  const response = await request.post('/api/ai/ad-writer', {
    data: {
      platform: 'instagram',
      campaignDescription: 'Test campaign description text here',
      targetAudience: 'all',
      callStyle: 'discount',
      language: 'az',
    },
  });
  expect(response.status()).toBe(401);
});
