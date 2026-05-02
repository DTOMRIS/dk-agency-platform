/**
 * translate-content-dryrun.mjs
 *
 * DRY-RUN: DB-dən READ, 5 sample DeepSeek call, DB-yə YAZMA YOX.
 * Doğan üçün nümunə tərcümələr + stats hesabat.
 *
 * Usage:
 *   node --env-file=.env.local scripts/translate-content-dryrun.mjs
 */

import { neon } from '@neondatabase/serverless';
import { readFile } from 'fs/promises';

const DATABASE_URL = process.env.DATABASE_URL;
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

if (!DATABASE_URL) { console.error('[FATAL] DATABASE_URL not set'); process.exit(1); }
if (!DEEPSEEK_API_KEY) { console.error('[FATAL] DEEPSEEK_API_KEY not set'); process.exit(1); }

const sql = neon(DATABASE_URL);

let GLOSSARY = {};
try { GLOSSARY = JSON.parse(await readFile('translations/glossary-az-ru.json', 'utf-8')); } catch {}

const BRAND_TERMS = ['KAZAN AI', 'OCAQ', 'ŞEDD', 'SİMAT', 'Ahilik', 'DK Agency', 'HoReCa', 'AZN'];

function buildSystemPrompt(targetLang) {
  const langNames = { ru: 'Russian', en: 'English', tr: 'Turkish' };
  return `You are a senior B2B HoReCa translator.
Source: Azerbaijani Turkish.
Target: ${langNames[targetLang]}.

Rules:
- Keep brand terms UNCHANGED: ${BRAND_TERMS.join(', ')}
- Currency stays AZN
- Preserve markdown formatting (## headers, **bold**, - lists, [links](url))
- Professional B2B tone
- Industry terms: use established ${langNames[targetLang]} business terminology
- If source is empty, return empty string

${Object.keys(GLOSSARY).length > 0 ? `Glossary:\n${JSON.stringify(GLOSSARY, null, 2)}` : ''}`;
}

async function translateOnce(text, targetLang) {
  if (!text || !text.trim()) return '';
  const response = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${DEEPSEEK_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'deepseek-chat',
      temperature: 0.3,
      max_tokens: 2000,
      messages: [
        { role: 'system', content: buildSystemPrompt(targetLang) },
        { role: 'user', content: text },
      ],
    }),
  });
  if (!response.ok) throw new Error(`DeepSeek ${response.status}`);
  const data = await response.json();
  const usage = data.usage || {};
  return {
    text: data.choices?.[0]?.message?.content?.trim() || '',
    inputTokens: usage.prompt_tokens || 0,
    outputTokens: usage.completion_tokens || 0,
  };
}

// ─── STATS COLLECTION (read-only) ─────────────────────────

console.log('═══════════════════════════════════════════════');
console.log('  DK AGENCY — Content Translation DRY-RUN');
console.log('  Mode: READ-ONLY + 5 sample DeepSeek calls');
console.log('═══════════════════════════════════════════════\n');

// Helper: check which columns exist in a table
async function getColumns(tableName) {
  const cols = await sql`SELECT column_name FROM information_schema.columns WHERE table_name = ${tableName}`;
  return new Set(cols.map((c) => c.column_name));
}

// 1. blog_posts — only query existing columns
const blogCols = await getColumns('blog_posts');
const blogRows = await sql`SELECT id, slug, title_az, summary_az, content_az, title_tr, title_en FROM blog_posts`;
const blogMissing = { ru: 0, en: 0, tr: 0 };
for (const r of blogRows) {
  if (r.title_az) {
    if (!blogCols.has('title_ru')) blogMissing.ru++;
    else if (!r.title_ru) blogMissing.ru++;
    if (!r.title_en) blogMissing.en++;
    if (!r.title_tr) blogMissing.tr++;
  }
}
// If _ru column doesn't exist at all, ALL rows with title_az need it
if (!blogCols.has('title_ru')) blogMissing.ru = blogRows.filter((r) => r.title_az).length;
const blogTotalFields = (blogMissing.ru + blogMissing.en + blogMissing.tr) * 3;

