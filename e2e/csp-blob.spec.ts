import { test, expect } from '@playwright/test';

/**
 * @smoke CSP `blob:` — TASK-0461.
 * `img-src 'self' data: https:` brauzerdə yaradılan `blob:` şəkil önizləmələrini bloklayırdı
 * (inşaat checklist foto, auditor, elan önizləmə; TD-011). İndi `img-src`/`media-src` `blob:`-ə icazə verir.
 */

// 1×1 PNG
const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64'
);

test.describe('@smoke CSP blob: şəkil önizləməsi', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => window.localStorage.setItem('dk_user_language_set', 'e2e'));
  });

  test('CSP başlığında img-src və media-src blob: var', async ({ request }) => {
    const res = await request.get('/');
    const csp = res.headers()['content-security-policy'] ?? '';
    expect(csp).toMatch(/img-src [^;]*blob:/);
    expect(csp).toMatch(/media-src [^;]*blob:/);
  });

  test('inşaat checklist: foto önizləməsi yüklənir, CSP xətası yoxdur', async ({ page }) => {
    test.setTimeout(120_000);
    const cspErrors: string[] = [];
    page.on('console', (m) => {
      if (m.type() === 'error' && /Content Security Policy/.test(m.text()))
        cspErrors.push(m.text());
    });

    await page.goto('/toolkit/insaat-checklist');
    const addMedia = page.locator('button:has(svg.lucide-camera)').first();
    await expect(addMedia).toBeVisible();

    await expect(async () => {
      const chooser = page.waitForEvent('filechooser', { timeout: 3_000 });
      await addMedia.click();
      await (await chooser).setFiles({ name: 'foto.png', mimeType: 'image/png', buffer: PNG });
      await expect(page.locator('img[src^="blob:"]').first()).toBeVisible({ timeout: 3_000 });
    }).toPass({ timeout: 30_000 });

    const loaded = await page
      .locator('img[src^="blob:"]')
      .first()
      .evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0);
    expect(loaded).toBe(true);
    expect(cspErrors).toEqual([]);
  });
});
