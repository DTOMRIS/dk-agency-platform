import { test, expect } from '@playwright/test';
import jwt from 'jsonwebtoken';
import { bakuDay, salesSummary } from '../lib/sales/followup';
const secret = process.env.JWT_SECRET;
const id = '5c555555-5555-4555-8555-555555555555';
const second = '6c666666-6666-4666-8666-666666666666';
function record(leadId = id) {
  return { id: leadId, name: 'Test restoranı', phone: '0501234567', email: 'test@example.com', businessType: 'restoran', intent: 'food_cost', status: 'qualified', notes: [{ at: '2026-11-16T10:00:00Z', text: 'Köhnə qeyd' }], conversationContext: [{ role: 'user', content: 'Food cost 38 faizdir' }], leadScore: 60, createdAt: '2026-11-16T10:00:00Z', whatsappHandoff: false, meetingRequested: true,
    sales: { leadId, version: 1, stage: 'proposal', ownerName: 'Doğan', nextAction: 'Təklifi danış', nextContactOn: '2000-01-01', service: 'diagnostic', proposalAmount: 500, collectedAmount: 100, spentMinutes: 60, lossReason: '' } };
}

test.describe('@smoke Sales follow-up', () => {
  test('API: anonymous and member cannot read or edit private sales; old notes protected', async ({ request }) => {
    expect((await request.get('/api/dashboard/kazan-sales')).status()).toBe(401);
    expect((await request.patch('/api/dashboard/kazan-sales', { data: {} })).status()).toBe(401);
    expect((await request.patch('/api/kazan-ai/leads', { data: { id, addNote: 'blocked' } })).status()).toBe(401);
    test.skip(!secret, 'Local JWT required for role tests');
    const token = jwt.sign({ userId: 7, email: 'test@example.com', role: 'member' }, secret!);
    expect((await request.get('/api/dashboard/kazan-sales', { headers: { cookie: `dk_auth_token=${token}` } })).status()).toBe(403);
    const admin = jwt.sign({ userId: 7, email: 'test@example.com', role: 'admin' }, secret!);
    expect((await request.patch('/api/dashboard/kazan-sales', { headers: { cookie: `dk_auth_token=${admin}` }, data: {} })).status()).toBe(400);
    expect((await request.patch('/api/kazan-ai/leads', { headers: { cookie: `dk_auth_token=${admin}` }, data: { id, status: 'converted' } })).status()).toBe(409);
  });

  test('admin: overdue queue, actual collections, customer WhatsApp and durable save contract', async ({ page, context }) => {
    test.skip(!secret, 'Local JWT required for admin screen'); test.setTimeout(120_000);
    await context.addCookies([{ name: 'dk_auth_token', value: jwt.sign({ userId: 7, email: 'test@example.com', role: 'admin' }, secret!), domain: '127.0.0.1', path: '/' }]);
    await page.addInitScript(() => localStorage.setItem('dk_user_language_set', 'e2e'));
    let first = record(); const won = record(second); won.name = 'Test müştərisi'; won.sales.stage = 'won'; won.sales.collectedAmount = 700; won.sales.proposalAmount = 900;
    let payload: Record<string, unknown> | undefined;
    let fail = false;
    await page.route('**/api/dashboard/kazan-sales**', async route => {
      if (route.request().method() === 'PATCH') {
        payload = route.request().postDataJSON();
        if (fail) { await route.fulfill({ status: 503, json: { error: 'storage_unavailable' } }); return; }
        first = { ...first, sales: { ...first.sales, collectedAmount: Number(payload?.collectedAmount), version: 2 } };
        await route.fulfill({ json: { success: true } }); return;
      }
      const items = new URL(route.request().url()).searchParams.get('queue') === 'overdue' ? [first] : [first, won];
      await route.fulfill({ json: { success: true, summary: salesSummary([first.sales, won.sales] as Parameters<typeof salesSummary>[0], bakuDay()), totalMatches: items.length, items } });
    });
    await page.goto('/dashboard/kazan-leads');
    await expect(page.getByTestId('sales-metric-collected')).toHaveText(/800/);
    await expect(page.getByTestId('sales-metric-pipeline')).toHaveText(/500/);
    await page.getByRole('button', { name: 'Gecikib', exact: true }).click();
    await expect(page.getByTestId(`sales-lead-${second}`)).toHaveCount(0);
    const editor = page.getByTestId(`sales-editor-${id}`);
    await editor.getByText('Müştəriyə WhatsApp cavabı', { exact: true }).click();
    await expect(editor.getByTestId('customer-whatsapp')).toHaveAttribute('href', /^https:\/\/wa.me\/994501234567\?text=/);
    await editor.locator('select').last().selectOption('proposal');
    await expect(editor.locator('textarea').last()).toHaveValue(/500/);
    await page.setViewportSize({ width: 390, height: 844 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
    await expect.poll(async () => page.locator('aside').first().evaluate(n => Math.round(n.getBoundingClientRect().right))).toBeLessThanOrEqual(0);
    await page.screenshot({ path: '/private/tmp/dk-0560-mobile.png', fullPage: true });
    await editor.locator('input[name="collectedAmount"]').fill('150');
    await editor.locator('textarea[name="addNote"]').fill('Partial payment received');
    await editor.getByRole('button', { name: 'İzləməni saxla', exact: true }).click();
    await expect(page.getByRole('status').filter({ hasText: 'Dəyişiklik saxlandı.' })).toHaveText('Dəyişiklik saxlandı.');
    expect(payload).toMatchObject({ leadId: id, version: 1, collectedAmount: 150, proposalAmount: 500, addNote: 'Partial payment received' });
    await expect(page.getByTestId('sales-metric-collected')).toHaveText(/850/);
    fail = true;
    await editor.locator('input[name="ownerName"]').fill('Another owner');
    await editor.getByRole('button', { name: 'İzləməni saxla', exact: true }).click();
    await expect(editor.getByRole('alert')).toHaveText(/Saxlanmadı/);
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.screenshot({ path: '/private/tmp/dk-0560-desktop.png', fullPage: true });
  });
});
