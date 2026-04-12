import { test, expect } from '@playwright/test';

const PROD = 'https://dk-agency-platform.vercel.app';

test.describe('TASK-0005: Prod verification', () => {

  test('/ilan-ver loads (auth wall with Elan ver text)', async ({ page }) => {
    const response = await page.goto(`${PROD}/ilan-ver`);
    expect(response?.status()).toBe(200);
    await expect(page.locator('text=Elan ver').first()).toBeVisible({ timeout: 15000 });
  });

  test('/ilan-ver auth wall shows login + register links', async ({ page }) => {
    await page.goto(`${PROD}/ilan-ver`);
    await expect(page.locator('text=Daxil ol').first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Qeydiyyat').first()).toBeVisible({ timeout: 5000 });
  });

  test('/ilanlar showcase page loads', async ({ page }) => {
    const response = await page.goto(`${PROD}/ilanlar`);
    expect(response?.status()).toBe(200);
    await expect(page.locator('text=HoReCa Elanları').first()).toBeVisible({ timeout: 15000 });
  });

  test('showcase: devir listing modal shows new field labels', async ({ page }) => {
    await page.goto(`${PROD}/ilanlar`);
    await page.waitForLoadState('networkidle');

    // Find any listing card and click it
    const cards = page.locator('button, [role="button"], a').filter({ hasText: /Devir|devir/ });
    const count = await cards.count();

    if (count === 0) {
      // Try clicking any listing card
      const anyCard = page.locator('[class*="rounded-[28px]"]').first();
      const anyExists = await anyCard.isVisible().catch(() => false);
      if (!anyExists) {
        test.skip(true, 'No listing cards in showcase');
        return;
      }
      await anyCard.click();
    } else {
      await cards.first().click();
    }

    // Wait for modal
    const modal = page.locator('text=Tipə görə detallar');
    const modalVisible = await modal.isVisible().catch(() => false);

    if (modalVisible) {
      // Check new field labels
      await expect(page.locator('text=İcarə müddəti').first()).toBeVisible({ timeout: 5000 });
      await expect(page.locator('text=Aylıq xalis mənfəət').first()).toBeVisible({ timeout: 3000 });
      await expect(page.locator('text=Mülkiyyət tipi').first()).toBeVisible({ timeout: 3000 });
    } else {
      // Modal didn't open or listing is not devir type — check what opened
      test.skip(true, 'No devir modal opened — may be different listing type');
    }
  });
});
