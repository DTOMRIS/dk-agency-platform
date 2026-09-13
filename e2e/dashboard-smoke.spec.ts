import { test, expect, type BrowserContext } from '@playwright/test';
import jwt from 'jsonwebtoken';

/**
 * @smoke Dashboard smoke — TASK-0445 (2026-09-13 sessiyasının yoxlamaları daimi edildi).
 *
 * Auth: `JWT_SECRET` env verilməlidir (dev server eyni sirlə qaldırılır);
 * yoxdursa bütün suite SKIP olur — sınmır. Nümunə:
 *   JWT_SECRET=x npm run dev  &&  JWT_SECRET=x BASE_URL=http://localhost:3000 npx playwright test e2e/dashboard-smoke.spec.ts
 *
 * Yoxlanır (hamısı 2026-09-13-də canlıda sınmış şeylərdir):
 *  - 0444: silinən saxta route-lar 404 (reqressiya qoruyucusu), qalan 19 səhifə render
 *  - 0444: sidebar 6 bölmə, menyuya girən 8 link, `settings` → `ayarlar`
 *  - 0443: 390px-də üfüqi daşma yox (L-045), `.dashboard-scope` kök rəngi (L-048),
 *          əsas mətndə `text-slate-400` qalmayıb
 */

const SECRET = process.env.JWT_SECRET;

const REMOVED = [
  'pipeline',
  'deal-flow',
  'raporlar',
  'roller',
  'loglar',
  'mesajlar',
  'etkinlikler',
  'b2b-yonetimi',
  'trends',
  'haberler',
  'duyurular',
  'toolkit',
  'site',
  'ilan-onaylari',
  'settings',
  'hero', // 0447: saxta «Saxla» redaktoru silindi (TD-005)
];

const KEPT = [
  '',
  'ilanlar',
  'xeberler',
  'blog',
  'reklamlar',
  'kazan-leads',
  'franchise-leads',
  'contact-tracking',
  'funnel',
  'marketinq-ocagi',
  'faturalar',
  'fatura-kateqoriyalar',
  'food-cost',
  'auditor',
  'aqta-checklist',
  'users',
  'profil-onay',
  'audit-logs',
  'ayarlar',
];

const NEW_IN_MENU = [
  '/dashboard/franchise-leads',
  '/dashboard/faturalar',
  '/dashboard/fatura-kateqoriyalar',
  '/dashboard/food-cost',
  '/dashboard/auditor',
  '/dashboard/aqta-checklist',
  '/dashboard/profil-onay',
  '/dashboard/ayarlar',
];

/** 390px-də daşma yoxlanan səhifələr — hamısı (0447: 5 səhifəlik siyahı blog və food-cost daşmasını qaçırmışdı). */
const MOBILE_PAGES = KEPT;

async function signIn(context: BrowserContext, baseURL: string) {
  const token = jwt.sign(
    { userId: 1, email: 'smoke@dkagency.com.tr', role: 'admin' },
    SECRET as string,
    {
      expiresIn: '1h',
    }
  );
  const { hostname } = new URL(baseURL);
  await context.addCookies([
    { name: 'dk_auth_token', value: token, domain: hostname, path: '/' },
    { name: 'NEXT_LOCALE', value: 'az', domain: hostname, path: '/' },
  ]);
}

test.describe('@smoke Dashboard', () => {
  test.skip(!SECRET, 'JWT_SECRET env yoxdur — dashboard smoke atlandı');

  test.beforeEach(async ({ context, baseURL }) => {
    await signIn(context, baseURL as string);
  });

  test('silinən saxta route-lar 404 qaytarır (kök + /tr)', async ({ request }) => {
    for (const r of REMOVED) {
      for (const prefix of ['', '/tr']) {
        const res = await request.get(`${prefix}/dashboard/${r}`, { maxRedirects: 0 });
        expect(res.status(), `${prefix}/dashboard/${r}`).toBe(404);
      }
    }
  });

  test('qalan 18 səhifə + ana səhifə auth ilə render olunur, görünən xəta yoxdur', async ({
    page,
  }) => {
    // 19 səhifə ardıcıl yüklənir (~30s) — config-in 30s limiti flaky olardı.
    test.setTimeout(120_000);
    for (const r of KEPT) {
      const res = await page.goto(`/dashboard${r ? '/' + r : ''}`);
      expect(res?.status(), `/dashboard/${r}`).toBe(200);
      await expect(page.locator('aside nav a').first(), `/dashboard/${r} sidebar`).toBeVisible();
      // error.tsx fallback mətni raw HTML-də həmişə var — yalnız GÖRÜNƏN xəta sayılır (L-044)
      await expect(page.getByText('Xəta baş verdi').first()).toBeHidden();
    }
  });

  test('sidebar: 6 bölmə, menyuya girən 8 link, settings → ayarlar', async ({ page }) => {
    await page.goto('/dashboard');
    const hrefs = await page
      .locator('aside nav a')
      .evaluateAll((as) => as.map((a) => a.getAttribute('href') ?? ''));
    const sections = await page.locator('aside nav div.uppercase').allTextContents();
    expect(sections).toHaveLength(6);
    for (const href of NEW_IN_MENU) expect(hrefs, href).toContain(href);
    for (const r of REMOVED) expect(hrefs).not.toContain(`/dashboard/${r}`);
    expect(hrefs).not.toContain('/dashboard/settings');
    expect(hrefs).toContain('/dashboard/ayarlar');
  });

  test('390px: üfüqi daşma yoxdur (L-045)', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    for (const r of MOBILE_PAGES) {
      await page.goto(`/dashboard${r ? '/' + r : ''}`);
      const { sw, cw } = await page.evaluate(() => ({
        sw: document.documentElement.scrollWidth,
        cw: document.documentElement.clientWidth,
      }));
      expect(sw, `/dashboard/${r} scrollWidth`).toBeLessThanOrEqual(cw);
    }
  });

  test('işıq teması: .dashboard-scope kök rəngi --dk-ink, əsas mətndə slate-400 yoxdur (L-048)', async ({
    page,
  }) => {
    await page.goto('/dashboard');
    const color = await page
      .locator('.dashboard-scope')
      .first()
      .evaluate((el) => {
        // Tailwind v4 rəngi lab() ilə verə bilər — canvas ilə rgb-yə çevir (L-044)
        const ctx = document.createElement('canvas').getContext('2d')!;
        ctx.fillStyle = getComputedStyle(el).color;
        ctx.fillRect(0, 0, 1, 1);
        const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
        return { r, g, b };
      });
    // --dk-ink #0f172a
    expect(Math.abs(color.r - 15)).toBeLessThanOrEqual(3);
    expect(Math.abs(color.g - 23)).toBeLessThanOrEqual(3);
    expect(Math.abs(color.b - 42)).toBeLessThanOrEqual(3);
    await expect(page.locator('[class*="text-slate-400"], [class*="text-gray-400"]')).toHaveCount(
      0
    );
  });
});
