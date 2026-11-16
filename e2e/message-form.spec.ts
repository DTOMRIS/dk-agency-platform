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

  test('mobil KAZAN: könüllü əlaqə istəyi kontekstlə göndərilir, söhbət açıq qalır', async ({ page }) => {
    test.setTimeout(120_000);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.route('**/api/kazan-ai', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ message: 'Əvvəlcə məhsulun maya dəyərini hesablayaq.' }) }));
    let sent: Record<string, unknown> | null = null;
    await page.route('**/api/leads/message', async route => {
      sent = route.request().postDataJSON();
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, contact: { id: 'test-only', name: 'Elvin', phone: '+994501234567', businessType: 'restoran', intent: 'food_cost' } }) });
    });
    await page.goto('/kazan-ai');
    const chat = page.locator('textarea').first();
    await chat.fill('Restoranımda food cost çox yüksəkdir');
    await chat.locator('..').getByRole('button', { name: /Göndər/ }).click();
    await expect(page.getByText('Əvvəlcə məhsulun maya dəyərini hesablayaq.', { exact: true })).toBeVisible();
    await expect(chat).toBeEnabled();
    await page.getByTestId('kazan-contact-request').click();
    const form = page.getByTestId('message-form');
    await expect(form.locator('textarea[name="message"]')).toHaveValue('Restoranımda food cost çox yüksəkdir');
    await page.screenshot({ path: '/private/tmp/dk-0559-mobile.png', fullPage: true });
    await form.locator('input[name="name"]').fill('Elvin');
    await form.locator('input[name="phone"]').fill('050 123 45 67');
    await form.getByRole('button', { name: 'Göndər', exact: true }).click();
    await expect(page.getByTestId('message-form-sent')).toBeVisible();
    expect(sent).toMatchObject({ source: 'kazan_page', conversationContext: [{ role: 'user', content: 'Restoranımda food cost çox yüksəkdir' }, { role: 'assistant', content: 'Əvvəlcə məhsulun maya dəyərini hesablayaq.' }] });
    await page.keyboard.press('Escape');
    await expect(page.getByTestId('kazan-contact-request')).toHaveCount(0);
    await expect(chat).toBeEnabled();
    await page.waitForTimeout(3_100); // Existing chat throttle; the next question must complete.
    await chat.fill('Marjamı necə yaxşılaşdırım?');
    await chat.locator('..').getByRole('button', { name: /Göndər/ }).click();
    await expect(page.getByText('Əvvəlcə məhsulun maya dəyərini hesablayaq.', { exact: true })).toHaveCount(2);
    await expect(page.getByTestId('kazan-contact-request')).toHaveCount(0);
  });

  test('widget: üçüncü sual əlaqə formu ilə bloklanmır', async ({ page }) => {
    test.setTimeout(120_000);
    await page.route('**/api/kazan-ai', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ message: 'Hesablamanı birlikdə davam etdirək.' }) }));
    await page.goto('/');
    await page.getByTestId('kazan-launcher').click();
    const chat = page.locator('textarea').first();
    let answers = 0;
    for (const q of ['Menyu maya dəyəri', 'Satış qiyməti necə olsun?', 'Brüt marja nədir?']) {
      await chat.fill(q);
      await chat.locator('..').getByRole('button').click();
      await expect(chat).toHaveValue('');
      await expect(page.getByText('Hesablamanı birlikdə davam etdirək.', { exact: true })).toHaveCount(++answers);
    }
    await expect(page.getByTestId('message-form')).toHaveCount(0);
    await page.getByTestId('kazan-contact-request').click();
    await expect(page.getByTestId('message-form')).toBeVisible();
    await page.screenshot({ path: '/private/tmp/dk-0559-desktop.png', fullPage: true });
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
