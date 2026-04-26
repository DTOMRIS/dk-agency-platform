/**
 * translate-content.mjs
 *
 * Bulk content translation for DK Agency platform.
 * Translates AZ source text to RU, EN, TR using DeepSeek API.
 *
 * Usage:
 *   node --env-file=.env.local scripts/translate-content.mjs [flags]
 *
 * Flags:
 *   --dry-run          Log what would be translated, no DB write
 *   --table=blog_posts Only translate a specific table
 *   --locale=ru        Only translate to a specific locale
 *   --limit=5          Process at most N rows per table
 *
 * Env:
 *   DATABASE_URL       Neon PostgreSQL connection string
 *   DEEPSEEK_API_KEY   DeepSeek API key
 */

import { readFile } from 'fs/promises';
import { neon } from '@neondatabase/serverless';

// ─── CLI flags ────────────────────────────────────────────
const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const TABLE_FILTER = args.find((a) => a.startsWith('--table='))?.split('=')[1] || null;
const LOCALE_FILTER = args.find((a) => a.startsWith('--locale='))?.split('=')[1] || null;
const ROW_LIMIT = parseInt(args.find((a) => a.startsWith('--limit='))?.split('=')[1] || '1000', 10);

// ─── Env check ────────────────────────────────────────────
const DATABASE_URL = process.env.DATABASE_URL;
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

if (!DATABASE_URL) { console.error('[FATAL] DATABASE_URL not set'); process.exit(1); }
if (!DEEPSEEK_API_KEY && !DRY_RUN) { console.error('[FATAL] DEEPSEEK_API_KEY not set (use --dry-run for testing)'); process.exit(1); }

const sql = neon(DATABASE_URL);

// ─── Glossary ─────────────────────────────────────────────
let GLOSSARY = {};
try {
  GLOSSARY = JSON.parse(await readFile('translations/glossary-az-ru.json', 'utf-8'));
} catch { /* glossary optional */ }

const BRAND_TERMS = ['KAZAN AI', 'OCAQ', 'ŞEDD', 'SİMAT', 'Ahilik', 'DK Agency', 'HoReCa', 'AZN'];

// ─── Target languages ────────────────────────────────────
const ALL_LOCALES = ['ru', 'en', 'tr'];
const TARGET_LOCALES = LOCALE_FILTER ? [LOCALE_FILTER] : ALL_LOCALES;

const LANG_NAMES = { ru: 'Russian', en: 'English', tr: 'Turkish' };

// ─── DeepSeek translation ─────────────────────────────────
function buildSystemPrompt(targetLang) {
  return `You are a senior B2B HoReCa translator.
Source: Azerbaijani Turkish.
Target: ${LANG_NAMES[targetLang] || targetLang}.

Rules:
- Keep brand terms UNCHANGED: ${BRAND_TERMS.join(', ')}
- Currency stays AZN (not рубль, not manat — just AZN)
- Preserve markdown formatting (## headers, **bold**, - lists, [links](url))
- Professional B2B tone, NOT casual, NOT machine-translated
- Industry terms: use established ${LANG_NAMES[targetLang]} business terminology
- Numbers/dates: use ${LANG_NAMES[targetLang]} conventions
- If source is empty or only whitespace, return empty string

${Object.keys(GLOSSARY).length > 0 ? `Glossary (use these exactly):\n${JSON.stringify(GLOSSARY, null, 2)}` : ''}`;
}

