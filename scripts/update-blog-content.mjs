/**
 * Update blog_posts AZ content from full markdown files.
 * Applies TQTA→DK Agency brand replacements.
 * Usage: node --env-file=.env.local scripts/update-blog-content.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

// File → slug mapping
const FILE_SLUG_MAP = {
  '01_Food_Cost_Qanli_Heqiqet.md': '1-porsiya-food-cost-hesablama',
  '02_PnL_En_Sade_Izah.md': 'pnl-oxuya-bilmirsen',
  '03_Isci_Saxlama_7_Strategiya.md': 'isci-saxlama-7-strategiya',
  '04_Menyu_Muhendisliyi.md': 'menyu-muhendisliyi-satis',
  '05_AQTA_Cerime_Tam_Checklist.md': 'aqta-cerime-checklist',
  '06_Wolt_Bolt_Yango_Komissiyon.md': 'wolt-bolt-komissiyon',
  '07_Kurumsal_Kitabca.md': 'kurumsal-kitabca-emeliyyat',
  '08_Insaatdan_Acilisa_Checklist.md': 'insaatdan-acilisa-checklist',
  '09_Restoran_Markalasma.md': 'restoran-markalasma-konsept',
  '10_Basabas_Noqtesi.md': 'basabas-noqtesi-hesablama',
};

// TQTA → DK Agency brand replacements
const BRAND_REPLACEMENTS = [
  [/TQTA Danışmanlıq/g, 'DK Agency'],
  [/TQTA danışmanlıq/g, 'DK Agency'],
  [/tqta\.az\/toolkit/g, 'dkagency.com.tr/aletler'],
  [/tqta\.az\/danismanlik/g, 'dkagency.com.tr/aletler/marketinq-ocagi'],
  [/tqta\.az\/kalkulator/g, 'dkagency.com.tr/aletler/food-cost'],
  [/tqta\.az/g, 'dkagency.com.tr'],
  [/info@tqta\.az/g, 'info@dkagency.com.tr'],
  [/TQTA/g, 'DK Agency'],
];

function applyBrandReplacements(text) {
  let result = text;
  for (const [pattern, replacement] of BRAND_REPLACEMENTS) {
    result = result.replace(pattern, replacement);
  }
  return result;
}

function extractSummary(content) {
  // Find first real paragraph after the title and category line
  const lines = content.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (trimmed.startsWith('#')) continue;
    if (trimmed.startsWith('*Kateqoriya')) continue;
    if (trimmed.startsWith('---')) continue;
    if (trimmed.startsWith('>')) continue;
    if (trimmed.length > 50) {
      // Clean markdown formatting for summary
      return trimmed.replace(/\*\*/g, '').replace(/\*/g, '').slice(0, 300);
    }
  }
  return content.slice(0, 200);
}

function extractTitle(content) {
  const match = content.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : null;
}

const contentDir = path.join(process.cwd(), 'content/blog-full');

console.log('[update-blog-content] Starting...');
console.log(`  Content dir: ${contentDir}`);
console.log(`  Files: ${Object.keys(FILE_SLUG_MAP).length}`);

let updated = 0;
let failed = 0;

for (const [filename, slug] of Object.entries(FILE_SLUG_MAP)) {
  const filePath = path.join(contentDir, filename);

  if (!fs.existsSync(filePath)) {
    console.error(`  SKIP: ${filename} not found`);
    failed++;
    continue;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  content = applyBrandReplacements(content);

  const title = extractTitle(content);
  const summary = extractSummary(content);

  console.log(`  [${slug}] title="${(title || '').slice(0, 50)}" content=${content.length} chars, summary=${summary.length} chars`);

  try {
    // Clear existing translations so they get re-translated
    await sql`UPDATE blog_posts SET
      content_az = ${content},
      summary_az = ${summary},
      title_az = COALESCE(${title}, title_az),
      content_ru = NULL,
      content_en = NULL,
      content_tr = NULL,
      summary_ru = NULL,
      summary_en = NULL,
      summary_tr = NULL,
      title_ru = NULL,
      title_en = NULL,
      title_tr = NULL,
      updated_at = NOW()
    WHERE slug = ${slug}`;

    // Verify
    const [row] = await sql`SELECT LENGTH(content_az)::int as len FROM blog_posts WHERE slug = ${slug}`;
    console.log(`    OK: DB content_az = ${row.len} chars`);
    updated++;
  } catch (e) {
    console.error(`    FAIL: ${e.message}`);
    failed++;
  }
}

console.log(`\n[update-blog-content] Done: ${updated} updated, ${failed} failed`);

// Final verification
const rows = await sql`SELECT slug, LENGTH(content_az)::int as az_len,
  content_ru IS NOT NULL as has_ru,
  content_en IS NOT NULL as has_en,
  content_tr IS NOT NULL as has_tr
FROM blog_posts ORDER BY id`;

console.log('\nFinal state:');
rows.forEach(r => {
  console.log(`  ${r.slug}: AZ=${r.az_len} RU=${r.has_ru ? 'YES' : 'CLEARED'} EN=${r.has_en ? 'YES' : 'CLEARED'} TR=${r.has_tr ? 'YES' : 'CLEARED'}`);
});
