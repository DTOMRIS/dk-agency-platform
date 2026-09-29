import { test, expect, type BrowserContext } from '@playwright/test';
import { createHash } from 'crypto';
import jwt from 'jsonwebtoken';

/**
 * @smoke Bloq üz qabığı şəkli — birbaşa Cloudinary yükləmə (TASK-0460).
 * Əvvəl: brauzer → /api/upload (Hostinger) → Cloudinary + yükləmədə sinxron çevirmə.
 * İndi: /api/upload/sign (admin) imza verir, brauzer api.cloudinary.com-a birbaşa yükləyir,
 * çevirmə göstərmə URL-indədir; alınmasa köhnə /api/upload yolu.
 *
 * api.cloudinary.com Playwright-da saxtalaşdırılır (sandbox/CI-dan real hesab yoxdur).
 * Server `CLOUDINARY_*` env-siz qalxıbsa imza 503 qaytarır — UI testləri SKIP.
 */

const SECRET = process.env.JWT_SECRET;
const CLOUD_SECRET = process.env.CLOUDINARY_API_SECRET;

// 1×1 PNG
const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64'
);
const UPLOADED = 'https://res.cloudinary.com/demo/image/upload/v1/dk-agency/blog/cover.jpg';
const DELIVERED =
  'https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,c_limit,w_1400/v1/dk-agency/blog/cover.jpg';

function adminCookie(role = 'admin') {
  return jwt.sign({ userId: 1, email: 'smoke@dkagency.com.tr', role }, SECRET as string, {
    expiresIn: '1h',
  });
}

async function signIn(context: BrowserContext, baseURL: string) {
  const { hostname } = new URL(baseURL);
  await context.addCookies([
    { name: 'dk_auth_token', value: adminCookie(), domain: hostname, path: '/' },
    { name: 'NEXT_LOCALE', value: 'az', domain: hostname, path: '/' },
  ]);
}

test.describe('@smoke Bloq şəkli birbaşa yükləmə', () => {
  test('imza: admin-only, icazəli qovluq, düzgün SHA-1', async ({ request }) => {
    const anon = await request.post('/api/upload/sign', { data: { folder: 'dk-agency/blog' } });
    expect([401, 403]).toContain(anon.status());

    test.skip(!SECRET, 'JWT_SECRET env yoxdur — atlandı');
    const member = await request.post('/api/upload/sign', {
      headers: { cookie: `dk_auth_token=${adminCookie('member')}` },
      data: { folder: 'dk-agency/blog' },
    });
    expect(member.status()).toBe(403);

    const admin = { cookie: `dk_auth_token=${adminCookie()}` };
    const res = await request.post('/api/upload/sign', {
      headers: admin,
      data: { folder: 'dk-agency/blog' },
    });
    test.skip(res.status() === 503, 'server Cloudinary env-siz qalxıb — atlandı');
    expect(res.status()).toBe(200);
    const body = (await res.json()) as {
      signature: string;
      timestamp: number;
      folder: string;
      apiKey: string;
    };
    expect(body.folder).toBe('dk-agency/blog');
    expect(body.apiKey).toBeTruthy();
    if (CLOUD_SECRET) {
      const expected = createHash('sha1')
        .update(`folder=${body.folder}&timestamp=${body.timestamp}${CLOUD_SECRET}`)
        .digest('hex');
      expect(body.signature).toBe(expected);
    }

    const bad = await request.post('/api/upload/sign', {
      headers: admin,
      data: { folder: 'other/x' },
    });
    expect(bad.status()).toBe(400);
  });

  test('redaktor: fayl Cloudinary-yə birbaşa gedir, URL çevirmə ilə saxlanır', async ({
    page,
    context,
    baseURL,
  }) => {
    test.skip(!SECRET, 'JWT_SECRET env yoxdur — atlandı');
    test.setTimeout(120_000);
    await signIn(context, baseURL as string);

    const probe = await page.request.post('/api/upload/sign', {
      data: { folder: 'dk-agency/blog' },
    });
    test.skip(probe.status() === 503, 'server Cloudinary env-siz qalxıb — atlandı');

    let cloudinaryBody = '';
    let legacyCalls = 0;
    await page.route('https://api.cloudinary.com/**', async (route) => {
      cloudinaryBody = route.request().postDataBuffer()?.toString('latin1') ?? '';
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          secure_url: UPLOADED,
          public_id: 'dk-agency/blog/cover',
          width: 1,
          height: 1,
          bytes: 100,
        }),
      });
    });
    await page.route('**/api/upload', async (route) => {
      legacyCalls += 1;
      await route.continue();
    });

    await page.goto('/dashboard/blog/new');
    const input = page.locator('input[type="file"][accept="image/*"]');
    await expect(async () => {
      await input.setInputFiles({ name: 'cover.png', mimeType: 'image/png', buffer: PNG });
      await expect(page.locator('img[alt="Preview"]')).toHaveAttribute('src', DELIVERED, {
        timeout: 3_000,
      });
    }).toPass({ timeout: 30_000 });

    expect(cloudinaryBody).toContain('name="signature"');
    expect(cloudinaryBody).toContain('name="api_key"');
    expect(cloudinaryBody).toContain('dk-agency/blog');
    expect(legacyCalls).toBe(0);
  });

  test('redaktor: birbaşa yükləmə alınmasa köhnə /api/upload yolu işləyir', async ({
    page,
    context,
    baseURL,
  }) => {
    test.skip(!SECRET, 'JWT_SECRET env yoxdur — atlandı');
    test.setTimeout(120_000);
    await signIn(context, baseURL as string);

    await page.route('https://api.cloudinary.com/**', (route) => route.abort());
    const LEGACY = 'https://res.cloudinary.com/demo/image/upload/v2/dk-agency/blog/legacy.webp';
    await page.route('**/api/upload', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, url: LEGACY }),
      })
    );

    await page.goto('/dashboard/blog/new');
    const input = page.locator('input[type="file"][accept="image/*"]');
    await expect(async () => {
      await input.setInputFiles({ name: 'cover.png', mimeType: 'image/png', buffer: PNG });
      await expect(page.locator('img[alt="Preview"]')).toHaveAttribute('src', LEGACY, {
        timeout: 3_000,
      });
    }).toPass({ timeout: 30_000 });
  });
});
