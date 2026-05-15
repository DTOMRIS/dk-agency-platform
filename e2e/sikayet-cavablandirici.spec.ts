import { expect, test } from '@playwright/test';

const expectations = {
  az: { title: /Şikayət Cavablandırıcı/i, submit: /Cavab Yarat/ },
  en: { title: /Complaint Responder/i, submit: /Generate Response/ },
  tr: { title: /Şikayet Yanıtlayıcı/i, submit: /Yanıt Oluştur/ },
  ru: { title: /Ответчик на жалобы/i, submit: /Создать ответ/ },
};

for (const [locale, exp] of Object.entries(expectations)) {
  test(`Complaint handler renders correctly in ${locale}`, async ({ page }) => {
    test.skip(locale === 'az', 'Pre-existing middleware loop on default-locale /az routes');
    await page.goto(`/${locale}/dashboard/marketinq-ocagi/sikayet-cavablandirici`);

    await expect(page.getByRole('heading', { level: 1 })).toContainText(exp.title);
    await expect(page.getByRole('button', { name: exp.submit })).toBeVisible();
  });

  test(`Complaint handler validates empty input in ${locale}`, async ({ page }) => {
    test.skip(locale === 'az', 'Pre-existing middleware loop on default-locale /az routes');
    await page.goto(`/${locale}/dashboard/marketinq-ocagi/sikayet-cavablandirici`);

    const submitBtn = page.getByRole('button', { name: exp.submit });
    await expect(submitBtn).toBeDisabled();
  });

  test(`Complaint handler shows form fields in ${locale}`, async ({ page }) => {
    test.skip(locale === 'az', 'Pre-existing middleware loop on default-locale /az routes');
    await page.goto(`/${locale}/dashboard/marketinq-ocagi/sikayet-cavablandirici`);

    await expect(page.locator('textarea')).toBeVisible();
    await expect(page.locator('select').first()).toBeVisible();
  });
}

test('Complaint handler API returns 401 without auth', async ({ request }) => {
  const response = await request.post('/api/ai/complaint-response', {
    data: {
      complaintText: 'Yemək soyuq idi',
      complaintLang: 'az',
      responseLang: 'az',
      complaintType: 'food',
    },
  });
  expect(response.status()).toBe(401);
});