// 2. news_articles
const newsCols = await getColumns('news_articles');
const newsRows = await sql`SELECT id, title_az, summary_az FROM news_articles WHERE title_az IS NOT NULL AND title_az != ''`;
const newsMissing = { ru: newsRows.length, en: newsRows.length, tr: newsRows.length };
// If columns exist, refine count
if (newsCols.has('title_ru')) {
  const newsCheck = await sql`SELECT id, title_ru, title_en, title_tr FROM news_articles WHERE title_az IS NOT NULL AND title_az != ''`;
  newsMissing.ru = newsCheck.filter((r) => !r.title_ru).length;
  newsMissing.en = newsCheck.filter((r) => !r.title_en).length;
  newsMissing.tr = newsCheck.filter((r) => !r.title_tr).length;
}
const newsTotalFields = (newsMissing.ru + newsMissing.en + newsMissing.tr) * 2;

// 3. listings
const listingCols = await getColumns('listings');
const listingRows = await sql`SELECT id, tracking_code, title FROM listings`;
const listingMissing = { ru: listingRows.length, en: listingRows.length, tr: listingRows.length };
if (listingCols.has('title_ru')) {
  const listCheck = await sql`SELECT id, title_ru, title_en, title_tr FROM listings`;
  listingMissing.ru = listCheck.filter((r) => !r.title_ru).length;
  listingMissing.en = listCheck.filter((r) => !r.title_en).length;
  listingMissing.tr = listCheck.filter((r) => !r.title_tr).length;
}
const listingTotalFields = (listingMissing.ru + listingMissing.en + listingMissing.tr) * 2;

// 4. hero_content
const heroCols = await getColumns('hero_content');
const heroRows = await sql`SELECT * FROM hero_content`;
let heroMissing = 0;
const heroFields = ['badge_text', 'title1', 'title_highlight', 'title2', 'subtitle', 'ahilik'];
for (const r of heroRows) {
  for (const f of heroFields) {
    if (r[`${f}_az`] && (!heroCols.has(`${f}_ru`) || !r[`${f}_ru`])) heroMissing++;
  }
}

// 5. guru_boxes
const guruCols = await getColumns('guru_boxes');
const guruRows = await sql`SELECT * FROM guru_boxes`;
let guruMissing = 0;
for (const r of guruRows) {
  if (r.quote_az && (!guruCols.has('quote_ru') || !r.quote_ru)) guruMissing++;
}

// 6. site_settings
const settingsCols = await getColumns('site_settings');
const settingsRows = await sql`SELECT * FROM site_settings`;
let settingsMissing = 0;
for (const r of settingsRows) {
  if (r.value_az && (!settingsCols.has('value_ru') || !r.value_ru)) settingsMissing++;
}

// 7. email_templates
const emailCols = await getColumns('email_templates');
const emailRows = await sql`SELECT * FROM email_templates`;
let emailMissing = 0;
for (const r of emailRows) {
  if (r.subject_az && (!emailCols.has('subject_ru') || !r.subject_ru)) emailMissing++;
}

// Column existence report
const migrationNeeded = !blogCols.has('title_ru');
if (migrationNeeded) {
  console.log('⚠️  MIGRATION GƏRƏK: _ru kolonlar DB-də hələ yoxdur.');
  console.log('   drizzle/0001_add_ru_locale_columns.sql əvvəl icra olunmalıdır.\n');
}

// ─── STATS REPORT ─────────────────────────────────────────
console.log('──── 1. RECORDS PER TABLE ────');
console.log(`  blog_posts:      ${blogRows.length} rows`);
console.log(`  news_articles:   ${newsRows.length} rows (with title_az)`);
console.log(`  listings:        ${listingRows.length} rows`);
console.log(`  hero_content:    ${heroRows.length} rows`);
console.log(`  guru_boxes:      ${guruRows.length} rows`);
console.log(`  site_settings:   ${settingsRows.length} rows`);
console.log(`  email_templates: ${emailRows.length} rows`);

console.log('\n──── 2. MISSING TRANSLATIONS (need filling) ────');
console.log(`  blog_posts:      RU=${blogMissing.ru}, EN=${blogMissing.en}, TR=${blogMissing.tr}  (${blogTotalFields} field calls)`);
console.log(`  news_articles:   RU=${newsMissing.ru}, EN=${newsMissing.en}, TR=${newsMissing.tr}  (${newsTotalFields} field calls)`);
console.log(`  listings:        RU=${listingMissing.ru}, EN=${listingMissing.en}, TR=${listingMissing.tr}  (${listingTotalFields} field calls)`);
console.log(`  hero_content:    ${heroMissing} _ru fields missing`);
console.log(`  guru_boxes:      ${guruMissing} _ru quotes missing`);
console.log(`  site_settings:   ${settingsMissing} _ru values missing`);
console.log(`  email_templates: ${emailMissing} _ru subjects missing`);