async function translateText(text, targetLang) {
  if (!text || !text.trim()) return '';

  // Check glossary for exact match
  if (GLOSSARY[text]) return GLOSSARY[text];

  const response = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      temperature: 0.3,
      max_tokens: 4000,
      messages: [
        { role: 'system', content: buildSystemPrompt(targetLang) },
        { role: 'user', content: text },
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`DeepSeek ${response.status}: ${err.slice(0, 200)}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content?.trim() || '';
}

// ─── Rate limiter ─────────────────────────────────────────
const RATE_MS = 1500;
let lastCallAt = 0;

async function rateLimitedTranslate(text, targetLang) {
  const now = Date.now();
  const wait = RATE_MS - (now - lastCallAt);
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
  lastCallAt = Date.now();
  return translateText(text, targetLang);
}

// ─── Stats ────────────────────────────────────────────────
const stats = { translated: 0, skipped: 0, failed: 0, inputTokensEst: 0, outputTokensEst: 0 };

function estimateTokens(text) {
  return Math.ceil((text || '').length / 4);
}

// ─── Table processors ─────────────────────────────────────

async function processBlogPosts() {
  console.log('\n═══ blog_posts ═══');
  const rows = await sql`SELECT id, slug, title_az, summary_az, content_az, title_ru, title_en, title_tr FROM blog_posts LIMIT ${ROW_LIMIT}`;
  console.log(`  Found ${rows.length} rows`);

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (!row.title_az) { stats.skipped++; continue; }

    for (const locale of TARGET_LOCALES) {
      const titleCol = `title_${locale}`;
      const summaryCol = `summary_${locale}`;
      const contentCol = `content_${locale}`;

      // Skip if already translated
      if (row[titleCol]) { stats.skipped++; continue; }

      console.log(`  [${i + 1}/${rows.length}] blog #${row.id} "${row.slug}" → ${locale}`);

      if (DRY_RUN) {
        console.log(`    DRY-RUN: would translate title (${row.title_az.length} chars), summary, content`);
        stats.skipped++;
        continue;
      }

      try {
        const titleTranslated = await rateLimitedTranslate(row.title_az, locale);
        const summaryTranslated = row.summary_az ? await rateLimitedTranslate(row.summary_az, locale) : null;
        const contentTranslated = row.content_az ? await rateLimitedTranslate(row.content_az, locale) : null;

        stats.inputTokensEst += estimateTokens(row.title_az) + estimateTokens(row.summary_az) + estimateTokens(row.content_az);
        stats.outputTokensEst += estimateTokens(titleTranslated) + estimateTokens(summaryTranslated) + estimateTokens(contentTranslated);

        await sql.query(
          `UPDATE blog_posts SET ${titleCol} = $1, ${summaryCol} = $2, ${contentCol} = $3 WHERE id = $4`,
          [titleTranslated, summaryTranslated, contentTranslated, row.id]
        );

        stats.translated++;
        console.log(`    OK: title="${titleTranslated.slice(0, 50)}..."`);
      } catch (err) {
        stats.failed++;
        console.error(`    FAIL: ${err.message}`);
      }
    }

    if ((i + 1) % 5 === 0) console.log(`  ... ${i + 1}/${rows.length} processed`);
  }
}

async function processNewsArticles() {
  console.log('\n═══ news_articles ═══');
  const rows = await sql`SELECT id, slug, title_az, summary_az, title_ru, title_en, title_tr FROM news_articles WHERE title_az IS NOT NULL AND title_az != '' LIMIT ${ROW_LIMIT}`;
  console.log(`  Found ${rows.length} rows with title_az`);

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];

    for (const locale of TARGET_LOCALES) {
      const titleCol = `title_${locale}`;
      const summaryCol = `summary_${locale}`;

      if (row[titleCol]) { stats.skipped++; continue; }

      console.log(`  [${i + 1}/${rows.length}] news #${row.id} → ${locale}`);

      if (DRY_RUN) {
        console.log(`    DRY-RUN: would translate title + summary`);
        stats.skipped++;
        continue;
      }

      try {
        const titleTranslated = await rateLimitedTranslate(row.title_az, locale);
        const summaryTranslated = row.summary_az ? await rateLimitedTranslate(row.summary_az, locale) : null;

        stats.inputTokensEst += estimateTokens(row.title_az) + estimateTokens(row.summary_az);
        stats.outputTokensEst += estimateTokens(titleTranslated) + estimateTokens(summaryTranslated);

        await sql.query(
          `UPDATE news_articles SET ${titleCol} = $1, ${summaryCol} = $2 WHERE id = $3`,
          [titleTranslated, summaryTranslated, row.id]
        );

        stats.translated++;
        console.log(`    OK: "${titleTranslated.slice(0, 50)}..."`);
      } catch (err) {
        stats.failed++;
        console.error(`    FAIL: ${err.message}`);
      }
    }

    if ((i + 1) % 5 === 0) console.log(`  ... ${i + 1}/${rows.length} processed`);
  }
}

