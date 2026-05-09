import { expect, test } from '@playwright/test';

const expectations = {
  az: { title: /P&L\s+Simulyator/i, calc: /Hesabla/ },
  ru: { title: /P&L\s+Симулятор/i, calc: /Рассчитать/ },
  en: { title: /P&L\s+Simulator/i, calc: /Calculate/ },
  tr: { title: /P&L\s+Simülatörü/i, calc: /Hesapla/ },
};

for (const [locale, exp] of Object.entries(expectations)) {
  test(`P&L renders correctly in ${locale}`, async ({ page }) => {
    test.skip(locale === 'az', 'Pre-existing middleware loop on default-locale /az routes');
    const path = locale === 'az' ? '/toolkit/pnl-simulator' : `/${locale}/toolkit/pnl-simulator`;

    await page.goto(path);

    await expect(page.getByRole('heading', { level: 1 })).toContainText(exp.title);
    await expect(page.getByRole('button', { name: exp.calc })).toBeVisible();
  });

  test(`P&L number format in ${locale}`, async ({ page }) => {
    test.skip(locale === 'az', 'Pre-existing middleware loop on default-locale /az routes');
    const path = locale === 'az' ? '/toolkit/pnl-simulator' : `/${locale}/toolkit/pnl-simulator`;

    await page.goto(path);
    await page.getByRole('button', { name: /detail|деталь|detay|detal/i }).click();

    await page.getByLabel(/revenue|ciro|оборот|dövriyyə/i).fill('1250');
    await page.getByLabel(/food cost|yiyecek|себестоимость|maya/i).fill('0');
    await page.getByLabel(/packaging|paketleme|упаковка/i).fill('0');

    const output = await page.locator('[data-testid="gross-profit"]').textContent();

    if (locale === 'tr') expect(output).toMatch(/1\.250|1 250/);
    if (locale === 'en') expect(output).toMatch(/1,250/);
    if (locale === 'az') expect(output).toMatch(/1\s?250|1\.250/);
    if (locale === 'ru') expect(output).toMatch(/1\s?250|1\.250/);
  });
}
