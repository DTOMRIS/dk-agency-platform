/**
 * TASK-0549: cross-feed story dedupe. Run with: npx tsx e2e/story-dedupe.test.ts (exit 1 on failure).
 */
import { sameStory, storyKey, PRESS_RELEASE_SOURCE } from '../lib/news/story-dedupe';

const same: Array<[string, string]> = [
  ['Highline Hospitality Partners Acquires 125-Room Courtyard by Marriott in Pennsylvania', 'Highline Hospitality Partners acquires 125-key Courtyard by Marriott Pittsburgh in Pennsylvania'],
  ['Concord Hospitality adds seven North Carolina hotels to management portfolio', 'Concord Hospitality takes over management of 711-room North Carolina portfolio of seven hotels'],
  ['GCSTIMES earns FSC and EcoVadis certification for hotel key cards', 'GCSTIMES announces FSC and EcoVadis sustainability certifications for hotel key cards'],
  ['Generator to double hotel count by 2030 with Brookfield backing', 'Generator plans to double its hotel count by 2030, Brookfield backing'],
];
const different: Array<[string, string]> = [
  ['Revinate launches Pathways and Revinate Chat', 'Revinate unveils first data activation platform for hospitality'],
  ['Restaurant Dive: Chipotle tests new kitchen automation', 'McDonald’s tests new kitchen automation in Chicago'],
  ['Average length of stay shortens in Türkiye, revenue growth slows', 'Azerbaijan represented at HOTREC and Hotelstars assemblies'],
];
let fail = 0;
for (const [a, b] of same) if (!sameStory(storyKey(a), storyKey(b))) { fail++; console.error('FAIL same:', a, '|', b, [...storyKey(a).words], [...storyKey(b).words]); }
for (const [a, b] of different) if (sameStory(storyKey(a), storyKey(b))) { fail++; console.error('FAIL different:', a, '|', b); }
for (const s of ['PR Newswire APAC', 'Business Wire', 'GlobeNewswire']) if (!PRESS_RELEASE_SOURCE.test(s)) { fail++; console.error('FAIL wire', s); }
if (PRESS_RELEASE_SOURCE.test('Restaurant Dive')) { fail++; console.error('FAIL wire false positive'); }
if (fail) { console.error(`${fail} uğursuz`); process.exit(1); }
console.log('story-dedupe: OK');
