/**
 * Append an FAQ section to the trademark blog post (blog-29) in the DB so it
 * earns an FAQPage JSON-LD (TASK-0217 parser) and shows a FAQ block.
 *
 * DB-first (L-037): content lives in blog_posts.content_az. Run locally where
 * DATABASE_URL is reachable:
 *   node --env-file=.env.local scripts/blog-29-faq.mjs
 *   node --env-file=.env.local scripts/blog-29-faq.mjs <slug>   # optional override
 *
 * Self-discovering: if the slug is unknown it finds the post by the unique
 * "Hungry Jack" phrase. Idempotent: skips if the FAQ already exists.
 */
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

const SLUG_GUESS = process.argv[2] || 'marka-starbucks-sansi-burger-king-dersi';

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

async function findPost() {
  // 1) exact slug
  let rows = await sql`SELECT id, slug, content_az FROM blog_posts WHERE slug = ${SLUG_GUESS}`;
  if (rows.length) return rows[0];

  // 2) self-discover by the unique "Hungry Jack" phrase (or title)
  rows = await sql`
    SELECT id, slug, content_az FROM blog_posts
    WHERE content_az ILIKE '%Hungry Jack%'
       OR content_az ILIKE '%Starbucks Var Uzaqda%'
       OR title_az ILIKE '%Starbucks%'
    LIMIT 5`;
  if (rows.length === 1) {
    console.log(`ℹ️  Slug avtomatik tapıldı: '${rows[0].slug}'`);
    return rows[0];
  }
  if (rows.length > 1) {
    console.error('Birdən çox uyğunluq — slug-u arqument kimi ver:');
    rows.forEach((r) => console.error(`  - ${r.slug}`));
    return null;
  }
  return null;
}

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL yoxdur. İşlət: node --env-file=.env.local scripts/blog-29-faq.mjs');
    process.exit(1);
  }

  const post = await findPost();
  if (!post) {
    console.error('Tapılmadı. Son 10 blog slug-u (blog-29-u seç, sonra arqument kimi ver):');
    const recent = await sql`SELECT slug, title_az FROM blog_posts ORDER BY created_at DESC LIMIT 10`;
    recent.forEach((r) => console.error(`  - ${r.slug}  (${r.title_az})`));
    process.exit(1);
  }

  if (post.content_az.includes('## Suallar və cavablar')) {
    console.log(`FAQ artıq var (slug='${post.slug}') — dəyişiklik edilmədi (idempotent).`);
    return;
  }

  let next;
  if (post.content_az.includes(MARKER)) {
    next = post.content_az.replace(MARKER, `${FAQ_MD}---\n\n${MARKER}`);
  } else {
    next = `${post.content_az.trimEnd()}\n\n${FAQ_MD}`;
  }

  await sql`UPDATE blog_posts SET content_az = ${next}, updated_at = now() WHERE id = ${post.id}`;
  console.log(`✅ FAQ əlavə olundu (slug='${post.slug}', id=${post.id}). FAQPage avtomatik işə düşəcək (deploy sonrası).`);
}

main().catch((e) => {
  console.error('Xəta:', e.message);
  process.exit(1);
});
