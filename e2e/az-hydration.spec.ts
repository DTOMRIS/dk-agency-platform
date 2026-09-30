import { test, expect } from '@playwright/test';

/**
 * @smoke Hydration + AZ rəqəm formatı — TASK-0462.
 * Chrome ICU-da `az` yoxdur: `toLocaleString('az-AZ')` brauzerdə `3,744`, serverdə `3.744` verirdi →
 * «Hydration failed…» və hidrasiyadan sonra ingiliscə format. İndi `lib/i18n/format.ts` (ICU-suz).
 */

const PAGES = [
  '/toolkit/addim-xerci',
  '/en/toolkit/addim-xerci',
  '/toolkit/personel-planlayici',
  '/toolkit/metbex-istasyon',
  '/toolkit/basabas',
  '/toolkit/menu-matrix',
  '/toolkit/delivery-calc',
  '/toolkit/staff-retention',
  '/blog',
];

test.describe('@smoke Hydration (AZ format)', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => window.localStorage.setItem('dk_user_language_set', 'e2e'));
  });

  test('toolkit və bloq səhifələrində hydration xətası yoxdur', async ({ page }) => {
    test.setTimeout(300_000);
    const errors: string[] = [];
    page.on('pageerror', (e) => {
      if (/hydrat/i.test(e.message)) errors.push(`${page.url()}: ${e.message.slice(0, 120)}`);
    });
    for (const path of PAGES) {
      const res = await page.goto(path);
      expect(res?.status(), path).toBe(200);
      await page.waitForTimeout(2_500); // hidrasiya bitsin (networkidle analitika sorğularına görə gəlmir)
    }
    expect(errors).toEqual([]);
  });

  test('addım xərci: il nəticəsi AZ formatında (3.744 ₼), hidrasiyadan sonra da', async ({
    page,
  }) => {
    test.setTimeout(120_000);
    await page.goto('/toolkit/addim-xerci');
    await page.waitForTimeout(2_500); // hidrasiya bitsin (networkidle analitika sorğularına görə gəlmir)
    await expect(page.getByTestId('addim-yearly')).toContainText('3.744 ₼');
  });
});