const totalApiCalls = blogTotalFields + newsTotalFields + listingTotalFields + heroMissing + guruMissing + settingsMissing + emailMissing;
console.log(`\n  TOTAL API CALLS NEEDED: ~${totalApiCalls}`);

// ─── 5 SAMPLE TRANSLATIONS (AZ → RU) ─────────────────────
console.log('\n──── 3. SAMPLE TRANSLATIONS (AZ → RU) ────');
console.log('  Making 5 real DeepSeek calls for review...\n');

const samples = [];

// Sample 1: Blog title
if (blogRows.length > 0 && blogRows[0].title_az) {
  samples.push({ table: 'blog_posts', field: 'title', source: blogRows[0].title_az.slice(0, 200) });
}

// Sample 2: Blog summary
if (blogRows.length > 0 && blogRows[0].summary_az) {
  samples.push({ table: 'blog_posts', field: 'summary', source: blogRows[0].summary_az.slice(0, 300) });
}

// Sample 3: News title
if (newsRows.length > 0 && newsRows[0].title_az) {
  samples.push({ table: 'news_articles', field: 'title', source: newsRows[0].title_az.slice(0, 200) });
}

// Sample 4: Listing title
if (listingRows.length > 0) {
  const src = listingRows[0].title_az || listingRows[0].title;
  if (src) samples.push({ table: 'listings', field: 'title', source: src.slice(0, 200) });
}

// Sample 5: Guru quote
if (guruRows.length > 0 && guruRows[0].quote_az) {
  samples.push({ table: 'guru_boxes', field: 'quote', source: guruRows[0].quote_az.slice(0, 200) });
}

let totalSampleInput = 0;
let totalSampleOutput = 0;

for (let i = 0; i < samples.length; i++) {
  const s = samples[i];
  console.log(`  [${i + 1}/5] ${s.table}.${s.field}`);
  console.log(`    AZ: "${s.source}"`);
  try {
    await new Promise((r) => setTimeout(r, 1500)); // rate limit
    const result = await translateOnce(s.source, 'ru');
    console.log(`    RU: "${result.text}"`);
    console.log(`    Tokens: ${result.inputTokens} in / ${result.outputTokens} out`);
    totalSampleInput += result.inputTokens;
    totalSampleOutput += result.outputTokens;
  } catch (err) {
    console.log(`    ERROR: ${err.message}`);
  }
  console.log();
}

// ─── COST ESTIMATE ────────────────────────────────────────
// Estimate based on sample token usage
const avgInputPerCall = totalSampleInput / Math.max(samples.length, 1);
const avgOutputPerCall = totalSampleOutput / Math.max(samples.length, 1);
const estTotalInput = Math.round(avgInputPerCall * totalApiCalls);
const estTotalOutput = Math.round(avgOutputPerCall * totalApiCalls);
const costInput = (estTotalInput / 1_000_000) * 0.27;
const costOutput = (estTotalOutput / 1_000_000) * 1.10;

console.log('──── 4. COST ESTIMATE (based on sample tokens) ────');
console.log(`  Avg tokens per call: ~${Math.round(avgInputPerCall)} in / ~${Math.round(avgOutputPerCall)} out`);
console.log(`  Est. total input:    ${estTotalInput.toLocaleString()} tokens`);
console.log(`  Est. total output:   ${estTotalOutput.toLocaleString()} tokens`);
console.log(`  Est. total cost:     $${(costInput + costOutput).toFixed(4)}`);

console.log('\n──── 5. ESTIMATED TIME ────');
const estTimeSeconds = Math.round(totalApiCalls * 1.5);
const estTimeMinutes = Math.round(estTimeSeconds / 60);
console.log(`  API calls: ${totalApiCalls} × 1.5s = ~${estTimeMinutes} dəqiqə`);

console.log('\n═══════════════════════════════════════════════');
console.log('  DRY-RUN TAMAMLANDI. DB-yə heç nə yazılmadı.');
console.log('  Nümunə tərcümələri yuxarıda yoxla.');
console.log('  Real run üçün: scripts/translate-content.mjs');
console.log('═══════════════════════════════════════════════');
