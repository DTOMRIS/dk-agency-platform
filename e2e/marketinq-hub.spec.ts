import { test, expect } from '@playwright/test';
import jwt from 'jsonwebtoken';

/**
 * @smoke Marketinq Ocağı kartları və toolkit alətləri — TASK-0459.
 * Əvvəl: hub-da 4 kartın adı xam slug idi (`sosial-metrik`, `personel-planlayici`,
 * `metbex-istasyon`, `franchbook-generator`) və kart boş səhifəyə aparırdı;
 * `/toolkit/personel-planlayici` və `/toolkit/metbex-istasyon` sonsuz import dövrəsi ilə 500 verirdi.
 */

const SECRET = process.env.JWT_SECRET;
const RAW_SLUG = /^[a-z]+(-[a-z]+)+$/;

test.describe('@smoke Marketinq Ocağı / toolkit', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => window.localStorage.setItem('dk_user_language_set', 'e2e'));
  });

  test('toolkit: personel planlayıcı və mətbəx istasyon açılır (kök + locale)', async ({
    page,
  }) => {
    test.setTimeout(240_000);
    for (const path of [
      '/toolkit/personel-planlayici',
      '/toolkit/metbex-istasyon',
      '/en/toolkit/personel-planlayici',
      '/ru/toolkit/metbex-istasyon',
    ]) {
      const res = await page.goto(path);
      expect(res?.status(), path).toBe(200);
      await expect(page.locator('h1').first(), path).toBeVisible();
    }
  });

  test('hub: 4 dildə xam slug başlığı yoxdur, kartlar alətin səhifəsinə aparır', async ({
    page,
    context,
    baseURL,
  }) => {
    test.skip(!SECRET, 'JWT_SECRET env yoxdur — atlandı');
    test.setTimeout(240_000);
    const token = jwt.sign(
      { userId: 7, email: 'u@dkagency.com.tr', role: 'member' },
      SECRET as string,
      {
        expiresIn: '1h',
      }
    );
    const { hostname } = new URL(baseURL as string);
    await context.addCookies([
      { name: 'dk_auth_token', value: token, domain: hostname, path: '/' },
    ]);

    for (const prefix of ['', '/en', '/tr', '/ru']) {
      await page.goto(`${prefix}/b2b-panel/marketinq-ocagi`);
      const titles = (await page.locator('h3').allTextContents()).map((t) => t.trim());
      expect(titles.length, prefix || '/az').toBeGreaterThan(20);
      expect(
        titles.filter((t) => RAW_SLUG.test(t)),
        prefix || '/az'
      ).toEqual([]);
    }

    const hrefs = await page
      .locator('a:has(h3)')
      .evaluateAll((as) => as.map((a) => a.getAttribute('href')));
    expect(hrefs).toContain('/toolkit/personel-planlayici');
    expect(hrefs).toContain('/toolkit/metbex-istasyon');
    expect(hrefs).toContain('/franchise/francbuk-generatoru');
    expect(hrefs).toContain('/b2b-panel/marketinq-ocagi/sosial-metrik');

    // Birbaşa ünvan: sosial-metrik aləti açılır, digərləri öz səhifəsinə yönləndirir
    await page.goto('/b2b-panel/marketinq-ocagi/sosial-metrik');
    await expect(page.locator('input[inputmode="numeric"]').first()).toBeVisible();
    for (const [slug, target] of [
      ['personel-planlayici', '/toolkit/personel-planlayici'],
      ['metbex-istasyon', '/toolkit/metbex-istasyon'],
      ['franchbook-generator', '/franchise/francbuk-generatoru'],
    ]) {
      const res = await page.request.get(`/b2b-panel/marketinq-ocagi/${slug}`, { maxRedirects: 0 });
      expect(res.status(), slug).toBe(307);
      expect(res.headers()['location'] ?? '', slug).toContain(target);
    }
  });
});
