/**
 * TASK-0557: news coverage — tolerant feed XML, regulation-first ordering, parallel feed reads, caps.
 * Run with: npx tsx e2e/news-coverage.test.ts   (no network, no database)
 */
import assert from 'node:assert/strict';
import Parser from 'rss-parser';
import { mapLimit, repairFeedXml, RSS_FEEDS } from '../lib/news/rss-ingest';
import { isRegulationTopic, scoreNewsItem } from '../lib/news/scoring-config';
import { orderForSynthesis, REGULATION_SLOTS, SOURCE_DAILY_CAP, type Signal } from '../lib/news/story-policy';
import { DAILY_SYNTHESIS_CAP, RUN_SYNTHESIS_CAP } from '../lib/news/pipeline-sql';

async function main() {
  // 1. AFN.az shape (2026-11-05): raw HTML with an unclosed <img> inside <description>.
  const afn = `<?xml version="1.0" encoding="utf-8"?><rss version="2.0" xmlns:yandex="http://news.yandex.ru"><channel><title>AFN</title>
<item><title>Məqsədimiz davamlı turizm modeli yaratmaqdır – Ceyhun Aşurov</title>
<link>https://afn.az/178066-x.html</link>
<description><p><a href="https://afn.az/a.webp"><img src="https://afn.az/t.webp" alt=""></a></p></description>
<yandex:full-text><p>Mətn</p> <p><br></p></yandex:full-text>
<pubDate>Wed, 05 Nov 2026 10:00:00 +0400</pubDate></item></channel></rss>`;
  const parser = new Parser();
  await assert.rejects(parser.parseString(afn), 'raw feed is malformed');
  const items = (await parser.parseString(repairFeedXml(afn))).items;
  assert.equal(items.length, 1);
  assert.equal(items[0].link, 'https://afn.az/178066-x.html');
  // Already-CDATA feeds are untouched.
  const clean = '<description><![CDATA[<b>x</b>]]></description>';
  assert.equal(repairFeedXml(clean), clean);

  // 2. New sources are configured.
  for (const host of ['oxu.az', 'metbuat.az', 'banker.az', 'xezerxeber.az', 'afn.az', 'turizmplus.az']) {
    assert.ok(RSS_FEEDS.some((f) => new URL(f.url).hostname.replace(/^www\./, '') === host), host);
  }

  // 3. Regulation detection and ranking.
  assert.equal(isRegulationTopic('Restoran və kafelər üçün yeni vergi güzəşti gəlir'), true);
  assert.equal(isRegulationTopic('Для ресторанов вводят налоговые льготы'), true);
  assert.equal(isRegulationTopic('Bakıda yeni restoran açıldı'), false);
  assert.equal(isRegulationTopic('Taxi drivers protest'), false, '"tax" is an exact word');
  assert.ok(scoreNewsItem('Restoran və kafelər üçün yeni vergi güzəşti gəlir', '', 'https://baku.ws/x') >= 15);

  const sig = (id: number, title: string, relevanceScore: number): Signal[] => [{
    id, title, summary: null, externalUrl: `https://x.az/${id}`, publishedAt: new Date(), status: 'fetched',
    origin: 'rss', contentAz: null, relevanceScore, author: 'X',
  }];
  const groups = [
    sig(1, 'AQTA Bakıda iaşə obyektlərini yoxlayıb', 27),
    sig(2, 'Restoranlar üçün vergi güzəşti', 16),
    sig(3, 'Turizm agentliyi sərgidə', 24),
    sig(4, 'Otellər üçün ƏDV dəyişir', 14),
    sig(5, 'Kafelərə aksiz', 12),
    sig(6, 'Restoranlarda vergi yoxlaması', 11),
  ];
  const order = orderForSynthesis(groups, isRegulationTopic).map((g) => g[0].id);
  assert.deepEqual(order, [2, 4, 5, 1, 3, 6], 'top regulation events first, the rest by score');
  assert.equal(REGULATION_SLOTS, 3);

  // 4. Caps (owner 2026-11-05: back to the old volume).
  assert.equal(DAILY_SYNTHESIS_CAP, 30);
  assert.equal(RUN_SYNTHESIS_CAP, 15);
  assert.equal(SOURCE_DAILY_CAP, 5);

  // 5. mapLimit keeps order and never exceeds the limit.
  let inFlight = 0;
  let peak = 0;
  const out = await mapLimit([5, 1, 4, 2, 3, 0, 6, 7, 8, 9], 3, async (n) => {
    inFlight++; peak = Math.max(peak, inFlight);
    await new Promise((r) => setTimeout(r, n * 3));
    inFlight--;
    return n * 10;
  });
  assert.deepEqual(out, [50, 10, 40, 20, 30, 0, 60, 70, 80, 90]);
  assert.ok(peak <= 3, `peak ${peak}`);

  console.log('news-coverage: OK (afn XML repair, 6 new sources, regulation-first order, 30/15/5 caps, mapLimit)');
}

main().catch((err) => { console.error(err); process.exit(1); });
