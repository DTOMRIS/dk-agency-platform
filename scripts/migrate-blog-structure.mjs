/**
 * migrate-blog-structure.mjs
 *
 * Ends the dual content model: OLD blogs embed guru boxes (╔═╗ ASCII) and the
 * Doğan note inside content_az markdown; NEW blogs store them as structured DB
 * fields (guru_boxes rows + dogan_note column). This migration parses the old
 * markdown, writes the structured fields, and STRIPS the embedded blocks from
 * content_az so the post renders through the single structured path (no dup).
 *
 * Safe by design:
 *   - DRY-RUN by default (prints what it would do, writes nothing).
 *   - Idempotent: skips guru extraction if the post already has guru_boxes rows;
 *     skips dogan extraction if dogan_note is already set.
 *   - Only touches content_az (the AZ source). Re-run translation afterwards.
 *
 * Usage:
 *   node --env-file=.env.local scripts/migrate-blog-structure.mjs          # dry-run
 *   node --env-file=.env.local scripts/migrate-blog-structure.mjs --apply  # write
 *
 * Env: DATABASE_URL (Neon)
 */

import { neon } from '@neondatabase/serverless';

const APPLY = process.argv.includes('--apply');
const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('[FATAL] DATABASE_URL not set');
  process.exit(1);
}
const sql = neon(DATABASE_URL);

// ─── Parsers (mirror components/blog/MarkdownRenderer.tsx) ──────────────

// A guru block: blockquote with ╔ … ╚ ASCII art.
const GURU_BLOCK = />\s*╔[═╗\n>║\s\S]*?╚[═╝]+/g;

function parseGuruBlock(block) {
  const lines = block
    .split('\n')
    .map((l) => l.replace(/^>\s*/, '').replace(/[╔╗╚╝║═]/g, '').trim())
    .filter(Boolean);

  let name = '';
  let quote = '';
  let source = '';

  for (const line of lines) {
    if (line.includes('🎤') || (line.startsWith('**') && !quote)) {
      name = line.replace(/🎤\s*/, '').replace(/\*\*/g, '').trim();
    } else if (line.startsWith('*"') || line.startsWith('"') || (line.startsWith('*') && line.endsWith('*'))) {
      quote += ' ' + line.replace(/^\*["']?|["']?\*$/g, '').replace(/^["']|["']$/g, '');
    } else if (line.includes('📖')) {
      source = line.replace('📖', '').replace('Mənbə:', '').trim();
    }
  }
  if (name && quote.trim()) {
    return { name, quote: quote.trim(), source };
  }
  return null;
}

// A Doğan-note blockquote: consecutive `>` lines containing 📝 and DOĞAN/NOTU.
function extractDoganNote(content) {
  const lines = content.split('\n');
  let start = -1;
  let end = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim().startsWith('>')) {
      const probe = lines[i].toLowerCase();
      if (probe.includes('📝') && (probe.includes('doğan') || probe.includes('notu'))) {
        // walk back/forward over the contiguous blockquote
        start = i;
        while (start > 0 && lines[start - 1].trim().startsWith('>')) start -= 1;
        end = i;
        while (end < lines.length - 1 && lines[end + 1].trim().startsWith('>')) end += 1;
        break;
      }
    }
  }
  if (start === -1) return null;

  const raw = lines.slice(start, end + 1).join('\n');
  const text = lines
    .slice(start, end + 1)
    .map((l) => l.replace(/^>\s*/, ''))
    .join('\n')
    .replace(/📝/g, '')
    .replace(/\*\*DOĞAN NOTU:\*\*/i, '')
    .replace(/DOĞAN NOTU:/i, '')
    .replace(/—\s*Doğan Tomris/i, '')
    .replace(/["“”]/g, '')
    .trim();

  return { raw, text };
}

// ─── Main ──────────────────────────────────────────────────────────────

const stats = { posts: 0, guruInserted: 0, doganSet: 0, contentStripped: 0, skipped: 0 };

const rows = await sql`SELECT id, slug, content_az, dogan_note FROM blog_posts ORDER BY id`;
console.log(`[migrate] ${rows.length} blog posts · mode: ${APPLY ? 'APPLY (writing)' : 'DRY-RUN'}`);

for (const row of rows) {
  stats.posts += 1;
  const content = row.content_az || '';
  let newContent = content;
  let changed = false;

  // ── Guru boxes ──
  const existingBoxes = await sql`SELECT count(*)::int AS n FROM guru_boxes WHERE blog_post_id = ${row.id}`;
  const hasBoxes = (existingBoxes[0]?.n || 0) > 0;
  const guruMatches = content.match(GURU_BLOCK) || [];

  if (guruMatches.length > 0 && !hasBoxes) {
    let order = 0;
    for (const block of guruMatches) {
      const parsed = parseGuruBlock(block);
      if (!parsed) continue;
      console.log(`  #${row.id} ${row.slug}: guru "${parsed.name}" — "${parsed.quote.slice(0, 50)}…"`);
      if (APPLY) {
        await sql`INSERT INTO guru_boxes (blog_post_id, guru_name, quote_az, book, sort_order)
                  VALUES (${row.id}, ${parsed.name}, ${parsed.quote}, ${parsed.source || null}, ${order})`;
      }
      stats.guruInserted += 1;
      order += 1;
      newContent = newContent.replace(block, '').trim();
      changed = true;
    }
  } else if (guruMatches.length > 0 && hasBoxes) {
    // already structured — just strip the markdown duplicate
    for (const block of guruMatches) newContent = newContent.replace(block, '').trim();
    if (newContent !== content) changed = true;
  }

  // ── Doğan note ──
  if (!row.dogan_note || !String(row.dogan_note).trim()) {
    const dogan = extractDoganNote(newContent);
    if (dogan && dogan.text) {
      console.log(`  #${row.id} ${row.slug}: dogan_note ← "${dogan.text.slice(0, 50)}…"`);
      if (APPLY) {
        await sql`UPDATE blog_posts SET dogan_note = ${dogan.text} WHERE id = ${row.id}`;
      }
      stats.doganSet += 1;
      newContent = newContent.replace(dogan.raw, '').trim();
      changed = true;
    }
  } else {
    // dogan_note already set — strip the markdown duplicate if present
    const dogan = extractDoganNote(newContent);
    if (dogan) {
      newContent = newContent.replace(dogan.raw, '').trim();
      if (newContent !== content) changed = true;
    }
  }

  // ── Persist stripped content ──
  if (changed && newContent !== content) {
    // collapse 3+ blank lines left by stripping
    newContent = newContent.replace(/\n{3,}/g, '\n\n');
    if (APPLY) {
      await sql`UPDATE blog_posts SET content_az = ${newContent} WHERE id = ${row.id}`;
    }
    stats.contentStripped += 1;
  }

  if (!changed) stats.skipped += 1;
}

console.log('\n═══ SUMMARY ═══');
console.log(`  Posts scanned:     ${stats.posts}`);
console.log(`  Guru boxes added:  ${stats.guruInserted}`);
console.log(`  Doğan notes set:   ${stats.doganSet}`);
console.log(`  Content stripped:  ${stats.contentStripped}`);
console.log(`  Untouched:         ${stats.skipped}`);
console.log(`  Mode: ${APPLY ? 'APPLY — DB written' : 'DRY-RUN — nothing written'}`);
console.log(APPLY ? '\n⚠️  Re-run translation afterwards so the new structured fields get ru/en/tr.' : '\nRun with --apply to write.');
