/**
 * TASK-0455: uzun bloq mətninin DeepSeek-ə parçalanması — unit test.
 * Run with: npx tsx e2e/blog-translate-chunking.test.ts
 * Exits 0 on success, 1 on failure. DeepSeek çağırılmır — `fetch` saxtalaşdırılır.
 *
 * Əvvəl: hər `##` başlığı ayrı çağırış, ardıcıl → 15 çağırış (nümunədə), 2–3 dəq sorğu; ``` blokunu da bölürdü.
 * İndi: bölmələr ≤3000 simvolluq parçalara yığılır, paralel (maks. 4) göndərilir,
 * ``` bloku içindəki `#` sətri bölmə sayılmır, nəticə sırası qorunur.
 */

import { translateText } from '../lib/ai/translate';

let failures = 0;
function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    failures++;
  } else {
    console.log(`PASS: ${message}`);
  }
}

// ── Nümunə yazı: 12 bölmə × ~650 simvol + içində `#` olan kod bloku ──
const para = 'Mətbəxdə aşpaz hər sous üçün soyuducuya gedir. '.repeat(13).trim();
const sections = Array.from({ length: 12 }, (_, i) => `## Bölmə ${i + 1}\n\n${para}`);
const fence = ['```', '# bu başlıq deyil — kod blokunun içidir', 'x = 1', '```'].join('\n');
sections.splice(6, 0, `## Kod\n\n${fence}`);
const article = `Giriş abzası.\n\n${sections.join('\n\n')}`;

// ── Saxta DeepSeek: ə → e (tərcümə olunmuş sayılsın), sıranı yoxlamaq üçün gecikmə ──
const calls: string[] = [];
let inFlight = 0;
let maxInFlight = 0;
let failOn: number | null = null;

const realFetch = globalThis.fetch;
globalThis.fetch = (async (_url: unknown, init?: { body?: unknown }) => {
  const body = JSON.parse(String(init?.body)) as { messages: Array<{ content: string }> };
  const text = body.messages[1].content;
  const idx = calls.push(text) - 1;
  inFlight++;
  maxInFlight = Math.max(maxInFlight, inFlight);
  // Tərs gecikmə: sonrakı parça daha tez qayıdır — sıra qorunmalıdır
  await new Promise((r) => setTimeout(r, 40 - Math.min(idx, 10) * 3));
  inFlight--;
  if (failOn === idx) return new Response('bad', { status: 400 });
  const out = text.replace(/ə/g, 'e').replace(/Ə/g, 'E');
  return new Response(
    JSON.stringify({ choices: [{ message: { content: out }, finish_reason: 'stop' }] }),
    { status: 200, headers: { 'content-type': 'application/json' } }
  );
}) as typeof fetch;

async function main() {
  process.env.DEEPSEEK_API_KEY = 'test-key';

  const out = await translateText(article, 'tr');
  assert(out !== null, 'uzun mətn tərcümə olunur');
  assert(calls.length > 1, `mətn parçalanır (${calls.length} çağırış)`);
  assert(
    calls.length <= 5,
    `başlıq başına deyil, yığılmış parçalar (${calls.length} ≤ 5, əvvəl 15)`
  );
  assert(
    calls.every((c) => c.length <= 3000),
    `hər parça ≤ 3000 simvol (maks. ${Math.max(...calls.map((c) => c.length))})`
  );
  assert(maxInFlight > 1 && maxInFlight <= 4, `paralel, maks. 4 eyni anda (${maxInFlight})`);
  assert(
    calls.some((c) => c.includes(fence)),
    '``` bloku bütöv qalır (içindəki # bölmə sayılmır)'
  );
  const expected = article.replace(/ə/g, 'e').replace(/Ə/g, 'E');
  const norm = (s: string) => s.replace(/\s+/g, ' ').trim();
  assert(out !== null && norm(out) === norm(expected), 'nəticə sırası və məzmunu qorunur');

  // Qısa mətn — tək çağırış
  calls.length = 0;
  const short = await translateText('Qısa başlıq', 'tr');
  assert(short === 'Qısa başlıq'.replace(/ə/g, 'e') && calls.length === 1, 'qısa mətn — 1 çağırış');

  // Bir parça alınmadısa — bütün mətn null (dillər qarışmır)
  calls.length = 0;
  failOn = 1;
  const partial = await translateText(article, 'tr');
  assert(partial === null, 'bir parça alınmayanda nəticə null — yarımçıq tərcümə yazılmır');

  globalThis.fetch = realFetch;
  if (failures > 0) {
    console.error(`\n${failures} FAIL`);
    process.exit(1);
  }
  console.log('\nALL PASS');
  process.exit(0);
}

void main();
