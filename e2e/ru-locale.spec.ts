import { expect, test } from '@playwright/test';

test('RU locale renders homepage', async ({ page }) => {
  await page.goto('/ru');

  await expect(page).toHaveURL(/\/ru$/);
  await expect(page.getByRole('heading', { name: /Не понимаешь, почему/i })).toBeVisible();
  await expect(page.getByRole('link', { name: /Смотреть все объявления/i })).toBeVisible();
});
