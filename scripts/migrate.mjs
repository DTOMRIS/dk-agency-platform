#!/usr/bin/env node
/**
 * DK Agency — miqrasiya icraçısı (TASK-0440)
 *
 * NİYƏ LAZIM OLDU
 * ───────────────
 * `drizzle/` qovluğunda 25 .sql faylı var, `drizzle/meta/_journal.json`-da
 * isə yalnız 9-u qeydlidir (0000–0008). Qalan 16-sı əl ilə yazılıb və onları
 * tətbiq edən heç bir mexanizm yox idi: `package.json`-da `db:migrate` scripti
 * yoxdu, kodda drizzle-orm migrator çağırışı yoxdu. Nəticədə hər yeni
 * sütun canlıda «column does not exist» xətası verirdi — TASK-0433-dəki
 * `/dashboard/contact-tracking` çökməsi məhz bu idi (miqrasiya 0020).
 *
 * NİYƏ `drizzle-kit migrate` DEYİL
 * ────────────────────────────────
 * `drizzle-kit` yalnız `_journal.json`-dakı faylları tanıyır və tətbiq
 * olunanları öz `__drizzle_migrations` cədvəlində HASH ilə izləyir. 16 yetim
 * faylı journal-a əlavə etmək mövcud hash-ləri dəyişir; canlı bazada bəzi
 * miqrasiyalar artıq əl ilə tətbiq olunduğu üçün bu, ya təkrar icraya, ya da
 * uyğunsuzluq xətasına gətirib çıxarardı. Ona görə journal-a toxunulmur.
 *
 * İŞ BÖLGÜSÜ — bu runner journal-dakı faylları İCRA ETMİR
 * ───────────────────────────────────────────────────────
 * `drizzle-kit`-in generasiya etdiyi miqrasiyalar (journal-dakılar) idempotent
 * DEYİL və olmamalıdır — çılpaq `CREATE TABLE` / `ADD COLUMN` işlədirlər, çünki
 * drizzle onları `__drizzle_migrations`-da izləyir və heç vaxt təkrar işlətmir.
 * Onları əl ilə idempotent etmək generasiya olunan faylı redaktə etmək demək
 * olardı və növbəti `drizzle-kit generate` bunu geri qaytarardı.
 *
 * Ona görə bölgü belədir:
 *   • journal-dakı fayllar  → `drizzle-kit migrate` (dəyişməz qalır)
 *   • əl ilə yazılmış qalan fayllar → bu runner
 *
 * `npm run db:migrate` hər ikisini doğru sırada işlədir.
 *
 * DİZAYN
 * ──────
 * 1. `_journal.json` oxunur; orada qeydli fayllar ATLANIR (drizzle-in işidir).
 * 2. Qalan fayllar ad sırası ilə icra olunur.
 * 3. Tətbiq olunanlar `dk_migrations` cədvəlində saxlanılır.
 * 4. Hər fayl öz transaksiyasında — yarımçıq qalan miqrasiya yoxdur.
 * 5. Bu faylların hamısı idempotentdir (`IF NOT EXISTS`, `DO $$ … EXCEPTION`),
 *    ona görə izləmə cədvəli boş olan MÖVCUD bazada da təhlükəsizdir: artıq
 *    mövcud obyektlər atlanır. Bu, indiki sürüşməni özü-özünə sağaldır və
 *    `--baseline` kimi əlavə rejim tələb etmir.
 *
 * İSTİFADƏ
 * ────────
 *   npm run db:migrate          — drizzle-kit + əl ilə yazılanlar
 *   npm run db:migrate:status   — nə tətbiq olunub, nə gözləyir (yazma yoxdur)
 *   node scripts/migrate.mjs --dry-run — nə icra olunacağını göstər
 *
 * DATABASE_URL mühit dəyişənindən oxunur. `.env*` fayllarına yazılmır.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_DIR = path.join(__dirname, '..', 'drizzle');

const args = new Set(process.argv.slice(2));
const STATUS_ONLY = args.has('--status');
const DRY_RUN = args.has('--dry-run');

function fail(message) {
  console.error(`\n  ✗ ${message}\n`);
  process.exit(1);
}

/** `_journal.json`-da qeydli tag-lar — bunlar drizzle-kit-in məsuliyyətidir. */
function journalTags() {
  const journalPath = path.join(MIGRATIONS_DIR, 'meta', '_journal.json');
  if (!fs.existsSync(journalPath)) return new Set();
  const journal = JSON.parse(fs.readFileSync(journalPath, 'utf8'));
  return new Set((journal.entries ?? []).map((entry) => `${entry.tag}.sql`));
}

