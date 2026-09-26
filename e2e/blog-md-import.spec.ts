import { test, expect, type BrowserContext, type Page } from '@playwright/test';
import jwt from 'jsonwebtoken';

/**
 * @smoke Bloq redaktoru — «Markdown faylı yüklə» (TASK-0454).
 * Canlıda göstərilmiş (render olunmuş) mətn yapışdırılanda ##, cədvəl, sitat itirdi.
 * Yoxlanır: fayl seçiləndə meta sahələri dolur, markdown formatı olduğu kimi qalır,
 * H1 və «*Kateqoriya: …*» sətri mətndən çıxır, mövcud mətn təsdiqsiz əvəzlənmir.
 *
 * Auth: dashboard-smoke kimi `JWT_SECRET` env (yoxdursa SKIP).
 */

const SECRET = process.env.JWT_SECRET;

const ARTICLE = [
  '```',
  'Başlıq: Mətbəxdə Hər Gün İtirilən Metrlər: Spagetti Diaqramı ilə Addım Xəritəsi',
  'SEO başlıq: Spagetti Diaqramı: Mətbəxdə İtirilən Addımları Tap',
  'Slug: metbexde-itirilen-metrler-spagetti-diaqrami',
  'Kateqoriya: ⚙️ Əməliyyat',
  'Oxu müddəti: 9–11 dəq',
  'Müəllif: Doğan Tomris',
  'Meta təsvir: Spagetti diaqramı ilə mətbəxdə boş addımları tapmağın 5 addımlıq üsulu.',
  '```',
  '',
  '# Mətbəxdə Hər Gün İtirilən Metrlər: Spagetti Diaqramı ilə Addım Xəritəsi',
  '',
  '*Kateqoriya: ⚙️ Əməliyyat | Oxu müddəti: 9–11 dəq*',
  '',
  '---',
  '',
  'Pik saatdır. Mətbəxə baxırsan.',
  '',
  '## Addım 1: Planı çək',
  '',
  '| Vəzifə | Gediş |',
  '|---|---|',
  '| Salat | 40 |',
  '',
  '> **Doğan Notu:** əvvəl ölç.',
  '',
].join('\n');

const SECOND = ['# İkinci yazı', '', '## Yeni bölmə', '', 'Mətn.'].join('\n');

async function signIn(context: BrowserContext, baseURL: string) {
  const token = jwt.sign(
    { userId: 1, email: 'smoke@dkagency.com.tr', role: 'admin' },
    SECRET as string,
    { expiresIn: '1h' }
  );
  const { hostname } = new URL(baseURL);
  await context.addCookies([
    { name: 'dk_auth_token', value: token, domain: hostname, path: '/' },
    { name: 'NEXT_LOCALE', value: 'az', domain: hostname, path: '/' },
  ]);
}

async function upload(page: Page, name: string, text: string) {
  await page.getByTestId('blog-md-import-input').setInputFiles({
    name,
    mimeType: 'text/markdown',
    buffer: Buffer.from(text, 'utf8'),
  });
}

test.describe('@smoke Bloq Markdown idxalı', () => {
  test.skip(!SECRET, 'JWT_SECRET env yoxdur — atlandı');

  test.beforeEach(async ({ context, baseURL, page }) => {
    await signIn(context, baseURL as string);
    await page.addInitScript(() => window.localStorage.setItem('dk_user_language_set', 'e2e'));
  });

  test('fayl sahələri doldurur, format qalır, təsdiqsiz əvəzləmə yoxdur', async ({ page }) => {
    test.setTimeout(90_000);
    const res = await page.goto('/dashboard/blog/new');
    expect(res?.status()).toBe(200);

    const content = page.locator('#blog-content-textarea');
    // Hidratasiyadan əvvəl seçilən fayl itə bilər (L-053) — nəticə görünənə qədər təkrarla
    await expect(async () => {
      await upload(page, 'spagetti.md', ARTICLE);
      await expect(page.getByTestId('blog-md-import-msg')).toContainText('spagetti.md', {
        timeout: 2_000,
      });
    }).toPass({ timeout: 30_000 });

    await expect(page.locator('label:has-text("Başlıq (AZ)") + input')).toHaveValue(
      'Mətbəxdə Hər Gün İtirilən Metrlər: Spagetti Diaqramı ilə Addım Xəritəsi'
    );
    await expect(page.locator('label:text-is("Slug") + input')).toHaveValue(
      'metbexde-itirilen-metrler-spagetti-diaqrami'
    );
    await expect(page.locator('label:text-is("Kateqoriya") + select')).toHaveValue('Əməliyyat');
    await expect(page.locator('label:text-is("Müəllif") + select')).toHaveValue('Doğan Tomris');
    await expect(page.locator('label:has-text("SEO title") + input')).toHaveValue(
      'Spagetti Diaqramı: Mətbəxdə İtirilən Addımları Tap'
    );

    const text = await content.inputValue();
    expect(text.startsWith('Pik saatdır.')).toBe(true);
    expect(text).toContain('## Addım 1: Planı çək');
    expect(text).toContain('| Salat | 40 |');
    expect(text).toContain('> **Doğan Notu:**');
    expect(text).not.toContain('# Mətbəxdə');
    expect(text).not.toContain('Kateqoriya:');

    // Mətn var → təsdiq soruşulur; «Ləğv» mətni saxlayır
    page.once('dialog', (d) => void d.dismiss());
    await upload(page, 'ikinci.md', SECOND);
    await expect(content).toHaveValue(text);

    // «OK» → əvəzlənir, yeni yazıda slug başlıqdan yaranır
    page.once('dialog', (d) => void d.accept());
    await upload(page, 'ikinci.md', SECOND);
    await expect(content).toHaveValue('## Yeni bölmə\n\nMətn.');
    await expect(page.locator('label:text-is("Slug") + input')).toHaveValue(
      'ikinci-yazi'
    );
  });
});
