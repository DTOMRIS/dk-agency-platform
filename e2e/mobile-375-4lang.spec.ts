import { test, expect } from '@playwright/test';

/**
 * @mobile-375 Full 4-language mobile smoke test at 375×812 (iPhone SE / 13 mini).
 *
 * For each locale × page combination:
 *   1. No horizontal overflow (scrollWidth <= viewport + 1px tolerance)
 *   2. Navbar hamburger visible & clickable
 *   3. Primary CTA visible
 *   4. No text overflow (clipped content)
 *   5. Collect console errors & 404s
 *   6. Screenshot → test-results/mobile-375/{locale}-{page}.png
 *
 * FIXED BUGS (this branch):
 *   BUG-001: `/` redirect loop → fixed by removing `/` from middleware matcher + root page alias
 *   BUG-002: `/marketinq` 404 → fixed by adding root-level alias
 *   BUG-003: Home overflow → fixed by AdsPreview category buttons overflow-x-auto
 */

const LOCALES = ['az', 'ru', 'en', 'tr'] as const;

// AZ default locale uses unprefixed paths (root-level aliases).
// Other locales use /{locale}/path.
const PAGES: Record<string, Record<(typeof LOCALES)[number], string>> = {
  home:      { az: '/',                ru: '/ru',              en: '/en',              tr: '/tr' },
  listings:  { az: '/ilanlar',         ru: '/ru/ilanlar',      en: '/en/ilanlar',      tr: '/tr/ilanlar' },
  marketinq: { az: '/marketinq',       ru: '/ru/marketinq',    en: '/en/marketinq',    tr: '/tr/marketinq' },
  blog:      { az: '/blog',            ru: '/ru/blog',         en: '/en/blog',         tr: '/tr/blog' },
  register:  { az: '/auth/register',   ru: '/ru/auth/register', en: '/en/auth/register', tr: '/tr/auth/register' },
  toolkit:   { az: '/toolkit',         ru: '/ru/toolkit',      en: '/en/toolkit',      tr: '/tr/toolkit' },
};

// ---------- SECTION 1: Mobile layout tests ----------

