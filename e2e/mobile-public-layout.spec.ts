import { expect, test } from '@playwright/test';

const routes = ['/ilanlar', '/az/ilan-ver'];

test.describe('@mobile public layout', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  for (const route of routes) {
    test(`${route} has no horizontal document overflow`, async ({ page }) => {
      await page.goto(route, { waitUntil: 'domcontentloaded' });

      const overflow = await page.evaluate(() => ({
        clientWidth: document.documentElement.clientWidth,
        scrollWidth: document.documentElement.scrollWidth,
      }));

      expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth + 2);
    });
  }
});
