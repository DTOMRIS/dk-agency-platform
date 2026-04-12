import { test, expect } from '@playwright/test';

const LOCALE = '/az';

test.describe('TASK-0005: Listing page smoke tests', () => {

  test(`${LOCALE}/ilan-ver loads without 404`, async ({ page }) => {
    const response = await page.goto(`${LOCALE}/ilan-ver`);
    expect(response?.status()).not.toBe(404);
    await expect(page.locator('text=Elan ver').first()).toBeVisible({ timeout: 10000 });
  });

  test(`${LOCALE}/ilanlar showcase page loads`, async ({ page }) => {
    const response = await page.goto(`${LOCALE}/ilanlar`);
    expect(response?.status()).not.toBe(404);
    await expect(page.locator('text=HoReCa Elanları').first()).toBeVisible({ timeout: 10000 });
  });

  test('showcase: devir listing modal shows new field labels if devir listing exists', async ({ page }) => {
    await page.goto(`${LOCALE}/ilanlar`);
    await page.waitForLoadState('networkidle');

    const cards = page.locator('[class*="rounded"]').filter({ hasText: 'Devir' });
    const count = await cards.count();

    if (count === 0) {
      test.skip(true, 'No devir listing in showcase — field labels cannot be checked via modal');
      return;
    }

    await cards.first().click();
    await expect(page.locator('text=Tipə görə detallar').first()).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=İcarə müddəti').first()).toBeVisible();
    await expect(page.locator('text=Aylıq xalis mənfəət').first()).toBeVisible();
    await expect(page.locator('text=Mülkiyyət tipi').first()).toBeVisible();
  });
});
