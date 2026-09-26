import { test, expect, type APIRequestContext } from '@playwright/test';
import jwt from 'jsonwebtoken';

/**
 * @smoke Sessiya təhlükəsizliyi — TASK-0457.
 * Əvvəl: `dk_member_session` imzasız base64 JSON idi və `POST /api/member/session`
 * bədəndəki `plan: 'admin'`-i yoxlamadan yazırdı → istənilən şəxs admin API-larına çıxırdı.
 * İndi səlahiyyət yalnız imzalı JWT-dən (`dk_auth_token`) gəlir.
 *
 * Yoxlanan admin endpoint-ləri: `/api/blog/translate` (GET) və `/api/settings` (GET, requireApiAdmin).
 */

const SECRET = process.env.JWT_SECRET;

const forgedMember = Buffer.from(
  JSON.stringify({ email: 'hacker@example.com', name: 'x', loggedIn: true, plan: 'admin' }),
  'utf8'
).toString('base64url');

function token(role: string, secret = SECRET as string) {
  return jwt.sign({ userId: 7, email: 'user@dkagency.com.tr', role }, secret, { expiresIn: '1h' });
}

async function adminEndpoints(request: APIRequestContext, cookie: string) {
  const translate = await request.get('/api/blog/translate?slug=e2e-auth', { headers: { cookie } });
  const settings = await request.get('/api/settings', { headers: { cookie } });
  return [translate.status(), settings.status()];
}

test.describe('@smoke Sessiya təhlükəsizliyi', () => {
  test('saxta member cookie (JWT yox) admin API-larına çıxış vermir', async ({ request }) => {
    const codes = await adminEndpoints(request, `dk_member_session=${forgedMember}`);
    for (const c of codes) expect([401, 403]).toContain(c);
  });

  test('POST /api/member/session bədəndəki plan:admin-i yazmır', async ({ request }) => {
    const res = await request.post('/api/member/session', {
      data: { email: 'hacker@example.com', name: 'x', loggedIn: true, plan: 'admin' },
    });
    expect(res.status()).toBe(200);
    const body = (await res.json()) as { session: { loggedIn: boolean; plan: string } };
    expect(body.session.loggedIn).toBe(false);
    expect(body.session.plan).toBe('free');

    // Qaytarılan cookie ilə də admin API bağlıdır
    const setCookie = res.headers()['set-cookie'] ?? '';
    const cookie = setCookie.split(';')[0];
    const codes = await adminEndpoints(request, cookie);
    for (const c of codes) expect([401, 403]).toContain(c);
  });

  test('member JWT + saxta admin cookie → admin deyil; admin JWT → admin', async ({ request }) => {
    test.skip(!SECRET, 'JWT_SECRET env yoxdur — atlandı');

    const member = `dk_auth_token=${token('member')}; dk_member_session=${forgedMember}`;
    for (const c of await adminEndpoints(request, member)) expect(c).toBe(403);
    const memberSession = await request.get('/api/member/session', { headers: { cookie: member } });
    expect(((await memberSession.json()) as { session: { plan: string } }).session.plan).toBe(
      'member'
    );

    const wrongSecret = `dk_auth_token=${token('admin', 'yanlis-sirr')}`;
    for (const c of await adminEndpoints(request, wrongSecret)) expect([401, 403]).toContain(c);

    const admin = `dk_auth_token=${token('admin')}`;
    const [translate, settings] = await adminEndpoints(request, admin);
    expect(translate).toBe(200);
    expect(settings).not.toBe(401);
    expect(settings).not.toBe(403);
    const adminSession = await request.get('/api/member/session', { headers: { cookie: admin } });
    const s = ((await adminSession.json()) as { session: { plan: string; loggedIn: boolean } })
      .session;
    expect(s.loggedIn).toBe(true);
    expect(s.plan).toBe('admin');

    // Login səhifəsinin axını: JWT cookie qoyulandan sonra sessiya POST-u — ad saxlanır, plan JWT-dən
    const post = await request.post('/api/member/session', {
      headers: { cookie: admin },
      data: { email: 'user@dkagency.com.tr', name: 'Doğan', loggedIn: true, plan: 'member' },
    });
    const posted = ((await post.json()) as { session: { plan: string; name: string } }).session;
    expect(posted.plan).toBe('admin');
    expect(posted.name).toBe('Doğan');
  });

  test('dashboard: üzv lead/yazı səhifələrinə girə bilmir, marketinq-ocagi açıq qalır', async ({
    request,
  }) => {
    test.skip(!SECRET, 'JWT_SECRET env yoxdur — atlandı');
    test.setTimeout(120_000);
    const member = `dk_auth_token=${token('member')}`;
    const admin = `dk_auth_token=${token('admin')}`;
    const ADMIN_ONLY = ['/dashboard', '/dashboard/kazan-leads', '/dashboard/franchise-leads', '/dashboard/contact-tracking', '/dashboard/blog/translation-status'];

    for (const path of ADMIN_ONLY) {
      const asMember = await request.get(path, { headers: { cookie: member }, maxRedirects: 0 });
      expect(asMember.status(), `${path} (üzv)`).toBe(307);
      expect(asMember.headers()['location'] ?? '', `${path} (üzv)`).toContain('/b2b-panel');
      const asAdmin = await request.get(path, { headers: { cookie: admin }, maxRedirects: 0 });
      expect(asAdmin.status(), `${path} (admin)`).toBe(200);
    }

    const tool = await request.get('/dashboard/marketinq-ocagi', { headers: { cookie: member }, maxRedirects: 0 });
    expect(tool.status(), 'marketinq-ocagi (üzv)').toBe(200);
  });
});
