import { test, expect, type APIRequestContext } from '@playwright/test';
import jwt from 'jsonwebtoken';

/**
 * @smoke Bloq tərcüməsi — arxa plan işi (TASK-0455).
 * Əvvəl: POST /api/blog/translate tərcümə bitənə qədər (1–3 dəq) açıq qalırdı → proxy kəsirdi.
 * İndi: POST dərhal 202 qaytarır, GET vəziyyəti verir. Admin olmayan — 403.
 *
 * DeepSeek və DB-yə bağlı deyil: sandbox/CI-da DB yoxdursa iş «failed» (db-unavailable) ilə bitir —
 * yoxlanan şey axındır (başla → soruş → bitdi), tərcümənin keyfiyyəti deyil.
 * Auth: `JWT_SECRET` env (yoxdursa auth testləri SKIP).
 */

const SECRET = process.env.JWT_SECRET;
const SLUG = 'e2e-translate-job-yoxlama';

/** Admin sessiyası: imzalı JWT (TASK-0457-dən sonra səlahiyyət yalnız ondan gəlir) */
function adminCookie(): string {
  const token = jwt.sign(
    { userId: 1, email: 'smoke@dkagency.com.tr', role: 'admin' },
    SECRET as string,
    { expiresIn: '1h' }
  );
  return `dk_auth_token=${token}`;
}

async function status(request: APIRequestContext, cookie?: string) {
  const res = await request.get(`/api/blog/translate?slug=${SLUG}`, {
    headers: cookie ? { cookie } : {},
  });
  return { code: res.status(), body: (await res.json()) as Record<string, unknown> };
}

test.describe('@smoke Bloq tərcümə işi', () => {
  test('admin olmadan POST və GET → 403', async ({ request }) => {
    const post = await request.post('/api/blog/translate', { data: { slug: SLUG, force: true } });
    expect(post.status()).toBe(403);
    expect((await status(request)).code).toBe(403);
  });

  test('POST dərhal 202 qaytarır, GET işin sonunu göstərir', async ({ request }) => {
    test.skip(!SECRET, 'JWT_SECRET env yoxdur — atlandı');
    const cookie = adminCookie();

    const bad = await request.post('/api/blog/translate', { headers: { cookie }, data: {} });
    expect(bad.status()).toBe(400);

    const t0 = Date.now();
    const post = await request.post('/api/blog/translate', {
      headers: { cookie },
      data: { slug: SLUG, force: true },
    });
    expect(post.status()).toBe(202);
    expect(Date.now() - t0).toBeLessThan(10_000);
    const started = (await post.json()) as { ok: boolean; status: string };
    expect(started.ok).toBe(true);
    expect(['running', 'done', 'failed']).toContain(started.status);

    await expect
      .poll(async () => (await status(request, cookie)).body.status, { timeout: 30_000 })
      .not.toBe('running');
    const final = (await status(request, cookie)).body;
    expect(['done', 'failed']).toContain(final.status);
    expect(final).toHaveProperty('langs');
  });
});