async function processListings() {
  console.log('\n═══ listings ═══');
  const rows = await sql`SELECT id, tracking_code, title, description, title_az, title_ru, title_en, title_tr FROM listings LIMIT ${ROW_LIMIT}`;
  console.log(`  Found ${rows.length} rows`);

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const sourceTitle = row.title_az || row.title;
    const sourceDesc = row.description_az || row.description;
    if (!sourceTitle) { stats.skipped++; continue; }

    for (const locale of TARGET_LOCALES) {
      const titleCol = `title_${locale}`;
      const descCol = `description_${locale}`;

      if (row[titleCol]) { stats.skipped++; continue; }

      console.log(`  [${i + 1}/${rows.length}] listing #${row.id} (${row.tracking_code}) → ${locale}`);

      if (DRY_RUN) {
        console.log(`    DRY-RUN: would translate title + description`);
        stats.skipped++;
        continue;
      }

      try {
        const titleTranslated = await rateLimitedTranslate(sourceTitle, locale);
        const descTranslated = sourceDesc ? await rateLimitedTranslate(sourceDesc, locale) : null;

        stats.inputTokensEst += estimateTokens(sourceTitle) + estimateTokens(sourceDesc);
        stats.outputTokensEst += estimateTokens(titleTranslated) + estimateTokens(descTranslated);

        await sql.query(
          `UPDATE listings SET ${titleCol} = $1, ${descCol} = $2 WHERE id = $3`,
          [titleTranslated, descTranslated, row.id]
        );

        stats.translated++;
        console.log(`    OK: "${titleTranslated.slice(0, 50)}..."`);
      } catch (err) {
        stats.failed++;
        console.error(`    FAIL: ${err.message}`);
      }
    }

    if ((i + 1) % 5 === 0) console.log(`  ... ${i + 1}/${rows.length} processed`);
  }
}

async function processHeroContent() {
  console.log('\n═══ hero_content ═══');
  const rows = await sql`SELECT * FROM hero_content LIMIT ${ROW_LIMIT}`;
  console.log(`  Found ${rows.length} rows`);

  const fields = ['badge_text', 'title1', 'title_highlight', 'title2', 'subtitle', 'ahilik', 'stat1_label', 'stat2_label', 'stat3_label'];

  for (const row of rows) {
    for (const locale of TARGET_LOCALES) {
      for (const field of fields) {
        const srcCol = `${field}_az`;
        const dstCol = `${field}_${locale}`;
        if (!row[srcCol] || row[dstCol]) continue;

        console.log(`  hero #${row.id} ${field} → ${locale}`);

        if (DRY_RUN) { stats.skipped++; continue; }

        try {
          const translated = await rateLimitedTranslate(row[srcCol], locale);
          stats.inputTokensEst += estimateTokens(row[srcCol]);
          stats.outputTokensEst += estimateTokens(translated);
          await sql.query(`UPDATE hero_content SET ${dstCol} = $1 WHERE id = $2`, [translated, row.id]);
          stats.translated++;
        } catch (err) {
          stats.failed++;
          console.error(`    FAIL: ${err.message}`);
        }
      }
    }
  }
}

async function processGuruBoxes() {
  console.log('\n═══ guru_boxes ═══');
  const rows = await sql`SELECT * FROM guru_boxes LIMIT ${ROW_LIMIT}`;
  console.log(`  Found ${rows.length} rows`);

  for (const row of rows) {
    for (const locale of TARGET_LOCALES) {
      const quoteCol = `quote_${locale}`;
      if (!row.quote_az || row[quoteCol]) continue;

      console.log(`  guru #${row.id} (${row.guru_name}) → ${locale}`);

      if (DRY_RUN) { stats.skipped++; continue; }

      try {
        const translated = await rateLimitedTranslate(row.quote_az, locale);
        stats.inputTokensEst += estimateTokens(row.quote_az);
        stats.outputTokensEst += estimateTokens(translated);
        await sql.query(`UPDATE guru_boxes SET ${quoteCol} = $1 WHERE id = $2`, [translated, row.id]);
        stats.translated++;
      } catch (err) {
        stats.failed++;
        console.error(`    FAIL: ${err.message}`);
      }
    }
  }
}

