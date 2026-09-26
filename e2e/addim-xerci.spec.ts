import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

/**
 * @smoke Addım Xərci Kalkulyatoru — TASK-0450.
 *
 * Nümunə giriş: 3 işçi × 40 dəq × 6₼/saat ÷ 60 × 26 gün = 312₼/ay, 3 744₼/il, gündə 2 saat.
 * Yoxlanır: 4 dildə route, hesab (dəqiqə və gediş rejimi eyni nəticə), maaş köməkçisi,
 * toolkit siyahısında kart, 390px daşma (L-045).
 */

type Messages = { toolkit: { addimXerci: Record<string, string> } };
const msg = (locale: string) =>
  (
    JSON.parse(
      fs.readFileSync(path.join(__dirname, '..', 'messages', `${locale}.json`), 'utf8')
    ) as Messages
  ).toolkit.addimXerci;

const LOCALES = [
  { locale: 'az', prefix: '' },
  { locale: 'ru', prefix: '/ru' },
  { locale: 'en', prefix: '/en' },
  { locale: 'tr', prefix: '/tr' },
];

const digits = (s: string | null) => (s ?? '').replace(/\D/g, '');

test.describe('@smoke Addım Xərci', () => {
  // DeviceLanguageDetector brauzer dilinə (Chromium: en-US) görə /en-ə yönləndirir — test deterministik olsun.
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => window.localStorage.setItem('dk_user_language_set', 'e2e'));
  });

  for (const { locale, prefix } of LOCALES) {
    test(`${locale}: açılır, nümunə giriş 312 / 3744 / 2`, async ({ page }) => {
      test.setTimeout(90_000);
      const res = await page.goto(`${prefix}/toolkit/addim-xerci`);
      expect(res?.status()).toBe(200);
      await expect(page.getByText(msg(locale).calculatorTitle)).toBeVisible();
      expect(digits(await page.getByTestId('addim-monthly').textContent())).toBe('312');
      expect(digits(await page.getByTestId('addim-yearly').textContent())).toBe('3744');
      expect(digits(await page.getByTestId('addim-hours-day').textContent())).toBe('2');
    });
  }

  test('gediş rejimi: 60 gediş × 40 s = 40 dəq → yenə 312', async ({ page }) => {
    await page.goto('/toolkit/addim-xerci');
    // Dev rejimində hidrasiyadan əvvəlki klik itə bilər — klik idempotentdir, təsir görünənə qədər təkrarla.
    await expect(async () => {
      await page.getByRole('button', { name: msg('az').modeTrips }).click();
      await expect(page.locator('#trips')).toHaveValue('60', { timeout: 1_000 });
    }).toPass({ timeout: 30_000 });
    await expect(page.locator('#secondsPerTrip')).toHaveValue('40');
    expect(digits(await page.getByTestId('addim-monthly').textContent())).toBe('312');

    await page.locator('#trips').fill('120');
    expect(digits(await page.getByTestId('addim-monthly').textContent())).toBe('624');
  });

  test('maaş köməkçisi: 1250 ₼ ÷ 208 saat → 6.01 ₼/saat', async ({ page }) => {
    await page.goto('/toolkit/addim-xerci');
    await expect(async () => {
      await page.getByRole('button', { name: msg('az').wageHelperApply }).click();
      await expect(page.locator('#hourlyWage')).toHaveValue('6.01', { timeout: 1_000 });
    }).toPass({ timeout: 30_000 });
    // 2 saat/gün × 26 gün × 6.01 = 312.52 → 313
    expect(digits(await page.getByTestId('addim-monthly').textContent())).toBe('313');
  });

  test('toolkit siyahısında kart var', async ({ page }) => {
    await page.goto('/toolkit');
    await expect(page.locator('a[href$="/toolkit/addim-xerci"]').first()).toBeVisible();
  });

  test('390px: üfüqi daşma yoxdur (L-045)', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/toolkit/addim-xerci');
    const { sw, cw } = await page.evaluate(() => ({
      sw: document.documentElement.scrollWidth,
      cw: document.documentElement.clientWidth,
    }));
    expect(sw).toBeLessThanOrEqual(cw);
  });
});
