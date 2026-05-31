import { expect, test } from '@playwright/test';

const routes = [
  '/az/ilan-ver',
  '/az/ilanlar',
  '/ru/ilan-ver',
  '/ru/ilanlar',
  '/en/listings',
  '/tr/ilanlar',
];

test.describe('@locale-routes localized public route redirects', () => {
  for (const route of routes) {
    test(`${route} resolves without redirect loop`, async ({ page }) => {
      const response = await page.goto(route, { waitUntil: 'domcontentloaded' });

      expect(response?.status()).toBeLessThan(400);
      await expect(page.locator('body')).toBeVisible();
    });
  }
});
