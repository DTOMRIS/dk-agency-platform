import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

/**
 * @smoke İnşaat checklist — TASK-0449 («Əməliyyat dizaynı» mərhələsi).
 *
 * Yoxlanır:
 *  - 4 dildə səhifə açılır, ilk mərhələ «Əməliyyat dizaynı»dır, cəmi 62 maddə
 *  - ekranda nömrə sıra ilə gedir (ilk maddə «1.», id 53 deyil)
 *  - köhnə istifadəçinin saxlanmış irəliləyişi (id 1–52) pozulmur
 *  - 390px-də üfüqi daşma yoxdur (L-045)
 */

type Messages = { toolkit: { insaatChecklist: Record<string, string> } };
const msg = (locale: string) =>
  (
    JSON.parse(
      fs.readFileSync(path.join(__dirname, '..', 'messages', `${locale}.json`), 'utf8')
    ) as Messages
  ).toolkit.insaatChecklist;

const LOCALES = [
  { locale: 'az', prefix: '' },
  { locale: 'ru', prefix: '/ru' },
  { locale: 'en', prefix: '/en' },
  { locale: 'tr', prefix: '/tr' },
];

test.describe('@smoke İnşaat checklist', () => {
  // DeviceLanguageDetector brauzer dilinə (Chromium: en-US) görə /en-ə yönləndirir — test deterministik olsun.
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => window.localStorage.setItem('dk_user_language_set', 'e2e'));
  });

  for (const { locale, prefix } of LOCALES) {
    test(`${locale}: dizayn mərhələsi birinci, 62 maddə, sıra nömrəsi`, async ({ page }) => {
      test.setTimeout(90_000);
      const m = msg(locale);
      const res = await page.goto(`${prefix}/toolkit/insaat-checklist`);
      expect(res?.status()).toBe(200);

      const phaseTitles = page.locator('h3.text-sm.font-bold');
      await expect(phaseTitles.first()).toHaveText(m.phase_design_title);
      await expect(page.getByText('0/62').first()).toBeVisible();
      await expect(page.getByText(`1. ${m.phase_design_item1_text}`)).toBeVisible();
      await expect(page.getByText(`10. ${m.phase_design_item10_text}`)).toBeVisible();
    });
  }

  test('köhnə irəliləyiş (id 1–52) qalır', async ({ page }) => {
    await page.goto('/toolkit/insaat-checklist');
    await page.evaluate(() =>
      window.localStorage.setItem('insaat-checklist-progress-v1', JSON.stringify([1, 2, 3]))
    );
    await page.reload();
    await expect(page.getByText('3/62').first()).toBeVisible();
    // «Ön hazırlıq» mərhələsində 3 maddə işarəli qalır
    await expect(page.getByText(`3/12 ${msg('az').sectionCompleted}`)).toBeVisible();
  });

  test('390px: üfüqi daşma yoxdur (L-045)', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/toolkit/insaat-checklist');
    const { sw, cw } = await page.evaluate(() => ({
      sw: document.documentElement.scrollWidth,
      cw: document.documentElement.clientWidth,
    }));
    expect(sw).toBeLessThanOrEqual(cw);
  });
});
