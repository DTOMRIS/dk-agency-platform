#!/usr/bin/env node

/**
 * Backfill news_articles: title → title_en, then translate title_az via DeepSeek
 *
 * Usage:
 *   node --env-file=.env.local scripts/backfill-news-en-az.mjs
 *   node --env-file=.env.local scripts/backfill-news-en-az.mjs --dry-run
 */

import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL;
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DRY_RUN = process.argv.includes('--dry-run');
const BATCH_SIZE = 5;
const BATCH_DELAY_MS = 2000;

if (!DATABASE_URL) {
  console.error('DATABASE_URL not set');
  process.exit(1);
}

const sql = neon(DATABASE_URL);

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function translateWithDeepSeek(title, summary) {
  if (!DEEPSEEK_API_KEY) throw new Error('DEEPSEEK_API_KEY not set');

  const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      temperature: 0.3,
      max_tokens: 500,
      messages: [
        {
          role: 'system',
          content:
            'Professional HoReCa xəbər tərcüməçisisən. EN-dən AZ-a tərcümə et. Qısa, aydın, informativ. Cavabı yalnız JSON formatında qaytar: {"titleAz":"...","summaryAz":"..."}',
        },
        {
          role: 'user',
          content: `Title: ${title}\nSummary: ${summary || ''}`,
        },
      ],
    }),
  });

  if (!response.ok) throw new Error(`DeepSeek ${response.status}`);

  const payload = await response.json();
  const content = payload.choices?.[0]?.message?.content?.trim();
  if (!content) throw new Error('DeepSeek empty response');

  try {
    const parsed = JSON.parse(content);
    return { titleAz: parsed.titleAz || title, summaryAz: parsed.summaryAz || summary };
  } catch {
    return { titleAz: content.split('\n')[0] || title, summaryAz: summary };
  }
}

async function main() {
  console.log(`Mode: ${DRY_RUN ? 'DRY RUN' : 'LIVE'}`);

  // Step 1: Backfill title_en from title
  console.log('\n=== STEP 1: Backfill title_en ===');
  const enGaps = await sql`
    SELECT id, title, summary
    FROM news_articles
    WHERE title_en IS NULL AND title IS NOT NULL
    ORDER BY id
  `;
  console.log(`Records needing title_en: ${enGaps.length}`);

  if (!DRY_RUN && enGaps.length > 0) {
    const result = await sql`
      UPDATE news_articles
      SET title_en = title, summary_en = summary
      WHERE title_en IS NULL AND title IS NOT NULL
    `;
    console.log(`Updated: ${enGaps.length} rows`);
  }

  // Step 2: Translate to AZ
  console.log('\n=== STEP 2: Translate to AZ ===');
  const azGaps = await sql`
    SELECT id, title, summary
    FROM news_articles
    WHERE (title_az IS NULL OR TRIM(title_az) = '')
      AND title IS NOT NULL
      AND TRIM(title) != ''
    ORDER BY id
  `;
  console.log(`Records needing title_az: ${azGaps.length}`);

  if (!DEEPSEEK_API_KEY && azGaps.length > 0) {
    console.warn('DEEPSEEK_API_KEY not set — skipping AZ translation');
  } else {
    let translated = 0;
    let errors = 0;

    for (let i = 0; i < azGaps.length; i += BATCH_SIZE) {
      const batch = azGaps.slice(i, i + BATCH_SIZE);
      console.log(`\nBatch ${Math.floor(i / BATCH_SIZE) + 1}: ids ${batch.map((r) => r.id).join(', ')}`);

      for (const row of batch) {
        try {
          if (DRY_RUN) {
            console.log(`  [dry] #${row.id}: ${row.title?.slice(0, 50)}`);
            translated++;
            continue;
          }

          const result = await translateWithDeepSeek(row.title, row.summary);
          await sql`
            UPDATE news_articles
            SET title_az = ${result.titleAz},
                summary_az = ${result.summaryAz},
                status = 'translated'
            WHERE id = ${row.id}
          `;
          console.log(`  OK #${row.id}: ${result.titleAz?.slice(0, 50)}`);
          translated++;
        } catch (err) {
          console.error(`  FAIL #${row.id}: ${err.message}`);
          errors++;
        }
      }

      if (i + BATCH_SIZE < azGaps.length) {
        console.log(`  Waiting ${BATCH_DELAY_MS}ms...`);
        await sleep(BATCH_DELAY_MS);
      }
    }

    console.log(`\nTranslated: ${translated}, Errors: ${errors}`);
  }

  // Step 3: Verify
  console.log('\n=== STEP 3: Verify ===');
  const remaining = await sql`
    SELECT COUNT(*) as c FROM news_articles
    WHERE (title_az IS NULL OR TRIM(title_az) = '')
      AND title IS NOT NULL AND TRIM(title) != ''
  `;
  const enRemaining = await sql`
    SELECT COUNT(*) as c FROM news_articles WHERE title_en IS NULL AND title IS NOT NULL
  `;
  console.log(`title_en NULL: ${enRemaining[0].c}`);
  console.log(`title_az NULL: ${remaining[0].c}`);
  console.log(remaining[0].c === '0' || remaining[0].c === 0 ? 'ALL CLEAR' : 'STILL HAS GAPS');
}

main().then(() => process.exit(0)).catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
