/**
 * Seed: 12 default kateqoriya + 67 keyword rule
 * Run: node scripts/seed-invoice-categories.mjs
 */

import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) { console.error('DATABASE_URL yoxdur'); process.exit(1); }

const sql = neon(DATABASE_URL);

const CATEGORIES = [
  { name: 'Ət və balıq məhsulları', slug: 'et-balik', color: '#DC2626', icon: 'beef', sort_order: 1 },
  { name: 'Süd və süd məhsulları', slug: 'sud', color: '#3B82F6', icon: 'milk', sort_order: 2 },
  { name: 'Meyvə və tərəvəz', slug: 'meyve-terevez', color: '#22C55E', icon: 'apple', sort_order: 3 },
  { name: 'Dənli və un məhsulları', slug: 'denli-un', color: '#F59E0B', icon: 'wheat', sort_order: 4 },
  { name: 'Yağlar', slug: 'yaglar', color: '#EAB308', icon: 'droplets', sort_order: 5 },
  { name: 'İçkilər (alkoqolsuz)', slug: 'icki-alkoqolsuz', color: '#06B6D4', icon: 'cup-soda', sort_order: 6 },
  { name: 'İçkilər (alkoqollu)', slug: 'icki-alkoqollu', color: '#8B5CF6', icon: 'wine', sort_order: 7 },
  { name: 'Baharatlar və souslar', slug: 'baharat-sous', color: '#F97316', icon: 'flame', sort_order: 8 },
  { name: 'Qablaşdırma materialları', slug: 'qablasdirma', color: '#78716C', icon: 'package', sort_order: 9 },
  { name: 'Təmizlik və gigiyena', slug: 'temizlik', color: '#14B8A6', icon: 'sparkles', sort_order: 10 },
  { name: 'İnventar və avadanlıq', slug: 'inventar', color: '#6366F1', icon: 'wrench', sort_order: 11 },
  { name: 'Sair (digər)', slug: 'sair', color: '#6B7280', icon: 'ellipsis', sort_order: 12 },
];

