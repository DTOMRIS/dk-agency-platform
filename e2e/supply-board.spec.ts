import { test, expect, type BrowserContext, type Page } from '@playwright/test';
import jwt from 'jsonwebtoken';
import { deflateRawSync } from 'node:zlib';

/**
 * @smoke TASK-0498 — /dashboard/techizatcilar (Təchizatçı bazası + Tələb lövhəsi).
 *
 * Auth: `JWT_SECRET` env (server eyni sirlə); yoxdursa admin testləri SKIP.
 *   JWT_SECRET=x npx next start -p 3140
 *   JWT_SECRET=x BASE_URL=http://localhost:3140 npx playwright test e2e/supply-board.spec.ts
 *
 * Məxfilik: siyahı API-ları SAXTA sətirlərlə əvəz olunur (real şəxsi məlumat yoxdur);
 * idxal təhlili sintetik söhbətlə real API-ya gedir (preview bazaya yazmır).
 */

const SECRET = process.env.JWT_SECRET;

const SUPPLIERS = {
  rows: [
    {
      id: 1,
      displayName: 'Nümunə Ət Təchizatı',
      company: 'Nümunə MMC',
      phones: ['+994500000001'],
      categories: ['et', 'yarimfabrikat'],
      sourceGroups: ['Test qrupu'],
      firstSeen: '2026-05-02T08:00:00.000Z',
      lastSeen: '2026-09-28T08:00:00.000Z',
      postCount: 14,
      sampleOffers: [
        {
          text: 'Topdan toyuq və mal əti, çatdırılma pulsuz.',
          date: '2026-09-28T08:00:00.000Z',
          group: 'Test qrupu',
          k: 'a1',
        },
      ],
      status: 'yeni',
      publicConsent: false,
      notes: null,
    },
    {
      id: 2,
      displayName: 'Demo Qablaşdırma',
      company: null,
      phones: [],
      categories: ['qablasdirma'],
      sourceGroups: ['Test qrupu'],
      firstSeen: '2026-06-01T08:00:00.000Z',
      lastSeen: '2026-09-20T08:00:00.000Z',
      postCount: 3,
      sampleOffers: [],
      status: 'razi',
      publicConsent: true,
      notes: 'Test qeydi',
    },
  ],
  total: 2,
  page: 1,
  pageSize: 50,
  groups: ['Test qrupu'],
  summary: { total: 2, withPhone: 1, consented: 1 },
};

const REQUESTS = {
  rows: [
    {
      id: 10,
      requesterName: 'Test Kafe',
      phones: [],
      text: 'Salam, kimdə dondurulmuş toyuq var? Həftədə 50 kq lazımdır.',
      categories: ['et', 'yarimfabrikat'],
      requestType: 'mehsul',
      sourceGroup: 'Test qrupu',
      postedAt: '2026-09-30T08:00:00.000Z',
      status: 'aciq',
      notes: null,
      matchCount: 1,
      matches: [
        {
          id: 1,
          displayName: 'Nümunə Ət Təchizatı',
          company: 'Nümunə MMC',
          phones: ['+994500000001'],
          categories: ['et', 'yarimfabrikat'],
          lastSeen: '2026-09-28T08:00:00.000Z',
          status: 'yeni',
          overlap: 2,
        },
      ],
    },
  ],
  total: 1,
  page: 1,
  pageSize: 50,
};

const CHAT = [
  '[01.09.26 10:00:00] Test Qrup: Mesajlar uçtan uca şifrələnir.',
  '[02.09.26 09:15:30] Nümunə Satıcı: Topdan toyuq əti və balıq təklif edirik!',
  'Çatdırılma pulsuz.',
  '[02.09.26 09:20:00] Test Kafe: Salam, kimdə dondurulmuş kartof var? Hardan tapım?',
].join('\n');

/** Minimal ZIP (bir deflate fayl) — brauzerdə `_chat.txt` çıxarılmasını sınamaq üçün. */
function zipOf(name: string, text: string): Buffer {
  const data = Buffer.from(text, 'utf8');
  const body = deflateRawSync(data);
  const fileName = Buffer.from(name, 'utf8');
  const local = Buffer.alloc(30);
  local.writeUInt32LE(0x04034b50, 0);
  local.writeUInt16LE(8, 8);
  local.writeUInt32LE(body.length, 18);
  local.writeUInt32LE(data.length, 22);
  local.writeUInt16LE(fileName.length, 26);
  const central = Buffer.alloc(46);
  central.writeUInt32LE(0x02014b50, 0);
  central.writeUInt16LE(8, 10);
  central.writeUInt32LE(body.length, 20);
  central.writeUInt32LE(data.length, 24);
  central.writeUInt16LE(fileName.length, 28);
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(1, 8);
  eocd.writeUInt16LE(1, 10);
  eocd.writeUInt32LE(46 + fileName.length, 12);
  eocd.writeUInt32LE(30 + fileName.length + body.length, 16);
  return Buffer.concat([local, fileName, body, central, fileName, eocd]);
}

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

