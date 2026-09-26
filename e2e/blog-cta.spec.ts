import { test, expect } from '@playwright/test';

/**
 * @smoke Bloq yazısı CTA bloku — TASK-0453.
 * Canlıda «blogDetail.ctaTitle» kimi xam açarlar görünürdü (açarlar messages/*.json-da heç vaxt olmayıb).
 * Yoxlanır: 4 dildə xam açar yoxdur, WhatsApp linki yazının adı ilə dilə uyğun mesaj daşıyır.
 */

const SLUG = '1-porsiya-food-cost-hesablama';
const CASES = [
  { prefix: '', button: 'WhatsApp-da yaz', msg: 'Salam,' },
  { prefix: '/ru', button: 'Написать в WhatsApp', msg: 'Здравствуйте,' },
  { prefix: '/en', button: 'Message on WhatsApp', msg: 'Hello,' },
  { prefix: '/tr', button: 'WhatsApp’tan yaz', msg: 'Merhaba,' },
];

test.describe('@smoke Bloq CTA', () => {
  // DeviceLanguageDetector brauzer dilinə görə yönləndirir — test deterministik olsun (L-053).
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => window.localStorage.setItem('dk_user_language_set', 'e2e'));
  });

  for (const c of CASES) {
    test(`${c.prefix || '/az'}: xam açar yoxdur, WhatsApp mesajı dilə uyğundur`, async ({
      page,
    }) => {
      test.setTimeout(90_000);
      const res = await page.goto(`${c.prefix}/blog/${SLUG}`);
      expect(res?.status()).toBe(200);
      await expect(page.getByText(/blogDetail\./)).toHaveCount(0);
      const wa = page.getByRole('link', { name: c.button });
      await expect(wa).toBeVisible();
      const href = decodeURIComponent((await wa.getAttribute('href')) ?? '');
      expect(href).toContain('wa.me/994502566279');
      expect(href).toContain(c.msg);
    });
  }
});
