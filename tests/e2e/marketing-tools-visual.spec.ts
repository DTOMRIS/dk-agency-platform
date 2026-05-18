import { test, expect } from '@playwright/test';

const TOOLS = [
  'sezon-planlama',
  'marka-kompasi',
  'kst-yoxlayici',
  'menyu-analitik',
  'sikayet-analitigi',
  'roi-kalkulator',
  'musteri-persona',
];

test.describe('Marketing Tools Visual Verification', () => {
  test.use({
    storageState: '.playwright/auth.json', // Login session
  });

  for (const tool of TOOLS) {
    test(`${tool} — info box readable`, async ({ page }) => {
      await page.goto(`/dashboard/marketinq-ocagi/${tool}`);

      // Info box mövcuddur
      const infoBox = page.getByRole('heading', { name: /Niyə bu vacibdir/ });
      await expect(infoBox).toBeVisible();

      // Mətn kontrastı yoxlanır (text rəng property)
      const titleColor = await infoBox.evaluate((el) =>
        window.getComputedStyle(el).color
      );
      // text-blue-900 RGB = 30, 58, 138
      expect(titleColor).toMatch(/30.*58.*138|rgb\(30,\s*58,\s*138\)/);

      // Screenshot saxla (manuel review üçün)
      await page.screenshot({
        path: `tests/screenshots/${tool}.png`,
        fullPage: true
      });
    });
  }

  test('sikayet — date format AZ display', async ({ page }) => {
    await page.goto('/dashboard/marketinq-ocagi/sikayet-analitigi');

    const dateInput = page.locator('input[type="date"]').first();
    await dateInput.fill('2026-05-14');

    // "Seçilən tarix: 14.05.2026" görünməlidir
    await expect(page.getByText(/Seçilən tarix.*14\.05\.2026/)).toBeVisible();
  });

  test('menyu — form inputs visible', async ({ page }) => {
    await page.goto('/dashboard/marketinq-ocagi/menyu-analitik');

    // "Yemək adı" tam görünür (truncate yox)
    await expect(page.getByText('Yemək adı')).toBeVisible();

    // Helper text var
    await expect(page.getByText(/Müştəriyə təqdim olunan qiymət/)).toBeVisible();

    // Screenshot
    await page.screenshot({
      path: 'tests/screenshots/menyu-form.png',
      fullPage: true
    });
  });
});