const RULES = [
  { keyword: 'toyuq', slug: 'et-balik' },
  { keyword: 'mal əti', slug: 'et-balik' },
  { keyword: 'dana', slug: 'et-balik' },
  { keyword: 'quzu', slug: 'et-balik' },
  { keyword: 'balıq', slug: 'et-balik' },
  { keyword: 'qoyun', slug: 'et-balik' },
  { keyword: 'kolbasa', slug: 'et-balik' },
  { keyword: 'курица', slug: 'et-balik' },
  { keyword: 'мясо', slug: 'et-balik' },
  { keyword: 'рыба', slug: 'et-balik' },
  { keyword: 'süd', slug: 'sud' },
  { keyword: 'pendir', slug: 'sud' },
  { keyword: 'kərə yağı', slug: 'sud' },
  { keyword: 'qaymaq', slug: 'sud' },
  { keyword: 'yogurt', slug: 'sud' },
  { keyword: 'молоко', slug: 'sud' },
  { keyword: 'сыр', slug: 'sud' },
  { keyword: 'kartof', slug: 'meyve-terevez' },
  { keyword: 'soğan', slug: 'meyve-terevez' },
  { keyword: 'pomidor', slug: 'meyve-terevez' },
  { keyword: 'xiyar', slug: 'meyve-terevez' },
  { keyword: 'bibər', slug: 'meyve-terevez' },
  { keyword: 'alma', slug: 'meyve-terevez' },
  { keyword: 'portağal', slug: 'meyve-terevez' },
  { keyword: 'limon', slug: 'meyve-terevez' },
  { keyword: 'göyərti', slug: 'meyve-terevez' },
  { keyword: 'badımcan', slug: 'meyve-terevez' },
  { keyword: 'un', slug: 'denli-un' },
  { keyword: 'düyü', slug: 'denli-un' },
  { keyword: 'çörək', slug: 'denli-un' },
  { keyword: 'makaron', slug: 'denli-un' },
  { keyword: 'lavash', slug: 'denli-un' },
  { keyword: 'zeytun yağı', slug: 'yaglar' },
  { keyword: 'günəbaxan yağı', slug: 'yaglar' },
  { keyword: 'bitki yağı', slug: 'yaglar' },
  { keyword: 'su', slug: 'icki-alkoqolsuz' },
  { keyword: 'cola', slug: 'icki-alkoqolsuz' },
  { keyword: 'fanta', slug: 'icki-alkoqolsuz' },
  { keyword: 'sprite', slug: 'icki-alkoqolsuz' },
  { keyword: 'çay', slug: 'icki-alkoqolsuz' },
  { keyword: 'qəhvə', slug: 'icki-alkoqolsuz' },
  { keyword: 'kompot', slug: 'icki-alkoqolsuz' },
  { keyword: 'pivə', slug: 'icki-alkoqollu' },
  { keyword: 'şərab', slug: 'icki-alkoqollu' },
  { keyword: 'vodka', slug: 'icki-alkoqollu' },
  { keyword: 'viski', slug: 'icki-alkoqollu' },
  { keyword: 'araq', slug: 'icki-alkoqollu' },
  { keyword: 'duz', slug: 'baharat-sous' },
  { keyword: 'istiot', slug: 'baharat-sous' },
  { keyword: 'zəfəran', slug: 'baharat-sous' },
  { keyword: 'ketçup', slug: 'baharat-sous' },
  { keyword: 'mayonez', slug: 'baharat-sous' },
  { keyword: 'sous', slug: 'baharat-sous' },
  { keyword: 'sirkə', slug: 'baharat-sous' },
  { keyword: 'salfetkə', slug: 'qablasdirma' },
  { keyword: 'paket', slug: 'qablasdirma' },
  { keyword: 'stəkan', slug: 'qablasdirma' },
  { keyword: 'qab', slug: 'qablasdirma' },
  { keyword: 'folqa', slug: 'qablasdirma' },
  { keyword: 'fairy', slug: 'temizlik' },
  { keyword: 'dezinfeksiya', slug: 'temizlik' },
  { keyword: 'təmizləyici', slug: 'temizlik' },
  { keyword: 'sabun', slug: 'temizlik' },
  { keyword: 'əlcək', slug: 'temizlik' },
];

async function main() {
  console.log('Kateqoriyalar insert edilir...');

  // Upsert categories
  for (const cat of CATEGORIES) {
    await sql`
      INSERT INTO invoice_categories (name, slug, color, icon, sort_order, is_active)
      VALUES (${cat.name}, ${cat.slug}, ${cat.color}, ${cat.icon}, ${cat.sort_order}, true)
      ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, color = EXCLUDED.color, icon = EXCLUDED.icon, sort_order = EXCLUDED.sort_order
    `;
  }
  console.log(`✓ ${CATEGORIES.length} kateqoriya`);

  // Get category id map
  const cats = await sql`SELECT id, slug FROM invoice_categories`;
  const slugToId = Object.fromEntries(cats.map(c => [c.slug, c.id]));

  // Insert rules
  let ruleCount = 0;
  for (const rule of RULES) {
    const catId = slugToId[rule.slug];
    if (!catId) { console.warn(`Kateqoriya tapılmadı: ${rule.slug}`); continue; }
    await sql`
      INSERT INTO invoice_category_rules (keyword, category_id, created_by, confidence)
      VALUES (${rule.keyword}, ${catId}, 'system', 1.0)
      ON CONFLICT DO NOTHING
    `;
    ruleCount++;
  }
  console.log(`✓ ${ruleCount} keyword rule`);

  // Verify
  const catCount = await sql`SELECT count(*) as c FROM invoice_categories`;
  const ruleCountDb = await sql`SELECT count(*) as c FROM invoice_category_rules`;
  console.log(`\nDB doğrulama:`);
  console.log(`  invoice_categories: ${catCount[0].c} row`);
  console.log(`  invoice_category_rules: ${ruleCountDb[0].c} row`);
  console.log('\nSeed tamamlandı!');
}

main().catch(console.error);
