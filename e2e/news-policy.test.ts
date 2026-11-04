import assert from 'node:assert/strict';
import { bakuDay, conflictingSignals, groupSignals, preferredSignal, relatedSignals, type Signal } from '../lib/news/story-policy';

const signal = (id: number, title: string, url = 'https://milli.az/news/1'): Signal => ({
  id, title, externalUrl: url, summary: null, publishedAt: new Date('2026-11-01T10:00:00Z'),
  status: 'fetched', origin: 'rss', contentAz: null, relevanceScore: 20,
});
const a = signal(1, 'Azərbaycanda 9 ayda otellərdə gecələmələr 6,6 faiz azalıb');
const b = signal(2, 'Azərbaycanda 9 ayda otellərdə gecələmələr 6,6 faiz artıb');
const c = signal(3, 'Azerbaijan hotel overnight stays decline 6.6% in nine months', 'https://report.az/turizm/1');
assert(relatedSignals(a, c), 'AZ/EN statistical story');
assert(conflictingSignals(a, b), 'opposite direction must be held');
assert(!conflictingSignals(a, c), 'decimal comma/point and languages agree');
assert(conflictingSignals(a, signal(4, 'Azərbaycanda 9 ayda gecələmələr 8,2 faiz azalıb')));
assert(!relatedSignals(a, signal(5, 'Azərbaycanda 6 ayda gecələmələr 6,6 faiz azalıb')));
assert(!relatedSignals(a, { ...c, publishedAt: new Date('2026-09-01') }));
assert(!relatedSignals(a, signal(6, 'Türkiyədə otel gəlirləri artıb')));
assert.equal(groupSignals([a, b, c]).length, 1);
assert.equal(preferredSignal([a, c]).id, 3, 'credible source before raw score');
assert.equal(preferredSignal([a, c, signal(7, c.title, 'https://stat.gov.az/news/1')]).id, 7);
assert.equal(bakuDay(new Date('2026-11-03T19:59:59Z')), '2026-11-03');
assert.equal(bakuDay(new Date('2026-11-03T20:00:00Z')), '2026-11-04');
console.log('news-policy: OK (cross-language, conflicts, source selection, dates)');
