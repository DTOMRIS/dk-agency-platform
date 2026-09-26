import { test, expect } from '@playwright/test';

/**
 * @smoke Bloq siyahıları — TASK-0456.
 * `globals.css` (PROTECTED) `.blog-content li { list-style: none }` ☐ checklist üçün yazılıb,
 * amma bütün siyahıların nöqtəsini və nömrəsini silirdi (sahibin ekran görüntüsü, 2026-09-26).
 * Yoxlanır: adi siyahı — disc, nömrəli — decimal, ☐ maddəsi — işarəsiz.
 * + 390px-də cədvəl səhifəni daşdırmır (grid elementi `min-w-0` olmadan cədvəlin enini götürürdü).
 */

const SLUG = '1-porsiya-food-cost-hesablama';

test.describe('@smoke Bloq siyahıları', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => window.localStorage.setItem('dk_user_language_set', 'e2e'));
  });

  test('adi və nömrəli siyahıda işarə var, ☐ checklist-də yoxdur', async ({ page }) => {
    test.setTimeout(90_000);
    const res = await page.goto(`/blog/${SLUG}`);
    expect(res?.status()).toBe(200);

    const styles = await page.locator('.blog-content li').evaluateAll((items) =>
      items.map((li) => ({
        parent: li.parentElement?.tagName ?? '',
        checkbox: /^\s*[☐☑✅✔]/.test(li.textContent ?? ''),
        type: getComputedStyle(li).listStyleType,
      }))
    );

    const plain = styles.filter((s) => s.parent === 'UL' && !s.checkbox);
    const numbered = styles.filter((s) => s.parent === 'OL' && !s.checkbox);
    const checklist = styles.filter((s) => s.checkbox);

    expect(plain.length).toBeGreaterThan(0);
    expect(numbered.length).toBeGreaterThan(0);
    expect(checklist.length).toBeGreaterThan(0);
    expect(new Set(plain.map((s) => s.type))).toEqual(new Set(['disc']));
    expect(new Set(numbered.map((s) => s.type))).toEqual(new Set(['decimal']));
    expect(new Set(checklist.map((s) => s.type))).toEqual(new Set(['none']));
  });

  test('390px-də cədvəlli yazı üfüqi daşmır', async ({ page }) => {
    test.setTimeout(90_000);
    await page.setViewportSize({ width: 390, height: 900 });
    const res = await page.goto(`/blog/${SLUG}`);
    expect(res?.status()).toBe(200);
    await expect(page.locator('.blog-content table').first()).toBeVisible();
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth
    );
    expect(overflow).toBeLessThanOrEqual(1);
  });
});
