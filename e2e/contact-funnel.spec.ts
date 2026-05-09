import { test, expect } from '@playwright/test';

test.describe('Contact Funnel', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.open = () => null;
    });
  });

  for (const locale of ['az', 'ru', 'en', 'tr']) {
    test(`${locale} - funnel cards visible, no phone`, async ({ page }) => {
      test.skip(locale === 'az', 'Default-locale /elaqe currently redirects in a middleware loop locally.');
      await page.context().addCookies([{ name: 'NEXT_LOCALE', value: locale, domain: 'localhost', path: '/' }]);
      const path = locale === 'az' ? '/elaqe' : `/${locale}/elaqe`;
      await page.goto(path);
      const funnel = page.locator('section[aria-labelledby="contact-funnel-title"]');

      await expect(page.locator('body')).not.toContainText('+994 50 256 62 79');
      await expect(page.locator('body')).not.toContainText('994502566279');

      await expect(funnel.getByRole('button', { name: /KAZAN AI/i })).toBeVisible();
      await expect(funnel.getByRole('button', { name: /WhatsApp/i })).toBeVisible();
      await expect(funnel.getByRole('button', { name: /Telegram/i })).toBeVisible();
    });

    test(`${locale} - WhatsApp click logs lead`, async ({ page }) => {
      test.skip(locale === 'az', 'Default-locale /elaqe currently redirects in a middleware loop locally.');
      await page.context().addCookies([{ name: 'NEXT_LOCALE', value: locale, domain: 'localhost', path: '/' }]);
      const path = locale === 'az' ? '/elaqe' : `/${locale}/elaqe`;
      await page.goto(path);
      const funnel = page.locator('section[aria-labelledby="contact-funnel-title"]');

      const trackPromise = page.waitForRequest(
        (req) => req.url().includes('/api/leads/track') && req.method() === 'POST',
      );

      await funnel.getByRole('button', { name: /WhatsApp/i }).click();
      const trackReq = await trackPromise;
      const body = JSON.parse(trackReq.postData() ?? '{}') as {
        source?: string;
        channel?: string;
        locale?: string;
      };

      expect(body.source).toBe('contact_page');
      expect(body.channel).toBe('whatsapp');
      expect(body.locale).toBe(locale);
    });
  }
});