async function mockLists(page: Page) {
  await page.route('**/api/dashboard/supply/suppliers?*', (route) =>
    route.fulfill({ json: SUPPLIERS })
  );
  await page.route('**/api/dashboard/supply/suppliers', (route) =>
    route.fulfill({ json: SUPPLIERS })
  );
  await page.route('**/api/dashboard/supply/requests*', (route) =>
    route.fulfill({ json: REQUESTS })
  );
}

test.describe('@smoke Təchizatçı bazası — gating', () => {
  test('auth-suz: səhifə login-ə, API-lar 401', async ({ request }) => {
    const pageRes = await request.get('/dashboard/techizatcilar', { maxRedirects: 0 });
    expect(pageRes.status()).toBe(307);
    expect(pageRes.headers().location).toContain('/auth/login');
    for (const path of ['/api/dashboard/supply/suppliers', '/api/dashboard/supply/requests']) {
      expect((await request.get(path)).status(), path).toBe(401);
    }
    expect((await request.post('/api/dashboard/supply/import')).status()).toBe(401);
    expect(
      (
        await request.patch('/api/dashboard/supply/suppliers/1', { data: { status: 'razi' } })
      ).status()
    ).toBe(401);
    expect(
      (
        await request.patch('/api/dashboard/supply/requests/1', { data: { status: 'baglandi' } })
      ).status()
    ).toBe(401);
  });
});

test.describe('@smoke Təchizatçı bazası — admin UI', () => {
  test.skip(!SECRET, 'JWT_SECRET env yoxdur — admin testləri atlandı');

  test.beforeEach(async ({ context, baseURL }) => {
    await signIn(context, baseURL as string);
  });

  test('cədvəl yoxdursa aydın «miqrasiyanı işə salın» halı', async ({ page }) => {
    await page.route('**/api/dashboard/supply/**', (route) =>
      route.fulfill({ status: 503, json: { error: 'tables_missing' } })
    );
    await page.goto('/dashboard/techizatcilar');
    await expect(page.getByTestId('supply-tables-missing')).toBeVisible();
    await expect(page.getByText('Xəta baş verdi').first()).toBeHidden();
  });

  test('təchizatçılar: sətir, kateqoriya, tel: linki; sidebar linki', async ({ page }) => {
    await mockLists(page);
    await page.goto('/dashboard/techizatcilar');
    const table = page.getByTestId('supply-suppliers-table');
    await expect(table.getByText('Nümunə Ət Təchizatı')).toBeVisible();
    await expect(table.getByText('Ət/toyuq/balıq')).toBeVisible();
    await expect(table.locator('a[href="tel:+994500000001"]')).toBeVisible();
    await expect(page.locator('aside nav a[href="/dashboard/techizatcilar"]')).toBeVisible();
  });

  test('tələblər: «Uyğun təchizatçılar (1)» açılır', async ({ page }) => {
    await mockLists(page);
    await page.goto('/dashboard/techizatcilar');
    await expect(async () => {
      await page.getByRole('tab', { name: 'Tələblər' }).click();
      await expect(page.getByTestId('supply-requests-list')).toBeVisible({ timeout: 1000 });
    }).toPass();
    await page.getByRole('button', { name: /Uyğun təchizatçılar \(1\)/ }).click();
    await expect(
      page.getByTestId('supply-requests-list').getByText('Nümunə Ət Təchizatı')
    ).toBeVisible();
  });

  test('idxal təhlili: ZIP brauzerdə açılır, preview sayları gəlir (yazmır)', async ({ page }) => {
    await page.goto('/dashboard/techizatcilar');
    await page.getByRole('button', { name: 'WhatsApp-dan idxal' }).click();
    await page.getByTestId('supply-file').setInputFiles({
      name: 'WhatsApp Chat - Test Qrup.zip',
      mimeType: 'application/zip',
      buffer: zipOf('_chat.txt', CHAT),
    });
    await page.getByRole('button', { name: 'Təhlil et' }).click();
    const preview = page.getByTestId('supply-preview');
    await expect(preview).toBeVisible({ timeout: 20_000 });
    await expect(preview.getByText('Test Qrup').first()).toBeVisible();
    await expect(preview.getByText('Nümunə Satıcı')).toBeVisible();
  });

  test('390px: üfüqi daşma yoxdur (L-045)', async ({ page }) => {
    await mockLists(page);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/dashboard/techizatcilar');
    await expect(page.getByTestId('supply-suppliers-table')).toBeVisible();
    const { sw, cw } = await page.evaluate(() => ({
      sw: document.documentElement.scrollWidth,
      cw: document.documentElement.clientWidth,
    }));
    expect(sw).toBeLessThanOrEqual(cw);
  });
});
