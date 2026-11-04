import { test, expect } from '@playwright/test';

for (const locale of ['', '/ru', '/en', '/tr']) {
  test(`holiday scheduled mobile ${locale || 'az'}`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.clock.install({ time: new Date('2026-11-05T06:00:00+04:00') });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(`${locale}/auth/login`);
    const banner = page.locator('[data-holiday="victory"]');
    await expect(banner).toBeVisible();
    await expect(page.locator('header img').first()).toHaveAttribute('src', '/images/dk-victory-2026.webp');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
    expect(await banner.evaluate(el => getComputedStyle(el, '::after').animationName)).toBe('none');
    expect(await page.locator('header img').first().evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth === 256)).toBeTruthy();
    expect(errors).toEqual([]);
    if (!locale) await page.screenshot({ path: '/private/tmp/dk-holiday-mobile.png', fullPage: false });
  });
}

test('Baku boundaries and open-tab rollover', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-11-04T23:59:50+04:00') });
  await page.goto('/auth/login');
  await expect(page.locator('header img').first()).toHaveAttribute('src', '/images/dk-victory-2026.webp');
  await expect(page.locator('[data-holiday]')).toHaveCount(0);
  await page.clock.fastForward(31_000);
  await expect(page.locator('[data-holiday="victory"]')).toBeVisible();
  await page.clock.setSystemTime(new Date('2026-11-09T00:00:01+04:00'));
  await page.clock.fastForward(31_000);
  await expect(page.locator('[data-holiday="flag"]')).toContainText('Dövlət Bayrağı');
  await page.clock.setSystemTime(new Date('2026-11-10T00:00:01+04:00'));
  await page.clock.fastForward(31_000);
  await expect(page.locator('[data-holiday]')).toHaveCount(0);
  await expect(page.locator('header img').first()).toHaveAttribute('src', '/images/logo-mobil.png');
});

test('desktop composition', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.clock.install({ time: new Date('2026-11-05T12:00:00+04:00') });
  await page.goto('/');
  await expect(page.locator('[data-holiday="victory"]')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
  await page.screenshot({ path: '/private/tmp/dk-holiday-desktop.png', fullPage: false });
});