async function processSiteSettings() {
  console.log('\n═══ site_settings ═══');
  const rows = await sql`SELECT * FROM site_settings LIMIT ${ROW_LIMIT}`;
  console.log(`  Found ${rows.length} rows`);

  for (const row of rows) {
    for (const locale of TARGET_LOCALES) {
      const dstCol = `value_${locale}`;
      if (!row.value_az || row[dstCol]) continue;

      console.log(`  setting "${row.key}" → ${locale}`);

      if (DRY_RUN) { stats.skipped++; continue; }

      try {
        const translated = await rateLimitedTranslate(row.value_az, locale);
        stats.inputTokensEst += estimateTokens(row.value_az);
        stats.outputTokensEst += estimateTokens(translated);
        await sql.query(`UPDATE site_settings SET ${dstCol} = $1 WHERE key = $2`, [translated, row.key]);
        stats.translated++;
      } catch (err) {
        stats.failed++;
        console.error(`    FAIL: ${err.message}`);
      }
    }
  }
}

async function processEmailTemplates() {
  console.log('\n═══ email_templates ═══');
  const rows = await sql`SELECT * FROM email_templates LIMIT ${ROW_LIMIT}`;
  console.log(`  Found ${rows.length} rows`);

  for (const row of rows) {
    for (const locale of TARGET_LOCALES) {
      if (locale !== 'ru') continue; // EN/TR already have columns, only fill RU

      if (!row.subject_az || row.subject_ru) continue;

      console.log(`  template "${row.template_key}" → ru`);

      if (DRY_RUN) { stats.skipped++; continue; }

      try {
        const subjectTranslated = await rateLimitedTranslate(row.subject_az, 'ru');
        const bodyTranslated = row.body_az ? await rateLimitedTranslate(row.body_az, 'ru') : null;
        const previewTranslated = row.preview_az ? await rateLimitedTranslate(row.preview_az, 'ru') : null;

        stats.inputTokensEst += estimateTokens(row.subject_az) + estimateTokens(row.body_az) + estimateTokens(row.preview_az);
        stats.outputTokensEst += estimateTokens(subjectTranslated) + estimateTokens(bodyTranslated) + estimateTokens(previewTranslated);

        await sql.query(
          `UPDATE email_templates SET subject_ru = $1, body_ru = $2, preview_ru = $3 WHERE id = $4`,
          [subjectTranslated, bodyTranslated, previewTranslated, row.id]
        );

        stats.translated++;
      } catch (err) {
        stats.failed++;
        console.error(`    FAIL: ${err.message}`);
      }
    }
  }
}

// ─── Main ─────────────────────────────────────────────────
const TABLE_MAP = {
  blog_posts: processBlogPosts,
  news_articles: processNewsArticles,
  listings: processListings,
  hero_content: processHeroContent,
  guru_boxes: processGuruBoxes,
  site_settings: processSiteSettings,
  email_templates: processEmailTemplates,
};

console.log('[translate-content] Starting...');
console.log(`  Mode: ${DRY_RUN ? 'DRY-RUN (no DB writes)' : 'LIVE'}`);
console.log(`  Tables: ${TABLE_FILTER || 'ALL'}`);
console.log(`  Locales: ${TARGET_LOCALES.join(', ')}`);
console.log(`  Row limit: ${ROW_LIMIT}`);

const tablesToProcess = TABLE_FILTER ? { [TABLE_FILTER]: TABLE_MAP[TABLE_FILTER] } : TABLE_MAP;

if (TABLE_FILTER && !TABLE_MAP[TABLE_FILTER]) {
  console.error(`[FATAL] Unknown table: ${TABLE_FILTER}`);
  console.error(`  Available: ${Object.keys(TABLE_MAP).join(', ')}`);
  process.exit(1);
}

for (const [name, processor] of Object.entries(tablesToProcess)) {
  await processor();
}

// ─── Summary ──────────────────────────────────────────────
const inputCost = (stats.inputTokensEst / 1_000_000) * 0.27;
const outputCost = (stats.outputTokensEst / 1_000_000) * 1.10;

console.log('\n═══ SUMMARY ═══');
console.log(`  Translated: ${stats.translated}`);
console.log(`  Skipped:    ${stats.skipped} (already translated or dry-run)`);
console.log(`  Failed:     ${stats.failed}`);
console.log(`  Est. input tokens:  ${stats.inputTokensEst.toLocaleString()}`);
console.log(`  Est. output tokens: ${stats.outputTokensEst.toLocaleString()}`);
console.log(`  Est. cost:          $${(inputCost + outputCost).toFixed(4)} (DeepSeek V4)`);
console.log(`  Mode: ${DRY_RUN ? 'DRY-RUN — nothing written' : 'LIVE — data written to DB'}`);
