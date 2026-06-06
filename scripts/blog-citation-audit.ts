/**
 * blog-citation-audit.ts — tiered citation/atıf audit.
 * Run: npx tsx scripts/blog-citation-audit.ts
 *
 * Splits numeric paragraphs into:
 *  - HIGH RİSK: a real-world statistic (a %/figure tied to a population/market
 *    group) stated WITHOUT a source and NOT inside a worked calculation. These
 *    are the legal/credibility liabilities.
 *  - illüstrativ: calculation examples (worked math, prices in a formula) — a
 *    number but not a factual claim about the world; usually fine.
 *  - sourced: already carries a source signal.
 * Output is a reviewable report — not an auto-fix.
 */
import { writeFileSync } from 'fs';
import { BLOG_ARTICLES } from '../lib/data/blogArticles';

const SOURCE_SIGNALS = [
  /https?:\/\//i,
  /\bwww\./i,
  /\bmənbə\b/i,
  /\bgörə\b/i,
  /\baraşdırma\b/i,
  /\bhesabat(ı|ına|ında)?\b/i,
  /\b20\d\d\b/,
  /\b(Booking|Airbnb|AirDNA|Expedia|Yandex|WTTC|ILO|Koç|CTH|AHA|TÜİK|DSK|Dövlət Statistika|Turizm Agentliyi|KOBİA|ASAN|AQTA|Wolt|Bolt|Yango|McKinsey|Statista|Euromonitor)\b/i,
];

const CLAIM_PATTERNS = [
  /\d+([.,]\d+)?\s*%/,
  /%\s*\d+/,
  /\d[\d.,]*\s*(AZN|₼|manat|USD|\$|€|dollar|avro)/i,
  /\d+([.,]\d+)?\s*(dəfə|kat|qat)\b/i,
  /\b\d{3,}\b/,
  /\d+([.,]\d+)?\s*(milyon|milyard|min)\b/i,
];

// Market/population nouns — a % or figure attached to these = real-world stat
const MARKET_NOUN =
  /(restoran|müştəri|otel|pansiyon|sahibkar|işçi|işlət|bazar|sektor|qonaq|turist|investor|əhali|şirkət|biznes|kafe|tesis|müəssisə)/i;
// Calculation markers — paragraph is a worked example, not a world-claim
const CALC_MARKER = /[÷×=]|food cost:|(\d[\d.,]*\s*[₼$€])\s*[-–]|\(\s*\d|nümunə/i;

function hasSource(p: string): boolean {
  return SOURCE_SIGNALS.some((re) => re.test(p));
}
function hasClaim(p: string): boolean {
  return CLAIM_PATTERNS.some((re) => re.test(p));
}
function isHeadingOrTable(p: string): boolean {
  const t = p.trim();
  return t.startsWith('#') || t.startsWith('|') || t.startsWith('```');
}
// A real-world statistic: a percentage tied to a market group (within ~45 chars)
function isMarketStat(p: string): boolean {
  if (!MARKET_NOUN.test(p)) return false;
  return (
    /(restoran|müştəri|otel|pansiyon|sahibkar|işçi|bazar|sektor|qonaq|turist|investor|əhali|şirkət|biznes|kafe|tesis|müəssisə)\w*[^.!?]{0,45}\d+([.,]\d+)?\s*%/i.test(
      p
    ) ||
    /\d+([.,]\d+)?\s*%[^.!?]{0,45}(restoran|müştəri|otel|pansiyon|sahibkar|işçi|bazar|sektor|qonaq|turist|investor|əhali|şirkət|biznes|kafe|tesis|müəssisə)/i.test(
      p
    ) ||
    /\b\d{3,}\b[^.!?]{0,45}(restoran|otel|pansiyon|işçi|tesis|müəssisə|sahibkar)/i.test(p)
  );
}

interface Flag {
  slug: string;
  title: string;
  excerpt: string;
}
const highRisk: Flag[] = [];
let claims = 0;
let sourced = 0;
let illustrative = 0;
const perArticle: Array<{
  slug: string;
  title: string;
  high: number;
  illus: number;
  sourced: number;
}> = [];

for (const a of BLOG_ARTICLES) {
  const content = (a as { content?: string }).content || '';
  const paras = content.split(/\n\s*\n/);
  let high = 0;
  let illus = 0;
  let src = 0;
  for (const p of paras) {
    if (isHeadingOrTable(p)) continue;
    if (!hasClaim(p)) continue;
    claims++;
    if (hasSource(p)) {
      sourced++;
      src++;
      continue;
    }
    const isStat = isMarketStat(p) && !CALC_MARKER.test(p);
    if (isStat) {
      high++;
      highRisk.push({
        slug: a.slug,
        title: a.title,
        excerpt: p.replace(/\s+/g, ' ').trim().slice(0, 200),
      });
    } else {
      illus++;
      illustrative++;
    }
  }
  perArticle.push({ slug: a.slug, title: a.title, high, illus, sourced: src });
}

const L: string[] = [];
L.push('# Blog Atıf (Citation) Auditi — Tiered');
L.push('');
L.push(`Avtomatik ilkin tarama — ${new Date().toISOString().slice(0, 10)}.`);
L.push('');
L.push('**Səviyyələr:**');
L.push(
  '- **YÜKSƏK RİSK** — real-dünya statistikası (populyasiya/bazara bağlı %/rəqəm), mənbəsiz, hesablama nümunəsi DEYİL. Hüquqi/etibar riski → mənbə əlavə et və ya yumşalt ("təxminən", "bizim müşahidəmizə görə").'
);
L.push(
  '- **illüstrativ** — hesablama nümunəsi (işlənmiş riyaziyyat, formuldakı qiymət). Rəqəm var, amma dünya haqqında iddia deyil; adətən OK.'
);
L.push('- **mənbəli** — onsuz da mənbə siqnalı daşıyır.');
L.push('');
L.push('## Xülasə');
L.push(`- Məqalə: **${BLOG_ARTICLES.length}** | Rəqəmli paraqraf: **${claims}**`);
L.push(
  `- 🔴 YÜKSƏK RİSK: **${highRisk.length}** | 🟡 illüstrativ: **${illustrative}** | 🟢 mənbəli: **${sourced}**`
);
L.push('');
L.push('## Məqalə üzrə (YÜKSƏK RİSK sırası)');
L.push('| Slug | 🔴 Yüksək | 🟡 İllüstrativ | 🟢 Mənbəli |');
L.push('|---|---|---|---|');
for (const r of perArticle.sort((a, b) => b.high - a.high)) {
  L.push(`| ${r.slug} | ${r.high > 0 ? `**${r.high}**` : '0'} | ${r.illus} | ${r.sourced} |`);
}
L.push('');
L.push('## 🔴 YÜKSƏK RİSK iddialar (mənbə/yumşaltma lazım)');
let cur = '';
if (highRisk.length === 0) L.push('\n_Mənbəsiz real-dünya statistikası tapılmadı._');
for (const r of highRisk) {
  if (r.slug !== cur) {
    cur = r.slug;
    L.push('');
    L.push(`### ${r.title}`);
    L.push(`\`${r.slug}\``);
    L.push('');
  }
  L.push(`- ${r.excerpt}`);
}
L.push('');

writeFileSync('docs/BLOG-CITATION-AUDIT.md', L.join('\n'));
console.log(
  `[blog-citation-audit] articles=${BLOG_ARTICLES.length} HIGH=${highRisk.length} illustrative=${illustrative} sourced=${sourced}`
);
console.log('[blog-citation-audit] → docs/BLOG-CITATION-AUDIT.md');
