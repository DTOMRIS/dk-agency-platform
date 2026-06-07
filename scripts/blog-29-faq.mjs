/**
 * Append an FAQ section to blog-29 (marka / trademark article) in the DB so it
 * gets an FAQPage JSON-LD (TASK-0217 parser) and shows a FAQ block on the page.
 *
 * DB-first (L-037): content lives in blog_posts.content_az. Run locally where
 * DATABASE_URL is reachable:
 *   node --env-file=.env.local scripts/blog-29-faq.mjs
 *
 * Idempotent: skips if the FAQ section already exists.
 */
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

const SLUG = 'marka-starbucks-sansi-burger-king-dersi';

const FAQ_MD = `## Suallar və cavablar

### Markamı qeydiyyatdan keçirməsəm nə olar?
Başqası eyni adı qeydiyyatdan keçirə və səni öz adından məhrum edə bilər. Burger King Avstraliyada məhz buna görə "Hungry Jack's" adı ilə işləməyə məcbur oldu — yerli sahibkar adı əvvəlcədən qeydiyyatdan keçirmişdi.

### Bir ölkədə qeydiyyat dünyanın hər yerində keçərlidirmi?
Xeyr. Marka hüququ ərazi prinsipi ilə işləyir — hər bazarda ayrıca qeydiyyat lazımdır. Bir ölkədəki qeydiyyat başqa ölkədə avtomatik hüquq vermir.

### "Brand squatting" nədir?
Kiminsə sənin marka adını səndən əvvəl qeydiyyatdan keçirib sonra baha "geri satması" və ya ümumiyyətlə verməməsidir. Yeganə qorunma — adını ilk sən qeydiyyatdan keçirməkdir.

### Böyük marka kiçik biznesi həqiqətən bağladabilərmi?
Bəli. Adı icazəsiz işlədən biznesi xəbərdarlıq, məhkəmə və bağlanma gözləyə bilər. Starbucks-ın çay evinə cömərd davranması istisnadır, qayda deyil — sən o qədər şanslı olmaya bilərsən.

### Markanı qorumağa nədən başlamalıyam?
Tabelanı asmadan əvvəl adını qeydiyyatdan keçir. Addım-addım proses üçün "Markanı Azərbaycanda Necə Qeydiyyatdan Keçirirsən?" yazımıza bax və ya DK Agency ilə pulsuz ilkin dəyərləndirmə üçün əlaqə saxla.

`;

const MARKER = '## DK Agency necə kömək edir?';

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL yoxdur. İşlət: node --env-file=.env.local scripts/blog-29-faq.mjs');
    process.exit(1);
  }

  const rows = await sql`SELECT id, content_az FROM blog_posts WHERE slug = ${SLUG}`;
  if (!rows.length) {
    console.error(`Tapılmadı: slug='${SLUG}'. Düzgün slug-u ver.`);
    process.exit(1);
  }

  const { id, content_az } = rows[0];
  if (content_az.includes('## Suallar və cavablar')) {
    console.log('FAQ artıq var — dəyişiklik edilmədi (idempotent).');
    return;
  }

  let next;
  if (content_az.includes(MARKER)) {
    // insert the FAQ right before the "DK Agency necə kömək edir?" CTA section
    next = content_az.replace(MARKER, `${FAQ_MD}---\n\n${MARKER}`);
  } else {
    next = `${content_az.trimEnd()}\n\n${FAQ_MD}`;
  }

  await sql`UPDATE blog_posts SET content_az = ${next}, updated_at = now() WHERE id = ${id}`;
  console.log(`✅ FAQ əlavə olundu (blog id=${id}). FAQPage avtomatik işə düşəcək (deploy sonrası).`);
}

main().catch((e) => {
  console.error('Xəta:', e.message);
  process.exit(1);
});
