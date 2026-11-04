import type { OfficialSource } from './official-sources';

export type OfficialSignal = {
  title: string; link: string; summary: string; publishedAt: Date; imageUrl: string | null;
};

const escape = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Bounded HTML fragments from known templates, preserving nested elements of the same tag. */
export function elementsByClass(html: string, className: string): string[] {
  const fragments: string[] = [];
  const openings = /<([a-z][a-z0-9:-]*)\b(?:[^>"']|"[^"]*"|'[^']*')*>/gi;
  for (let match = openings.exec(html); match; match = openings.exec(html)) {
    const classes = attribute(match[0], 'class')?.split(/\s+/) ?? [];
    if (!classes.includes(className)) continue;
    const tokens = new RegExp(`<(/?)${escape(match[1])}\\b(?:[^>"']|"[^"]*"|'[^']*')*>`, 'gi');
    tokens.lastIndex = openings.lastIndex;
    let depth = 1;
    let end = -1;
    for (let token = tokens.exec(html); token; token = tokens.exec(html)) {
      depth += token[1] ? -1 : token[0].endsWith('/>') ? 0 : 1;
      if (depth === 0) { end = tokens.lastIndex; break; }
    }
    if (end !== -1) {
      fragments.push(html.slice(match.index, end));
      openings.lastIndex = end;
    }
  }
  return fragments;
}

function attribute(tag: string, name: string): string | null {
  const match = new RegExp(`\\s${escape(name)}\\s*=\\s*(?:"([^"]*)"|'([^']*)')`, 'i').exec(tag);
  return match ? decodeEntities(match[1] ?? match[2]) : null;
}

function decodeEntities(text: string): string {
  const named: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ',
    ccedil: 'ç', Ccedil: 'Ç', ouml: 'ö', Ouml: 'Ö', uuml: 'ü', Uuml: 'Ü',
    icirc: 'î', acirc: 'â', eacute: 'é',
    ndash: '–', mdash: '—', lsquo: '‘', rsquo: '’', ldquo: '“', rdquo: '”', hellip: '…' };
  return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (raw, code: string) => {
    if (!code.startsWith('#')) return named[code] ?? named[code.toLowerCase()] ?? raw;
    const n = code[1].toLowerCase() === 'x' ? parseInt(code.slice(2), 16) : Number(code.slice(1));
    return n > 0 && n <= 0x10ffff && !(n >= 0xd800 && n <= 0xdfff) ? String.fromCodePoint(n) : '';
  });
}

export function htmlText(html: string): string {
  return decodeEntities(html.replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi, '')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style\s*>/gi, '')
    .replace(/<!--[^]*?-->/g, '').replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim();
}

const MONTHS = ['yanvar|january|jan', 'fevral|february|feb', 'mart|march|mar', 'aprel|april|apr',
  'may', 'iyun|june|jun', 'iyul|july|jul', 'avqust|august|aug', 'sentyabr|september|sep',
  'oktyabr|october|oct', 'noyabr|november|nov', 'dekabr|december|dec'];

/** Use the source date, never fetch time. Date-only announcements are stored at Baku midnight. */
export function parseOfficialDate(text: string): Date | null {
  const t = text.toLocaleLowerCase('az');
  const numeric = /\b(\d{1,2})\.(\d{1,2})\.(\d{4}|\d{2})\b/.exec(t);
  const named = /\b(\d{1,2})\s+([\p{L}]+)\s+(\d{4})\b/u.exec(t);
  let year: number, month: number, day: number;
  if (numeric) {
    day = Number(numeric[1]); month = Number(numeric[2]); year = Number(numeric[3]);
    if (year < 100) year += 2000;
  } else if (named) {
    day = Number(named[1]); month = MONTHS.findIndex((m) => m.split('|').includes(named[2])) + 1;
    year = Number(named[3]);
  } else return null;
  if (!month || month > 12 || day < 1 || day > 31 || year < 2000 || year > 2100) return null;
  const utc = new Date(Date.UTC(year, month - 1, day));
  if (utc.getUTCDate() !== day || utc.getUTCMonth() !== month - 1) return null;
  return new Date(+utc - 4 * 3600_000);
}

export function officialUrl(raw: string, source: OfficialSource): string | null {
  try {
    const base = new URL(source.url);
    const url = new URL(raw.trim(), `${base.origin}/`);
    if (url.protocol !== 'https:' || url.origin !== base.origin || !url.pathname.startsWith(source.articlePath)
      || url.username || url.password) return null;
    url.hash = ''; url.search = '';
    return url.href;
  } catch { return null; }
}

export function parseOfficialListing(html: string, source: OfficialSource): {
  items: OfficialSignal[]; cards: number; invalid: number;
} {
  // Ignore scripts/comments before fragment scanning; they can contain HTML-looking strings.
  const clean = html.replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi, '').replace(/<!--[^]*?-->/g, '');
  const cards = elementsByClass(clean, source.cardClass);
  const items: OfficialSignal[] = [];
  const seen = new Set<string>();
  let invalid = 0;
  for (const card of cards) {
    const title = htmlText(elementsByClass(card, source.titleClass)[0] ?? '');
    // Broad layout classes (KOBİA) are only cards when they contain a title.
    if (!title) continue;
    const date = parseOfficialDate(htmlText(elementsByClass(card, source.dateClass)[0] ?? ''));
    const anchors = [...card.matchAll(/<a\b(?:[^>"']|"[^"]*"|'[^']*')*>/gi)];
    const link = anchors.map((m) => officialUrl(attribute(m[0], 'href') ?? '', source)).find(Boolean);
    if (!date || !link) { invalid++; continue; }
    if (seen.has(link)) continue;
    seen.add(link);
    const summaryHtml = source.summaryClass ? elementsByClass(card, source.summaryClass)[0] ?? '' : '';
    const paragraphs = [...summaryHtml.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p\s*>/gi)].map((m) => m[1]).join(' ');
    const summary = htmlText(paragraphs || summaryHtml).slice(0, 2000);
    const image = /<img\b(?:[^>"']|"[^"]*"|'[^']*')*>/i.exec(card);
    let imageUrl: string | null = null;
    if (image) {
      try {
        const url = new URL(attribute(image[0], 'src') ?? '', source.url);
        if (url.protocol === 'https:' && attribute(image[0], 'src')) imageUrl = url.href;
      } catch { /* No image: existing category cover applies. */ }
    }
    items.push({ title, link, summary, publishedAt: date, imageUrl });
  }
  return { items, cards: cards.length, invalid };
}

/** Headline-specific relevance: an agency's boilerplate in a body must never qualify a story. */
export function isOfficialTopic(title: string, source: OfficialSource): boolean {
  const t = title.toLocaleLowerCase('az');
  if (source.topic === 'tourism') return /turizm|tourism|hospitality|hotel|wellness|səyahət|travel|qonaqpərvərlik|mehmanxana|sağlamlıq|qastronom|gastronom|otel/.test(t);
  if (source.topic === 'food-safety') {
    return /iaşə|restoran|kafe|qidalanma|qida sahəsində|gigiyena|zəhərlən|yoxlam|nəzarət.*icmal|ət satışı|çörək|süd məhsul/.test(t);
  }
  return /iaşə|restoran|otel|turizm|kafe|ədv geri|e-kassa|nəzarət.kassa|pos.terminal|minimum əmək|fərdi sahibkar|icarə|vergi güzəşt/.test(t);
}
