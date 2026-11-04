import { expect, test } from '@playwright/test';
import jwt from 'jsonwebtoken';

// Run only against a disposable local server started with this same test-only secret.
const secret = process.env.DK_LOCAL_ADMIN_TEST_SECRET;
const labels = [
  { locale: '', title: 'Xəbər mənbələri', type: 'Rəsmi sayt' },
  { locale: '/en', title: 'News sources', type: 'Official site' },
  { locale: '/ru', title: 'Источники новостей', type: 'Официальный сайт' },
  { locale: '/tr', title: 'Haber kaynakları', type: 'Resmi site' },
];
for (const label of labels) {
  test(`official source registry renders ${label.locale || 'AZ'} on mobile`, async ({ page, baseURL }) => {
    test.skip(!secret, 'Requires disposable local admin test server');
    if (!baseURL || !['localhost', '127.0.0.1'].includes(new URL(baseURL).hostname)) throw new Error('Local test server only');
    const token = jwt.sign({ userId: 1, email: 'task0554@example.test', role: 'admin' }, secret!, { expiresIn: '5m' });
    await page.context().addCookies([{ name: 'dk_auth_token', value: token, url: baseURL, httpOnly: true }]);
    await page.setViewportSize({ width: 390, height: 844 });
    const response = await page.goto(`${label.locale}/dashboard/xeberler/rss`);
    expect(response?.status()).toBe(200);
    await expect(page.getByRole('heading', { name: label.title, exact: true })).toBeVisible();
    await expect(page.locator('tbody tr').filter({ hasText: label.type })).toHaveCount(5);
    await expect(page.getByText('AQTA', { exact: true })).toBeVisible();
    const width = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth }));
    expect(width.scroll).toBe(width.client);
    if (!label.locale) await page.screenshot({ path: '/private/tmp/dk-official-sources-mobile.png', fullPage: true });
  });
}