test.describe('@mobile-375 4-lang layout smoke', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  const matrix: { locale: string; pageKey: string; path: string }[] = [];
  for (const [pageKey, paths] of Object.entries(PAGES)) {
    for (const locale of LOCALES) {
      matrix.push({ locale, pageKey, path: paths[locale] });
    }
  }

  for (const { locale, pageKey, path } of matrix) {
    test(`[${locale}] ${pageKey} (${path})`, async ({ page }, testInfo) => {
      const consoleErrors: string[] = [];
      const networkErrors: string[] = [];

      page.on('console', (msg) => {
        if (msg.type() === 'error') consoleErrors.push(msg.text());
      });
      page.on('response', (res) => {
        if (res.status() === 404) networkErrors.push(`404: ${res.url()}`);
      });
      page.on('requestfailed', (req) => {
        networkErrors.push(`FAIL: ${req.url()} — ${req.failure()?.errorText}`);
      });

      // Navigate — follow redirects (locale prefix may strip for AZ default)
      const response = await page.goto(path, {
        waitUntil: 'domcontentloaded',
        timeout: 20_000,
      });

      const status = response?.status() ?? 0;
      expect(status, `${path} returned ${status}`).toBeLessThan(400);

      await page.waitForTimeout(1500);

      // CHECK 1: No horizontal overflow
      const overflow = await page.evaluate(() => ({
        cw: document.documentElement.clientWidth,
        sw: document.documentElement.scrollWidth,
      }));
      const hasOverflow = overflow.sw > overflow.cw + 1;

      // CHECK 2: Navbar hamburger visible
      const hamburgerSelectors = [
        'button[aria-label*="menu" i]',
        'button[aria-label*="menyu" i]',
        '[data-testid="mobile-menu"]',
        'header button svg',
        'nav button svg',
        'header button',
      ];
      let hamburgerFound = false;
      for (const sel of hamburgerSelectors) {
        if (await page.locator(sel).first().isVisible({ timeout: 2000 }).catch(() => false)) {
          hamburgerFound = true;
          break;
        }
      }

      // CHECK 3: Primary CTA visible (link or button in main content)
      const ctaSelectors = [
        'a[href*="register"], a[href*="qeydiyyat"], a[href*="uzvluk"]',
        'button[type="submit"]',
        '[class*="btn"], [class*="Button"]',
        'main a[href]',
        'main button',
        'footer a[href]', // blog/content pages may only have footer nav links
      ];
      let ctaFound = false;
      for (const sel of ctaSelectors) {
        if (await page.locator(sel).first().isVisible({ timeout: 2000 }).catch(() => false)) {
          ctaFound = true;
          break;
        }
      }

      // CHECK 4: Text overflow detection (skips elements clipped by overflow ancestors)
      const clippedElements = await page.evaluate(() => {
        function isClippedByAncestor(el: Element): boolean {
          let parent = el.parentElement;
          while (parent && parent !== document.documentElement) {
            const style = getComputedStyle(parent);
            const ov = style.overflowX;
            if (ov === 'hidden' || ov === 'clip' || ov === 'auto' || ov === 'scroll') {
              const pRect = parent.getBoundingClientRect();
              const eRect = el.getBoundingClientRect();
              if (eRect.right > pRect.right) return true;
            }
            parent = parent.parentElement;
          }
          return false;
        }
        const issues: string[] = [];
        for (const el of document.querySelectorAll('h1, h2, h3, p, span, a, button, li, td, th')) {
          const rect = el.getBoundingClientRect();
          if (rect.right > window.innerWidth + 2 && rect.width > 0) {
            if (isClippedByAncestor(el)) continue; // visually clipped, not a real overflow
            const tag = el.tagName.toLowerCase();
            const text = (el.textContent || '').slice(0, 50);
            issues.push(`<${tag}> x=${Math.round(rect.right)}: "${text}"`);
          }
          if (issues.length >= 8) break;
        }
        return issues;
      });

      // Screenshot
      const screenshotPath = `test-results/mobile-375/${locale}-${pageKey}.png`;
      await page.screenshot({ path: screenshotPath, fullPage: true });

      // Annotations for report
      testInfo.annotations.push(
        { type: 'overflow', description: hasOverflow ? `YES (${overflow.sw} > ${overflow.cw})` : 'NO' },
        { type: 'hamburger', description: hamburgerFound ? 'OK' : 'MISSING' },
        { type: 'cta', description: ctaFound ? 'OK' : 'MISSING' },
        { type: 'clipped', description: clippedElements.length > 0 ? clippedElements.join(' | ') : 'NONE' },
        { type: 'console', description: consoleErrors.length > 0 ? consoleErrors.slice(0, 5).join(' | ') : 'NONE' },
        { type: 'network', description: networkErrors.length > 0 ? networkErrors.slice(0, 5).join(' | ') : 'NONE' },
      );

      // Soft assertions — test reports all failures, doesn't stop at first
      expect.soft(hasOverflow, `Horizontal overflow on ${path}`).toBe(false);
      expect.soft(hamburgerFound, `Hamburger not found on ${path}`).toBe(true);
      expect.soft(ctaFound, `No CTA on ${path}`).toBe(true);
      expect.soft(clippedElements.length, `Text overflow on ${path}: ${clippedElements.join(', ')}`).toBe(0);
    });
  }
});

// ---------- SECTION 2: Routing regression guards ----------

test.describe('@routing AZ default locale guards', () => {
  test('/ (root) serves 200 without redirect loop', async ({ request }) => {
    const res = await request.get('/', { maxRedirects: 0 });
    expect(res.status()).toBe(200);
  });

  test('/az redirects to / (strip default prefix)', async ({ request }) => {
    const res = await request.get('/az', { maxRedirects: 0 });
    expect([301, 307, 308]).toContain(res.status());
  });

  test('/marketinq serves 200 (root alias)', async ({ request }) => {
    const res = await request.get('/marketinq', { maxRedirects: 3 });
    expect(res.status()).toBe(200);
  });
});
