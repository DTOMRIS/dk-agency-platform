/**
 * Update blog_posts.featured_image with local cover images.
 * Mapping follows content/blog-full/ numbering (Dogan's canonical order).
 *
 * Usage: node scripts/update-blog-covers.mjs [--dry]
 */
import { neon } from '@neondatabase/serverless';
import { readFileSync } from 'fs';

// Load .env.local manually (no dotenv dependency)
const envFile = readFileSync('.env.local', 'utf-8');
for (const line of envFile.split('\n')) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const eqIdx = trimmed.indexOf('=');
  if (eqIdx < 0) continue;
  const key = trimmed.slice(0, eqIdx).trim();
  const val = trimmed.slice(eqIdx + 1).trim();
  if (!process.env[key]) process.env[key] = val;
}

const dry = process.argv.includes('--dry');
const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) { console.error('DATABASE_URL not set'); process.exit(1); }

const sql = neon(DATABASE_URL);

// Explicit mapping: content file order → slug → image
// 01-10: from blogArticles.ts (BLOG_ARTICLES order)
// 11: restoran-acarken-sehvler (TASK-0181 added)
// 12: assigned to remaining post
const SLUG_TO_IMAGE = [
  { slug: '1-porsiya-food-cost-hesablama',  image: '/images/blog-01.png' },  // 01_Food_Cost
  { slug: 'pnl-oxuya-bilmirsen',            image: '/images/blog-02.png' },  // 02_PnL
  { slug: 'isci-saxlama-7-strategiya',       image: '/images/blog-03.png' },  // 03_Isci_Saxlama
  { slug: 'menyu-muhendisliyi-satis',        image: '/images/blog-04.png' },  // 04_Menyu
  { slug: 'aqta-cerime-checklist',           image: '/images/blog-05.png' },  // 05_AQTA
  { slug: 'wolt-bolt-komissiyon',            image: '/images/blog-06.png' },  // 06_Wolt_Bolt
  { slug: 'kurumsal-kitabca-emeliyyat',      image: '/images/blog-07.png' },  // 07_Kurumsal
  { slug: 'insaatdan-acilisa-checklist',     image: '/images/blog-08.png' },  // 08_Insaatdan
  { slug: 'restoran-markalasma-konsept',     image: '/images/blog-09.png' },  // 09_Markalasma
  { slug: 'basabas-noqtesi-hesablama',       image: '/images/blog-10.png' },  // 10_Basabas
  { slug: 'restoran-acarken-sehvler',        image: '/images/blog-11.png' },  // 11_12_Sehv
  { slug: 'pl-hesablama',                    image: '/images/blog-12.png' },  // legacy seed post
];

// Also update the older duplicate slugs with the same image as their canonical version
const EXTRA_MAPPINGS = [
  { slug: 'food-cost-hesablama', image: '/images/blog-01.png' },  // older version of food-cost
];

const ALL_MAPPINGS = [...SLUG_TO_IMAGE, ...EXTRA_MAPPINGS];

console.log(`--- ${dry ? 'DRY RUN' : 'UPDATING'} ${ALL_MAPPINGS.length} blog covers ---\n`);

let updated = 0;
let notFound = 0;

for (const { slug, image } of ALL_MAPPINGS) {
  const rows = await sql`
    SELECT id, slug, featured_image FROM blog_posts WHERE slug = ${slug}
  `;

  if (rows.length === 0) {
    console.log(`  ⚠️  ${slug} — NOT FOUND in DB`);
    notFound++;
    continue;
  }

  const post = rows[0];
  console.log(`  [id=${post.id}] ${slug}`);
  console.log(`    OLD: ${post.featured_image || '(null)'}`);
  console.log(`    NEW: ${image}`);

  if (!dry) {
    await sql`UPDATE blog_posts SET featured_image = ${image} WHERE id = ${post.id}`;
    console.log(`    ✅ UPDATED`);
    updated++;
  } else {
    console.log(`    ⏩ SKIPPED (dry run)`);
  }
}

console.log(`\nDone. ${dry ? `Re-run without --dry to apply.` : `${updated} updated, ${notFound} not found.`}`);
