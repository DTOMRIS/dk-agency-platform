/**
 * TASK-F28: Integrity test for sektor configs + dynamic [slug] route data.
 * Run with: npx tsx e2e/sektor-config.test.ts
 * Exits 0 on success, 1 on failure.
 *
 * Guards against the failure modes the spec calls out:
 *  - tool CTA hrefs that 404 (L-001) — every href must map to a real toolkit route
 *  - blog teaser slugs that silently render nothing — must exist in BLOG_ARTICLES
 *  - unknown slug must resolve to null (→ notFound() in the route)
 */
import { existsSync } from 'fs';
import { join } from 'path';

import { SEKTOR_CONFIGS, VALID_SEKTOR_SLUGS, getSektorConfig } from '../lib/data/sektorConfigs';
import { BLOG_ARTICLES } from '../lib/data/blogArticles';

let failures = 0;
function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    failures++;
  } else {
    console.log(`PASS: ${message}`);
  }
}

const TOOLKIT_DIR = join(process.cwd(), 'app', '[locale]', 'toolkit');
const blogSlugSet = new Set(BLOG_ARTICLES.map((a) => a.slug));

// --- SSOT shape ---
assert(VALID_SEKTOR_SLUGS.length === 4, `4 sektor slugs, got ${VALID_SEKTOR_SLUGS.length}`);
for (const slug of ['qonaq-evi', 'otel', 'restoran', 'kafe']) {
  assert(VALID_SEKTOR_SLUGS.includes(slug), `slug present: ${slug}`);
}

// --- unknown slug → null (route calls notFound()) ---
assert(getSektorConfig('bilinmeyen') === null, 'unknown slug → null');
assert(getSektorConfig('qonaq-evi') !== null, 'known slug → config');

const seenNamespaces = new Set<string>();
const seenSektorSlugs = new Set<string>();

for (const [slug, config] of Object.entries(SEKTOR_CONFIGS)) {
  assert(config.slug === slug, `${slug}: config.slug matches map key`);

  // namespace + analytics slug uniqueness
  assert(!seenNamespaces.has(config.namespace), `${slug}: unique namespace ${config.namespace}`);
  assert(
    !seenSektorSlugs.has(config.sektorSlug),
    `${slug}: unique sektorSlug ${config.sektorSlug}`
  );
  seenNamespaces.add(config.namespace);
  seenSektorSlugs.add(config.sektorSlug);

  // counts the components/i18n expect
  assert(config.tools.length === 3, `${slug}: 3 tools, got ${config.tools.length}`);
  assert(config.stats.length === 3, `${slug}: 3 stats, got ${config.stats.length}`);
  assert(config.faqItems.length === 5, `${slug}: 5 faq items, got ${config.faqItems.length}`);

  // exactly one hero tool
  const heroCount = config.tools.filter((t) => t.isHero).length;
  assert(heroCount === 1, `${slug}: exactly 1 hero tool, got ${heroCount}`);

  // every tool href → real toolkit route (no 404 — L-001)
  for (const tool of config.tools) {
    assert(tool.href.startsWith('/toolkit/'), `${slug}: tool href under /toolkit/ (${tool.href})`);
    const route = tool.href.replace('/toolkit/', '');
    assert(existsSync(join(TOOLKIT_DIR, route)), `${slug}: toolkit route exists (${route})`);
  }

  // every blog teaser slug must exist (else section renders empty)
  for (const blogSlug of config.blogSlugs) {
    assert(blogSlugSet.has(blogSlug), `${slug}: blog slug exists (${blogSlug})`);
  }
}

if (failures > 0) {
  console.error(`\n${failures} assertion(s) failed`);
  process.exit(1);
}
console.log('\nAll sektor-config integrity checks passed');
process.exit(0);
