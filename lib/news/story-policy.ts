/** TASK-0553: conservative event matching, source choice and statistical conflict checks. */
import { sameStory, storyKey } from './story-dedupe';

export type Signal = {
  id: number; title: string; summary: string | null; externalUrl: string;
  publishedAt: Date | null; status: string; origin: string;
  contentAz: string | null; relevanceScore: number | null;
};

function normalized(title: string): string {
  return title.normalize('NFKC').toLocaleLowerCase('az').replace(/ı/g, 'i');
}

// Narrow aliases deliberately avoid treating every tourism statistic as one event.
function statisticKey(title: string): string | null {
  const t = normalized(title);
  const country = /azərbaycan|azerbaijan|азербайджан/.test(t) ? 'az' : '';
  const metric = /gecələmə|overnight|ноч[её]в|ночлег/.test(t) ? 'overnights' : '';
  const period = /(?:9|doqquz|nine|девят\p{L}*)\s*(?:ay|month|месяц)/u.test(t) ? '9m'
    : /(?:6|alti|six|шест\p{L}*)\s*(?:ay|month|месяц)|first half|birinci yarim/u.test(t) ? '6m'
    : /(?:202\d)/.exec(t)?.[0] ?? '';
  return country && metric && period ? `${country}:${metric}:${period}` : null;
}

export function relatedSignals(a: Signal, b: Signal): boolean {
  if (a.id === b.id) return true;
  // Different reporting dates/periods are never merged purely on vocabulary.
  if (a.publishedAt && b.publishedAt && Math.abs(+a.publishedAt - +b.publishedAt) > 7 * 86400_000) return false;
  const ak = statisticKey(a.title), bk = statisticKey(b.title);
  const ay = /202\d/.exec(a.title)?.[0], by = /202\d/.exec(b.title)?.[0];
  if (ay && by && ay !== by) return false;
  if (ak && bk) return ak === bk;
  return sameStory(storyKey(a.title), storyKey(b.title));
}

function direction(title: string): number {
  const t = normalized(title);
  const up = /artib|artim|yüksəl|increas|\brise\b|\brose\b|\bgrow|\bgrew\b|вырос|рост|увелич/u.test(t);
  const down = /azal|geril|declin|decreas|\bfall|\bfell\b|\bdrop|сниз|сократ|паден/u.test(t);
  return up === down ? 0 : up ? 1 : -1;
}

function percentages(title: string): string[] {
  return [...title.matchAll(/(\d+(?:[.,]\d+)?)\s*(?:%|faiz|percent)/gi)]
    .map((m) => String(Number(m[1].replace(',', '.')))).sort();
}

export function conflictingSignals(a: Signal, b: Signal): boolean {
  if (!relatedSignals(a, b)) return false;
  const ad = direction(a.title), bd = direction(b.title);
  if (ad && bd && ad !== bd) return true;
  // Only compare percentages for the same explicitly identified statistical series.
  const ap = percentages(a.title), bp = percentages(b.title);
  return Boolean(statisticKey(a.title) && statisticKey(a.title) === statisticKey(b.title)
    && ap.length === 1 && bp.length === 1 && ap[0] !== bp[0]);
}

export function sourcePriority(url: string): number {
  let host: string;
  try { host = new URL(url).hostname.replace(/^www\./, ''); } catch { return 0; }
  if (host.endsWith('.gov.az') || ['stat.gov.az', 'tourismboard.az'].includes(host)) return 100;
  if (['azertag.az', 'report.az'].includes(host)) return 80;
  if (['apa.az', 'trend.az'].includes(host)) return 60;
  return 0;
}

export function preferredSignal(signals: Signal[]): Signal {
  return [...signals].sort((a, b) => sourcePriority(b.externalUrl) - sourcePriority(a.externalUrl)
    || (b.relevanceScore ?? 0) - (a.relevanceScore ?? 0) || b.id - a.id)[0];
}

/** Anchor matching avoids transitive A≈B≈C chains swallowing unrelated stories. */
export function groupSignals(signals: Signal[]): Signal[][] {
  const groups: Signal[][] = [];
  for (const signal of signals) {
    const group = groups.find((g) => relatedSignals(g[0], signal));
    if (group) group.push(signal); else groups.push([signal]);
  }
  return groups;
}

export function bakuDay(now = new Date()): string {
  return new Date(+now + 4 * 3600_000).toISOString().slice(0, 10);
}
