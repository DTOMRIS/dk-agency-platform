import { test, expect, type Page } from '@playwright/test';

/**
 * @smoke Sayt mesaj formu — TASK-0558.
 * Sahib: «mesaj bana gelmiyor — ya telegram ya mail olsun ama mesaj gelsin». WhatsApp düyməsi yalnız ziyarətçinin
 * telefonunda WhatsApp-ı açırdı; «Göndər»ə basmayanda sahibə heç nə çatmırdı. İndi hər WhatsApp düyməsi əvvəl
 * formu açır, mətn POST /api/leads/message ilə Telegram + mail + panelə gedir.
 * Etibarlı göndəriş testi bazaya / Telegrama yazmır (dev server canlı DB-yə qoşula bilər): UI testləri
 * sorğunu tutub cavab verir, API testləri yalnız rədd olunan halları yoxlayır.
 */

async function openFromFloat(page: Page) {
  await page.goto('/');
  await page.waitForTimeout(1_500); // hidrasiya
  await page.mouse.wheel(0, 1_500);
  const float = page.getByTestId('whatsapp-float');
  await expect(float).toBeVisible();
  await float.click();
  return page.getByTestId('message-form');
}

test.describe('@smoke Sayt mesaj formu', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => window.localStorage.setItem('dk_user_language_set', 'e2e'));
  });

  test('API: boş / səhv sahələr 400, honeypot səssiz 200', async ({ request }) => {
    const empty = await request.post('/api/leads/message', { data: {} });
    expect(empty.status()).toBe(400);
    expect((await empty.json()).fields).toEqual(['name', 'phone', 'message']);

    const badPhone = await request.post('/api/leads/message', {
      data: { name: 'Elvin', phone: '12', message: 'Salam' },
    });
    expect(badPhone.status()).toBe(400);
    expect((await badPhone.json()).fields).toEqual(['phone']);

    const bot = await request.post('/api/leads/message', {
      data: {
        name: 'Bot',
        phone: '+994501234567',
        message: 'spam',
        website: 'http://spam.example',
      },
    });
    expect(bot.status()).toBe(200);
  });

  test('WhatsApp düyməsi formu açır (yeni tab yox), mesaj hazır mətnlə dolur', async ({
    page,
    context,
  }) => {
    test.setTimeout(120_000);
    let popups = 0;
    context.on('page', () => (popups += 1));
    const form = await openFromFloat(page);
    await expect(form).toBeVisible();
    expect(popups).toBe(0);
    await expect(form.locator('textarea[name="message"]')).toHaveValue(/DK Agency/);
    await expect(page.getByTestId('message-form-whatsapp')).toHaveAttribute(
      'href',
      /^\/api\/leads\/whatsapp\?text=/
    );
  });

  test('göndər: ad, telefon, mesaj API-yə gedir, «çatdı» görünür', async ({ page }) => {
    test.setTimeout(120_000);
    let sent: Record<string, unknown> | null = null;
    await page.route('**/api/leads/message', async (route) => {
      sent = route.request().postDataJSON() as Record<string, unknown>;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: '{"success":true}',
      });
    });
    const form = await openFromFloat(page);
    await form.locator('input[name="name"]').fill('Elvin');
    await form.locator('input[name="phone"]').fill('+994 50 123 45 67');
    await form.locator('textarea[name="message"]').fill('Ocaq paneli haqqında məlumat istəyirəm');
    await form.getByRole('button', { name: 'Göndər' }).click();
    await expect(page.getByTestId('message-form-sent')).toBeVisible();
    expect(sent).toMatchObject({
      name: 'Elvin',
      phone: '+994 50 123 45 67',
      message: 'Ocaq paneli haqqında məlumat istəyirəm',
      website: '',
      page: '/',
    });
  });

  test('server göndərə bilməyəndə «çatdı» demir, xəta + WhatsApp seçimi qalır', async ({
    page,
  }) => {
    test.setTimeout(120_000);
    await page.route('**/api/leads/message', (route) =>
      route.fulfill({
        status: 503,
        contentType: 'application/json',
        body: '{"success":false,"error":"unavailable"}',
      })
    );
    const form = await openFromFloat(page);
    await form.locator('input[name="name"]').fill('Elvin');
    await form.locator('input[name="phone"]').fill('+994501234567');
    await form.getByRole('button', { name: 'Göndər' }).click();
    await expect(page.getByTestId('message-form-error')).toBeVisible();
    await expect(page.getByTestId('message-form-sent')).toHaveCount(0);
    await expect(page.getByTestId('message-form-whatsapp')).toBeVisible();
  });

  test('əlaqə səhifəsi (JS düyməsi) də formu açır, EN mətnlə', async ({ page }) => {
    test.setTimeout(120_000);
    await page.goto('/en/elaqe');
    await page.waitForTimeout(1_500);
    await page
      .locator('section[aria-labelledby="contact-funnel-title"]')
      .getByRole('button', { name: /WhatsApp/i })
      .click();
    const form = page.getByTestId('message-form');
    await expect(form).toBeVisible();
    await expect(form.getByRole('heading', { name: 'Write to us' })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(form).toHaveCount(0);
  });
});
