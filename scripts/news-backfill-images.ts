/**
 * @file news-backfill-images.ts
 * @purpose CLI (TASK-0491): fill `image_url` for approved news that have none, from the source page's
 * og:image / twitter:image.
 *
 *   npx tsx --env-file=.env.local scripts/news-backfill-images.ts           # dry-run (default): prints only
 *   npx tsx --env-file=.env.local scripts/news-backfill-images.ts --apply   # writes image_url
 *
 * At most 40 rows per run, 8 s timeout per page, 4 pages in parallel. Only absolute http(s) image URLs;
 * images that look like a site logo / placeholder are skipped (a logo is worse than the branded fallback).
 */

import { and, desc, eq, isNull, like } from 'drizzle-orm';
import { db } from '../lib/db';
import { newsArticles } from '../lib/db/schema';

const MAX_ROWS = 40;
const TIMEOUT_MS = 8_000;
const PARALLEL = 4;
const MAX_HTML_BYTES = 600_000;
const LOGO_LIKE = /(logo|placeholder|default[-_]?(image|og|share)|favicon|no[-_]?image)/i;

const apply = process.argv.includes('--apply');

type Row = { id: number; title: string; externalUrl: string };
type Outcome = { row: Row; image: string | null; note: string };

function attr(tag: string, name: string): string | null {
  const m = tag.match(new RegExp(`\\b${name}\\s*=\\s*("([^"]*)"|'([^']*)')`, 'i'));
  return m ? (m[2] ?? m[3] ?? null) : null;
}

/** og:image (secure_url first) → twitter:image, resolved against the final page URL. */
function extractShareImage(html: string, pageUrl: string): string | null {
  const head = html.slice(0, MAX_HTML_BYTES);
  const found = new Map<string, string>();
  for (const [tag] of head.matchAll(/<meta\b[^>]*>/gi)) {
    const key = (attr(tag, 'property') ?? attr(tag, 'name') ?? '').toLowerCase().trim();
    const content = attr(tag, 'content');
    if (key && content && !found.has(key)) found.set(key, content);
  }
  const raw =
    found.get('og:image:secure_url') ??
    found.get('og:image') ??
    found.get('og:image:url') ??
    found.get('twitter:image') ??
    found.get('twitter:image:src');
  if (!raw) return null;
  try {
    const url = new URL(raw.trim().replace(/&amp;/g, '&'), pageUrl).toString();
    return /^https?:\/\//i.test(url) ? url : null;
  } catch {
    return null;
  }
}

async function probe(row: Row): Promise<Outcome> {
  try {
    const res = await fetch(row.externalUrl, {
      redirect: 'follow',
      signal: AbortSignal.timeout(TIMEOUT_MS),
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; DKAgencyNewsBot/1.0; +https://dkagency.com.tr)',
        Accept: 'text/html,application/xhtml+xml',
      },
    });
    if (!res.ok) return { row, image: null, note: `HTTP ${res.status}` };
    const html = await res.text();
    const image = extractShareImage(html, res.url || row.externalUrl);
    if (!image) return { row, image: null, note: 'no og:image' };
    if (LOGO_LIKE.test(image)) return { row, image: null, note: `logo-like, skipped: ${image}` };
    return { row, image, note: 'ok' };
  } catch (err) {
    return {
      row,
      image: null,
      note: (err instanceof Error ? err.message : String(err)).slice(0, 60),
    };
  }
}

async function main() {
  if (!db) {
    console.error('[news:backfill-images] Database not available (DATABASE_URL missing)');
    process.exit(1);
  }
  console.log(
    `[news:backfill-images] mode: ${apply ? 'APPLY (writes image_url)' : 'DRY-RUN (no writes)'}`
  );

  const rows: Row[] = await db
    .select({
      id: newsArticles.id,
      title: newsArticles.title,
      externalUrl: newsArticles.externalUrl,
    })
    .from(newsArticles)
    .where(
      and(
        eq(newsArticles.status, 'approved'),
        isNull(newsArticles.imageUrl),
        like(newsArticles.externalUrl, 'http%')
      )
    )
    .orderBy(desc(newsArticles.publishedAt))
    .limit(MAX_ROWS);
  console.log(`  candidates (approved, image_url NULL, http source): ${rows.length}`);

  const outcomes: Outcome[] = [];
  for (let i = 0; i < rows.length; i += PARALLEL) {
    outcomes.push(...(await Promise.all(rows.slice(i, i + PARALLEL).map(probe))));
  }

  let written = 0;
  for (const o of outcomes) {
    const label = `#${o.row.id} ${o.row.title.slice(0, 70)}`;
    if (!o.image) {
      console.log(`  - ${label} — ${o.note}`);
      continue;
    }
    if (apply) {
      await db
        .update(newsArticles)
        .set({ imageUrl: o.image })
        .where(and(eq(newsArticles.id, o.row.id), isNull(newsArticles.imageUrl)));
      written++;
      console.log(`  + ${label}\n      set ${o.image}`);
    } else {
      console.log(`  + ${label}\n      would set ${o.image}`);
    }
  }

  const found = outcomes.filter((o) => o.image).length;
  console.log(
    `[news:backfill-images] ${found}/${rows.length} images found${apply ? `, ${written} written` : ' (dry-run, nothing written)'}`
  );
  process.exit(0);
}

main().catch((err) => {
  console.error('[news:backfill-images] Fatal error:', err);
  process.exit(1);
});
