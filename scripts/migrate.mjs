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
const ROOT_DIR = path.join(__dirname, '..');
const MIGRATIONS_DIR = path.join(ROOT_DIR, 'drizzle');

const args = new Set(process.argv.slice(2));
const STATUS_ONLY = args.has('--status');
const DRY_RUN = args.has('--dry-run');

function fail(message) {
  console.error(`\n  ✗ ${message}\n`);
  process.exit(1);
}

/**
 * `.env.local` / `.env`-i oxuyur (TASK-0441).
 *
 * Next.js bu faylları özü yükləyir, sadə `node` skripti isə yükləmir — ona görə
 * ilk buraxılışda skript lokalda `DATABASE_URL təyin edilməyib` verirdi, halbuki
 * dəyər `.env.local`-da mövcud idi. `--env-file` bayrağı Node 20.6-dan əvvəl
 * yoxdur və fayl olmayanda sınır, ona görə oxuma burada, asılılıqsız edilir.
 *
 * Yalnız OXUYUR — `.env*` fayllarına heç nə yazılmır (layihə qaydası).
 * Mövcud mühit dəyişəni üstündür: CI/Hostinger-in verdiyi dəyər əzilmir.
 */
function loadEnvFiles() {
  for (const name of ['.env.local', '.env']) {
    const file = path.join(ROOT_DIR, name);
    if (!fs.existsSync(file)) continue;

    for (const rawLine of fs.readFileSync(file, 'utf8').split('\n')) {
      const line = rawLine.trim();
      if (!line || line.startsWith('#')) continue;

      const eq = line.indexOf('=');
      if (eq === -1) continue;

      const key = line.slice(0, eq).replace(/^export\s+/, '').trim();
      if (!key || process.env[key] !== undefined) continue;

      let value = line.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      process.env[key] = value;
    }
  }
}

/**
 * SQL mətnini ayrı-ayrı ifadələrə bölür (TASK-0442).
 *
 * Niyə lazımdır: Neon-un HTTP drayveri hər sorğunu **prepared statement** kimi
 * göndərir, prepared statement isə bir neçə ifadəni qəbul etmir —
 * `cannot insert multiple commands into a prepared statement`. Fayl olduğu kimi
 * göndəriləndə məhz bu baş verirdi.
 *
 * Sadə `split(';')` YARAMIR: `DO $$ BEGIN … END $$;` blokunun içində nöqtəli
 * vergüllər var və blok parçalanardı. Ona görə vəziyyət izlənir:
 *   • tək dırnaqlı sətir  '…'  (içində '' escape)
 *   • dollar-quoted blok  $$…$$ və ya $tag$…$tag$
 *   • sətir şərhi  -- …
 *   • blok şərhi   /* … *​/
 */
function splitStatements(sql) {
  const statements = [];
  let current = '';
  let i = 0;

  while (i < sql.length) {
    const rest = sql.slice(i);

    // Sətir şərhi — sonuna qədər at (amma sətir sonunu saxla)
    if (rest.startsWith('--')) {
      const nl = sql.indexOf('\n', i);
      i = nl === -1 ? sql.length : nl;
      continue;
    }

    // Blok şərhi
    if (rest.startsWith('/*')) {
      const end = sql.indexOf('*/', i + 2);
      i = end === -1 ? sql.length : end + 2;
      continue;
    }

    // Tək dırnaqlı sətir
    if (sql[i] === "'") {
      let j = i + 1;
      while (j < sql.length) {
        if (sql[j] === "'" && sql[j + 1] === "'") j += 2;
        else if (sql[j] === "'") break;
        else j += 1;
      }
      current += sql.slice(i, j + 1);
      i = j + 1;
      continue;
    }

    // Dollar-quoted blok: $$ … $$  və ya  $tag$ … $tag$
    const dollar = rest.match(/^\$([A-Za-z_][A-Za-z0-9_]*)?\$/);
    if (dollar) {
      const tag = dollar[0];
      const end = sql.indexOf(tag, i + tag.length);
      const stop = end === -1 ? sql.length : end + tag.length;
      current += sql.slice(i, stop);
      i = stop;
      continue;
    }

    // İfadə sonu
    if (sql[i] === ';') {
      const trimmed = current.trim();
      if (trimmed) statements.push(trimmed);
      current = '';
      i += 1;
      continue;
    }

    current += sql[i];
    i += 1;
  }

  const tail = current.trim();
  if (tail) statements.push(tail);
  return statements;
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
  loadEnvFiles();
  const url = process.env.DATABASE_URL;
  if (!url) {
    fail(
      'DATABASE_URL tapılmadı.\n' +
        '    Axtarıldı: mühit dəyişəni, .env.local, .env\n\n' +
        '    Lokal:      .env.local faylına DATABASE_URL=postgres://… əlavə edin\n' +
        '    və ya:      DATABASE_URL=postgres://… npm run db:migrate:status\n' +
        '    Hostinger:  panel → Node app → Environment variables'
    );
  }

  const { neon } = await import('@neondatabase/serverless');
  return neon(url);
}

async function ensureTrackingTable(sql) {
  await sql.query(`
    CREATE TABLE IF NOT EXISTS dk_migrations (
      filename    text PRIMARY KEY,
      applied_at  timestamptz NOT NULL DEFAULT now()
    )
  `);
}

async function appliedSet(sql) {
  const rows = await sql.query('SELECT filename FROM dk_migrations');
  return new Set(rows.map((row) => row.filename));
}

/**
 * Bir miqrasiya faylını tək transaksiyada tətbiq edir (TASK-0442).
 *
 * `BEGIN` / `COMMIT`-i ayrı-ayrı göndərmək neon-http-də İŞLƏMİR: hər sorğu
 * müstəqil HTTP çağırışıdır, ona görə onlar bir transaksiya təşkil etmir.
 * Drayverin `sql.transaction([...])` metodu bütün ifadələri bir sorğuda,
 * real transaksiya daxilində icra edir — ya hamısı, ya heç biri.
 *
 * İzləmə qeydi də eyni massivə qoşulur: fayl tətbiq olunubsa qeyd mütləq var,
 * qeyd varsa fayl mütləq tətbiq olunub — ikisi arasında boşluq qalmır.
 */
async function applyMigration(sql, filename, sqlText) {
  const statements = splitStatements(sqlText);
  if (statements.length === 0) return 0;

  await sql.transaction([
    ...statements.map((statement) => sql.query(statement)),
    sql.query('INSERT INTO dk_migrations (filename) VALUES ($1) ON CONFLICT DO NOTHING', [
      filename,
    ]),
  ]);

  return statements.length;
}

async function main() {
  const files = listMigrationFiles();
  if (files.length === 0) fail(`Miqrasiya faylı tapılmadı: ${MIGRATIONS_DIR}`);

  const sql = await connect();
  await ensureTrackingTable(sql);
  const applied = await appliedSet(sql);
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
      const count = await applyMigration(sql, file, sqlText);
      console.log(`OK (${count} ifadə)`);
    } catch (error) {
      console.log('XƏTA');
      fail(
        `${file} tətbiq olunmadı — bu faylın dəyişiklikləri geri alındı.\n    ${error.message}\n\n` +
          '    Ondan əvvəlki fayllar tətbiq olunub və qeydə alınıb;\n' +
          "    problemi həll edib 'npm run db:migrate' yenidən işlədin."
      );
    }
  }

  console.log(`\n  ${pending.length} miqrasiya tətbiq olundu.\n`);
}

main().catch((error) => fail(error.message));