/** Yalnız əl ilə yazılmış (journal-dan kənar) miqrasiyalar. */
function listMigrationFiles() {
  const owned = journalTags();
  return fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((name) => name.endsWith('.sql') && !owned.has(name))
    .sort((a, b) => a.localeCompare(b, 'en'));
}

async function connect() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    fail(
      'DATABASE_URL təyin edilməyib.\n' +
        '    Lokal:      DATABASE_URL=postgres://… npm run db:migrate\n' +
        '    Hostinger:  panel → Node app → Environment variables'
    );
  }

  const { neon } = await import('@neondatabase/serverless');
  const sql = neon(url);
  // neon() şablon-literal funksiyasıdır; sərbəst mətn üçün .query() lazımdır.
  return {
    query: (text) => sql.query(text),
  };
}

async function ensureTrackingTable(db) {
  await db.query(`
    CREATE TABLE IF NOT EXISTS dk_migrations (
      filename    text PRIMARY KEY,
      applied_at  timestamptz NOT NULL DEFAULT now()
    )
  `);
}

async function appliedSet(db) {
  const rows = await db.query('SELECT filename FROM dk_migrations');
  return new Set(rows.map((row) => row.filename));
}

async function main() {
  const files = listMigrationFiles();
  if (files.length === 0) fail(`Miqrasiya faylı tapılmadı: ${MIGRATIONS_DIR}`);

  const db = await connect();
  await ensureTrackingTable(db);
  const applied = await appliedSet(db);
  const pending = files.filter((file) => !applied.has(file));

  console.log(`\n  DK miqrasiya — ${files.length} fayl, ${applied.size} tətbiq olunub, ${pending.length} gözləyir\n`);

  if (STATUS_ONLY) {
    for (const file of files) {
      console.log(`  ${applied.has(file) ? '✓' : '·'} ${file}`);
    }
    console.log(
      pending.length === 0
        ? '\n  Baza güncəldir.\n'
        : `\n  ${pending.length} miqrasiya gözləyir — 'npm run db:migrate' işlədin.\n`
    );
    return;
  }

  if (pending.length === 0) {
    console.log('  Tətbiq ediləcək yeni miqrasiya yoxdur.\n');
    return;
  }

  if (DRY_RUN) {
    for (const file of pending) console.log(`  → ${file}`);
    console.log('\n  (--dry-run: heç nə icra olunmadı)\n');
    return;
  }

  for (const file of pending) {
    const sqlText = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8');
    process.stdout.write(`  → ${file} … `);
    try {
      // Hər miqrasiya öz transaksiyasında: sınarsa heç nə qalmır.
      await db.query('BEGIN');
      await db.query(sqlText);
      await db.query(
        `INSERT INTO dk_migrations (filename) VALUES ('${file.replace(/'/g, "''")}')
         ON CONFLICT (filename) DO NOTHING`
      );
      await db.query('COMMIT');
      console.log('OK');
    } catch (error) {
      await db.query('ROLLBACK').catch(() => undefined);
      console.log('XƏTA');
      fail(`${file} tətbiq olunmadı — dəyişikliklər geri alındı.\n    ${error.message}`);
    }
  }

  console.log(`\n  ${pending.length} miqrasiya tətbiq olundu.\n`);
}

main().catch((error) => fail(error.message));
